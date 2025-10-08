from firebase_admin import firestore
from uuid import uuid4
from datetime import datetime, timezone

db = firestore.client()

def save_user(user_data):
    sebo_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    user_ref = db.collection('Users').document(user_data['user_id'])
    user_doc = user_ref.get()
    sebo_ref = db.collection('Sebos').document(sebo_id)
    sebo_info = {   'sebo_id': sebo_id,
                    'created_at' : created_at,
                    'owner_id' : user_data['user_id'],
                    'nameSebo' : user_data.get('nomeSebo', 'Unnamed Sebo')
                }
    user_data['sebo_id'] = sebo_id
    user_data['created_at'] = created_at
    if user_doc.exists:
        raise ValueError(f"User with ID {user_data['user_id']} already exists")
    sebo_ref.set(sebo_info)
    user_ref.set(user_data)
    
    return user_data    

def delete_user(user_data):
    if not user_data:   
        raise ValueError("Invalid user data")
    user_ref = db.collection('Users').document(user_data['user_id'])
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        raise LookupError(f"User with ID {user_data['user_id']} not found")
    user_ref.delete()
    return {"user_id": user_data['user_id'],
            "status": "deleted",
            "email": user_data.get('email', None)
    }

def fetch_user(user_id): 
    if not user_id:
        raise ValueError("Invalid user data: Missing User ID")
    
    user_ref = db.collection('Users').document(user_id).get()
    if not user_ref.exists:
        raise LookupError(f"User with ID {user_id} not found")
    
    return user_ref.to_dict()

def update_user(user_id, update_data):
    return None