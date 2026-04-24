# Job Market AI: Career Intelligence Platform

Job Market AI is a premium, AI-powered career co-pilot designed to help users navigate the modern job market. By combining real-time market intelligence, NLP-driven resume parsing, and personalized learning roadmaps, it empowers job seekers to bridge skill gaps and land their dream roles.

## 🚀 Key Features

- **Instant Authentication**: Secure Email OTP and Google OAuth integration with a fully reactive UI.
- **AI Resume Parser**: Extract skills instantly from PDF resumes using our spaCy NLP pipeline.
- **Career Recommendations**: Personalized job matching based on your skill profile and live market data.
- **Learning Roadmaps**: Step-by-step guides to bridge the gap between your current skills and target roles.
- **Market Intelligence**: Real-time charts showing top in-demand skills, salary trends, and role distribution.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Framer Motion, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Python (Flask), MongoDB, spaCy (NLP), JWT.
- **Authentication**: Google OAuth 2.0, SMTP (Gmail) for OTP.

## 📂 Project Structure

- `/frontend/frontend`: React application (Vite).
- `/backend`: Flask API server and NLP logic.

## 🚦 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 2. Frontend Setup
```bash
cd frontend/frontend
npm install
npm run dev
```

## 📄 License
MIT License
