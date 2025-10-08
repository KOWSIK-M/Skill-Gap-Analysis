'use client';

import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Brain, 
  BarChart3, 
  Lightbulb, 
  GraduationCap,
  Sun,
  Moon,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  Search,
} from 'lucide-react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export default function Layout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Logout handler function
  const handleLogout = () => {
    // Add your logout logic here (clear tokens, etc.)
    console.log('Logging out...');
    
    // Then navigate to signin page
    navigate('/signin');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500', path: '/dashboard' },
    { name: 'My Profile', icon: Brain, color: 'from-purple-500 to-pink-500', path: '/profile' },
    { name: 'Skill Gap Analysis', icon: BarChart3, color: 'from-green-500 to-emerald-500', path: '/skillgap' },
    { name: 'Recommendations', icon: Lightbulb, color: 'from-orange-500 to-amber-500', path: '/recommendations' },
    { name: 'Training Platforms', icon: GraduationCap, color: 'from-red-500 to-orange-500', path: '/training' },
  ];

  // Helper function to check if a nav item is active
  const isActivePage = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Mobile Header */}
        <motion.header 
          className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
        >
          <div className="flex items-center justify-between p-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
            
            <motion.h1 
              className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              WorkSkill AI
            </motion.h1>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
          </div>
        </motion.header>

        <div className="flex">
          {/* Fixed Sidebar */}
          <motion.aside
            className={`fixed lg:static h-screen z-40 transition-all duration-300 ${
              isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-20'
            } ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-xl border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            initial={false}
            animate={{ width: isSidebarOpen ? 256 : 80 }}
            style={{ position: 'fixed', height: '100vh', overflowY: 'auto' }}
          >
            <div className="p-6 lg:p-8 h-full flex flex-col">
              {/* Logo */}
              <motion.div 
                className="flex items-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Brain size={24} className="text-white" />
                </motion.div>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
                    >
                      WorkSkill AI
                    </motion.h1>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Navigation */}
              <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePage(item.path);
                  
                  return (
                    <motion.button
                      key={item.name}
                      whileHover={{ 
                        scale: 1.02,
                        x: 5
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 relative overflow-hidden group ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : isDarkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex-shrink-0"
                      >
                        <Icon size={20} />
                      </motion.div>
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-3 font-medium whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      
                      {isActive && (
                        <motion.div 
                          className="absolute right-3 w-2 h-2 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        />
                      )}
                      
                      {/* Hover effect */}
                      {!isActive && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 rounded-xl"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <motion.div 
                className="mt-auto pt-4 border-t border-gray-700/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
                >
                  <LogOut size={20} />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 font-medium"
                      >
                        Logout
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <main className={`flex-1 min-h-screen transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`} style={{ marginLeft: isSidebarOpen ? '256px' : '80px' }}>
            
            {/* Fixed Top Navbar */}
            <motion.nav 
              className={`flex items-center justify-between p-6 sticky top-0 z-40 ${
                isDarkMode ? 'bg-gray-800/95 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md'
              } shadow-lg border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              style={{ position: 'sticky', top: 0 }}
            >
              <div className="flex-1 max-w-md">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text"
                    placeholder="Search skills, trainings, roles..."
                    className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  />
                </motion.div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className={`p-3 rounded-2xl transition-all duration-300 ${
                    isDarkMode ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  }`}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>

                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-2xl relative transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <Bell size={20} />
                  <motion.span 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center space-x-3 p-2 rounded-2xl transition-all duration-300 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <motion.div 
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      T
                    </motion.div>
                    <div className="text-left">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Hi, Tarun
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Premium Member
                      </p>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl backdrop-blur-md ${
                          isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
                        } border`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4 border-b border-gray-200/20">
                          <p className="font-semibold text-white">Tarun Tadepalli</p>
                          <p className="text-sm text-gray-400">tarun@WorkSkill.ai</p>
                        </div>
                        <motion.button 
                          whileHover={{ x: 5, backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(0, 0, 0, 0.05)' }}
                          onClick={() => {
                            navigate('/profile');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 transition-all duration-200"
                        >
                          <User size={18} />
                          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Profile Settings</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ x: 5, backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(0, 0, 0, 0.05)' }}
                          onClick={() => {
                            navigate('/planprogress');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 transition-all duration-200"
                        >
                          <Settings size={18} />
                          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Plan & Progress</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ x: 5, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          onClick={() => {
                            handleLogout();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 rounded-b-2xl text-red-400 transition-all duration-200"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.nav>

            {/* Page Content - No extra padding to remove gap */}
            <div className="p-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}