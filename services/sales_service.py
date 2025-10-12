from firebase_admin import firestore
from models.sales import Sales
from pydantic import ValidationError
from werkzeug.exceptions import NotFound, BadRequest


db = firestore.client()

def create_sale(user_id, ISBN, copy_id): #TODO tirar user_id e sebo_id das requestas -> pegar via auth
    user_ref = db.collection('Users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise NotFound(f"User with ID {user_id} not found")
    
    user_data = user_doc.to_dict()
    sebo_id = user_data.get('seboId')
    if not sebo_id:
        raise BadRequest(f"User with ID {user_id} has no sebo_id")
    
    book_ref = db.collection('Sebos').document(sebo_id).collection('Books').document(ISBN)
    book_doc = book_ref.get()
    if not book_doc.exists:
        raise NotFound(f"Book with ISBN {ISBN} not found")
    
    copy_ref = book_ref.collection('Copies').document(copy_id)
    copy_doc = copy_ref.get()
    if not copy_doc.exists:
        raise NotFound(f"Copy with ID {copy_id} not found for book {ISBN}")
    
    book_data = book_doc.to_dict()
    copy_data = copy_doc.to_dict()
    
    sale_data = {
        "user_id": user_id,
        "ISBN": ISBN,
        "book_title": book_data.get('title', 'Unknown'),
        "book_category": book_data.get('categories', ['Unknown']),
        "book_rating": book_data.get('averageRating', 0.0),
        "book_price": copy_data.get('price', 0.0),
    }
    try:
        sale = Sales.model_validate(sale_data)
    except ValidationError as e:
        raise BadRequest(f"Invalid sale data: {e}")
    
    sale_ref = db.collection('Sales').document(sebo_id).collection('SeboSales').document(sale.sale_id)
    sale_ref.set(sale.model_dump(by_alias=True))
    copy_ref.delete()
    book_ref.update({"totalQuantity": firestore.firestore.Increment(-1)})
    
    return {"saleId": sale.sale_id, "data": sale.model_dump(by_alias=True)}

def fetch_sale(user_id, sale_id):
    return None
