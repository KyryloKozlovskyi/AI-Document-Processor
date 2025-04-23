FROM node:18 AS frontend

WORKDIR /app
COPY package*.json ./

# Fix npm installation issues with a more resilient approach
RUN npm install --legacy-peer-deps --no-fund --no-audit

COPY . .
RUN npm run build --legacy-peer-deps

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

# Install Node.js dependencies in the backend directory
WORKDIR /app
RUN npm install --legacy-peer-deps --no-fund --no-audit
RUN npm install dotenv express cors body-parser mongoose multer resend jsonwebtoken bcryptjs

# Create requirements.txt if it doesn't exist
RUN mkdir -p ai_processing
RUN if [ ! -f "ai_processing/requirements.txt" ]; then \
    echo "pytesseract==0.3.10" > ai_processing/requirements.txt && \
    echo "pdf2image==1.16.3" >> ai_processing/requirements.txt && \
    echo "Pillow==10.0.0" >> ai_processing/requirements.txt && \
    echo "requests==2.31.0" >> ai_processing/requirements.txt && \
    echo "python-dotenv==1.0.0" >> ai_processing/requirements.txt && \
    echo "openai==1.12.0" >> ai_processing/requirements.txt && \
    echo "numpy==1.24.3" >> ai_processing/requirements.txt; \
    fi

# Install Python dependencies
RUN pip install -r ai_processing/requirements.txt

# Copy frontend build
COPY --from=frontend /app/build ./frontend/build

# Create directory for PDFs if it doesn't exist
RUN mkdir -p backend/pdfs

# Fix Windows paths in Python files
RUN find ai_processing -type f -name "*.py" -exec sed -i 's|C:\\Program Files\\Tesseract-OCR\\tesseract.exe|/usr/bin/tesseract|g' {} \; || true
RUN find ai_processing -type f -name "*.py" -exec sed -i 's|C:\\Program Files\\poppler-24.08.0\\Library\\bin|/usr/bin|g' {} \; || true

# Set environment variables
ENV NODE_ENV=production

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "backend/server.js"]