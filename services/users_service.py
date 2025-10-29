from firebase_admin import firestore, auth
from models.users import User
from models.sebos import Sebo
from pydantic import ValidationError 
from werkzeug.exceptions import NotFound, Conflict, BadRequest, Forbidden
import secrets
import string


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
    
def create_employee_account(email, name):
    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    try:
        user_record = auth.create_user(
            email=email,
            email_verified=False,
            password=temp_password,
            display_name=name,
            disabled=False
        )
        reset_link = auth.generate_password_reset_link(email)
        return {
            "user_id": user_record.uid,
            "email": email,
            "temporary_password": temp_password,
            "password_reset_link": reset_link
        }   
    except auth.EmailAlreadyExistsError:
        raise Conflict(f"An account with email {email} already exists.")
    except Exception as e:
        raise BadRequest(f"Failed to create user account: {e}")


def add_new_employee(admin_user_id, sebo_id, employee_data):  # aqui o admin e o sebo sao garantidos de existir
    admin_sebo_id = db.collection('Users').document(admin_user_id).get(['seboId', 'nameSebo'])
    if admin_sebo_id.get('seboId') != sebo_id:
        raise Forbidden("You can only add employees to your own sebo.")
    employee_email = employee_data.get('email')
    employee_name = employee_data.get('name')
    firebase_user = create_employee_account(employee_email, employee_name)
    employee_uid = firebase_user['user_id']
    
    employee_data['sebo_id'] = sebo_id
    employee_data['name_sebo'] = admin_sebo_id.get('nameSebo')
    employee_data['userId'] = employee_uid
    try:
        employee_user = User.model_validate(employee_data)
    except ValidationError as e:
        auth.delete_user(employee_uid)
        raise BadRequest(f"Invalid employee user data: {e}")
    try: 
        claims = { 
            "seboId": employee_user.sebo_id,
            "userRole": employee_user.user_role.value
        }
        auth.set_custom_user_claims(employee_uid, claims)
    except Exception as e:
        auth.delete_user(employee_uid)
        raise BadRequest(f"Failed to set custom claims for employee user {employee_uid}: {e}")
    user_ref = db.collection('Users').document(employee_uid)
    employee_info = employee_user.model_dump(by_alias=True)
    user_ref.set(employee_info)
    return {
        "employee_user": employee_info,
        "temporary_password": firebase_user['temporary_password'],
        "password_reset_link": firebase_user['password_reset_link']     
    }

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