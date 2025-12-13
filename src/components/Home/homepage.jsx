import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

const WorkSkillAILanding = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  // State for counters
  const [productivityCount, setProductivityCount] = useState(0);
  const [alignmentCount, setAlignmentCount] = useState(0);
  const [collaborationCount, setCollaborationCount] = useState(0);
  
  // Refs for scroll animations and section tracking
  const sections = {
    home: useRef(null),
    about: useRef(null),
    features: useRef(null),
    roadmap: useRef(null),
    research: useRef(null),
    impact: useRef(null),
    testimonials: useRef(null),
    contact: useRef(null)
  };
  
  // Scroll progress for parallax effects
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  
  // Check if elements are in view
  const homeInView = useInView(sections.home, { once: true, amount: 0.5 });
  const aboutInView = useInView(sections.about, { once: true, amount: 0.3 });
  const featuresInView = useInView(sections.features, { once: true, amount: 0.3 });
  const roadmapInView = useInView(sections.roadmap, { once: true, amount: 0.3 });
  const researchInView = useInView(sections.research, { once: true, amount: 0.3 });
  const impactInView = useInView(sections.impact, { once: true, amount: 0.3 });
  const testimonialsInView = useInView(sections.testimonials, { once: true, amount: 0.3 });
  const contactInView = useInView(sections.contact, { once: true, amount: 0.5 });
  
  // Section observer for navbar highlighting
  useEffect(() => {
    const observers = [];
    
    Object.keys(sections).forEach((key) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(key);
          }
        },
        { threshold: 0.5 }
      );
      
      if (sections[key].current) {
        observer.observe(sections[key].current);
        observers.push(observer);
      }
    });
    
    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);
  
  // Counter animations
  useEffect(() => {
    if (impactInView) {
      const productivityInterval = setInterval(() => {
        setProductivityCount(prev => {
          if (prev >= 73) {
            clearInterval(productivityInterval);
            return 73;
          }
          return prev + 1;
        });
      }, 30);
      
      const alignmentInterval = setInterval(() => {
        setAlignmentCount(prev => {
          if (prev >= 89) {
            clearInterval(alignmentInterval);
            return 89;
          }
          return prev + 1;
        });
      }, 25);
      
      const collaborationInterval = setInterval(() => {
        setCollaborationCount(prev => {
          if (prev >= 65) {
            clearInterval(collaborationInterval);
            return 65;
          }
          return prev + 1;
        });
      }, 35);
      
      return () => {
        clearInterval(productivityInterval);
        clearInterval(alignmentInterval);
        clearInterval(collaborationInterval);
      };
    }
  }, [impactInView]);
  
  // Features data
  const features = [
    {
      title: "Workforce Data Integration",
      description: "Seamlessly connect with your existing HR systems and aggregate workforce data for comprehensive analysis.",
      icon: "📊"
    },
    {
      title: "Predictive Skill Gap Analysis",
      description: "Our PyTorch AI models identify current and future skill gaps with remarkable accuracy.",
      icon: "🧠"
    },
    {
      title: "Personalized Upskilling Recommendations",
      description: "Get tailored learning paths and development opportunities for each employee.",
      icon: "🎯"
    },
    {
      title: "Stakeholder Collaboration Tools",
      description: "Enable managers, HR, and employees to collaborate on development plans.",
      icon: "🤝"
    },
    {
      title: "Progress & Impact Metrics",
      description: "Track ROI and measure the impact of your upskilling initiatives with detailed analytics.",
      icon: "📈"
    }
  ];
  
  // Timeline data
  const timeline = [
    { phase: "Data Integration", status: "completed" },
    { phase: "Train Predictive Models", status: "completed" },
    { phase: "Dashboards & Apps", status: "completed" },
    { phase: "Progress Tracking", status: "current" },
    { phase: "Pilot Testing & Refinement", status: "upcoming" }
  ];
  
  // Testimonials data
  const testimonials = [
    {
      quote: "WorkSkill AI transformed how we approach workforce development. The predictive insights have been incredibly accurate.",
      author: "Sarah Johnson",
      role: "HR Director, TechCorp"
    },
    {
      quote: "The personalized upskilling recommendations have increased our employee engagement scores by 40% in just six months.",
      author: "Michael Chen",
      role: "Learning & Development Manager"
    },
    {
      quote: "Finally, a platform that connects skill development to actual business outcomes. The ROI has been undeniable.",
      author: "Lisa Rodriguez",
      role: "CTO, InnovateCo"
    }
  ];

  // 3D tilt effect for cards
  const useTilt = (active) => {
    const ref = useRef(null);
    
    useEffect(() => {
      if (!ref.current || !active) return;
      
      const element = ref.current;
      
      const handleMouseMove = (e) => {
        const { left, top, width, height } = element.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        element.style.transform = `
          perspective(1000px)
          rotateX(${y * 10}deg)
          rotateY(${x * 10}deg)
          scale3d(1.02, 1.02, 1.02)
        `;
      };
      
      const handleMouseLeave = () => {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      };
      
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [active]);
    
    return ref;
  };

  // Floating particles component
  const FloatingParticles = ({ count = 15, colors = ['blue', 'purple', 'emerald'] }) => {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(count)].map((_, i) => {
          const color = colors[i % colors.length];
          const size = Math.random() * 4 + 2;
          const duration = 3 + Math.random() * 5;
          const delay = Math.random() * 2;
          
          return (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
              }}
            />
          );
        })}
      </div>
    );
  };

  // Rolling shine effect component
  const RollingShine = () => {
    return (
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </motion.div>
    );
  };

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    sections[sectionId].current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white' : 'bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900'} overflow-x-hidden transition-colors duration-500`}>
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 flex items-center"
            >
              <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400`}>
                WorkSkill AI
              </span>
            </motion.div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center">
              <div className="ml-10 flex items-baseline space-x-4">
                {['home', 'about', 'features', 'roadmap', 'research', 'impact', 'testimonials', 'contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${darkMode ? 
                      activeSection === item ? 'text-blue-400' : 'text-gray-300 hover:text-white' : 
                      activeSection === item ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                    {activeSection === item && (
                      <motion.div 
                        className={`absolute bottom-0 left-0 w-full h-0.5 ${darkMode ? 'bg-blue-400' : 'bg-blue-600'}`}
                        layoutId="navbar-underline"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="ml-4 flex items-center space-x-4">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-700'} transition-colors duration-300`}
                >
                  {darkMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                
                {/* Single Login/Register button */}
                <button
  onClick={() => (window.location.href = "/signin")}
  className={`btn-clean ${darkMode ? "dark" : "light"}`}
>
  Login / Register
</button>





              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleDarkMode}
                className={`p-2 mr-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-700'} transition-colors duration-300`}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'} focus:outline-none transition-colors`}
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-md transition-colors duration-500`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {['home', 'about', 'features', 'roadmap', 'research', 'impact', 'testimonials', 'contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${darkMode ? 
                      activeSection === item ? 'text-blue-400 bg-gray-700/50' : 'text-gray-300 hover:text-white hover:bg-gray-700/50' : 
                      activeSection === item ? 'text-blue-600 bg-gray-200/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'} transition-colors`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
                
                <div className="pt-4 pb-3 border-t border-gray-700">
  <div className="px-2 space-y-3">
    {/* Login/Register Button */}
    <button
      onClick={() => {
        setMobileMenuOpen(false);
        window.location.href = "/signin";
      }}
      className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
        darkMode 
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700" 
          : "bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600"
      } transition-all duration-300 shadow-md hover:shadow-lg`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      Login / Register
    </button>
    
    {/* Alternative Options */}
    <div className="text-center">
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2 transition-colors`}>
        Or try our demo
      </p>
      <button
        onClick={() => {
          setMobileMenuOpen(false);
          // Add demo navigation logic here
        }}
        className={`text-sm px-4 py-2 rounded-md font-medium w-full ${
          darkMode 
            ? 'text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/10' 
            : 'text-emerald-600 border border-emerald-500/30 hover:bg-emerald-50'
        } transition-colors`}
      >
        Try Demo Version
      </button>
    </div>
  </div>
