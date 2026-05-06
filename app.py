from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, math, os, jwt, random, smtplib, json, re
from dotenv import load_dotenv
from pymongo import MongoClient
import pdfplumber
from collections import Counter
from datetime import datetime, timedelta
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
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
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
app = Flask(__name__)
CORS(app, supports_credentials=True)
def _call_gemini(prompt):
    if not GOOGLE_API_KEY:
        print("WARNING: GOOGLE_API_KEY not found. Skipping AI call.")
        return None
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            return data['candidates'][0]['content']['parts'][0]['text']
        else:
            print(f"Gemini API Error: {res.status_code} - {res.text}")
            return None
    except Exception as e:
        print(f"Gemini Request Failed: {e}")
        return None
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000, connectTimeoutMS=3000)
    db = client["jobpulse_db"]
except Exception as e:
    print(f"CRITICAL: Failed to initialize MongoDB client: {e}")
    db = None
jobs_collection = db["jobs"]
users_collection = db["users"]
activity_logs = db["activity_logs"]
otp_collection = db["otp_codes"]
try:
    otp_collection.create_index("created_at", expireAfterSeconds=600)
except Exception:
    pass
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except Exception:
    SPACY_AVAILABLE = False
    nlp = None
def _get_skill_categories():
    return {
        "computer_science": [
            "python", "javascript", "react", "sql", "machine learning", "data analysis",
            "html", "css", "node.js", "express", "typescript", "docker", "kubernetes",
            "aws", "gcp", "azure", "postgresql", "mysql", "redis", "graphql", "rest api",
            "git", "linux", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
            "nlp", "deep learning", "data visualization", "tableau", "spark", "hadoop",
            "figma", "next.js", "vue.js", "angular", "django", "fastapi", "ci/cd",
            "jenkins", "terraform", "ansible", "kotlin", "swift", "android", "ios",
            "flutter", "react native", "dart", "java", "objective-c", "xcode",
            "android studio", "gradle", "firebase", "mongodb", "flask"
        ],
        "engineering": [
            "chemical engineering", "biochemical engineering", "mechanical engineering",
            "electrical engineering", "civil engineering", "aerospace engineering",
            "biomedical engineering", "environmental engineering", "materials science",
            "thermodynamics", "fluid mechanics", "heat transfer", "mass transfer",
            "process design", "process control", "autocad", "solidworks", "matlab",
            "ansys", "catia", "pro/engineer", "labview", "aspen plus", "hysys",
            "chemical process safety", "distillation", "crystallization", "fermentation",
            "bioreactor design", "downstream processing", "manufacturing", "quality control",
            "lean six sigma", "project management", "cad design", "simulation"
        ],
        "medical_healthcare": [
            "anatomy", "physiology", "pathology", "pharmacology", "immunology",
            "clinical research", "medical diagnosis", "patient care", "medical imaging",
            "radiology", "cardiology", "neurology", "oncology", "surgery",
            "emergency medicine", "pediatrics", "geriatrics", "psychiatry",
            "nursing", "physical therapy", "occupational therapy", "pharmacy",
            "medical laboratory", "histology", "cytology", "hematology",
            "clinical chemistry", "medical ethics", "healthcare management",
            "biochemistry", "molecular biology", "microbiology", "cell culture",
            "protein purification", "enzyme kinetics", "metabolic engineering"
        ],
        "business_commerce": [
            "financial analysis", "accounting", "budgeting", "forecasting",
            "investment analysis", "risk management", "portfolio management",
            "financial modeling", "valuation", "mergers and acquisitions",
            "corporate finance", "banking", "insurance", "real estate",
            "project management", "strategic planning", "business development",
            "market research", "competitive analysis", "sales", "marketing",
            "digital marketing", "social media marketing", "content marketing",
            "seo", "sem", "email marketing", "brand management", "public relations",
            "customer relationship management", "supply chain management",
            "operations management", "quality management", "excel", "powerpoint"
        ],
        "science_research": [
            "analytical chemistry", "organic chemistry", "inorganic chemistry",
            "physical chemistry", "biochemistry", "molecular biology", "microbiology",
            "cell culture", "protein purification", "enzyme kinetics", "metabolic engineering",
            "chromatography", "spectroscopy", "research methodology", "statistical analysis",
            "data collection", "qualitative research", "quantitative research",
            "literature review", "academic writing", "grant writing", "peer review",
            "conference presentation", "laboratory techniques", "microscopy",
            "pcr", "western blot", "elisa", "mass spectrometry"
        ],
        "arts_design": [
            "graphic design", "web design", "ui/ux design", "product design",
            "industrial design", "interior design", "fashion design", "photography",
            "videography", "video editing", "animation", "3d modeling", "illustration",
            "typography", "color theory", "adobe photoshop", "adobe illustrator",
            "adobe indesign", "adobe after effects", "adobe premiere pro",
            "sketch", "figma", "invision", "principle", "framer", "cinema 4d",
            "blender", "maya", "3ds max", "zbrush", "substance painter",
            "creative thinking", "visual design", "branding", "layout design"
        ],
        "education": [
            "curriculum development", "lesson planning", "classroom management",
            "educational technology", "assessment design", "research methodology",
            "statistical analysis", "literature review", "academic writing",
            "grant writing", "peer review", "conference presentation",
            "teaching", "mentoring", "student engagement", "learning theory",
            "instructional design", "educational psychology", "pedagogy"
        ],
        "agriculture_environmental": [
            "crop science", "soil science", "plant pathology", "entomology",
            "agricultural economics", "farm management", "irrigation", "fertilizers",
            "pesticides", "sustainable agriculture", "organic farming", "hydroponics",
            "environmental science", "ecology", "conservation biology", "wildlife management",
            "environmental impact assessment", "pollution control", "waste management",
            "renewable energy", "solar energy", "wind energy", "geothermal energy",
            "gis", "remote sensing", "climate change", "sustainability"
        ],
        "psychology_social": [
            "cognitive psychology", "behavioral psychology", "developmental psychology",
            "social psychology", "clinical psychology", "counseling", "therapy",
            "psychological assessment", "research design", "statistical methods",
            "sociology", "anthropology", "political science", "international relations",
            "public policy", "social work", "community development", "human resources",
            "conflict resolution", "communication", "empathy", "active listening"
        ]
    }
def _detect_skill_category(skills):
    if not skills:
        return "general"
    categories = _get_skill_categories()
    category_scores = {}
    normalized_skills = [skill.lower().strip() for skill in skills]
    for category, category_skills in categories.items():
        score = 0
        for skill in normalized_skills:
            if skill in category_skills:
                score += 1
        if len(normalized_skills) > 0:
            category_scores[category] = (score / len(normalized_skills)) * 100
    if category_scores:
        best_category = max(category_scores, key=category_scores.get)
        best_score = category_scores[best_category]
        if best_score >= 20:
            return best_category
    return "general"
def _get_category_display_name(category):
    display_names = {
        "computer_science": "Computer Science & Technology",
        "engineering": "Engineering",
        "medical_healthcare": "Medical & Healthcare",
        "business_commerce": "Business & Commerce",
        "science_research": "Science & Research",
        "arts_design": "Arts & Design",
        "education": "Education",
        "agriculture_environmental": "Agriculture & Environmental",
        "psychology_social": "Psychology & Social Sciences",
        "general": "General"
    }
    return display_names.get(category, "General")
def _normalize_skills(skills):
    standard_map = {
        "physics": "analytical science",
        "mathematics": "quantitative reasoning",
        "math": "quantitative reasoning",
        "programming": "software development",
        "coding": "software development",
        "stats": "statistical analysis",
        "statistics": "statistical analysis",
        "ml": "machine learning",
        "ai": "artificial intelligence",
        "dl": "deep learning"
    }
    seen = set()
    cleaned = []
    for s in skills:
        s_norm = (s or "").strip().lower()
        if not s_norm:
            continue
        s_norm = standard_map.get(s_norm, s_norm)
        if s_norm not in seen:
            seen.add(s_norm)
            cleaned.append(s_norm)
    return cleaned
