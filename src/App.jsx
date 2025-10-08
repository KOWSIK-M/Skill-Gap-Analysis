import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home/homepage.jsx";
import Signin from "./components/Auth/SignIn.jsx";
import Signup from "./components/Auth/SignUp.jsx";
import Stdashboard from "./components/StDashboard/Dashboard.jsx";
import SkillGapAnalysis from "./components/StDashboard/SkillGapAnalysis.jsx";
import Recommendations from "./components/StDashboard/Recommendations.jsx";
import TrainingResources from "./components/StDashboard/TrainingPlatforms.jsx";
import PlanAndProgress from "./components/StDashboard/PlanAndProgress.jsx";
import HrDashboard from "./components/HrDashboard/HDashboard.jsx";
import RoleManagement from "./components/HrDashboard/RoleManagement.jsx";
import ApplicationsReview from "./components/HrDashboard/Applications.jsx";
import EmployeeAnalytics from "./components/HrDashboard/EmployeeAnalytics.jsx";
import ResumeAnalysisPage from "./components/StDashboard/ResumeAnalysisPage.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Stdashboard />} />
        <Route path="/profile" element={<ResumeAnalysisPage />} />
        <Route path="/skillgap" element={<SkillGapAnalysis />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/training" element={<TrainingResources />} />
        <Route path="/planprogress" element={<PlanAndProgress />} />
        <Route path="/hrdashboard" element={<HrDashboard />} />
        <Route path="/rolemanagement" element={<RoleManagement />} />
        <Route path="/applications" element={<ApplicationsReview />} />
        <Route path="/employeeanalytics" element={<EmployeeAnalytics />} />


      </Routes>
    </Router>
  );
}

export default App;
