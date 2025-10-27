from firebase_admin import firestore
from werkzeug.exceptions import NotFound, BadRequest
from models.books import Book
from models.copy import Copy
from pydantic import ValidationError
from services.isbn_utils import to_isbn13, to_isbn10, sanitize_isbn


db = firestore.client() 



def _resolve_book_ref(sebo_ref, isbn: str):
    """Resolve book reference. Returns (ref, exists, doc_snapshot)."""
    original = sanitize_isbn(isbn)
    doc_id_13 = to_isbn13(original)
    books_coll = sebo_ref.collection('Books')

    # Batch read both possible docs in parallel
    ref13 = books_coll.document(doc_id_13)
    alt10 = to_isbn10(original) if len(original) == 13 else original if len(original) == 10 else None
    
    if alt10:
        ref10 = books_coll.document(alt10)
        # Parallel batch read - 1 network round trip instead of 2!
        docs = list(db.get_all([ref13, ref10]))
        doc13, doc10 = docs
        
        if doc13.exists:
            return ref13, True, doc13
        if doc10.exists:
            return ref10, True, doc10
    else:
        doc13 = ref13.get()
        if doc13.exists:
            return ref13, True, doc13
    
    return ref13, False, None


def save_book(sebo_id, book_data, inventory_data):
    try:
        copy = Copy.model_validate(inventory_data)
    except ValidationError as e:
        raise BadRequest(f"Invalid inventory data: {e}")
    
    ISBN = book_data['ISBN']
    if not ISBN:
        raise BadRequest("Invalid book data: Missing ISBN")
    
    # Batch read sebo + book resolution in parallel - saves ~200-400ms
    sebo_ref = db.collection('Sebos').document(sebo_id)
    clean_isbn = sanitize_isbn(ISBN)
    book_ref_13 = sebo_ref.collection('Books').document(to_isbn13(clean_isbn))
    
    # Try to batch read sebo + potential book docs
    alt10 = to_isbn10(clean_isbn) if len(clean_isbn) == 13 else None
    refs_to_check = [sebo_ref, book_ref_13]
    if alt10:
        book_ref_10 = sebo_ref.collection('Books').document(alt10)
        refs_to_check.append(book_ref_10)
    
    # Firestore get_all returns a generator; convert to list to preserve order and allow indexing
    docs = list(db.get_all(refs_to_check))
    sebo_doc = docs[0]
    
    if not sebo_doc.exists:
        raise NotFound(f"Sebo with ID {sebo_id} not found")
    
    # Determine which book ref to use
    if len(docs) > 2 and docs[2].exists:  # ISBN-10 exists
        book_ref = book_ref_10
        existing_book_doc = docs[2]
    elif docs[1].exists:  # ISBN-13 exists
        book_ref = book_ref_13
        existing_book_doc = docs[1]
    else:
        book_ref = book_ref_13  # default to ISBN-13 for new books
        existing_book_doc = None
    
    transaction = db.transaction()
    @firestore.transactional
    def save_book_transaction(transaction, book_ref, copy):
        # Transaction must read within transaction context
        book_doc = book_ref.get(transaction=transaction)
            
        if not book_doc.exists:
            book_data['totalQuantity'] = 1
            book_data['ISBN'] = book_ref.id
            book = Book.model_validate(book_data)
            transaction.set(book_ref, book.model_dump(by_alias=True, exclude={'copies'}))
            new_quantity = 1
        else:
            transaction.update(book_ref, {"totalQuantity": firestore.firestore.Increment(1)})
            new_quantity = book_doc.get('totalQuantity') + 1
        
        copy_ref = book_ref.collection('Copies').document()
        copy_data = copy.model_dump(by_alias=True, exclude={'copyId'})
        copy_data['copyId'] = copy_ref.id  
        transaction.set(copy_ref, copy_data)
        
        # Return copy_id and quantity for response
        return copy_ref.id, new_quantity
        
    try:
        new_copy_id, total_quantity = save_book_transaction(transaction, book_ref, copy)
        
        # Build full book response with all fields and copies
        if existing_book_doc:
            full_book = existing_book_doc.to_dict()
            # ensure updated fields
            full_book['ISBN'] = book_ref.id
            full_book['totalQuantity'] = total_quantity
        else:
            # New book just created: use validated/normalized payload
            full_book = Book.model_validate(book_data).model_dump(by_alias=True, exclude={'copies'})
            full_book['ISBN'] = book_ref.id
            full_book['totalQuantity'] = total_quantity

        # Include all copies
        copies_ref = book_ref.collection('Copies')
        copies_docs = list(copies_ref.stream())
        copies_list = []
        for cdoc in copies_docs:
            cdata = cdoc.to_dict()
            if 'copyId' not in cdata:
                cdata['copyId'] = cdoc.id
            copies_list.append(cdata)
        full_book['copies'] = copies_list

        return full_book
    except Exception as e:
        raise BadRequest(f"Data was not modified: failed to save book: {e}")
                            



