import React, { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const ProfessionalSignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dob: "",
    role: "",
    companyName: "",
    currentJobRole: "",
    yearsOfExperience: "",
    password: "",
    confirmPassword: "",
  });

  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  useEffect(() => {
    // Professional network connection animation for skill gap analysis
    const canvas = document.getElementById("backgroundCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Professional color scheme
    const primaryColor = isDarkTheme
      ? "rgba(59, 130, 246, 0.1)"
      : "rgba(99, 102, 241, 0.08)";
    const secondaryColor = isDarkTheme
      ? "rgba(139, 92, 246, 0.08)"
      : "rgba(168, 85, 247, 0.06)";
    const accentColor = isDarkTheme
      ? "rgba(6, 182, 212, 0.05)"
      : "rgba(6, 182, 212, 0.04)";

    // Nodes for network visualization
    const nodes = [];
    const nodeCount = 15;

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        baseSize: Math.random() * 4 + 2,
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        connections: [],
      });
    }

    // Create connections between nodes
    nodes.forEach((node, index) => {
      node.connections = nodes
        .slice(index + 1)
        .filter((_, i) => Math.random() > 0.7)
        .map((n) => nodes.indexOf(n));
    });

    let animationFrameId;

    const draw = () => {
      // Clear with subtle gradient
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(
        0,
        isDarkTheme ? "rgba(15, 23, 42, 0.1)" : "rgba(248, 250, 252, 0.1)"
      );
      gradient.addColorStop(
        1,
        isDarkTheme ? "rgba(30, 41, 59, 0.1)" : "rgba(241, 245, 249, 0.1)"
      );
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections first (behind nodes)
      ctx.strokeStyle = isDarkTheme
        ? "rgba(100, 116, 139, 0.15)"
        : "rgba(148, 163, 184, 0.1)";
      ctx.lineWidth = 0.5;

      nodes.forEach((node, index) => {
        node.connections.forEach((connIndex) => {
          const targetNode = nodes[connIndex];
          const distance = Math.sqrt(
            Math.pow(node.x - targetNode.x, 2) +
              Math.pow(node.y - targetNode.y, 2)
          );

          if (distance < 200) {
            ctx.globalAlpha = 1 - distance / 200;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;

      // Draw nodes with subtle pulse animation
      nodes.forEach((node) => {
        // Update pulse
        node.pulse += node.speed;
        node.size = node.baseSize + Math.sin(node.pulse) * 1.5;

        // Draw node glow
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.size * 3
        );
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw node core
        ctx.fillStyle = isDarkTheme
          ? "rgba(59, 130, 246, 0.3)"
          : "rgba(99, 102, 241, 0.25)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle floating particles
      ctx.fillStyle = isDarkTheme
        ? "rgba(203, 213, 225, 0.03)"
        : "rgba(71, 85, 105, 0.02)";
      for (let i = 0; i < 5; i++) {
        const time = Date.now() * 0.001;
        const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.3 + i) * 0.5 + 0.5) * canvas.height;
        const size = Math.sin(time + i) * 1 + 1;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkTheme]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate password if password or confirmPassword changes
    if (name === "password" || name === "confirmPassword") {
      validatePassword();
    }
  };

  const validatePassword = () => {
    const errors = [];

    // Check minimum length
    if (formData.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    // Check for number
    if (!/\d/.test(formData.password)) {
      errors.push("Password must contain at least one number");
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.push("Password must contain at least one special character");
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match");
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleCaptchaChange = (value) => {
    console.log("Captcha value:", value);
  };

  // Auth Service for frontend
  const AuthService = {
    async signUp(formData) {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
        role: formData.role,
        companyName: formData.companyName,
        currentJobRole: formData.currentJobRole,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        recaptchaToken: "", // You'll handle this in frontend
      };

      const response = await fetch("http://localhost:2090/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // If response is not OK, try to parse error message
        try {
          const errorResponse = await response.json();
          throw new Error(
            errorResponse.message || `HTTP error! status: ${response.status}`
          );
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      return await response.json();
    },

    async verifyEmail(token) {
      const response = await fetch(
        `http://localhost:8080/api/auth/verify-email?token=${token}`
      );

      if (!response.ok) {
        throw new Error("Email verification failed");
      }

      return await response.text(); // Returns simple string message
    },

    async resendVerification(email) {
      const response = await fetch(
        "http://localhost:8080/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `email=${encodeURIComponent(email)}`,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }

      return await response.text(); // Returns simple string message
    },
  };

  // Updated handleSubmit function in your React component
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      // You can add your frontend reCAPTCHA validation here
      // const isHuman = await validateRecaptchaFrontend(); // Your frontend validation

      // if (!isHuman) {
      //   alert('Please complete the reCAPTCHA verification');
      //   return;
      // }

      const result = await AuthService.signUp(formData);

      if (result.success) {
        console.log("Signup successful:", result);
        alert(
          result.message ||
            "Registration successful! Please check your email for verification."
        );
        // Redirect to login or verification page
      } else {
        alert(result.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message || "Signup failed. Please try again.");
    }
  };

  // Example frontend reCAPTCHA validation (if you want to handle it in frontend)
  const validateRecaptchaFrontend = () => {
    // Your frontend reCAPTCHA validation logic
    // This could be checking if the reCAPTCHA was completed
    return true; // Return true if validation passes
  };
  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDarkTheme
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 text-slate-800"
      }`}
    >
      {/* Professional Network Background */}
      <canvas
        id="backgroundCanvas"
        className="fixed inset-0 w-full h-full z-0"
      />

      {/* Enhanced overlay for better readability */}
      <div
        className={`fixed inset-0 z-1 ${
          isDarkTheme
            ? "bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-slate-900/20"
            : "bg-gradient-to-br from-blue-50/10 via-slate-50/5 to-indigo-50/10"
        }`}
      />

      {/* Professional Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 flex justify-between items-center backdrop-blur-lg transition-all duration-500 ${
          isDarkTheme
            ? "bg-slate-900/80 text-white border-b border-slate-700/30"
            : "bg-white/80 text-slate-800 shadow-sm border-b border-slate-200/30"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            WorkSkill AI
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDarkTheme
                ? "bg-slate-800 text-amber-300 hover:bg-slate-700 hover:shadow-lg"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-lg"
            }`}
            aria-label="Toggle theme"
          >
            {isDarkTheme ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          <a
            href="/"
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 ${
              isDarkTheme
                ? "bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-lg"
            }`}
          >
            HOME
          </a>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4 z-10 mt-20">
        <div
          className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl ${
            isDarkTheme
              ? "bg-slate-800/70 backdrop-blur-lg border border-slate-700/30"
              : "bg-white/90 backdrop-blur-lg border border-slate-200/30"
          }`}
        >
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
            <h1 className="text-2xl font-bold text-white relative z-10 tracking-tight">
              Join WorkSkill AI
            </h1>
            <p className="text-blue-100 text-sm mt-1 relative z-10">
              Start Your Predictive Skill Analysis Journey
            </p>
          </div>

          {/* Form content */}
          <div
            className={`p-6 transition-all duration-500 ${
              isDarkTheme ? "bg-slate-800/40" : "bg-white/80"
            }`}
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Row 1: First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label
                    htmlFor="firstName"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-slate-300 group-hover:text-blue-300"
                        : "text-slate-700 group-hover:text-blue-600"
                    }`}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                      isDarkTheme
                        ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                        : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                    }`}
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="lastName"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-slate-300 group-hover:text-blue-300"
                        : "text-slate-700 group-hover:text-blue-600"
                    }`}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                      isDarkTheme
                        ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                        : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                    }`}
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Email and Phone Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label
                    htmlFor="email"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-slate-300 group-hover:text-blue-300"
                        : "text-slate-700 group-hover:text-blue-600"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                      isDarkTheme
                        ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                        : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                    }`}
                    placeholder="professional@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="phoneNumber"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-slate-300 group-hover:text-blue-300"
                        : "text-slate-700 group-hover:text-blue-600"
                    }`}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                      isDarkTheme
                        ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                        : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                    }`}
                    placeholder="+1 (555) 000-0000"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Row 3: Date of Birth and Role */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label
                    htmlFor="dob"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-slate-300 group-hover:text-blue-300"
                        : "text-slate-700 group-hover:text-blue-600"
                    }`}
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                      isDarkTheme
                        ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                        : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                    }`}
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="role"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-slate-300 group-hover:text-blue-300"
                        : "text-slate-700 group-hover:text-blue-600"
                    }`}
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                      isDarkTheme
                        ? "bg-slate-700/30 border-slate-600 text-white focus:border-blue-500 group-hover:border-blue-400"
                        : "bg-white border-slate-300 text-slate-800 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                    }`}
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Your Role</option>
                    <option value="employee">Employee</option>
                    <option value="hr">HR Professional</option>
                  </select>
                </div>
              </div>

              {/* Conditional Row 4: Based on Role Selection */}
              {formData.role && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.role === "hr" ? (
                    <div className="group">
                      <label
                        htmlFor="companyName"
                        className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                          isDarkTheme
                            ? "text-slate-300 group-hover:text-blue-300"
                            : "text-slate-700 group-hover:text-blue-600"
                        }`}
                      >
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                          isDarkTheme
                            ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                            : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                        }`}
                        placeholder="Company Name"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  ) : (
                    <div className="group">
                      <label
                        htmlFor="currentJobRole"
                        className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                          isDarkTheme
                            ? "text-slate-300 group-hover:text-blue-300"
                            : "text-slate-700 group-hover:text-blue-600"
                        }`}
                      >
                        Current Job Role
                      </label>
                      <input
                        type="text"
                        id="currentJobRole"
                        name="currentJobRole"
                        className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                          isDarkTheme
                            ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                            : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                        }`}
                        placeholder="Current Job Role"
                        value={formData.currentJobRole}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
                  <div className="group">
                    <label
                      htmlFor="yearsOfExperience"
                      className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                        isDarkTheme
                          ? "text-slate-300 group-hover:text-blue-300"
                          : "text-slate-700 group-hover:text-blue-600"
                      }`}
                    >
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      min="0"
                      max="50"
                      className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                        isDarkTheme
                          ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                          : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                      }`}
                      placeholder="Years of Experience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Row 5: Password and Confirm Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-slate-300 group-hover:text-blue-300"
                        : "text-slate-700 group-hover:text-blue-600"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                        isDarkTheme
                          ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                          : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                      }`}
                      placeholder="Create Secure Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onFocus={() => setShowPasswordRules(true)}
                      onBlur={() =>
                        setTimeout(() => setShowPasswordRules(false), 200)
                      }
                      required
                    />

                    {/* Password rules popup */}
                    {showPasswordRules && (
                      <div
                        className={`absolute top-full left-0 mt-2 w-72 p-4 rounded-xl shadow-2xl text-sm z-20 backdrop-blur-lg ${
                          isDarkTheme
                            ? "bg-slate-800/95 text-slate-300 border border-slate-600"
                            : "bg-white/95 text-slate-700 border border-slate-300"
                        }`}
                      >
                        <p className="font-semibold mb-2">
                          Password Requirements:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li
                            className={
                              formData.password.length >= 8
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            At least 8 characters
                          </li>
                          <li
                            className={
                              /[A-Z]/.test(formData.password)
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            One uppercase letter
                          </li>
                          <li
                            className={
                              /[a-z]/.test(formData.password)
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            One lowercase letter
                          </li>
                          <li
                            className={
                              /\d/.test(formData.password)
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            One number
                          </li>
                          <li
                            className={
                              /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            One special character
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="confirmPassword"
                    className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                      isDarkTheme
                        ? "text-slate-300 group-hover:text-blue-300"
                        : "text-slate-700 group-hover:text-blue-600"
                    }`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                        isDarkTheme
                          ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                          : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                      }`}
                      placeholder="Confirm Your Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => setShowPasswordRules(true)}
                      onBlur={() =>
                        setTimeout(() => setShowPasswordRules(false), 200)
                      }
                      required
                    />

                    {/* Confirm password popup */}
                    {showPasswordRules && (
                      <div
                        className={`absolute top-full left-0 mt-2 w-72 p-4 rounded-xl shadow-2xl text-sm z-20 backdrop-blur-lg ${
                          isDarkTheme
                            ? "bg-slate-800/95 text-slate-300 border border-slate-600"
                            : "bg-white/95 text-slate-700 border border-slate-300"
                        }`}
                      >
                        <p className="font-semibold mb-2">Confirm Password:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li
                            className={
                              formData.password === formData.confirmPassword &&
                              formData.password !== ""
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            Passwords must match
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Display password errors */}
              {passwordErrors.length > 0 && (
                <div
                  className={`p-3 rounded-lg ${
                    isDarkTheme
                      ? "bg-red-900/30 border border-red-800"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      isDarkTheme ? "text-red-300" : "text-red-700"
                    }`}
                  >
                    Please fix the following issues:
                  </p>
                  <ul className="list-disc pl-4 mt-1">
                    {passwordErrors.map((error, index) => (
                      <li
                        key={index}
                        className={`text-sm ${
                          isDarkTheme ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* reCAPTCHA */}
              <div className="recaptcha-container flex justify-center transform transition-all duration-300 hover:scale-105">
                <ReCAPTCHA
                  sitekey="6Lcd7JQqAAAAAMT-lTBgJsgIDp5O9pmTMYbaRIbu"
                  onChange={handleCaptchaChange}
                />
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-100 hover:from-blue-700 hover:to-indigo-700"
              >
                Create Professional Account
              </button>

              {/* Already have an account */}
              <div className="text-center pt-3">
                <span
                  className={`text-sm ${
                    isDarkTheme ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Already have an account?{" "}
                </span>
                <a
                  href="/signin"
                  className={`text-sm font-semibold transition-all duration-300 hover:underline ${
                    isDarkTheme
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  LOGIN HERE
                </a>
              </div>

              {/* Professional Divider */}
              <div className="relative flex items-center justify-center pt-4">
                <div
                  className={`flex-grow border-t transition-colors duration-300 ${
                    isDarkTheme ? "border-slate-700" : "border-slate-300"
                  }`}
                ></div>
                <span
                  className={`text-xs font-medium mx-4 transition-colors duration-300 ${
                    isDarkTheme ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Secure Registration
                </span>
                <div
                  className={`flex-grow border-t transition-colors duration-300 ${
                    isDarkTheme ? "border-slate-700" : "border-slate-300"
                  }`}
                ></div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  className={`group py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] ${
                    isDarkTheme
                      ? "bg-slate-700/30 text-white hover:bg-slate-600/40 hover:shadow-lg"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:shadow-lg"
                  }`}
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className={`group py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] ${
                    isDarkTheme
                      ? "bg-slate-700/30 text-white hover:bg-slate-600/40 hover:shadow-lg"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:shadow-lg"
                  }`}
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </form>

            {/* Professional Footer */}
            <div
              className={`text-center text-xs pt-6 space-y-2 ${
                isDarkTheme ? "text-slate-500" : "text-slate-400"
              }`}
            >
              <div className="flex justify-center items-center space-x-4">
                <a
                  href="#"
                  className="transition-colors duration-300 hover:text-blue-400"
                >
                  Privacy Policy
                </a>
                <span>•</span>
                <a
                  href="#"
                  className="transition-colors duration-300 hover:text-blue-400"
                >
                  Terms of Service
                </a>
                <span>•</span>
                <a
                  href="#"
                  className="transition-colors duration-300 hover:text-blue-400"
                >
                  Security
                </a>
              </div>
              <div className="font-medium">
                © 2024 WorkSkill AI. Enterprise Ready.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalSignUp;
