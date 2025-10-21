from firebase_admin import firestore
from models.sales import Sales
from pydantic import ValidationError
from werkzeug.exceptions import NotFound, BadRequest


db = firestore.client()

def create_sale(user_id, sebo_id, ISBN, copy_id): 
    user_ref = db.collection('Users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise NotFound(f"User with ID {user_id} not found")
    user_data = user_doc.to_dict()
    
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
        "user_name": user_data.get('name', 'Unknown User'),
        "ISBN": ISBN,
        "book_title": book_data.get('title', 'Unknown'),
        "authors": book_data.get('authors', ['Unknown']),
        "book_category": book_data.get('categories', ['Unknown']),
        "average_rating": book_data.get('averageRating', 0.0),
        "book_price": copy_data.get('price', 0.0),
        "conservation_state": copy_data.get('conservationState', 'Novo'),
    }
    try:
        sale = Sales.model_validate(sale_data)
    except ValidationError as e:
        raise BadRequest(f"Invalid sale data: {e}")
    transaction = db.transaction()
    @firestore.transactional # transaction faz que essas operacoes sejam como se fosse uma
    # caso uma de erro não tera dado sendo modificado pela metade
    def sale_transaction(transaction, book_ref, copy_ref, sebo_id, sale):
        sale_ref = db.collection('Sales').document(sebo_id).collection('saleId').document(sale.sale_id)
        transaction.set(sale_ref, sale.model_dump(by_alias=True))
        transaction.delete(copy_ref)
        transaction.update(book_ref, {"totalQuantity": firestore.firestore.Increment(-1)})
    try:
        sale_transaction(transaction, book_ref, copy_ref, sebo_id, sale)
        return {"saleId": sale.sale_id, "data": sale.model_dump(by_alias=True)}
    except Exception as e:
        raise BadRequest(f"Data was not modified: failed to create sale: {e}")


def fetch_sale(sale_id, sebo_id):
    sale_ref = db.collection('Sales').document(sebo_id).collection('saleId').document(sale_id)
    sale_doc = sale_ref.get()
    if not sale_doc.exists:
        raise NotFound(f"Sale with ID {sale_id} not found")
    return sale_doc.to_dict()

def delete_sale(sale_id, sebo_id):
    sale_ref = db.collection('Sales').document(sebo_id).collection('saleId').document(sale_id)
    sale_doc = sale_ref.get()
    if not sale_doc.exists:
        raise NotFound(f"Sale with ID {sale_id} not found")
    sale_ref.delete()
    return sale_doc.to_dict()

def update_sale(sebo_id, sale_id, update_data):
    sale_ref = db.collection('Sales').document(sebo_id).collection('saleId').document(sale_id)
    sale_doc = sale_ref.get()
    if not sale_doc.exists:
        raise NotFound(f"Sale with ID {sale_id} not found")
    try:
        sale_data = sale_doc.to_dict()
        validated_sale = Sales.model_validate(sale_data)
        updated_fields = validated_sale.model_copy(update=update_data)
        sale_ref.update(updated_fields.model_dump(by_alias=True))
        return updated_fields.model_dump(by_alias=True)    
    except (ValidationError, Exception) as e:
        raise BadRequest(f"Invalid sale data: {e}")