import { createContext, useState, useContext, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

// All supported languages with native names
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
]

// Common translations for UI elements
const translations = {
  en: {
    welcome: 'Welcome to Margdarshak AI',
    subtitle: 'Empowering Rural Students with AI-Powered Career Guidance',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    careers: 'Careers',
    skills: 'Skills',
    learning: 'Learning',
    jobs: 'Jobs',
    mentors: 'Mentors',
    chat: 'Chat with AI',
    logout: 'Logout',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
  },
  hi: {
    welcome: 'Margdarshak AI में आपका स्वागत है',
    subtitle: 'AI-संचालित करियर मार्गदर्शन से ग्रामीण छात्रों को सशक्त बनाना',
    login: 'लॉगिन',
    register: 'रजिस्टर',  
    dashboard: 'डैशबोर्ड',
    careers: 'करियर',
    skills: 'कौशल',
    learning: 'सीखना',
    jobs: 'नौकरियां',
    mentors: 'मेंटर',
    chat: 'AI से चैट करें',
    logout: 'लॉगआउट',
    getStarted: 'शुरू करें',
    learnMore: 'और जानें',
  },
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  )
  const [googleTranslateReady, setGoogleTranslateReady] = useState(false)

  // Initialize Google Translate
  useEffect(() => {
    // Add Google Translate script
    const addGoogleTranslateScript = () => {
      const script = document.createElement('script')
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      script.defer = true
      script.onerror = () => {
        console.error('Failed to load Google Translate')
        setGoogleTranslateReady(false)
      }
      script.onload = () => {
        console.log('Google Translate script loaded')
      }
      document.body.appendChild(script)
    }

    // Initialize Google Translate callback
    window.googleTranslateElementInit = () => {
      console.log('Google Translate initialized')
      if (window.google && window.google.translate) {
        try {
          // Initialize for navbar dropdown
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi,ta,te,kn,ml,mr,gu,pa,bn,or,as,ur,es,fr,de,pt,zh,ja,ko,ar,ru',
              autoDisplay: false,
            },
            'google_translate_element_nav'
          )
          
          setGoogleTranslateReady(true)
          console.log('Google Translate widget ready')
        } catch (error) {
          console.error('Error initializing Google Translate:', error)
          setGoogleTranslateReady(false)
        }
      }
    }

    // Check if already loaded
    if (window.google && window.google.translate) {
      setGoogleTranslateReady(true)
    } else {
      // Wait a bit before adding script
      const timer = setTimeout(() => {
        addGoogleTranslateScript()
      }, 500)
      
      return () => {
        clearTimeout(timer)
        delete window.googleTranslateElementInit
      }
    }
  }, [])

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    
    // Use Google Translate to translate the page
    if (googleTranslateReady && window.google && window.google.translate) {
      const select = document.querySelector('.goog-te-combo')
      if (select) {
        select.value = lang
        select.dispatchEvent(new Event('change'))
      }
    }
  }

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    translations: translations[language],
    googleTranslateReady,
    supportedLanguages,
  }

  return (
    <LanguageContext.Provider value={value}>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }} />
      {children}
    </LanguageContext.Provider>
  )
}
