from flask import Flask, jsonify
from flask_cors import CORS
import time

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

if __name__ == '__main__':
    app.run(debug=True)