def _skill_vocabulary():
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
        "gradle", "coroutine", "jetpack compose", "uikit", "firebase",
        "retrofit", "dagger", "hilt", "room database", "mvvm", "mvc", "mvi",
        "clean architecture", "unit testing", "espresso", "mockito", "junit",
        "bitbucket", "github", "gitlab", "jira", "agile", "scrum", "kanban",
        "material design", "google play store", "app store connect", "bash",
        "shell scripting", "powershell", "terraform", "prometheus", "grafana",
        "elk stack", "elasticsearch", "logstash", "kibana", "rabbitmq", "kafka",
        "sqlite", "realm", "apollo", "redux", "mobx", "context api", "tailwind",
        "bootstrap", "sass", "less", "webpack", "vite", "babel", "npm", "yarn",
        "pnpm", "ruby", "rails", "php", "laravel", "symfony", "c++", "c
        "asp.net", "go", "golang", "rust", "scala", "clojure", "elixir", "erlang",
        "haskell", "perl", "r language", "solidity", "web3", "blockchain",
        "smart contracts", "cybersecurity", "penetration testing", "ethical hacking",
        "firewalls", "vpn", "wireshark", "metasploit", "cryptography", "active directory",
        "network security", "cloud security", "devsecops", "data engineering",
        "data warehousing", "snowflake", "bigquery", "redshift", "airflow", "presto",
        "dbt", "looker", "sap", "oracle", "salesforce", "servicenow", "tableau",
        "chemical engineering", "biochemical engineering", "mechanical engineering",
        "electrical engineering", "civil engineering", "aerospace engineering",
        "biomedical engineering", "environmental engineering", "materials science",
        "thermodynamics", "fluid mechanics", "heat transfer", "mass transfer",
        "process design", "process control", "autocad", "solidworks", "matlab",
        "ansys", "catia", "pro/engineer", "labview", "aspen plus", "hysys",
        "chemical process safety", "distillation", "crystallization", "fermentation",
        "bioreactor design", "downstream processing", "chromatography", "spectroscopy",
        "analytical chemistry", "organic chemistry", "inorganic chemistry",
        "physical chemistry", "biochemistry", "molecular biology", "microbiology",
        "cell culture", "protein purification", "enzyme kinetics", "metabolic engineering",
        "anatomy", "physiology", "pathology", "pharmacology", "immunology",
        "clinical research", "medical diagnosis", "patient care", "medical imaging",
        "radiology", "cardiology", "neurology", "oncology", "surgery",
        "emergency medicine", "pediatrics", "geriatrics", "psychiatry",
        "nursing", "physical therapy", "occupational therapy", "pharmacy",
        "medical laboratory", "histology", "cytology", "hematology",
        "clinical chemistry", "medical ethics", "healthcare management",
        "financial analysis", "accounting", "budgeting", "forecasting",
        "investment analysis", "risk management", "portfolio management",
        "financial modeling", "valuation", "mergers and acquisitions",
        "corporate finance", "banking", "insurance", "real estate",
        "project management", "strategic planning", "business development",
        "market research", "competitive analysis", "sales", "marketing",
        "digital marketing", "social media marketing", "content marketing",
        "seo", "sem", "email marketing", "brand management", "public relations",
        "customer relationship management", "supply chain management",
        "operations management", "quality management", "lean six sigma",
        "graphic design", "web design", "ui/ux design", "product design",
        "industrial design", "interior design", "fashion design", "photography",
        "videography", "video editing", "animation", "3d modeling", "illustration",
        "typography", "color theory", "adobe photoshop", "adobe illustrator",
        "adobe indesign", "adobe after effects", "adobe premiere pro",
        "sketch", "figma", "invision", "principle", "framer", "cinema 4d",
        "blender", "maya", "3ds max", "zbrush", "substance painter",
        "curriculum development", "lesson planning", "classroom management",
        "educational technology", "assessment design", "research methodology",
        "statistical analysis", "literature review", "academic writing",
        "grant writing", "peer review", "conference presentation",
        "data collection", "qualitative research", "quantitative research",
        "survey design", "interview techniques", "focus groups",
        "legal research", "case analysis", "contract law", "corporate law",
        "criminal law", "civil law", "constitutional law", "intellectual property",
        "patent law", "trademark law", "litigation", "mediation", "arbitration",
        "legal writing", "court procedures", "legal ethics", "compliance",
        "crop science", "soil science", "plant pathology", "entomology",
        "agricultural economics", "farm management", "irrigation", "fertilizers",
        "pesticides", "sustainable agriculture", "organic farming", "hydroponics",
        "environmental science", "ecology", "conservation biology", "wildlife management",
        "environmental impact assessment", "pollution control", "waste management",
        "renewable energy", "solar energy", "wind energy", "geothermal energy",
        "cognitive psychology", "behavioral psychology", "developmental psychology",
        "social psychology", "clinical psychology", "counseling", "therapy",
        "psychological assessment", "research design", "statistical methods",
        "sociology", "anthropology", "political science", "international relations",
        "public policy", "social work", "community development", "human resources",
        "journalism", "creative writing", "technical writing", "copywriting",
        "editing", "proofreading", "broadcasting", "podcasting", "radio production",
        "television production", "film production", "documentary making",
        "social media management", "content creation", "storytelling",
        "public speaking", "presentation skills", "media relations",
        "english", "spanish", "french", "german", "chinese", "japanese",
        "arabic", "portuguese", "russian", "italian", "korean", "hindi",
        "translation", "interpretation", "linguistics", "phonetics", "syntax",
        "semantics", "pragmatics", "sociolinguistics", "psycholinguistics",
        "exercise physiology", "kinesiology", "sports medicine", "nutrition",
        "fitness training", "strength conditioning", "athletic performance",
        "sports psychology", "biomechanics", "injury prevention", "rehabilitation",
        "coaching", "sports management", "event management", "facility management"
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
    if not text:
        return []
    vocab = _skill_vocabulary()
    hits = set()
    if SPACY_AVAILABLE and nlp:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_.lower() in {"skill", "tech", "tool", "org", "product"}:
                val = ent.text.lower().strip()
                if val in vocab or len(val) < 20: 
                    hits.add(val)
    else:
        words = set(re.findall(r'\b\w+\b', text.lower()))
        for word in words:
            if word in vocab:
                hits.add(word)
    import re
    text_lower = text.lower()
    tech_patterns = [
        r'\b\w+\.js\b', r'\b\w+js\b', r'\b\w+stack\b',
        r'\b.net\b', r'\bc
        r'\bvaadin\b', r'\bspring boot\b', r'\bjetpack compose\b',
        r'\bmvvm\b', r'\bmvc\b', r'\bmvi\b', r'\bkotlin\b', r'\bswift\b',
        r'\brxjava\b', r'\brxkotlin\b', r'\bdagger2?\b', r'\bhilt\b',
        r'\bretrofit\b', r'\bokhttp\b', r'\bcoroutine\b'
    ]
    for p in tech_patterns:
        for match in re.findall(p, text_lower):
            hits.add(match)
    for term in vocab:
        if re.search(rf'\b{re.escape(term)}\b', text_lower):
            hits.add(term)
    lines = text.split('\n')
    skill_sections = ["skills", "technologies", "proficiencies", "experience", "tools"]
    in_skill_section = False
    for line in lines:
        l_lower = line.lower()
        if any(s in l_lower for s in skill_sections) and len(line) < 30:
            in_skill_section = True
            continue
        if in_skill_section:
            found = re.findall(r'\b[A-Z][a-zA-Z0-9+
            for f in found:
                if len(f) > 2 and f.lower() not in {"the", "and", "with", "from"}:
                    hits.add(f.lower())
            if len(line.strip()) == 0:
                in_skill_section = False
    if GOOGLE_API_KEY:
        try:
            if len(text) > 100:
                prompt = f"Extract all technical skills, programming languages, and professional competencies from the following resume text. Return ONLY a comma-separated list of skills, no other text:\n\n{text[:4000]}"
                response_text = _call_gemini(prompt)
                if response_text:
                    ai_skills = [s.strip().lower() for s in response_text.split(',') if s.strip()]
                    for s in ai_skills:
                        if len(s) < 30: 
                            hits.add(s)
        except Exception as e:
            print(f"Gemini extraction failed: {e}")
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
    if not file: return jsonify({"error": "File is required"}), 400
    if not email: email = f"guest.{datetime.utcnow().timestamp()}@elevateai.guest"
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages[:10]:
                text += page.extract_text() or ""
    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500
    if not text.strip():
        return jsonify({"error": "No text detected. Please use a text-based PDF."}), 400
    extracted = _extract_skills_from_text(text)
    category = _detect_skill_category(extracted)
    category_display = _get_category_display_name(category)
    try:
        users_collection.update_one(
            {"email": email},
            {"$set": {"email": email, "skills": extracted, "category": category, "category_display": category_display, "updated_at": datetime.utcnow()}},
            upsert=True
        )
    except Exception as e:
        print(f"DB Error: {e}")
    return jsonify({"message": "Success", "skills": extracted, "category": category_display})
@app.route("/save-user-skills", methods=["POST"])
def save_user_skills():
    data = request.json
    email = _current_email() or data.get("email")
    skills = data.get("skills", [])
    if not email:
        return jsonify({"error": "Email is required"}), 400
    normalized = _normalize_skills(skills)
    category = _detect_skill_category(normalized)
    category_display = _get_category_display_name(category)
    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "skills": normalized,
                "category": category,
                "category_display": category_display,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True,
    )
    try:
        activity_logs.insert_one({
            "type": "manual_skill_update",
            "email": email,
            "skills": normalized,
            "detected_category": category,
            "created_at": datetime.utcnow(),
        })
    except Exception:
        pass
    return jsonify({
        "message": "User skills saved successfully",
        "skills": normalized,
        "category": category_display,
        "field_detected": f"Based on your skills, we've identified you're in {category_display}"
    })
