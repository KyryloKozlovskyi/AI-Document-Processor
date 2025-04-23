# AI Document Processor

AI Document Processor is an advanced event management system with AI-powered form processing capabilities designed for small businesses. The application allows users to submit forms and PDF documents, which are analysed and summarised using artificial intelligence to extract and process relevant information.

## 📋 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributors](#contributors)

## ✨ Features

- **Event Management**: Create, update, and delete events
- **Form Submissions**: Accept submissions with optional PDF file uploads
- **AI Document Analysis**: Automatically analyse and extract information from PDF documents
- **AI Query Interface**: Ask questions about submitted documents using natural language
- **Authentication**: Secure admin access with JWT authentication
- **Email Notifications**: Automatic confirmation emails to users upon submission
- **Payment Tracking**: Track payment status of submissions
- **Responsive UI**: Modern, mobile-friendly user interface

## 🛠️ Technologies Used

### Frontend
- React
- React Bootstrap
- React Router
- Axios
- React Markdown

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Multer (file handling)
- Resend (email delivery)

### AI & Document Processing
- Python
- OpenRouter API
- Llama 4 Maverick
- Tesseract OCR

## 🏗️ Architecture

The application follows a three-tier architecture:

1. **Frontend**: React-based user interface
2. **Backend**: Node.js/Express RESTful API
3. **AI Processing Layer**: Python scripts for document analysis and AI queries

## 🔍 Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MongoDB
- OpenRouter API key (optional, for enhanced AI features)
- Resend API key (for email functionality)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AI-Document-Processor.git
cd AI-Document-Processor
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Install Python dependencies:
```bash
pip install -r ai_processing/requirements.txt
```

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
SERVER_PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/ai-document-processor

# Authentication
JWT_SECRET=your_jwt_secret_key

# Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_DOMAIN=no-reply@yourdomain.com

# AI Services
OPENROUTER_API_KEY=your_openrouter_api_key
```

## 🚀 Running the Application

1. Start the MongoDB server:
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
nodemon server.js
```

3. In a new terminal, start the frontend development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 📚 API Reference

### Authentication Endpoints

- `POST /api/auth/login` - Login as administrator
- `GET /api/auth/verify` - Verify authentication token

### Event Endpoints

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get a specific event
- `POST /api/events` - Create a new event (requires authentication)
- `PUT /api/events/:id` - Update an event (requires authentication)
- `DELETE /api/events/:id` - Delete an event (requires authentication)

### Submission Endpoints

- `POST /api/submit` - Submit a form with optional file upload
- `GET /api/submissions` - Get all submissions (requires authentication)
- `GET /api/submissions/:id/file` - Download a submission file (requires authentication)
- `PATCH /api/submissions/:id` - Update submission payment status (requires authentication)
- `DELETE /api/submissions/:id` - Delete a submission (requires authentication)

### AI Processing Endpoints

- `GET /analyze/:submissionId` - analyse a PDF submission (requires authentication)
- `GET /query/:query` - Query the AI model with a specified query (requires authentication)
- `GET /api/check-python` - Check Python environment configuration (requires authentication)

### Document Download Endpoints

- `GET /companyform` - Download company form template

## 🧪 Testing

The project includes HTTP-based API tests located in the `Testing/endpoint-testing` directory. You can run these tests using VS Code's REST Client extension (by Hauchao Mao) or any HTTP client such as Postman.

Example test files:
- `event-endpoint-tests.http` - Tests for event-related endpoints
- `submission-endpoint-tests.http` - Tests for submission-related endpoints

## 📁 Project Structure

```
AI-Document-Processor/
├── ai_processing/           # Python scripts for AI processing
├── backend/                 # Node.js backend
│   ├── middlewares/         # Express middlewares
│   ├── models/              # Mongoose schemas
│   ├── pdfs/                # PDF templates
│   └── server.js            # Express server
├── public/                  # Static files
├── src/                     # React frontend
│   ├── components/          # React components
│   │   ├── AdminViews/      # Admin panel components
│   │   └── styles/          # Component-specific styles
│   ├── App.js               # Main App component
│   └── index.js             # React entry point
└── Testing/                 # Test files
    └── endpoint-testing/    # API endpoint tests
```

## 👥 Contributors

- Fionn McCarthy (G00414386)
- Kyrylo Kozlovskyi (G00425385)

---

**About:** This application was developed as a 3rd year final project at Atlantic Technological University, Galway. The AI-Document Processor harnesses AI to streamline form and PDF analysis—helping organizations organize and understand their data faster.
