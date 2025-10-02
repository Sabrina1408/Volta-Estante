from flask import Flask, jsonify
from flask_cors import CORS
import time
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()
path = os.getenv("GOOGLE_APLICATION_CREDENTIALS")
cred = credentials.Certificate(path)
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)
@app.route('/')
def hello():
    return jsonify({'message': 'Hello, World!'})

@app.route('/about')
def about():
    return jsonify({'app': 'Volta-Estante', 'version': '1.0'})

@app.route('/api/time')
def get_time():
    return jsonify({'time': time.ctime()})
@app.route("/ping-db")
def ping_db():
    try:
        # Try writing to Firestore
        doc_ref = db.collection("ping").document("test")
        doc_ref.set({"status": "ok"})

        # Try reading back
        doc = doc_ref.get()
        return jsonify({
            "success": True,
            "data": doc.to_dict()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })



if __name__ == '__main__':
    app.run(debug=True)