@app.route("/get-user", methods=["GET"])
def get_user():
    email = _current_email() or request.args.get("email", "").strip()
    if not email:
        return jsonify({"error": "Email query parameter is required"}), 400
    user = users_collection.find_one({"email": email}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "email": user.get("email"),
        "skills": user.get("skills", []),
        "category": user.get("category", "general"),
        "category_display": user.get("category_display", "General"),
        "roadmap": user.get("roadmap"),
        "profile": {
            "current_job_role": user.get("current_job_role", ""),
            "job_domain": user.get("job_domain", ""),
            "position_level": user.get("position_level", ""),
            "current_salary": user.get("current_salary", 0)
        },
        "updated_at": str(user.get("updated_at", "")),
    })
@app.route("/update-user-profile", methods=["POST"])
def update_user_profile():
    data = request.json
    email = _current_email() or data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400
    current_job_role = (data.get("current_job_role") or "").strip()
    job_domain = (data.get("job_domain") or "").strip()
    position_level = (data.get("position_level") or "").strip()
    current_salary = data.get("current_salary", 0)
    if not current_job_role or not job_domain or not position_level:
        return jsonify({"error": "current_job_role, job_domain, and position_level are required"}), 400
    try:
        current_salary = int(current_salary) if current_salary else 0
    except (ValueError, TypeError):
        return jsonify({"error": "current_salary must be a valid number"}), 400
    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "email": email,
                "current_job_role": current_job_role,
                "job_domain": job_domain,
                "position_level": position_level,
                "current_salary": current_salary,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True,
    )
    try:
        activity_logs.insert_one({
            "type": "profile_update",
            "email": email,
            "current_job_role": current_job_role,
            "job_domain": job_domain,
            "position_level": position_level,
            "current_salary": current_salary,
            "created_at": datetime.utcnow(),
        })
    except Exception:
        pass
    return jsonify({
        "message": "Profile updated successfully",
        "profile": {
            "current_job_role": current_job_role,
            "job_domain": job_domain,
            "position_level": position_level,
            "current_salary": current_salary
        }
    })
@app.route("/recommend-jobs", methods=["POST"])
def recommend_jobs():
    data = request.json
    email = _current_email() or data.get("email")
    user = None
    if email:
        user = users_collection.find_one({"email": email}, {"_id": 0})
    user_skills = _normalize_skills(data.get("skills", []) or (user.get("skills", []) if user else []))
    user_category = (user.get("category", "general") if user else "general")
    if not user_skills:
        return jsonify({"error": "No skills provided. Please add skills first."}), 400
    all_jobs = list(jobs_collection.find({}, {"_id": 0}))
    if not all_jobs:
        return jsonify({"error": "No jobs in database. Please seed jobs first via /seed-jobs"}), 404
    recommendations = []
    all_missing = set()
    category_jobs = []
    other_jobs = []
    for job in all_jobs:
        role = job.get("role", "Unknown")
        job_skills = _normalize_skills(job.get("skills", []))
        job_category = _detect_skill_category(job_skills)
        matched = len(set(user_skills) & set(job_skills))
        total = len(job_skills) or 1
        base_score = (matched / total) * 100
        skill_overlap = len(set(user_skills) & set(job_skills)) / len(set(user_skills) | set(job_skills)) * 100 if (set(user_skills) | set(job_skills)) else 0
        category_boost = 0
        is_category_match = job_category == user_category and user_category != "general"
        if is_category_match:
            category_boost = 15  
        overlap_boost = min(10, skill_overlap * 0.2)  
        final_score = min(100, base_score + category_boost + overlap_boost)
        matched_skills_list = sorted(set(user_skills) & set(job_skills))
        missing_skills = sorted(set(job_skills) - set(user_skills))
        all_missing.update(missing_skills)
        job_rec = {
            "role": role,
            "match": round(final_score, 1),
            "base_match": round(base_score, 1),
            "skill_overlap": round(skill_overlap, 1),
            "category_match": is_category_match,
            "job_category": _get_category_display_name(job_category),
            "matchedSkills": matched_skills_list,
            "missingSkills": missing_skills,
            "total_skills_required": len(job_skills),
            "skills_you_have": len(matched_skills_list),
        }
        if is_category_match:
            category_jobs.append(job_rec)
        else:
            other_jobs.append(job_rec)
    category_jobs.sort(key=lambda x: x["match"], reverse=True)
    other_jobs.sort(key=lambda x: x["match"], reverse=True)
    recommendations = category_jobs[:8] + other_jobs[:4]  
    skill_suggestions = _generate_skill_suggestions(user_skills, user_category, all_missing)
    best = recommendations[0] if recommendations else None
    stats = {
        "totalSkills": len(user_skills),
        "userCategory": _get_category_display_name(user_category),
        "bestRole": best["role"] if best else None,
        "bestMatchPercentage": best["match"] if best else 0.0,
        "skillGapCount": len(all_missing),
        "profileCompletion": min(100, len(user_skills) * 5),
        "categoryBasedRecommendations": len(category_jobs),
        "crossFieldOpportunities": len(other_jobs),
        "averageSkillsRequired": round(sum(r["total_skills_required"] for r in recommendations) / len(recommendations)) if recommendations else 0,
    }
    return jsonify({
        "email": email,
        "skills": user_skills,
        "category": _get_category_display_name(user_category),
        "recommendations": recommendations,
        "skillSuggestions": skill_suggestions,
        "stats": stats,
    })
