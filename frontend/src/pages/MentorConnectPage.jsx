import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaStar, FaComments, FaCalendar, FaVideo, FaMapMarkerAlt } from 'react-icons/fa'

const MentorConnectPage = () => {
  const mentors = [
    {
      name: 'Rajesh Kumar',
      title: 'Senior Software Engineer at Google',
      expertise: ['System Design', 'Career Growth', 'Tech Interviews'],
      rating: 4.9,
      sessions: 127,
      image: '👨\u200d💻',
      available: true,
      nextSlot: 'Tomorrow, 6:00 PM',
      languages: ['English', 'Hindi'],
      bio: '10+ years in tech, passionate about mentoring rural students.',
    },
    {
      name: 'Priya Sharma',
      title: 'Data Scientist at Microsoft',
      expertise: ['Machine Learning', 'Data Science', 'Python'],
      rating: 4.8,
      sessions: 98,
      image: '👩\u200d💻',
      available: true,
      nextSlot: 'Today, 8:00 PM',
      languages: ['English', 'Hindi', 'Punjabi'],
      bio: 'Helping students break into data science from non-tech backgrounds.',
    },
    {
      name: 'Amit Patel',
      title: 'Product Manager at Flipkart',
      expertise: ['Product Management', 'Strategy', 'Leadership'],
      rating: 4.7,
      sessions: 85,
      image: '👨\u200d💼',
      available: false,
      nextSlot: 'Next Week',
      languages: ['English', 'Gujarati'],
      bio: 'Transitioned from engineering to PM, here to guide your journey.',
    },
    {
      name: 'Sneha Reddy',
      title: 'Full Stack Developer at Amazon',
      expertise: ['Web Development', 'React', 'Node.js'],
      rating: 4.9,
      sessions: 156,
      image: '👩\u200d🎨',
      available: true,
      nextSlot: 'In 2 hours',
      languages: ['English', 'Telugu'],
      bio: 'Self-taught developer from small town, proving anyone can code!',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4">
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-4xl font-bold text-gradient mb-2">Connect with Mentors 👥</h1>
        <p className="text-gray-600 text-lg">Learn from industry experts who guide your career journey</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        <div className="glass-card rounded-2xl p-6 text-center">
          <h3 className="text-4xl font-bold text-gradient mb-2">200+</h3>
          <p className="text-gray-600">Expert Mentors</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <h3 className="text-4xl font-bold text-gradient mb-2">10K+</h3>
          <p className="text-gray-600">Sessions Completed</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <h3 className="text-4xl font-bold text-gradient mb-2">4.8/5</h3>
          <p className="text-gray-600">Average Rating</p>
        </div>
      </motion.div>

      {/* Mentor Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {mentors.map((mentor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6 card-hover"
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-6xl">{mentor.image}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{mentor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{mentor.title}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold">{mentor.rating}</span>
                  </div>
                  <div className="text-gray-600">{mentor.sessions} sessions</div>
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
            {mentor.available && (
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
              <button className="px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300 font-semibold flex items-center space-x-2">
                <FaComments className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 glass-card rounded-2xl p-8 text-center bg-gradient-to-r from-purple-50 to-pink-50"
      >
        <h3 className="text-2xl font-bold mb-2">🎓 Become a Mentor</h3>
        <p className="text-gray-600 mb-4">Share your experience and help shape the next generation</p>
        <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold">
          Apply as Mentor
        </button>
      </motion.div>
    </div>
  )
}

export default MentorConnectPage
