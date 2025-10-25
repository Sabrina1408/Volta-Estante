from flask import Flask, jsonify, request, g
from flask_cors import CORS
import os
from dotenv import load_dotenv
from firebase_admin import credentials, firestore
import firebase_admin
from werkzeug.exceptions import HTTPException, BadRequest, Forbidden
from pydantic import ValidationError

load_dotenv()
path = os.getenv("GOOGLE_APLICATION_CREDENTIALS")
cred = credentials.Certificate(path)
firebase_admin.initialize_app(cred)
db = firestore.client()

from models.users import UserRole

# == SERVICES == 
from services.alteration_log_service import *
from services.auth_service import permission_required
from services.users_service import *
from services.books_service import *
from services.sales_service import * 
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


# ============================================
#                   Livros  
# ============================================

@app.route("/books", methods=["POST"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR)
@log_action("add_book")
def add_book_route():
    data = request.get_json()
    if not data: 
        raise BadRequest("Invalid JSON data")
    if "ISBN" not in data:
        raise BadRequest("ISBN is required")
    ISBN = data.get("ISBN")
    inventory_data = {
        "price": data.get("price", 0.0),
    }
    if "conservationState" in data:
        inventory_data["conservation_state"] = data.get("conservationState")
    
    book_data = fetch_book_by_isbn(ISBN)
    if not book_data:
        raise BadRequest(f"Book with ISBN {ISBN} not found via Google Books API")
    created = save_book(g.sebo_id, book_data, inventory_data)
    return jsonify(created), 201

@app.route("/books", methods=["GET"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR, UserRole.READER)
@log_action("list_books")
def list_books_route():
    all_books = fetch_all_books(g.sebo_id)
    return jsonify(all_books), 200

@app.route("/books/<ISBN>", methods=["GET"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR, UserRole.READER)
@log_action("get_book")
def get_book_route(ISBN):
    book = fetch_book(g.sebo_id, ISBN)
    return jsonify(book), 200
    
@app.route("/books/<ISBN>", methods=["DELETE"]) # deleta toda instancia de livro e suas copias, se existirem
@permission_required(UserRole.ADMIN)
@log_action("delete_book")
def delete_book_route(ISBN):
    deleted = delete_book(g.sebo_id, ISBN)
    return jsonify({
        "message": "Book deleted successfully",
        "ISBN": deleted,
        }), 200

@app.route("/books/<ISBN>/copies/<copy_id>", methods=["PUT"]) # apenas alguns cmapos serao editaveis como preço, estado de conservação
@permission_required(UserRole.ADMIN, UserRole.EDITOR)
@log_action("update_book")
def update_book_route(ISBN, copy_id):
    data = request.get_json()
    if not data: 
        raise BadRequest("Invalid JSON data")
    
    updated_book = update_book(g.sebo_id, ISBN, copy_id, data)
    return jsonify({
        "message": "Book updated successfully",
        "book": updated_book
        }), 200
    

@app.route("/books/<ISBN>/copies/<copy_id>", methods=["DELETE"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR)
@log_action("delete_book_copy")
def delete_copy_route(ISBN, copy_id):
    deleted = delete_copy(g.sebo_id, ISBN, copy_id)
    return jsonify({
        "message": "Book copy deleted successfully",
        "book": deleted,
        }), 200


# ============================================   
#                   User
# ============================================

@app.route("/users", methods=["POST"])
@permission_required(claims_required=False) # user novo n tem os required claims: seboId e userRole setados
def add_user_route():
    data = request.get_json()
    if not data:
        raise BadRequest("User data is required")
    name = data.get("name") or g.name
    created_user = save_user(g.user_id, g.email, name, data)
    return jsonify(created_user), 201

@app.route("/users/<user_id>", methods=["GET"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR, UserRole.READER)
def get_user_route(user_id):
    if user_id == g.user_id:
        user = fetch_user(user_id)
    elif g.user_role == UserRole.ADMIN.value:
        user = fetch_user(user_id)
        if user.get('seboId') != g.sebo_id:
            raise Forbidden("You can only get users from your own sebo")
    else:
        raise Forbidden("You can only view your own profile.")
    return jsonify(user), 200

@app.route("/users/<user_id>", methods=["DELETE"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR, UserRole.READER)
def delete_user_route(user_id):
    target = fetch_user(user_id)
    if target.get('seboId') != g.sebo_id:
        raise Forbidden("You can only delete users from your own sebo")

    is_self = (user_id == g.user_id)
    is_admin = (g.user_role == UserRole.ADMIN.value)

    if not is_admin: # editor e reader so podem se deletar
        
        if not is_self:
            raise Forbidden("You can only delete your own account")
        deleted_info = delete_user(user_id, g.sebo_id)
        return jsonify({
            "message": "User deleted successfully",
            "data": deleted_info
        }), 200

    
    if is_self: # admin se deletando e tendo que promover um editor (via json)
        body = request.get_json()
        if not body:
            raise BadRequest("Invalid JSON data")
        promote_to = body.get("editorID")
        if not promote_to:
            raise BadRequest("editorID is required to delete yourself as Admin")
        if promote_to == user_id:
            raise BadRequest("editorID cannot be the same as the deleting admin")

        candidate = fetch_user(promote_to) # checa se o editor existe, pertence ao sebo e tem a role de editor
        if candidate.get('seboId') != g.sebo_id:
            raise Forbidden("editorID must belong to your sebo")
        if candidate.get('userRole') != UserRole.EDITOR.value:
            raise BadRequest("editorID must currently have role Editor")

        
        update_user(promote_to, {"userRole": UserRole.ADMIN.value}) 
        deleted_info = delete_user(user_id, g.sebo_id)
        return jsonify({
            "message": "Admin deleted; editor promoted to Admin",
            "editorID": promote_to,
            "data": deleted_info
        }), 200

    deleted_info = delete_user(user_id, g.sebo_id)
    return jsonify({
        "message": "User deleted successfully",
        "data": deleted_info
    }), 200
@app.route("/users/employees/<user_id>", methods=["POST"])
@permission_required(UserRole.ADMIN)
def add_new_employee_route(user_id): # <- id do user criado pelo admin
    data = request.get_json()
    if not user_id:
        raise BadRequest("Employee User ID is required")
    if not data:
        raise BadRequest("Employee data is required")
    # user_id here is the new employee's Firebase UID
    new_employee = add_new_employee(user_id, g.sebo_id, data)
    return jsonify(new_employee), 201

@app.route("/users/<user_id>", methods=["PUT"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR)
def update_user_route(user_id): # admin pode atualizar qualquer user do sebo, editor apenas ele mesmo
    if g.user_role != UserRole.ADMIN.value and g.user_id != user_id:
        raise Forbidden("You can only update your own profile.")
    update_data = request.get_json()
    if not update_data:
        raise BadRequest("Invalid JSON data")
    updated_user = update_user(user_id, update_data)
    return jsonify({
        "message": "User updated successfully",
        "user": updated_user
    }), 200

# ============================================
#                   Vendas
# ============================================

@app.route("/sales/<ISBN>/<copy_id>", methods=["POST"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR)
def create_sale_route(ISBN, copy_id):
    sale_data = create_sale(g.user_id,g.sebo_id, ISBN, copy_id)
    return jsonify(sale_data), 201

@app.route("/sales/<sale_id>", methods=["GET"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR, UserRole.READER)
def fetch_sale_route(sale_id):
    sale = fetch_sale(sale_id, g.sebo_id)
    return jsonify(sale), 200

@app.route("/sales/<sale_id>", methods=["DELETE"])
@permission_required(UserRole.ADMIN)
def delete_sale_route(sale_id):
    sale = delete_sale(g.sebo_id, sale_id)
    return jsonify({"message": "Sale deleted successfully", "data": sale}), 200

@app.route("/sales/<sale_id>", methods=["PUT"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR)
def update_sale_route(sale_id):
    update_data = request.get_json()
    if not update_data:
        raise BadRequest("Invalid JSON data")
    updated_sale = update_sale(g.sebo_id, sale_id, update_data)
    return jsonify({
        "message": "Sale updated successfully",
        "sale": updated_sale
        }), 200

# ============================================
#                   Logs
# ============================================

@app.route("/logs/<log_id>", methods=["GET"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR, UserRole.READER)
def get_log_route(log_id):
    log = fetch_log(g.sebo_id, log_id) # o g.sebo_id garante que o log do proprio user
    return jsonify(log), 200

@app.route("/logs/<log_id>", methods=["PUT"])
@permission_required(UserRole.ADMIN)
def update_log_route(log_id):
    update_data = request.get_json()
    if not update_data:
        raise BadRequest("Invalid JSON data")
    updated_log = update_log(g.sebo_id, log_id, update_data)
    return jsonify(updated_log), 200

@app.route("/logs", methods=["GET"])
@permission_required(UserRole.ADMIN, UserRole.EDITOR, UserRole.READER)
def fetch_all_logs_route():
    logs = fetch_all_logs(g.sebo_id)
    return jsonify(logs), 200
if __name__ == '__main__':
    app.run(debug=True)