def _generate_skill_suggestions(user_skills, user_category, missing_skills):
    growth_paths = {
        "computer_science": {
            "emerging_tech": ["artificial intelligence", "blockchain", "quantum computing", "edge computing", "webassembly"],
            "cloud_native": ["microservices", "serverless", "container orchestration", "service mesh", "observability"],
            "data_science": ["mlops", "feature engineering", "model deployment", "data pipeline", "big data analytics"],
            "security": ["cybersecurity", "penetration testing", "secure coding", "compliance", "threat modeling"],
            "leadership": ["technical leadership", "system design", "architecture", "mentoring", "agile methodologies"]
        },
        "engineering": {
            "advanced_design": ["finite element analysis", "computational fluid dynamics", "optimization", "simulation", "modeling"],
            "automation": ["industrial automation", "robotics", "plc programming", "scada systems", "iot integration"],
            "sustainability": ["green engineering", "life cycle assessment", "renewable energy", "waste reduction", "circular economy"],
            "digital_tools": ["digital twin", "industry 4.0", "predictive maintenance", "data analytics", "machine learning"],
            "management": ["project management", "quality management", "risk assessment", "regulatory compliance", "team leadership"]
        },
        "medical_healthcare": {
            "digital_health": ["telemedicine", "health informatics", "medical ai", "digital therapeutics", "wearable technology"],
            "research": ["clinical trials", "biostatistics", "epidemiology", "systematic review", "meta-analysis"],
            "specialization": ["precision medicine", "genomics", "immunotherapy", "regenerative medicine", "personalized care"],
            "technology": ["medical imaging", "laboratory automation", "electronic health records", "health data analytics"],
            "leadership": ["healthcare management", "quality improvement", "patient safety", "healthcare policy", "interdisciplinary collaboration"]
        },
        "business_commerce": {
            "digital_transformation": ["digital strategy", "e-commerce", "digital marketing", "automation", "ai in business"],
            "analytics": ["business intelligence", "predictive analytics", "customer analytics", "market research", "data visualization"],
            "finance": ["financial technology", "cryptocurrency", "risk management", "investment analysis", "financial modeling"],
            "leadership": ["strategic planning", "change management", "team building", "negotiation", "executive presence"],
            "sustainability": ["sustainable business", "esg reporting", "corporate social responsibility", "green finance", "impact investing"]
        },
        "science_research": {
            "advanced_methods": ["machine learning in research", "bioinformatics", "computational biology", "data mining", "statistical modeling"],
            "instrumentation": ["advanced microscopy", "spectroscopy", "chromatography", "mass spectrometry", "automation"],
            "collaboration": ["interdisciplinary research", "international collaboration", "open science", "reproducible research"],
            "communication": ["science communication", "grant writing", "peer review", "conference presentation", "public engagement"],
            "innovation": ["technology transfer", "patent writing", "commercialization", "startup development", "innovation management"]
        },
        "arts_design": {
            "digital_innovation": ["ar/vr design", "interactive media", "motion graphics", "3d visualization", "digital art"],
            "user_experience": ["user research", "accessibility design", "design systems", "prototyping", "usability testing"],
            "business": ["design thinking", "brand strategy", "client management", "project management", "design leadership"],
            "technology": ["creative coding", "generative design", "ai in design", "web technologies", "mobile design"],
            "specialization": ["sustainable design", "inclusive design", "design for social impact", "cultural design", "design ethics"]
        }
    }
    category_suggestions = growth_paths.get(user_category, {})
    suggestions = []
    user_skills_set = set(user_skills)
    for path_name, path_skills in category_suggestions.items():
        missing_in_path = [skill for skill in path_skills if skill not in user_skills_set]
        if missing_in_path:
            suggestions.append({
                "category": path_name.replace("_", " ").title(),
                "description": f"Expand your expertise in {path_name.replace('_', ' ')}",
                "skills": missing_in_path[:3],  
                "priority": "high" if len(missing_in_path) <= 2 else "medium"
            })
    popular_missing = list(missing_skills)[:10]  
    if popular_missing:
        suggestions.append({
            "category": "Market Demand",
            "description": "Skills in high demand for your field",
            "skills": popular_missing[:5],
            "priority": "high"
        })
    return suggestions[:6]  
