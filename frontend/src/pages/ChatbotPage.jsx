import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPaperPlane, FaRobot, FaUser, FaMicrophone, FaSpinner } from 'react-icons/fa'

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! 👋 I'm your AI Career Assistant. I'm here to help you with:\n\n• Career guidance and exploration\n• Skill development advice\n• Learning path recommendations\n• Job search tips\n• Resume and interview preparation\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const quickReplies = [
    "What career should I choose?",
    "How to learn coding?",
    "Best skills for 2026?",
    "How to prepare for interviews?",
    "What is data science?",
    "Help me build a resume",
  ]

  const botResponses = {
    "career": "Great question! To help you find the right career, I'd recommend:\n\n1. Take our AI-powered career assessment\n2. Explore careers that match your interests\n3. Check the skill gap analysis\n\nWould you like me to guide you through the career assessment?",
    "coding": "Learning to code is an excellent choice! Here's your roadmap:\n\n📚 Start with HTML & CSS (2 weeks)\n💻 Learn JavaScript (4-6 weeks)\n⚛️ Master React (6-8 weeks)\n🔧 Build projects\n\nCheck the Learning Paths section for detailed courses!",
    "skills": "The most in-demand skills for 2026:\n\n🔥 Technical:\n• AI & Machine Learning\n• Cloud Computing (AWS/Azure)\n• Cybersecurity\n• Full Stack Development\n\n💡 Soft Skills:\n• Communication\n• Problem Solving\n• Adaptability\n• Leadership",
    "interview": "Interview preparation checklist:\n\n✅ Research the company\n✅ Practice common questions\n✅ Prepare your projects portfolio\n✅ Mock interviews\n✅ Technical problem solving (LeetCode)\n✅ Behavioral questions (STAR method)\n\nWould you like specific interview questions for your field?",
    "data science": "Data Science is an exciting field! Here's what you need:\n\n📊 Skills Required:\n• Python Programming\n• Statistics & Mathematics\n• Machine Learning\n• Data Visualization\n• SQL\n\n💰 Average Salary: ₹8-20 LPA\n\n📚 Start with our Data Science learning path!",
    "resume": "Building a strong resume:\n\n📝 Structure:\n1. Contact Information\n2. Objective/Summary\n3. Education\n4. Skills\n5. Projects\n6. Internships/Experience\n7. Certifications\n\n💡 Tips:\n• Keep it to 1 page\n• Use action verbs\n• Quantify achievements\n• Tailor for each job\n\nWould you like a resume template?",
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getBotResponse = (userMessage) => {
    const lower = userMessage.toLowerCase()
    if (lower.includes('career')) return botResponses.career
    if (lower.includes('code') || lower.includes('coding') || lower.includes('learn')) return botResponses.coding
    if (lower.includes('skill') || lower.includes('demand') || lower.includes('2026')) return botResponses.skills
    if (lower.includes('interview')) return botResponses.interview
    if (lower.includes('data science')) return botResponses['data science']
    if (lower.includes('resume')) return botResponses.resume
    return "That's a great question! I'd recommend:\n\n1. Check our Career Insights section\n2. Explore the Skill Gap Analysis\n3. Browse Learning Paths\n4. Connect with a mentor\n\nWould you like me to guide you to any specific section?"
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        text: getBotResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleQuickReply = (text) => {
    setInput(text)
    setTimeout(() => {
      const userMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsTyping(true)

      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          sender: 'bot',
          text: getBotResponse(text),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      }, 1000 + Math.random() * 1000)
    }, 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold text-gradient mb-2">AI Career Assistant 🤖</h1>
        <p className="text-gray-600">Get instant answers to your career questions</p>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                  {message.sender === 'user' ? (
                    <FaUser className="w-4 h-4 text-white" />
                  ) : (
                    <FaRobot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                    : 'bg-white text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <FaRobot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-4 rounded-2xl">
                  <FaSpinner className="animate-spin text-primary-600" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-primary-50 hover:border-primary-500 transition-all duration-300"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about careers..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={2}
            />
            <div className="flex space-x-2">
              <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                <FaMicrophone className="text-gray-600" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  input.trim()
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 glass-card rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-purple-50"
      >
        <h3 className="font-semibold mb-2">💡 Tips for better responses:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Be specific about your interests and goals</li>
          <li>• Ask about particular careers or skills</li>
          <li>• Request detailed learning paths</li>
          <li>• Get interview and resume advice</li>
        </ul>
      </motion.div>
    </div>
  )
}

export default ChatbotPage
