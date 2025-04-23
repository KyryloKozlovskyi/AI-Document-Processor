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
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python requirements and install
COPY ai_processing/requirements.txt .
RUN pip install -r requirements.txt

# Copy backend and AI processing code
COPY backend ./backend
COPY ai_processing ./ai_processing

# Create directory for PDFs
RUN mkdir -p backend/pdfs
COPY backend/pdfs ./backend/pdfs

# Copy built frontend
COPY --from=frontend /app/build ./frontend/build

# Fix Windows paths in Python files
RUN find ai_processing -type f -name "*.py" -exec sed -i 's|C:\\Program Files\\Tesseract-OCR\\tesseract.exe|/usr/bin/tesseract|g' {} \;
RUN find ai_processing -type f -name "*.py" -exec sed -i 's|C:\\Program Files\\poppler-24.08.0\\Library\\bin|/usr/bin|g' {} \;

# Expose port
EXPOSE 5000

# Serve static files and API
RUN echo 'const express = require("express"); \
const app = express(); \
app.use(express.static("./frontend/build")); \
app.get("*", (req, res) => { \
  if (!req.path.startsWith("/api") && !req.path.startsWith("/query") && !req.path.startsWith("/analyze") && !req.path.startsWith("/companyform")) { \
    res.sendFile(__dirname + "/frontend/build/index.html"); \
  } \
}); \
module.exports = function(app) { return app; };' > ./server-static.js

CMD ["node", "-e", "const app = require('./server-static.js')(require('./backend/server.js')); \
app.listen(process.env.PORT || 5000, () => console.log('Server running'))"]