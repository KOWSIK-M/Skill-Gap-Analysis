"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "./Layout";
import { useTheme } from "../Home/ThemeContext";
import API from "../Config/api";
import {
  Target,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Zap,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Brain,
  Rocket,
  Download,
  X,
  ChevronDown,
  Star,
  Clock,
  Award,
  Users,
  BarChart4,
  PieChart as PieChartIcon,
  Filter,
  DownloadCloud,
  Share2,
  Bookmark,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  User,
  Send,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast, Toaster } from "react-hot-toast";
import { useMemo } from "react";

export default function SkillGapAnalysis() {
  // use theme from context instead of local state
  const { isDarkMode } = useTheme();
  const [selectedRole, setSelectedRole] = useState("");
  const [matchScore, setMatchScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeToCloseGap, setTimeToCloseGap] = useState("");
  const [salaryImpact, setSalaryImpact] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("3 months");
  const [animationPlaying, setAnimationPlaying] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const analysisRef = useRef(null);
  const [currentRoleAnalysis, setCurrentRoleAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loadingCurrentRole, setLoadingCurrentRole] = useState(true);

  // Dropdown ref + visibility state (used by RoleSelection)
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Application form state (used in the Apply form)
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    currentRole: "",
    totalExperience: "",
    education: "",
    coverLetter: "",
    availability: "2 weeks",
    salaryExpectation: "",
    referralSource: "",
    portfolioUrl: "",
    linkedinUrl: "",
  });

  // Minimal fallback user data used when no profile is loaded
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "",
    location: "",
    currentRole: "",
    experience: "",
    education: "",
  };

  // New: user profile and skills loaded from backend
  const [userProfile, setUserProfile] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobRoles, setLoadingJobRoles] = useState(false);

  // Sample job roles fallback (moved before useMemo / fetch usage)
  const sampleJobRoles = [
    {
      id: 1,
      name: "Frontend Developer",
      category: "Engineering",
      demand: "Very High",
      avgSalary: "$85,000 - $130,000",
      skills: ["React", "JavaScript", "HTML", "CSS", "TypeScript"],
    },
    {
      id: 2,
      name: "Full Stack Developer",
      category: "Engineering",
      demand: "Very High",
      avgSalary: "$95,000 - $145,000",
      skills: ["React", "Node.js", "JavaScript", "Python", "SQL", "MongoDB"],
    },
    {
      id: 3,
      name: "Data Scientist",
      category: "Data Science",
      demand: "High",
      avgSalary: "$120,000 - $180,000",
      skills: ["Python", "Machine Learning", "SQL", "Statistics", "Pandas"],
    },
    {
      id: 4,
      name: "DevOps Engineer",
      category: "Engineering",
      demand: "High",
      avgSalary: "$100,000 - $150,000",
      skills: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD"],
    },
  ];

  // Enhanced default job roles (used as initial state)
  const enhancedJobRoles = [
    {
      id: 1,
      name: "Frontend Developer",
      category: "Engineering",
      demand: "Very High",
      avgSalary: "$85,000 - $130,000",
      growth: "25% (2022-2032)",
      requiredSkills: [
        {
          name: "HTML",
          category: "Frontend",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "CSS",
          category: "Frontend",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "JavaScript",
          category: "Frontend",
          importance: "Critical",
          experience: "3+ years",
        },
        {
          name: "React",
          category: "Frontend",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "TypeScript",
          category: "Frontend",
          importance: "High",
          experience: "1+ years",
        },
        {
          name: "Git",
          category: "Tools",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "Responsive Design",
          category: "Frontend",
          importance: "High",
          experience: "2+ years",
        },
        {
          name: "UI/UX Principles",
          category: "Design",
          importance: "Medium",
          experience: "1+ years",
        },
      ],
    },
    {
      id: 2,
      name: "Full Stack Developer",
      category: "Engineering",
      demand: "Very High",
      avgSalary: "$95,000 - $145,000",
      growth: "22% (2022-2032)",
      requiredSkills: [
        {
          name: "HTML",
          category: "Frontend",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "CSS",
          category: "Frontend",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "JavaScript",
          category: "Frontend",
          importance: "Critical",
          experience: "3+ years",
        },
        {
          name: "React",
          category: "Frontend",
          importance: "High",
          experience: "2+ years",
        },
        {
          name: "Node.js",
          category: "Backend",
          importance: "High",
          experience: "2+ years",
        },
        {
          name: "MongoDB",
          category: "Database",
          importance: "Medium",
          experience: "1+ years",
        },
        {
          name: "Git",
          category: "Tools",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "TypeScript",
          category: "Frontend",
          importance: "Medium",
          experience: "1+ years",
        },
        {
          name: "AWS",
          category: "Cloud",
          importance: "Medium",
          experience: "1+ years",
        },
        {
          name: "Docker",
          category: "DevOps",
          importance: "Medium",
          experience: "1+ years",
        },
      ],
    },
    {
      id: 3,
      name: "Data Analyst",
      category: "Data Science",
      demand: "High",
      avgSalary: "$65,000 - $110,000",
      growth: "25% (2022-2032)",
      requiredSkills: [
        {
          name: "Python",
          category: "Programming",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "Pandas",
          category: "Data Analysis",
          importance: "High",
          experience: "1+ years",
        },
        {
          name: "SQL",
          category: "Database",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "Data Visualization",
          category: "Visualization",
          importance: "High",
          experience: "1+ years",
        },
        {
          name: "Statistics",
          category: "Mathematics",
          importance: "High",
          experience: "2+ years",
        },
        {
          name: "Excel",
          category: "Tools",
          importance: "Medium",
          experience: "2+ years",
        },
        {
          name: "Tableau",
          category: "Visualization",
          importance: "Medium",
          experience: "1+ years",
        },
        {
          name: "R",
          category: "Programming",
          importance: "Medium",
          experience: "1+ years",
        },
      ],
    },
    {
      id: 4,
      name: "ML Engineer",
      category: "Artificial Intelligence",
      demand: "Very High",
      avgSalary: "$120,000 - $200,000",
      growth: "35% (2022-2032)",
      requiredSkills: [
        {
          name: "Python",
          category: "Programming",
          importance: "Critical",
          experience: "3+ years",
        },
        {
          name: "Machine Learning",
          category: "AI/ML",
          importance: "Critical",
          experience: "2+ years",
        },
        {
          name: "TensorFlow",
          category: "Frameworks",
          importance: "High",
          experience: "1+ years",
        },
        {
          name: "PyTorch",
          category: "Frameworks",
          importance: "High",
          experience: "1+ years",
        },
        {
          name: "SQL",
          category: "Database",
          importance: "Medium",
          experience: "2+ years",
        },
        {
          name: "Data Preprocessing",
          category: "Data Engineering",
          importance: "High",
          experience: "2+ years",
        },
        {
          name: "Deep Learning",
          category: "AI/ML",
          importance: "High",
          experience: "1+ years",
        },
        {
          name: "Statistics",
          category: "Mathematics",
          importance: "Critical",
          experience: "2+ years",
        },
      ],
    },
  ];

  // jobRoles state must exist before useMemo / fetchJobRoles
  const [jobRoles, setJobRoles] = useState(enhancedJobRoles);

  // Filtered job roles based on search
  const filteredJobRoles = useMemo(() => {
    if (!searchTerm) return jobRoles;
    return jobRoles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.skills?.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [jobRoles, searchTerm]);

  // Fetch job roles from backend
  const fetchJobRoles = async () => {
    setLoadingJobRoles(true);
    try {
      console.log("🔄 Fetching job roles from backend...");

      const response = await fetch("http://localhost:8000/api/job-roles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const roles = await response.json();
        console.log("✅ Job roles fetched successfully:", roles);
        setJobRoles(roles);
      } else {
        console.warn("⚠️ API returned non-OK status, using fallback roles");
        // Fallback to sample roles if API fails
        setJobRoles(sampleJobRoles);
      }
    } catch (error) {
      console.error("❌ Error fetching job roles:", error);
      console.log("🔄 Using fallback sample job roles");
      setJobRoles(sampleJobRoles);
    } finally {
      setLoadingJobRoles(false);
    }
  };

  // Fetch user data from backend
  const getUserId = () => {
    try {
      const userDataStr = localStorage.getItem("user");
      if (!userDataStr) return null;
      const parsed = JSON.parse(userDataStr);
      return parsed.id || parsed.userId || parsed._id || null;
    } catch (err) {
      console.error("getUserId error", err);
      return null;
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      toast.error("User not found. Using fallback profile.");
      return;
    }

    try {
      const profileRes = await fetch(
        `${API.USER}/profile/${userId}`,
        {
          credentials: "include",
        }
      );
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        setUserProfile(profileJson);
      }

      const skillsRes = await fetch(
        `${API.SKILLS}/user/${userId}`,
        {
          credentials: "include",
        }
      );
      if (skillsRes.ok) {
        const skillsJson = await skillsRes.json();
        setUserSkills(skillsJson);
      }
    } catch (err) {
      console.error("fetchUserData error", err);
      toast.error("Failed to load user data, using fallback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchJobRoles();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Chart and comparison states
  const [comparisonData, setComparisonData] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [partialMatchSkills, setPartialMatchSkills] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // ---------------------------
  // Fetch user data from backend
  // ---------------------------
  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------
  // Enhanced ML-backed analysis functions
  // ------------------------------------
  const transformComparisonData = (analysisResult) => {
    const allSkills = [
      ...(analysisResult.matchedSkills || []),
      ...(analysisResult.missingSkills || []),
    ];

    return allSkills.map((skill) => ({
      skill: skill.name,
      category: skill.category || "General",
      required: true,
      employeeHas: skill.status === "matched",
      status: skill.status || "missing",
      proficiency: skill.userProficiency || skill.user_proficiency || 0,
      requiredProficiency:
        skill.requiredProficiency || skill.required_proficiency || 70,
      gap: skill.gap || 0,
      importance: getImportanceText(skill.importance || 0.7),
      experience: "N/A",
    }));
  };

  const getImportanceText = (importance) => {
    if (typeof importance === "string") return importance;
    if (importance > 0.7) return "Critical";
    if (importance > 0.5) return "High";
    if (importance > 0.3) return "Medium";
    return "Low";
  };

  const generateChartsData = (analysisResult) => {
    const matchedCount = analysisResult.matchedSkills?.length || 0;
    const missingCount = analysisResult.missingSkills?.length || 0;

    const chartData = [
      {
        name: "Matched Skills",
        value: matchedCount,
        color: "#10B981",
      },
      {
        name: "Missing Skills",
        value: missingCount,
        color: "#EF4444",
      },
    ];

    // Generate market data from required skills
    const allSkills = [
      ...(analysisResult.matchedSkills || []),
      ...(analysisResult.missingSkills || []),
    ];

    const marketData = allSkills.slice(0, 6).map((skill) => ({
      skill:
        skill.name.length > 10
          ? skill.name.substring(0, 10) + "..."
          : skill.name,
      demand: Math.round((skill.importance || 0.5) * 100),
      salary: Math.round((skill.importance || 0.5) * 50 + 70),
    }));

    setChartData(chartData);
    setMarketData(marketData);
  };

  // Basic existing analysis kept as fallback (renamed)
  const analyzeFitBasic = () => {
    if (!selectedRole) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    const role = jobRoles.find((r) => r.name === selectedRole);

    setTimeout(() => {
      const matched = [];
      const missing = [];
      const partialMatch = [];
      const comparison = [];

      role.requiredSkills.forEach((reqSkill) => {
        const userSkill = userSkills.length
          ? userSkills.find((s) => s.name === reqSkill.name)
          : null;
        const fallbackUserSkill = userVerifiedSkills.find(
          (s) => s.name === reqSkill.name
        );

        const skillSource = userSkill || fallbackUserSkill;

        if (skillSource) {
          const proficiency = skillSource.proficiency || 0;
          const gap = Math.max(0, 80 - proficiency);
          if (gap === 0) {
            matched.push({ ...reqSkill, userSkill: skillSource, gap });
          } else {
            partialMatch.push({ ...reqSkill, userSkill: skillSource, gap });
          }
          comparison.push({
            skill: reqSkill.name,
            category: reqSkill.category,
            required: true,
            employeeHas: true,
            status: gap === 0 ? "matched" : "partial",
            proficiency,
            requiredProficiency: 80,
            gap,
            importance: reqSkill.importance,
            experience: reqSkill.experience,
          });
        } else {
          missing.push(reqSkill);
          comparison.push({
            skill: reqSkill.name,
            category: reqSkill.category,
            required: true,
            employeeHas: false,
            status: "missing",
            proficiency: 0,
            requiredProficiency: 80,
            gap: 80,
            importance: reqSkill.importance,
            experience: reqSkill.experience,
          });
        }
      });

      const score = Math.round(
        (matched.length / role.requiredSkills.length) * 100
      );

      const fallbackChartData = [
        { name: "Matched Skills", value: matched.length, color: "#10B981" },
        { name: "Missing Skills", value: missing.length, color: "#EF4444" },
      ];

      const fallbackProgressData = [
        { month: "Jan", current: score, target: 100 },
        { month: "Feb", current: Math.min(100, score + 15), target: 100 },
        { month: "Mar", current: Math.min(100, score + 30), target: 100 },
        { month: "Apr", current: Math.min(100, score + 45), target: 100 },
        { month: "May", current: 100, target: 100 },
      ];

      const fallbackMarketData = [
        { skill: "React", demand: 95, salary: 120 },
        { skill: "Node.js", demand: 88, salary: 110 },
        { skill: "Python", demand: 92, salary: 115 },
        { skill: "AWS", demand: 85, salary: 125 },
      ];

      setComparisonData(comparison);
      setMatchedSkills(matched);
      setMissingSkills(missing);
      setPartialMatchSkills(partialMatch);
      setChartData(fallbackChartData);
      setProgressData(fallbackProgressData);
      setMarketData(fallbackMarketData);
      setMatchScore(score);

      calculateTimeToCloseGap(partialMatch.length + missing.length);
      calculateSalaryImpact(score);

      setAnalysisComplete(true);
      setIsAnalyzing(false);
      toast.success("Fallback analysis completed");
    }, 1200);
  };

  // Add this useEffect to load current role analysis on component mount
  useEffect(() => {
    fetchCurrentRoleAnalysis();
  }, []);

  const fetchCurrentRoleAnalysis = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const response = await fetch(
        `${API.ANALYZE}/current-role/${userId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentRoleAnalysis(data);
      }
    } catch (error) {
      console.error("Error fetching current role analysis:", error);
    } finally {
      setLoadingCurrentRole(false);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const response = await fetch(
        `${API.ANALYZE}/history/${userId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const history = await response.json();
        setAnalysisHistory(history);
      }
    } catch (error) {
      console.error("Error fetching analysis history:", error);
    }
  };

  // New analyzeFit which prefers ML backend if user data available
  // Enhanced ML analysis function
  const analyzeFit = async () => {
    if (!selectedRole) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    try {
      const userId = getUserId();
      const response = await fetch(
        `${API.ANALYZE}/skill-gap/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            jobRole: selectedRole,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const analysisResult = await response.json();
      console.log("Analysis result:", analysisResult);

      // Process the results
      processAnalysisResults(analysisResult);

      // Update current role analysis summary
      setCurrentRoleAnalysis({
        currentRole: selectedRole,
        matchScore: analysisResult.matchScore || 0,
        hasAnalysis: true,
        gapAnalysis: analysisResult.gapAnalysis || null,
      });

      setAnalysisComplete(true);
      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Error in skill gap analysis:", error);
      toast.error(`Analysis failed: ${error.message}`);
      // Fallback to basic analysis
      analyzeFitBasic();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Processes server analysis payload into local state
  // Processes server analysis payload into local state
  const processAnalysisResults = (analysisResult) => {
    setMatchScore(analysisResult.matchScore || 0);

    // Transform data for comparison table - NO PARTIAL MATCHES
    const allSkills = [
      ...(analysisResult.matchedSkills || []),
      ...(analysisResult.missingSkills || []),
    ];

    const transformed = allSkills.map((skill) => ({
      skill: skill.name,
      category: skill.category || "General",
      required: true,
      employeeHas: skill.status === "matched",
      status: skill.status || "missing",
      proficiency: skill.userProficiency || skill.user_proficiency || 0,
      requiredProficiency:
        skill.requiredProficiency || skill.required_proficiency || 70,
      gap: skill.gap || 0,
      importance: getImportanceText(skill.importance || 0.7),
      experience: "N/A",
    }));

    setComparisonData(transformed);

    // Set matched and missing skills (no partial matches)
    setMatchedSkills(analysisResult.matchedSkills || []);
    setMissingSkills(analysisResult.missingSkills || []);
    setPartialMatchSkills([]); // Always empty array - no partial matches

    // Set recommendations and other data
    setRecommendations(analysisResult.recommendations || []);
    setTimeToCloseGap(analysisResult.timeToCloseGap || "");
    setSalaryImpact(analysisResult.salaryImpact || "");

    // Generate charts data - updated for no partial matches
    generateChartsData(analysisResult);
  };

  // Helper functions
  const calculateTimeToCloseGap = (gapCount) => {
    const months = Math.ceil(gapCount * 1.5);
    setTimeToCloseGap(`${months} months`);
  };

  const calculateSalaryImpact = (score) => {
    const baseSalary = 80000;
    const impact = Math.round((score / 100) * 30000);
    setSalaryImpact(`$${impact} potential increase`);
  };

  const resetAnalysis = () => {
    setSelectedRole("");
    setAnalysisComplete(false);
    setMatchScore(0);
    setComparisonData([]);
    setMatchedSkills([]);
    setMissingSkills([]);
    setPartialMatchSkills([]);
    setChartData([]);
    setShowDetails(false);
    setShowApplicationForm(false);
    setApplicationSubmitted(false);
    setRecommendations([]);
  };

  const getRecommendations = () => {
    const missingSkillsParam = encodeURIComponent(
      JSON.stringify(missingSkills.map((s) => s.name))
    );
    window.location.href = `/recommendations?missingSkills=${missingSkillsParam}`;
  };

  const handleApplyForRole = () => {
    if (userProfile) {
      setApplicationForm((prev) => ({
        ...prev,
        fullName: userProfile.fullName || userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.contactNumber || userProfile.phone || "",
        location: userProfile.location || "",
        currentRole: userProfile.title || "",
        totalExperience: userProfile.totalExperience || "",
        education: userProfile.education?.[0]?.degree || "",
        portfolioUrl: userProfile.portfolioUrl || "",
        linkedinUrl: userProfile.linkedInUrl || userProfile.linkedinUrl || "",
      }));
    } else {
      // fallback to mock
      setApplicationForm((prev) => ({
        ...prev,
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone,
        location: userData.location,
        currentRole: userData.currentRole,
        totalExperience: userData.experience,
        education: userData.education,
      }));
    }
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    // simulate submit
    setTimeout(() => {
      setApplicationSubmitted(true);
      toast.success("Application submitted");
    }, 1200);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm((prev) => ({ ...prev, [name]: value }));
  };

  const exportToPDF = async () => {
    if (!analysisRef.current) return;

    try {
      const canvas = await html2canvas(analysisRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `skill-gap-analysis-${selectedRole
          .replace(/\s+/g, "-")
          .toLowerCase()}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      const pdf = new jsPDF();
      pdf.text(`Skill Gap Analysis for ${selectedRole}`, 20, 20);
      pdf.text(`Match Score: ${matchScore}%`, 20, 40);
      pdf.text(`Analysis Date: ${new Date().toLocaleDateString()}`, 20, 60);
      pdf.save(
        `skill-gap-analysis-${selectedRole
          .replace(/\s+/g, "-")
          .toLowerCase()}.pdf`
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "matched":
        return <CheckCircle size={16} className="text-green-500" />;
      case "missing":
        return <X size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "matched":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
      case "missing":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "matched":
        return "Matched";
      case "missing":
        return "Missing";
      default:
        return "Unknown";
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case "Critical":
        return "text-red-500 bg-red-500/10";
      case "High":
        return "text-amber-500 bg-amber-500/10";
      case "Medium":
        return "text-blue-500 bg-blue-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  // Keep original verified skills fallback set
  const userVerifiedSkills = [
    {
      id: 1,
      name: "React",
      category: "Frontend",
      proficiency: 85,
      level: "Expert",
      verified: true,
      lastVerified: "2024-01-15",
    },
    {
      id: 2,
      name: "Node.js",
      category: "Backend",
      proficiency: 78,
      level: "Advanced",
      verified: true,
      lastVerified: "2024-01-10",
    },
    {
      id: 3,
      name: "Python",
      category: "Programming",
      proficiency: 92,
      level: "Expert",
      verified: true,
      lastVerified: "2024-01-20",
    },
    {
      id: 4,
      name: "JavaScript",
      category: "Frontend",
      proficiency: 88,
      level: "Expert",
      verified: true,
      lastVerified: "2024-01-08",
    },
    {
      id: 5,
      name: "HTML",
      category: "Frontend",
      proficiency: 90,
      level: "Expert",
      verified: true,
      lastVerified: "2024-01-05",
    },
    {
      id: 6,
      name: "CSS",
      category: "Frontend",
      proficiency: 75,
      level: "Advanced",
      verified: true,
      lastVerified: "2024-01-12",
    },
    {
      id: 7,
      name: "Git",
      category: "Tools",
      proficiency: 70,
      level: "Intermediate",
      verified: true,
      lastVerified: "2024-01-18",
    },
    {
      id: 8,
      name: "SQL",
      category: "Database",
      proficiency: 65,
      level: "Intermediate",
      verified: true,
      lastVerified: "2024-01-14",
    },
    {
      id: 9,
      name: "TypeScript",
      category: "Frontend",
      proficiency: 72,
      level: "Intermediate",
      verified: true,
      lastVerified: "2024-01-22",
    },
    {
      id: 10,
      name: "Responsive Design",
      category: "Frontend",
      proficiency: 80,
      level: "Advanced",
      verified: true,
      lastVerified: "2024-01-25",
    },
  ];

  // Loading state UI
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  const RoleSelection = () => (
    <motion.section
      variants={itemVariants}
      className={`rounded-2xl p-6 shadow-2xl border transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-800 border-gray-700 hover:border-gray-600"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Target className="mr-3" size={28} />
            Select Your Target Role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Choose Career Path
              </label>

              {/* Enhanced Searchable Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search job roles..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 transition-all duration-300 font-medium ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    } focus:outline-none`}
                  />
                  <ChevronDown
                    size={24}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                  />
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute z-50 w-full mt-2 rounded-xl border-2 shadow-2xl max-h-80 overflow-y-auto ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {loadingJobRoles ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading job roles...
                        </div>
                      ) : filteredJobRoles.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No job roles found
                        </div>
                      ) : (
                        filteredJobRoles.map((role, idx) => (
                          <div
                            key={role.id || role.name || idx}
                            className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                              isDarkMode
                                ? "border-gray-700 hover:bg-gray-700"
                                : "border-gray-200 hover:bg-gray-50"
                            } ${
                              selectedRole === role.name
                                ? isDarkMode
                                  ? "bg-blue-900/30"
                                  : "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedRole(role.name);
                              setShowDropdown(false);
                              setSearchTerm("");
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {role.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {role.category || "IT"}
                                </p>
                                {role.skills && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {role.skills
                                      .slice(0, 3)
                                      .map((skill, index) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    {role.skills.length > 3 && (
                                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                        +{role.skills.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {role.demand || "High Demand"}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {role.avgSalary || "$80K-$120K"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {selectedRole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center">
                    <CheckCircle size={20} className="text-green-500 mr-2" />
                    <span className="font-medium text-green-800 dark:text-green-300">
                      Selected: {selectedRole}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {selectedRole && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Role Overview
                </label>
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDarkMode
                      ? "border-blue-500/30 bg-blue-500/10"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  {jobRoles
                    .filter((role) => role.name === selectedRole)
                    .map((role) => (
                      <div key={role.id || role.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Demand:
                          </span>
                          <span
                            className={`font-bold ${
                              role.demand === "Very High" || !role.demand
                                ? "text-green-500"
                                : "text-amber-500"
                            }`}
                          >
                            {role.demand || "Very High"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Avg Salary:
                          </span>
                          <span className="font-bold text-blue-500">
                            {role.avgSalary || "$85,000 - $130,000"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Category:
                          </span>
                          <span className="font-bold text-purple-500">
                            {role.category || "Engineering"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={analyzeFit}
          disabled={!selectedRole || isAnalyzing}
          className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl ${
            !selectedRole || isAnalyzing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-3xl"
          } text-white`}
        >
          {isAnalyzing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
              <span>AI Analysis in Progress...</span>
            </>
          ) : (
            <>
              <Zap size={24} />
              <span>Launch Deep Analysis</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.section>
  );

  return (
    <Layout>
      <Toaster position="top-right" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`space-y-6 p-6 min-h-screen ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
        ref={analysisRef}
      >
        {/* Header - Keep existing gradient */}
        <motion.section
          variants={itemVariants}
          className="rounded-2xl p-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-xl"
        >
          {/* ... existing header content ... */}
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-2xl lg:text-3xl font-bold mb-2 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                AI-Powered Skill Gap Analysis
              </motion.h1>
              <motion.p
                className="text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Advanced ML analysis comparing your verified skills with job
                requirements
                {userSkills.length > 0 &&
                  ` using ${userSkills.length} verified skills`}
              </motion.p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="hidden lg:block"
            >
              <Brain size={40} className="text-amber-400" />
            </motion.div>
          </div>
        </motion.section>

        {/* Role Selection - Already has dark mode */}
        <RoleSelection />

        {/* Current Role Analysis Section */}
        {!loadingCurrentRole && currentRoleAnalysis && (
          <motion.section
            variants={itemVariants}
            className={`rounded-2xl p-6 shadow-2xl border ${
              isDarkMode
                ? "bg-gradient-to-br from-green-900/20 to-green-800/30 border-green-500/30 text-white"
                : "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-gray-900"
            }`}
          >
            {/* ... existing content ... */}
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Target className="mr-3 text-green-500" size={28} />
              My Current Role Analysis
            </h2>

            {currentRoleAnalysis.hasAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {currentRoleAnalysis.matchScore}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Match with {currentRoleAnalysis.currentRole}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Required Skills:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentRoleAnalysis.gapAnalysis?.totalSkillsRequired ||
                        0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Matched Skills:
                    </span>
                    <span className="font-semibold text-green-500">
                      {currentRoleAnalysis.gapAnalysis?.skillsMatched || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Missing Skills:
                    </span>
                    <span className="font-semibold text-red-500">
                      {currentRoleAnalysis.gapAnalysis?.skillsMissing || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedRole(currentRoleAnalysis.currentRole);
                      setMatchScore(currentRoleAnalysis.matchScore);
                      setComparisonData(
                        transformComparisonData(currentRoleAnalysis)
                      );
                      setAnalysisComplete(true);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View Full Analysis
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  No current role analysis found. Analyze a role to set it as
                  current.
                </p>
              </div>
            )}
          </motion.section>
        )}

        {analysisComplete && (
          <>
            {/* === Enhanced Analytics Dashboard === */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Match Score Card */}
              <motion.section
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className={`rounded-2xl p-6 shadow-2xl border-2 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500/30 text-white"
                    : "bg-gradient-to-br from-white to-blue-50 border-blue-200 text-gray-900"
                }`}
              >
                {/* ... existing content ... */}
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Award className="mr-3 text-amber-500" size={24} />
                  Career Readiness Score
                </h3>

                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="w-40 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip
                            contentStyle={{
                              background: isDarkMode ? "#374151" : "#ffffff",
                              border: isDarkMode
                                ? "1px solid #4B5563"
                                : "1px solid #e5e7eb",
                              borderRadius: "8px",
                              color: isDarkMode ? "#ffffff" : "#1f2937",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <motion.span
                        className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        {matchScore}%
                      </motion.span>
                      <span className="text-sm text-gray-300">
                        Based on {matchedSkills.length} matched skills out of{" "}
                        {matchedSkills.length + missingSkills.length} total
                      </span>
                    </div>
                  </div>

                  <div className="w-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${matchScore}%` }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-lg font-semibold">
                    Analysis Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div
                      className={`p-4 rounded-lg shadow ${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-300">
                        Matched Skills
                      </div>
                      <div className="text-2xl font-bold">
                        {currentRoleAnalysis.gapAnalysis?.skillsMatched || 0}
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg shadow ${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-300">
                        Missing Skills
                      </div>
                      <div className="text-2xl font-bold">
                        {missingSkills.length}
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg shadow ${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-300">
                        Total Required Skills
                      </div>
                      <div className="text-2xl font-bold">
                        {matchedSkills.length + missingSkills.length}
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg shadow ${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-300">
                        Time to Close Gap
                      </div>
                      <div className="text-2xl font-bold">
                        {timeToCloseGap}
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg shadow ${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-300">
                        Salary Impact
                      </div>
                      <div className="text-2xl font-bold">
                        {salaryImpact}
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg shadow ${
                        isDarkMode ? "bg-gray-700" : "bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-300">
                        Recommendations
                      </div>
                      <div className="text-2xl font-bold">
                        {recommendations.length}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Skills Comparison Table */}
              <motion.section
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className={`rounded-2xl p-6 shadow-2xl border-2 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500/30 text-white"
                    : "bg-gradient-to-br from-white to-blue-50 border-blue-200 text-gray-900"
                }`}
              >
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <BarChart3 className="mr-3 text-amber-500" size={24} />
                  Skills Comparison
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead
                      className={isDarkMode ? "bg-gray-700" : "bg-gray-100"}
                    >
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Skill
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Importance
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Your Proficiency
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Required Proficiency
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Gap
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={
                        isDarkMode
                          ? "bg-gray-800 divide-gray-700 text-white"
                          : "bg-white divide-gray-200 text-gray-900"
                      }
                    >
                      {comparisonData.map((skill, index) => (
                        <tr
                          key={index}
                          className={
                            isDarkMode
                              ? index % 2 === 0
                                ? "bg-gray-800"
                                : "bg-gray-700"
                              : index % 2 === 0
                              ? "bg-gray-50"
                              : "bg-white"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {skill.skill}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {skill.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={getImportanceColor(skill.importance)}
                            >
                              {skill.importance}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {skill.proficiency}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {skill.requiredProficiency}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {skill.gap}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                skill.status
                              )}`}
                            >
                              {getStatusIcon(skill.status)}
                              {getStatusText(skill.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>

              {/* Market Demand and Salary Insights */}
              <motion.section
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className={`rounded-2xl p-6 shadow-2xl border-2 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500/30"
                    : "bg-gradient-to-br from-white to-blue-50 border-blue-200"
                }`}
              >
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <TrendingUp className="mr-3 text-amber-500" size={24} />
                  Market Insights
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {marketData.map((data, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg shadow ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {data.skill}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-2xl font-bold">{data.demand}%</div>
                        <div
                          className={`text-xs font-semibold rounded-full px-3 py-1 ${
                            isDarkMode
                              ? "bg-green-900/30 text-green-400"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          High Demand
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                        Estimated Salary: ${data.salary}K
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Actions and Recommendations */}
            <motion.section
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className={`rounded-2xl p-6 shadow-2xl border-2 ${
                isDarkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500/30 text-white"
                  : "bg-gradient-to-br from-white to-blue-50 border-blue-200 text-gray-900"
              }`}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Lightbulb className="mr-3 text-amber-500" size={24} />
                Next Steps
              </h3>

              <div className="space-y-4">
                <p className="text-gray-300 dark:text-gray-300">
                  Based on your analysis, here are some recommended actions to
                  improve your skills and increase your career opportunities:
                </p>

                <ul className="list-disc list-inside space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={getRecommendations}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md"
                >
                  View Detailed Recommendations
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportToPDF}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-md ${
                    isDarkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Download PDF Report
                </motion.button>
              </div>
            </motion.section>
          </>
        )}

        {/* Application Form */}
        <AnimatePresence>
          {showApplicationForm && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className={`rounded-2xl p-6 shadow-2xl border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">
                {applicationSubmitted
                  ? "Application Submitted"
                  : "Apply for Your Target Role"}
              </h2>

              {applicationSubmitted ? (
                <div className="text-center py-10">
                  <CheckCircle size={48} className="mx-auto text-green-500" />
                  <h3 className="text-lg font-semibold mt-4">
                    Thank you for applying!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 mt-2">
                    Your application has been submitted successfully. We will
                    review your application and get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  {/* Form fields with dark mode support */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/*
                      { label: "Full Name", name: "fullName", type: "text", required: true },
                      { label: "Email", name: "email", type: "email", required: true },
                      { label: "Phone", name: "phone", type: "tel", required: true },
                      { label: "Location", name: "location", type: "text", required: true },
                      { label: "Current Role", name: "currentRole", type: "text", required: true },
                      { label: "Total Experience", name: "totalExperience", type: "text", required: true },
                      { label: "Education", name: "education", type: "text", required: true },
                    */}
                    {[
                      "fullName",
                      "email",
                      "phone",
                      "location",
                      "currentRole",
                      "totalExperience",
                      "education",
                    ].map((field, idx) => (
                      <div key={field}>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          {field.charAt(0).toUpperCase() +
                            field.slice(1).replace(/([A-Z])/g, " $1")}
                        </label>
                        <input
                          type={field === "email" ? "email" : "text"}
                          name={field}
                          value={applicationForm[field]}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          } focus:outline-none`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Cover Letter
                    </label>
                    <textarea
                      name="coverLetter"
                      value={applicationForm.coverLetter}
                      onChange={handleInputChange}
                      rows="4"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      } focus:outline-none`}
                    />
                  </div>

                  {/* Additional form sections with dark mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Availability
                      </label>
                      <div className="relative">
                        <select
                          name="availability"
                          value={applicationForm.availability}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 appearance-none font-medium ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                              : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          } focus:outline-none`}
                        >
                          <option value="2 weeks">Within 2 weeks</option>
                          <option value="1 month">In 1 month</option>
                          <option value="2 months">In 2 months</option>
                          <option value="3 months">In 3 months</option>
                        </select>
                        <ChevronDown
                          size={24}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Salary Expectation
                      </label>
                      <input
                        type="text"
                        name="salaryExpectation"
                        value={applicationForm.salaryExpectation}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        } focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Referral Source */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Referral Source
                    </label>
                    <input
                      type="text"
                      name="referralSource"
                      value={applicationForm.referralSource}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      } focus:outline-none`}
                    />
                  </div>

                  {/* Portfolio and LinkedIn URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Portfolio URL
                      </label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={applicationForm.portfolioUrl}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        } focus:outline-none`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={applicationForm.linkedinUrl}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        } focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="w-full px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md"
                    >
                      Submit Application
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
    },
  },
};
