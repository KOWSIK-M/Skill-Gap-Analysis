# enhanced_skill_gap.py - SIMPLE WORKING VERSION
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


# Data structures
class SkillWithProficiency(BaseModel):
    name: str
    proficiency: float
    level: str
    confidence: str
    verified: bool
    experience_months: int
    category: str


class SkillGapResponse(BaseModel):
    jobRole: str
    matchScore: float
    requiredSkills: List[Dict]
    currentSkills: List[Dict]
    missingSkills: List[Dict]
    partialMatchSkills: List[Dict]
    gapAnalysis: Dict
    recommendations: List[str]
    timeToCloseGap: str
    salaryImpact: str
    userId: str


class InternalAnalysisRequest(BaseModel):
    user_id: str
    job_role: str
    profile_data: Dict[str, Any]
    skills_data: List[Dict[str, Any]]


# Load your actual dataset
def load_dataset():
    """Load your actual IT job roles dataset"""
    try:
        # Load your actual CSV file
        df = pd.read_csv("data/IT_Job_Roles_Skills.csv", encoding="ISO-8859-1")
        print(f"✅ Loaded dataset with {len(df)} job roles")

        # Clean the data
        df = df.drop_duplicates(subset=['Job Title'])
        df['Skills'] = df['Skills'].apply(lambda x: [s.strip() for s in str(x).split(',')])

        return df

    except FileNotFoundError:
        print("❌ Dataset file not found at 'data/IT_Job_Roles_Skills.csv'")
        print("📁 Please check the file path and make sure the CSV file exists")
        return None
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        return None


def get_required_skills_for_role(job_role, df):
    """Simple skill matching - find the role and return its skills"""
    if df is None:
        return ["Java", "Python", "SQL", "Git"]  # Fallback skills

    job_role_lower = job_role.lower().strip()

    print(f"🔍 Searching for role: {job_role}")
    print(f"📊 Total roles in dataset: {len(df)}")

    # Simple exact match first
    for _, row in df.iterrows():
        if job_role_lower == row['Job Title'].lower():
            skills = row['Skills']
            print(f"🎯 Exact match found: '{row['Job Title']}' with {len(skills)} skills")
            return skills

    # If no exact match, try partial match
    for _, row in df.iterrows():
        if job_role_lower in row['Job Title'].lower() or row['Job Title'].lower() in job_role_lower:
            skills = row['Skills']
            print(f"🎯 Partial match found: '{row['Job Title']}' with {len(skills)} skills")
            return skills

    # If still no match, return common skills based on keywords
    print(f"⚠️ No direct match found for '{job_role}', using keyword-based skills")
    return get_fallback_skills(job_role_lower)


def get_fallback_skills(job_role_lower):
    """Get fallback skills based on job role keywords"""
    # Common skill sets
    java_skills = ["Java", "Spring Boot", "Hibernate", "SQL", "Maven", "REST APIs", "Git"]
    python_skills = ["Python", "Django", "Flask", "SQL", "REST APIs", "Git"]
    frontend_skills = ["HTML", "CSS", "JavaScript", "React", "Git"]
    data_skills = ["Python", "SQL", "Data Analysis", "Statistics", "Machine Learning"]
    devops_skills = ["Docker", "Kubernetes", "AWS", "Linux", "Git", "CI/CD"]

    if any(word in job_role_lower for word in ['java', 'spring', 'j2ee']):
        return java_skills
    elif any(word in job_role_lower for word in ['python', 'django', 'flask']):
        return python_skills
    elif any(word in job_role_lower for word in ['frontend', 'react', 'angular', 'ui', 'ux']):
        return frontend_skills
    elif any(word in job_role_lower for word in ['data', 'analyst', 'scientist']):
        return data_skills
    elif any(word in job_role_lower for word in ['devops', 'cloud', 'aws']):
        return devops_skills
    else:
        # Default skills for any IT role
        return ["Problem Solving", "Git", "SQL", "Communication", "Agile"]


def analyze_skill_matches(required_skills, user_skills, job_role):
    """Simple skill matching - only matched or missing"""
    matched_skills = []
    missing_skills = []

    # Create user skill map
    user_skill_map = {}
    for skill in user_skills:
        user_skill_map[skill.name.lower()] = skill

    print(f"🔍 Analyzing {len(required_skills)} required skills against {len(user_skills)} user skills")

    for req_skill in required_skills:
        req_skill_lower = req_skill.lower()
        user_skill = user_skill_map.get(req_skill_lower)

        if user_skill:
            # Consider it matched if user has at least 60% proficiency
            if user_skill.proficiency >= 60:
                matched_skills.append({
                    "name": req_skill,
                    "requiredProficiency": 70,
                    "userProficiency": user_skill.proficiency,
                    "gap": 0,
                    "category": "Technical",
                    "importance": 0.7,
                    "status": "matched",
                    "userConfidence": user_skill.confidence
                })
            else:
                missing_skills.append({
                    "name": req_skill,
                    "requiredProficiency": 70,
                    "userProficiency": user_skill.proficiency,
                    "gap": 70 - user_skill.proficiency,
                    "category": "Technical",
                    "importance": 0.7,
                    "status": "missing",
                    "userConfidence": user_skill.confidence
                })
        else:
            # Skill is completely missing
            missing_skills.append({
                "name": req_skill,
                "requiredProficiency": 70,
                "userProficiency": 0,
                "gap": 70,
                "category": "Technical",
                "importance": 0.7,
                "status": "missing",
                "userConfidence": "none"
            })

    print(f"✅ Analysis complete: {len(matched_skills)} matched, {len(missing_skills)} missing")
    return matched_skills, missing_skills


