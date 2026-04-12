import { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '../context/AuthContext'
import { 
  FaArrowLeft, FaBookmark, FaCalendarAlt, FaGraduationCap, 
  FaUsers, FaClock, FaExternalLinkAlt, FaLink, FaBook,
  FaSpinner, FaCheck, FaInfoCircle, FaTrophy, FaLightbulb,
  FaRegCalendarCheck, FaFilePdf
} from 'react-icons/fa'

const ExamDetailPage = () => {
  const { examId } = useParams()
  const { token, user } = useContext(AuthContext)
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaved, setIsSaved] = useState(false)
  const [updates, setUpdates] = useState([])
  const [preparationGuide, setPreparationGuide] = useState(null)

  const categoryColors = {
    'UPSC': 'from-purple-500 to-indigo-600',
    'SSC': 'from-blue-500 to-cyan-600',
    'Banking': 'from-green-500 to-teal-600',
    'Railway': 'from-orange-500 to-red-600',
    'Defence': 'from-red-500 to-rose-600',
    'Entrance': 'from-yellow-500 to-orange-600',
    'State PSC': 'from-pink-500 to-purple-600',
    'Teaching': 'from-teal-500 to-green-600',
    'Other': 'from-gray-500 to-slate-600',
  }

  useEffect(() => {
    fetchExamDetails()
  }, [examId])

  const fetchExamDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      const response = await fetch(`${apiUrl}/api/exams/${examId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch exam details')
      }

      const data = await response.json()
      
      if (data.success) {
        setExam(data.exam)
        setUpdates(data.updates || [])
        setPreparationGuide(data.preparationGuide || null)
        setIsSaved(data.isSaved || false)
      }
    } catch (error) {
      console.error('❌ Error fetching exam details:', error.message)
      setError('Failed to fetch exam details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveExam = async () => {
    if (!token) {
      alert('Please login to save exams')
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const method = isSaved ? 'DELETE' : 'POST'
      
      await fetch(`${apiUrl}/api/exams/${examId}/save`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'To be announced'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null
    const now = new Date()
    const end = new Date(deadline)
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getStatusBadge = () => {
    if (!exam?.applicationDeadline) {
      return { text: 'Not Yet Open', color: 'bg-gray-500' }
    }
    
    const days = getDaysRemaining(exam.applicationDeadline)
    if (days < 0) return { text: 'Closed', color: 'bg-red-500' }
    if (days <= 7) return { text: `Closing in ${days} days`, color: 'bg-red-500' }
    if (days <= 30) return { text: `${days} days left`, color: 'bg-yellow-500' }
    return { text: 'Open', color: 'bg-green-500' }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading exam details...</p>
        </div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">{error || 'Exam not found'}</p>
          <Link to="/exams" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            ← Back to Exams
          </Link>
        </div>
      </div>
    )
  }

  const status = getStatusBadge()
  const colorClass = categoryColors[exam.category] || categoryColors['Other']
  const daysRemaining = getDaysRemaining(exam.applicationDeadline)

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Link to="/exams" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4">
        <FaArrowLeft className="w-4 h-4" />
        <span>Back to Exams</span>
      </Link>

      {/* Exam Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center text-white font-bold text-2xl`}>
                  {exam.conductingBody?.charAt(0) || 'E'}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.name}</h1>
                  <p className="text-gray-600 font-semibold text-lg flex items-center space-x-2">
                    <FaBook className="text-sm" />
                    <span>{exam.conductingBody}</span>
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={toggleSaveExam}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isSaved
                  ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaBookmark className={`w-6 h-6 ${isSaved ? 'text-yellow-600' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Status & Category */}
          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`px-4 py-2 ${status.color} text-white rounded-full text-sm font-semibold`}>
              {status.text}
            </span>
            <span className={`inline-block px-4 py-2 bg-gradient-to-r ${colorClass} text-white rounded-full text-sm font-semibold`}>
              {exam.category}
            </span>
          </div>

          {/* Quick Info */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <FaGraduationCap className="text-blue-600 text-xl" />
              <div>
                <p className="text-xs text-gray-600">Qualification</p>
                <p className="text-sm font-semibold text-gray-900">{exam.qualification || 'As per notification'}</p>
              </div>
            </div>
            {exam.vacancies && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <FaUsers className="text-green-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-600">Vacancies</p>
                  <p className="text-sm font-semibold text-gray-900">{exam.vacancies}</p>
                </div>
              </div>
            )}
            {exam.applicationDeadline && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <FaCalendarAlt className="text-orange-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-600">Application Deadline</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(exam.applicationDeadline)}</p>
                </div>
              </div>
            )}
            {exam.examDate && (
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <FaRegCalendarCheck className="text-purple-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-600">Exam Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(exam.examDate)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Deadline Alert */}
          {daysRemaining !== null && daysRemaining > 0 && (
            <div className={`mt-4 p-4 rounded-xl ${
              daysRemaining <= 7 ? 'bg-red-50 border-2 border-red-200' : 
              daysRemaining <= 30 ? 'bg-yellow-50 border-2 border-yellow-200' : 
              'bg-green-50 border-2 border-green-200'
            }`}>
              <p className={`text-lg font-bold ${
                daysRemaining <= 7 ? 'text-red-700' : 
                daysRemaining <= 30 ? 'text-yellow-700' : 
                'text-green-700'
              }`}>
                ⏰ Application closes in {daysRemaining} days
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-3">
            {exam.applicationLink && (
              <a
                href={exam.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
              >
                <span>Apply Now</span>
                <FaExternalLinkAlt className="w-4 h-4" />
              </a>
            )}
            {exam.officialWebsite && (
              <a
                href={exam.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-300 font-semibold flex items-center space-x-2"
              >
                <FaLink className="w-4 h-4" />
                <span>Official Website</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="glass-card rounded-xl p-2">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'preparation', label: 'Preparation Guide' },
              { id: 'study-materials', label: 'Study Materials' },
              { id: 'updates', label: 'Updates' },
              { id: 'links', label: 'Important Links' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-2xl p-6 space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FaInfoCircle className="text-primary-600" />
                <span>Exam Overview</span>
              </h2>
              <p className="text-gray-700 leading-relaxed">{exam.description}</p>
            </div>

            {exam.stages && exam.stages.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Selection Process</h3>
                <div className="flex flex-wrap gap-3">
                  {exam.stages.map((stage, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold">
                        {stage}
                      </div>
                      {index < exam.stages.length - 1 && (
                        <FaArrowLeft className="text-gray-400 rotate-180" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {exam.examPattern && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Exam Pattern</h3>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-line">{exam.examPattern}</p>
                </div>
              </div>
            )}

            {exam.examFee && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Application Fee</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {exam.examFee.general && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">General</p>
                      <p className="text-2xl font-bold text-blue-700">₹{exam.examFee.general}</p>
                    </div>
                  )}
                  {exam.examFee.obc && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">OBC</p>
                      <p className="text-2xl font-bold text-yellow-700">₹{exam.examFee.obc}</p>
                    </div>
                  )}
                  {exam.examFee.scSt && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">SC/ST</p>
                      <p className="text-2xl font-bold text-green-700">₹{exam.examFee.scSt}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Preparation Guide Tab */}
        {activeTab === 'preparation' && (
          <motion.div
            key="preparation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {!preparationGuide ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-semibold">Generating AI-powered preparation guide...</p>
              </div>
            ) : (
              <>
                {/* Syllabus Overview */}
                {preparationGuide.syllabusOverview && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <FaBook className="text-primary-600" />
                      <span>Syllabus Overview</span>
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{preparationGuide.syllabusOverview}</p>
                  </div>
                )}

                {/* Study Roadmap */}
                {preparationGuide.studyRoadmap && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <FaTrophy className="text-yellow-600" />
                      <span>Study Roadmap</span>
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{preparationGuide.studyRoadmap}</p>
                  </div>
                )}

                {/* Strategy */}
                {preparationGuide.strategy && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <FaLightbulb className="text-orange-600" />
                      <span>Preparation Strategy</span>
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{preparationGuide.strategy}</p>
                  </div>
                )}

                {/* Timeline */}
                {preparationGuide.timeline && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <FaClock className="text-blue-600" />
                      <span>Study Timeline</span>
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{preparationGuide.timeline}</p>
                  </div>
                )}

                {/* Resources */}
                {preparationGuide.resources && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <FaBook className="text-green-600" />
                      <span>Recommended Resources</span>
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{preparationGuide.resources}</p>
                  </div>
                )}

                {/* Tips */}
                {preparationGuide.tips && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <FaLightbulb className="text-purple-600" />
                      <span>Pro Tips</span>
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{preparationGuide.tips}</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Study Materials Tab */}
        {activeTab === 'study-materials' && (
          <motion.div
            key="study-materials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Recommended Books */}
            {preparationGuide?.resources && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FaBook className="text-blue-600" />
                  <span>📚 Recommended Books & Resources</span>
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{preparationGuide.resources}</p>
                </div>
              </div>
            )}

            {/* Free Online Resources */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FaLightbulb className="text-yellow-600" />
                <span>🎓 Free Online Resources</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">YouTube Channels</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Khan Academy (All Subjects - Free)</li>
                    <li>• Unacademy (Free Live Classes)</li>
                    <li>• Study IQ (Current Affairs & GS)</li>
                    <li>• Adda247 (Banking & SSC)</li>
                    <li>• Physics Wallah (Engineering & Medical)</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-2">Websites & Apps</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• NCERT Books (ncert.nic.in)</li>
                    <li>• NPTEL Courses (nptel.ac.in)</li>
                    <li>• SWAYAM (swayam.gov.in)</li>
                    <li>• Gradeup App (Mock Tests)</li>
                    <li>• Testbook App (Practice)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Previous Year Papers */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FaFilePdf className="text-red-600" />
                <span>📝 Previous Year Question Papers</span>
              </h2>
              <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
                <p className="text-gray-700 mb-3">
                  <strong>Tip:</strong> Solve at least 10 years of previous question papers to understand exam pattern and important topics.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Download from official exam website</li>
                  <li>• Available on coaching institute websites</li>
                  <li>• Join Telegram groups for study material</li>
                  <li>• Use apps like Gradeup, Testbook for practice</li>
                </ul>
              </div>
            </div>

            {/* Study Plan */}
            {preparationGuide?.timeline && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FaClock className="text-purple-600" />
                  <span>⏰ Daily Study Schedule</span>
                </h2>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-line">{preparationGuide.timeline}</p>
                </div>
              </div>
            )}

            {/* Tips for Rural Students */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FaTrophy className="text-orange-600" />
                <span>💡 Special Tips for Rural Students</span>
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-l-4 border-green-500">
                  <h3 className="font-bold text-gray-900 mb-2">📱 Use Free Mobile Apps</h3>
                  <p className="text-sm text-gray-700">Most coaching is available free on YouTube and apps. You don't need expensive coaching.</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                  <h3 className="font-bold text-gray-900 mb-2">📖 NCERT is Your Best Friend</h3>
                  <p className="text-sm text-gray-700">Start with NCERT books (6th to 12th). They are free, simple, and cover basics perfectly.</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500">
                  <h3 className="font-bold text-gray-900 mb-2">🌐 Use Government Resources</h3>
                  <p className="text-sm text-gray-700">SWAYAM, NPTEL, DIKSHA - all government platforms offer free quality education.</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-l-4 border-orange-500">
                  <h3 className="font-bold text-gray-900 mb-2">👥 Form Study Groups</h3>
                  <p className="text-sm text-gray-700">Study with friends, discuss topics, and motivate each other. Group study is very effective.</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-500">
                  <h3 className="font-bold text-gray-900 mb-2">🎯 Stay Consistent</h3>
                  <p className="text-sm text-gray-700">Study 4-6 hours daily with focus. Consistency is more important than studying 12 hours one day and nothing the next.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <motion.div
            key="updates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FaClock className="text-primary-600" />
              <span>Latest Updates</span>
            </h2>

            {updates.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No updates available for this exam yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <div key={update._id || index} className="p-4 bg-gray-50 rounded-xl border-l-4 border-primary-500">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{update.title}</h3>
                      <span className="text-xs text-gray-500">{formatDate(update.date)}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{update.description}</p>
                    {update.sourceUrl && (
                      <a
                        href={update.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <FaExternalLinkAlt className="w-3 h-3" />
                        <span>Read More</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <motion.div
            key="links"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <FaLink className="text-primary-600" />
              <span>Important Links</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {exam.officialWebsite && (
                <a
                  href={exam.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 flex items-center space-x-3"
                >
                  <FaLink className="text-blue-600 text-xl" />
                  <div>
                    <p className="font-semibold text-gray-900">Official Website</p>
                    <p className="text-sm text-gray-600">Visit official website</p>
                  </div>
                </a>
              )}

              {exam.applicationLink && (
                <a
                  href={exam.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-300 flex items-center space-x-3"
                >
                  <FaExternalLinkAlt className="text-green-600 text-xl" />
                  <div>
                    <p className="font-semibold text-gray-900">Apply Online</p>
                    <p className="text-sm text-gray-600">Submit application</p>
                  </div>
                </a>
              )}

              {exam.notificationPDF && (
                <a
                  href={exam.notificationPDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 flex items-center space-x-3"
                >
                  <FaFilePdf className="text-red-600 text-xl" />
                  <div>
                    <p className="font-semibold text-gray-900">Notification PDF</p>
                    <p className="text-sm text-gray-600">Download official notification</p>
                  </div>
                </a>
              )}

              {exam.syllabusLink && (
                <a
                  href={exam.syllabusLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-300 flex items-center space-x-3"
                >
                  <FaBook className="text-purple-600 text-xl" />
                  <div>
                    <p className="font-semibold text-gray-900">Detailed Syllabus</p>
                    <p className="text-sm text-gray-600">View complete syllabus</p>
                  </div>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExamDetailPage
