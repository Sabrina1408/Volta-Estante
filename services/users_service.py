from firebase_admin import firestore, auth
from models.users import User
from models.sebos import Sebo
from pydantic import ValidationError 
from werkzeug.exceptions import NotFound, Conflict, BadRequest


db = firestore.client()

def save_user(user_id, email, name, user_data): 
    user_data['user_id'] = user_id
    user_data['email'] = email
    if name:
        user_data['name'] = name

    try:
        user = User.model_validate(user_data)
    except ValidationError as e:
        raise BadRequest(f"Invalid user data: {e}")
    
    user_ref = db.collection('Users').document(user.user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        raise Conflict(f"User with ID {user.user_id} already exists")
    
    sebo_ref = db.collection('Sebos').document(user.sebo_id)
    sebo_doc = sebo_ref.get()
    if not sebo_doc.exists:
        sebo_info = { 
                     "sebo_id": user.sebo_id,
                     "name_sebo": user.name_sebo,
                     "user_id": user.user_id,
                     "created_at": user.registered_at
        }
        try:
            sebo = Sebo.model_validate(sebo_info)
            sebo_ref.set(sebo.model_dump(by_alias=True))
        except ValidationError as e:
            raise BadRequest(f"Invalid sebo data: {e}")
    
    try:
        claims = {
            "seboId": user.sebo_id,
            "userRole": user.user_role.value
        }
        auth.set_custom_user_claims(user.user_id, claims)
    except Exception as e:
        raise BadRequest(f"Failed to set custom claims for user {user.user_id}: {e}")
    user_ref.set(user.model_dump(by_alias=True))
    return user.model_dump(by_alias=True)

def fetch_user(user_id):
    user_ref = db.collection('Users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise NotFound(f"User with ID {user_id} not found")
    user_data = user_doc.to_dict()
    try: 
        validated_user = User.model_validate(user_data)
        return validated_user.model_dump(by_alias=True)
    except ValidationError as e:
        raise BadRequest(f"User data in database is invalid: {e}")
    
def delete_user(user_id): # Deletar usuario deve deletar o sebo em que ele é "dono"?
    user_ref = db.collection('Users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise NotFound(f"User with ID {user_id} not found")
    user_ref.delete()
    return {"userId": user_id, "status": "deleted"}

def update_user(user_id, update_data):
    return None
