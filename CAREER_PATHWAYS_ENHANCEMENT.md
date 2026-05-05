# Career Pathways Enhancement - Domain-Driven Personalization

## 🎯 Overview

The Career Pathways feature has been completely refactored to be **fully personalized and domain-driven**. Instead of generic recommendations, the system now generates career guidance strictly based on the user's professional context: job role, domain, position level, and salary.

## 📥 New Profile Inputs (MANDATORY)

Users must now provide the following information to unlock domain-specific career guidance:

### 1. **Current Job Role**
- Examples: Marketing Executive, Software Engineer, Financial Analyst, Biochemical Engineer
- Used to identify current position and generate relevant next-level roles
- Helps tailor projects and skills to the user's specific role

### 2. **Job Domain**
- Dropdown selection from 16 predefined domains:
  - Computer Science & Technology
  - Engineering
  - Medical & Healthcare
  - Business & Commerce
  - Science & Research
  - Arts & Design
  - Education
  - Agriculture & Environmental
  - Psychology & Social Sciences
  - Finance, Marketing, Sales, Operations, HR, Legal, Other
- **CRITICAL**: All outputs are strictly filtered to this domain
- Prevents tech-bias and ensures domain-relevant recommendations

### 3. **Position Level**
- Options: Entry, Mid-Level, Senior, Lead, Manager, Director, Executive
- Used to:
  - Identify next promotion level
  - Estimate salary progression
  - Tailor skill requirements
  - Filter relevant job opportunities

### 4. **Current Salary** (Optional)
- Used to:
  - Calculate salary growth potential
  - Estimate next-level salary brackets
  - Show salary progression timeline
  - Filter high-paying jobs above current salary

## 🎨 Frontend Components

### ProfileEditor Component
**Location**: `frontend/frontend/src/components/features/ProfileEditor.jsx`

A comprehensive form component that allows users to:
- Input/edit their professional profile
- Pre-fill from existing data
- Validate all inputs
- See profile completion status
- View current profile in read-only mode

**Features**:
- Form validation with error messages
- Success notifications
- Edit/view toggle
- Helpful tips and descriptions
- Responsive design

### Updated CareerPathways Component
**Location**: `frontend/frontend/src/components/features/CareerPathways.jsx`

Enhanced to:
- Load user profile data on mount
- Pass profile data to all API calls
- Display domain-specific guidance
- Show salary progression estimates
- Filter jobs by domain
- Display salary growth potential

### Updated Dashboard
**Location**: `frontend/frontend/src/pages/Dashboard.jsx`

Now includes:
- ProfileEditor component at the top
- Resume upload
- Manual skill input
- Proper sequencing for user onboarding

## ⚙️ Backend Enhancements

### New Endpoint: `/update-user-profile` (POST)

**Purpose**: Save user's professional profile information

**Request Body**:
```json
{
  "email": "user@example.com",
  "current_job_role": "Marketing Executive",
  "job_domain": "Business & Commerce",
  "position_level": "Mid-Level",
  "current_salary": 75000
}
```

