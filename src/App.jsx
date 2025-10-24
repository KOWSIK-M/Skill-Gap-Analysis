import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/Auth/AuthContext.jsx";

// Auth Components
import Home from "./components/Home/homepage.jsx";
import Signin from "./components/Auth/SignIn.jsx";
import Signup from "./components/Auth/SignUp.jsx";

// Student Dashboard Components
import Stdashboard from "./components/StDashboard/Dashboard.jsx";
import MySkills from "./components/StDashboard/MySkills.jsx";
import ResumeAnalysisPage from "./components/StDashboard/ResumeAnalysisPage.jsx";
import SkillGapAnalysis from "./components/StDashboard/SkillGapAnalysis.jsx";
import Recommendations from "./components/StDashboard/Recommendations.jsx";
import TrainingResources from "./components/StDashboard/TrainingPlatforms.jsx";
import PlanAndProgress from "./components/StDashboard/PlanAndProgress.jsx";

// HR Dashboard Components
import HrDashboard from "./components/HrDashboard/HDashboard.jsx";
import RoleManagement from "./components/HrDashboard/RoleManagement.jsx";
import ApplicationsReview from "./components/HrDashboard/Applications.jsx";
import EmployeeAnalytics from "./components/HrDashboard/EmployeeAnalytics.jsx";

// Protected Route component (optional - for routes that require auth)
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Accessible without authentication */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student Dashboard Routes - Protected (require authentication) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Stdashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <MySkills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ResumeAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skillgap"
            element={
              <ProtectedRoute>
                <SkillGapAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <TrainingResources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planprogress"
            element={
              <ProtectedRoute>
                <PlanAndProgress />
              </ProtectedRoute>
            }
          />

          {/* HR Dashboard Routes - Protected (require authentication) */}
          <Route
            path="/hrdashboard"
            element={
              <ProtectedRoute>
                <HrDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rolemanagement"
            element={
              <ProtectedRoute>
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ApplicationsReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employeeanalytics"
            element={
              <ProtectedRoute>
                <EmployeeAnalytics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