@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    data = request.json
    email = _current_email() or data.get("email")
    target_role = data.get("target_role")
    if not email or not target_role:
        return jsonify({"error": "Email and target_role are required"}), 400
    user = None
    if email:
        user = users_collection.find_one({"email": email}, {"_id": 0})
    user_skills = _normalize_skills(data.get("skills", []) or (user.get("skills", []) if user else []))
    job = jobs_collection.find_one(
        {"role": {"$regex": f"^{target_role}$", "$options": "i"}},
        {"_id": 0}
    )
    if not job:
        return jsonify({"error": f"Role '{target_role}' not found in our database."}), 404
    required_skills = _normalize_skills(job.get("skills", []))
    missing_skills = sorted(set(required_skills) - set(user_skills))
    if not missing_skills:
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
            "biochemical engineering": "AIChE resources, Bioprocess Engineering textbooks, MIT OpenCourseWare",
            "chemical engineering": "AIChE.org, Perry's Chemical Engineers' Handbook, Coursera ChemE courses",
            "mechanical engineering": "ASME.org, SolidWorks tutorials, Coursera Mechanical Engineering",
            "electrical engineering": "IEEE.org, All About Circuits, MIT OpenCourseWare EE",
            "civil engineering": "ASCE.org, AutoCAD Civil 3D tutorials, Coursera Civil Engineering",
            "process design": "Aspen Plus tutorials, Process Design textbooks, AIChE Academy",
            "thermodynamics": "MIT OpenCourseWare, Thermodynamics textbooks, Khan Academy",
            "fluid mechanics": "MIT OpenCourseWare, Fluid Mechanics textbooks, YouTube lectures",
            "autocad": "Autodesk Learning, AutoCAD tutorials, LinkedIn Learning",
            "solidworks": "SolidWorks tutorials, Dassault Systèmes training, YouTube courses",
            "matlab": "MATLAB Academy, MathWorks tutorials, Coursera MATLAB courses",
            "fermentation": "Bioprocess Engineering textbooks, Industrial Microbiology courses",
            "chromatography": "Waters Corporation resources, Chromatography textbooks",
            "anatomy": "Visible Body, Gray's Anatomy, Khan Academy Medicine",
            "physiology": "Khan Academy Medicine, Physiology textbooks, Coursera Medical courses",
            "pharmacology": "Pharmacology textbooks, Lecturio Medical, Khan Academy",
            "clinical research": "ICH-GCP training, CITI Program, Clinical Research courses",
            "medical laboratory": "ASCP resources, Clinical Laboratory textbooks, MLT programs",
            "biochemistry": "Khan Academy Biochemistry, Lehninger textbook, Coursera Biochemistry",
            "molecular biology": "MIT OpenCourseWare, Molecular Biology textbooks, iBiology",
            "microbiology": "Microbiology textbooks, ASM resources, Khan Academy",
            "cell culture": "Cell Culture protocols, Thermo Fisher resources, laboratory manuals",
            "financial analysis": "CFA Institute, Investopedia, Coursera Finance courses",
            "accounting": "AICPA resources, Accounting textbooks, Khan Academy Accounting",
            "project management": "PMI.org, PMP certification, Coursera Project Management",
            "marketing": "Google Digital Marketing, HubSpot Academy, Coursera Marketing",
            "digital marketing": "Google Ads certification, Facebook Blueprint, HubSpot Academy",
            "business analysis": "IIBA resources, Business Analysis textbooks, Coursera BA courses",
            "financial modeling": "Wall Street Prep, Macabacus, Investment Banking textbooks",
            "excel": "Microsoft Excel training, ExcelJet, Chandoo.org",
            "powerpoint": "Microsoft PowerPoint training, Presentation Zen, SlideShare",
            "graphic design": "Adobe tutorials, Canva Design School, Coursera Design courses",
            "adobe photoshop": "Adobe tutorials, Photoshop Cafe, YouTube Photoshop courses",
            "adobe illustrator": "Adobe tutorials, Illustrator tutorials, Design courses",
            "web design": "MDN Web Docs, Responsive Web Design, FreeCodeCamp",
            "ui/ux design": "Google UX Design Certificate, Nielsen Norman Group, Interaction Design Foundation",
            "typography": "Typography textbooks, Google Fonts, Type design courses",
            "color theory": "Adobe Color, Color theory books, Design courses",
            "photography": "Photography courses, PetaPixel, Digital Photography School",
            "video editing": "Adobe Premiere tutorials, Final Cut Pro courses, DaVinci Resolve training",
            "research methodology": "Research Methods textbooks, Coursera Research courses, University resources",
            "statistical analysis": "Khan Academy Statistics, R tutorials, SPSS courses",
            "curriculum development": "Education textbooks, Instructional Design courses, ADDIE model",
            "lesson planning": "Teaching resources, Education courses, Classroom management books",
            "academic writing": "Purdue OWL, Academic Writing courses, Style guides",
            "grant writing": "Grant writing courses, Foundation resources, NIH training",
            "crop science": "Agronomy textbooks, Extension resources, Agricultural courses",
            "soil science": "Soil Science textbooks, USDA resources, Agricultural extension",
            "environmental science": "Environmental Science textbooks, EPA resources, Coursera Environmental courses",
            "sustainability": "Sustainability courses, UN SDG resources, Green business guides",
            "gis": "ESRI training, QGIS tutorials, GIS courses",
            "psychology": "Psychology textbooks, APA resources, Khan Academy Psychology",
            "counseling": "Counseling textbooks, ACA resources, Therapy training programs",
            "social work": "NASW resources, Social Work textbooks, MSW programs",
            "survey design": "Survey methodology books, Qualtrics resources, Research methods courses"
        }
        steps = []
        phase_size = max(1, math.ceil(len(missing_skills) / 3)) if missing_skills else 1
        for idx, skill in enumerate(missing_skills, start=1):
            resources = resource_map.get(skill, f"Search: '{skill} tutorial' on YouTube or freeCodeCamp")
            phase_num = (idx - 1) // phase_size + 1
            phase_label = ["Foundations", "Core Concepts", "Advanced Mastery"][min(phase_num-1, 2)]
            steps.append({
                "id": idx,
                "title": f"{skill.title()} ({phase_label})",
                "duration": "1-2 weeks",
                "description": (
                    f"Master the fundamentals of {skill}. Recommended resources: {resources}. "
                    f"Focus on practical implementation and building projects."
                ),
                "skills": [skill],
                "resources": resources,
                "completed": False,
            })
    roadmap = {
        "role": target_role,
        "steps": steps,
        "current_skills": user_skills,
        "missing_skills": missing_skills,
        "personalized_message": f"Based on your resume, you already have {len(user_skills)} core skills. We've mapped out the remaining {len(missing_skills)} milestones to help you reach the {target_role} level."
    }
    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                f"active_roadmaps.{target_role.replace('.', '_')}": roadmap,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True,
    )
    return jsonify({"email": email, "roadmap": roadmap})
@app.route("/skill-gap", methods=["POST"])
def skill_gap():
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
@app.route("/save-skill-progress", methods=["POST"])
def save_skill_progress():
    data = request.json
    email = _current_email() or data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    role = data.get("role")
    step_id = data.get("step_id")
    is_completed = data.get("is_completed", True)
    step_data = data.get("step_data", {})
    update_query = {}
    if is_completed:
        update_query = {
            "$addToSet": {f"progress.{role}": step_id},
            "$set": {f"tracker_data.{role}-{step_id}": {
                **step_data,
                "completed_at": datetime.utcnow()
            }}
        }
    else:
        update_query = {
            "$pull": {f"progress.{role}": step_id},
            "$unset": {f"tracker_data.{role}-{step_id}": ""}
        }
    users_collection.update_one({"email": email}, update_query, upsert=True)
    return jsonify({"message": "Progress saved"})
@app.route("/get-skill-tracker", methods=["GET"])
def get_skill_tracker():
    email = _current_email() or request.args.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"progress": {}, "tracker_data": {}})
    return jsonify({
        "progress": user.get("progress", {}),
        "tracker_data": user.get("tracker_data", {}),
        "active_roadmaps": user.get("active_roadmaps", {})
    })
