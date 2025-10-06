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
from services.google_books import fetch_book_by_isbn

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
    GET: /book/<isbn>
    POST: /book + json {isbn, price, conservation_state}
    DELETE: /book/<isbn> - deleta TUDO, até as copias se tiver
    DELETE COPY: /book/<isbn>/copies/<copy_id> - deleta apenas a copia do id dado
    PUT : /book/<isbn>/copies/<copy_id> + json {price, conservation_state} - atualiza apenas a copia do id dado

"""


@app.route("/books/", methods=["POST"])
def add_book_route():
    data = request.get_json()
    if not data or "isbn" not in data:
        return jsonify({"error": "ISBN is required"}), 400
    isbn = data.get("isbn")
    inventory_data = {
        "price": data.get("price", 0.0),
        "conservation_state": data.get("conservation_state", "unknown"),
        "registered_at": None,
        "copy_id": None,
    }
    
    book_data = fetch_book_by_isbn(isbn) 
    if not book_data:
        return jsonify({"error": "Book not found"}), 404

    save_book(book_data, inventory_data)
    return jsonify(book_data), 201

@app.route("/books/<isbn>", methods=["GET"])
def get_book_route(isbn): 
    book = fetch_book(isbn)
    return jsonify(book), 200
    
@app.route("/books/<isbn>", methods=["DELETE"])
def delete_book_route(isbn):
    deleted = delete_book(isbn)
    return jsonify({
        "message": "Book deleted successfully",
        "isbn": deleted
        }), 200

@app.route("/books/<isbn>/copies/<copy_id>", methods=["PUT"]) # apenas alguns cmapos serao editaveis como preço, estado de conservação
def update_book_route(isbn, copy_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided, Copy_id or ISBN missing"}), 400
    
    
    updated_book = update_book(isbn, copy_id, data)
    return jsonify({
        "message": "Book updated successfully",
        "book": updated_book
        }), 200
    

@app.route("/books/<isbn>/copy/<copy_id>", methods=["DELETE"])
def delete_copy_route(isbn, copy_id):
    deleted = delete_copy(isbn, copy_id)
    return jsonify({
        "message": "Book copy deleted successfully",
        "data": deleted
        }), 200
    
if __name__ == '__main__':
    app.run(debug=True)



