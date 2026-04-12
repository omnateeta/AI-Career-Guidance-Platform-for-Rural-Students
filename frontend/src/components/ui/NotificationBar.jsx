import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const NotificationBar = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      if (response.data.success && response.data.notifications.length > 0) {
        setNotifications(response.data.notifications);
      } else {
        // Fallback message if no notifications
        setNotifications([
          {
            id: 'welcome',
            icon: '👋',
            text: 'Welcome! Explore your future with AI guidance — Scholarships, Jobs & Exams updated daily!',
            type: 'welcome',
          },
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      // Fallback message on error
      setNotifications([
        {
          id: 'welcome',
          icon: '👋',
          text: 'Welcome! Explore your future with AI guidance — Scholarships, Jobs & Exams updated daily!',
          type: 'welcome',
        },
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading || notifications.length === 0) {
    return null;
  }

  // Create scrolling content by duplicating notifications for seamless loop
  const scrollingContent = [...notifications, ...notifications];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 shadow-lg"
      style={{ height: '48px' }}
    >
      {/* Gradient overlays for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-purple-600 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-indigo-700 to-transparent z-10 pointer-events-none" />

      {/* Scrolling content */}
      <div className="flex items-center h-full" ref={scrollRef}>
        <motion.div
          className="flex items-center space-x-16 whitespace-nowrap"
          animate={{
            x: [0, -scrollingContent.length * 300],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: scrollingContent.length * 3,
              ease: 'linear',
            },
          }}
        >
          {scrollingContent.map((notification, index) => (
            <div
              key={`${notification.id}_${index}`}
              className="flex items-center space-x-2 text-white"
            >
              <span className="text-xl" role="img" aria-label="icon">
                {notification.icon}
              </span>
              <span className="font-semibold text-sm md:text-base">
                {notification.text}
              </span>
              <span className="text-white/40 mx-4">•</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pulse indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <motion.div
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  );
};

export default NotificationBar;