**Response**:
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "current_job_role": "Marketing Executive",
    "job_domain": "Business & Commerce",
    "position_level": "Mid-Level",
    "current_salary": 75000
  }
}
```

### Enhanced Endpoint: `/career-pathways/promotion` (POST)

**Now Includes**:
- Domain-driven Gemini prompts
- Salary progression estimates
- Domain-specific skill recommendations
- Domain-specific project suggestions
- Position level-aware guidance

**Request Body**:
```json
{
  "email": "user@example.com",
  "skills": ["financial analysis", "excel", "accounting"],
  "current_job_role": "Financial Analyst",
  "job_domain": "Business & Commerce",
  "position_level": "Mid-Level",
  "current_salary": 75000
}
```

**Response Includes**:
```json
{
  "current_role": "Financial Analyst",
  "domain": "Business & Commerce",
  "level": "Mid-Level",
  "next_role": "Senior Financial Analyst",
  "salary_progression": {
    "current": 75000,
    "next_level": 86250,
    "senior_level": 101250
  },
  "skills_to_work_on": {
    "core": ["Advanced Financial Modeling", "Risk Analysis"],
    "tools": ["Bloomberg Terminal", "SAP"],
    "leadership": ["Team Leadership", "Mentoring"],
    "impact": ["Strategic Planning", "Business Impact"]
  },
  "projects": [
    {
      "project": "Lead Quarterly Financial Forecasting",
      "objective": "Take ownership of company-wide financial forecasting",
      "skills_gained": ["Financial Modeling", "Strategic Planning"],
      "promotion_impact": "Demonstrates readiness for senior-level responsibilities"
    }
  ],
  "strategy": {
    "apply_in_job": "Lead financial analysis for new business initiatives",
    "show_results": "Present quarterly results with actionable insights",
    "position_for_promotion": "Discuss career progression during performance reviews"
  }
}
```

### Enhanced Endpoint: `/career-pathways/high-paying-jobs` (POST)

**Now Includes**:
- **STRICT domain filtering**: Only jobs in user's domain
- Salary growth calculation
- Domain-aligned job recommendations
- Position level matching

**Request Body**:
```json
{
  "email": "user@example.com",
  "skills": ["financial analysis", "excel", "accounting"],
  "current_job_role": "Financial Analyst",
  "job_domain": "Business & Commerce",
  "position_level": "Mid-Level",
  "current_salary": 75000
}
```

**Response Includes**:
```json
{
  "jobs": [
    {
      "role": "Senior Financial Analyst",
      "company": "Goldman Sachs",
      "salary": "$120,000",
      "salary_growth": "+$45,000",
      "match_percent": 85.5,
      "missing_skills": ["Bloomberg Terminal", "Risk Management"],
      "to_qualify": [
        "Master: Bloomberg Terminal, Risk Management, Advanced Excel",
        "Build portfolio projects in Business & Commerce"
      ],
      "domain_aligned": true
    }
  ],
  "domain": "Business & Commerce",
  "current_role": "Financial Analyst",
  "position_level": "Mid-Level",
  "total_domain_aligned": 12
}
```

### Updated Endpoint: `/get-user` (GET)

**Now Returns**:
```json
{
  "email": "user@example.com",
  "skills": ["financial analysis", "excel"],
  "category": "business_commerce",
  "category_display": "Business & Commerce",
  "profile": {
    "current_job_role": "Financial Analyst",
    "job_domain": "Business & Commerce",
    "position_level": "Mid-Level",
    "current_salary": 75000
  },
  "roadmap": {...},
  "updated_at": "2026-05-05T10:30:00"
}
```

## 🔹 Domain-Specific Processing Logic

### 1. Domain-Based Filtering
- All career pathways are filtered by user's domain
- Jobs outside the domain are excluded
- Skills recommendations are domain-specific
- Projects are realistic for the domain

### 2. Role & Position Mapping
- Current role + level → Next promotion level
- Domain-specific career progression paths
- Realistic salary brackets per domain
- Industry-standard skill requirements

### 3. Salary-Based Career Growth
- Current salary → Next level estimate (typically +15%)
- Next level → Senior level estimate (typically +35%)
- Domain-specific salary benchmarks
- Salary growth potential displayed

### 4. Domain-Specific Skill Gap Analysis
Skills are categorized into:
- **Core**: Domain-specific competencies
- **Tools**: Industry-standard software/platforms
- **Leadership**: Management and team skills
- **Impact**: Business and strategic skills

### 5. Domain-Specific Project Recommendations
Examples by domain:
- **Marketing**: Run campaign, analyze ROI, market research
- **Finance**: Build financial model, valuation analysis, risk assessment
- **Healthcare**: Process optimization, patient outcomes, clinical protocols
- **Engineering**: Technical design, process improvement, innovation
- **Design**: Product design, user research, design systems
- **Business**: Strategic initiatives, operational excellence, market expansion

### 6. Higher-Paid Jobs Alignment
- Filter jobs by domain first
- Match by role and position level
- Calculate salary growth potential
- Show domain-specific qualification steps

## 🧠 Gemini Integration Updates

### Enhanced Prompts
All Gemini prompts now include:
- User's current role
- User's domain
- User's position level
- User's current salary
- Explicit instruction: "Generate ONLY [domain]-specific outputs"

### Example Prompt Structure
```
You are a Senior Career Strategy Architect specializing in [DOMAIN].

USER PROFESSIONAL PROFILE:
- Current Role: [ROLE]
- Domain: [DOMAIN]
- Position Level: [LEVEL]
- Current Salary: $[SALARY]
- Skills: [SKILLS]

