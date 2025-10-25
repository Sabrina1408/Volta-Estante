from flask import g, request
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
            log_ref = db.collection('Sebos').document(sebo_id).collection('AlterationLogs').document(log_entry.log_id)
            log_ref.set(log_entry.model_dump(by_alias=True))
        except (ValidationError, Exception) as e:
            raise BadRequest(f"Invalid log data: {e}")
  
def fetch_log(sebo_id, log_id):
    log_ref = db.collection('Sebos').document(sebo_id).collection('AlterationLogs').document(log_id)
    log_doc = log_ref.get()
    if not log_doc.exists:
        raise BadRequest(f"Log with ID {log_id} not found")
    log_data = log_doc.to_dict()
    try:
        validated_log = AlterationLog.model_validate(log_data)
        return validated_log.model_dump(by_alias=True)
    except ValidationError:
        raise BadRequest(f"Invalid log data for log ID {log_id}")

def fetch_all_logs(sebo_id):
    logs_ref = db.collection('Sebos').document(sebo_id).collection('AlterationLogs')
    logs_docs = logs_ref.stream()
    logs = []
    for log_doc in logs_docs:
        log_data = log_doc.to_dict()
        try:
            validated_log = AlterationLog.model_validate(log_data)
            logs.append(validated_log.model_dump(by_alias=True))
        except ValidationError:
            continue
    return logs

def update_log(sebo_id, log_id, update_data):
    log_ref = db.collection('Sebos').document(sebo_id).collection('AlterationLogs').document(log_id)
    log_doc = log_ref.get()
    if not log_doc.exists:
        raise BadRequest(f"Log with ID {log_id} not found")
    try:
        log_data = log_doc.to_dict()
        validated_log = AlterationLog.model_validate(log_data)
        updated_fields = validated_log.model_copy(update=update_data)
        log_ref.update(updated_fields.model_dump(by_alias=True))
        return updated_fields.model_dump(by_alias=True)    
    except (ValidationError, Exception) as e:
        raise BadRequest(f"Invalid log data: {e}")



def log_action(action):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            details = kwargs.copy()
            if not details and request.is_json:
                json_data = request.get_json()
                if isinstance(json_data, dict):
                    details = {}
                    for key, value in json_data.items():
                        if isinstance(value, (str, int, float, bool)):
                            details[key] = value                
            save_log(g.sebo_id, g.user_id, g.name, action, details)
            return result
        return wrapper
    return decorator