@app.route("/sync-live-jobs", methods=["POST"])
def sync_live_jobs():
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
            extracted_skills = _extract_skills_from_text(description)
            tags = [t.lower() for t in job_data.get("tags", [])]
            final_skills = _normalize_skills(extracted_skills + tags)
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
            "role": "cybersecurity analyst",
            "skills": ["cybersecurity", "penetration testing", "network security", "incident response", "risk assessment", "compliance", "python", "linux"]
        },
        {
            "role": "ai research scientist",
            "skills": ["artificial intelligence", "deep learning", "research methodology", "python", "tensorflow", "pytorch", "academic writing", "mathematics"]
        },
        {
            "role": "software architect",
            "skills": ["system design", "architecture", "microservices", "design patterns", "technical leadership", "cloud computing", "scalability"]
        },
        {
            "role": "mobile app developer",
            "skills": ["flutter", "react native", "mobile development", "ui/ux design", "api integration", "app store optimization", "cross-platform"]
        },
        {
            "role": "android developer",
            "skills": ["kotlin", "java", "android studio", "jetpack compose", "mvvm", "retrofit", "hilt", "dagger", "room database", "git", "coroutine", "unit testing"]
        },
        {
            "role": "ios developer",
            "skills": ["swift", "objective-c", "xcode", "swiftui", "uikit", "mvvm", "combine", "core data", "git", "unit testing", "ios development"]
        },
        {
            "role": "biochemical engineer",
            "skills": ["biochemical engineering", "fermentation", "bioreactor design", "downstream processing", "chromatography", "process design", "matlab", "aspen plus", "biochemistry", "biotechnology"]
        },
        {
            "role": "chemical process engineer",
            "skills": ["chemical engineering", "process design", "process control", "thermodynamics", "fluid mechanics", "heat transfer", "mass transfer", "distillation", "autocad", "aspen plus"]
        },
        {
            "role": "bioprocess engineer",
            "skills": ["bioprocess engineering", "fermentation", "cell culture", "bioreactor design", "downstream processing", "purification", "scale-up", "gmp", "biotechnology"]
        },
        {
            "role": "environmental engineer",
            "skills": ["environmental engineering", "pollution control", "waste management", "water treatment", "air quality", "environmental impact assessment", "sustainability", "autocad", "gis"]
        },
        {
            "role": "materials scientist",
            "skills": ["materials science", "nanotechnology", "characterization", "synthesis", "polymers", "composites", "microscopy", "spectroscopy", "research methodology"]
        },
        {
            "role": "petroleum engineer",
            "skills": ["petroleum engineering", "reservoir engineering", "drilling", "production", "enhanced oil recovery", "simulation", "economics", "geology"]
        },
        {
            "role": "aerospace engineer",
            "skills": ["aerospace engineering", "aerodynamics", "propulsion", "flight mechanics", "structural analysis", "matlab", "catia", "systems engineering"]
        },
        {
            "role": "robotics engineer",
            "skills": ["robotics", "control systems", "mechanical design", "programming", "sensors", "actuators", "machine learning", "computer vision"]
        },
        {
            "role": "quality assurance engineer",
            "skills": ["quality management", "lean six sigma", "statistical process control", "iso standards", "auditing", "continuous improvement", "problem solving"]
        },
        {
            "role": "research and development engineer",
            "skills": ["research methodology", "product development", "innovation", "prototyping", "testing", "patent writing", "project management", "technical writing"]
        },
        {
            "role": "clinical research coordinator",
            "skills": ["clinical research", "gcp", "medical ethics", "data collection", "patient recruitment", "regulatory compliance", "medical terminology", "statistical analysis"]
        },
        {
            "role": "biomedical scientist",
            "skills": ["biochemistry", "molecular biology", "cell culture", "protein purification", "pcr", "western blot", "elisa", "microscopy", "research methodology"]
        },
        {
            "role": "medical laboratory technologist",
            "skills": ["medical laboratory", "clinical chemistry", "hematology", "microbiology", "immunology", "histology", "quality control", "laboratory safety"]
        },
        {
            "role": "pharmaceutical scientist",
            "skills": ["pharmaceutical sciences", "drug development", "pharmacokinetics", "formulation", "analytical chemistry", "regulatory affairs", "clinical trials"]
        },
        {
            "role": "bioinformatics specialist",
            "skills": ["bioinformatics", "computational biology", "genomics", "proteomics", "data analysis", "programming", "statistics", "molecular biology"]
        },
        {
            "role": "medical device engineer",
            "skills": ["biomedical engineering", "medical devices", "regulatory compliance", "fda approval", "design controls", "risk management", "testing", "validation"]
        },
        {
            "role": "epidemiologist",
            "skills": ["epidemiology", "biostatistics", "public health", "disease surveillance", "data analysis", "research methodology", "health policy"]
        },
        {
            "role": "clinical data manager",
            "skills": ["clinical data management", "clinical trials", "data quality", "database design", "regulatory compliance", "statistical analysis", "sas"]
        },
        {
            "role": "health informatics specialist",
            "skills": ["health informatics", "electronic health records", "health data analytics", "healthcare technology", "interoperability", "privacy", "security"]
        },
        {
            "role": "toxicologist",
            "skills": ["toxicology", "risk assessment", "regulatory toxicology", "in vitro testing", "pharmacokinetics", "safety evaluation", "research methodology"]
        },
        {
            "role": "financial analyst",
            "skills": ["financial analysis", "excel", "financial modeling", "budgeting", "forecasting", "valuation", "investment analysis", "accounting"]
        },
        {
            "role": "business analyst",
            "skills": ["business analysis", "requirements gathering", "process improvement", "data analysis", "excel", "sql", "project management", "stakeholder management"]
        },
        {
            "role": "digital marketing manager",
            "skills": ["digital marketing", "social media marketing", "content marketing", "seo", "sem", "email marketing", "analytics", "brand management"]
        },
        {
            "role": "supply chain analyst",
            "skills": ["supply chain management", "logistics", "inventory management", "demand planning", "data analysis", "excel", "optimization", "procurement"]
        },
        {
            "role": "management consultant",
            "skills": ["strategic planning", "business strategy", "problem solving", "analytical thinking", "presentation skills", "client management", "project management"]
        },
        {
            "role": "product manager",
            "skills": ["product management", "market research", "user experience", "agile methodologies", "data analysis", "strategic thinking", "stakeholder management"]
        },
        {
            "role": "investment banker",
            "skills": ["investment banking", "financial modeling", "valuation", "mergers and acquisitions", "due diligence", "pitch presentations", "excel", "powerpoint"]
        },
        {
            "role": "business intelligence analyst",
            "skills": ["business intelligence", "data visualization", "sql", "tableau", "power bi", "data warehousing", "analytics", "reporting"]
        },
        {
            "role": "operations manager",
            "skills": ["operations management", "process improvement", "lean six sigma", "supply chain management", "quality management", "project management", "leadership"]
        },
        {
            "role": "sustainability consultant",
            "skills": ["sustainability", "environmental consulting", "life cycle assessment", "carbon footprint", "esg reporting", "renewable energy", "green finance"]
        },
        {
            "role": "research scientist",
            "skills": ["research methodology", "statistical analysis", "data collection", "literature review", "academic writing", "grant writing", "peer review", "laboratory techniques"]
        },
        {
            "role": "analytical chemist",
            "skills": ["analytical chemistry", "chromatography", "spectroscopy", "method development", "validation", "quality control", "instrumentation", "data analysis"]
        },
        {
            "role": "microbiologist",
            "skills": ["microbiology", "bacterial culture", "molecular biology", "pcr", "microscopy", "aseptic technique", "quality control", "research methodology"]
        },
        {
            "role": "environmental scientist",
            "skills": ["environmental science", "ecology", "environmental monitoring", "data collection", "gis", "field research", "report writing", "regulatory compliance"]
        },
        {
            "role": "food scientist",
            "skills": ["food science", "food safety", "product development", "nutrition", "microbiology", "chemistry", "sensory evaluation", "regulatory compliance"]
        },
        {
            "role": "forensic scientist",
            "skills": ["forensic science", "analytical chemistry", "microscopy", "dna analysis", "evidence analysis", "laboratory techniques", "report writing", "court testimony"]
        },
        {
            "role": "marine biologist",
            "skills": ["marine biology", "ecology", "field research", "data collection", "statistical analysis", "conservation", "underwater techniques", "research methodology"]
        },
        {
            "role": "geologist",
            "skills": ["geology", "mineralogy", "petrology", "field work", "gis", "geological mapping", "data analysis", "report writing"]
        },
        {
            "role": "ux/ui designer",
            "skills": ["ui/ux design", "user research", "wireframing", "prototyping", "figma", "sketch", "usability testing", "design thinking"]
        },
        {
            "role": "graphic designer",
            "skills": ["graphic design", "adobe photoshop", "adobe illustrator", "adobe indesign", "typography", "color theory", "branding", "layout design"]
        },
        {
            "role": "motion graphics designer",
            "skills": ["motion graphics", "adobe after effects", "animation", "video editing", "cinema 4d", "storytelling", "visual effects", "creative thinking"]
        },
        {
            "role": "art director",
            "skills": ["art direction", "creative leadership", "brand strategy", "visual communication", "team management", "client presentation", "creative thinking"]
        },
        {
            "role": "industrial designer",
            "skills": ["industrial design", "product design", "3d modeling", "prototyping", "materials selection", "manufacturing processes", "user-centered design"]
        },
        {
            "role": "web designer",
            "skills": ["web design", "html", "css", "javascript", "responsive design", "user experience", "visual design", "accessibility"]
        },
        {
            "role": "interior designer",
            "skills": ["interior design", "space planning", "color theory", "autocad", "3d visualization", "materials selection", "project management", "client consultation"]
        },
        {
            "role": "fashion designer",
            "skills": ["fashion design", "pattern making", "textile knowledge", "trend analysis", "sketching", "garment construction", "color theory", "market research"]
        },
        {
            "role": "curriculum developer",
            "skills": ["curriculum development", "instructional design", "educational technology", "assessment design", "learning theory", "content creation", "project management"]
        },
        {
            "role": "educational researcher",
            "skills": ["educational research", "research methodology", "statistical analysis", "data collection", "academic writing", "literature review", "survey design"]
        },
        {
            "role": "training specialist",
            "skills": ["training development", "adult learning", "instructional design", "presentation skills", "e-learning", "assessment", "performance improvement"]
        },
        {
            "role": "academic advisor",
            "skills": ["academic advising", "student counseling", "program planning", "communication", "problem solving", "data analysis", "student development"]
        },
        {
            "role": "agricultural scientist",
            "skills": ["crop science", "soil science", "plant breeding", "pest management", "sustainable agriculture", "research methodology", "data analysis", "field research"]
        },
        {
            "role": "conservation scientist",
            "skills": ["conservation biology", "ecology", "wildlife management", "habitat restoration", "gis", "field research", "environmental monitoring", "policy development"]
        },
        {
            "role": "renewable energy engineer",
            "skills": ["renewable energy", "solar energy", "wind energy", "energy storage", "grid integration", "project management", "sustainability", "economics"]
        },
        {
            "role": "water resources engineer",
            "skills": ["water resources", "hydrology", "hydraulics", "water treatment", "environmental engineering", "modeling", "gis", "project management"]
        },
        {
            "role": "clinical psychologist",
            "skills": ["clinical psychology", "psychological assessment", "therapy", "counseling", "research methodology", "statistical analysis", "report writing", "ethics"]
        },
        {
            "role": "social researcher",
            "skills": ["social research", "survey design", "statistical analysis", "qualitative research", "data collection", "report writing", "interview techniques"]
        },
        {
            "role": "human resources specialist",
            "skills": ["human resources", "recruitment", "employee relations", "performance management", "training", "compliance", "communication", "conflict resolution"]
        },
        {
            "role": "market research analyst",
            "skills": ["market research", "consumer behavior", "statistical analysis", "survey design", "data visualization", "report writing", "presentation skills"]
        }
    ]
    jobs_collection.delete_many({})
    jobs_collection.insert_many(sample_jobs)
    return jsonify({"message": f"{len(sample_jobs)} diverse jobs seeded successfully across all fields", "roles": [j["role"] for j in sample_jobs]})
