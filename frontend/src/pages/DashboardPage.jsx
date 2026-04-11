import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaChartLine, FaBook, FaBriefcase, FaUsers, FaStar, FaTrophy, FaFire, FaArrowRight } from 'react-icons/fa'

const DashboardPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const quickActions = [
    { icon: FaChartLine, label: 'Discover Career', path: '/career-quiz', color: 'from-indigo-500 to-purple-500' },
    { icon: FaBook, label: 'Explore Careers', path: '/careers', color: 'from-purple-500 to-pink-500' },
    { icon: FaBriefcase, label: 'Learning Paths', path: '/learning', color: 'from-blue-500 to-cyan-500' },
    { icon: FaUsers, label: 'Job Opportunities', path: '/jobs', color: 'from-green-500 to-emerald-500' },
  ]

  const sampleCareers = [
    { title: 'Software Engineer', match: 92, salary: '₹6-15 LPA', growth: 'Growing' },
    { title: 'Data Scientist', match: 87, salary: '₹8-20 LPA', growth: 'Growing' },
    { title: 'Digital Marketing', match: 78, salary: '₹4-10 LPA', growth: 'Stable' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, <span className="text-gradient">{user?.profile?.name || 'Student'}!</span> 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Ready to explore new career opportunities today?
        </p>
      </motion.div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <FaStar className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-gradient">{user?.gamification?.xp || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total XP</h3>
          <p className="text-sm text-gray-600">Level {user?.gamification?.level || 1}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
              <FaFire className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-gradient">{user?.gamification?.streak?.count || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Day Streak</h3>
          <p className="text-sm text-gray-600">Keep it going! 🔥</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <FaTrophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-gradient">{user?.gamification?.badges?.length || 0}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Badges Earned</h3>
          <p className="text-sm text-gray-600">Achievements unlocked</p>
        </motion.div>
      </div>

      {/* Career Discovery Quiz Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8 glass-card rounded-2xl p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold mb-2">🎯 Not Sure Which Career to Choose?</h2>
            <p className="text-lg opacity-90">Take our FREE 2-minute quiz to discover your ideal career path!</p>
            <ul className="mt-3 space-y-1 text-sm opacity-90">
              <li>✓ Personalized recommendations</li>
              <li>✓ Based on your interests & skills</li>
              <li>✓ See salary ranges & job opportunities</li>
            </ul>
          </div>
          <Link
            to="/career-quiz"
            className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            🚀 Take the Quiz Now
          </Link>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="glass-card rounded-xl p-6 card-hover group"
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">{action.label}</h3>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Career Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recommended Careers</h2>
          <Link to="/careers" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center space-x-1">
            <span>View All</span>
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {sampleCareers.map((career, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="glass-card rounded-2xl p-6 card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{career.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  career.growth === 'Growing' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {career.growth}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Match Score</span>
                  <span className="text-sm font-bold text-primary-600">{career.match}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${career.match}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                <span className="font-semibold">Salary:</span> {career.salary}
              </p>

              <Link
                to="/careers"
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Explore Path
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card rounded-2xl p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200"
      >
        <h3 className="text-xl font-bold mb-2">💡 Daily Career Tip</h3>
        <p className="text-gray-700">
          Students who complete their learning paths are 3x more likely to land their dream jobs. 
          Keep progressing on your skill development journey!
        </p>
      </motion.div>
    </div>
  )
}

export default DashboardPage
