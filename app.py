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
            logger.warning("Auth verification attempt with no token")
            return jsonify({'error': 'No token provided'}), 400

        # Log user login
        logger.info(f"User authenticated: {user_info.get('email') if user_info else 'unknown'}")
        logger.info(f"Auth token received: {user_token[:20]}...")

        # In a production app, you would verify the token with Firebase Admin SDK
        # For this example, we'll assume the token is valid if it exists

        return jsonify({
            'success': True,
            'message': 'Authentication successful'
        })

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    return jsonify({
        'status': 'ok',
        'auth_enabled': True,
        'message': 'Authentication service is running'
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import json
import threading
import time
import logging
import base64
from sesame_ai import SesameAI, TokenManager, SesameWebSocket

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('sesame_web')

# Initialize Flask app
app = Flask(__name__, static_folder='client/build')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Token manager for authentication
token_manager = TokenManager()

# Active WebSocket sessions
sessions = {}

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve the React app"""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    
    # Get query parameters from request
    token = request.args.get('token')
    character = request.args.get('character', 'Miles')
    
    # Validate token
    if not token:
        emit('error', {'message': 'Authentication required'})
        return False
    
    try:
        # Create a new SesameWebSocket instance for this session
        sesame_ws = SesameWebSocket(id_token=token, character=character)
        
        # Store the session
        sessions[request.sid] = {
            'sesame_ws': sesame_ws,
            'character': character,
            'audio_queue': [],
            'active': True
        }
        
        # Connect to SesameAI WebSocket in a background thread
        def connect_sesame():
            try:
                success = sesame_ws.connect(blocking=True)
                if success:
                    logger.info(f"Connected to SesameAI for session {request.sid}")
                    emit('status', {'type': 'status', 'content': f'Connected to {character}'})
                    
                    # Start audio forwarding thread
                    audio_thread = threading.Thread(target=forward_audio, args=(request.sid,))
                    audio_thread.daemon = True
                    audio_thread.start()
                else:
                    logger.error(f"Failed to connect to SesameAI for session {request.sid}")
                    emit('status', {'type': 'status', 'content': 'Failed to connect. Please try again.'})
                    sessions[request.sid]['active'] = False
            except Exception as e:
                logger.exception(f"Error connecting to SesameAI: {e}")
                emit('status', {'type': 'status', 'content': f'Error: {str(e)}'})
                sessions[request.sid]['active'] = False
        
        connection_thread = threading.Thread(target=connect_sesame)
        connection_thread.daemon = True
        connection_thread.start()
        
        return True
    except Exception as e:
        logger.exception(f"Error in handle_connect: {e}")
        emit('error', {'message': str(e)})
        return False

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")
    
    if request.sid in sessions:
        # Disconnect from SesameAI WebSocket
        try:
            sessions[request.sid]['active'] = False
            sessions[request.sid]['sesame_ws'].disconnect()
        except Exception as e:
            logger.error(f"Error disconnecting from SesameAI: {e}")
        
        # Remove the session
        del sessions[request.sid]

@socketio.on('message')
def handle_message(data):
    """Handle incoming messages from client"""
    if request.sid not in sessions or not sessions[request.sid]['active']:
        emit('error', {'message': 'Session not active'})
        return
    
    try:
        # If message is binary (audio data)
        if isinstance(data, bytes):
            # Forward audio data to SesameAI
            sessions[request.sid]['sesame_ws'].send_audio_data(data)
        
        # If message is JSON (configuration)
        elif isinstance(data, str):
            try:
                msg = json.loads(data)
                msg_type = msg.get('type')
                
                if msg_type == 'config':
                    # Handle configuration message
                    character = msg.get('character')
                    if character:
                        sessions[request.sid]['character'] = character
                        emit('status', {'type': 'status', 'content': f'Switched to {character}'})
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON message: {data}")
    except Exception as e:
        logger.exception(f"Error handling message: {e}")
        emit('error', {'message': str(e)})

def forward_audio(sid):
    """Forward audio from SesameAI to client"""
    if sid not in sessions:
        return
    
    session = sessions[sid]
    ws = session['sesame_ws']
    
    while session['active']:
        try:
            # Get audio chunk from SesameAI WebSocket
            audio_chunk = ws.get_next_audio_chunk(timeout=0.1)
            
            if audio_chunk and sid in sessions:
                # Send audio chunk to client
                socketio.emit('audio', audio_chunk, room=sid, binary=True)
        except Exception as e:
            logger.error(f"Error forwarding audio: {e}")
            time.sleep(0.1)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
