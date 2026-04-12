import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaVideo, FaMicrophone, FaPhoneSlash, FaMicrophoneSlash,
  FaVideoSlash, FaComments, FaRobot, FaUser, FaVolumeUp,
  FaTimes, FaBrain, FaChalkboardTeacher, FaUserTie
} from 'react-icons/fa';

const AIVideoCall = ({ onClose, language = 'en-IN', mode = 'practice' }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const callTimerRef = useRef(null);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopCallTimer();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera/microphone. Please allow permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Speech Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported. Please use Chrome browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = true;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentTranscript(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      // If still in call, restart listening
      if (isCallActive && currentTranscript) {
        processUserInput(currentTranscript);
      }
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Process user input and get AI response from backend
  const processUserInput = async (userText) => {
    if (!userText.trim()) return;

    // Add user message to conversation
    setConversation(prev => [...prev, {
      speaker: 'user',
      text: userText,
      timestamp: new Date()
    }]);

    setCurrentTranscript('');
    setIsListening(false);

    // Show thinking indicator
    setAiResponse('AI is thinking...');

    try {
      // Call your existing AI communication API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/ai/communicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          mode: mode,
          language: language.split('-')[0], // Convert 'en-IN' to 'en'
          context: { 
            level: 'beginner',
            topic: 'Video call conversation practice'
          }
        })
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Get the AI response text
        const aiText = data.data.response || data.data.message || data.data.next_question;
        
        console.log('AI Response received:', aiText);
        
        if (aiText) {
          setAiResponse(aiText);
          
          // Add AI response to conversation
          setConversation(prev => [...prev, {
            speaker: 'ai',
            text: aiText,
            timestamp: new Date()
          }]);

          // Store in conversation history for context
          setConversationHistory(prev => [
            ...prev,
            { role: 'user', content: userText },
            { role: 'assistant', content: aiText }
          ]);

          // Speak the AI response
          console.log('Calling speakText with:', aiText);
          speakText(aiText);
        } else {
          console.error('No aiText found in response');
          // Use fallback
          generateFallbackResponse(userText);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error getting AI response:', err);
      // Use immediate fallback response
      generateFallbackResponse(userText);
    }
  };

  // Generate immediate fallback response (doesn't need backend)
  const generateFallbackResponse = (userText) => {
    const lowerText = userText.toLowerCase();
    let response = '';

    // Context-aware responses
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('namaste')) {
      response = "Hello! Great to meet you! Your greeting sounds good. Can you tell me a bit about yourself and your career goals?";
    } else if (lowerText.includes('my name is') || lowerText.includes('i am') || lowerText.includes("i'm")) {
      response = "Nice to meet you! Your introduction is clear. What subject or field are you most interested in pursuing?";
    } else if (lowerText.includes('career') || lowerText.includes('job') || lowerText.includes('work')) {
      response = "Excellent! Thinking about your career is very important. What subjects do you enjoy studying the most?";
    } else if (lowerText.includes('thank')) {
      response = "You're very welcome! You're doing great with your communication. Let's keep practicing. What would you like to talk about next?";
    } else if (lowerText.includes('engineer') || lowerText.includes('doctor') || lowerText.includes('teacher')) {
      response = "That's a wonderful career choice! To achieve that goal, you'll need to focus on your studies. What grade are you currently in?";
    } else if (lowerText.includes('help') || lowerText.includes('confused') || lowerText.includes("don't know")) {
      response = "Don't worry, I'm here to help you! Many students feel confused at first. Let's start simple - what are your favorite subjects in school?";
    } else if (lowerText.includes('good') || lowerText.includes('fine') || lowerText.includes('great')) {
      response = "That's wonderful to hear! Keep that positive attitude. Now, tell me what you want to achieve in your career?";
    } else {
      // General encouraging responses
      const generalResponses = [
        "That's interesting! Can you tell me more about that? I'd love to understand your thoughts better.",
        "Good point! Your communication is improving. What else would you like to share about your goals?",
        "I understand! Keep speaking clearly. What subject interests you the most in school?",
        "Well said! Your sentence structure is good. Let's continue - what do you want to become in the future?",
        "Excellent effort! You're doing great. Can you explain why you chose that path?",
        "Very good! I can see you're trying hard. What skills do you think you need for your dream career?"
      ];
      response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    console.log('Using fallback response:', response);
    setAiResponse(response);
    
    // Add AI response to conversation
    setConversation(prev => [...prev, {
      speaker: 'ai',
      text: response,
      timestamp: new Date()
    }]);

    // Speak the response immediately
    speakText(response);
  };

  // Text-to-Speech
  const speakText = (text) => {
    if (!text) {
      console.log('No text to speak');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('AI started speaking:', text);
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('AI finished speaking');
      setIsSpeaking(false);
      // Restart listening after AI speaks
      if (isCallActive) {
        setTimeout(() => {
          console.log('Restarting listening...');
          startListening();
        }, 500);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    console.log('Speaking text:', text);
    window.speechSynthesis.speak(utterance);
  };

  const startCall = async () => {
    setIsCallActive(true);
    startCallTimer();
    
    // Test speech synthesis first
    console.log('Testing speech synthesis...');
    if (!window.speechSynthesis) {
      setError('Speech synthesis not supported in your browser');
      return;
    }
    
    // Get AI greeting from backend or use default
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/ai/communicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello',
          mode: mode,
          language: language.split('-')[0],
          context: { 
            level: 'beginner',
            topic: 'Starting video call session'
          }
        })
      });

      const data = await response.json();
      
      let greeting;
      if (data.success && data.data) {
        greeting = data.data.response || data.data.message || "Hello! I'm your AI communication teacher. Let's practice together. Please introduce yourself!";
      } else {
        greeting = "Hello! I'm your AI communication teacher. Let's practice together. Please introduce yourself!";
      }

      console.log('AI Greeting:', greeting);
      setAiResponse(greeting);
      setConversation([{
        speaker: 'ai',
        text: greeting,
        timestamp: new Date()
      }]);

      // Speak the greeting
      console.log('Speaking greeting...');
      speakText(greeting);
      
      // Start listening after greeting
      setTimeout(() => startListening(), 3000);
    } catch (err) {
      console.error('Error getting AI greeting:', err);
      // Use default greeting
      const greeting = "Hello! I'm your AI communication teacher. Let's practice together. Please introduce yourself!";
      setAiResponse(greeting);
      console.log('Speaking default greeting...');
      speakText(greeting);
      setTimeout(() => startListening(), 3000);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    stopListening();
    stopCallTimer();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentTranscript('');
    setAiResponse('');
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!isCameraOff);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 z-50 flex flex-col"
    >
      {/* Top Bar with Close Button */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/90 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="text-white font-semibold flex items-center gap-2">
                <FaBrain /> AI Communication Coach
              </span>
            </div>
            {isCallActive && (
              <div className="bg-green-600/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-white font-mono font-bold">{formatDuration(callDuration)}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <FaTimes /> Close
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative flex items-center justify-center p-4 pb-32">
        {/* Student Video (Large) */}
        <div className="w-full h-full max-w-5xl relative rounded-2xl overflow-hidden bg-gray-800 shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`}
          />
          
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
              <FaUser className="text-9xl text-white/50" />
            </div>
          )}

          {/* Student Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white font-semibold flex items-center gap-2">
              <FaUser /> You
            </p>
          </div>

          {/* AI Teacher Video (Picture-in-Picture) */}
          <div className="absolute top-4 right-4 w-48 h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl border-4 border-white/30">
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <motion.div
                animate={isSpeaking ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
                className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-3 border-4 border-white/40"
              >
                <FaChalkboardTeacher className="text-6xl text-white" />
              </motion.div>
              <p className="text-white font-bold text-center text-base">AI Teacher</p>
              {isSpeaking && (
                <div className="flex gap-1 mt-3">
                  <motion.div
                    animate={{ height: [4, 16, 4] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    className="w-1.5 bg-white rounded-full"
                  />
                  <motion.div
                    animate={{ height: [4, 20, 4] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="w-1.5 bg-white rounded-full"
                  />
                  <motion.div
                    animate={{ height: [4, 16, 4] }}
                    transition={{ duration: 0.35, repeat: Infinity }}
                    className="w-1.5 bg-white rounded-full"
                  />
                  <motion.div
                    animate={{ height: [4, 20, 4] }}
                    transition={{ duration: 0.45, repeat: Infinity }}
                    className="w-1.5 bg-white rounded-full"
                  />
                </div>
              )}
              {!isCallActive && (
                <p className="text-white/80 text-xs mt-2 text-center">Click start to begin</p>
              )}
            </div>
          </div>

          {/* Start Call Overlay (Before Call) */}
          {!isCallActive && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center border-4 border-white/30">
                    <FaChalkboardTeacher className="text-7xl text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2">Ready to Practice?</h2>
                  <p className="text-white/80 text-lg">Click the green button below to start talking with AI Teacher</p>
                </div>
                <motion.button
                  onClick={startCall}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-8 rounded-full bg-green-500 hover:bg-green-600 transition-all shadow-2xl"
                >
                  <FaPhoneSlash className="text-white text-4xl rotate-135" />
                </motion.button>
                <p className="text-white/60 mt-4 text-sm">Start Call</p>
              </motion.div>
            </div>
          )}

          {/* Live Transcript */}
          <AnimatePresence>
            {currentTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 left-4 right-4 bg-black/70 backdrop-blur-sm p-4 rounded-xl"
              >
                <p className="text-white text-lg">{currentTranscript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-500/90 backdrop-blur-sm p-3 rounded-lg">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {isListening && (
            <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white font-semibold">Listening to you...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center gap-2 bg-purple-500 px-4 py-2 rounded-full shadow-lg">
              <FaVolumeUp className="text-white" />
              <span className="text-white font-semibold">AI Speaking...</span>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            disabled={!isCallActive}
            className={`p-5 rounded-full transition-all shadow-lg ${
              !isCallActive ? 'opacity-50 cursor-not-allowed bg-gray-700' :
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? (
              <FaMicrophoneSlash className="text-white text-2xl" />
            ) : (
              <FaMicrophone className="text-white text-2xl" />
            )}
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            disabled={!isCallActive}
            className={`p-5 rounded-full transition-all shadow-lg ${
              !isCallActive ? 'opacity-50 cursor-not-allowed bg-gray-700' :
              isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isCameraOff ? (
              <FaVideoSlash className="text-white text-2xl" />
            ) : (
              <FaVideo className="text-white text-2xl" />
            )}
          </button>

          {/* Call/End Call Button */}
          {!isCallActive ? (
            <motion.button
              onClick={startCall}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-7 rounded-full bg-green-500 hover:bg-green-600 transition-all shadow-2xl"
            >
              <FaPhoneSlash className="text-white text-3xl rotate-135" />
            </motion.button>
          ) : (
            <motion.button
              onClick={endCall}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-7 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-2xl"
            >
              <FaPhoneSlash className="text-white text-3xl" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AIVideoCall;
