from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import spacy
from spacy.matcher import PhraseMatcher
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import pdfplumber
from collections import Counter
from datetime import datetime
import jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")

client = MongoClient(MONGO_URI)
db = client["jobpulse_db"]
jobs_collection = db["jobs"]
users_collection = db["users"]
activity_logs = db["activity_logs"]
otp_collection = db["otp_codes"]
# Create TTL index for OTPs (expire after 5 mins)
try:
    otp_collection.create_index("created_at", expireAfterSeconds=600)
except Exception:
    pass
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Load NLP model once
nlp = spacy.load("en_core_web_sm")


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def _normalize_skills(skills):
    """Lowercase, strip and deduplicate skills while preserving order."""
    seen = set()
    cleaned = []
    for s in skills:
        s_norm = (s or "").strip().lower()
        if not s_norm:
            continue
        if s_norm not in seen:
            seen.add(s_norm)
            cleaned.append(s_norm)
    return cleaned


def _skill_vocabulary():
    """Build a vocabulary from static list + skills already in jobs collection."""
    static = [
        "python", "react", "sql", "machine learning", "data analysis",
        "excel", "power bi", "flask", "mongodb", "javascript", "html",
        "css", "statistics", "node.js", "express", "typescript", "docker",
        "kubernetes", "aws", "gcp", "azure", "postgresql", "mysql",
        "redis", "graphql", "rest api", "git", "linux", "pandas",
        "numpy", "scikit-learn", "tensorflow", "pytorch", "nlp",
        "deep learning", "data visualization", "tableau", "spark",
        "hadoop", "figma", "next.js", "vue.js", "angular", "django",
        "fastapi", "ci/cd", "jenkins", "terraform", "ansible",
        "kotlin", "swift", "android", "ios", "flutter", "react native",
        "dart", "java", "objective-c", "xcode", "android studio",
        "gradle", "coroutine", "jetpack compose", "uikit", "firebase"
    ]
    from_jobs = set()
    for job in jobs_collection.find({}, {"skills": 1, "_id": 0}):
        for s in job.get("skills", []):
            from_jobs.add((s or "").lower())

    try:
        skills_catalog = db["skills_catalog"]
        for doc in skills_catalog.find({}, {"name": 1, "aliases": 1, "_id": 0}):
            name = (doc.get("name") or "").lower()
            if name:
                from_jobs.add(name)
            for alias in doc.get("aliases", []):
                from_jobs.add((alias or "").lower())
    except Exception:
        pass

    return _normalize_skills(static + list(from_jobs))


def _extract_skills_from_text(text: str):
    """
    Robust extractor combining:
    - spaCy PhraseMatcher over our vocabulary (multi-word, case-insensitive)
    - spaCy entities (if a custom SKILL NER model is loaded)
    - Fallback substring matching against the vocabulary
    """
    if not text:
        return []

    vocab = _skill_vocabulary()
    doc = nlp(text)

    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(term) for term in vocab]
    matcher.add("SKILL", patterns)

    hits = set()

    for _, start, end in matcher(doc):
        span = doc[start:end].text.lower()
        hits.add(span)

    for ent in doc.ents:
        if ent.label_.lower() in {"skill", "tech", "tool"}:
            hits.add(ent.text.lower())

    text_lower = text.lower()
    for term in vocab:
        if term in text_lower:
            hits.add(term)

    return _normalize_skills(list(hits))


def _get_bearer_token():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.replace("Bearer ", "", 1).strip()
    return None


