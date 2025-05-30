
import { getAuth } from 'firebase/auth';

class VoiceService {
  constructor() {
    this.ws = null;
    this.onMessage = null;
    this.onOpen = null;
    this.onClose = null;
    this.onError = null;
    this.isConnected = false;
  }

  async connect(character = 'Maya') {
    // Close any existing connection
    if (this.ws) {
      this.ws.close();
    }

    try {
      // Get current user and ID token
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await user.getIdToken();
      
      // Connect to backend WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/socket.io/?token=${token}&character=${character}&EIO=4&transport=websocket`;
      console.log("Connecting to WebSocket at:", wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      this.ws.binaryType = 'arraybuffer';
      
      this.ws.onopen = (event) => {
        console.log("WebSocket connection opened");
        this.isConnected = true;
        if (this.onOpen) this.onOpen(event);
      };
      
      this.ws.onmessage = (event) => {
        // Handle Socket.IO protocol messages
        if (typeof event.data === 'string' && event.data.startsWith('0')) {
          // Socket.IO handshake
          console.log("Socket.IO handshake received");
          this.ws.send('40');  // Socket.IO connect packet
        } else if (typeof event.data === 'string' && event.data.startsWith('40')) {
          // Socket.IO connection established
          console.log("Socket.IO connection established");
        } else {
          // Pass other messages to handler
          if (this.onMessage) this.onMessage(event);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log("WebSocket connection closed", event);
        this.isConnected = false;
        if (this.onClose) this.onClose(event);
      };
      
      this.ws.onerror = (event) => {
        console.error("WebSocket error", event);
        if (this.onError) this.onError(event);
      };
      
      return new Promise((resolve, reject) => {
        this.onOpen = () => resolve();
        this.onError = (err) => reject(err);
        
        // Set timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 5000);
      });
    } catch (error) {
      console.error('Error connecting to voice service:', error);
      throw error;
    }
  }
  
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }
    
    // Format binary data for Socket.IO
    const isBinary = data instanceof ArrayBuffer;
    
    if (isBinary) {
      // For binary data, send as is (Socket.IO will handle it)
      this.ws.send(data);
    } else {
      // For text data, format as Socket.IO message
      this.ws.send('42["message",'+JSON.stringify(data)+']');
    }
    
    return true;
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
  
  setMessageHandler(callback) {
    this.onMessage = callback;
  }
  
  setCloseHandler(callback) {
    this.onClose = callback;
  }
  
  setErrorHandler(callback) {
    this.onError = callback;
  }
}

export default new VoiceService();
