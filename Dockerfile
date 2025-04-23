FROM node:18 AS frontend

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.9

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire app first
COPY . .

# Install Python dependencies - use conditional approach
RUN if [ -f "ai_processing/requirements.txt" ]; then \
        pip install -r ai_processing/requirements.txt; \
    else \
        pip install pytesseract pdf2image Pillow requests python-dotenv openai numpy; \
    fi

# Copy frontend build
COPY --from=frontend /app/build ./frontend/build

# Create directory for PDFs if it doesn't exist
RUN mkdir -p backend/pdfs

# Fix Windows paths in Python files
RUN find ai_processing -type f -name "*.py" -exec sed -i 's|C:\\Program Files\\Tesseract-OCR\\tesseract.exe|/usr/bin/tesseract|g' {} \;
RUN find ai_processing -type f -name "*.py" -exec sed -i 's|C:\\Program Files\\poppler-24.08.0\\Library\\bin|/usr/bin|g' {} \;

# Set environment variables
ENV NODE_ENV=production

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "backend/server.js"]