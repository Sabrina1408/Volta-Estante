from firebase_admin import firestore
from uuid import uuid4
from datetime import datetime, timezone

db = firestore.client()

def save_user(user_data):
    seboID = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    user_ref = db.collection('Users').document(user_data['userID'])
    user_doc = user_ref.get()
    sebo_ref = db.collection('Sebos').document(seboID)
    sebo_info = {   'seboID': seboID,
                    'created_at' : created_at,
                    'owner_id' : user_data['userID'],
                    'nameSebo' : user_data.get('nomeSebo', 'Unnamed Sebo')
                }
    user_data['seboID'] = seboID
    user_data['created_at'] = created_at
    if user_doc.exists:
        raise ValueError(f"User with ID {user_data['userID']} already exists")
    sebo_ref.set(sebo_info)
    user_ref.set(user_data)
    
    return user_data    

def delete_user(user_data):
    if not user_data:   
        raise ValueError("Invalid user data")
    user_ref = db.collection('Users').document(user_data['userID'])
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        raise LookupError(f"User with ID {user_data['userID']} not found")
    user_ref.delete()
    return {"userID": user_data['userID'],
            "status": "deleted",
            "email": user_data.get('email', None)
    }

def fetch_user(userID): 
    if not userID:
        raise ValueError("Invalid user data: Missing User ID")
    
    user_ref = db.collection('Users').document(userID).get()
    if not user_ref.exists:
        raise LookupError(f"User with ID {userID} not found")
    
    return user_ref.to_dict()

def update_user(userID, update_data):
    return None