CRITICAL INSTRUCTIONS:
1. Generate ONLY [DOMAIN]-specific career guidance
2. Do NOT suggest roles outside this domain
3. Projects MUST be realistic for [DOMAIN] professionals
4. Salary progression should reflect [DOMAIN] industry benchmarks
5. Skills should be domain-specific tools and competencies
```

## 📊 Output Requirements

All outputs now:
- ✅ Are relevant to the user's domain
- ✅ Reflect real industry standards
- ✅ Avoid generic or unrelated suggestions
- ✅ Include salary progression estimates
- ✅ Show domain-specific skill gaps
- ✅ Provide realistic project examples
- ✅ Filter jobs by domain

## 🧪 Validation & Testing

### Test Cases

#### Marketing User
- Domain: Business & Commerce (Marketing)
- Role: Marketing Manager
- Level: Mid-Level
- Salary: $65,000

**Expected Outputs**:
- Next role: Senior Marketing Manager
- Skills: Campaign management, analytics, market research
- Projects: Run marketing campaign, analyze ROI
- Jobs: Only marketing-related positions

#### Finance User
- Domain: Business & Commerce (Finance)
- Role: Financial Analyst
- Level: Mid-Level
- Salary: $75,000

**Expected Outputs**:
- Next role: Senior Financial Analyst
- Skills: Financial modeling, valuation, risk analysis
- Projects: Build financial model, valuation analysis
- Jobs: Only finance-related positions

#### Healthcare User
- Domain: Medical & Healthcare
- Role: Clinical Research Coordinator
- Level: Entry
- Salary: $45,000

**Expected Outputs**:
- Next role: Senior Clinical Research Coordinator
- Skills: Clinical protocols, patient management, regulatory compliance
- Projects: Process optimization, patient outcomes
- Jobs: Only healthcare-related positions

#### Engineering User
- Domain: Engineering
- Role: Chemical Engineer
- Level: Senior
- Salary: $95,000

**Expected Outputs**:
- Next role: Lead Chemical Engineer
- Skills: Process design, optimization, innovation
- Projects: Technical design, process improvement
- Jobs: Only engineering-related positions

## 🚀 Implementation Checklist

- ✅ Backend: New `/update-user-profile` endpoint
- ✅ Backend: Enhanced `/career-pathways/promotion` with domain logic
- ✅ Backend: Enhanced `/career-pathways/high-paying-jobs` with domain filtering
- ✅ Backend: Updated `/get-user` to include profile data
- ✅ Frontend: ProfileEditor component
- ✅ Frontend: Updated CareerPathways component
- ✅ Frontend: Updated Dashboard with ProfileEditor
- ✅ Frontend: Updated API service with new endpoints
- ✅ Gemini prompts: Domain-specific instructions
- ✅ Database: User profile fields stored
- ✅ Validation: All inputs validated
- ✅ Error handling: Comprehensive error messages

## 📝 User Flow

1. **User logs in** → Dashboard loads
2. **ProfileEditor appears** → User fills in professional profile
3. **Profile saved** → Data stored in MongoDB
4. **User uploads resume or adds skills** → Skills extracted/added
5. **Career Pathways accessed** → Profile data loaded automatically
6. **Promotion pathway generated** → Domain-specific, salary-aware
7. **High-paying jobs shown** → Filtered by domain, sorted by salary growth
8. **Roadmap generated** → Domain-specific learning path

## 🔒 Data Privacy

- Profile data stored securely in MongoDB
- Email-based user identification
- JWT authentication for all endpoints
- No sensitive data exposed in responses

## 📚 API Documentation

### ProfileEditor Integration
```javascript
// In CareerPathways or any component
import { updateUserProfile, me } from '../../services/api';

// Update profile
const response = await updateUserProfile({
  email: userEmail,
  current_job_role: "Marketing Manager",
  job_domain: "Business & Commerce",
  position_level: "Mid-Level",
  current_salary: 65000
});

// Get profile
const userResponse = await me();
const profile = userResponse.data.user.profile;
```

### Promotion Pathway with Profile
```javascript
// Pass profile data to API
const response = await getPromotionPathway(
  email,
  skills,
  currentRole,
  {
    current_job_role: "Marketing Manager",
    job_domain: "Business & Commerce",
    position_level: "Mid-Level",
    current_salary: 65000
  }
);
```

## 🎓 Key Improvements

1. **No More Tech Bias**: System respects user's actual domain
2. **Salary Awareness**: Estimates salary progression based on domain
3. **Role-Specific**: Recommendations match current role and level
4. **Industry Standards**: Reflects real career paths in each domain
5. **Realistic Projects**: Projects are achievable in user's domain
6. **Better Matching**: Jobs filtered by domain first, then skills
7. **Complete Context**: Gemini has full professional context
8. **User Control**: Users can edit profile anytime

## 🔄 Future Enhancements

- [ ] Resume parsing to auto-fill profile fields
- [ ] Industry benchmarking for salary estimates
- [ ] Mentor matching based on domain and level
- [ ] Certification recommendations by domain
- [ ] Peer comparison (anonymized)
- [ ] Career path templates by domain
- [ ] Interview preparation by domain
- [ ] Networking suggestions by domain

---

**Version**: 1.0  
**Last Updated**: May 5, 2026  
**Status**: ✅ Production Ready
