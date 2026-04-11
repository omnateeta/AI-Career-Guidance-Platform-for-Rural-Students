import { motion } from 'framer-motion';
import { FaMicrophone } from 'react-icons/fa';

/**
 * VoiceAssistant Component
 * Floating voice assistant button with pulsing animation
 * Always accessible in bottom-right corner
 * 
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.active - Active state
 */
export default function VoiceAssistant({ onClick, active = false }) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
    >
      {/* Pulsing Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
        animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Main Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-clay-lg cursor-pointer transition-all duration-300 ${
          active 
            ? 'bg-gradient-to-r from-accent-400 to-accent-600 pulse-glow' 
            : 'bg-gradient-to-r from-primary-500 to-secondary-500'
        }`}
      >
        <FaMicrophone className="w-6 h-6" />
        
        {/* Tooltip */}
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap"
          initial={{ opacity: 0, y: 5 }}
          whileHover={{ opacity: 1, y: 0 }}
          pointerEvents="none"
        >
          Voice Assistant
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
