import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FaArrowLeft, FaHandHoldingHeart, FaSpinner, FaCheck,
  FaGraduationCap, FaUsers, FaClock, FaStar, FaHeart,
  FaRocket, FaGlobe, FaLinkedin, FaBriefcase, FaLanguage,
  FaAward, FaLightbulb
} from 'react-icons/fa';

const JoinAsMentorPage = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const [mentorStatus, setMentorStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    bio: '',
    tagline: '',
    expertise: '',
    industries: '',
    languagesSpoken: '',
    yearsOfExperience: '',
    currentRole: '',
    currentCompany: '',
    linkedIn: '',
    website: '',
    maxStudents: '5',
    whyDoYouWantToMentor: '',
  });

  // Check if user is already a mentor
  useEffect(() => {
    checkMentorStatus();
  }, []);

  const checkMentorStatus = async () => {
    try {
      const response = await axios.get('/api/mentors/my-status', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const status = response.data.data.status;
        setMentorStatus(status);
        
        // Redirect if already registered
        if (status === 'verified' || status === 'pending_review') {
          setTimeout(() => {
            navigate('/mentors');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error checking mentor status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.bio || !formData.expertise || 
        !formData.languagesSpoken || !formData.whyDoYouWantToMentor) {
      setError('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    
    try {
      const applicationData = {
        ...formData,
        expertise: formData.expertise.split(',').map(s => s.trim()).filter(s => s),
        industries: formData.industries.split(',').map(s => s.trim()).filter(s => s),
        languagesSpoken: formData.languagesSpoken.split(',').map(s => s.trim()).filter(s => s),
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        maxStudents: parseInt(formData.maxStudents) || 5,
      };

      const response = await axios.post(
        '/api/mentors/apply',
        applicationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setMentorStatus('pending_review');
        setTimeout(() => {
          navigate('/mentors');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting mentor application:', error);
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if already a mentor
  if (mentorStatus === 'verified' || mentorStatus === 'pending_review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md mx-4">
          <FaSpinner className="animate-spin text-5xl text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mentorStatus === 'pending_review' ? 'Application Under Review' : 'Already a Mentor'}
          </h2>
          <p className="text-gray-600 mb-4">
            {mentorStatus === 'pending_review' 
              ? 'Redirecting you to the mentors page...'
              : 'You are already a verified mentor!'}
          </p>
          <Link
            to="/mentors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <FaArrowLeft />
            Back to Mentors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-28 md:pt-32 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link 
            to="/mentors" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <FaArrowLeft />
            <span className="font-medium">Back to Mentors</span>
          </Link>
          
          <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-lg mb-4">
            <FaHandHoldingHeart className="text-4xl text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join as a Mentor
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Share your knowledge, guide rural students, and make a lasting impact on their careers
          </p>
        </motion.div>

        {/* Why Become a Mentor Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center card-hover">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHeart className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Make a Difference</h3>
            <p className="text-gray-600 text-sm">
              Help rural students overcome barriers and achieve their career dreams
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center card-hover">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Build Your Network</h3>
            <p className="text-gray-600 text-sm">
              Connect with aspiring professionals and expand your professional network
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center card-hover">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaAward className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Give Back</h3>
            <p className="text-gray-600 text-sm">
              Share your journey and help others avoid the mistakes you made
            </p>
          </div>
        </motion.div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Your Impact as a Mentor</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <FaGraduationCap className="text-4xl text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gradient mb-1">10,000+</p>
              <p className="text-gray-600 text-sm">Students Helped</p>
            </div>
            <div className="text-center">
              <FaStar className="text-4xl text-yellow-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gradient mb-1">4.8/5</p>
              <p className="text-gray-600 text-sm">Average Rating</p>
            </div>
            <div className="text-center">
              <FaClock className="text-4xl text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gradient mb-1">50,000+</p>
              <p className="text-gray-600 text-sm">Hours Mentored</p>
            </div>
            <div className="text-center">
              <FaRocket className="text-4xl text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gradient mb-1">5,000+</p>
              <p className="text-gray-600 text-sm">Careers Launched</p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3"
            >
              <FaCheck className="text-2xl" />
              <div>
                <p className="font-bold">Application Submitted!</p>
                <p className="text-sm text-white/90">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6"
            >
              <p className="text-red-700 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Mentor Application Form</h2>
            <p className="text-white/90">
              Fill out the form below to join our community of expert mentors
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaLightbulb className="inline mr-2 text-yellow-500" />
                About Yourself <span className="text-red-500">*</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                placeholder="Share your journey, experience, and what makes you qualified to mentor students..."
                required
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                placeholder="e.g., 'From rural village to Google Engineer'"
              />
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaAward className="inline mr-2 text-purple-500" />
                Areas of Expertise <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                placeholder="e.g., Web Development, Data Science, Career Growth (comma-separated)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
            </div>

            {/* Industries */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaBriefcase className="inline mr-2 text-blue-500" />
                Industries
              </label>
              <input
                type="text"
                name="industries"
                value={formData.industries}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                placeholder="e.g., Technology, Healthcare, Finance (comma-separated)"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaLanguage className="inline mr-2 text-green-500" />
                Languages Spoken <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="languagesSpoken"
                value={formData.languagesSpoken}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                placeholder="e.g., English, Hindi, Tamil (comma-separated)"
                required
              />
            </div>

            {/* Experience & Current Role */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Role
                </label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  placeholder="e.g., Software Engineer"
                />
              </div>
            </div>

            {/* Company & LinkedIn */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Company
                </label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  placeholder="e.g., Google, Microsoft"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLinkedin className="inline mr-2 text-blue-600" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaGlobe className="inline mr-2 text-purple-500" />
                Personal Website / Portfolio
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Max Students */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Students You Can Mentor
              </label>
              <select
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
              >
                <option value="3">3 students</option>
                <option value="5">5 students</option>
                <option value="8">8 students</option>
                <option value="10">10 students</option>
                <option value="15">15 students</option>
                <option value="20">20 students</option>
              </select>
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaHeart className="inline mr-2 text-red-500" />
                Why Do You Want to Mentor? <span className="text-red-500">*</span>
              </label>
              <textarea
                name="whyDoYouWantToMentor"
                value={formData.whyDoYouWantToMentor}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                placeholder="Tell us what motivates you to help rural students and how you plan to make an impact..."
                required
              />
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <FaClock className="text-blue-600" />
                What happens next?
              </h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <FaCheck className="text-blue-600 mt-1 flex-shrink-0" />
                  <span>Our team will review your application within <strong>48 hours</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-blue-600 mt-1 flex-shrink-0" />
                  <span>You'll receive an email notification once approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-blue-600 mt-1 flex-shrink-0" />
                  <span>Students can then book sessions with you</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-blue-600 mt-1 flex-shrink-0" />
                  <span>You can manage your availability from your profile</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-[1.02]"
            >
              {actionLoading ? (
                <>
                  <FaSpinner className="animate-spin text-xl" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <FaHandHoldingHeart className="text-xl" />
                  <span>Submit Mentor Application</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinAsMentorPage;
