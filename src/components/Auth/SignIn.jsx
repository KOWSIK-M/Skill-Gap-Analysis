import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "./AuthContext";

const ProfessionalSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  useEffect(() => {
    // Professional network connection animation
    const canvas = document.getElementById("backgroundCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const primaryColor = isDarkTheme
      ? "rgba(59, 130, 246, 0.1)"
      : "rgba(99, 102, 241, 0.08)";
    const secondaryColor = isDarkTheme
      ? "rgba(139, 92, 246, 0.08)"
      : "rgba(168, 85, 247, 0.06)";

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

    nodes.forEach((node, index) => {
      node.connections = nodes
        .slice(index + 1)
        .filter((_, i) => Math.random() > 0.7)
        .map((n) => nodes.indexOf(n));
    });

    let animationFrameId;

    const draw = () => {
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

      nodes.forEach((node) => {
        node.pulse += node.speed;
        node.size = node.baseSize + Math.sin(node.pulse) * 1.5;

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

        ctx.fillStyle = isDarkTheme
          ? "rgba(59, 130, 246, 0.3)"
          : "rgba(99, 102, 241, 0.25)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

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

  const handleTabChange = (tab) => {
    if (tab === role || isAnimating) return;

    setIsAnimating(true);
    setRole(tab);
    setError("");

    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };
  const handleCaptchaChange = (value) => {
    console.log("Captcha value:", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(email.trim(), password, role);
      
      if (result.success) {
        console.log("Login successful:", result.data);
        
        // Redirect based on role - the navigation will happen automatically
        // because isAuthenticated will change and trigger the useEffect
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl ${
            isDarkTheme
              ? "bg-slate-800/70 backdrop-blur-lg border border-slate-700/30"
              : "bg-white/90 backdrop-blur-lg border border-slate-200/30"
          }`}
        >
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
            <h1 className="text-2xl font-bold text-white relative z-10 tracking-tight">
              Predictive Skill Analysis
            </h1>
            <p className="text-blue-100 text-sm mt-1 relative z-10">
              Intelligent Workforce Optimization
            </p>
          </div>

          {/* Login Type Tabs */}
          <div
            className={`relative p-2 m-4 rounded-xl ${
              isDarkTheme ? "bg-slate-700/30" : "bg-slate-100/50"
            }`}
          >
            {/* Animated Slider Background */}
            <div
              className={`absolute top-2 bottom-2 w-1/2 rounded-lg transition-all duration-400 ease-in-out transform ${
                role === "employee"
                  ? "translate-x-0 bg-gradient-to-r from-blue-500 to-blue-600"
                  : "translate-x-full bg-gradient-to-r from-indigo-500 to-indigo-600"
              } ${isDarkTheme ? "shadow-lg" : "shadow-md"}`}
            />

            {/* Tab Buttons */}
            <div className="relative z-10 flex">
              <button
                onClick={() => handleTabChange("employee")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  role === "employee"
                    ? "text-white"
                    : isDarkTheme
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Employee Login
              </button>
              <button
                onClick={() => handleTabChange("hr")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  role === "hr"
                    ? "text-white"
                    : isDarkTheme
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                HR Professional
              </button>
            </div>
          </div>

          {/* Form content */}
          <div
            className={`p-6 transition-all duration-500 ${
              isDarkTheme ? "bg-slate-800/40" : "bg-white/80"
            }`}
          >
            {error && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                  isDarkTheme
                    ? "bg-red-900/50 text-red-200 border border-red-700/50"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {error}
              </div>
            )}

            <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="group">
                <label
                  htmlFor="email"
                  className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    isDarkTheme
                      ? "text-slate-300 group-hover:text-blue-300"
                      : "text-slate-700 group-hover:text-blue-600"
                  }`}
                >
                  Professional Email
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                    isDarkTheme
                      ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                  }`}
                  placeholder={`${
                    role === "employee" ? "employee" : "hr"
                  }@company.com`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="group">
                <label
                  htmlFor="password"
                  className={`block text-sm font-semibold mb-2 transition-colors duration-300 ${
                    isDarkTheme
                      ? "text-slate-300 group-hover:text-blue-300"
                      : "text-slate-700 group-hover:text-blue-600"
                  }`}
                >
                  Secure Password
                </label>
                <input
                  type="password"
                  id="password"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:scale-[1.02] ${
                    isDarkTheme
                      ? "bg-slate-700/30 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 group-hover:border-blue-400"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 group-hover:border-blue-400 shadow-sm"
                  }`}
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* reCAPTCHA */}
              <div className="recaptcha-container flex justify-center transform transition-all duration-300 hover:scale-105">
                <ReCAPTCHA
                  sitekey="6Lcd7JQqAAAAAMT-lTBgJsgIDp5O9pmTMYbaRIbu"
                  onChange={handleCaptchaChange}
                />
              </div>
              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                  role === "employee"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  `Access ${role === "employee" ? "Employee" : "HR"} Dashboard`
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-right pt-2">
                <a
                  href="#"
                  className={`text-sm font-medium transition-all duration-300 hover:underline ${
                    isDarkTheme
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Register Link */}
              <div className="text-center pt-3">
                <span
                  className={`text-sm ${
                    isDarkTheme ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Don't have an account?{" "}
                </span>
                <a
                  href="/signup"
                  className={`text-sm font-semibold transition-all duration-300 hover:underline ${
                    isDarkTheme
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  REGISTER HERE
                </a>
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

export default ProfessionalSignIn;
