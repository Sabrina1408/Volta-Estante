from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from firebase_admin import credentials, firestore
import firebase_admin
from werkzeug.exceptions import HTTPException, BadRequest
from pydantic import ValidationError

load_dotenv()
path = os.getenv("GOOGLE_APLICATION_CREDENTIALS")
cred = credentials.Certificate(path)
firebase_admin.initialize_app(cred)
db = firestore.client()



from services.users_service import save_user, delete_user, fetch_user, update_user
from services.books_service import save_book, fetch_book, update_book, delete_book, delete_copy
from services.sales_service import create_sale, fetch_sale
from services.google_books_service import fetch_book_by_isbn

# Via auth vou ter o user_id, sebo_id e user_role

app = Flask(__name__) # TODO? Implementar fetch via nome, autor etc
CORS(app)

@app.errorhandler(ValidationError)
def handle_validation_error(e: ValidationError):
    app.logger.warning(f"Validation Error: {e.errors()}")
    return jsonify({
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Invalid data provided.",
            "details": e.errors()
        }
    }), 422 

@app.errorhandler(HTTPException)
def handle_http_exception(e: HTTPException):
    app.logger.warning(f"HTTP Exception: {e.code} {e.name} - {e.description}")
    return jsonify({"error": {"code": e.name.upper().replace(" ", "_"), "message": e.description}}), e.code

@app.errorhandler(Exception)
def handle_general_error(e):
    app.logger.exception("An unhandled exception occurred") 
    return jsonify({"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred on the server."}}), 500

""" como estruturar as requests 
    GET: /book/<seboID>/<ISBN>
    POST: /book/<seboID> + json {ISBN, price, conservation_state}
    DELETE: /book/<seboID>/<ISBN> - deleta TUDO, até as copias se tiver
    DELETE COPY: /book/<seboID>/<ISBN>/copies/<copyID> - deleta apenas a copia do id dado
    PUT : /book/<seboID>/<ISBN>/copies/<copyID> + json {price, conservation_state} - atualiza apenas a copia do id dado

"""
#TODO atualizar os endpoints e protege-los com o @permission_required(ROLE) 
# ============================================
#                   Livros  
# ============================================
@app.route("/books/<sebo_id>", methods=["POST"])
def add_book_route(sebo_id):
    data = request.get_json()
    if not data or "ISBN" not in data:
        raise BadRequest("ISBN is required")
    ISBN = data.get("ISBN")
    inventory_data = {
        "price": data.get("price", 0.0),
        "conservation_state": data.get("conservationState", "unknown"),
    }
    
    book_data = fetch_book_by_isbn(ISBN)
    if not book_data:
        raise BadRequest(f"Book with ISBN {ISBN} not found via Google Books API")
    save_book(sebo_id, book_data, inventory_data)
    return jsonify(book_data), 201

@app.route("/books/<sebo_id>/<ISBN>", methods=["GET"])
def get_book_route(sebo_id, ISBN):
    book = fetch_book(sebo_id, ISBN)
    return jsonify(book), 200
    
@app.route("/books/<sebo_id>/<ISBN>", methods=["DELETE"]) # deleta toda instancia de livro e suas copias, se existirem
def delete_book_route(sebo_id, ISBN):
    deleted = delete_book(sebo_id, ISBN)
    return jsonify({
        "message": "Book deleted successfully",
        "ISBN": deleted,
        "seboID": sebo_id
        }), 200

@app.route("/books/<sebo_id>/<ISBN>/copies/<copy_id>", methods=["PUT"]) # apenas alguns cmapos serao editaveis como preço, estado de conservação
def update_book_route(sebo_id, ISBN, copy_id):
    data = request.get_json()
    if not data: 
        raise BadRequest("Invalid JSON data")
    
    updated_book = update_book(sebo_id, ISBN, copy_id, data)
    return jsonify({
        "message": "Book updated successfully",
        "book": updated_book
        }), 200
    

@app.route("/books/<sebo_id>/<ISBN>/copies/<copy_id>", methods=["DELETE"])
def delete_copy_route(sebo_id, ISBN, copy_id):
    deleted = delete_copy(sebo_id, ISBN, copy_id)
    return jsonify({
        "message": "Book copy deleted successfully",
        "data": deleted,
        "seboID": sebo_id,
        }), 200
# ============================================   
#                   User
# ============================================
@app.route("/users", methods=["POST"])

def add_user_route():
    data = request.get_json()
    if not data or "userId" not in data:
        raise BadRequest("User ID is required")
    created_user = save_user(data)
    return jsonify(created_user), 201

@app.route("/users/<user_id>", methods=["DELETE"])
def delete_user_route(user_id):
    if not user_id:
        raise BadRequest("User ID is required")
    deleted_info = delete_user(user_id)
    
    return jsonify({
        "message": "User deleted successfully",
        "data": deleted_info
        }), 200

@app.route("/users/<user_id>", methods=["GET"])
def get_user_route(user_id):
    if not user_id:
        raise BadRequest("User ID is required")
    user = fetch_user(user_id)
    return jsonify(user), 200

# ============================================
#                   Vendas
# ============================================
@app.route("/sales/<user_id>/<ISBN>/<copy_id>", methods=["POST"])
def create_sale_route(user_id, ISBN, copy_id):
    if not user_id:
        raise BadRequest("User ID is required")
    if not ISBN:
        raise BadRequest("ISBN is required")
    if not copy_id:
        raise BadRequest("Copy ID is required")
    
    sale_data = create_sale(user_id, ISBN, copy_id)
    return jsonify(sale_data), 201

if __name__ == '__main__':
    app.run(debug=True)
