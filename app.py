from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()
path = os.getenv("GOOGLE_APLICATION_CREDENTIALS")
cred = credentials.Certificate(path)
firebase_admin.initialize_app(cred)
db = firestore.client()

from models.books import save_book, fetch_book, delete_book, update_book, delete_copy
from models.users import save_user, delete_user, fetch_user, update_user
from models.vendas import create_sale

from services.google_books import fetch_book_by_ISBN

app = Flask(__name__) # TODO? Implementar fetch via nome, autor etc
CORS(app)

# erros
@app.errorhandler(ValueError)
def handle_value_error(e):
    return jsonify({"error": str(e)}), 400

@app.errorhandler(LookupError)
def handle_lookup_error(e):
    return jsonify({"error": str(e)}), 404

@app.errorhandler(Exception)
def handle_general_error(e):
    return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

""" como estruturar as requests 
    GET: /book/<seboID>/<ISBN>
    POST: /book/<seboID> + json {ISBN, price, conservation_state}
    DELETE: /book/<seboID>/<ISBN> - deleta TUDO, até as copias se tiver
    DELETE COPY: /book/<seboID>/<ISBN>/copies/<copyID> - deleta apenas a copia do id dado
    PUT : /book/<seboID>/<ISBN>/copies/<copyID> + json {price, conservation_state} - atualiza apenas a copia do id dado

"""

# Livros
@app.route("/books/<seboID>", methods=["POST"]) 
def add_book_route(seboID):
    data = request.get_json()
    if not data or "ISBN" not in data:
        raise ValueError("ISBN is required")
    ISBN = data.get("ISBN")
    inventory_data = {
        "price": data.get("price", 0.0),
        "conservation_state": data.get("conservation_state", "unknown"),
        "registered_at": None,
        "copyID": None,
    }
    
    book_data = fetch_book_by_ISBN(ISBN) 
    if not book_data:
        raise ValueError(f"Book with ISBN {ISBN} not found")
    save_book(seboID, book_data, inventory_data)
    return jsonify(book_data), 201

@app.route("/books/<seboID>/<ISBN>", methods=["GET"]) 
def get_book_route(seboID, ISBN):
    book = fetch_book(seboID, ISBN)
    return jsonify(book), 200
    
@app.route("/books/<seboID>/<ISBN>", methods=["DELETE"]) # deleta toda instancia de livro e suas copias, se existirem
def delete_book_route(seboID, ISBN):
    deleted = delete_book(seboID, ISBN)
    return jsonify({
        "message": "Book deleted successfully",
        "ISBN": deleted,
        "seboID": seboID
        }), 200

@app.route("/books/<seboID>/<ISBN>/copies/<copyID>", methods=["PUT"]) # apenas alguns cmapos serao editaveis como preço, estado de conservação
def update_book_route(seboID, ISBN, copyID):
    data = request.get_json()
    if not data: 
        raise ValueError("Invalid JSON data")
    
    updated_book = update_book(seboID, ISBN, copyID, data)
    return jsonify({
        "message": "Book updated successfully",
        "book": updated_book
        }), 200
    

@app.route("/books/<seboID>/<ISBN>/copies/<copyID>", methods=["DELETE"])
def delete_copy_route(seboID, ISBN, copyID):
    deleted = delete_copy(seboID, ISBN, copyID)
    return jsonify({
        "message": "Book copy deleted successfully",
        "data": deleted,
        "seboID": seboID,
        }), 200
    
# User

@app.route("/users", methods=["POST"])
def add_user_route():
    data = request.get_json()
    if not data or "userID" not in data:
        raise ValueError("User ID is required")
    save_user(data)
    return jsonify(data), 201

@app.route("/users/<userID>", methods=["DELETE"])
def delete_user_route(userID):
    if not userID:
        raise ValueError("User ID is required")
    deleted = delete_user({"userID": userID})
    
    return jsonify({
        "message": "User deleted successfully",
        "data": deleted
        }), 200

@app.route("/users/<userID>", methods=["GET"])
def get_user_route(userID):
    if not userID:
        raise ValueError("User ID is required")
    
    user = fetch_user(userID)
    return jsonify(user), 200

# Vendas Log

@app.route("/sales/<userID>/<ISBN>/<copyID>", methods=["POST"])
def create_sale_route(userID, ISBN, copyID): 
    if not userID:
        raise ValueError("User ID is required")
    if not ISBN:
        raise ValueError("ISBN is required")
    if not copyID:
        raise ValueError("Copy ID is required")
    
    sale_data = create_sale(userID, ISBN, copyID)
    return jsonify(sale_data.get('sale_id')), 201

if __name__ == '__main__':
    app.run(debug=True)