def calculate_match_score(matched_skills, missing_skills):
    """Simple match score calculation"""
    total_skills = len(matched_skills) + len(missing_skills)

    if total_skills == 0:
        return 0

    return round((len(matched_skills) / total_skills) * 100, 1)


def generate_recommendations(matched_skills, missing_skills, job_role, match_score):
    """Generate simple recommendations"""
    recommendations = []

    if match_score >= 80:
        recommendations.append("🎉 Excellent match! You're well-qualified for this role.")
        recommendations.append("Focus on mastering advanced concepts in your strongest areas.")
    elif match_score >= 60:
        recommendations.append("📈 Good match with some areas for improvement.")
        recommendations.append("Work on your missing skills to increase your competitiveness.")
    elif match_score >= 40:
        recommendations.append("🎯 Moderate match - good foundation but needs development.")
        recommendations.append("Create a learning plan for your missing skills.")
    else:
        recommendations.append("🚀 Foundational level - great opportunity for growth.")
        recommendations.append("Start with core skills and build systematically.")

    # Add specific skill recommendations
    if missing_skills:
        top_missing = [skill['name'] for skill in missing_skills[:3]]
        recommendations.append(f"📚 Focus on learning: {', '.join(top_missing)}")

    return recommendations[:5]


def calculate_time_to_close_gap(missing_skills):
    """Simple time estimation"""
    total_missing = len(missing_skills)

    if total_missing == 0:
        return "0 months"
    elif total_missing <= 3:
        return "1-2 months"
    elif total_missing <= 6:
        return "3-4 months"
    else:
        return "5-6 months"


def calculate_salary_impact(match_score, job_role):
    """Simple salary impact calculation"""
    base_salary = 80000
    potential_increase = int(base_salary * (match_score / 100) * 0.3)
    return f"${potential_increase:,} potential increase"


# Initialize FastAPI app
app = FastAPI(
    title="Skill Gap Analysis API",
    description="Simple and effective skill gap analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:2090"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset at startup
print("🚀 Initializing Skill Gap Analysis API...")
df = load_dataset()
if df is None:
    print("⚠️ Running with fallback mode - no dataset loaded")


@app.post("/internal-analyze", response_model=SkillGapResponse)
async def internal_analyze(request: InternalAnalysisRequest):
    try:
        print(f"🔍 Starting analysis for user: {request.user_id}")
        print(f"🎯 Target role: {request.job_role}")
        print(f"🛠️ User skills received: {len(request.skills_data)}")

        # Convert skills data
        enhanced_skills = []
        for skill_data in request.skills_data:
            enhanced_skills.append(SkillWithProficiency(
                name=skill_data.get('name', ''),
                proficiency=skill_data.get('proficiency', 0),
                level=skill_data.get('level', 'intermediate'),
                confidence=skill_data.get('confidence', 'medium'),
                verified=skill_data.get('verified', False),
                experience_months=skill_data.get('experienceMonths', 0),
                category=skill_data.get('category', 'Other')
            ))

        # Get required skills
        required_skills_list = get_required_skills_for_role(request.job_role, df)

        # Analyze skill matches
        matched_skills, missing_skills = analyze_skill_matches(
            required_skills_list, enhanced_skills, request.job_role
        )

        # Calculate results
        match_score = calculate_match_score(matched_skills, missing_skills)
        recommendations = generate_recommendations(matched_skills, missing_skills, request.job_role, match_score)
        time_to_close = calculate_time_to_close_gap(missing_skills)
        salary_impact = calculate_salary_impact(match_score, request.job_role)

        # Prepare response
        response = SkillGapResponse(
            jobRole=request.job_role,
            matchScore=float(match_score),
            requiredSkills=matched_skills + missing_skills,
            currentSkills=[{
                "name": skill.name,
                "proficiency": int(skill.proficiency),
                "level": skill.level,
                "verified": bool(skill.verified),
                "confidence": skill.confidence
            } for skill in enhanced_skills],
            missingSkills=missing_skills,
            partialMatchSkills=[],  # No partial matches
            gapAnalysis={
                "totalSkillsRequired": len(required_skills_list),
                "skillsMatched": len(matched_skills),
                "skillsPartial": 0,
                "skillsMissing": len(missing_skills),
                "averageGap": float(np.mean([s["gap"] for s in missing_skills]) if missing_skills else 0),
                "totalImportanceScore": 1.0
            },
            recommendations=recommendations,
            timeToCloseGap=time_to_close,
            salaryImpact=salary_impact,
            userId=request.user_id
        )

        print(f"✅ Analysis completed - Match Score: {match_score}%")
        return response

    except Exception as e:
        print(f"❌ Analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "dataset_loaded": df is not None,
        "total_job_roles": len(df) if df is not None else 0
    }


@app.get("/api/job-roles")
async def get_job_roles():
    """Get job roles from the actual dataset"""
    try:
        if df is None:
            return [{"name": "Full Stack Developer", "category": "Engineering", "demand": "High"}]

        job_roles = []
        for _, row in df.iterrows():
            skills = row['Skills'][:5] if len(row['Skills']) > 5 else row['Skills']

            job_roles.append({
                "id": len(job_roles) + 1,
                "name": row['Job Title'],
                "category": "IT",
                "demand": "High",
                "avgSalary": "$80,000 - $120,000",
                "skills": skills
            })

        print(f"✅ Returning {len(job_roles)} job roles from dataset")
        return job_roles

    except Exception as e:
        print(f"❌ Error getting job roles: {e}")
        return [{"name": "Software Developer", "category": "Engineering", "demand": "High"}]


def start_server():
    """Start the server"""
    print("🎯 Starting Skill Gap Analysis Server...")
    print("🌐 API: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )


if __name__ == "__main__":
    start_server()