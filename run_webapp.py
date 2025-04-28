
#!/usr/bin/env python3
# run_webapp.py

import os
import sys
import subprocess
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('run_webapp')

def install_dependencies():
    """Install required Python dependencies"""
    logger.info("Installing Python dependencies...")
    try:
        subprocess.run(["pip", "install", "-r", "Requirements.txt"], check=True)
        logger.info("Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error installing Python dependencies: {e}")
        return False

def build_frontend():
    """Build the React frontend"""
    logger.info("Building frontend...")
    os.chdir("client")
    try:
        subprocess.run(["npm", "install"], check=True)
        subprocess.run(["npm", "run", "build"], check=True)
        os.chdir("..")
        logger.info("Frontend built successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error building frontend: {e}")
        os.chdir("..")
        return False

def run_backend():
    """Run the Flask backend"""
    logger.info("Starting backend server...")
    try:
        from app import socketio, app
        # Run the Flask SocketIO app
        socketio.run(app, host='0.0.0.0', port=8080, debug=True)
    except ImportError as e:
        logger.error(f"Failed to import backend: {e}")
        logger.info("Make sure all dependencies are installed")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error starting backend: {e}")
        sys.exit(1)

def main():
    """Main function to run the web application"""
    # Install Python dependencies
    if not install_dependencies():
        logger.error("Failed to install dependencies. Continuing anyway...")
    
    # Build frontend
    if not build_frontend():
        logger.warning("Failed to build frontend. Using existing build if available.")

    # Run backend
    run_backend()

if __name__ == "__main__":
    main()
