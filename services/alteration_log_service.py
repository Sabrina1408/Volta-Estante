from flask import g
from firebase_admin import firestore
from models.alteration_log import AlterationLog
from pydantic import ValidationError
from werkzeug.exceptions import BadRequest
from functools import wraps

db = firestore.client()

def save_log(sebo_id, user_id, user_name, action, details):
        log_data = {
            "user_id": user_id,
            "user_name": user_name,
            "action": action,
            "details": details
        }
        try:
            log_entry = AlterationLog.model_validate(log_data)
            log_ref = db.colletion('Sebos').document(sebo_id).collection('AlterationLogs').document(log_entry.log_id)
            log_ref.set(log_entry.model_dump(by_alias=True))
        except (ValidationError, Exception) as e:
            raise BadRequest(f"Invalid log data: {e}")
  


def log_action(action):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            details = kwargs.copy()
            save_log(g.sebo_id, g.user_id, g.name, action, details)
            return result
        return wrapper
    return decorator
