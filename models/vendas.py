from firebase_admin import firestore
import uuid
from datetime import timezone, datetime

db = firestore.client()

def create_sale(sebo_id, sale_data):
    """ 
        sale data json: livro_id
        user_id
        title
        price
        category
        rating
    """
    
    if not sebo_id:
        raise ValueError("Invalid sale data: Missing sebo_id")
    if not sale_data:
        raise ValueError("Invalid sale data: Missing sale_data")
    
    sebo_ref = db.collection('Sebos').document(sebo_id)
    if not sebo_ref.get().exists:
        raise LookupError(f"Sebo with ID {sebo_id} not found")
    
    