def send_otp_email(receiver_email, otp):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print(f"WARNING: SMTP credentials not set. OTP for {receiver_email} is {otp}")
        return False
    msg = MIMEMultipart()
    msg['From'] = f"Elevate AI <{SMTP_EMAIL}>"
    msg['To'] = receiver_email
    msg['Subject'] = f"{otp} is your Elevate AI verification code"
    body = f
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
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    otp = str(random.randint(100000, 999999))
    now = datetime.utcnow()
    otp_collection.update_one(
        {"email": email},
        {"$set": {"code": otp, "created_at": now}},
        upsert=True
    )
    sent = send_otp_email(email, otp)
    if not sent:
        print(f"\nFALLBACK OTP FOR {email}: {otp}\n")
    return jsonify({"message": "OTP sent successfully. Check your email inbox."})
@app.route("/auth/verify-otp", methods=["POST"])
def verify_otp():
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
    token = jwt.encode(
        {
            "email": email,
            "name": user.get("name"),
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(hours=24)).timestamp()),
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    otp_collection.delete_one({"_id": record["_id"]})
    print(f"DEBUG: Successfully verified OTP for {email}")
    return jsonify({"token": token})
@app.route("/auth/demo", methods=["POST"])
def auth_demo():
    demo_email = f"demo.user.{random.randint(1000, 9999)}@elevateai.demo"
    demo_name = "Demo User"
    demo_skills = [
        "biochemical engineering", "fermentation", "chromatography", "process design", 
        "matlab", "analytical chemistry", "project management", "research methodology",
        "data analysis", "statistical analysis", "bioreactor design", "downstream processing"
    ]
    category = _detect_skill_category(demo_skills)
    category_display = _get_category_display_name(category)
    now = datetime.utcnow()
    users_collection.update_one(
        {"email": demo_email},
        {
            "$set": {
                "email": demo_email,
                "name": demo_name,
                "skills": demo_skills,
                "category": category,
                "category_display": category_display,
                "updated_at": now,
                "is_demo": True,
            },
            "$setOnInsert": {
                "created_at": now,
                "roadmap": None,
            },
        },
        upsert=True,
    )
    token = jwt.encode(
        {
            "email": demo_email,
            "name": demo_name,
            "is_demo": True,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(days=7)).timestamp()),
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    return jsonify({"token": token})
@app.route("/auth/google", methods=["POST"])
def auth_google():
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
        return jsonify({"error": f"Google verification failed: {str(e)}"}), 401
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
            "exp": int((now + timedelta(hours=24)).timestamp()),
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
            "skills": user.get("skills", []),
            "is_demo": user.get("is_demo", False),
            "current_job_role": user.get("current_job_role", ""),
            "job_domain": user.get("job_domain", ""),
            "position_level": user.get("position_level", ""),
            "current_salary": user.get("current_salary", 0)
        }
    })
@app.route("/career-pathways/promotion", methods=["POST"])
def get_promotion_pathway():
    data = request.json
    email = _current_email() or data.get("email")
    skills = data.get("skills", [])
    current_job_role = (data.get("current_job_role") or "").strip()
    job_domain = (data.get("job_domain") or "").strip()
    position_level = (data.get("position_level") or "").strip()
    current_salary = data.get("current_salary", 0)
    if not current_job_role or not job_domain or not position_level:
        if email:
            user = users_collection.find_one({"email": email}, {"_id": 0})
            if user:
                current_job_role = current_job_role or user.get("current_job_role", "")
                job_domain = job_domain or user.get("job_domain", "")
                position_level = position_level or user.get("position_level", "")
                current_salary = current_salary or user.get("current_salary", 0)
                skills = skills or user.get("skills", [])
    if not current_job_role or not job_domain or not position_level:
        return jsonify({"error": "current_job_role, job_domain, and position_level are required for promotion pathway."}), 400
    normalized_skills = _normalize_skills(skills)
    if not GOOGLE_API_KEY:
        return jsonify({
            "current_role": current_job_role,
            "domain": job_domain,
            "level": position_level,
            "next_role": f"Senior {current_job_role}",
            "salary_progression": {
                "current": current_salary,
                "next_level": int(current_salary * 1.15) if current_salary else 0,
                "senior_level": int(current_salary * 1.35) if current_salary else 0
            },
            "skills_to_work_on": {
                "core": ["Advanced Domain Expertise", "Strategic Thinking"],
                "tools": ["Industry-Specific Tools", "Analytics Platforms"],
                "leadership": ["Team Leadership", "Mentoring"],
                "impact": ["Cross-functional Collaboration", "Business Impact"]
            },
            "projects": [
                {
                    "project": f"Lead a critical {job_domain} initiative",
                    "objective": f"Take end-to-end ownership of a complex {job_domain} project.",
                    "skills_gained": ["Project Management", "Strategic Planning"],
                    "promotion_impact": "Demonstrates capability to operate at the next level."
                }
            ],
            "strategy": {
                "apply_in_job": "Volunteer for high-impact projects in your domain.",
                "show_results": "Track and communicate measurable business outcomes.",
                "position_for_promotion": "Discuss career progression aligned with your domain expertise."
            }
        })
    prompt = f
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        result = json.loads(text)
        return jsonify(result)
    except Exception as e:
        print(f"Promotion Pathway generation error: {e}")
        return jsonify({"error": "Failed to generate promotion pathway"}), 500
