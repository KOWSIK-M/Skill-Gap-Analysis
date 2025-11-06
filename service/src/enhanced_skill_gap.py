# enhanced_skill_gap_with_course_recommendations.py
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import re
from datetime import datetime
import os


# Enhanced data structures
class SkillWithProficiency(BaseModel):
    name: str
    proficiency: float
    level: str
    confidence: str
    verified: bool
    experience_months: int
    category: str


class CourseRecommendation(BaseModel):
    id: str
    skillId: str
    platform: str
    title: str
    instructor: str
    duration: str
    difficulty: str
    rating: float
    students: int
    price: str
    originalPrice: str
    url: str
    features: List[str]
    durationCategory: str
    platformIcon: str
    description: str
    relevanceScore: float


class LearningPathStep(BaseModel):
    step: int
    title: str
    description: str
    duration: str
    skills: List[str]
    status: str
    courses: List[str]


class RecommendationResponse(BaseModel):
    missingSkills: List[Dict]
    courseRecommendations: List[CourseRecommendation]
    learningPathway: List[LearningPathStep]
    insights: List[str]
    progressPercentage: float


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


class CourseRecommendationEngine:
    def __init__(self):
        self.coursera_df = None
        self.udemy_web_df = None
        self.udemy_design_df = None
        self.udemy_business_df = None
        self.udemy_music_df = None
        self.job_roles_df = None
        self.skill_keywords = self._build_skill_keywords()

    def load_all_datasets(self):
        """Load all course datasets"""
        try:
            # Load Coursera dataset
            self.coursera_df = pd.read_csv("data/Coursera.csv", encoding='utf-8')
            print(f"✅ Loaded Coursera dataset: {len(self.coursera_df)} courses")

            # Load Udemy datasets
            self.udemy_web_df = pd.read_csv("data/3.1-data-sheet-udemy-courses-web-development.csv", encoding='utf-8')
            print(f"✅ Loaded Udemy Web Development: {len(self.udemy_web_df)} courses")

            self.udemy_design_df = pd.read_csv("data/3.1-data-sheet-udemy-courses-design-courses.csv", encoding='utf-8')
            print(f"✅ Loaded Udemy Design: {len(self.udemy_design_df)} courses")

            self.udemy_business_df = pd.read_csv("data/3.1-data-sheet-udemy-courses-business-courses.csv",
                                                 encoding='utf-8')
            print(f"✅ Loaded Udemy Business: {len(self.udemy_business_df)} courses")

            self.udemy_music_df = pd.read_csv("data/3.1-data-sheet-udemy-courses-music-courses.csv", encoding='utf-8')
            print(f"✅ Loaded Udemy Music: {len(self.udemy_music_df)} courses")

            # Load job roles dataset
            self.job_roles_df = pd.read_csv("data/IT_Job_Roles_Skills.csv", encoding="ISO-8859-1")
            self.job_roles_df['Skills'] = self.job_roles_df['Skills'].apply(
                lambda x: [s.strip() for s in str(x).split(',')])
            print(f"✅ Loaded Job Roles: {len(self.job_roles_df)} roles")

            return True

        except Exception as e:
            print(f"❌ Error loading datasets: {e}")
            return False

    def _build_skill_keywords(self):
        """Build skill-to-keyword mapping for course matching"""
        return {
            'python': ['python', 'programming', 'coding', 'development'],
            'java': ['java', 'spring', 'j2ee', 'jsp'],
            'javascript': ['javascript', 'js', 'ecmascript', 'node.js'],
            'react': ['react', 'reactjs', 'frontend', 'ui'],
            'html': ['html', 'html5', 'web development'],
            'css': ['css', 'css3', 'styling'],
            'node.js': ['node', 'nodejs', 'backend', 'express'],
            'mongodb': ['mongodb', 'mongo', 'database', 'nosql'],
            'sql': ['sql', 'database', 'mysql', 'postgresql'],
            'git': ['git', 'github', 'version control'],
            'docker': ['docker', 'container', 'devops'],
            'aws': ['aws', 'amazon web services', 'cloud'],
            'machine learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
            'data analysis': ['data analysis', 'analytics', 'pandas', 'numpy'],
            'spring boot': ['spring boot', 'spring', 'java'],
            'hibernate': ['hibernate', 'orm', 'java'],
            'rest apis': ['rest', 'api', 'apis', 'web services'],
            'linux': ['linux', 'unix', 'operating system'],
            'ci/cd': ['ci/cd', 'continuous integration', 'jenkins'],
            'kubernetes': ['kubernetes', 'k8s', 'container orchestration'],
            'problem solving': ['problem solving', 'algorithms', 'data structures'],
            'communication': ['communication', 'soft skills', 'teamwork']
        }

    def find_courses_for_skill(self, skill_name: str, limit: int = 3) -> List[CourseRecommendation]:
        """Find relevant courses for a specific skill across all datasets"""
        courses = []
        course_id_counter = 1

        # Normalize skill name
        normalized_skill = skill_name.lower()

        # Get relevant keywords for this skill
        keywords = self.skill_keywords.get(normalized_skill, [normalized_skill])

        print(f"🔍 Searching courses for skill: {skill_name} with keywords: {keywords}")

        # Search in Coursera dataset
        if self.coursera_df is not None:
            coursera_courses = self._search_coursera_courses(keywords, limit // 2)
            for course_data in coursera_courses:
                course = self._create_course_recommendation(course_data, skill_name, course_id_counter, "Coursera")
                courses.append(course)
                course_id_counter += 1

        # Search in Udemy datasets
        udemy_courses = self._search_udemy_courses(keywords, limit - len(courses))
        for course_data in udemy_courses:
            course = self._create_course_recommendation(course_data, skill_name, course_id_counter, "Udemy")
            courses.append(course)
            course_id_counter += 1

        # If still not enough courses, create generic ones
        if len(courses) < limit:
            remaining = limit - len(courses)
            generic_courses = self._create_generic_courses(skill_name, remaining, course_id_counter)
            courses.extend(generic_courses)

        print(f"✅ Found {len(courses)} courses for {skill_name}")
        return courses[:limit]

    def _search_coursera_courses(self, keywords: List[str], limit: int) -> List[Dict]:
        """Search for courses in Coursera dataset"""
        courses = []
        if self.coursera_df is None:
            return courses

        for _, row in self.coursera_df.iterrows():
            if len(courses) >= limit:
                break

            course_text = f"{str(row.get('Course Name', '')).lower()} {str(row.get('Course Description', '')).lower()} {str(row.get('Skills', '')).lower()}"

            # Check if any keyword matches
            for keyword in keywords:
                if keyword.lower() in course_text:
                    course_data = {
                        'title': row.get('Course Name', 'Unknown Course'),
                        'instructor': row.get('University', 'Unknown Instructor'),
                        'platform': 'Coursera',
                        'duration': '4-6 weeks',  # Default for Coursera
                        'difficulty': row.get('Difficulty Level', 'Beginner'),
                        'rating': float(row.get('Course Rating', 4.0)),
                        'students': 10000,  # Default estimate
                        'price': 'Free' if 'free' in str(row.get('Course URL', '')).lower() else '$49',
                        'url': row.get('Course URL', '#'),
                        'description': row.get('Course Description', 'No description available'),
                        'features': self._extract_features_from_description(str(row.get('Course Description', '')))
                    }
                    courses.append(course_data)
                    break

        return courses

    def _search_udemy_courses(self, keywords: List[str], limit: int) -> List[Dict]:
        """Search for courses in Udemy datasets"""
        courses = []
        udemy_dfs = [
            (self.udemy_web_df, 'Web Development'),
            (self.udemy_design_df, 'Design'),
            (self.udemy_business_df, 'Business'),
            (self.udemy_music_df, 'Music')
        ]

        for df, category in udemy_dfs:
            if df is None or len(courses) >= limit:
                continue

            for _, row in df.iterrows():
                if len(courses) >= limit:
                    break

                course_text = f"{str(row.get('course_title', '')).lower()} {str(row.get('subject', '')).lower()}"

                for keyword in keywords:
                    if keyword.lower() in course_text:
                        price = float(row.get('price', 0))
                        course_data = {
                            'title': row.get('course_title', 'Unknown Course'),
                            'instructor': 'Udemy Instructor',
                            'platform': 'Udemy',
                            'duration': f"{row.get('content_duration', 0)} hours",
                            'difficulty': row.get('level', 'All Levels'),
                            'rating': float(row.get('Rating', 4.0)),
                            'students': int(row.get('num_subscribers', 1000)),
                            'price': 'Free' if price == 0 else f'${price}',
                            'url': row.get('url', '#'),
                            'description': f"Learn {keyword} through this comprehensive course",
                            'features': ['Hands-on Projects', 'Lifetime Access', 'Certificate of Completion']
                        }
                        courses.append(course_data)
                        break

        return courses

    def _create_course_recommendation(self, course_data: Dict, skill_name: str, course_id: int,
                                      platform: str) -> CourseRecommendation:
        """Create a CourseRecommendation object from course data"""
        return CourseRecommendation(
            id=f"course_{course_id}",
            skillId=skill_name,
            platform=platform,
            title=course_data['title'],
            instructor=course_data['instructor'],
            duration=course_data['duration'],
            difficulty=course_data['difficulty'],
            rating=course_data['rating'],
            students=course_data['students'],
            price=course_data['price'],
            originalPrice=course_data['price'],
            url=course_data['url'],
            features=course_data['features'],
            durationCategory=self._categorize_duration(course_data['duration']),
            platformIcon=self._get_platform_icon(platform),
            description=course_data['description'],
            relevanceScore=0.8  # High relevance for matched courses
        )

    def _create_generic_courses(self, skill_name: str, count: int, start_id: int) -> List[CourseRecommendation]:
        """Create generic course recommendations when specific ones aren't available"""
        courses = []

        platforms = [
            ("Coursera", "University Partner", "Free", "6 weeks"),
            ("Udemy", "Expert Instructor", "$11.99", "8 hours"),
            ("YouTube", "Free Tutorial", "Free", "3 hours")
        ]

        for i in range(count):
            platform, instructor, price, duration = platforms[i % len(platforms)]

            course = CourseRecommendation(
                id=f"course_{start_id + i}",
                skillId=skill_name,
                platform=platform,
                title=f"Learn {skill_name} - Complete Course",
                instructor=instructor,
                duration=duration,
                difficulty="Beginner to Intermediate",
                rating=4.5 + (i * 0.1),
                students=5000 * (i + 1),
                price=price,
                originalPrice=price,
                url="#",
                features=[f"{skill_name} Fundamentals", "Practical Exercises", "Real-world Projects"],
                durationCategory="short" if "hour" in duration else "medium",
                platformIcon=self._get_platform_icon(platform),
                description=f"Comprehensive course to master {skill_name} from basics to advanced concepts",
                relevanceScore=0.6  # Medium relevance for generic courses
            )
            courses.append(course)

        return courses

    def _extract_features_from_description(self, description: str) -> List[str]:
        """Extract key features from course description"""
        features = []
        description_lower = description.lower()

        if any(word in description_lower for word in ['project', 'hands-on', 'practical']):
            features.append("Hands-on Projects")
        if any(word in description_lower for word in ['certificate', 'certification']):
            features.append("Certificate of Completion")
        if any(word in description_lower for word in ['video', 'lecture']):
            features.append("Video Lectures")
        if any(word in description_lower for word in ['quiz', 'exercise', 'assignment']):
            features.append("Practice Exercises")

        return features if features else ["Comprehensive Content", "Expert Instruction"]

    def _categorize_duration(self, duration: str) -> str:
        """Categorize course duration"""
        duration_lower = str(duration).lower()
        if any(word in duration_lower for word in ['hour', 'minute']):
            return 'short'
        elif any(word in duration_lower for word in ['week', 'month']):
            return 'medium'
        else:
            return 'long'

    def _get_platform_icon(self, platform: str) -> str:
        """Get platform icon name"""
        icons = {
            'YouTube': 'Youtube',
            'Coursera': 'GraduationCap',
            'Udemy': 'GraduationCap'
        }
        return icons.get(platform, 'GraduationCap')

    def get_required_skills_for_role(self, job_role: str) -> List[str]:
        """Get required skills for a job role from dataset"""
        if self.job_roles_df is None:
            return ["Python", "SQL", "Git", "Problem Solving"]

        job_role_lower = job_role.lower().strip()

        # Exact match first
        for _, row in self.job_roles_df.iterrows():
            if job_role_lower == row['Job Title'].lower():
                return row['Skills']

        # Partial match
        for _, row in self.job_roles_df.iterrows():
            if job_role_lower in row['Job Title'].lower() or row['Job Title'].lower() in job_role_lower:
                return row['Skills']

        # Fallback skills
        return self._get_fallback_skills(job_role_lower)

    def _get_fallback_skills(self, job_role_lower: str) -> List[str]:
        """Get fallback skills based on job role keywords"""
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
            return ["Problem Solving", "Git", "SQL", "Communication", "Agile"]

    def generate_learning_pathway(self, missing_skills: List[str], job_role: str) -> List[LearningPathStep]:
        """Generate AI-powered learning pathway"""
        steps = []

        # Group skills by complexity
        foundational_skills = [skill for skill in missing_skills if
                               skill.lower() in ['git', 'html', 'css', 'problem solving']]
        core_skills = [skill for skill in missing_skills if skill.lower() in ['python', 'javascript', 'java', 'sql']]
        advanced_skills = [skill for skill in missing_skills if skill not in foundational_skills + core_skills]

        step_number = 1

        # Step 1: Foundational skills
        if foundational_skills:
            steps.append(LearningPathStep(
                step=step_number,
                title=f"Master {', '.join(foundational_skills[:2])} Fundamentals",
                description=f"Build essential foundation for {job_role} role",
                duration="2 weeks",
                skills=foundational_skills,
                status="current",
                courses=[f"course_{i}" for i in range(1, min(3, len(foundational_skills) + 1))]
            ))
            step_number += 1

        # Step 2: Core programming skills
        if core_skills:
            steps.append(LearningPathStep(
                step=step_number,
                title=f"Learn Core Programming: {', '.join(core_skills[:2])}",
                description="Develop strong programming fundamentals",
                duration="3 weeks",
                skills=core_skills,
                status="upcoming",
                courses=[f"course_{i}" for i in
                         range(len(foundational_skills) + 1, len(foundational_skills) + len(core_skills) + 1)]
            ))
            step_number += 1

        # Step 3: Advanced skills
        if advanced_skills:
            steps.append(LearningPathStep(
                step=step_number,
                title="Advanced Technologies & Specializations",
                description="Master advanced concepts specific to your target role",
                duration="4 weeks",
                skills=advanced_skills,
                status="upcoming",
                courses=[f"course_{i}" for i in range(len(foundational_skills) + len(core_skills) + 1,
                                                      len(foundational_skills) + len(core_skills) + len(
                                                          advanced_skills) + 1)]
            ))

        return steps

    def generate_learning_insights(self, missing_skills: List[str], job_role: str, match_score: float) -> List[str]:
        """Generate AI-powered learning insights"""
        insights = []

        if match_score >= 80:
            insights.append("🎉 Excellent match! Focus on mastering advanced concepts in your strongest areas.")
        elif match_score >= 60:
            insights.append("📈 Good foundation! Work on your missing skills to become highly competitive.")
        else:
            insights.append("🚀 Great opportunity for growth! Start with foundational skills and build systematically.")

        # Skill-specific insights
        tech_skills = [skill for skill in missing_skills if skill.lower() in self.skill_keywords]
        if tech_skills:
            insights.append(f"💻 Focus on: {', '.join(tech_skills[:3])} - these are core technologies for {job_role}")

        if len(missing_skills) <= 3:
            insights.append("⏱️ You can become job-ready in 1-2 months with focused learning!")
        else:
            insights.append("📅 Plan for 2-3 months of consistent learning to master all required skills.")

        insights.append("🎯 Complete the recommended courses in order for maximum learning efficiency.")

        return insights[:4]


# Initialize FastAPI app
app = FastAPI(
    title="Enhanced Skill Gap Analysis with Course Recommendations",
    description="AI-powered skill gap analysis with real course recommendations from Coursera and Udemy",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:2090"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize course recommendation engine
print("🚀 Initializing Enhanced Skill Gap Analysis API...")
course_engine = CourseRecommendationEngine()
datasets_loaded = course_engine.load_all_datasets()

if datasets_loaded:
    print("✅ All datasets loaded successfully!")
else:
    print("⚠️ Running with limited dataset mode")


@app.post("/api/recommendations/generate")
async def generate_recommendations(request: Dict):
    try:
        user_id = request.get("user_id")
        job_role = request.get("job_role")
        current_job_role = request.get("current_job_role", "Software Engineer")
        missing_skills = request.get("missing_skills", [])
        current_skills = request.get("current_skills", [])

        print(f"🎯 Generating recommendations for user: {user_id}")
        print(f"📚 Target role: {job_role}, Current role: {current_job_role}")
        print(f"🔍 Missing skills: {len(missing_skills)}")

        # Generate course recommendations for each missing skill
        all_courses = []
        for skill in missing_skills:
            skill_name = skill.get("name")
            courses = course_engine.find_courses_for_skill(skill_name, limit=2)
            all_courses.extend(courses)

        # Generate learning pathway
        missing_skill_names = [skill.get("name") for skill in missing_skills]
        learning_pathway = course_engine.generate_learning_pathway(missing_skill_names, job_role)

        # Generate insights considering current job role
        total_skills = len(missing_skills) + len(current_skills)
        match_score = (len(current_skills) / total_skills * 100) if total_skills > 0 else 0
        insights = course_engine.generate_learning_insights(missing_skill_names, job_role, match_score)

        # Add career transition insight if switching roles
        if current_job_role.lower() != job_role.lower():
            insights.append(
                f"🔄 You're transitioning from {current_job_role} to {job_role} - focus on role-specific skills!")

        # Calculate progress
        progress_percentage = min(100, max(0, (len(current_skills) / total_skills * 100)))

        response = {
            "missingSkills": missing_skills,
            "courseRecommendations": [course.dict() for course in all_courses],
            "learningPathway": [step.dict() for step in learning_pathway],
            "insights": insights,
            "progressPercentage": progress_percentage
        }

        print(f"✅ Generated {len(all_courses)} course recommendations")
        return response

    except Exception as e:
        print(f"❌ Recommendation generation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")

# Keep your existing endpoints for backward compatibility
@app.post("/internal-analyze", response_model=SkillGapResponse)
async def internal_analyze(request: InternalAnalysisRequest):
    """Your existing skill gap analysis endpoint"""
    try:
        print(f"🔍 Starting analysis for user: {request.user_id}")
        print(f"🎯 Target role: {request.job_role}")

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
        required_skills_list = course_engine.get_required_skills_for_role(request.job_role)

        # Analyze skill matches
        matched_skills, missing_skills = analyze_skill_matches(required_skills_list, enhanced_skills, request.job_role)

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
            partialMatchSkills=[],
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
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# Your existing helper functions (keep them as they are)
def analyze_skill_matches(required_skills, user_skills, job_role):
    # ... (keep your existing implementation)
    matched_skills = []
    missing_skills = []
    user_skill_map = {}
    for skill in user_skills:
        user_skill_map[skill.name.lower()] = skill

    for req_skill in required_skills:
        req_skill_lower = req_skill.lower()
        user_skill = user_skill_map.get(req_skill_lower)

        if user_skill:
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

    return matched_skills, missing_skills


def calculate_match_score(matched_skills, missing_skills):
    total_skills = len(matched_skills) + len(missing_skills)
    return round((len(matched_skills) / total_skills) * 100, 1) if total_skills > 0 else 0


def generate_recommendations(matched_skills, missing_skills, job_role, match_score):
    recommendations = []
    if match_score >= 80:
        recommendations.append("🎉 Excellent match! You're well-qualified for this role.")
    elif match_score >= 60:
        recommendations.append("📈 Good match with some areas for improvement.")
    elif match_score >= 40:
        recommendations.append("🎯 Moderate match - good foundation but needs development.")
    else:
        recommendations.append("🚀 Foundational level - great opportunity for growth.")

    if missing_skills:
        top_missing = [skill['name'] for skill in missing_skills[:3]]
        recommendations.append(f"📚 Focus on learning: {', '.join(top_missing)}")

    return recommendations[:5]


def calculate_time_to_close_gap(missing_skills):
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
    base_salary = 80000
    potential_increase = int(base_salary * (match_score / 100) * 0.3)
    return f"${potential_increase:,} potential increase"


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "datasets_loaded": datasets_loaded,
        "total_job_roles": len(course_engine.job_roles_df) if course_engine.job_roles_df is not None else 0,
        "total_courses": {
            "coursera": len(course_engine.coursera_df) if course_engine.coursera_df is not None else 0,
            "udemy_web": len(course_engine.udemy_web_df) if course_engine.udemy_web_df is not None else 0,
            "udemy_design": len(course_engine.udemy_design_df) if course_engine.udemy_design_df is not None else 0,
            "udemy_business": len(
                course_engine.udemy_business_df) if course_engine.udemy_business_df is not None else 0,
            "udemy_music": len(course_engine.udemy_music_df) if course_engine.udemy_music_df is not None else 0
        }
    }


@app.get("/api/job-roles")
async def get_job_roles():
    """Get job roles from the actual dataset"""
    try:
        if course_engine.job_roles_df is None:
            return [{"name": "Full Stack Developer", "category": "Engineering", "demand": "High"}]

        job_roles = []
        for _, row in course_engine.job_roles_df.iterrows():
            skills = row['Skills'][:5] if len(row['Skills']) > 5 else row['Skills']
            job_roles.append({
                "id": len(job_roles) + 1,
                "name": row['Job Title'],
                "category": "IT",
                "demand": "High",
                "avgSalary": "$80,000 - $120,000",
                "skills": skills
            })

        return job_roles
    except Exception as e:
        return [{"name": "Software Developer", "category": "Engineering", "demand": "High"}]


def start_server():
    """Start the enhanced server"""
    print("🎯 Starting Enhanced Skill Gap Analysis Server...")
    print("🌐 API: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🎓 Course datasets loaded:", datasets_loaded)
    print("💡 New endpoint: POST /api/recommendations/generate")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )


if __name__ == "__main__":
    start_server()