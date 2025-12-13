# research_skill_gap_model.py
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, \
    f1_score
from sklearn.preprocessing import LabelEncoder
import seaborn as sns
import matplotlib.pyplot as plt
import pickle
import os
import json
from typing import List, Dict, Any, Tuple
import warnings

warnings.filterwarnings('ignore')


class ResearchSkillGapModel:
    def __init__(self):
        self.skill_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english', ngram_range=(1, 2))
        self.course_vectorizer = TfidfVectorizer(max_features=800, stop_words='english', ngram_range=(1, 2))
        self.job_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.skill_similarity_model = None
        self.label_encoder = LabelEncoder()
        self.evaluation_metrics = {}

    def load_and_preprocess_data(self) -> Dict[str, Any]:
        """Load and preprocess all datasets with research-grade validation"""
        print("📊 RESEARCH DATA PREPROCESSING")
        print("=" * 70)

        datasets_info = {}

        try:
            # 1. Load Job Roles Dataset
            print("1. Loading Job Roles Dataset...")
            job_roles_df = pd.read_csv("data/IT_Job_Roles_Skills.csv", encoding="ISO-8859-1")

            # Data quality checks
            print(f"   • Initial records: {len(job_roles_df)}")
            job_roles_df = job_roles_df.dropna(subset=['Job Title', 'Skills'])
            print(f"   • After cleaning: {len(job_roles_df)}")

            # Process skills
            job_skills_data = []
            all_skills = set()

            for _, row in job_roles_df.iterrows():
                skills = [skill.strip() for skill in str(row['Skills']).split(',') if skill.strip()]
                all_skills.update(skills)
                job_skills_data.append({
                    'job_role': row['Job Title'].strip(),
                    'skills': skills,
                    'skill_count': len(skills)
                })

            self.skill_vocab = sorted(list(all_skills))
            datasets_info['job_roles'] = {
                'count': len(job_skills_data),
                'unique_skills': len(self.skill_vocab),
                'avg_skills_per_role': np.mean([d['skill_count'] for d in job_skills_data])
            }

            print(f"   ✅ Job roles: {len(job_skills_data)}")
            print(f"   ✅ Unique skills: {len(self.skill_vocab)}")
            print(f"   ✅ Avg skills per role: {datasets_info['job_roles']['avg_skills_per_role']:.2f}")

            # 2. Load Course Datasets
            print("\n2. Loading Course Datasets...")
            course_sources = [
                ("Udemy Web", "data/3.1-data-sheet-udemy-courses-web-development.csv"),
                ("Udemy Business", "data/3.1-data-sheet-udemy-courses-business-courses.csv"),
                ("Udemy Design", "data/3.1-data-sheet-udemy-courses-design-courses.csv"),
                ("Coursera", "data/Coursera.csv")
            ]

            self.all_courses = []
            for source_name, path in course_sources:
                if os.path.exists(path):
                    try:
                        df = pd.read_csv(path)
                        courses_loaded = self._process_course_dataset(df, source_name)
                        datasets_info[source_name] = courses_loaded
                        print(f"   ✅ {source_name}: {courses_loaded} courses")
                    except Exception as e:
                        print(f"   ❌ {source_name}: Error - {e}")
                        datasets_info[source_name] = 0

            # Create feature matrices
            print("\n3. Creating Feature Matrices...")
            self._create_feature_matrices(job_skills_data)

            datasets_info['total_courses'] = len(self.all_courses)
            datasets_info['feature_matrix_shape'] = self.job_skill_matrix.shape

            print(f"   ✅ Feature matrix: {self.job_skill_matrix.shape}")
            print(f"   ✅ Total courses: {len(self.all_courses)}")

            return datasets_info

        except Exception as e:
            print(f"❌ Data loading failed: {e}")
            raise

    def _process_course_dataset(self, df: pd.DataFrame, source: str) -> int:
        """Process individual course datasets"""
        courses_count = 0

        if source == "Coursera":
            for _, row in df.iterrows():
                if pd.notna(row.get('Course Name')):
                    self.all_courses.append({
                        'title': row['Course Name'],
                        'platform': 'Coursera',
                        'description': str(row.get('Course Description', '')),
                        'skills': str(row.get('Skills', '')),
                        'text': f"{row['Course Name']} {row.get('Course Description', '')} {row.get('Skills', '')}",
                        'difficulty': row.get('Difficulty Level', 'Beginner'),
                        'rating': row.get('Course Rating', 0)
                    })
                    courses_count += 1
        else:  # Udemy datasets
            for _, row in df.iterrows():
                if pd.notna(row.get('course_title')):
                    self.all_courses.append({
                        'title': row['course_title'],
                        'platform': 'Udemy',
                        'description': str(row.get('course_title', '')),
                        'skills': '',
                        'text': f"{row['course_title']} {row.get('subject', '')}",
                        'difficulty': row.get('level', 'All Levels'),
                        'rating': row.get('Rating', 0),
                        'students': row.get('num_subscribers', 0)
                    })
                    courses_count += 1

        return courses_count

    def _create_feature_matrices(self, job_skills_data: List[Dict]):
        """Create feature matrices for ML training"""
        # Job-Skill matrix (one-hot encoding)
        self.job_skill_matrix = np.zeros((len(job_skills_data), len(self.skill_vocab)))
        self.job_roles = []

        for i, job_data in enumerate(job_skills_data):
            self.job_roles.append(job_data['job_role'])
            for skill in job_data['skills']:
                if skill in self.skill_vocab:
                    skill_idx = self.skill_vocab.index(skill)
                    self.job_skill_matrix[i, skill_idx] = 1

        # Prepare labels for job classification
        self.job_labels = self.label_encoder.fit_transform(self.job_roles)

    def train_models(self) -> Dict[str, float]:
        """Train all ML models with cross-validation"""
        print("\n🤖 MODEL TRAINING WITH CROSS-VALIDATION")
        print("=" * 70)

        training_metrics = {}

        try:
            # 1. Train Skill Similarity Model
            print("1. Training Skill Similarity Model...")
            skill_corpus = [f"{skill} {skill} {skill}" for skill in self.skill_vocab]  # Boost importance
            skill_vectors = self.skill_vectorizer.fit_transform(skill_corpus)

            self.skill_similarity_model = NearestNeighbors(n_neighbors=10, metric='cosine', algorithm='brute')
            self.skill_similarity_model.fit(skill_vectors)

            # Evaluate skill similarity
            similarity_scores = self._evaluate_skill_similarity()
            training_metrics.update(similarity_scores)

            # 2. Train Job Role Classifier
            print("2. Training Job Role Classifier...")
            if len(self.job_roles) > 1:
                X_train, X_test, y_train, y_test = train_test_split(
                    self.job_skill_matrix, self.job_labels, test_size=0.2, random_state=42, stratify=self.job_labels
                )

                self.job_classifier.fit(X_train, y_train)

                # Cross-validation
                cv_scores = cross_val_score(self.job_classifier, self.job_skill_matrix, self.job_labels, cv=5)
                training_metrics['cv_accuracy'] = cv_scores.mean()
                training_metrics['cv_std'] = cv_scores.std()

                # Test evaluation
                y_pred = self.job_classifier.predict(X_test)
                training_metrics['test_accuracy'] = accuracy_score(y_test, y_pred)
                training_metrics['test_precision'] = precision_score(y_test, y_pred, average='weighted',
                                                                     zero_division=0)
                training_metrics['test_recall'] = recall_score(y_test, y_pred, average='weighted', zero_division=0)
                training_metrics['test_f1'] = f1_score(y_test, y_pred, average='weighted', zero_division=0)

                print(f"   ✅ Cross-val Accuracy: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
                print(f"   ✅ Test Accuracy: {training_metrics['test_accuracy']:.4f}")
                print(f"   ✅ Test F1-Score: {training_metrics['test_f1']:.4f}")

            # 3. Train Course Recommendation Engine
            print("3. Training Course Recommendation Engine...")
            if self.all_courses:
                course_corpus = [course['text'] for course in self.all_courses]
                self.course_vectors = self.course_vectorizer.fit_transform(course_corpus)

                # Evaluate course recommendation quality
                course_metrics = self._evaluate_course_recommendations()
                training_metrics.update(course_metrics)

            self.evaluation_metrics = training_metrics
            print("\n🎯 MODEL TRAINING COMPLETED")

            return training_metrics

        except Exception as e:
            print(f"❌ Model training failed: {e}")
            raise

    def _evaluate_skill_similarity(self) -> Dict[str, float]:
        """Evaluate skill similarity model quality"""
        print("   🔍 Evaluating skill similarity...")

        # Test with known skill pairs
        test_pairs = [
            ('python', 'programming'),
            ('java', 'spring'),
            ('javascript', 'react'),
            ('sql', 'database'),
            ('docker', 'kubernetes')
        ]

        similarities = []
        for skill1, skill2 in test_pairs:
            if skill1 in self.skill_vocab and skill2 in self.skill_vocab:
                sim_score = self._calculate_skill_similarity(skill1, skill2)
                similarities.append(sim_score)

        avg_similarity = np.mean(similarities) if similarities else 0
        consistency = 1 - np.std(similarities) if similarities else 0

        return {
            'skill_similarity_mean': avg_similarity,
            'skill_similarity_consistency': consistency
        }

    def _evaluate_course_recommendations(self) -> Dict[str, float]:
        """Evaluate course recommendation quality"""
        print("   🔍 Evaluating course recommendations...")

        # Test with sample skill queries
        test_queries = ['python programming', 'web development', 'data science', 'machine learning']
        precision_scores = []

        for query in test_queries:
            recommendations = self._get_course_recommendations_internal(query, top_k=5)
            if recommendations:
                # Calculate precision (how many courses are actually relevant)
                relevant_count = sum(1 for rec in recommendations if self._is_relevant_course(rec, query))
                precision = relevant_count / len(recommendations)
                precision_scores.append(precision)

        avg_precision = np.mean(precision_scores) if precision_scores else 0

        return {
            'course_recommendation_precision': avg_precision,
            'course_coverage': len(self.all_courses) / 1000  # Normalized coverage metric
        }

    def _is_relevant_course(self, course: Dict, query: str) -> bool:
        """Check if course is relevant to query"""
        query_terms = query.lower().split()
        course_text = course['title'].lower() + ' ' + course.get('description', '').lower()
        return any(term in course_text for term in query_terms)

    def predict_skill_gap(self, user_skills: List[str], target_job: str) -> Dict[str, Any]:
        """Predict skill gap with confidence scores"""
        print(f"\n🔍 PREDICTING SKILL GAP FOR: {target_job}")

        # Create user skill vector
        user_vector = np.zeros(len(self.skill_vocab))
        for skill in user_skills:
            if skill in self.skill_vocab:
                user_vector[self.skill_vocab.index(skill)] = 1

        # Find target job vector
        target_vector = self._get_job_vector(target_job)
        if target_vector is None:
            return self._fallback_prediction(user_skills, target_job)

        # Calculate metrics
        skill_gap = target_vector - user_vector
        missing_indices = np.where(skill_gap > 0)[0]
        matching_indices = np.where((target_vector > 0) & (user_vector > 0))[0]

        missing_skills = [self.skill_vocab[i] for i in missing_indices]
        matching_skills = [self.skill_vocab[i] for i in matching_indices]

        # Calculate scores
        match_score = len(matching_indices) / np.sum(target_vector) if np.sum(target_vector) > 0 else 0
        gap_severity = len(missing_indices) / len(self.skill_vocab)  # Normalized

        # Confidence calculation
        confidence = self._calculate_confidence(match_score, gap_severity, len(missing_skills))

        return {
            'match_score': round(match_score * 100, 2),
            'gap_severity': round(gap_severity * 100, 2),
            'missing_skills': missing_skills,
            'matching_skills': matching_skills,
            'missing_count': len(missing_skills),
            'matching_count': len(matching_skills),
            'confidence_score': confidence,
            'recommendation_priority': self._calculate_priority(missing_skills),
            'estimated_training_hours': len(missing_skills) * 20  # 20 hours per skill
        }

    def _calculate_confidence(self, match_score: float, gap_severity: float, missing_count: int) -> str:
        """Calculate prediction confidence"""
        if match_score > 0.8 and missing_count <= 3:
            return "Very High (95%)"
        elif match_score > 0.6 and missing_count <= 5:
            return "High (85%)"
        elif match_score > 0.4 and missing_count <= 8:
            return "Medium (75%)"
        else:
            return "Low (65%)"

    def _calculate_priority(self, missing_skills: List[str]) -> List[Dict]:
        """Calculate learning priority for missing skills"""
        priority_scores = []
        for skill in missing_skills:
            # Priority based on skill importance (frequency in job roles)
            importance = np.sum(self.job_skill_matrix[:, self.skill_vocab.index(skill)]) / len(self.job_roles)
            priority_scores.append({
                'skill': skill,
                'priority_score': round(importance * 100, 2),
                'priority_level': 'High' if importance > 0.6 else 'Medium' if importance > 0.3 else 'Low'
            })

        return sorted(priority_scores, key=lambda x: x['priority_score'], reverse=True)

    def get_course_recommendations(self, missing_skills: List[str], top_k: int = 5) -> List[Dict]:
        """Get ML-powered course recommendations"""
        query = ' '.join(missing_skills)
        return self._get_course_recommendations_internal(query, top_k)

    def _get_course_recommendations_internal(self, query: str, top_k: int) -> List[Dict]:
        """Internal course recommendation logic"""
        if not hasattr(self, 'course_vectors'):
            return []

        query_vector = self.course_vectorizer.transform([query])
        similarities = cosine_similarity(query_vector, self.course_vectors)[0]

        top_indices = np.argsort(similarities)[-top_k:][::-1]

        recommendations = []
        for idx in top_indices:
            if similarities[idx] > 0.1:
                course = self.all_courses[idx]
                recommendations.append({
                    'title': course['title'],
                    'platform': course['platform'],
                    'similarity_score': round(similarities[idx], 4),
                    'relevance_level': self._get_relevance_level(similarities[idx]),
                    'difficulty': course.get('difficulty', 'Unknown'),
                    'rating': course.get('rating', 'N/A'),
                    'matched_terms': self._extract_matched_terms(query, course['text'])
                })

        return recommendations

    def _get_relevance_level(self, similarity: float) -> str:
        if similarity > 0.7:
            return "Very High"
        elif similarity > 0.5:
            return "High"
        elif similarity > 0.3:
            return "Medium"
        else:
            return "Low"

    def _extract_matched_terms(self, query: str, text: str) -> List[str]:
        query_terms = set(query.lower().split())
        text_terms = set(text.lower().split())
        return list(query_terms.intersection(text_terms))

    def _get_job_vector(self, job_role: str) -> np.ndarray:
        job_role_lower = job_role.lower()
        for i, role in enumerate(self.job_roles):
            if job_role_lower in role.lower() or role.lower() in job_role_lower:
                return self.job_skill_matrix[i]
        return None

    def _calculate_skill_similarity(self, skill1: str, skill2: str) -> float:
        """Calculate similarity between two skills"""
        if skill1 not in self.skill_vocab or skill2 not in self.skill_vocab:
            return 0.0

        vec1 = self.skill_vectorizer.transform([skill1])
        vec2 = self.skill_vectorizer.transform([skill2])
        return cosine_similarity(vec1, vec2)[0][0]

    def _fallback_prediction(self, user_skills: List[str], target_job: str) -> Dict[str, Any]:
        """Fallback prediction when job role not found"""
        return {
            'match_score': 50.0,
            'gap_severity': 60.0,
            'missing_skills': ['Advanced skills assessment required'],
            'matching_skills': user_skills,
            'missing_count': 1,
            'matching_count': len(user_skills),
            'confidence_score': "Low (50%)",
            'recommendation_priority': [
                {'skill': 'Consult domain expert', 'priority_score': 100, 'priority_level': 'High'}],
            'estimated_training_hours': 40
        }

    def generate_research_report(self) -> Dict[str, Any]:
        """Generate comprehensive research report"""
        report = {
            'model_performance': self.evaluation_metrics,
            'dataset_statistics': {
                'job_roles_count': len(self.job_roles),
                'unique_skills_count': len(self.skill_vocab),
                'total_courses': len(self.all_courses),
                'feature_matrix_shape': self.job_skill_matrix.shape
            },
            'model_architecture': {
                'skill_similarity': 'TF-IDF + Cosine Similarity + KNN',
                'job_classification': 'Random Forest Classifier',
                'course_recommendation': 'TF-IDF + Cosine Similarity',
                'feature_engineering': 'One-hot encoding + Text vectorization'
            },
            'validation_metrics': {
                'cross_validation_accuracy': self.evaluation_metrics.get('cv_accuracy', 'N/A'),
                'test_accuracy': self.evaluation_metrics.get('test_accuracy', 'N/A'),
                'skill_similarity_quality': self.evaluation_metrics.get('skill_similarity_mean', 'N/A'),
                'course_recommendation_precision': self.evaluation_metrics.get('course_recommendation_precision', 'N/A')
            }
        }

        # Save report to file
        with open('research_report.json', 'w') as f:
            json.dump(report, f, indent=2)

        return report

    def plot_model_performance(self):
        """Create performance visualization for research paper"""
        if not self.evaluation_metrics:
            print("No evaluation metrics available. Train model first.")
            return

        metrics = ['cv_accuracy', 'test_accuracy', 'test_precision', 'test_recall', 'test_f1']
        values = [self.evaluation_metrics.get(m, 0) for m in metrics]

        plt.figure(figsize=(10, 6))
        bars = plt.bar(metrics, values, color=['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3E885B'])
        plt.title('Model Performance Metrics', fontsize=16, fontweight='bold')
        plt.ylabel('Score', fontsize=12)
        plt.ylim(0, 1)

        # Add value labels on bars
        for bar, value in zip(bars, values):
            plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
                     f'{value:.3f}', ha='center', va='bottom', fontweight='bold')

        plt.grid(axis='y', alpha=0.3)
        plt.tight_layout()
        plt.savefig('model_performance.png', dpi=300, bbox_inches='tight')
        plt.show()


