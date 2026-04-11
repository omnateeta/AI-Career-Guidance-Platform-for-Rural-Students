import { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FaPaperPlane, FaRobot, FaUser, FaSpinner, FaBolt, 
  FaLightbulb, FaBook, FaBriefcase, FaGraduationCap,
  FaMicrophone, FaTimes, FaChevronDown
} from 'react-icons/fa';

const ChatbotPage = () => {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${user?.profile?.name || 'there'}! 👋 I'm your AI Career Assistant, powered by advanced NLP.

I'm here to help you with:
🎯 Career guidance & exploration
📚 Learning path recommendations
💼 Interview & resume tips
💰 Salary insights
🏛️ Government exam guidance
🎓 Higher studies advice

What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickReplies = [
    { icon: FaLightbulb, text: "What career should I choose?", category: "career" },
    { icon: FaCode, text: "How to learn coding?", category: "skills" },
    { icon: FaBolt, text: "Best skills for 2026?", category: "trending" },
    { icon: FaBriefcase, text: "Interview preparation", category: "career" },
    { icon: FaBook, text: "Tell me about data science", category: "learning" },
    { icon: FaGraduationCap, text: "Higher studies guide", category: "education" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/chat',
        {
          message: currentInput,
          conversation_history: messages.slice(-10).map(m => ({
            sender: m.sender,
            text: m.text
          })),
          user_context: {
            name: user?.profile?.name,
            educationLevel: user?.educationLevel,
            interests: user?.interests
          }
        },
        { timeout: 10000 }
      );

      if (response.data.success) {
        const botResponse = {
          id: messages.length + 2,
          sender: 'bot',
          text: response.data.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setSuggestions(response.data.data.suggestions || []);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback response
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        text: "I'm having trouble connecting right now. Please try again in a moment, or check if the AI service is running.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text) => {
    setInput(text);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Chat cleared! 🧹 How can I help you?",
        timestamp: new Date(),
      },
    ]);
    setSuggestions([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <h1 className="text-5xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AI Career Assistant 🤖
        </h1>
        <p className="text-gray-600 text-lg">Powered by Advanced NLP • Get instant career guidance</p>
      </motion.div>

      {/* Chat Container with Claymorphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="overflow-hidden rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          boxShadow: `
            20px 20px 60px #bebebe,
            -20px -20px 60px #ffffff,
            inset 0 0 0 rgba(255, 255, 255, 0.5)
          `,
          border: '2px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200" style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '4px 4px 10px rgba(102, 126, 234, 0.3)',
              }}>
                <FaRobot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">AI Career Assistant</h3>
                <p className="text-xs text-gray-600">Always online • Instant responses</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-6" style={{
          background: 'linear-gradient(180deg, rgba(240, 242, 255, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
        }}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                      : 'bg-gradient-to-br from-pink-500 to-rose-500'
                  }`}
                  style={{
                    boxShadow: message.sender === 'user'
                      ? '4px 4px 10px rgba(99, 102, 241, 0.4)'
                      : '4px 4px 10px rgba(236, 72, 153, 0.4)',
                  }}
                >
                  {message.sender === 'user' ? (
                    <FaUser className="w-5 h-5 text-white" />
                  ) : (
                    <FaRobot className="w-5 h-5 text-white" />
                  )}
                </motion.div>

                {/* Message Bubble - Claymorphism Style */}
                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background: message.sender === 'user'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.9)',
                    boxShadow: message.sender === 'user'
                      ? `
                          6px 6px 16px rgba(102, 126, 234, 0.4),
                          -2px -2px 8px rgba(255, 255, 255, 0.8)
                        `
                      : `
                          8px 8px 20px rgba(0, 0, 0, 0.08),
                          -4px -4px 12px rgba(255, 255, 255, 0.9),
                          inset 0 0 0 rgba(255, 255, 255, 0.5)
                        `,
                    border: message.sender === 'user'
                      ? '2px solid rgba(255, 255, 255, 0.3)'
                      : '2px solid rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div className={`text-sm whitespace-pre-line leading-relaxed ${
                    message.sender === 'user' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {message.text}
                  </div>
                  <p className={`text-xs mt-3 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"
                    style={{ boxShadow: '4px 4px 10px rgba(236, 72, 153, 0.4)' }}>
                    <FaRobot className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className="p-5 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: `
                        8px 8px 20px rgba(0, 0, 0, 0.08),
                        -4px -4px 12px rgba(255, 255, 255, 0.9)
                      `,
                    }}
                  >
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                      />
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%]">
                  <p className="text-xs text-gray-600 mb-2 font-medium">💡 Follow-up questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickReply(suggestion)}
                        className="px-4 py-2 text-sm font-medium rounded-xl transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#667eea',
                          boxShadow: `
                            4px 4px 10px rgba(0, 0, 0, 0.08),
                            -2px -2px 6px rgba(255, 255, 255, 0.9)
                          `,
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                        }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-6 py-4 border-t border-gray-200" style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 242, 255, 0.8) 100%)',
        }}>
          <p className="text-xs text-gray-600 mb-3 font-medium">⚡ Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickReply(reply.text)}
                className="px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center space-x-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#4a5568',
                  boxShadow: `
                    3px 3px 8px rgba(0, 0, 0, 0.08),
                    -2px -2px 6px rgba(255, 255, 255, 0.9)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <reply.icon className="w-3 h-3" />
                <span>{reply.text}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-5 border-t border-gray-200" style={{
          background: 'rgba(255, 255, 255, 0.95)',
        }}>
          <div className="flex items-end space-x-3">
            <div
              className="flex-1 rounded-2xl p-2"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: `
                  inset 4px 4px 8px rgba(0, 0, 0, 0.05),
                  inset -2px -2px 6px rgba(255, 255, 255, 0.9)
                `,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about careers..."
                className="w-full px-4 py-3 bg-transparent focus:outline-none resize-none text-gray-800 placeholder-gray-400"
                rows={2}
              />
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-4 rounded-xl transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: `
                    4px 4px 10px rgba(0, 0, 0, 0.08),
                    -2px -2px 6px rgba(255, 255, 255, 0.9)
                  `,
                }}
              >
                <FaMicrophone className="text-gray-600 w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={handleSend}
                disabled={!input.trim()}
                whileHover={input.trim() ? { scale: 1.1 } : {}}
                whileTap={input.trim() ? { scale: 0.9 } : {}}
                className={`p-4 rounded-xl transition-all ${
                  input.trim() ? '' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  background: input.trim()
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(200, 200, 200, 0.5)',
                  boxShadow: input.trim()
                    ? '6px 6px 16px rgba(102, 126, 234, 0.4)'
                    : 'none',
                }}
              >
                <FaPaperPlane className="text-white w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 grid md:grid-cols-3 gap-4"
      >
        {[
          {
            icon: FaBolt,
            title: "Instant Responses",
            desc: "Get career guidance in seconds",
            color: "from-yellow-400 to-orange-500"
          },
          {
            icon: FaLightbulb,
            title: "Smart Suggestions",
            desc: "AI-powered follow-up questions",
            color: "from-purple-400 to-pink-500"
          },
          {
            icon: FaBook,
            title: "Comprehensive Knowledge",
            desc: "Covers all career aspects",
            color: "from-blue-400 to-cyan-500"
          }
        ].map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-5 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              boxShadow: `
                8px 8px 20px rgba(0, 0, 0, 0.08),
                -4px -4px 12px rgba(255, 255, 255, 0.9)
              `,
              border: '2px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}
              style={{ boxShadow: '4px 4px 10px rgba(0,0,0,0.15)' }}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-xs text-gray-600">{card.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Code icon component
const FaCode = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default ChatbotPage;
