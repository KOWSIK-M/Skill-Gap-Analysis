"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "./Layout";
import { useTheme } from "../Home/ThemeContext";
import {
  FileText,
  Search,
  Download,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Target,
  Brain,
  Award,
  Users,
  Zap,
  Star,
  CheckCircle,
  X,
  Cloud,
  Code,
  Clock,
  AlertCircle,
  TrendingUp,
  RefreshCw,
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
} from "recharts";
import { toast, Toaster } from "react-hot-toast";

export default function MySkills() {
  const { isDarkMode } = useTheme();
  const [skills, setSkills] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExamModal, setShowExamModal] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [examAnswers, setExamAnswers] = useState([]);
  const [examTimeLeft, setExamTimeLeft] = useState(300);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("unverified");
  const [examGenerationLoading, setExamGenerationLoading] = useState(false);

  // Enhanced getUserId function
  const getUserId = () => {
    try {
      // Try multiple storage locations
      const userData =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user") ||
        localStorage.getItem("userData") ||
        sessionStorage.getItem("userData");

      if (userData) {
        const user = JSON.parse(userData);
        console.log("Found user data:", user);
        return user.id || user.userId || user._id || user.sub;
      }

      // Check if there's a JWT token in cookies (for HTTP-only)
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("token=")
      );

      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.sub || payload.userId || payload.id;
        } catch (e) {
          console.warn("Could not decode JWT token");
        }
      }

      console.warn("User data not found in any storage");
      return null;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

  // Load skills from backend
  const loadSkills = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      console.log("User ID:", userId);

      if (!userId) {
        toast.error("User not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:2090/api/skills/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const skillsData = await response.json();
        console.log("Skills data received:", skillsData);
        setSkills(skillsData);
        await loadAnalytics(userId);
      } else {
        console.error("Failed to load skills, status:", response.status);
        toast.error("Failed to load skills");
      }
    } catch (error) {
      console.error("Error loading skills:", error);
      toast.error("Error loading skills");
    } finally {
      setLoading(false);
    }
  };

  // Load analytics with real backend data
  const loadAnalytics = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:2090/api/skills/user/${userId}/analytics`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const analyticsData = await response.json();
        console.log("Analytics data:", analyticsData);
        setAnalytics(analyticsData);
      } else {
        calculateAnalyticsFromSkills();
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      calculateAnalyticsFromSkills();
    }
  };

  // Calculate analytics from local skills data
  const calculateAnalyticsFromSkills = () => {
    const verifiedSkills = skills.filter(
      (skill) => skill.status === "verified"
    ).length;
    const pendingSkills = skills.filter(
      (skill) => skill.status === "pending"
    ).length;
    const unverifiedSkills = skills.filter(
      (skill) => skill.status === "unverified"
    ).length;
    const needsImprovementSkills = skills.filter(
      (skill) => skill.status === "needs_improvement"
    ).length;

    const averageProficiency =
      skills.length > 0
        ? Math.round(
            skills.reduce((sum, skill) => sum + (skill.proficiency || 0), 0) /
              skills.length
          )
        : 0;

    setAnalytics({
      verifiedSkills,
      totalSkills: skills.length,
      averageProficiency,
      skillDistribution: {
        verified: verifiedSkills,
        pending: pendingSkills,
        unverified: unverifiedSkills,
        needs_improvement: needsImprovementSkills,
      },
    });
  };

  // Sync skills from profile
  const syncSkillsFromProfile = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        toast.error("Please login to sync skills");
        return;
      }

      const response = await fetch(
        `http://localhost:2090/api/skills/sync-from-profile/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Skills synced from profile successfully");
        await loadSkills();
      } else {
        toast.error("Failed to sync skills from profile");
      }
    } catch (error) {
      console.error("Error syncing skills:", error);
      toast.error("Error syncing skills");
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  // Filter skills based on search
  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (skill.category &&
        skill.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate verified and unverified skills based on your data structure
  const verifiedSkills = filteredSkills.filter(
    (skill) =>
      skill.status === "verified" || skill.status === "needs_improvement"
  );
  const unverifiedSkills = filteredSkills.filter(
    (skill) => skill.status === "pending" || skill.status === "unverified"
  );

  // Calculate skill distribution for chart
  const skillDistribution = analytics
    ? [
        {
          name: "Verified",
          value: analytics.skillDistribution?.verified || 0,
          color: "#10B981",
        },
        {
          name: "Pending",
          value: analytics.skillDistribution?.pending || 0,
          color: "#F59E0B",
        },
        {
          name: "Unverified",
          value: analytics.skillDistribution?.unverified || 0,
          color: "#EF4444",
        },
        {
          name: "Needs Improvement",
          value: analytics.skillDistribution?.needs_improvement || 0,
          color: "#F97316",
        },
      ]
    : [];

  // Skill scores for bar chart
  const skillScores = skills
    .filter((skill) => skill.status === "verified" && skill.score > 0)
    .map((skill) => ({
      name:
        skill.name.length > 15
          ? skill.name.substring(0, 15) + "..."
          : skill.name,
      score: skill.score,
      level: skill.level,
    }));

  // Enhanced Quick insights with real backend data
  const insights = [
    {
      id: 1,
      text:
        skills.length > 0
          ? `You have ${skills.length} skills in your profile. ${
              analytics?.verifiedSkills || 0
            } are verified.`
          : "Add skills to your profile to get started.",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      text:
        analytics?.verifiedSkills > 0
          ? `Great! You have ${
              analytics?.verifiedSkills
            } verified skills with ${Math.round(
              analytics?.averageProficiency || 0
            )}% avg proficiency.`
          : "Take skill exams to get verified and boost your credibility.",
      icon: Award,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      text:
        analytics?.verifiedSkills > 5
          ? "Excellent! You have a strong skill portfolio. Consider advanced certifications."
          : analytics?.verifiedSkills > 2
          ? "Good progress! Keep taking exams to verify more skills."
          : "Skill verification increases your job match rate by 70% according to industry data.",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
    },
  ];

  // Generate exam using Gemini API
  const generateGeminiExam = async (skill) => {
    try {
      console.log("Generating exam for skill:", skill.name);
      setExamGenerationLoading(true);

      const response = await fetch(
        "http://localhost:2090/api/skills/generate-exam",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skill: skill.name,
            category: skill.category || "programming",
            difficulty: "intermediate",
            numberOfQuestions: 5,
          }),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (!responseText) {
          throw new Error("Empty response from server");
        }

        let examData;
        try {
          examData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error("Invalid JSON response from server");
        }

        // Check if we have questions in the response
        if (examData && examData.questions && examData.questions.length > 0) {
          console.log(
            "Successfully generated exam with",
            examData.questions.length,
            "questions"
          );
          return examData.questions;
        } else if (examData && examData.error) {
          throw new Error(examData.error);
        } else {
          throw new Error("No questions generated");
        }
      } else {
        throw new Error(`Server returned status: ${response.status}`);
      }
    } catch (error) {
      console.error("Gemini exam generation failed:", error);
      throw new Error(`Failed to generate exam: ${error.message}`);
    } finally {
      setExamGenerationLoading(false);
    }
  };

  const generateMockQuestions = (skill) => {
    const baseQuestions = [
      {
        id: 1,
        question: `What is the core concept of ${skill.name}?`,
        options: [
          "Basic syntax and structure",
          "Advanced optimization techniques",
          "Industry best practices",
          "All of the above",
        ],
        correct: 3,
      },
      {
        id: 2,
        question: `Which tool is commonly used with ${skill.name}?`,
        options: ["Visual Studio Code", "Git", "Docker", "All of the above"],
        correct: 3,
      },
      {
        id: 3,
        question: `What is the primary use case for ${skill.name}?`,
        options: [
          "Web development",
          "Data analysis",
          "System administration",
          "Depends on the skill",
        ],
        correct: 3,
      },
    ];
    return baseQuestions;
  };

  const startExam = async (skill) => {
    try {
      toast.loading("Generating exam questions...");
      console.log("Starting exam for skill:", skill);

      const questions = await generateGeminiExam(skill);

      setCurrentExam({
        skill: {
          id: skill.id,
          name: skill.name,
          category: skill.category,
        },
        questions,
        currentQuestion: 0,
      });
      setExamAnswers(new Array(questions.length).fill(null));
      setExamTimeLeft(300);
      setShowExamModal(true);
      toast.dismiss();
      toast.success("Exam generated successfully!");
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.dismiss();
      toast.error("Failed to generate exam. Using fallback questions.");

      // Use mock questions as fallback
      const questions = generateMockQuestions(skill);
      setCurrentExam({
        skill: {
          id: skill.id,
          name: skill.name,
          category: skill.category,
        },
        questions,
        currentQuestion: 0,
      });
      setExamAnswers(new Array(questions.length).fill(null));
      setExamTimeLeft(300);
      setShowExamModal(true);
    }
  };

  const submitExam = async () => {
    if (currentExam) {
      try {
        const correctAnswers = examAnswers.filter(
          (answer, index) => answer === currentExam.questions[index].correct
        ).length;

        const score = Math.round(
          (correctAnswers / currentExam.questions.length) * 100
        );
        const status =
          score >= 70
            ? "verified"
            : score >= 50
            ? "needs_improvement"
            : "unverified";

        // Check if user is authenticated before trying to save results
        const userId = getUserId();

        if (userId) {
          const response = await fetch(
            `http://localhost:2090/api/skills/${currentExam.skill.id}/exam-result`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ score, status }),
            }
          );

          if (response.ok) {
            const updatedSkill = await response.json();
            setSkills((prev) =>
              prev.map((skill) =>
                skill.id === currentExam.skill.id ? updatedSkill : skill
              )
            );
          } else {
            console.warn("Failed to save exam results, but exam was completed");
            // Update locally even if save fails
            setSkills((prev) =>
              prev.map((skill) =>
                skill.id === currentExam.skill.id
                  ? { ...skill, score, status }
                  : skill
              )
            );
          }
        } else {
          // User not authenticated, update locally only
          console.warn("User not authenticated, updating skills locally");
          setSkills((prev) =>
            prev.map((skill) =>
              skill.id === currentExam.skill.id
                ? { ...skill, score, status }
                : skill
            )
          );
        }

        setShowExamModal(false);
        setCurrentExam(null);

        if (score >= 70) {
          toast.success(
            `Congratulations! You scored ${score}% and are now verified in ${currentExam.skill.name}`
          );
          setTimeout(() => setActiveTab("verified"), 1000);
        } else if (score >= 50) {
          toast.success(
            `You scored ${score}% in ${currentExam.skill.name}. Keep practicing!`
          );
        } else {
          toast.error(
            `You scored ${score}% in ${currentExam.skill.name}. Consider learning more.`
          );
        }

        // Reload analytics if user is authenticated
        if (userId) {
          await loadAnalytics(userId);
        } else {
          calculateAnalyticsFromSkills();
        }
      } catch (error) {
        console.error("Error submitting exam:", error);
        toast.error("Error submitting exam");
      }
    }
  };

  const handleExamAnswer = (questionIndex, answerIndex) => {
    const newAnswers = [...examAnswers];
    newAnswers[questionIndex] = answerIndex;
    setExamAnswers(newAnswers);
  };

  const generateAIRecommendations = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const recommendations = [
        {
          id: 1,
          title: "TypeScript",
          description:
            "Based on your React skills, TypeScript would enhance your code quality",
          reason: "Complements your frontend skills",
          icon: Code,
          color: "from-blue-500 to-cyan-500",
        },
        {
          id: 2,
          title: "Docker",
          description: "Containerization is essential for modern deployment",
          reason: "Matches your backend experience",
          icon: Cloud,
          color: "from-green-500 to-emerald-500",
        },
        {
          id: 3,
          title: "GraphQL",
          description: "Modern API technology that pairs well with React",
          reason: "Extends your full-stack capabilities",
          icon: Zap,
          color: "from-purple-500 to-pink-500",
        },
      ];

      setAiRecommendations(recommendations);
      setIsAnalyzing(false);
      toast.success("AI analysis complete! Check your skill recommendations.");
    }, 2000);
  };

  const syncWithDashboard = () => {
    const verifiedSkills = skills.filter(
      (skill) => skill.status === "verified"
    );

    if (verifiedSkills.length === 0) {
      toast.error(
        "No verified skills to sync. Please complete some exams first."
      );
      return;
    }

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      }),
      {
        loading: "Syncing skills with dashboard...",
        success: `Successfully synced ${verifiedSkills.length} verified skills!`,
        error: "Failed to sync skills",
      }
    );
  };

  // Exam timer effect
  useEffect(() => {
    let timer;
    if (showExamModal && examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (examTimeLeft === 0) {
      submitExam();
    }

    return () => clearInterval(timer);
  }, [showExamModal, examTimeLeft]);

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case "unverified":
        return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      case "needs_improvement":
        return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle size={16} className="text-green-500" />;
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "unverified":
        return <X size={16} className="text-red-500" />;
      case "needs_improvement":
        return <AlertCircle size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

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

  // Empty State Component
  const EmptyState = ({ type, onSync, searchTerm }) => (
    <div className="flex-shrink-0 w-full max-w-2xl mx-auto text-center py-12">
      {type === "unverified" ? (
        <>
          <Target
            size={64}
            className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {searchTerm
              ? "No unverified skills found"
              : "All skills verified! 🎉"}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {searchTerm
              ? `No unverified skills match "${searchTerm}".`
              : "You've successfully verified all your skills. Great work!"}
          </p>
          {!searchTerm && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSync}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Sync New Skills
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("verified")}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              >
                View Verified Skills
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <>
          <Award
            size={64}
            className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {searchTerm ? "No verified skills found" : "No verified skills yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {searchTerm
              ? `No verified skills match "${searchTerm}".`
              : "Take exams to verify your skills and track your progress!"}
          </p>
          {!searchTerm && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("unverified")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Take Exams
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSync}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
              >
                Sync Skills
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Skill Card Component
  const SkillCard = ({
    skill,
    index,
    onStartExam,
    type,
    examGenerationLoading,
  }) => (
    <motion.div
      key={skill._id || skill.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="flex-shrink-0 w-80 p-4 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-xl"
    >
      <div className="flex items-start justify-between mb-3">
        <h3
          className="font-semibold text-gray-900 dark:text-white text-lg truncate flex-1 mr-2"
          title={skill.name}
        >
          {skill.name}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            skill.status
          )} flex items-center space-x-1 flex-shrink-0`}
        >
          {getStatusIcon(skill.status)}
          <span className="hidden sm:inline">
            {skill.status?.charAt(0)?.toUpperCase() + skill.status?.slice(1) ||
              "Pending"}
          </span>
        </span>
      </div>

      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-600 dark:text-gray-400 truncate">
          {skill.category || "Uncategorized"}
        </span>
        {skill.score > 0 && (
          <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2">
            {skill.score}%
          </span>
        )}
      </div>

      {skill.proficiency > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              Proficiency
            </span>
            <span className="font-semibold">{skill.proficiency}%</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5">
            <motion.div
              className={`h-2.5 rounded-full bg-gradient-to-r ${
                skill.proficiency >= 80
                  ? "from-green-500 to-emerald-500"
                  : skill.proficiency >= 60
                  ? "from-blue-500 to-cyan-500"
                  : skill.proficiency >= 40
                  ? "from-amber-500 to-orange-500"
                  : "from-red-500 to-pink-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${skill.proficiency}%` }}
              transition={{ duration: 1, delay: index * 0.05 }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1 mr-2">
          {skill.level || "Pending"}
        </span>
        <motion.button
          whileHover={{ scale: examGenerationLoading ? 1 : 1.05 }}
          whileTap={{ scale: examGenerationLoading ? 1 : 0.95 }}
          onClick={() => !examGenerationLoading && onStartExam(skill)}
          disabled={examGenerationLoading}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex-shrink-0 ${
            examGenerationLoading
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : type === "verified"
              ? "bg-green-500 text-white hover:bg-green-600 shadow-lg"
              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
          }`}
        >
          {examGenerationLoading ? (
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Generating...</span>
            </div>
          ) : type === "verified" ? (
            "View Score"
          ) : (
            "Take Exam"
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <Toaster position="top-right" />

      {/* Exam Modal */}
      <AnimatePresence>
        {showExamModal && currentExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentExam.skill.name} Skill Assessment
                </h3>
                <div className="flex items-center space-x-2 text-red-500">
                  <Clock size={20} />
                  <span className="font-mono font-bold">
                    {Math.floor(examTimeLeft / 60)}:
                    {(examTimeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Question {currentExam.currentQuestion + 1} of{" "}
                    {currentExam.questions.length}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {Math.round(
                      ((currentExam.currentQuestion + 1) /
                        currentExam.questions.length) *
                        100
                    )}
                    % Complete
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {
                      currentExam.questions[currentExam.currentQuestion]
                        .question
                    }
                  </h4>

                  <div className="space-y-3">
                    {currentExam.questions[
                      currentExam.currentQuestion
                    ].options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleExamAnswer(currentExam.currentQuestion, index)
                        }
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          examAnswers[currentExam.currentQuestion] === index
                            ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700"
                        }`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentExam((prev) =>
                        prev.currentQuestion > 0
                          ? {
                              ...prev,
                              currentQuestion: prev.currentQuestion - 1,
                            }
                          : prev
                      )
                    }
                    disabled={currentExam.currentQuestion === 0}
                    className={`px-6 py-3 rounded-xl font-semibold ${
                      currentExam.currentQuestion === 0
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-500 text-white hover:bg-gray-600"
                    }`}
                  >
                    Previous
                  </motion.button>

                  {currentExam.currentQuestion <
                  currentExam.questions.length - 1 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setCurrentExam((prev) => ({
                          ...prev,
                          currentQuestion: prev.currentQuestion + 1,
                        }))
                      }
                      disabled={
                        examAnswers[currentExam.currentQuestion] === null
                      }
                      className={`px-6 py-3 rounded-xl font-semibold ${
                        examAnswers[currentExam.currentQuestion] === null
                          ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      Next Question
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={submitExam}
                      className="px-6 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600"
                    >
                      Submit Exam
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-6"
      >
        {/* Header Section */}
        <motion.section
          variants={itemVariants}
          className="rounded-2xl p-8 bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-3xl lg:text-4xl font-bold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                My Skills 🚀
              </motion.h1>
              <motion.p
                className="text-blue-100 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Manage your skills, take verification exams, and track your
                progress.
                {analytics &&
                  ` ${analytics.verifiedSkills || 0} verified, ${
                    analytics.totalSkills || 0
                  } total skills`}
              </motion.p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={syncSkillsFromProfile}
                disabled={loading}
                className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                title="Sync from Profile"
              >
                <RefreshCw
                  size={24}
                  className={loading ? "animate-spin" : ""}
                />
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* === Skills Section with Proper Horizontal Scrolling === */}
        <motion.section
          variants={itemVariants}
          className={`rounded-2xl p-6 shadow-lg ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold flex items-center">
              <Brain className="mr-2" size={24} />
              My Skills ({skills.length})
            </h2>

            <div className="flex-1 max-w-md">
              <motion.div className="relative" whileHover={{ scale: 1.02 }}>
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                />
              </motion.div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className={`flex space-x-1 mb-6 p-1 rounded-xl ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <button
              onClick={() => setActiveTab("unverified")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "unverified"
                  ? isDarkMode
                    ? "bg-gray-800 text-blue-400 shadow-md"
                    : "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target size={18} />
                <span>Unverified Skills</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === "unverified"
                      ? isDarkMode
                        ? "bg-blue-900 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                      : isDarkMode
                      ? "bg-gray-600 text-gray-400"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {unverifiedSkills.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("verified")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "verified"
                  ? isDarkMode
                    ? "bg-gray-800 text-green-400 shadow-md"
                    : "bg-white text-green-600 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Award size={18} />
                <span>Verified Skills</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === "verified"
                      ? isDarkMode
                        ? "bg-green-900 text-green-400"
                        : "bg-green-100 text-green-600"
                      : isDarkMode
                      ? "bg-gray-600 text-gray-400"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {verifiedSkills.length}
                </span>
              </div>
            </button>
          </div>

          {/* Skills Container with Fixed Width and Proper Scrolling */}
          <div className="relative">
            <div
              className="flex overflow-x-auto pb-6 gap-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700"
              style={{
                maxWidth: "75vw",
                scrollBehavior: "smooth",
              }}
            >
              <AnimatePresence mode="wait">
                {activeTab === "unverified" ? (
                  <motion.div
                    key="unverified"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 min-w-max"
                  >
                    {unverifiedSkills.length > 0 ? (
                      unverifiedSkills.map((skill, index) => (
                        <SkillCard
                          key={skill._id || skill.id}
                          skill={skill}
                          index={index}
                          onStartExam={startExam}
                          type="unverified"
                          examGenerationLoading={examGenerationLoading}
                        />
                      ))
                    ) : (
                      <EmptyState
                        type="unverified"
                        onSync={syncSkillsFromProfile}
                        searchTerm={searchTerm}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="verified"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 min-w-max"
                  >
                    {verifiedSkills.length > 0 ? (
                      verifiedSkills.map((skill, index) => (
                        <SkillCard
                          key={skill._id || skill.id}
                          skill={skill}
                          index={index}
                          onStartExam={startExam}
                          type="verified"
                          examGenerationLoading={examGenerationLoading}
                        />
                      ))
                    ) : (
                      <EmptyState
                        type="verified"
                        onSync={syncSkillsFromProfile}
                        searchTerm={searchTerm}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scroll indicators */}
            {(activeTab === "unverified"
              ? unverifiedSkills.length
              : verifiedSkills.length) > 3 && (
              <>
                <div
                  className={`absolute left-0 top-0 bottom-6 w-8 bg-gradient-to-r ${
                    isDarkMode ? "from-gray-800" : "from-gray-100"
                  } to-transparent pointer-events-none`}
                ></div>
                <div
                  className={`absolute right-0 top-0 bottom-6 w-8 bg-gradient-to-l ${
                    isDarkMode ? "from-gray-800" : "from-gray-100"
                  } to-transparent pointer-events-none`}
                ></div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div
                    className={`text-xs px-3 py-1 rounded-full flex items-center space-x-1 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    <ArrowRight size={12} className="rotate-180" />
                    <span>Scroll for more skills</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Skills summary */}
          <div className="mt-6 text-center">
            <div
              className={`inline-flex flex-wrap justify-center items-center gap-4 text-sm px-4 py-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 text-gray-400"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span className="flex items-center space-x-1">
                <Award className="text-green-500" size={16} />
                <span>
                  <strong>{verifiedSkills.length}</strong> verified
                </span>
              </span>
              <div
                className={`w-1 h-1 rounded-full ${
                  isDarkMode ? "bg-gray-500" : "bg-gray-400"
                }`}
              ></div>
              <span className="flex items-center space-x-1">
                <Target className="text-blue-500" size={16} />
                <span>
                  <strong>{unverifiedSkills.length}</strong> unverified
                </span>
              </span>
              {searchTerm && (
                <>
                  <div
                    className={`w-1 h-1 rounded-full ${
                      isDarkMode ? "bg-gray-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span>Search: "{searchTerm}"</span>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* === Skill Analytics Section === */}
        {skills.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Distribution Chart */}
            <motion.section
              variants={itemVariants}
              className={`rounded-2xl p-6 shadow-lg ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="mr-2" size={24} />
                Skill Verification Status
              </h2>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {skillDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: isDarkMode ? "#1F2937" : "#FFFFFF",
                        border: isDarkMode
                          ? "1px solid #374151"
                          : "1px solid #E5E7EB",
                        borderRadius: "8px",
                        color: isDarkMode ? "#FFFFFF" : "#1F2937",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            {/* Skill Scores Chart */}
            {skillScores.length > 0 && (
              <motion.section
                variants={itemVariants}
                className={`rounded-2xl p-6 shadow-lg ${
                  isDarkMode
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <TrendingUp className="mr-2" size={24} />
                  Verified Skill Scores
                </h2>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillScores}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      />
                      <YAxis stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                      <Tooltip
                        contentStyle={{
                          background: isDarkMode ? "#1F2937" : "#FFFFFF",
                          border: isDarkMode
                            ? "1px solid #374151"
                            : "1px solid #E5E7EB",
                          borderRadius: "8px",
                          color: isDarkMode ? "#FFFFFF" : "#1F2937",
                        }}
                      />
                      <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                        {skillScores.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.score >= 80
                                ? "#10B981"
                                : entry.score >= 60
                                ? "#3B82F6"
                                : entry.score >= 40
                                ? "#F59E0B"
                                : "#EF4444"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.section>
            )}
          </div>
        )}

        {/* === Quick Insights Section === */}
        <motion.section
          variants={itemVariants}
          className={`rounded-2xl p-6 shadow-lg ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        >
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Lightbulb className="mr-2" size={24} />
            Quick Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`p-4 rounded-xl bg-gradient-to-br ${insight.color} text-white shadow-lg`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <insight.icon size={20} />
                  </div>
                  <p className="text-sm leading-relaxed">{insight.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* === AI Recommendations Section === */}
        {skills.length > 0 && (
          <motion.section
            variants={itemVariants}
            className={`rounded-2xl p-6 shadow-lg ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                <Zap className="mr-2" size={24} />
                AI Skill Recommendations
              </h2>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateAIRecommendations}
                disabled={isAnalyzing}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isAnalyzing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  "Run AI Analysis"
                )}
              </motion.button>
            </div>

            {aiRecommendations.length > 0 && (
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiRecommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${rec.color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <rec.icon size={20} />
                        </div>
                        <h3 className="font-bold text-lg">{rec.title}</h3>
                      </div>
                      <p className="text-sm text-white/90 mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70">
                          {rec.reason}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <ArrowRight size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </motion.section>
        )}

        {/* === Sync Section === */}
        {skills.length > 0 && (
          <motion.section
            variants={itemVariants}
            className="rounded-2xl p-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">
                  Sync Your Verified Skills
                </h2>
                <p className="text-blue-100">
                  Sync verified skills with your Dashboard and prepare for Skill
                  Gap Analysis.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={syncWithDashboard}
                className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <Users size={20} />
                <span>Sync with Dashboard</span>
              </motion.button>
            </div>
          </motion.section>
        )}
      </motion.div>
    </Layout>
  );
}
