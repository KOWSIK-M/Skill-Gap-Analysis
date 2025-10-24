"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { useTheme } from "../Home/ThemeContext";
import {
  Brain,
  Target,
  Clock,
  CheckCircle,
  Activity,
  Zap,
  ChevronRight,
  BarChart3,
  PieChart,
  TrendingUp,
  Lock,
  X,
  AlertCircle,
  Database,
  Cloud,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const navigate = useNavigate();

  // Function to get user ID from localStorage
  const getUserId = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.userId || user._id;
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    return null;
  };

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const userId = getUserId();

      console.log("User ID:", userId);

      if (!userId) {
        console.error("No user ID found");
        setProfileCheckComplete(true);
        setHasProfile(false);
        return;
      }

      const response = await fetch(
        `http://localhost:2090/api/user/profile/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const profileData = await response.json();
        console.log("Profile data received:", profileData);
        setUserData(profileData);

        // Check if profile has sufficient data for meaningful insights
        const hasSufficientData = checkProfileCompleteness(profileData);

        if (hasSufficientData) {
          setHasProfile(true);
          setShowProfilePrompt(false);
          await fetchDashboardData(userId);
        } else {
          // Profile exists but doesn't have enough data
          setHasProfile(false);
          setShowProfilePrompt(true);
          // Still fetch dashboard data but it will show empty/locked state
          await fetchDashboardData(userId);
        }
      } else if (response.status === 404) {
        // No profile found at all
        setHasProfile(false);
        setShowProfilePrompt(true);
        console.log("No profile found for user");
      } else {
        console.error("Profile check failed:", response.status);
        setHasProfile(false);
        setShowProfilePrompt(false);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      setHasProfile(false);
      setShowProfilePrompt(false);
    } finally {
      setProfileCheckComplete(true);
      setLoading(false);
      setIsVisible(true);
    }
  };

  // Function to check if profile has sufficient data for dashboard
  const checkProfileCompleteness = (profileData) => {
    if (!profileData) return false;

    // Check for basic required fields
    const hasBasicInfo =
      profileData.name &&
      profileData.name.trim() !== "" &&
      profileData.email &&
      profileData.email.trim() !== "";

    // Check if user has skills or experience data
    const hasSkills =
      profileData.profile?.technicalSkills?.length > 0 ||
      profileData.skills?.length > 0;

    const hasExperience = profileData.profile?.experience?.length > 0;

    return hasBasicInfo && (hasSkills || hasExperience);
  };

  const fetchDashboardData = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:2090/api/dashboard/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard data received:", data);
        setDashboardData(data);
      } else {
        console.error("Failed to fetch dashboard data:", response.status);
        // Set empty dashboard data with proper array structure
        setDashboardData({
          stats: [],
          skills: [],
          progress: [],
          roleMatches: [],
          recentActivities: [],
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set empty dashboard data with proper array structure
      setDashboardData({
        stats: [],
        skills: [],
        progress: [],
        roleMatches: [],
        recentActivities: [],
      });
    }
  };

  // Calculate actual stats from profile data
  const calculateStatsFromProfile = () => {
    if (!userData?.profile) return null;

    const profile = userData.profile;
    const technicalSkills = profile.technicalSkills || [];
    const experience = profile.experience || [];

    return [
      {
        label: "Total Skills Added",
        value: technicalSkills.length.toString(),
        change: "+0%",
        icon: Brain,
        color: "from-blue-500 to-cyan-500",
        trend: "up",
        locked: false,
      },
      {
        label: "Roles You Fit",
        value: "0", // This would come from role matching algorithm
        change: "+0%",
        icon: Target,
        color: "from-green-500 to-emerald-500",
        trend: "up",
        locked: false,
      },
      {
        label: "Pending Skills",
        value: "0", // This would come from learning plan
        change: "-0%",
        icon: Clock,
        color: "from-orange-500 to-amber-500",
        trend: "down",
        locked: false,
      },
      {
        label: "Completed Trainings",
        value: experience.length.toString(), // Using experience count as placeholder
        change: "+0%",
        icon: CheckCircle,
        color: "from-purple-500 to-pink-500",
        trend: "up",
        locked: false,
      },
    ];
  };

  // Default empty data for when no profile exists
  const defaultStats = [
    {
      label: "Total Skills Added",
      value: "0",
      change: "+0%",
      icon: Brain,
      color: "from-gray-400 to-gray-500",
      trend: "up",
      locked: true,
    },
    {
      label: "Roles You Fit",
      value: "0",
      change: "+0%",
      icon: Target,
      color: "from-gray-400 to-gray-500",
      trend: "up",
      locked: true,
    },
    {
      label: "Pending Skills",
      value: "0",
      change: "-0%",
      icon: Clock,
      color: "from-gray-400 to-gray-500",
      trend: "down",
      locked: true,
    },
    {
      label: "Completed Trainings",
      value: "0",
      change: "+0%",
      icon: CheckCircle,
      color: "from-gray-400 to-gray-500",
      trend: "up",
      locked: true,
    },
  ];

  const emptySkillsData = [
    {
      name: "Complete your profile to see skills",
      level: 0,
      color: "#9CA3AF",
      icon: Lock,
    },
  ];

  const emptyProgressData = [
    { month: "Jan", progress: 0 },
    { month: "Feb", progress: 0 },
    { month: "Mar", progress: 0 },
    { month: "Apr", progress: 0 },
    { month: "May", progress: 0 },
    { month: "Jun", progress: 0 },
  ];

  const emptyRoleMatchData = [
    { name: "Complete Profile", value: 100, color: "#9CA3AF" },
  ];

  const emptyActivities = [
    {
      action: "Complete your profile",
      detail: "to unlock personalized insights",
      time: "Now",
      type: "info",
      icon: AlertCircle,
    },
  ];

  // Safe data access with array fallbacks
  const getSafeArray = (data, key, fallback) => {
    const value = data?.[key];
    return Array.isArray(value) ? value : fallback;
  };

  // Calculate skills data from profile
  const getSkillsData = () => {
    if (!hasProfile || !userData?.profile?.technicalSkills) {
      return emptySkillsData;
    }

    const technicalSkills = userData.profile.technicalSkills;

    // Convert skills to the format expected by the skills section
    return technicalSkills.map((skill, index) => ({
      name: skill,
      level: 50, // Default level - you might want to calculate this based on user data
      color: getSkillColor(index),
      icon: getSkillIcon(skill),
    }));
  };

  // Helper function to get color based on index
  const getSkillColor = (index) => {
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
    ];
    return colors[index % colors.length];
  };

  // Helper function to get icon based on skill name
  const getSkillIcon = (skillName) => {
    // Map skills to appropriate icons
    const skillIcons = {
      react: Brain,
      javascript: Brain,
      python: Brain,
      java: Brain,
      sql: Database,
      aws: Cloud,
      docker: Brain,
      node: Brain,
      html: Brain,
      css: Brain,
      // Add more mappings as needed
    };

    const lowerSkill = skillName.toLowerCase();
    for (const [key, icon] of Object.entries(skillIcons)) {
      if (lowerSkill.includes(key)) {
        return icon;
      }
    }
    return Brain; // Default icon
  };

  // Use actual data if available, otherwise use empty data
  const profileStats = calculateStatsFromProfile();
  const stats = hasProfile
    ? profileStats || getSafeArray(dashboardData, "stats", defaultStats)
    : defaultStats.map((stat) => ({ ...stat, locked: true }));

  const skillsData = hasProfile ? getSkillsData() : emptySkillsData;

  const progressData = hasProfile
    ? getSafeArray(dashboardData, "progress", [])
    : emptyProgressData;

  const roleMatchData = hasProfile
    ? getSafeArray(dashboardData, "roleMatches", [])
    : emptyRoleMatchData;

  const activities = hasProfile
    ? getSafeArray(dashboardData, "recentActivities", [])
    : emptyActivities;

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

  // Show loading while checking profile
  if (loading || !profileCheckComplete) {
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

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-6"
      >
        {/* Profile Completion Prompt - Only show if needed and dismissible */}
        {showProfilePrompt && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg relative"
          >
            <button
              onClick={() => setShowProfilePrompt(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  Complete Your Profile
                </h3>
                <p className="text-amber-100 mb-4">
                  Add your skills and experience to unlock personalized insights
                  and career recommendations.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/profile")}
                    className="bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Complete Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfilePrompt(false)}
                    className="border border-white/30 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Maybe Later
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Welcome Section */}
        <motion.section
          variants={itemVariants}
          className="rounded-2xl p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-300 rounded-full"></div>
          </div>

          <div className="flex items-center space-x-6 relative z-10">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Zap className="text-white" size={32} />
            </motion.div>
            <div className="flex-1">
              <motion.h1
                className="text-3xl lg:text-4xl font-bold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {userData?.name || "User"}! 👋
              </motion.h1>
              <motion.p
                className="text-blue-100 text-lg mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {hasProfile
                  ? "Ready to level up your skills today? Your career growth journey continues here."
                  : "Complete your profile to unlock personalized career insights and recommendations."}
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/skills")}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl transition-all duration-300"
              >
                <span className="font-semibold">
                  {hasProfile ? "Continue Learning" : "Explore Skills"}
                </span>
                <ChevronRight size={20} />
              </motion.button>
            </div>

            {/* Lock icon if no profile */}
            {!hasProfile && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 bg-white/20 rounded-2xl"
              >
                <Lock size={32} className="text-amber-300" />
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={!stat.locked ? { scale: 1.02, y: -5 } : {}}
                className={`bg-gradient-to-br ${
                  stat.color
                } rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${
                  stat.locked ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {/* Lock overlay for locked items */}
                {stat.locked && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                    <Lock size={24} className="text-white" />
                  </div>
                )}

                {/* Animated background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute -inset-10 bg-gradient-to-r from-white/10 to-white/5 transform rotate-12"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={
                        !stat.locked ? { rotate: 360, scale: 1.1 } : {}
                      }
                      transition={{ duration: 0.5 }}
                      className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm"
                    >
                      <IconComponent size={24} />
                    </motion.div>
                    <motion.span
                      className={`text-sm font-semibold px-2 py-1 rounded-full flex items-center space-x-1 ${
                        stat.trend === "up"
                          ? "bg-green-500/20"
                          : "bg-red-500/20"
                      }`}
                      whileHover={!stat.locked ? { scale: 1.1 } : {}}
                    >
                      <TrendingUp
                        size={14}
                        className={stat.trend === "down" ? "rotate-180" : ""}
                      />
                      <span>{stat.change}</span>
                    </motion.span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-blue-100 text-sm">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Chart */}
          <motion.section
            variants={itemVariants}
            className={`lg:col-span-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
              isDarkMode
                ? "bg-gray-800 text-white [&>*]:text-white [&_*]:text-inherit"
                : "bg-white text-gray-900 [&>*]:text-gray-900 [&_*]:text-inherit"
            }`}
          >
            {!hasProfile && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-10 rounded-2xl ${
                  isDarkMode ? "bg-gray-800/80" : "bg-white/80"
                }`}
              >
                <div className="text-center">
                  <Lock size={48} className="text-gray-400 mx-auto mb-4" />
                  <p
                    className={`font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Complete your profile to unlock progress analytics
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <BarChart3 className="mr-2" size={24} />
                Skill Progress Analytics
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/planprogress")}
                className={`text-sm flex items-center space-x-1 ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-500 hover:text-blue-600"
                }`}
              >
                <span>View Details</span>
                <ChevronRight size={16} />
              </motion.button>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: "#1f2937",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke={hasProfile ? "#3B82F6" : "#9CA3AF"}
                    strokeWidth={3}
                    dot={{
                      fill: hasProfile ? "#3B82F6" : "#9CA3AF",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      fill: hasProfile ? "#2563eb" : "#6B7280",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* Role Match */}
          <motion.section
            variants={itemVariants}
            className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            {!hasProfile && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-10 rounded-2xl ${
                  isDarkMode ? "bg-gray-800/80" : "bg-white/80"
                }`}
              >
                <div className="text-center">
                  <Lock size={48} className="text-gray-400 mx-auto mb-4" />
                  <p
                    className={`font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Complete your profile to see role matches
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-6 flex items-center">
              <PieChart className="mr-2" size={24} />
              Role Match %
            </h2>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={roleMatchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {roleMatchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: "#1f2937",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {roleMatchData.map((role, index) => (
                <motion.div
                  key={role.name}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="text-sm">{role.name}</span>
                  <span
                    className="text-sm font-bold ml-auto"
                    style={{ color: role.color }}
                  >
                    {role.value}%
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Skills and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills Proficiency */}
          <motion.section
            variants={itemVariants}
            className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            {!hasProfile && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-10 rounded-2xl ${
                  isDarkMode ? "bg-gray-800/80" : "bg-white/80"
                }`}
              >
                <div className="text-center">
                  <Lock size={48} className="text-gray-400 mx-auto mb-4" />
                  <p
                    className={`font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Add skills to your profile to see proficiency levels
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <Brain className="mr-2" size={24} />
                Skills Proficiency
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/skills")}
                className={`text-sm flex items-center space-x-1 ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-500 hover:text-blue-600"
                }`}
              >
                <span>View All</span>
                <ChevronRight size={16} />
              </motion.button>
            </div>

            <div className="space-y-4">
              {skillsData.map((skill, index) => {
                const IconComponent = skill.icon;
                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={hasProfile ? { scale: 1.01, y: -2 } : {}}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${
                      !hasProfile ? "opacity-60" : ""
                    } ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: skill.color + "20" }}
                        whileHover={
                          hasProfile ? { rotate: 360, scale: 1.1 } : {}
                        }
                        transition={{ duration: 0.5 }}
                      >
                        <IconComponent
                          size={18}
                          style={{ color: skill.color }}
                        />
                      </motion.div>
                      <span
                        className={`font-medium transition-colors ${
                          isDarkMode
                            ? "text-gray-200 group-hover:text-blue-400"
                            : "text-gray-800 group-hover:text-blue-600"
                        }`}
                      >
                        {skill.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-24 rounded-full h-2 ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      >
                        <motion.div
                          className="h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{
                            duration: 1,
                            delay: 0.8 + index * 0.1,
                          }}
                          style={{ backgroundColor: skill.color }}
                        />
                      </div>
                      <span
                        className="text-sm font-bold w-8"
                        style={{ color: skill.color }}
                      >
                        {skill.level}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Recent Activities */}
          <motion.section
            variants={itemVariants}
            className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
              isDarkMode ? "bg-gray-800 !text-white" : "bg-white !text-gray-900"
            }`}
          >
            {!hasProfile && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-10 rounded-2xl ${
                  isDarkMode ? "bg-gray-800/80" : "bg-white/80"
                }`}
              >
                <div className="text-center">
                  <Lock size={48} className="text-gray-400 mx-auto mb-4" />
                  <p
                    className={`font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Complete your profile to see recent activities
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <Activity className="mr-2" size={24} />
                Recent Activities
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-sm flex items-center space-x-1 ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-500 hover:text-blue-600"
                }`}
              >
                <span>View All</span>
                <ChevronRight size={16} />
              </motion.button>
            </div>

            <div className="space-y-3">
              {activities.map((activity, index) => {
                const IconComponent = activity.icon;
                const getColor = (type) => {
                  switch (type) {
                    case "success":
                      return "text-green-500";
                    case "warning":
                      return "text-yellow-500";
                    case "info":
                      return "text-blue-500";
                    default:
                      return "text-gray-500";
                  }
                };

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={hasProfile ? { x: 5, scale: 1.01 } : {}}
                    className={`flex items-center space-x-3 p-3 rounded-xl group transition-all duration-200 ${
                      !hasProfile ? "opacity-60" : ""
                    } ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <motion.div
                      whileHover={hasProfile ? { scale: 1.1, rotate: 5 } : {}}
                      className={`p-2 rounded-lg ${getColor(
                        activity.type
                      )} bg-opacity-20`}
                    >
                      <IconComponent size={16} />
                    </motion.div>

                    <div className="flex-1">
                      <p
                        className={`font-medium transition-colors ${
                          isDarkMode
                            ? "text-white group-hover:text-blue-400"
                            : "text-gray-900 group-hover:text-blue-600"
                        }`}
                      >
                        {activity.action}:{" "}
                        <span
                          className={
                            isDarkMode ? "text-blue-400" : "text-blue-600"
                          }
                        >
                          {activity.detail}
                        </span>
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {activity.time}
                      </p>
                    </div>

                    {hasProfile && (
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "success"
                            ? "bg-green-400"
                            : activity.type === "warning"
                            ? "bg-yellow-400"
                            : "bg-blue-400"
                        }`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </Layout>
  );
}