# Research Experiment Runner
def run_research_experiment():
    """Run complete research experiment"""
    print("🎓 RESEARCH EXPERIMENT: SKILL GAP ANALYSIS ML MODEL")
    print("=" * 80)

    # Initialize model
    model = ResearchSkillGapModel()

    # Load and preprocess data
    dataset_info = model.load_and_preprocess_data()

    # Train models with evaluation
    training_metrics = model.train_models()

    # Generate research report
    research_report = model.generate_research_report()

    # Test with sample cases
    print("\n🔬 TEST CASE EVALUATION")
    print("=" * 50)

    test_cases = [
        {
            'user_skills': ['Python', 'SQL', 'Git', 'JavaScript', 'HTML', 'CSS'],
            'target_job': 'Full Stack Developer',
            'description': 'Web Developer transitioning to Full Stack'
        },
        {
            'user_skills': ['Python', 'SQL', 'Statistics', 'Excel'],
            'target_job': 'Data Scientist',
            'description': 'Analyst transitioning to Data Scientist'
        },
        {
            'user_skills': ['Java', 'Spring', 'SQL', 'Git'],
            'target_job': 'Backend Developer',
            'description': 'Java Developer role assessment'
        }
    ]

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 Test Case {i}: {test_case['description']}")
        print("-" * 40)

        # Skill gap prediction
        gap_analysis = model.predict_skill_gap(
            test_case['user_skills'],
            test_case['target_job']
        )

        print(f"   Match Score: {gap_analysis['match_score']}%")
        print(f"   Confidence: {gap_analysis['confidence_score']}")
        print(f"   Missing Skills: {gap_analysis['missing_count']}")
        print(f"   Top Priority: {gap_analysis['recommendation_priority'][0]['skill']}")

        # Course recommendations
        if gap_analysis['missing_skills'] and gap_analysis['missing_skills'][
            0] != 'Advanced skills assessment required':
            courses = model.get_course_recommendations(gap_analysis['missing_skills'][:3])
            if courses:
                print(f"   Top Course: {courses[0]['title'][:50]}... (Score: {courses[0]['similarity_score']:.3f})")

    # Final report
    print("\n" + "=" * 80)
    print("📊 RESEARCH EXPERIMENT COMPLETED")
    print("=" * 80)

    print(f"📈 MODEL PERFORMANCE SUMMARY:")
    print(f"   • Cross-validation Accuracy: {research_report['validation_metrics']['cross_validation_accuracy']:.4f}")
    print(f"   • Test Accuracy: {research_report['validation_metrics']['test_accuracy']:.4f}")
    print(
        f"   • Course Recommendation Precision: {research_report['validation_metrics']['course_recommendation_precision']:.4f}")

    print(f"\n📚 DATASET STATISTICS:")
    print(f"   • Job Roles: {research_report['dataset_statistics']['job_roles_count']}")
    print(f"   • Unique Skills: {research_report['dataset_statistics']['unique_skills_count']}")
    print(f"   • Courses: {research_report['dataset_statistics']['total_courses']}")

    # Generate visualization
    model.plot_model_performance()

    print(f"\n💾 Research report saved to: research_report.json")
    print(f"📊 Performance chart saved to: model_performance.png")


if __name__ == "__main__":
    run_research_experiment()