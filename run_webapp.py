#!/usr/bin/env python3
# run_webapp.py

import os
import sys
import subprocess
import webbrowser
import time
import signal
import threading

def build_frontend():
    """Build the React frontend"""
    print("Building frontend...", flush=True)
    os.chdir("client")
    try:
        subprocess.run(["npm", "install"], check=True)
        subprocess.run(["npm", "run", "build"], check=True)
        os.chdir("..")
        print("Frontend built successfully", flush=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error building frontend: {e}", flush=True)
        os.chdir("..")
        return False

def run_backend():
    """Run the Flask backend"""
    print("Starting backend server...", flush=True)
    try:
        from app import socketio, app
        # Run the Flask SocketIO app
        socketio.run(app, host='0.0.0.0', port=5000, debug=True)
    except ImportError as e:
        print(f"Failed to import backend: {e}", flush=True)
        print("Make sure all dependencies are installed", flush=True)
        sys.exit(1)
    except Exception as e:
        print(f"Error starting backend: {e}", flush=True)
        sys.exit(1)

def main():
    """Main function to run the web application"""
    # Build frontend
    if not build_frontend():
        print("Failed to build frontend. Using existing build if available.", flush=True)

    # Run backend
    run_backend()

if __name__ == "__main__":
    main()
