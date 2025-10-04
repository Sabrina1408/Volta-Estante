from firebase_admin import firestore


db = firestore.client()
def save_book(book_data): # essa collection seria o nome do sebo ou biblioteca
    if not book_data or 'isbn' not in book_data:
        raise ValueError("Invalid book data: Missing ISBN")
        
    book_ref = db.collection('Books').document(book_data['isbn'])
    book_ref.set(book_data)
    return book_data
    
def fetch_book(isbn): # TODO fetch por nome
    if not isbn:
        raise ValueError("Invalid book data: Missing ISBN")
    
    book_ref = db.collection('Books').document(isbn).get()
    if not book_ref.exists:
        raise LookupError(f"Book with ISBN {isbn} not found")
    
    return book_ref.to_dict()

def delete_book(isbn):
    if not isbn:
        raise ValueError("Invalid book data: Missing ISBN")
    
    book_ref = db.collection('Books').document(isbn)
    if not book_ref.get().exists:
        raise LookupError(f"Book with ISBN {isbn} not found")
    
    book_ref.delete()
    return {"isbn": isbn}
    
# def update_book(isbn, update_data): # TODO Fazer quando os dados do livros serem implementados
