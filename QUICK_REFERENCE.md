# Career Pathways Enhancement - Quick Reference

## 🚀 Quick Start Commands

### Backend
```bash
cd backend
python app.py
```

### Frontend
```bash
cd frontend/frontend
npm run dev
```

## 📋 New API Endpoints

### Update User Profile
```
POST /update-user-profile
Content-Type: application/json
Authorization: Bearer {token}

{
  "email": "user@example.com",
  "current_job_role": "Marketing Manager",
  "job_domain": "Business & Commerce",
  "position_level": "Mid-Level",
  "current_salary": 65000
}
```

### Get Promotion Pathway (with profile)
```
POST /career-pathways/promotion
Content-Type: application/json
Authorization: Bearer {token}

{
  "email": "user@example.com",
  "skills": ["marketing", "analytics"],
  "current_job_role": "Marketing Manager",
  "job_domain": "Business & Commerce",
  "position_level": "Mid-Level",
  "current_salary": 65000
}
```

### Get High-Paying Jobs (with profile)
```
POST /career-pathways/high-paying-jobs
Content-Type: application/json
Authorization: Bearer {token}

{
  "email": "user@example.com",
  "skills": ["marketing", "analytics"],
  "current_job_role": "Marketing Manager",
  "job_domain": "Business & Commerce",
  "position_level": "Mid-Level",
  "current_salary": 65000
}
```

## 🎨 Frontend Components

### ProfileEditor
```jsx
import { ProfileEditor } from '../components/features/ProfileEditor';

<ProfileEditor 
  email={email} 
  onProfileUpdate={(profile) => console.log(profile)}
/>
```

### CareerPathways (Updated)
```jsx
import { CareerPathways } from '../components/features/CareerPathways';

<CareerPathways 
  email={email}
  userSkills={skills}
  onGenerateRoadmap={(role) => console.log(role)}
  onNavigateRecommendations={() => console.log('navigate')}
/>
```

## 📊 Domain List

```javascript
const JOB_DOMAINS = [
  'Computer Science & Technology',
  'Engineering',
  'Medical & Healthcare',
  'Business & Commerce',
  'Science & Research',
  'Arts & Design',
  'Education',
  'Agriculture & Environmental',
  'Psychology & Social Sciences',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Human Resources',
  'Legal',
  'Other'
];
```

## 📊 Position Levels

```javascript
const POSITION_LEVELS = [
  'Entry',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive'
];
```

## 🔍 Key Files

| File | Purpose |
|------|---------|
| `backend/app.py` | Backend endpoints |
| `frontend/frontend/src/components/features/ProfileEditor.jsx` | Profile form component |
| `frontend/frontend/src/components/features/CareerPathways.jsx` | Career pathways display |
| `frontend/frontend/src/pages/Dashboard.jsx` | Main dashboard page |
| `frontend/frontend/src/services/api.js` | API service |

## 🧪 Test Scenarios

### Test 1: Marketing Professional
```
Role: Marketing Manager
Domain: Business & Commerce
Level: Mid-Level
Salary: $65,000
Skills: marketing, digital marketing, analytics, excel
```

### Test 2: Software Engineer
```
Role: Backend Developer
Domain: Computer Science & Technology
Level: Mid-Level
Salary: $95,000
Skills: python, sql, docker, aws, rest api
```

### Test 3: Healthcare Professional
```
Role: Clinical Research Coordinator
Domain: Medical & Healthcare
Level: Entry
Salary: $45,000
Skills: clinical research, patient care, medical ethics
```

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Profile not saving | Check email is passed correctly |
| Generic recommendations | Verify profile data sent to API |
| Jobs not filtered | Ensure job_domain passed to endpoint |
| No salary progression | Verify current_salary is valid number |
| Component not loading | Check browser console for errors |

## 📈 Database Schema

### User Document (MongoDB)
```javascript
{
  email: String,
  skills: [String],
  category: String,
  category_display: String,
  current_job_role: String,        // NEW
  job_domain: String,              // NEW
  position_level: String,          // NEW
  current_salary: Number,          // NEW
  roadmap: Object,
  created_at: Date,
  updated_at: Date
}
```

## 🔐 Authentication

All endpoints require Bearer token:
```javascript
Authorization: Bearer {jwt_token}
```

## 📞 API Response Examples

### Success Response
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "current_job_role": "Marketing Manager",
    "job_domain": "Business & Commerce",
    "position_level": "Mid-Level",
    "current_salary": 65000
  }
}
```

### Error Response
```json
{
  "error": "current_job_role, job_domain, and position_level are required"
}
```

## 🎯 Validation Rules

| Field | Required | Type | Example |
|-------|----------|------|---------|
| current_job_role | Yes | String | "Marketing Manager" |
| job_domain | Yes | String | "Business & Commerce" |
| position_level | Yes | String | "Mid-Level" |
| current_salary | No | Number | 65000 |

## 🚀 Deployment Checklist

- [ ] Backend syntax verified
- [ ] Frontend components tested
- [ ] API endpoints tested
- [ ] Database connection verified
- [ ] Gemini API key configured
- [ ] Authentication working
- [ ] Error handling tested
- [ ] Mobile responsive verified
- [ ] Documentation complete
- [ ] Ready for production

## 📚 Documentation Files

1. `CAREER_PATHWAYS_ENHANCEMENT.md` - Comprehensive documentation
2. `IMPLEMENTATION_GUIDE.md` - Setup and testing guide
3. `ENHANCEMENT_SUMMARY.md` - Executive summary
4. `QUICK_REFERENCE.md` - This file

## 🎓 Key Concepts

### Domain-Driven
All recommendations are filtered by user's domain first

### Salary-Aware
Estimates salary progression based on domain and level

### Role-Specific
Recommendations match current role and position level

### Industry-Standard
Reflects real career paths and skill requirements

### Realistic Projects
Projects are achievable in user's domain

## 🔄 User Flow

1. User logs in
2. ProfileEditor appears
3. User fills in 4 fields
4. Profile saved to database
5. Career Pathways loads profile data
6. Domain-specific recommendations generated
7. Jobs filtered by domain
8. Salary progression shown

## 💡 Pro Tips

- Always pass profile data to API calls
- Validate all inputs before sending
- Handle errors gracefully
- Cache profile data in component state
- Use domain to filter jobs first
- Show salary progression in UI
- Provide helpful error messages

## 🎉 Success Indicators

✅ Profile form displays and saves  
✅ Career pathways are domain-specific  
✅ Salary progression calculated  
✅ Jobs filtered by domain  
✅ No tech-bias in recommendations  
✅ All 4 profile fields used  
✅ Error handling works  
✅ Mobile responsive  

---

**Last Updated**: May 5, 2026  
**Status**: ✅ Ready for Use
