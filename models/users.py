from firebase_admin import firestore

db = firestore.client()

def save_user(user_data):
    if not user_data or 'user_id' in user_data:
        raise ValueError("Invalid user data")
    user_ref = db.collection('Users').document(user_data['user_id'])
    user_doc = user_ref.get()
    if user_doc.exists:
        raise ValueError(f"User with ID {user_data['user_id']} already exists")
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
        