from flask import Flask, send_from_directory, request, jsonify
import os
import threading
import logging
import json
from flask_cors import CORS

app = Flask(__name__, static_folder='client/build')
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger('sesame.webapp')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/characters', methods=['GET'])
def get_characters():
    # This matches the characters available in the Sesame demo
    return jsonify({"characters": ["Maya", "Miles"]})

@app.route('/api/auth/verify', methods=['POST'])
def verify_auth():
    try:
        # Get the token from the request
        data = request.json
        user_token = data.get('token')
        user_info = data.get('user_info')

        if not user_token:
            return jsonify({'error': 'No token provided'}), 400

        # Log user login
        logger.info(f"User authenticated: {user_info.get('email') if user_info else 'unknown'}")

        # In a production app, you would verify the token with Firebase Admin SDK
        # For this example, we'll assume the token is valid if it exists

        return jsonify({
            'success': True,
            'message': 'Authentication successful'
        })

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)