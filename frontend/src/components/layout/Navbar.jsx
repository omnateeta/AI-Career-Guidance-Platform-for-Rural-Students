import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage, supportedLanguages } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FaHome, FaBriefcase, FaChartLine, FaBook, FaUsers, FaComments, FaSignOutAlt, FaLanguage, FaWifi, FaGlobe, FaChevronDown } from 'react-icons/fa'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { lowBandwidth, toggleLowBandwidth } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: t('dashboard') || 'Dashboard' },
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
    navigate('/')
  }

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode)
    setShowLanguageDropdown(false)
  }

  const currentLang = supportedLanguages.find(lang => lang.code === language)

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-gray-200/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-gradient hidden md:block">Margdarshak AI</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector - Beautiful Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                title="Change Language"
              >
                <FaGlobe className="text-primary-600" />
                <span className="text-sm font-medium">
                  {currentLang?.flag} {currentLang?.nativeName}
                </span>
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
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-3 bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-700">🌐 Select Language / भाषा चुनें</p>
                    </div>
                    
                    {/* Google Translate Widget */}
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Quick Translate:</p>
                      <div id="google_translate_element_nav" className="google-translate-container" />
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {/* Indian Languages Section */}
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 px-2 mb-1">🇮🇳 Indian Languages</p>
                        {supportedLanguages
                          .filter(lang => lang.flag === '🇮🇳')
                          .map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={`w-full text-left px-3 py-2 hover:bg-primary-50 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                                language === lang.code ? 'bg-primary-100 border-l-4 border-primary-600' : ''
                              }`}
                            >
                              <span className="text-xl">{lang.flag}</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{lang.nativeName}</p>
                                <p className="text-xs text-gray-500">{lang.name}</p>
                              </div>
                              {language === lang.code && (
                                <span className="ml-auto text-primary-600 text-xs font-semibold">✓</span>
                              )}
                            </button>
                          ))}
                      </div>

                      {/* International Languages Section */}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-500 px-2 mb-1">🌐 International</p>
                        {supportedLanguages
                          .filter(lang => lang.flag !== '🇮🇳')
                          .map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={`w-full text-left px-3 py-2 hover:bg-primary-50 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                                language === lang.code ? 'bg-primary-100 border-l-4 border-primary-600' : ''
                              }`}
                            >
                              <span className="text-xl">{lang.flag}</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{lang.nativeName}</p>
                                <p className="text-xs text-gray-500">{lang.name}</p>
                              </div>
                              {language === lang.code && (
                                <span className="ml-auto text-primary-600 text-xs font-semibold">✓</span>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                    
                    <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
                      <p className="text-xs text-gray-500">Powered by Google Translate</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Low Bandwidth Toggle */}
            <button
              onClick={toggleLowBandwidth}
              className={`p-2 rounded-lg transition-all duration-300 ${
                lowBandwidth ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
              }`}
              title="Toggle Low Bandwidth Mode"
            >
              <FaWifi className="w-4 h-4" />
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.profile?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.profile?.name || 'User'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300"
              title="Logout"
            >
              <FaSignOutAlt className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
