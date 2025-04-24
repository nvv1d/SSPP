
# Use Python 3.11 as base image
FROM python:3.11-slim

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    portaudio19-dev \
    python3-pyaudio \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python requirements and install dependencies
COPY Requirements.txt .
RUN pip install --no-cache-dir -r Requirements.txt

# Copy the Flask backend
COPY sesame_ai/ sesame_ai/
COPY app.py run_webapp.py setup.py ./
COPY examples/ examples/

# Copy the React frontend
COPY client/ client/

# Install React dependencies and build the frontend
WORKDIR /app/client
RUN npm install
RUN npm run build

# Return to main directory
WORKDIR /app

# Set environment variables
ENV PORT=5000
ENV PYTHONUNBUFFERED=1

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]
