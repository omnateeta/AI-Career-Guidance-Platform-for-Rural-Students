import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FaArrowLeft, FaStar, FaComments, FaCalendar, FaVideo, 
  FaMapMarkerAlt, FaClock, FaCheck, FaTimes, FaSpinner,
  FaEnvelope, FaPhone, FaUserTie
} from 'react-icons/fa';

const MentorConnectPage = () => {
  const { token, user } = useContext(AuthContext);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    timeSlot: '',
    sessionType: 'video',
    message: ''
  });
  const [messageData, setMessageData] = useState({
    message: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Fetch mentors from backend
  useEffect(() => {
    fetchMentors();
  }, [filterAvailable]);

  const fetchMentors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/mentors', {
        headers: { Authorization: `Bearer ${token}` },
        params: { available: filterAvailable }
      });

      if (response.data.success) {
        setMentors(response.data.data.mentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('Failed to load mentors. Please try again.');
      // Fallback to empty array
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (mentor) => {
    setSelectedMentor(mentor);
    setShowBookingModal(true);
    setBookingData({
      date: '',
      timeSlot: '',
      sessionType: 'video',
      message: ''
    });
  };

  const handleMessage = (mentor) => {
    setSelectedMentor(mentor);
    setShowMessageModal(true);
    setMessageData({ message: '' });
  };

  const submitBooking = async () => {
    if (!bookingData.date || !bookingData.timeSlot) {
      alert('Please select date and time slot');
      return;
    }

    setActionLoading(true);
    
    try {
      const response = await axios.post(
        `/api/mentors/${selectedMentor.id}/book`,
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage('Session booked successfully! Mentor will confirm shortly.');
        setShowBookingModal(false);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert(error.response?.data?.message || 'Failed to book session');
    } finally {
      setActionLoading(false);
    }
  };

  const submitMessage = async () => {
    if (!messageData.message.trim()) {
      alert('Please enter a message');
      return;
    }

    setActionLoading(true);
    
    try {
      const response = await axios.post(
        `/api/mentors/${selectedMentor.id}/message`,
        messageData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage('Message sent successfully!');
        setShowMessageModal(false);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <FaCheck />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-3">
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Connect with Mentors 👥</h1>
        <p className="text-gray-600">Learn from industry experts who guide your career journey</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-4 mb-6"
      >
        <div className="glass-card rounded-2xl p-6 text-center">
          <h3 className="text-4xl font-bold text-gradient mb-2">{mentors.length}+</h3>
          <p className="text-gray-600">Expert Mentors</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <h3 className="text-4xl font-bold text-gradient mb-2">
            {mentors.reduce((acc, m) => acc + m.totalSessions, 0)}+
          </h3>
          <p className="text-gray-600">Sessions Completed</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <h3 className="text-4xl font-bold text-gradient mb-2">
            {mentors.length > 0 ? (mentors.reduce((acc, m) => acc + m.rating, 0) / mentors.length).toFixed(1) : '0.0'}/5
          </h3>
          <p className="text-gray-600">Average Rating</p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-900">Available Mentors</h2>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Show only available</span>
        </label>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-6xl text-primary-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading mentors...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-800 font-semibold text-lg mb-2">{error}</p>
          <button
            onClick={fetchMentors}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* No Mentors */}
      {!loading && !error && mentors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-800 font-semibold text-lg mb-2">No mentors available</p>
          <p className="text-gray-600">Try adjusting your filters or check back later</p>
        </div>
      )}

      {/* Mentor Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {mentors.map((mentor, index) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6 card-hover"
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-6xl">{mentor.avatar}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{mentor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{mentor.title}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold">{mentor.rating}</span>
                    <span className="text-gray-500">({mentor.reviewCount})</span>
                  </div>
                  <div className="text-gray-600">{mentor.totalSessions} sessions</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                mentor.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {mentor.available ? 'Available' : 'Busy'}
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{mentor.bio}</p>

            {/* Expertise */}
            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.expertise.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>

            {/* Languages */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">Speaks:</p>
              <div className="flex gap-2">
                {mentor.languages.map((lang, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Next Available */}
            {mentor.available && mentor.nextSlot && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 flex items-center space-x-2">
                  <FaCalendar className="text-blue-600" />
                  <span>Next slot: <strong>{mentor.nextSlot}</strong></span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleBookSession(mentor)}
                disabled={!mentor.available}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                  mentor.available
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaVideo className="w-4 h-4" />
                <span>{mentor.available ? 'Book Session' : 'Unavailable'}</span>
              </button>
              <button
                onClick={() => handleMessage(mentor)}
                className="px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300 font-semibold flex items-center space-x-2"
              >
                <FaComments className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Book Session</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedMentor.name}</p>
                <p className="text-sm text-gray-600">{selectedMentor.title}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                  <select
                    value={bookingData.timeSlot}
                    onChange={(e) => setBookingData({...bookingData, timeSlot: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                    <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                    <option value="6:00 PM - 7:00 PM">6:00 PM - 7:00 PM</option>
                    <option value="7:00 PM - 8:00 PM">7:00 PM - 8:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                  <select
                    value={bookingData.sessionType}
                    onChange={(e) => setBookingData({...bookingData, sessionType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                    <option value="chat">Chat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                  <textarea
                    value={bookingData.message}
                    onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="What would you like to discuss?"
                  />
                </div>

                <button
                  onClick={submitBooking}
                  disabled={actionLoading || !bookingData.date || !bookingData.timeSlot}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Booking...</span>
                    </>
                  ) : (
                    <>
                      <FaCalendar />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Send Message</h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedMentor.name}</p>
                <p className="text-sm text-gray-600">{selectedMentor.title}</p>
                <p className="text-xs text-gray-500 mt-1">Expected response: {selectedMentor.responseTime}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                  <textarea
                    value={messageData.message}
                    onChange={(e) => setMessageData({...messageData, message: e.target.value})}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Introduce yourself and explain what you'd like guidance on..."
                    required
                  />
                </div>

                <button
                  onClick={submitMessage}
                  disabled={actionLoading || !messageData.message.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorConnectPage;
