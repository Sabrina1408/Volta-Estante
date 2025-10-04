from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()
path = os.getenv("GOOGLE_APLICATION_CREDENTIALS")
cred = credentials.Certificate(path)
firebase_admin.initialize_app(cred)
db = firestore.client()

from models.books import save_book, fetch_book, delete_book
from services.google_books import fetch_book_by_isbn

app = Flask(__name__) # TODO? Implementar fetch via nome, autor etc
CORS(app)

# Erros
@app.errorhandler(ValueError)
def handle_value_error(e):
    return jsonify({"error": str(e)}), 400

@app.errorhandler(LookupError)
def handle_lookup_error(e):
    return jsonify({"error": str(e)}), 404

@app.errorhandler(Exception)
def handle_general_error(e):
    return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@app.route("/books", methods=["POST"])
def add_book_route():
    data = request.get_json()
    print("📦 Raw request data:", request.data)
    print("📦 Parsed JSON:", data)
    if not data or "isbn" not in data:
        return jsonify({"error": "ISBN is required"}), 400
    isbn = data.get("isbn")
    try:    
        existing_book = fetch_book(isbn)
        if existing_book:
            return jsonify(existing_book), 200 # Retorna o livro se já tem no Db
    except LookupError:
        pass  # Livro n tem no DB, dar fetch no google pra adicionar
        
    book_data = fetch_book_by_isbn(isbn) 
    print("📦 Fetched book data:", book_data)
    if not book_data:
        return jsonify({"error": "Book not found"}), 404
    save_book(book_data)
    return jsonify(book_data), 201

@app.route("/books", methods=["GET"])
def get_book_route(): 
    isbn = request.args.get("isbn")
    book = fetch_book(isbn)
    return jsonify(book), 200
    
@app.route("/books", methods=["DELETE"])
def delete_book_route():
    isbn = request.args.get("isbn")
    deleted = delete_book(isbn)
    return jsonify({
        "message": "Book deleted successfully",
        "isbn": deleted
        }), 200

# @app.route("/books", methods=["PUT"])


        
if __name__ == '__main__':
    app.run(debug=True)



