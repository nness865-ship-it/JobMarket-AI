# Job Market AI - Backend API

The backend for Job Market AI is a Flask-based service that handles authentication, NLP resume parsing, and career recommendations.

## 🔧 Core Components

- **Flask API**: RESTful endpoints for frontend communication.
- **MongoDB**: Persistent storage for users, jobs, and skill profiles.
- **spaCy NLP**: Extracts technical skills from unstructured resume text.
- **JWT Auth**: Secure session management.
- **SMTP Integration**: Sends verification OTPs via Gmail.

## 🔐 Environment Variables (.env)

```env
MONGO_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
SMTP_EMAIL=your_gmail
SMTP_PASSWORD=your_gmail_app_password
```

## 📡 API Endpoints

- `POST /auth/send-otp`: Sends a 6-digit code to email.
- `POST /auth/verify-otp`: Verifies code and issues JWT.
- `POST /auth/google`: Verifies Google OAuth credentials.
- `POST /upload-resume`: Parses PDF and returns skills.
- `GET /recommendations`: Returns AI-matched roles.
- `GET /seed-jobs`: Seeds the database with sample roles (Admin).

## 🛠️ Setup

1. `pip install -r requirements.txt`
2. `python -m spacy download en_core_web_sm`
3. `python app.py`
