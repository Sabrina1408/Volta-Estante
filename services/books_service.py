from firebase_admin import firestore
from werkzeug.exceptions import NotFound, BadRequest
from models.books import Book
from models.copy import Copy
from pydantic import ValidationError
from services.isbn_utils import sanitize_isbn


db = firestore.client() 





def save_book(sebo_id, book_data, inventory_data):
    try:
        copy = Copy.model_validate(inventory_data)
    except ValidationError as e:
        raise BadRequest(f"Invalid inventory data: {e}")
    
    sebo_ref = db.collection('Sebos').document(sebo_id)
    ISBN = sanitize_isbn(book_data['ISBN'])
    if not ISBN or len(ISBN) != 13:
        raise BadRequest("Invalid book data: Missing or invalid ISBN-13")
    book_ref = sebo_ref.collection('Books').document(ISBN)
    
    book_doc = book_ref.get()
    book_exists = book_doc.exists
    
    transaction = db.transaction()
    @firestore.transactional
    def save_book_transaction(transaction, book_ref, copy, book_exists):
        if not book_exists:
            book_data['totalQuantity'] = 1
            book_data['ISBN'] = book_ref.id
            book = Book.model_validate(book_data)
            transaction.set(book_ref, book.model_dump(by_alias=True, exclude={'copies'}))
        else:
            transaction.update(book_ref, {"totalQuantity": firestore.firestore.Increment(1)})
        
        copy_ref = book_ref.collection('Copies').document()
        copy_data = copy.model_dump(by_alias=True, exclude={'copyId'})
        copy_data['copyId'] = copy_ref.id  
        transaction.set(copy_ref, copy_data)
    try:
        save_book_transaction(transaction, book_ref, copy, book_exists)
        return {
            "ISBN": ISBN,
            "title": book_data.get('title'),
            "message": "Book saved successfully"
        }
    except Exception as e:
        raise BadRequest(f"Data was not modified: failed to save book: {e}")
                            

def fetch_book(sebo_id, ISBN):
    if not ISBN:
        raise BadRequest("Invalid book data: Missing ISBN")
    if not sebo_id:
        raise BadRequest("Invalid book data: Missing Sebo ID")

    sebo_ref = db.collection('Sebos').document(sebo_id)
    if not sebo_ref.get().exists:
        raise NotFound(f"Sebo with ID {sebo_id} not found")
    
    ISBN = sanitize_isbn(ISBN)
    if not ISBN or len(ISBN) != 13:
        raise BadRequest("Invalid book data: Missing or invalid ISBN-13")
    books_coll = sebo_ref.collection('Books')
    book_ref = books_coll.document(ISBN)
    book_doc = book_ref.get()
    if not book_doc.exists:
        raise NotFound(f"Book with ISBN {ISBN} not found")
    book_data = book_doc.to_dict()
    copies_ref = book_ref.collection('Copies')
    copies = [copy.to_dict() for copy in copies_ref.stream()]
    book_data['copies'] = copies
    return book_data
    
def update_book(sebo_id, ISBN, copy_id, update_data):
    if not ISBN:
        raise BadRequest("Invalid book data: Missing ISBN")
    if not copy_id:
        raise BadRequest("Invalid book data: Missing copyID")
    if not sebo_id:
        raise BadRequest("Invalid book data: Missing Sebo ID")
    
    sebo_ref = db.collection('Sebos').document(sebo_id)
    if not sebo_ref.get().exists:
        raise NotFound(f"Sebo with ID {sebo_id} not found")

    ISBN = sanitize_isbn(ISBN)
    if not ISBN or len(ISBN) != 13:
        raise BadRequest("Invalid book data: Missing or invalid ISBN-13")
    books_coll = sebo_ref.collection('Books')
    book_ref = books_coll.document(ISBN)
    book_doc = book_ref.get()
    if not book_doc.exists:
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
    if not sebo_ref.get().exists:
        raise NotFound(f"Sebo with ID {sebo_id} not found")
    ISBN = sanitize_isbn(ISBN)
    if not ISBN or len(ISBN) != 13:
        raise BadRequest("Invalid book data: Missing or invalid ISBN-13")
    book_ref = sebo_ref.collection('Books').document(ISBN)
    book_doc = book_ref.get()
    if not book_doc.exists:
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
    if not sebo_ref.get().exists:
        raise NotFound(f"Sebo with ID {sebo_id} not found")
    ISBN = sanitize_isbn(ISBN)
    if not ISBN or len(ISBN) != 13:
        raise BadRequest("Invalid book data: Missing or invalid ISBN-13")
    book_ref = sebo_ref.collection('Books').document(ISBN)
    book_doc = book_ref.get()
    if not book_doc.exists:
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

def fetch_all_books(sebo_id):
    books_ref = db.collection('Sebos').document(sebo_id).collection('Books').select(
        ['title', 'authors', 'categories', 'totalQuantity', 'isbn']
    )
    books_docs = books_ref.stream()
    books = []
    for book_doc in books_docs:
        data = book_doc.to_dict()
        books.append(data)
    return books

       