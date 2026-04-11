import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FaHome, FaBriefcase, FaChartLine, FaBook, FaUsers, FaComments, FaSignOutAlt, FaLanguage, FaWifi, FaGlobe, FaChevronDown, FaMapSigns } from 'react-icons/fa'
import { useLanguage } from '../../context/LanguageContext'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { lowBandwidth, toggleLowBandwidth } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: t('dashboard') || 'Dashboard' },
    { path: '/career-guidance', icon: FaMapSigns, label: 'Career Guidance' },
    { path: '/career-quiz', icon: FaChartLine, label: 'Career Quiz' },
    { path: '/careers', icon: FaChartLine, label: t('careers') || 'Careers' },
    { path: '/skills', icon: FaBriefcase, label: t('skills') || 'Skills' },
    { path: '/learning', icon: FaBook, label: t('learning') || 'Learning' },
    { path: '/jobs', icon: FaBriefcase, label: t('jobs') || 'Jobs' },
    { path: '/mentors', icon: FaUsers, label: t('mentors') || 'Mentors' },
    { path: '/chat', icon: FaComments, label: t('chat') || 'Chat' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="Margdarshak AI Logo" className="h-10 w-auto rounded-lg" />
            <span className="text-xl font-bold text-gradient hidden md:block">Margdarshak AI</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector - Simple Google Translate */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                title="Translate Page"
              >
                <FaGlobe className="text-primary-600" />
                <span className="text-sm font-medium">Translate</span>
                <FaChevronDown className={`w-3 h-3 transition-transform duration-300 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown */}
              <AnimatePresence>
                {showLanguageDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-4 bg-gradient-to-r from-primary-500 to-secondary-500">
                      <p className="text-sm font-bold text-white text-center">🌐 Google Translator</p>
                      <p className="text-xs text-white/80 text-center mt-1">Select language to translate this page</p>
                    </div>
                    
                    {/* Google Translate Widget */}
                    <div className="p-6">
                      <div id="google_translate_element_nav" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <Link
              to="/profile"
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.profile?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.profile?.name || 'User'}
              </span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300"
              title="Logout"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
