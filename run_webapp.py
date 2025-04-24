
import os
import subprocess
import sys
import time

def check_node_installed():
    """Check if Node.js is installed."""
    try:
        subprocess.run(["node", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        return False

def install_node():
    """Install Node.js using a minimal installation method compatible with Replit."""
    print("Installing Node.js... This may take a few minutes.")
    try:
        # Use curl to download Node.js binary for Linux
        subprocess.run(
            "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash",
            shell=True,
            check=True
        )
        
        # Source nvm and install node
        subprocess.run(
            "export NVM_DIR=\"$HOME/.nvm\" && [ -s \"$NVM_DIR/nvm.sh\" ] && \\. \"$NVM_DIR/nvm.sh\" && nvm install 16",
            shell=True,
            check=True
        )
        
        print("Node.js installed successfully.")
        return True
    except subprocess.SubprocessError:
        print("Failed to install Node.js. Please install it manually or contact support.")
        return False

def run_client():
    """Run the React client."""
    os.chdir("client")
    print("Installing client dependencies...")
    subprocess.run(["npm", "install"], check=True)
    print("Starting client...")
    subprocess.Popen(["npm", "start"])
    os.chdir("..")

def run_server():
    """Run the Flask server."""
    print("Installing server dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "Requirements.txt"], check=True)
    print("Starting server...")
    subprocess.Popen([sys.executable, "app.py"])

def main():
    """Run both server and client."""
    if not check_node_installed():
        print("Error: Node.js is not installed. Please install Node.js to continue.")
        success = install_node()
        if not success:
            return
    
    try:
        run_server()
        time.sleep(2)  # Give server time to start
        run_client()
        
        print("\nWebapp is running!")
        print("The Flask server is running on port 5000")
        print("The React client is running on port 3000")
        print("\nPress Ctrl+C to stop the webapp.")
        
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping webapp...")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
