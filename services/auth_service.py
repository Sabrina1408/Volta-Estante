from firebase_admin import auth
from werkzeug.exceptions import Unauthorized, Forbidden
from flask import request, g
from models.users import UserRole
from functools import wraps



def _get_token_from_header():
    auth_header = request.headers.get("Authorization") 
    if not auth_header:
        raise Unauthorized("Authorization header is missing")
    if not auth_header.startswith("Bearer "):
        raise Unauthorized("Invalid authorization header format, Use Bearer Token")
    return auth_header.split('Bearer ')[1] # pega o valor depois de Bearer

def _verify_token(token, claims_required=True):
    try:
        decoded_token = auth.verify_id_token(token)
        g.user_id = decoded_token['uid']
        g.email = decoded_token['email']
        g.name = decoded_token['name']          
        if claims_required:
            g.sebo_id = decoded_token['seboId']
            g.user_role = decoded_token['userRole'] # extrai as custons clains que criei no save_user e o uid que o firebase fornce !! não é o id token!! 
            if not g.user_id or not g.sebo_id or not g.user_role:
                raise Unauthorized("Token is missing required claims: (seboId, userRole)")
        return True
    except auth.InvalidIdTokenError:
        raise Unauthorized("Invalid token or expired")
    except Exception as e:
        raise e if isinstance(e, Unauthorized) else Unauthorized(f"Token verification failed")

def _authorize_user_role(required_role): # checa se o user tem a role necessaria pra acessar o resource
    if not required_role:
        return 
    try:
        current_role = UserRole(g.user_role)
    except ValueError:
        raise Unauthorized(f"Invalid user role: {g.user_role}")
    if current_role not in required_role:
        raise Forbidden("You do not have the required role to access this resource.")

def permission_required(*required_role, claims_required=True):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            token = _get_token_from_header()
            _verify_token(token)
            if claims_required:
                _authorize_user_role(required_role)
            return func(*args, **kwargs)
        return decorated_function
    return decorator


    