def fetch_book(sebo_id, ISBN):
    if not ISBN:
        raise BadRequest("Invalid book data: Missing ISBN")
    if not sebo_id:
        raise BadRequest("Invalid book data: Missing Sebo ID")

    sebo_ref = db.collection('Sebos').document(sebo_id)
    book_ref, exists, doc_snapshot = _resolve_book_ref(sebo_ref, ISBN)
    
    if not exists:
        # Check sebo only if book wasn't found
        if not sebo_ref.get().exists:
            raise NotFound(f"Sebo with ID {sebo_id} not found")
        raise NotFound(f"Book with ISBN {ISBN} not found")
    
    # Reuse the doc snapshot we already fetched
    book_data = doc_snapshot.to_dict()
    copies_ref = book_ref.collection('Copies')
    copies = [copy.to_dict() for copy in copies_ref.stream()]
    book_data['copies'] = copies
    return book_data

def fetch_all_books(sebo_id):
    if not sebo_id:
        raise BadRequest("Invalid data: Missing Sebo ID")

    sebo_ref = db.collection('Sebos').document(sebo_id)
    if not sebo_ref.get().exists:
        raise NotFound(f"Sebo with ID {sebo_id} not found")

    books_ref = sebo_ref.collection('Books')
    all_books_docs = books_ref.stream()
    
    books_list = []
    for doc in all_books_docs:
        book_data = doc.to_dict()
        book_data['ISBN'] = doc.id 
        books_list.append(book_data)
    return books_list

def update_book(sebo_id, ISBN, copy_id, update_data):
    if not ISBN:
        raise BadRequest("Invalid book data: Missing ISBN")
    if not copy_id:
        raise BadRequest("Invalid book data: Missing copyID")
    if not sebo_id:
        raise BadRequest("Invalid book data: Missing Sebo ID")
    
    sebo_ref = db.collection('Sebos').document(sebo_id)
    book_ref, exists, _ = _resolve_book_ref(sebo_ref, ISBN)
    
    if not exists:
        if not sebo_ref.get().exists:
            raise NotFound(f"Sebo with ID {sebo_id} not found")
        raise NotFound(f"Book with ISBN {ISBN} not found")
    
    copy_ref = book_ref.collection('Copies').document(copy_id)
    if not copy_ref.get().exists:
        raise NotFound(f"Copy with ID {copy_id} not found")
    
    copy_data = copy_ref.get().to_dict()
    if not copy_data:
        raise NotFound(f"Could not retrieve data from this {copy_id}")

    copy_data.update(update_data)
    try:
        updated_copy = Copy.model_validate(copy_data)
        update_payload = updated_copy.model_dump(by_alias=True)
        copy_ref.update(update_payload)
    except ValidationError as e:
        raise BadRequest(f"Invalid update data: {e}")

    return fetch_book(sebo_id, ISBN)

def delete_book(sebo_id, ISBN): 
    if not ISBN:
        raise BadRequest("Invalid book data: Missing ISBN")
    if not sebo_id:
        raise BadRequest("Invalid book data: Missing Sebo ID")
    
    sebo_ref = db.collection('Sebos').document(sebo_id)
    book_ref, exists, _ = _resolve_book_ref(sebo_ref, ISBN)
    
    if not exists:
        if not sebo_ref.get().exists:
            raise NotFound(f"Sebo with ID {sebo_id} not found")
        raise NotFound(f"Book with ISBN {ISBN} not found")
    
    batch = db.batch()
    copies_ref = book_ref.collection('Copies')
    copies = list(copies_ref.stream()) # deletando as copias pra limpar a entidade o livro inteiro
    for copy in copies:
        batch.delete(copies_ref.document(copy.id))
    
    batch.delete(book_ref)
    batch.commit()
    return {"ISBN": ISBN}

def delete_copy(sebo_id, ISBN, copy_id):
    if not ISBN:
        raise BadRequest("Invalid book data: Missing ISBN")
    if not sebo_id:
        raise BadRequest("Invalid book data: Missing Sebo ID")
    
    sebo_ref = db.collection('Sebos').document(sebo_id)
    book_ref, exists, _ = _resolve_book_ref(sebo_ref, ISBN)
    
    if not exists:
        if not sebo_ref.get().exists:
            raise NotFound(f"Sebo with ID {sebo_id} not found")
        raise NotFound(f"Book with ISBN {ISBN} not found")
    
    copy_ref = book_ref.collection('Copies').document(copy_id)
    if not copy_ref.get().exists:
        raise NotFound(f"Copy with ID {copy_id} not found")
    
    transaction = db.transaction() 
    @firestore.transactional
    def delete_copy_transaction(transaction, book_ref, copy_ref):
        transaction.delete(copy_ref)
        transaction.update(book_ref, {"totalQuantity": firestore.firestore.Increment(-1)})
    try:
        delete_copy_transaction(transaction, book_ref, copy_ref)
        return {"ISBN": ISBN, "copyID": copy_id}
    except Exception as e:
        raise BadRequest(f"Data was not modified: failed to delete copy: {e}")
       