from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from spacy.matcher import PhraseMatcher
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import pdfplumber
from collections import Counter
from datetime import datetime


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["jobpulse_db"]
jobs_collection = db["jobs"]
users_collection = db["users"]
activity_logs = db["activity_logs"]
app = Flask(__name__)
CORS(app)

# Load NLP model once
nlp = spacy.load("en_core_web_sm")


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
        "python",
        "react",
        "sql",
        "machine learning",
        "data analysis",
        "excel",
        "power bi",
        "flask",
        "mongodb",
        "javascript",
        "html",
        "css",
        "statistics",
    ]
    from_jobs = set()
    for job in jobs_collection.find({}, {"skills": 1, "_id": 0}):
        for s in job.get("skills", []):
            from_jobs.add((s or "").lower())

    # Optional: extend with curated catalog if you add one later
    try:
        skills_catalog = db["skills_catalog"]
        for doc in skills_catalog.find({}, {"name": 1, "aliases": 1, "_id": 0}):
            name = (doc.get("name") or "").lower()
            if name:
                from_jobs.add(name)
            for alias in doc.get("aliases", []):
                from_jobs.add((alias or "").lower())
    except Exception:
        # Fail gracefully if collection doesn't exist yet
        pass

    return _normalize_skills(static + list(from_jobs))


def _extract_skills_from_text(text: str):
    """
    Robust extractor that combines:
    - spaCy PhraseMatcher over our vocabulary (multi-word, case-insensitive)
    - spaCy entities (if you train a custom SKILL NER model later)
    - Fallback substring matching against the vocabulary
    """
    if not text:
        return []

    vocab = _skill_vocabulary()
    doc = nlp(text)

    # PhraseMatcher for exact/alias phrases
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(term) for term in vocab]
    matcher.add("SKILL", patterns)

    hits = set()

    for _, start, end in matcher(doc):
        span = doc[start:end].text.lower()
        hits.add(span)

    # Use any SKILL-like entities from a custom model if present
    for ent in doc.ents:
        if ent.label_.lower() in {"skill", "tech", "tool"}:
            hits.add(ent.text.lower())

    # Fallback: simple substring search for anything in vocab that appears in raw text
    text_lower = text.lower()
    for term in vocab:
        if term in text_lower:
            hits.add(term)

    return _normalize_skills(list(hits))


@app.route("/upload-resume", methods=["POST"])
def upload_resume():
    file = request.files.get("file")
    email = request.form.get("email")

    if not file or not email:
        return {"error": "File and email required"}, 400

    # Extract text from PDF
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500

    # Run advanced extractor
    extracted = _extract_skills_from_text(text)

    # Save skills to user
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

    # Log activity to enable future model training
    try:
        activity_logs.insert_one(
            {
                "type": "resume_upload",
                "email": email,
                "raw_text_chars": len(text),
                "extracted_skills": extracted,
                "created_at": datetime.utcnow(),
            }
        )
    except Exception:
        # Do not break main flow if logging fails
        pass

    return jsonify(
        {
            "message": "Resume processed successfully",
            "skills": extracted,
        }
    )

@app.route("/")
def home():
    return jsonify({"message": "Backend running successfully 🚀"})

@app.route("/extract-skills", methods=["POST"])
def extract_skills():
    data = request.json
    text = data.get("text", "").lower()

    # Predefined skill list (expand later)
    skill_list = [
        "python",
        "react",
        "sql",
        "machine learning",
        "data analysis",
        "flask",
        "mongodb",
        "javascript"
    ]

    extracted = []

    for skill in skill_list:
        if skill in text:
            extracted.append(skill)

    return jsonify({
        "extracted_skills": extracted
    })


@app.route("/skill-gap", methods=["POST"])
def skill_gap():
    data = request.json
    
    user_skills = [skill.lower() for skill in data.get("user_skills", [])]
    target_role = data.get("target_role", "").lower()

    # Example job database (temporary)
    job_roles = {
        "data analyst": ["python", "sql", "excel", "statistics", "power bi"],
        "frontend developer": ["react", "javascript", "html", "css"],
        "backend developer": ["python", "flask", "mongodb", "sql"]
    }

    if target_role not in job_roles:
        return jsonify({"error": "Role not found"}), 400

    required_skills = job_roles[target_role]

    missing_skills = list(set(required_skills) - set(user_skills))

    return jsonify({
        "target_role": target_role,
        "missing_skills": missing_skills
    })