@app.route("/career-pathways/high-paying-jobs", methods=["POST"])
def get_high_paying_jobs():
    data = request.json
    email = _current_email() or data.get("email")
    skills = _normalize_skills(data.get("skills", []))
    current_job_role = (data.get("current_job_role") or "").strip()
    job_domain = (data.get("job_domain") or "").strip()
    position_level = (data.get("position_level") or "").strip()
    current_salary = data.get("current_salary", 0)
    if not job_domain:
        if email:
            user = users_collection.find_one({"email": email}, {"_id": 0})
            if user:
                current_job_role = current_job_role or user.get("current_job_role", "")
                job_domain = job_domain or user.get("job_domain", "")
                position_level = position_level or user.get("position_level", "")
                current_salary = current_salary or user.get("current_salary", 0)
                skills = skills or user.get("skills", [])
    if not skills:
        return jsonify({"error": "Skills are required to find matching jobs."}), 400
    if not job_domain:
        job_domain = _get_category_display_name(_detect_skill_category(skills))
    all_jobs = list(jobs_collection.find({}, {"_id": 0}))
    if not all_jobs:
        return jsonify({"error": "No jobs available."}), 404
    domain_filtered_jobs = []
    user_domain_category = _detect_skill_category(skills)
    for job in all_jobs:
        job_skills = _normalize_skills(job.get("skills", []))
        job_domain_category = _detect_skill_category(job_skills)
        if job_domain_category == user_domain_category or user_domain_category == "general":
            domain_filtered_jobs.append(job)
    filtered_jobs = []
    seen_listings = set()
    for job in domain_filtered_jobs:
        company = job.get("company", "").strip()
        role = job.get("role", "").strip()
        salary_str = str(job.get("salary", "")).lower()
        if not company or company.lower() in ["confidential", "undisclosed"]:
            continue
        job_key = f"{company.lower()}_{role.lower()}"
        if job_key in seen_listings:
            continue
        estimated_salary = 0
        if "$" in salary_str or "k" in salary_str:
            import re
            nums = re.findall(r'\d+', salary_str.replace(',', ''))
            if nums:
                estimated_salary = int(nums[0])
                if estimated_salary < 1000:
                    estimated_salary *= 1000
        else:
            if "senior" in role.lower() or "lead" in role.lower() or "manager" in role.lower():
                estimated_salary = random.randint(120000, 180000)
            else:
                estimated_salary = random.randint(70000, 110000)
        if estimated_salary < 90000:
            continue
        seen_listings.add(job_key)
        job["estimated_salary"] = estimated_salary
        filtered_jobs.append(job)
    results = []
    tools_list = [
        "python", "javascript", "react", "sql", "aws", "docker", "kubernetes", "node.js", "git", "jira", "linux", "c++", "java",
        "excel", "powerpoint", "salesforce", "sap", "tableau", "power bi", "hubspot", "google analytics", "bloomberg", "quickbooks", "oracle", "semrush", "ahrefs", "mailchimp", "hootsuite", "google ads",
        "figma", "adobe photoshop", "adobe illustrator", "sketch", "invision", "adobe premiere pro", "blender", "maya",
        "autocad", "solidworks", "matlab", "ansys", "catia", "labview", "spss", "sas", "r",
        "epic", "cerner", "meditech", "emr", "ehr"
    ]
    user_skills_set = set(skills)
    for job in filtered_jobs:
        job_skills = _normalize_skills(job.get("skills", []))
        if not job_skills:
            continue
        j_tools = set(s for s in job_skills if s in tools_list)
        j_core = set(job_skills) - j_tools
        core_match_ratio = len(user_skills_set & j_core) / len(j_core) if j_core else 1.0
        tools_match_ratio = len(user_skills_set & j_tools) / len(j_tools) if j_tools else 1.0
        exp_match_ratio = min(1.0, len(user_skills_set) / 10.0)
        if current_job_role and any(word in job.get("role", "").lower() for word in current_job_role.lower().split()):
            exp_match_ratio = 1.0
        elif position_level:
            if position_level.lower() in job.get("role", "").lower():
                exp_match_ratio = max(exp_match_ratio, 0.85)
        match_score = (core_match_ratio * 50) + (exp_match_ratio * 30) + (tools_match_ratio * 20)
        missing_skills = list(set(job_skills) - user_skills_set)
        qualify_steps = []
        if missing_skills:
            qualify_steps.append(f"Master: {', '.join(missing_skills[:3])}")
            qualify_steps.append(f"Build portfolio projects in {job_domain}")
        else:
            qualify_steps.append("Your skills are complete for this role")
            qualify_steps.append("Tailor resume to highlight domain expertise")
        salary_growth = int(estimated_salary - current_salary) if current_salary else estimated_salary
        results.append({
            "role": job.get("role"),
            "company": job.get("company"),
            "salary": f"${estimated_salary:,}",
            "salary_growth": f"+${salary_growth:,}" if salary_growth > 0 else "N/A",
            "match_percent": round(match_score, 1),
            "missing_skills": missing_skills,
            "to_qualify": qualify_steps,
            "domain_aligned": True
        })
    results.sort(key=lambda x: (x["match_percent"], int(x["salary"].replace('$', '').replace(',', ''))), reverse=True)
    return jsonify({
        "jobs": results[:15],
        "domain": job_domain,
        "current_role": current_job_role,
        "position_level": position_level,
        "total_domain_aligned": len(results)
    })
@app.route("/job-trends", methods=["GET"])
def get_job_trends():
    try:
        all_jobs = list(jobs_collection.find({}, {"_id": 0}))
    except Exception:
        all_jobs = []
    total_jobs = len(all_jobs) or 1
    skill_freq = {}
    category_counts = {}
    for job in all_jobs:
        skills = job.get("skills", [])
        for s in skills:
            s_norm = (s or "").lower().strip()
            if s_norm:
                skill_freq[s_norm] = skill_freq.get(s_norm, 0) + 1
        cat = _detect_skill_category(skills)
        category_counts[cat] = category_counts.get(cat, 0) + 1
    top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:15]
    top_skills_data = [{"name": s.title(), "demand": min(100, int((count/total_jobs)*150))} for s, count in top_skills]
    role_distribution = []
    for cat, count in category_counts.items():
        role_distribution.append({
            "name": _get_category_display_name(cat),
            "value": count,
            "growth": random.randint(12, 42)
        })
    salary_trend = [
        {"year": "2023", "average": 82000, "entry": 60000, "senior": 125000},
        {"year": "2024", "average": 89500, "entry": 67000, "senior": 138000},
        {"year": "2025", "average": 97000, "entry": 75000, "senior": 152000},
        {"year": "2026", "average": 105000, "entry": 84000, "senior": 168000},
        {"year": "2027", "average": 114000, "entry": 92000, "senior": 185000}
    ]
    market_pulse_score = min(98.5, 75.0 + (total_jobs / 2))
    return jsonify({
        "topSkills": top_skills_data,
        "roleDistribution": role_distribution,
        "salaryTrend": salary_trend,
        "marketPulse": {
            "index": round(market_pulse_score, 1),
            "status": "High Activity" if market_pulse_score > 85 else "Stable",
            "totalAnalyzed": total_jobs,
            "live_sync": True
        },
        "hotspots": [
            {"city": "Remote (Live)", "jobs": total_jobs, "avgSalary": 115000},
            {"city": "San Francisco", "jobs": random.randint(1500, 2000), "avgSalary": 165000},
            {"city": "New York", "jobs": random.randint(1200, 1800), "avgSalary": 145000},
            {"city": "London", "jobs": random.randint(900, 1400), "avgSalary": 95000},
            {"city": "Bangalore", "jobs": random.randint(1100, 1600), "avgSalary": 48000}
        ],
        "predictions": [
            {
                "field": "Infrastructure",
                "outlook": "High",
                "impact": "Cloud-native transformation is driving 30% YoY growth in DevOps and Site Reliability roles.",
                "topSkill": "Terraform"
            },
            {
                "field": "Full Stack",
                "outlook": "Stable",
                "impact": "Consolidation of frameworks; Next.js and Go are becoming the enterprise standard for speed.",
                "topSkill": "Next.js"
            },
            {
                "field": "AI Strategy",
                "outlook": "Explosive",
                "impact": "60% of new tech roles now require some form of LLM or prompt engineering expertise.",
                "topSkill": "OpenAI API"
            }
        ]
    })
if __name__ == "__main__":
    app.run(debug=True)