def _decode_jwt(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None


def _current_email():
    token = _get_bearer_token()
    if not token:
        return None
    payload = _decode_jwt(token)
    return payload.get("email") if payload else None


def _require_auth_email():
    email = _current_email()
    if not email:
        return None, (jsonify({"error": "Unauthorized"}), 401)
    return email, None


# ─────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({"message": "Job Market AI backend running 🚀"})


@app.route("/test-db")
def test_db():
    try:
        client.admin.command("ping")
        return jsonify({"message": "MongoDB Connected Successfully 🚀"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/upload-resume", methods=["POST"])
def upload_resume():
    file = request.files.get("file")
    email = _current_email() or request.form.get("email")

    if not file or not email:
        return jsonify({"error": "File and email are required"}), 400

    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500

    extracted = _extract_skills_from_text(text)

    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "email": email,
                "skills": extracted,
                "updated_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )

    try:
        activity_logs.insert_one({
            "type": "resume_upload",
            "email": email,
            "raw_text_chars": len(text),
            "extracted_skills": extracted,
            "created_at": datetime.utcnow(),
        })
    except Exception:
        pass

    return jsonify({
        "message": "Resume processed successfully",
        "skills": extracted,
    })


@app.route("/save-user-skills", methods=["POST"])
def save_user_skills():
    data = request.json
    email = _current_email() or data.get("email")
    skills = data.get("skills", [])

    if not email:
        return jsonify({"error": "Email is required"}), 400

    normalized = _normalize_skills(skills)

    users_collection.update_one(
        {"email": email},
        {"$set": {"skills": normalized, "updated_at": datetime.utcnow()}},
        upsert=True,
    )

    try:
        activity_logs.insert_one({
            "type": "manual_skill_update",
            "email": email,
            "skills": normalized,
            "created_at": datetime.utcnow(),
        })
    except Exception:
        pass

    return jsonify({"message": "User skills saved successfully", "skills": normalized})


@app.route("/get-user", methods=["GET"])
def get_user():
    """Return a user's stored profile by email."""
    email = _current_email() or request.args.get("email", "").strip()
    if not email:
        return jsonify({"error": "Email query parameter is required"}), 400

    user = users_collection.find_one({"email": email}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "email": user.get("email"),
        "skills": user.get("skills", []),
        "roadmap": user.get("roadmap"),
        "updated_at": str(user.get("updated_at", "")),
    })


@app.route("/recommend-jobs", methods=["POST"])
def recommend_jobs():
    data = request.json
    email = _current_email() or data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = users_collection.find_one({"email": email}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found. Please save your skills first."}), 404

    user_skills = _normalize_skills(user.get("skills", []))
    jobs = list(jobs_collection.find({}, {"_id": 0}))

    if not jobs:
        return jsonify({"error": "No jobs in database. Please seed jobs first via /seed-jobs"}), 404

    recommendations = []
    all_missing = set()

    for job in jobs:
        role = job.get("role", "Unknown")
        skills = _normalize_skills(job.get("skills", []))

        matched = len(set(user_skills) & set(skills))
        total = len(skills) or 1
        score = round((matched / total) * 100, 1)

        missing_skills = sorted(set(skills) - set(user_skills))
        all_missing.update(missing_skills)

        recommendations.append({
            "role": role,
            "match": score,
            "missingSkills": missing_skills,
        })

    recommendations.sort(key=lambda x: x["match"], reverse=True)

    best = recommendations[0] if recommendations else None
    stats = {
        "totalSkills": len(user_skills),
        "bestRole": best["role"] if best else None,
        "bestMatchPercentage": best["match"] if best else 0.0,
        "skillGapCount": len(all_missing),
        "profileCompletion": min(100, len(user_skills) * 5),
    }

    return jsonify({
        "email": email,
        "skills": user_skills,
        "recommendations": recommendations,
        "stats": stats,
    })


@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    data = request.json
    email = _current_email() or data.get("email")
    target_role = data.get("target_role")

    if not email or not target_role:
        return jsonify({"error": "Email and target_role are required"}), 400

    user = users_collection.find_one({"email": email}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found. Please save your skills first."}), 404

    user_skills = _normalize_skills(user.get("skills", []))

    job = jobs_collection.find_one(
        {"role": {"$regex": f"^{target_role}$", "$options": "i"}},
        {"_id": 0}
    )
    if not job:
        return jsonify({"error": f"Role '{target_role}' not found in our database."}), 404

    required_skills = _normalize_skills(job.get("skills", []))
    missing_skills = sorted(set(required_skills) - set(user_skills))

    if not missing_skills:
        # All skills already matched — empty roadmap
        steps = [{
            "id": 1,
            "title": "You're already qualified!",
            "duration": "—",
            "description": f"Your skill set already covers all requirements for {target_role}. Consider applying now or exploring advanced certifications.",
            "skills": required_skills,
            "completed": False,
        }]
    else:
        resource_map = {
            "python": "python.org/doc, Real Python, freeCodeCamp",
            "react": "react.dev, Scrimba React Course",
            "sql": "SQLZoo, Mode Analytics SQL Tutorial",
            "machine learning": "fast.ai, Coursera ML Specialization",
            "data analysis": "Kaggle Learn, Pandas documentation",
            "excel": "Microsoft Excel training, Chandoo.org",
            "power bi": "Microsoft Learn Power BI, SQLBI",
            "flask": "Flask official docs, Miguel Grinberg Flask Mega-Tutorial",
            "mongodb": "MongoDB University, official docs",
            "javascript": "javascript.info, MDN Web Docs",
            "docker": "Docker official tutorial, Play with Docker",
            "kubernetes": "kubernetes.io/docs, KodeKloud",
            "aws": "AWS Skill Builder, A Cloud Guru",
            "node.js": "nodejs.dev, The Odin Project",
            "typescript": "typescriptlang.org, Execute Program",
            "postgresql": "postgresqltutorial.com, official docs",
            "django": "djangoproject.com tutorial, Django Girls",
            "fastapi": "fastapi.tiangolo.com, TestDriven.io",
            "tensorflow": "tensorflow.org/learn, DeepLearning.AI",
            "pytorch": "pytorch.org/tutorials, fast.ai",
            "figma": "Figma Learn, DesignCourse on YouTube",
        }

        steps = []
        for idx, skill in enumerate(missing_skills, start=1):
            resources = resource_map.get(skill, f"Search: '{skill} tutorial' on YouTube or freeCodeCamp")
            steps.append({
                "id": idx,
                "title": f"Learn {skill.title()}",
                "duration": "2-3 weeks",
                "description": (
                    f"Master the fundamentals of {skill}, complete at least 2 hands-on tutorials, "
                    f"and build one mini-project that demonstrates your understanding."
                ),
                "skills": [skill],
                "resources": resources,
                "completed": False,
            })

    roadmap = {"role": target_role, "steps": steps}

    users_collection.update_one(
        {"email": email},
        {"$set": {"roadmap": roadmap, "updated_at": datetime.utcnow()}},
        upsert=True,
    )

    return jsonify({"email": email, "roadmap": roadmap})


@app.route("/skill-gap", methods=["POST"])
def skill_gap():
    """Compare user skills against a target role and return missing skills."""
    data = request.json
    user_skills = _normalize_skills(data.get("user_skills", []))
    target_role = (data.get("target_role", "")).strip().lower()

    if not target_role:
        return jsonify({"error": "target_role is required"}), 400

    job = jobs_collection.find_one(
        {"role": {"$regex": f"^{target_role}$", "$options": "i"}},
        {"_id": 0}
    )
    if not job:
        return jsonify({"error": f"Role '{target_role}' not found"}), 404

    required_skills = _normalize_skills(job.get("skills", []))
    missing_skills = sorted(set(required_skills) - set(user_skills))
    matched_skills = sorted(set(required_skills) & set(user_skills))

    return jsonify({
        "target_role": target_role,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_percentage": round(len(matched_skills) / len(required_skills) * 100, 1) if required_skills else 0,
    })


@app.route("/job-trends", methods=["GET"])
def job_trends():
    """Return dynamic skill and role analytics based on the jobs collection."""
    jobs = list(jobs_collection.find({}, {"_id": 0}))

    skill_counter = Counter()
    role_counter = Counter()

    for job in jobs:
        role = job.get("role", "Unknown")
        role_counter[role] += 1
        for s in job.get("skills", []):
            skill_counter[(s or "").lower()] += 1

    top_skills = [
        {"name": skill.title(), "demand": count}
        for skill, count in skill_counter.most_common(10)
    ]

    role_distribution = [
        {"name": role.title(), "value": count}
        for role, count in role_counter.items()
    ]

    total_jobs = max(len(jobs), 1)
    base_salary = 60000 + total_jobs * 500
    salary_trend = [
        {"year": year, "average": base_salary + idx * 4500}
        for idx, year in enumerate(["2022", "2023", "2024", "2025", "2026"])
    ]

    return jsonify({
        "topSkills": top_skills,
        "roleDistribution": role_distribution,
        "salaryTrend": salary_trend,
    })


@app.route("/sync-live-jobs", methods=["POST"])
def sync_live_jobs():
    """Fetch jobs from Remotive API and sync with local DB."""
    try:
        url = "https://remotive.com/api/remote-jobs?limit=50"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        jobs_list = data.get("jobs", [])

        synced_count = 0
        for job_data in jobs_list:
            role = (job_data.get("title") or "Unknown").lower()
            description = job_data.get("description") or ""
            # Extract skills from description
            extracted_skills = _extract_skills_from_text(description)
            # Merge with tags from Remotive
            tags = [t.lower() for t in job_data.get("tags", [])]
            final_skills = _normalize_skills(extracted_skills + tags)

            # Use (title, company_name) as a unique identifier for upsert
            company = job_data.get("company_name", "Unknown")
            external_id = str(job_data.get("id"))

            jobs_collection.update_one(
                {"external_id": external_id},
                {
                    "$set": {
                        "role": role,
                        "company": company,
                        "skills": final_skills,
                        "source": "remotive",
                        "url": job_data.get("url"),
                        "updated_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            synced_count += 1

        return jsonify({
            "message": f"Successfully synced {synced_count} live jobs",
            "count": synced_count,
            "last_sync": datetime.utcnow().isoformat()
        })

    except Exception as e:
        print(f"Sync error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/show-jobs")
def show_jobs():
    jobs = list(jobs_collection.find({}, {"_id": 0}))
    return jsonify({"jobs": jobs, "count": len(jobs)})


@app.route("/seed-jobs")
def seed_jobs():
    """Seed database with a comprehensive set of job roles for testing."""
    sample_jobs = [
        {
            "role": "data analyst",
            "skills": ["python", "sql", "excel", "statistics", "power bi", "data visualization", "pandas", "tableau"]
        },
        {
            "role": "frontend developer",
            "skills": ["react", "javascript", "html", "css", "typescript", "next.js", "figma", "git"]
        },
        {
            "role": "backend developer",
            "skills": ["python", "flask", "mongodb", "sql", "rest api", "docker", "git", "postgresql"]
        },
        {
            "role": "full stack engineer",
            "skills": ["react", "node.js", "javascript", "mongodb", "postgresql", "docker", "git", "rest api", "typescript"]
        },
        {
            "role": "machine learning engineer",
            "skills": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "sql"]
        },
        {
            "role": "data scientist",
            "skills": ["python", "machine learning", "statistics", "pandas", "numpy", "scikit-learn", "data visualization", "sql", "nlp"]
        },
        {
            "role": "devops engineer",
            "skills": ["docker", "kubernetes", "aws", "linux", "ci/cd", "terraform", "git", "ansible", "python"]
        },
        {
            "role": "cloud engineer",
            "skills": ["aws", "gcp", "azure", "docker", "kubernetes", "terraform", "linux", "python", "ci/cd"]
        },
        {
            "role": "android developer",
            "skills": ["android", "kotlin", "java", "android studio", "gradle", "coroutine", "jetpack compose", "firebase", "git"]
        },
        {
            "role": "ios developer",
            "skills": ["ios", "swift", "objective-c", "xcode", "uikit", "swiftui", "firebase", "git"]
        },
        {
            "role": "mobile engineer",
            "skills": ["flutter", "react native", "dart", "javascript", "typescript", "android", "ios", "git", "firebase"]
        },
        {
            "role": "ui/ux designer",
            "skills": ["figma", "html", "css", "javascript", "data visualization", "react"]
        },
        {
            "role": "data engineer",
            "skills": ["python", "sql", "spark", "hadoop", "aws", "postgresql", "mongodb", "docker", "airflow"]
        },
    ]

    jobs_collection.delete_many({})
    jobs_collection.insert_many(sample_jobs)

    return jsonify({"message": f"{len(sample_jobs)} jobs seeded successfully", "roles": [j["role"] for j in sample_jobs]})


def send_otp_email(receiver_email, otp):
    """Send an OTP email using SMTP."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print(f"WARNING: SMTP credentials not set. OTP for {receiver_email} is {otp}")
        return False

    msg = MIMEMultipart()
    msg['From'] = f"Elevate AI <{SMTP_EMAIL}>"
    msg['To'] = receiver_email
    msg['Subject'] = f"{otp} is your Elevate AI verification code"

    body = f"""
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0ea5e9;">Elevate AI</h2>
        <p>Hello,</p>
        <p>Use the following code to sign in to your Elevate AI account. This code will expire in 5 minutes.</p>
        <div style="background: #f0f9ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0369a1; border-radius: 8px; margin: 20px 0;">
            {otp}
        </div>
        <p style="color: #64748b; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
    </div>
    """
    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"FAILED TO SEND EMAIL: {e}")
        return False


@app.route("/auth/send-otp", methods=["POST"])
def send_otp():
    """Generate and 'send' (log) a 6-digit OTP for email login."""
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = str(random.randint(100000, 999999))
    now = datetime.utcnow()

    # Store OTP (overwrite any existing for this email)
    otp_collection.update_one(
        {"email": email},
        {"$set": {"code": otp, "created_at": now}},
        upsert=True
    )

    # Send actual email
    sent = send_otp_email(email, otp)
    
    if not sent:
        # Fallback to console for debugging if SMTP fails
        print(f"\nFALLBACK OTP FOR {email}: {otp}\n")

    return jsonify({"message": "OTP sent successfully. Check your email inbox."})


@app.route("/auth/verify-otp", methods=["POST"])
def verify_otp():
    """Verify OTP and issue JWT."""
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    code = (data.get("code") or "").strip()

    if not email or not code:
        return jsonify({"error": "Email and code are required"}), 400

    print(f"DEBUG: Verifying OTP for {email}. Provided code: {code}")
    record = otp_collection.find_one({"email": email, "code": code})
    
    if not record:
        actual = otp_collection.find_one({"email": email})
        if actual:
            print(f"DEBUG: Mismatch! DB has {actual['code']} for {email}")
        else:
            print(f"DEBUG: No OTP record found for {email} in DB")
        return jsonify({"error": "Invalid or expired OTP"}), 401

    # Upsert user
    now = datetime.utcnow()
    users_collection.update_one(
        {"email": email},
        {
            "$set": {"email": email, "updated_at": now},
            "$setOnInsert": {"created_at": now, "skills": [], "roadmap": None, "name": email.split("@")[0]}
        },
        upsert=True
    )

    user = users_collection.find_one({"email": email})

    # Generate Token
    token = jwt.encode(
        {
            "email": email,
            "name": user.get("name"),
            "iat": int(now.timestamp()),
        },
        JWT_SECRET,
        algorithm="HS256",
    )

    # OTP matches! Clear it now that we've issued the token.
    otp_collection.delete_one({"_id": record["_id"]})
    print(f"DEBUG: Successfully verified OTP for {email}")

    return jsonify({"token": token})


@app.route("/auth/google", methods=["POST"])
def auth_google():
    """
    Frontend sends Google Identity Services ID token in `credential`.
    We verify it, upsert user, then issue our own JWT for API auth.
    """
    data = request.json or {}
    credential = data.get("credential")

    if not credential:
        return jsonify({"error": "Missing credential"}), 400
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Server misconfigured: GOOGLE_CLIENT_ID not set"}), 500

    print(f"DEBUG: Attempting Google Auth. Client ID in use: {GOOGLE_CLIENT_ID}")

    try:
        info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
        print(f"DEBUG: Google Auth Success for {info.get('email')}")
    except Exception as e:
        print(f"DEBUG: Google Auth Failed: {str(e)}")
        return jsonify({"error": "Invalid Google token"}), 401

    email = info.get("email")
    name = info.get("name")
    picture = info.get("picture")

    if not email:
        return jsonify({"error": "Google token missing email"}), 401

    now = datetime.utcnow()
    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "email": email,
                "name": name,
                "picture": picture,
                "updated_at": now,
            },
            "$setOnInsert": {
                "created_at": now,
                "skills": [],
                "roadmap": None,
            },
        },
        upsert=True,
    )

    token = jwt.encode(
        {
            "email": email,
            "name": name,
            "picture": picture,
            "iat": int(now.timestamp()),
        },
        JWT_SECRET,
        algorithm="HS256",
    )

    return jsonify({"token": token})


@app.route("/me", methods=["GET"])
def me():
    email, err = _require_auth_email()
    if err:
        return err

    user = users_collection.find_one({"email": email}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": {
            "email": user.get("email"),
            "name": user.get("name"),
            "picture": user.get("picture"),
        }
    })


if __name__ == "__main__":
    app.run(debug=True)
