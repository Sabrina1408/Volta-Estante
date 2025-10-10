from firebase_admin import firestore
import uuid
from datetime import timezone, datetime

db = firestore.client()

def create_sale(userID, ISBN, copyID): # se for so o user id?
    user_ref = db.collection('Users').document(userID)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise LookupError(f"User with ID {userID} not found")
    
    seboID = user_doc.get('seboID')
    
    book_ref = db.collection('Sebos').document(seboID).collection('Books').document(ISBN)
    book_doc = book_ref.get()
    if not book_doc.exists:
        raise LookupError(f"Book with ISBN {ISBN} not found")
    
    copy_ref = book_ref.collection('Copies').document(copyID)
    copy_doc = copy_ref.get()
    if not copy_doc.exists:
        raise LookupError(f"Copy with ID {copyID} not found for book {ISBN}")
    sale_id = str(uuid.uuid4())
    sale_data = {
        "book_title": book_doc.get('title'),
        "book_category": book_doc.get('categories'),
        "book_rating": book_doc.get('averageRating'),
        "book_price": copy_doc.get('price'),
        "sale_date": datetime.now(timezone.utc).isoformat(),
        "userID": userID,
        "ISBN": ISBN
    }
    sales_ref = db.collection('Vendas').document(sale_id)
    sales_ref.set(sale_data)
    copy_ref.delete()
    return sales_ref.get().to_dict()

    
    
    
    
    
    