@app.route("/recommend-jobs", methods=["POST"])
def recommend_jobs():
    data = request.json
    email = data.get("email")

    if not email:
        return {"error": "Email required"}, 400

    user = users_collection.find_one({"email": email}, {"_id": 0})

    if not user:
        return {"error": "User not found"}, 404

    user_skills = user.get("skills", [])

    jobs = list(jobs_collection.find({}, {"_id": 0}))

    recommendations = []
    all_missing = set()

    for job in jobs:
        role = job["role"]
        skills = _normalize_skills(job.get("skills", []))

        matched = len(set(user_skills) & set(skills))
        total = len(skills) or 1
        score = round((matched / total) * 100, 2)

        missing_skills = list(set(skills) - set(user_skills))
        all_missing.update(missing_skills)

        recommendations.append({
            "role": role,
            "match": score,
            "missingSkills": sorted(missing_skills),
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
    email = data.get("email")
    target_role = data.get("target_role")

    if not email or not target_role:
        return {"error": "Email and target_role required"}, 400

    user = users_collection.find_one({"email": email}, {"_id": 0})

    if not user:
        return {"error": "User not found"}, 404

    user_skills = user.get("skills", [])

    job = jobs_collection.find_one({"role": target_role}, {"_id": 0})

    if not job:
        return {"error": "Role not found"}, 404

    required_skills = job.get("skills", [])

    missing_skills = list(set(required_skills) - set(user_skills))

    # Build structured roadmap with steps the frontend can render
    steps = []
    for idx, skill in enumerate(sorted(missing_skills), start=1):
        steps.append({
            "id": idx,
            "title": f"Learn {skill}",
            "duration": "2 weeks",
            "description": f"Study {skill} fundamentals, complete at least 2 tutorials, and build one mini-project using {skill}.",
            "skills": [skill],
            "completed": False,
        })

    roadmap = {
        "role": target_role,
        "steps": steps,
    }

    users_collection.update_one(
        {"email": email},
        {"$set": {"roadmap": roadmap, "updated_at": datetime.utcnow()}},
        upsert=True,
    )

    return jsonify({
        "email": email,
        "roadmap": roadmap,
    })
@app.route("/show-jobs")
def show_jobs():
    jobs = list(jobs_collection.find({}, {"_id": 0}))
    return jsonify({"jobs": jobs})


@app.route("/test-db")
def test_db():
    try:
        client.admin.command('ping')
        return jsonify({"message": "MongoDB Connected Successfully 🚀"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/seed-jobs")
def seed_jobs():
    sample_jobs = [
        {
            "role": "data analyst",
            "skills": ["python", "sql", "excel", "statistics", "power bi"]
        },
        {
            "role": "frontend developer",
            "skills": ["react", "javascript", "html", "css"]
        },
        {
            "role": "backend developer",
            "skills": ["python", "flask", "mongodb", "sql"]
        }
    ]

    jobs_collection.delete_many({})
    jobs_collection.insert_many(sample_jobs)

    return jsonify({"message": "Jobs seeded successfully"})

@app.route("/save-user-skills", methods=["POST"])
def save_user_skills():
    data = request.json
    email = data.get("email")
    skills = data.get("skills", [])

    if not email:
        return {"error": "Email required"}, 400

    normalized = _normalize_skills(skills)

    users_collection.update_one(
        {"email": email},
        {"$set": {"skills": normalized, "updated_at": datetime.utcnow()}},
        upsert=True
    )

    # Log manual edits to support future training
    try:
        activity_logs.insert_one(
            {
                "type": "manual_skill_update",
                "email": email,
                "skills": normalized,
                "created_at": datetime.utcnow(),
            }
        )
    except Exception:
        pass

    return jsonify({"message": "User skills saved successfully"})


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
        {"name": skill, "demand": count}
        for skill, count in skill_counter.most_common(10)
    ]

    role_distribution = [
        {"name": role, "value": count}
        for role, count in role_counter.items()
    ]

    total_jobs = max(len(jobs), 1)
    base_salary = 60000 + total_jobs * 500
    salary_trend = []
    for idx, year in enumerate(["2022", "2023", "2024", "2025", "2026"]):
        salary_trend.append({"year": year, "average": base_salary + idx * 4000})

    return jsonify({
        "topSkills": top_skills,
        "roleDistribution": role_distribution,
        "salaryTrend": salary_trend,
    })


if __name__ == "__main__":
    app.run(debug=True)





