from firebase_admin import firestore, auth
from models.users import User
from models.sebos import Sebo
from pydantic import ValidationError 
from werkzeug.exceptions import NotFound, Conflict, BadRequest, Forbidden


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
    return user_data
    


def add_new_employee(user_id, sebo_id, employee_data): 
    employee_data['sebo_id'] = sebo_id
    employee_data['user_id'] = user_id
    sebo_ref = db.collection('Sebos').document(sebo_id)
    sebo_doc = sebo_ref.get(['nameSebo'])  
    if not sebo_doc.exists:
        raise NotFound(f"Sebo with ID {sebo_id} not found")
    
    sebo_data = sebo_doc.to_dict()
    employee_data['name_sebo'] = sebo_data.get('nameSebo', 'Unknown Sebo') if sebo_data else 'Unknown Sebo'
    try:
        employee = User.model_validate(employee_data)
    except ValidationError as e:
        raise BadRequest(f"Invalid employee data: {e}")
    try:
        claims = {
            "seboId": employee.sebo_id,
            "userRole": employee.user_role.value
        }
        auth.set_custom_user_claims(employee.user_id, claims)
    except Exception as e:
        raise BadRequest(f"Failed to set custom claims for user {employee.user_id}: {e}")
    employee_ref = db.collection('Users').document(employee.user_id)
    employee_ref.set(employee.model_dump(by_alias=True))
    return employee.model_dump(by_alias=True)

def update_user(user_id, update_data):
    user_ref = db.collection('Users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise NotFound(f"User with ID {user_id} not found")
    try:
        user_data = user_doc.to_dict()
        validaded_user = User.model_validate(user_data)
        updated_fields = validaded_user.model_copy(update=update_data)
        user_ref.update(updated_fields.model_dump(by_alias=True))
        return updated_fields.model_dump(by_alias=True)
    except ValidationError as e:
        raise BadRequest(f"Invalid user data: {e}")

    

def delete_user(user_id, sebo_id): 
    user_ref = db.collection('Users').document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise NotFound(f"User with ID {user_id} not found")
    user_data = user_doc.to_dict()
    try:
        validated_user = User.model_validate(user_data)
    except ValidationError as e:
        raise BadRequest(f"User data in database is invalid: {e}")
    if validated_user.sebo_id != sebo_id:
        raise Forbidden("You can only delete users from your own sebo.")
    try:
        user_ref.delete()
    except Exception as e:
        raise BadRequest(f"Failed to delete user {user_id}: {e}")
    return validated_user.model_dump(by_alias=True)

def fetch_all_sebo_users(sebo_id): 
    users_ref = db.collection('Users').select(['userId', 'email', 'name', 'userRole'])
    query = users_ref.where('seboId', '==', sebo_id)
    users = [user.to_dict() for user in query.stream()]
    return users