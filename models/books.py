from firebase_admin import firestore
import uuid
from datetime import datetime, timezone

# TODO fazer pesquisa no db por nome e talvez por outras coisas

db = firestore.client()

def save_book(seboID, book_data, inventory_data): 
    if not seboID: 
        raise ValueError("Invalid book data: Missing seboID")
    sebo_ref = db.collection('Sebos').document(seboID)
    if not sebo_ref.get().exists:
        raise LookupError(f"Sebo with ID {seboID} not found")
    
    book_ref = sebo_ref.collection('Books').document(book_data['ISBN'])
    copyID = str(uuid.uuid4())
    
    inventory_data['registered_at'] = datetime.now(timezone.utc).isoformat()
    inventory_data['copyID'] = copyID
    
    if not book_ref.get().exists:
        book_data['total_quantity'] = 1
        book_ref.set(book_data)
    copy_ref = book_ref.collection('Copies').document(copyID)
    copy_ref.set(inventory_data)
    
    total_quantity = len(list(book_ref.collection('Copies').stream()))
    book_ref.update({"total_quantity": total_quantity})
    return book_data

def fetch_book(seboID, ISBN): 
    if not ISBN:
        raise ValueError("Invalid book data: Missing ISBN")
    if not seboID:
        raise ValueError("Invalid book data: Missing Sebo ID")
    sebo_ref = db.collection('Sebos').document(seboID)
    if not sebo_ref.get().exists:
        raise LookupError(f"Sebo with ID {seboID} not found")
    
    book_ref = sebo_ref.collection('Books').document(ISBN)
    if not book_ref.get().exists:  
        raise LookupError(f"Book with ISBN {ISBN} not found")
    
    book_data = book_ref.get().to_dict()
    copies_ref = book_ref.collection('Copies')
    copies = [copy.to_dict() for copy in copies_ref.stream()]
    book_data['copies'] = copies 
    return book_data

def update_book(seboID, ISBN, copyID, update_data): 
    if not ISBN:
        raise ValueError("Invalid book data: Missing ISBN")
    if not copyID:
        raise ValueError("Invalid book data: Missing copyID")
    if not seboID:
        raise ValueError("Invalid book data: Missing Sebo ID")
    
    sebo_ref = db.collection('Sebos').document(seboID)
    if not sebo_ref.get().exists:
        raise LookupError(f"Sebo with ID {seboID} not found")
    
    book_ref = sebo_ref.collection('Books').document(ISBN)
    if not book_ref.get().exists:
        raise LookupError(f"Book with ISBN {ISBN} not found")
    
    copy_ref = book_ref.collection('Copies').document(copyID)
    if not copy_ref.get().exists:
        raise LookupError(f"Copy with ID {copyID} not found")
    
    allowed_updates = {
        key: value for key, value in update_data.items() if key in {"price", "conservation_state"}
    }
    if not allowed_updates:
        raise ValueError(f"No valid fields to update provided. Only 'price', 'conservation_state' can be updated.")

    copy_ref.update(allowed_updates)
    return fetch_book(seboID, ISBN)

def delete_book(seboID, ISBN):
    if not ISBN:
        raise ValueError("Invalid book data: Missing ISBN")
    if not seboID:
        raise ValueError("Invalid book data: Missing Sebo ID")
    
    sebo_ref = db.collection('Sebos').document(seboID)
    if not sebo_ref.get().exists:
        raise LookupError(f"Sebo with ID {seboID} not found")
    book_ref = sebo_ref.collection('Books').document(ISBN)
    if not book_ref.get().exists:  
        raise LookupError(f"Book with ISBN {ISBN} not found")
    
    copies_ref = book_ref.collection('Copies')
    copies = list(copies_ref.stream()) # deletando as copias pra limpar a entidade o livro inteiro
    for copy in copies:
        copies_ref.document(copy.id).delete()
    
    book_ref.delete()
    return {"ISBN": ISBN}

def delete_copy(seboID, ISBN, copyID):
    if not ISBN:
        raise ValueError("Invalid book data: Missing ISBN")
    if not seboID:
        raise ValueError("Invalid book data: Missing Sebo ID")
    
    sebo_ref = db.collection('Sebos').document(seboID)
    if not sebo_ref.get().exists:
        raise LookupError(f"Sebo with ID {seboID} not found")
    book_ref = sebo_ref.collection('Books').document(ISBN)
    if not book_ref.get().exists:
        raise LookupError(f"Book with ISBN {ISBN} not found")
    
    copies_ref = book_ref.collection('Copies')
    copies = {copy.id: copy.to_dict() for copy in copies_ref.stream()}
    if copyID not in copies:
        raise LookupError(f"Copy with ID {copyID} not found")
    copies_ref.document(copyID).delete()
    total_quantity = len(list(copies_ref.stream()))
    book_ref.update({"total_quantity": total_quantity})
    return {"ISBN": ISBN, "deleted_copy": copyID}