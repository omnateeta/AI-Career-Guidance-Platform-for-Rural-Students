import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaStar, FaAward, FaCalendarAlt, FaEdit, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    )
  }

  const profile = user.profile || {}
  const education = user.education || {}
  const gamification = user.gamification || {}
  const skills = user.skills || []
  const interests = user.interests || []
  const careerGoals = user.careerGoals || []

  // Calculate XP progress to next level
  const currentLevelXP = gamification.xp % 1000
  const xpProgress = (currentLevelXP / 1000) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-6">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-300 mb-4"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">View and manage your account details</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:shadow-md transition-all duration-300 font-semibold"
              title="Logout"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Profile Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-6 border border-gray-200/50 shadow-lg"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {profile.name?.charAt(0) || 'U'}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name || 'Student'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2 text-primary-600" />
                  <span>{user.email || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2 text-primary-600" />
                  <span>{profile.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-primary-600" />
                  <span>
                    {[profile.location?.district, profile.location?.state].filter(Boolean).join(', ') || 'Location not set'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2 text-primary-600" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <FaEdit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </motion.div>

        {/* Gamification Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="glass-card rounded-xl p-5 border border-gray-200/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Level</h3>
              <FaStar className="text-yellow-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-primary-600">{gamification.level || 1}</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">{currentLevelXP}/1000 XP to next level</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border border-gray-200/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Total XP</h3>
              <FaAward className="text-purple-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{gamification.xp || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Experience points earned</p>
          </div>

          <div className="glass-card rounded-xl p-5 border border-gray-200/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Login Streak</h3>
              <FaCalendarAlt className="text-green-500 text-xl" />
            </div>
            <p className="text-3xl font-bold text-green-600">{gamification.streak?.count || 0} days</p>
            <p className="text-sm text-gray-600 mt-1">Keep it up!</p>
          </div>
        </motion.div>

        {/* Education & Career Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Education Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-xl p-6 border border-gray-200/50"
          >
            <div className="flex items-center mb-4">
              <FaGraduationCap className="text-primary-600 mr-2 text-xl" />
              <h3 className="text-xl font-bold text-gray-900">Education</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="font-medium text-gray-900 capitalize">
                  {education.currentLevel?.replace('_', ' ') || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">School/College</p>
                <p className="font-medium text-gray-900">{education.school || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Marks</p>
                <p className="font-medium text-gray-900">
                  {education.marks?.percentage ? `${education.marks.percentage}%` : 
                   education.marks?.grade || 'Not provided'}
                </p>
              </div>
              {education.subjects && education.subjects.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {education.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Career Goals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-xl p-6 border border-gray-200/50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Career Goals</h3>
            {careerGoals.length > 0 ? (
              <div className="space-y-3">
                {careerGoals.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{goal.career}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < (goal.priority || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No career goals set yet. Take the career quiz to discover your path!</p>
            )}
          </motion.div>
        </div>

        {/* Skills & Interests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-xl p-6 border border-gray-200/50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
            {skills.length > 0 ? (
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-900 capitalize">{skill.name}</span>
                      <span className="text-sm text-gray-600">{skill.proficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.proficiency}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No skills added yet.</p>
            )}
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-xl p-6 border border-gray-200/50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Interests</h3>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-secondary-100 to-primary-100 text-secondary-700 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No interests specified yet.</p>
            )}
          </motion.div>
        </div>

        {/* Badges */}
        {gamification.badges && gamification.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-xl p-6 border border-gray-200/50 mt-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Badges Earned</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gamification.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-2">
                    <FaAward className="text-white text-xl" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 text-center">{badge.name}</p>
                  <p className="text-xs text-gray-600 text-center mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
