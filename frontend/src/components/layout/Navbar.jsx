import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage, supportedLanguages } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FaHome, FaBriefcase, FaChartLine, FaBook, FaUsers, FaComments, FaSignOutAlt, FaLanguage, FaWifi, FaGlobe, FaChevronDown, FaMapSigns, FaAward, FaUniversity } from 'react-icons/fa'
import { useState, useEffect } from 'react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { lowBandwidth, toggleLowBandwidth } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  // Function to translate page using Google Translate
  const translatePage = (targetLang) => {
    // Check if Google Translate is loaded
    if (!window.google || !window.google.translate) {
      alert('Google Translate is still loading. Please wait a moment and try again.')
      return
    }

    // Find the Google Translate select element
    const selectElement = document.querySelector('.goog-te-combo')
    
    if (selectElement) {
      // Set the value and trigger change event
      selectElement.value = targetLang
      selectElement.dispatchEvent(new Event('change'))
      setShowLanguageDropdown(false)
    } else {
      console.error('Google Translate select element not found')
      alert('Translation service not ready. Please refresh the page and try again.')
    }
  }

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: t('dashboard') || 'Dashboard' },
    { path: '/career-guidance', icon: FaMapSigns, label: 'Career Guidance' },
    { path: '/career-quiz', icon: FaChartLine, label: 'Career Quiz' },
    { path: '/careers', icon: FaChartLine, label: t('careers') || 'Careers' },
    { path: '/skills', icon: FaBriefcase, label: t('skills') || 'Skills' },
    { path: '/learning', icon: FaBook, label: t('learning') || 'Learning' },
    { path: '/jobs', icon: FaBriefcase, label: t('jobs') || 'Jobs' },
    { path: '/exams', icon: FaAward, label: 'Competitive Exams' },
    { path: '/scholarships', icon: FaAward, label: 'Scholarships' },
    { path: '/colleges', icon: FaUniversity, label: 'Nearby Colleges' },
    { path: '/mentors', icon: FaUsers, label: t('mentors') || 'Mentors' },
    { path: '/communicate', icon: FaComments, label: 'Communicate Assist' },
    { path: '/chat', icon: FaComments, label: t('chat') || 'Chat' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-md">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left - Always visible */}
          <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
            <img src="/logo.jpg" alt="Margdarshak AI Logo" className="h-9 w-9 rounded-lg shadow-sm" />
            <span className="text-lg font-bold text-gradient hidden md:block">Margdarshak AI</span>
          </Link>

          {/* Right Section Controls - Always visible */}
          <div className="flex items-center space-x-2 flex-shrink-0 order-last">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-1.5 px-2.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                title="Translate Page"
              >
                <FaGlobe className="text-primary-600 w-4 h-4" />
                <FaChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
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
                      <p className="text-sm font-bold text-white text-center">🌐 Translate Page</p>
                      <p className="text-xs text-white/80 text-center mt-1">Select language</p>
                    </div>
                    
                    {/* Custom Language Selector - More Reliable */}
                    <div className="p-4">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            translatePage(e.target.value)
                          }
                        }}
                        defaultValue=""
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all cursor-pointer text-sm"
                      >
                        <option value="" disabled>Choose a language...</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="hi">🇮🇳 Hindi (हिन्दी)</option>
                        <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                        <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                        <option value="kn">🇮🇳 Kannada (ಕನ್ನಡ)</option>
                        <option value="ml">🇮🇳 Malayalam (മലയാളം)</option>
                        <option value="mr">🇮🇳 Marathi (मराठी)</option>
                        <option value="gu">🇮🇳 Gujarati (ગુજરાતી)</option>
                        <option value="pa">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
                        <option value="bn">🇮🇳 Bengali (বাংলা)</option>
                        <option value="or">🇮🇳 Odia (ଓଡ଼ିଆ)</option>
                        <option value="as">🇮🇳 Assamese (অসমীয়া)</option>
                        <option value="ur">🇮🇳 Urdu (اردو)</option>
                        <option value="es">🇪🇸 Spanish</option>
                        <option value="fr">🇫🇷 French</option>
                        <option value="de">🇩🇪 German</option>
                        <option value="pt">🇵🇹 Portuguese</option>
                        <option value="zh-CN">🇨🇳 Chinese</option>
                        <option value="ja">🇯🇵 Japanese</option>
                        <option value="ko">🇰🇷 Korean</option>
                        <option value="ar">🇸🇦 Arabic</option>
                        <option value="ru">🇷🇺 Russian</option>
                      </select>
                      
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          💡 <strong>Tip:</strong> Select a language to translate the entire page
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Low Bandwidth/Offline Mode Toggle */}
            <button
              onClick={toggleLowBandwidth}
              className={`p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                lowBandwidth ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={lowBandwidth ? "Offline Mode: ON" : "Offline Mode: OFF"}
            >
              <FaWifi className="w-4 h-4" />
            </button>

            {/* User Profile */}
            <Link
              to="/profile"
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all">
                {user?.profile?.name?.charAt(0) || 'U'}
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-2.5 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
              title="Logout"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span className="text-sm font-medium hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar - Below header on all screens */}
        <div className="overflow-x-auto scrollbar-hide py-1.5 -mx-4 px-4 border-t border-gray-200/50 bg-gray-50/30">
          <div className="flex space-x-1.5 min-w-max">
            {navItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 whitespace-nowrap flex-shrink-0 ${
                    active
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-600'}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
    
    {/* Hidden Google Translate Element */}
    <div id="google_translate_element" style={{ display: 'none' }} />
    </>
  )
}

export default Navbar