</div>
</div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section ref={sections.home} className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-16 ${darkMode ? '' : 'bg-white'} transition-colors duration-500`}>
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-b from-blue-900/20 via-purple-900/30 to-black/70' : 'bg-gradient-to-b from-blue-100/40 via-purple-100/30 to-white/70'} z-10 transition-colors duration-500`}></div>
          <div className={`w-full h-full ${darkMode ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-black opacity-70' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-white opacity-70'} transition-colors duration-500`}></div>
        </div>
        
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute inset-0 ${darkMode ? 'bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#4f4f4f1e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1e_1px,transparent_1px)]'} bg-[size:14px_24px] transition-colors duration-500`}></div>
          <motion.div 
            className={`absolute inset-0 ${darkMode ? 'bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#80808028_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#4f4f4f1e_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)]'} bg-[size:36px_36px] transition-colors duration-500`}
            animate={{ x: [0, -18, 0], y: [0, -18, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          ></motion.div>
        </div>
        
        {/* Glow Effects */}
        {darkMode && (
          <>
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[120px] opacity-15"></div>
          </>
        )}
        
        {/* Animated particles */}
        {darkMode && <FloatingParticles count={20} />}
        
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={homeInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block mb-6"
              >
                <div className={`text-sm font-medium ${darkMode ? 'text-blue-400 bg-blue-400/10' : 'text-blue-600 bg-blue-100'} px-4 py-1 rounded-full mb-4 inline-flex items-center transition-colors duration-500`}>
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-600'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${darkMode ? 'bg-blue-500' : 'bg-blue-700'}`}></span>
                  </span>
                  AI-Powered Workforce Analytics
                </div>
              </motion.div>
              
              <motion.h1 
                className={`text-5xl md:text-6xl font-bold mb-6 ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-text-sheen block">
                  Predicting Skills.
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 animate-text-sheen animation-delay-1000 block mt-2">
                  Empowering Growth.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-10 max-w-2xl transition-colors duration-500`}
              >
                AI-powered workforce skill gap analysis and upskilling recommendations.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all relative overflow-hidden group text-white"
                >
                  <span className="relative z-10">Let's Go</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <RollingShine />
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 bg-transparent border-2 ${darkMode ? 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10' : 'border-emerald-500/50 text-emerald-600 hover:bg-emerald-50'} rounded-lg font-semibold text-lg transition-all relative overflow-hidden group transition-colors duration-500`}
                >
                  <span className="relative z-10">Learn More</span>
                  <RollingShine />
                </motion.button>
              </motion.div>
            </motion.div>
            
            {/* Right Column - Professional AI Process Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={homeInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="relative h-96 lg:h-[500px]"
            >
              <div className={`absolute inset-0 ${darkMode ? 'bg-gray-800/20' : 'bg-white/80'} rounded-2xl ${darkMode ? 'border border-gray-700/50' : 'border border-gray-200/50'} overflow-hidden backdrop-blur-sm transition-colors duration-500`}>
                
                {/* Process Flow Visualization */}
                <div className="absolute inset-0 flex flex-col justify-center items-center p-8">
                  {/* Step 1: Data Input */}
                  <motion.div 
                    className={`flex items-center justify-center w-16 h-16 rounded-full ${darkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-100 border border-blue-200'} mb-4 transition-colors duration-500`}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                  >
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </motion.div>
                  <motion.p className={`text-sm font-medium mb-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-500`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    Data Collection
                  </motion.p>
                  
                  {/* Connector Arrow */}
                  <motion.div className={`w-1 h-10 ${darkMode ? 'bg-blue-500/30' : 'bg-blue-200'} mb-6 transition-colors duration-500`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  />
                  
                  {/* Step 2: AI Processing */}
                  <motion.div 
                    className={`flex items-center justify-center w-20 h-20 rounded-full ${darkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100 border border-purple-200'} mb-4 transition-colors duration-500`}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  >
                    <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </motion.div>
                  <motion.p className={`text-sm font-medium mb-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'} transition-colors duration-500`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    AI Analysis
                  </motion.p>
                  
                  {/* Connector Arrow */}
                  <motion.div className={`w-1 h-10 ${darkMode ? 'bg-purple-500/30' : 'bg-purple-200'} mb-6 transition-colors duration-500`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  />
                  
                  {/* Step 3: Results */}
                  <motion.div 
                    className={`flex items-center justify-center w-16 h-16 rounded-full ${darkMode ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-200'} transition-colors duration-500`}
                    animate={{ 
                      y: [0, -3, 0],
                      boxShadow: [
                        '0 0 0 rgba(16, 185, 129, 0)',
                        '0 0 20px rgba(16, 185, 129, 0.3)',
                        '0 0 0 rgba(16, 185, 129, 0)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <motion.p className={`text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} transition-colors duration-500`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.7 }}
                  >
                    Actionable Insights
                  </motion.p>
                </div>
                
                {/* Floating elements */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-emerald-400'} ${darkMode ? 'opacity-50' : 'opacity-30'} transition-colors duration-500`}
                    style={{
                      left: `${10 + (i * 10) % 80}%`,
                      top: `${15 + (i * 12) % 70}%`,
                    }}
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-6 h-10 border-2 ${darkMode ? 'border-blue-400/50' : 'border-blue-500/50'} rounded-full flex justify-center transition-colors duration-500`}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-1 h-1 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mt-2 transition-colors duration-500`}
            ></motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* About/Mission Section */}
      <section ref={sections.about} className={`py-20 px-4 md:px-8 relative ${darkMode ? '' : 'bg-white'} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={aboutInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <motion.h2 
                className={`text-3xl md:text-4xl font-bold mb-8 ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}
                initial={{ opacity: 0 }}
                animate={aboutInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Transforming Workforce Development with AI
              </motion.h2>
              
              <motion.p 
                className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-10 transition-colors duration-500`}
                initial={{ opacity: 0 }}
                animate={aboutInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                WorkSkill AI leverages cutting-edge artificial intelligence to analyze your workforce's current capabilities, 
                predict future skill requirements, and create personalized upskilling pathways that drive organizational growth.
              </motion.p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { 
                    title: "Data Integration", 
                    icon: "🔌", 
                    color: "blue",
                    description: "Connect all your HR systems seamlessly"
                  },
                  { 
                    title: "Skill Gap Prediction", 
                    icon: "🔍", 
                    color: "purple",
                    description: "Identify current and future skill needs"
                  },
                  { 
                    title: "Upskilling Recommendations", 
                    icon: "📚", 
                    color: "emerald",
                    description: "Personalized learning paths for employees"
                  },
                  { 
                    title: "Collaboration Tools", 
                    icon: "👥", 
                    color: "blue",
                    description: "Enable teamwork across departments"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={aboutInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: darkMode ? `0 0 25px rgba(${item.color === 'blue' ? '59, 130, 246' : item.color === 'purple' ? '139, 92, 246' : '52, 211, 153'}, 0.4)` : `0 0 15px rgba(0, 0, 0, 0.1)`
                    }}
                    className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/30' : 'bg-white border-gray-200 hover:border-blue-500/30'} transition-all relative overflow-hidden group h-full transition-colors duration-500`}
                  >
                    <div className="flex items-start mb-3">
                      <motion.div 
                        className="text-2xl mr-3"
                        whileHover={{ rotate: 10, scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {item.icon}
                      </motion.div>
                      <h3 className={`font-semibold text-lg ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}>{item.title}</h3>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>{item.description}</p>
                    
                    {/* Hover shine effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                    
                    {/* Continuous subtle glow */}
                    {darkMode && (
                      <motion.div 
                        className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"
                        animate={{
                          boxShadow: [
                            `0 0 0 rgba(${item.color === 'blue' ? '59, 130, 246' : item.color === 'purple' ? '139, 92, 246' : '52, 211, 153'}, 0)`,
                            `0 0 25px rgba(${item.color === 'blue' ? '59, 130, 246' : item.color === 'purple' ? '139, 92, 246' : '52, 211, 153'}, 0.5)`,
                            `0 0 0 rgba(${item.color === 'blue' ? '59, 130, 246' : item.color === 'purple' ? '139, 92, 246' : '52, 211, 153'}, 0)`
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      />
                    )}
                    
                    {/* Floating particles around the card */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full ${item.color === 'blue' ? 'bg-blue-400' : item.color === 'purple' ? 'bg-purple-400' : 'bg-emerald-400'} ${darkMode ? '' : 'opacity-30'} transition-colors duration-500`}
                        style={{
                          left: `${10 + (i * 30)}%`,
                          top: `${20 + (i * 10)}%`,
                        }}
                        animate={{
                          y: [0, -5, 0],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={aboutInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              {/* Professional Workforce Analytics Image */}
              <div className={`relative h-96 w-full ${darkMode ? 'bg-gray-800/20' : 'bg-white/80'} rounded-2xl ${darkMode ? 'border border-gray-700/50' : 'border border-gray-200/50'} overflow-hidden backdrop-blur-sm transition-colors duration-500`}>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <motion.div 
                      className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} mb-6 transition-colors duration-500`}
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 6, repeat: Infinity }}
                    >
                      <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </motion.div>
                    
                    <motion.h3 
                      className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-500`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Workforce Analytics
                    </motion.h3>
                    
                    <motion.p 
                      className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-500`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Real-time insights into your organization's skills landscape
                    </motion.p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {['Skills', 'Gaps', 'Growth'].map((item, index) => (
                        <motion.div 
                          key={index}
                          className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} transition-colors duration-500`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + index * 0.2 }}
                        >
                          <div className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-500`}>{item}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-500`}>Analysis</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-emerald-400'} ${darkMode ? '' : 'opacity-30'} transition-colors duration-500`}
                    style={{
                      left: `${15 + (i * 12) % 70}%`,
                      top: `${20 + (i * 10) % 70}%`,
                    }}
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.4, 0.9, 0.4],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={sections.features} className={`py-20 px-4 md:px-8 ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-950' : 'bg-gradient-to-b from-gray-50 to-blue-50'} relative overflow-hidden transition-colors duration-500`}>
        {/* Animated background elements */}
        {darkMode && <FloatingParticles count={15} colors={['blue', 'purple']} />}
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className={`text-3xl md:text-4xl font-bold text-center mb-4 ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}
          >
            Powerful Features
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-xl text-center mb-16 max-w-3xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}
          >
            Everything you need to future-proof your workforce
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const tiltRef = useTilt(true);
              return (
                <motion.div
                  key={index}
                  ref={tiltRef}
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`backdrop-blur-sm rounded-xl p-6 border ${darkMode ? 'bg-gray-800/30 border-gray-700 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10' : 'bg-white/80 border-gray-200 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/5'} transition-all h-full relative overflow-hidden group transition-colors duration-500`}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className={`text-xl font-semibold mb-3 ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}>{feature.title}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>{feature.description}</p>
                  
                  {/* Rolling shine effect on hover */}
                  <RollingShine />
                  
                  {/* Continuous outer glow animation */}
                  {darkMode && (
                    <motion.div 
                      className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100"
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(59, 130, 246, 0)",
                          "0 0 20px rgba(59, 130, 246, 0.5)",
                          "0 0 0 rgba(59, 130, 246, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  
                  {/* Floating elements around the card */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1 h-1 ${darkMode ? 'bg-blue-400' : 'bg-blue-500/30'} rounded-full transition-colors duration-500`}
                      style={{
                        left: `${10 + (i * 25)}%`,
                        top: `${15 + (i * 5)}%`,
                      }}
                      animate={{
                        y: [0, -5, 0],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={sections.roadmap} className="py-20 px-4 md:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={roadmapInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            Product Development Roadmap
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={roadmapInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto"
          >
            Our journey to transforming workforce development
          </motion.p>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 transform -translate-x-1/2"></div>
            
            {/* Timeline items */}
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={roadmapInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: index * 0.2 }}
                  className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center`}
                >
                  <div className="md:w-1/2 mb-4 md:mb-0 md:px-8">
                    <div className={`p-6 rounded-xl bg-gray-800/50 border ${
                      item.status === 'completed' ? 'border-emerald-500/30' : 
                      item.status === 'current' ? 'border-blue-500/30' : 'border-gray-700'
                    } relative overflow-hidden group`}>
                      <h3 className="text-xl font-semibold mb-2">{item.phase}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 
                        item.status === 'current' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      
                      {/* Rolling shine effect */}
                      <RollingShine />
                    </div>
                  </div>
                  
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 z-10">
                    <motion.div 
                      className={`w-4 h-4 rounded-full ${
                        item.status === 'completed' ? 'bg-emerald-500' : 
                        item.status === 'current' ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      animate={{
                        scale: [1, 1.2, 1],
                        boxShadow: item.status !== 'upcoming' ? [
                          `0 0 0 ${item.status === 'completed' ? 'rgba(16, 185, 129, 0)' : 'rgba(59, 130, 246, 0)'}`,
                          `0 0 10px ${item.status === 'completed' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
                          `0 0 0 ${item.status === 'completed' ? 'rgba(16, 185, 129, 0)' : 'rgba(59, 130, 246, 0)'}`
                        ] : []
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                  </div>
                  
                  <div className="md:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Research & Standards Section */}
      <section ref={sections.research} className="py-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 to-blue-900/20 relative">
        <FloatingParticles count={10} colors={['blue', 'emerald']} />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={researchInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">Research Scope</h2>
              
              {[
                "Predictive Analytics",
                "HR Analytics",
                "Ethical AI",
                "Workforce Fairness"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={researchInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center mb-6 group"
                >
                  <motion.div 
                    className="mr-4 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    />
                  </motion.div>
                  <span className="text-lg group-hover:text-blue-300 transition-colors">{item}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={researchInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">Standards Compliance</h2>
              
              {[
                "ISO 9001:2015 Quality Management",
                "GDPR Data Protection",
                "ISO 21001:2018 Educational Organizations",
                "Ethical AI Framework"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={researchInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="flex items-center mb-6 group"
                >
                  <motion.div 
                    className="mr-4 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.svg 
                      className="w-4 h-4 text-emerald-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </motion.div>
                  <span className="text-lg group-hover:text-emerald-300 transition-colors">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact/Outcomes Section */}
      <section ref={sections.impact} className="py-20 px-4 md:px-8 relative overflow-hidden">
        <FloatingParticles count={15} colors={['blue', 'purple', 'emerald']} />
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={impactInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Measurable Impact
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={impactInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl text-gray-400 mb-16 max-w-3xl mx-auto"
          >
            Organizations using WorkSkill AI report significant improvements
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={impactInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="p-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all relative overflow-hidden group"
            >
              <div className="text-5xl font-bold text-blue-400 mb-4">{productivityCount}%</div>
              <h3 className="text-xl font-semibold mb-2">Improved Employee Productivity</h3>
              <p className="text-gray-400">Through targeted skill development</p>
              
              {/* Rolling shine effect */}
              <RollingShine />
              
              {/* Continuous glow animation */}
              <motion.div 
                className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={impactInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="p-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10 transition-all relative overflow-hidden group"
            >
              <div className="text-5xl font-bold text-purple-400 mb-4">{alignmentCount}%</div>
              <h3 className="text-xl font-semibold mb-2">Enhanced Alignment with Goals</h3>
              <p className="text-gray-400">Skills that match business objectives</p>
              
              <RollingShine />
              
              <motion.div 
                className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(139, 92, 246, 0)",
                    "0 0 20px rgba(139, 92, 246, 0.5)",
                    "0 0 0 rgba(139, 92, 246, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={impactInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="p-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all relative overflow-hidden group"
            >
              <div className="text-5xl font-bold text-emerald-400 mb-4">{collaborationCount}%</div>
              <h3 className="text-xl font-semibold mb-2">Increased Collaboration</h3>
              <p className="text-gray-400">Across teams and departments</p>
              
              <RollingShine />
              
              <motion.div 
                className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(52, 211, 153, 0)",
                    "0 0 20px rgba(52, 211, 153, 0.5)",
                    "0 0 0 rgba(52, 211, 153, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
  ref={sections.testimonials}
  className={`py-20 px-4 md:px-8 transition-colors duration-500 ${
    darkMode
      ? "bg-gradient-to-b from-gray-900 to-gray-950 text-white"
      : "bg-gradient-to-b from-gray-50 to-blue-50 text-gray-900"
  }`}
>

        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            What Our Clients Say
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto"
          >
            Trusted by forward-thinking organizations worldwide
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const tiltRef = useTilt(true);
              return (
                <motion.div
                  key={index}
                  ref={tiltRef}
                  initial={{ opacity: 0, y: 50 }}
                  animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all relative overflow-hidden group"
                >
                  <div className="text-4xl mb-4 text-purple-400">"</div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                  
                  <RollingShine />
                  
                  <motion.div 
                    className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(139, 92, 246, 0)",
                        "0 0 20px rgba(139, 92, 246, 0.3)",
                        "0 0 0 rgba(139, 92, 246, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section ref={sections.contact} className={`py-20 px-4 md:px-8 relative overflow-hidden ${darkMode ? '' : 'bg-white'} transition-colors duration-500`}>
        {/* Animated gradient background */}
        <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10' : 'bg-gradient-to-r from-blue-100/30 via-purple-100/20 to-emerald-100/30'} animate-gradient-x transition-colors duration-500`}></div>
        
        {/* Glow effects */}
        {darkMode && (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px] opacity-20"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px] opacity-20"></div>
          </>
        )}
        
        {darkMode && <FloatingParticles count={20} colors={['blue', 'purple', 'emerald']} />}
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={contactInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-text-sheen">
              Ready to Transform Your Workforce?
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={contactInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-xl mb-10 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-500`}
          >
            Join WorkSkill AI and unlock the future of workforce development.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={contactInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all relative overflow-hidden group text-white"
            >
              <span className="relative z-10">Let's Go</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <RollingShine />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 bg-transparent border-2 ${darkMode ? 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10' : 'border-emerald-500/50 text-emerald-600 hover:bg-emerald-50'} rounded-lg font-semibold text-lg transition-all relative overflow-hidden group transition-colors duration-500`}
            >
              <span className="relative z-10">Schedule a Demo</span>
              <RollingShine />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 md:px-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}>WorkSkill AI</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-500`}>
                AI-powered workforce skill gap analysis and upskilling recommendations.
              </p>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}>Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`}>Features</a></li>
                <li><a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`}>Pricing</a></li>
                <li><a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`}>Case Studies</a></li>
                <li><a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`}>API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}>Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`}>About</a></li>
                <li><a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`}>Blog</a></li>
                <li><a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`}>Careers</a></li>
                <li><a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-300`}>Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? '' : 'text-gray-900'} transition-colors duration-500`}>Connect</h4>
              <div className="flex space-x-4">
                {[
                  { name: 'twitter', icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                    </svg>
                  )},
                  { name: 'linkedin', icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  )},
                  { name: 'github', icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                    </svg>
                  )},
                  { name: 'facebook', icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                    </svg>
                  )}
                ].map((platform) => (
                  <motion.a 
                    key={platform.name} 
                    href="#" 
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:text-blue-600 hover:bg-gray-200'} transition-colors duration-300 shadow-sm`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {platform.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          
          <div className={`border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} mt-12 pt-8 flex flex-col md:flex-row justify-between items-center transition-colors duration-500`}>
            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm transition-colors duration-500`}>© {new Date().getFullYear()} WorkSkill AI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className={`${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500'} text-sm transition-colors duration-300`}>Privacy Policy</a>
              <a href="#" className={`${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500'} text-sm transition-colors duration-300`}>Terms of Service</a>
              <a href="#" className={`${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-500'} text-sm transition-colors duration-300`}>Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WorkSkillAILanding;