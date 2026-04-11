import { useState, useRef, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { 
  FaPaperPlane, FaRobot, FaUser, FaSpinner, FaMicrophone,
  FaTimes, FaVolumeUp, FaCheck, FaStar, FaLightbulb,
  FaChartLine, FaTrophy, FaFire, FaLanguage, FaComments,
  FaGraduationCap, FaBriefcase, FaExchangeAlt
} from 'react-icons/fa'

const CommunicationAssistPage = () => {
  const { token, user } = useContext(AuthContext)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState('practice') // practice, improve, translate, interview
  const [language, setLanguage] = useState('en')
  const [level, setLevel] = useState('beginner')
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(null)
  const [showProgress, setShowProgress] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const modes = [
    { id: 'practice', label: 'Practice', icon: FaComments, color: 'from-blue-500 to-cyan-500' },
    { id: 'improve', label: 'Improve', icon: FaStar, color: 'from-yellow-500 to-orange-500' },
    { id: 'translate', label: 'Translate', icon: FaExchangeAlt, color: 'from-green-500 to-teal-500' },
    { id: 'interview', label: 'Interview', icon: FaBriefcase, color: 'from-purple-500 to-pink-500' },
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetchProgress()
    // Welcome message
    setMessages([{
      id: 1,
      sender: 'bot',
      text: getWelcomeMessage(),
      timestamp: new Date(),
      data: null,
    }])
  }, [])

  const getWelcomeMessage = () => {
    const welcomeMessages = {
      practice: `Welcome! 👋 Let's practice ${getLanguageName()} together. I'll help you improve your communication skills. Start by telling me about yourself!`,
      improve: `Welcome! ✍️ Send me any sentence and I'll help you improve it with better grammar and vocabulary.`,
      translate: `Welcome! 🌐 I'll help you translate between ${getLanguageName()} and English with cultural context.`,
      interview: `Welcome! 💼 Let's practice for your job interview. I'll ask questions and give you feedback on your answers.`,
    }
    return welcomeMessages[mode]
  }

  const getLanguageName = () => {
    return languages.find(l => l.code === language)?.name || 'English'
  }

  const fetchProgress = async () => {
    if (!token) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await axios.get(`${apiUrl}/api/ai/communicate/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setProgress(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsTyping(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await axios.post(`${apiUrl}/api/ai/communicate`, {
        message: currentInput,
        mode,
        language,
        context: { level, topic: '' }
      })

      if (response.data.success) {
        const botMessage = {
          id: messages.length + 2,
          sender: 'bot',
          text: response.data.data.response || response.data.data.message || '',
          timestamp: new Date(),
          data: response.data.data,
        }
        setMessages(prev => [...prev, botMessage])
        
        // Update progress if available
        if (response.data.data.progress) {
          setProgress(prev => ({
            ...prev,
            today: {
              ...prev?.today,
              ...response.data.data.progress
            }
          }))
        }
      }
    } catch (error) {
      console.error('Communication error:', error)
      const errorMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: "I'm having trouble connecting. Please check your internet and try again.",
        timestamp: new Date(),
        data: null,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = getSpeechLanguageCode()
    recognitionRef.current.interimResults = false
    recognitionRef.current.continuous = false

    recognitionRef.current.onstart = () => {
      setIsRecording(true)
    }

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsRecording(false)
    }

    recognitionRef.current.onerror = () => {
      setIsRecording(false)
      alert('Speech recognition error. Please try again.')
    }

    recognitionRef.current.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current.start()
  }

  const getSpeechLanguageCode = () => {
    const codes = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' }
    return codes[language] || 'en-IN'
  }

  const speakText = (text) => {
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = getSpeechLanguageCode()
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-4xl font-bold text-gradient mb-2">AI Communication Assist 🎯</h1>
        <p className="text-gray-600">Practice, Improve & Master Communication Skills</p>
      </motion.div>

      {/* Controls Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-4">
        {/* Mode Selector */}
        <div className="glass-card rounded-xl p-2">
          <div className="grid grid-cols-4 gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  mode === m.id
                    ? `bg-gradient-to-r ${m.color} text-white shadow-lg`
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <m.icon className="w-4 h-4" />
                <span className="text-sm">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language & Level Selector */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">🌐 Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-900"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>

          <div className="glass-card rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">📊 Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-900"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="glass-card rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">📈 Progress</label>
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="w-full px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
            >
              <FaChartLine />
              <span>View Stats</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Progress Dashboard */}
      <AnimatePresence>
        {showProgress && progress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 glass-card rounded-xl p-6"
          >
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <FaFire className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{progress.today?.streak || 0}</p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <FaTrophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{progress.today?.total_xp || progress.allTime?.totalXP || 0}</p>
                <p className="text-xs text-gray-600">Total XP</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                <FaGraduationCap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 capitalize">{progress.today?.level || progress.allTime?.currentLevel || 'beginner'}</p>
                <p className="text-xs text-gray-600">Level</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg">
                <FaComments className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-pink-600">{progress.allTime?.totalMessages || 0}</p>
                <p className="text-xs text-gray-600">Messages</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                    : 'bg-gradient-to-br from-pink-500 to-rose-500'
                }`}>
                  {message.sender === 'user' ? <FaUser className="w-5 h-5 text-white" /> : <FaRobot className="w-5 h-5 text-white" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-3">
                  <div
                    className={`p-5 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white'
                    }`}
                    style={{
                      boxShadow: message.sender === 'user'
                        ? '6px 6px 16px rgba(99, 102, 241, 0.3)'
                        : '8px 8px 20px rgba(0, 0, 0, 0.08), -4px -4px 12px rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    <div className={`text-sm whitespace-pre-line leading-relaxed ${
                      message.sender === 'user' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {message.text}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className={`text-xs ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {message.sender === 'bot' && message.text && (
                        <button
                          onClick={() => speakText(message.text)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Listen"
                        >
                          <FaVolumeUp className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Response Cards */}
                  {message.data && message.sender === 'bot' && (
                    <div className="space-y-3">
                      {/* Corrected Version */}
                      {message.data.corrected && message.data.corrected !== message.data.original && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaCheck className="text-green-600" />
                            <p className="text-sm font-semibold text-green-800">Corrected:</p>
                          </div>
                          <p className="text-sm text-green-700">{message.data.corrected}</p>
                        </div>
                      )}

                      {/* Improved Version */}
                      {message.data.improved && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaStar className="text-blue-600" />
                            <p className="text-sm font-semibold text-blue-800">Improved:</p>
                          </div>
                          <p className="text-sm text-blue-700">{message.data.improved}</p>
                        </div>
                      )}

                      {/* Explanation */}
                      {message.data.explanation && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <FaLightbulb className="text-yellow-600" />
                            <p className="text-sm font-semibold text-yellow-800">Tip:</p>
                          </div>
                          <p className="text-sm text-yellow-700">{message.data.explanation}</p>
                        </div>
                      )}

                      {/* Confidence Score */}
                      {message.data.confidence_score !== undefined && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-purple-800">Confidence Score</p>
                            <p className="text-lg font-bold text-purple-600">{message.data.confidence_score}%</p>
                          </div>
                          <div className="w-full bg-purple-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                message.data.confidence_score >= 80 ? 'bg-green-500' :
                                message.data.confidence_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${message.data.confidence_score}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Next Exercise/Question */}
                      {message.data.next_question && (
                        <button
                          onClick={() => {
                            setInput(message.data.next_question)
                            setTimeout(() => handleSend(), 100)
                          }}
                          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-left"
                        >
                          <p className="text-sm font-semibold mb-1">💪 Try This Exercise:</p>
                          <p className="text-sm">{message.data.next_question}</p>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <FaRobot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-5 rounded-2xl bg-white" style={{ boxShadow: '8px 8px 20px rgba(0, 0, 0, 0.08)' }}>
                    <div className="flex space-x-2">
                      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="w-3 h-3 rounded-full bg-purple-500" />
                      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-3 h-3 rounded-full bg-pink-500" />
                      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-3 h-3 rounded-full bg-rose-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-gray-200 bg-white/95">
          <div className="flex items-end space-x-3">
            <button
              onClick={startVoiceRecognition}
              disabled={isRecording}
              className={`p-4 rounded-xl transition-all ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100 hover:bg-gray-200'}`}
              title="Voice Input"
            >
              <FaMicrophone className={`w-5 h-5 ${isRecording ? 'text-red-600' : 'text-gray-600'}`} />
            </button>
            
            <div className="flex-1 bg-gray-50 rounded-2xl p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholderText()}
                className="w-full px-4 py-3 bg-transparent focus:outline-none resize-none text-gray-800 placeholder-gray-400"
                rows={2}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-4 rounded-xl transition-all ${
                input.trim() && !isTyping
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isTyping ? <FaSpinner className="animate-spin w-5 h-5" /> : <FaPaperPlane className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const getPlaceholderText = () => {
  const placeholders = {
    practice: "Type your message to practice...",
    improve: "Type a sentence to improve...",
    translate: "Type text to translate...",
    interview: "Answer the interview question...",
  }
  return placeholders.practice
}

export default CommunicationAssistPage
