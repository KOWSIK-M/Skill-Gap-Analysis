"use client";

import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "./Layout";
import {
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  Award,
  GraduationCap,
  Briefcase,
  BookOpen,
  Save,
  CheckCircle,
  Loader2,
  X,
  Brain,
  Trash2,
  Download,
  Eye,
  Plus,
  History,
  MapPin,
  Globe,
  GitBranch,
  BriefcaseIcon,
  Languages,
} from "lucide-react";

const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.sub || decodedPayload.userId || decodedPayload.id;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Create a context for theme
const ThemeContext = React.createContext();
export const useTheme = () => useContext(ThemeContext);

const ResumeAnalysisPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [profileData, setProfileData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    contactNumber: "",
    location: "",
    linkedInUrl: "",
    githubUrl: "",
    portfolioUrl: "",

    // Professional Information
    title: "",
    summary: "",
    technicalSkills: [],
    softSkills: [],
    languages: [],
    totalExperience: "",

    // Education, Experience, Certifications, Projects
    education: [],
    experience: [],
    certifications: [],
    projects: [],

    // Settings
    isPublic: true,
    seekingOpportunities: true,
    preferredRoles: [],
    expectedSalary: "",
    noticePeriod: "",
  });

  const [errors, setErrors] = useState({});
  const [resumeHistory, setResumeHistory] = useState([]);
  const [showUpload, setShowUpload] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get user ID from localStorage (assuming you store it after login)
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
      // Load user profile and resume history
      loadUserProfile(user.id);
      loadResumeHistory(user.id);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Load user profile from backend
  // In ResumeAnalysisPage.jsx, update all API calls to use the proper authentication

  // Load user profile
  const loadUserProfile = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:2090/api/profile/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const profile = await response.json();
        setProfileData((prev) => ({
          ...prev,
          ...profile,
          technicalSkills: profile.technicalSkills || [],
          softSkills: profile.softSkills || [],
          languages: profile.languages || [],
          education: profile.education || [],
          experience: profile.experience || [],
          certifications: profile.certifications || [],
          projects: profile.projects || [],
          preferredRoles: profile.preferredRoles || [],
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  // Load resume history
  const loadResumeHistory = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:2090/api/profile/${userId}/resumes/history`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const resumes = await response.json();
        setResumeHistory(
          resumes.map((resume) => ({
            id: resume.id,
            name: resume.fileName,
            date: new Date(resume.uploadDate).toLocaleDateString(),
            data: resume,
            isActive: resume.isActive,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading resume history:", error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file || !userId) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      setErrors({ upload: "Please upload a PDF, DOCX, or TXT file" });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ upload: "File size must be less than 5MB" });
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `http://localhost:2090/api/profile/${userId}/resume/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result);

        // Update profile data with extracted information
        const extractedData = result.analysisResult || result.extractedData;
        if (extractedData) {
          setProfileData((prev) => ({
            ...prev,
            fullName: prev.fullName || extractedData.fullName || "",
            email: prev.email || extractedData.email || "",
            contactNumber:
              prev.contactNumber || extractedData.contactNumber || "",
            title: prev.title || extractedData.title || "",
            summary: prev.summary || extractedData.summary || "",
            technicalSkills: [
              ...new Set([
                ...prev.technicalSkills,
                ...(extractedData.skills || []),
              ]),
            ],
            education: [...prev.education, ...(extractedData.education || [])],
            experience: [
              ...prev.experience,
              ...(extractedData.experience || []),
            ],
            certifications: [
              ...prev.certifications,
              ...(extractedData.certifications || []).map((name) => ({ name })),
            ],
          }));
        }

        // Reload resume history
        loadResumeHistory(userId);

        // Hide upload section after successful analysis
        setShowUpload(false);
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrors({
        upload: "Failed to upload and analyze resume. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleNewResumeUpload = () => {
    setShowUpload(true);
    setUploadedFile(null);
    setAnalysisResult(null);
  };

  const handleResumeHistoryClick = async (resume) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:2090/api/profile/resumes/${resume.id}/reanalyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);

        // Update profile with re-analyzed data
        const extractedData = result.extractedData;
        setProfileData((prev) => ({
          ...prev,
          fullName: prev.fullName || extractedData.fullName || "",
          email: prev.email || extractedData.email || "",
          contactNumber:
            prev.contactNumber || extractedData.contactNumber || "",
          title: prev.title || extractedData.title || "",
          summary: prev.summary || extractedData.summary || "",
          technicalSkills: [
            ...new Set([
              ...prev.technicalSkills,
              ...(extractedData.skills || []),
            ]),
          ],
        }));

        setShowUpload(false);
      }
    } catch (error) {
      console.error("Error reanalyzing resume:", error);
    }
  };

  const handleDeleteResume = async (resumeId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:2090/api/profile/${userId}/resumes/${resumeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setResumeHistory((prev) =>
          prev.filter((resume) => resume.id !== resumeId)
        );
        // Reload resume history to get updated list
        loadResumeHistory(userId);
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  };

  const handleSetActiveResume = async (resumeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:2090/api/profile/${userId}/resumes/${resumeId}/active`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update local state to reflect active resume
        setResumeHistory((prev) =>
          prev.map((resume) => ({
            ...resume,
            isActive: resume.id === resumeId,
          }))
        );
      }
    } catch (error) {
      console.error("Error setting active resume:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleArrayFieldChange = (field, index, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleObjectFieldChange = (field, index, subField, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [subField]: value } : item
      ),
    }));
  };

  const addArrayItem = (field, template = "") => {
    setProfileData((prev) => ({
      ...prev,
      [field]: [...prev[field], template],
    }));
  };

  const addObjectItem = (field, template = {}) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: [...prev[field], template],
    }));
  };

  const removeArrayItem = (field, index) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm() || !userId) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:2090/api/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        alert("Profile saved successfully!");
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced resume history display with active resume indicator
  const ResumeHistoryItem = ({ resume }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => handleResumeHistoryClick(resume)}
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
        isDarkMode
          ? "bg-gray-700 border-gray-600 hover:border-blue-600"
          : "bg-gray-50 border-gray-200 hover:border-blue-400"
      } ${resume.isActive ? "border-green-500 border-2" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText
            size={16}
            className={isDarkMode ? "text-gray-400" : "text-gray-500"}
          />
          <div>
            <p
              className={`font-medium text-sm ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {resume.name}
              {resume.isActive && (
                <span className="ml-2 text-green-500 text-xs">● Active</span>
              )}
            </p>
            <p
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {resume.date}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {!resume.isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSetActiveResume(resume.id);
              }}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
              title="Set as active"
            >
              <CheckCircle size={14} />
            </button>
          )}
          <button
            onClick={(e) => handleDeleteResume(resume.id, e)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
            title="Delete resume"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <Layout>
        <div
          className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1
                className={`text-4xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Profile Management
              </h1>
              <p
                className={`text-lg max-w-2xl mx-auto ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Manage your professional profile with AI-powered resume analysis
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column - Resume History & Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1 space-y-6"
              >
                {/* Upload New Resume Card */}
                {showUpload && (
                  <div
                    className={`rounded-2xl shadow-lg p-6 ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h2
                      className={`text-xl font-semibold mb-4 flex items-center ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <Upload className="mr-2" size={24} />
                      Upload Resume
                    </h2>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                        isAnalyzing
                          ? `${
                              isDarkMode
                                ? "border-blue-400 bg-blue-900/20"
                                : "border-blue-300 bg-blue-50"
                            }`
                          : `${
                              isDarkMode
                                ? "border-gray-600 hover:border-blue-600 hover:bg-blue-900/20"
                                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                            }`
                      }`}
                    >
                      {isAnalyzing ? (
                        <div className="space-y-4">
                          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                          <div>
                            <p
                              className={`text-lg font-semibold ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Analyzing Resume...
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              } mt-2`}
                            >
                              Extracting your professional information
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }
                          >
                            Drag & drop your resume here
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-gray-500" : "text-gray-500"
                            } mb-4`}
                          >
                            Supports PDF, DOCX, TXT files (Max 5MB)
                          </p>

                          <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="resume-upload"
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer font-semibold hover:bg-blue-600 transition-colors"
                          >
                            Choose File
                          </label>
                        </>
                      )}
                    </div>

                    {errors.upload && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <p className="text-red-700 dark:text-red-400 text-sm">
                          {errors.upload}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Resume History */}
                <div
                  className={`rounded-2xl shadow-lg p-6 ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className={`text-xl font-semibold flex items-center ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <History className="mr-2" size={24} />
                      Resume History
                    </h2>
                    <button
                      onClick={handleNewResumeUpload}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resumeHistory.map((resume) => (
                      <ResumeHistoryItem key={resume.id} resume={resume} />
                    ))}

                    {resumeHistory.length === 0 && (
                      <p
                        className={`text-center text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        } py-4`}
                      >
                        No resume history yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                {!showUpload && (
                  <div
                    className={`rounded-2xl shadow-lg p-6 ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <h2
                      className={`text-xl font-semibold mb-4 flex items-center ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      <Brain className="mr-2" size={24} />
                      Quick Actions
                    </h2>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewResumeUpload}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 hover:border-blue-600 text-white"
                            : "bg-gray-50 border-gray-200 hover:border-blue-400 text-gray-800"
                        }`}
                      >
                        <Upload size={18} />
                        <span>Upload New Resume</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode
                            ? "bg-blue-600 border-blue-500 hover:bg-blue-700 text-white"
                            : "bg-blue-500 border-blue-400 hover:bg-blue-600 text-white"
                        } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isSaving ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        <span>{isSaving ? "Saving..." : "Save Profile"}</span>
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Right Column - Profile Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                {!showUpload ? (
                  <div
                    className={`rounded-2xl shadow-lg p-6 ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2
                        className={`text-xl font-semibold flex items-center ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        <User className="mr-2" size={24} />
                        Profile Information
                      </h2>
                      {analysisResult && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center space-x-2 text-green-500"
                        >
                          <CheckCircle size={20} />
                          <span className="text-sm font-medium">
                            AI Analysis Complete
                          </span>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3
                          className={`text-lg font-medium border-b pb-2 ${
                            isDarkMode
                              ? "text-gray-300 border-gray-600"
                              : "text-gray-700 border-gray-200"
                          }`}
                        >
                          Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <User size={16} className="mr-1" />
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={profileData.fullName}
                              onChange={(e) =>
                                handleInputChange("fullName", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              } ${errors.fullName ? "border-red-500" : ""}`}
                              placeholder="Enter your full name"
                            />
                            {errors.fullName && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.fullName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <Mail size={16} className="mr-1" />
                              Email Address *
                            </label>
                            <input
                              type="email"
                              value={profileData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              } ${errors.email ? "border-red-500" : ""}`}
                              placeholder="Enter your email"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <Phone size={16} className="mr-1" />
                              Contact Number
                            </label>
                            <input
                              type="tel"
                              value={profileData.contactNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  "contactNumber",
                                  e.target.value
                                )
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="Enter your phone number"
                            />
                          </div>

                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <MapPin size={16} className="mr-1" />
                              Location
                            </label>
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) =>
                                handleInputChange("location", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="Enter your location"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <BriefcaseIcon size={16} className="mr-1" />
                              Job Title
                            </label>
                            <input
                              type="text"
                              value={profileData.title}
                              onChange={(e) =>
                                handleInputChange("title", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="e.g., Full Stack Developer"
                            />
                          </div>

                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <Briefcase size={16} className="mr-1" />
                              Total Experience
                            </label>
                            <input
                              type="text"
                              value={profileData.totalExperience}
                              onChange={(e) =>
                                handleInputChange(
                                  "totalExperience",
                                  e.target.value
                                )
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="e.g., 3 years"
                            />
                          </div>

                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <Languages size={16} className="mr-1" />
                              Languages
                            </label>
                            <input
                              type="text"
                              value={profileData.languages.join(", ")}
                              onChange={(e) =>
                                handleInputChange(
                                  "languages",
                                  e.target.value
                                    .split(",")
                                    .map((lang) => lang.trim())
                                )
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="e.g., English, Spanish, French"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <Globe size={16} className="mr-1" />
                              LinkedIn URL
                            </label>
                            <input
                              type="url"
                              value={profileData.linkedInUrl}
                              onChange={(e) =>
                                handleInputChange("linkedInUrl", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="https://linkedin.com/in/yourname"
                            />
                          </div>

                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <GitBranch size={16} className="mr-1" />
                              GitHub URL
                            </label>
                            <input
                              type="url"
                              value={profileData.githubUrl}
                              onChange={(e) =>
                                handleInputChange("githubUrl", e.target.value)
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="https://github.com/yourname"
                            />
                          </div>

                          <div>
                            <label
                              className={`flex items-center text-sm font-medium mb-2 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <Globe size={16} className="mr-1" />
                              Portfolio URL
                            </label>
                            <input
                              type="url"
                              value={profileData.portfolioUrl}
                              onChange={(e) =>
                                handleInputChange(
                                  "portfolioUrl",
                                  e.target.value
                                )
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="https://yourportfolio.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`text-lg font-medium flex items-center ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <BookOpen size={18} className="mr-2" />
                            Technical Skills
                          </h3>
                          <button
                            onClick={() => addArrayItem("technicalSkills", "")}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            + Add Skill
                          </button>
                        </div>
                        <div className="space-y-2">
                          {profileData.technicalSkills.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={skill}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "technicalSkills",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Enter a technical skill"
                              />
                              <button
                                onClick={() =>
                                  removeArrayItem("technicalSkills", index)
                                }
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          {profileData.technicalSkills.length === 0 && (
                            <p
                              className={`text-sm italic ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              No technical skills added yet.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Soft Skills */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`text-lg font-medium flex items-center ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <User size={18} className="mr-2" />
                            Soft Skills
                          </h3>
                          <button
                            onClick={() => addArrayItem("softSkills", "")}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            + Add Skill
                          </button>
                        </div>
                        <div className="space-y-2">
                          {profileData.softSkills.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={skill}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "softSkills",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Enter a soft skill"
                              />
                              <button
                                onClick={() =>
                                  removeArrayItem("softSkills", index)
                                }
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Education */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`text-lg font-medium flex items-center ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <GraduationCap size={18} className="mr-2" />
                            Education
                          </h3>
                          <button
                            onClick={() =>
                              addObjectItem("education", {
                                degree: "",
                                institution: "",
                                year: "",
                                location: "",
                                grade: "",
                              })
                            }
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            + Add Education
                          </button>
                        </div>
                        <div className="space-y-4">
                          {profileData.education.map((edu, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 space-y-3 ${
                                isDarkMode
                                  ? "border-gray-600"
                                  : "border-gray-200"
                              }`}
                            >
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "education",
                                    index,
                                    "degree",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Degree"
                              />
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "education",
                                    index,
                                    "institution",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Institution"
                              />
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  value={edu.year}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "education",
                                      index,
                                      "year",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Year"
                                />
                                <input
                                  type="text"
                                  value={edu.location}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "education",
                                      index,
                                      "location",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Location"
                                />
                                <input
                                  type="text"
                                  value={edu.grade}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "education",
                                      index,
                                      "grade",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Grade"
                                />
                              </div>
                              <button
                                onClick={() =>
                                  removeArrayItem("education", index)
                                }
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`text-lg font-medium flex items-center ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <Briefcase size={18} className="mr-2" />
                            Work Experience
                          </h3>
                          <button
                            onClick={() =>
                              addObjectItem("experience", {
                                position: "",
                                company: "",
                                duration: "",
                                description: "",
                                location: "",
                                technologies: [],
                              })
                            }
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            + Add Experience
                          </button>
                        </div>
                        <div className="space-y-4">
                          {profileData.experience.map((exp, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 space-y-3 ${
                                isDarkMode
                                  ? "border-gray-600"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "experience",
                                      index,
                                      "position",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Position"
                                />
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "experience",
                                      index,
                                      "company",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Company"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={exp.duration}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "experience",
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Duration (e.g., 2020 - 2023)"
                                />
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "experience",
                                      index,
                                      "location",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Location"
                                />
                              </div>
                              <textarea
                                value={exp.description}
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "experience",
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Job description"
                                rows="3"
                              />
                              <input
                                type="text"
                                value={
                                  exp.technologies
                                    ? exp.technologies.join(", ")
                                    : ""
                                }
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "experience",
                                    index,
                                    "technologies",
                                    e.target.value
                                      .split(",")
                                      .map((tech) => tech.trim())
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Technologies used (comma separated)"
                              />
                              <button
                                onClick={() =>
                                  removeArrayItem("experience", index)
                                }
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`text-lg font-medium flex items-center ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <Award size={18} className="mr-2" />
                            Certifications
                          </h3>
                          <button
                            onClick={() =>
                              addObjectItem("certifications", {
                                name: "",
                                issuingOrganization: "",
                                issueDate: "",
                                expiryDate: "",
                                credentialId: "",
                                credentialUrl: "",
                              })
                            }
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            + Add Certification
                          </button>
                        </div>
                        <div className="space-y-4">
                          {profileData.certifications.map((cert, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 space-y-3 ${
                                isDarkMode
                                  ? "border-gray-600"
                                  : "border-gray-200"
                              }`}
                            >
                              <input
                                type="text"
                                value={cert.name}
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "certifications",
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Certification name"
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={cert.issuingOrganization}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "certifications",
                                      index,
                                      "issuingOrganization",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Issuing organization"
                                />
                                <input
                                  type="text"
                                  value={cert.credentialId}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "certifications",
                                      index,
                                      "credentialId",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Credential ID"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={cert.issueDate}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "certifications",
                                      index,
                                      "issueDate",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Issue date"
                                />
                                <input
                                  type="text"
                                  value={cert.expiryDate}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "certifications",
                                      index,
                                      "expiryDate",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Expiry date"
                                />
                              </div>
                              <input
                                type="url"
                                value={cert.credentialUrl}
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "certifications",
                                    index,
                                    "credentialUrl",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Credential URL"
                              />
                              <button
                                onClick={() =>
                                  removeArrayItem("certifications", index)
                                }
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3
                            className={`text-lg font-medium flex items-center ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <GitBranch size={18} className="mr-2" />
                            Projects
                          </h3>
                          <button
                            onClick={() =>
                              addObjectItem("projects", {
                                name: "",
                                description: "",
                                duration: "",
                                technologies: [],
                                projectUrl: "",
                                githubUrl: "",
                                role: "",
                              })
                            }
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            + Add Project
                          </button>
                        </div>
                        <div className="space-y-4">
                          {profileData.projects.map((project, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 space-y-3 ${
                                isDarkMode
                                  ? "border-gray-600"
                                  : "border-gray-200"
                              }`}
                            >
                              <input
                                type="text"
                                value={project.name}
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "projects",
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Project name"
                              />
                              <textarea
                                value={project.description}
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "projects",
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Project description"
                                rows="3"
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={project.duration}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "projects",
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Duration"
                                />
                                <input
                                  type="text"
                                  value={project.role}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "projects",
                                      index,
                                      "role",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Your role"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="url"
                                  value={project.projectUrl}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "projects",
                                      index,
                                      "projectUrl",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="Project URL"
                                />
                                <input
                                  type="url"
                                  value={project.githubUrl}
                                  onChange={(e) =>
                                    handleObjectFieldChange(
                                      "projects",
                                      index,
                                      "githubUrl",
                                      e.target.value
                                    )
                                  }
                                  className={`p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isDarkMode
                                      ? "bg-gray-700 text-white border-gray-600"
                                      : "bg-white text-gray-800 border-gray-300"
                                  }`}
                                  placeholder="GitHub URL"
                                />
                              </div>
                              <input
                                type="text"
                                value={
                                  project.technologies
                                    ? project.technologies.join(", ")
                                    : ""
                                }
                                onChange={(e) =>
                                  handleObjectFieldChange(
                                    "projects",
                                    index,
                                    "technologies",
                                    e.target.value
                                      .split(",")
                                      .map((tech) => tech.trim())
                                  )
                                }
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="Technologies used (comma separated)"
                              />
                              <button
                                onClick={() =>
                                  removeArrayItem("projects", index)
                                }
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h3
                          className={`text-lg font-medium mb-4 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Professional Summary
                        </h3>
                        <textarea
                          value={profileData.summary}
                          onChange={(e) =>
                            handleInputChange("summary", e.target.value)
                          }
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-white text-gray-800 border-gray-300"
                          }`}
                          placeholder="Enter your professional summary"
                          rows="4"
                        />
                      </div>

                      {/* Settings */}
                      <div>
                        <h3
                          className={`text-lg font-medium border-b pb-2 ${
                            isDarkMode
                              ? "text-gray-300 border-gray-600"
                              : "text-gray-700 border-gray-200"
                          }`}
                        >
                          Settings
                        </h3>
                        <div className="space-y-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label
                                className={`font-medium ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Public Profile
                              </label>
                              <p
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Make your profile visible to employers
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={profileData.isPublic}
                                onChange={(e) =>
                                  handleInputChange(
                                    "isPublic",
                                    e.target.checked
                                  )
                                }
                                className="sr-only peer"
                              />
                              <div
                                className={`w-11 h-6 rounded-full peer ${
                                  isDarkMode ? "bg-gray-700" : "bg-gray-300"
                                } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                              ></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label
                                className={`font-medium ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Seeking Opportunities
                              </label>
                              <p
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Let employers know you're open to new
                                opportunities
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={profileData.seekingOpportunities}
                                onChange={(e) =>
                                  handleInputChange(
                                    "seekingOpportunities",
                                    e.target.checked
                                  )
                                }
                                className="sr-only peer"
                              />
                              <div
                                className={`w-11 h-6 rounded-full peer ${
                                  isDarkMode ? "bg-gray-700" : "bg-gray-300"
                                } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
                              ></div>
                            </label>
                          </div>

                          <div>
                            <label
                              className={`font-medium ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Preferred Roles
                            </label>
                            <input
                              type="text"
                              value={profileData.preferredRoles.join(", ")}
                              onChange={(e) =>
                                handleInputChange(
                                  "preferredRoles",
                                  e.target.value
                                    .split(",")
                                    .map((role) => role.trim())
                                )
                              }
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isDarkMode
                                  ? "bg-gray-700 text-white border-gray-600"
                                  : "bg-white text-gray-800 border-gray-300"
                              }`}
                              placeholder="e.g., Frontend Developer, Full Stack Engineer, DevOps"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label
                                className={`font-medium ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Expected Salary
                              </label>
                              <input
                                type="text"
                                value={profileData.expectedSalary}
                                onChange={(e) =>
                                  handleInputChange(
                                    "expectedSalary",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="e.g., $80,000 - $100,000"
                              />
                            </div>
                            <div>
                              <label
                                className={`font-medium ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Notice Period
                              </label>
                              <input
                                type="text"
                                value={profileData.noticePeriod}
                                onChange={(e) =>
                                  handleInputChange(
                                    "noticePeriod",
                                    e.target.value
                                  )
                                }
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                                placeholder="e.g., 2 weeks, 1 month"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveProfile}
                        disabled={
                          !profileData.fullName ||
                          !profileData.email ||
                          isSaving
                        }
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors flex items-center justify-center ${
                          !profileData.fullName ||
                          !profileData.email ||
                          isSaving
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {isSaving ? (
                          <Loader2 size={20} className="animate-spin mr-2" />
                        ) : (
                          <Save size={20} className="mr-2" />
                        )}
                        {isSaving ? "Saving..." : "Save Profile"}
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  // Upload Welcome Screen
                  <div
                    className={`rounded-2xl shadow-lg p-8 text-center ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <Brain className="w-24 h-24 text-blue-500 mx-auto mb-6" />
                    <h2
                      className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Welcome to Profile Management
                    </h2>
                    <p
                      className={`text-lg mb-6 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Upload your resume to get started with AI-powered profile
                      analysis
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h3
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Upload Resume
                        </h3>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          PDF, DOCX, or TXT files
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <Brain className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h3
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          AI Analysis
                        </h3>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Extract and structure your information
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <User className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h3
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Manage Profile
                        </h3>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Edit and save your profile
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </Layout>
    </ThemeContext.Provider>
  );
};

export default ResumeAnalysisPage;
