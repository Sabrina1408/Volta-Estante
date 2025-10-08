from firebase_admin import firestore
import uuid
from datetime import datetime, timezone

# TODO fazer pesquisa no db por nome e talvez por outras coisas

db = firestore.client()
def save_book(sebo_id, book_data, inventory_data): 
    sebo_ref = db.collection('Sebos').document(sebo_id)
    book_ref = sebo_ref.collection('Books').document(book_data['isbn'])
    copy_id = str(uuid.uuid4())
    
    inventory_data['registered_at'] = datetime.now(timezone.utc).isoformat()
    inventory_data['copy_id'] = copy_id
    
    if not book_ref.get().exists:
        book_data['total_quantity'] = 1
        book_ref.set(book_data)
    copy_ref = book_ref.collection('Copies').document(copy_id)
    copy_ref.set(inventory_data)
    
    total_quantity = len(list(book_ref.collection('Copies').stream()))
    book_ref.update({"total_quantity": total_quantity})
    return book_data
def fetch_book(sebo_id, isbn): 
    if not isbn:
        raise ValueError("Invalid book data: Missing ISBN")
    
    book_ref = db.collection('Sebos').document(sebo_id).collection('Books').document(isbn)
    book_doc = book_ref.get()
    if not book_doc.exists:
        raise LookupError(f"Book with ISBN {isbn} not found")
    book_data = book_doc.to_dict()
    
    copies_ref = book_ref.collection('Copies')
    copies = [copy.to_dict() for copy in copies_ref.stream()]
    book_data['copies'] = copies 
    return book_data

def delete_book(isbn):
    if not isbn:
        raise ValueError("Invalid book data: Missing ISBN")
    
    book_ref = db.collection('Books').document(isbn)
    if not book_ref.get().exists:
        raise LookupError(f"Book with ISBN {isbn} not found")
    
    book_ref.delete()
    return {"isbn": isbn}
    
def update_book(isbn, copy_id, update_data): 
    if not isbn:
        raise ValueError("Invalid book data: Missing ISBN")
    
    book_ref = db.collection('Books').document(isbn)
    book_doc = book_ref.get()
    if not book_doc.exists:
        raise LookupError(f"Book with ISBN {isbn} not found")
    
    data = book_doc.to_dict()
    copies = data.get('copies', {})
    
    if copy_id not in copies:
        raise LookupError(f"Copy with ID {copy_id} not found")
    
    copy = copies[copy_id]
    for keys in ["price", "conservation_state"]:
        if keys in update_data:
            copy[keys] = update_data[keys]
    copies[copy_id] = copy
    book_ref.update({"copies": copies})
    return book_doc.to_dict()

def delete_copy(isbn, copy_id):
    if not isbn:
        raise ValueError("Invalid book data: Missing ISBN")
    
    book_ref = db.collection('Books').document(isbn)
    book_doc = book_ref.get()
    if not book_doc.exists:
        raise LookupError(f"Book with ISBN {isbn} not found")
    
    data = book_doc.to_dict()
    copies = data.get('copies', {})
    if copy_id not in copies:
        raise LookupError(f"Copy with ID {copy_id} not found")
    del copies[copy_id]
    book_ref.update({
        "copies": copies,
        "total_quantity": len(copies)
    })
    return {"isbn": isbn, "deleted_copy": copy_id}