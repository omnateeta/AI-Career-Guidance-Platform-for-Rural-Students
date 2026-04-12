import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { 
  FaArrowLeft, FaSearch, FaFilter, FaBookmark, FaClock, 
  FaUsers, FaCalendarAlt, FaGraduationCap, FaExternalLinkAlt,
  FaSpinner, FaCheck, FaBuilding, FaLandmark, FaShieldAlt,
  FaFlask, FaChalkboardTeacher, FaMapMarkerAlt
} from 'react-icons/fa'

const CompetitiveExamsPage = () => {
  const { token } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('all')
  const [educationFilter, setEducationFilter] = useState('all') // all, 10th, 12th, degree
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [savedExams, setSavedExams] = useState(new Set())
  const [totalExams, setTotalExams] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Education level filters
  const educationLevels = [
    { id: 'all', label: 'All Levels' },
    { id: '10th', label: 'After 10th' },
    { id: '12th', label: 'After 12th/PUC' },
    { id: 'degree', label: 'After Degree' },
  ]

  // Exam categories
  const categories = [
    { id: 'all', label: 'All Exams', icon: FaBuilding },
    { id: 'UPSC', label: 'UPSC', icon: FaLandmark },
    { id: 'SSC', label: 'SSC', icon: FaBuilding },
    { id: 'Banking', label: 'Banking', icon: FaBuilding },
    { id: 'Defence', label: 'Defence', icon: FaShieldAlt },
    { id: 'Entrance', label: 'Entrance', icon: FaFlask },
    { id: 'State PSC', label: 'State PSC', icon: FaMapMarkerAlt },
    { id: 'Teaching', label: 'Teaching', icon: FaChalkboardTeacher },
  ]

  // Category colors
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
    fetchExams()
  }, [activeTab, page, educationFilter])

  const fetchExams = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      let endpoint = '/api/exams/all'
      if (activeTab !== 'all') {
        endpoint = `/api/exams/category/${activeTab}`
      }
      
      const params = new URLSearchParams({
        page,
        search: searchTerm,
      })
      
      const response = await fetch(`${apiUrl}${endpoint}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch exams')
      }

      const data = await response.json()
      
      if (data.success && data.exams) {
        setExams(data.exams)
        setTotalExams(data.total || 0)
        setTotalPages(data.totalPages || 1)
      } else {
        setExams([])
        setTotalExams(0)
      }
    } catch (error) {
      console.error('❌ Error fetching exams:', error.message)
      setError('Failed to fetch exams. Please try again.')
      setExams([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchExams()
  }

  const toggleSaveExam = async (examId) => {
    if (!token) {
      alert('Please login to save exams')
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      if (savedExams.has(examId)) {
        // Unsave
        await fetch(`${apiUrl}/api/exams/${examId}/save`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        setSavedExams(prev => {
          const newSaved = new Set(prev)
          newSaved.delete(examId)
          return newSaved
        })
      } else {
        // Save
        await fetch(`${apiUrl}/api/exams/${examId}/save`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        setSavedExams(prev => new Set([...prev, examId]))
      }
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-3">
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Competitive Exams 📚</h1>
        <p className="text-gray-600">Discover real-time exam notifications, eligibility criteria, and preparation guides</p>
      </motion.div>

      {/* Education Level Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
        <div className="glass-card rounded-xl p-2">
          <div className="flex space-x-2">
            {educationLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => { setEducationFilter(level.id); setPage(1); }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  educationFilter === level.id
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="glass-card rounded-xl p-2 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveTab(cat.id); setPage(1); }}
                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === cat.id
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <form onSubmit={handleSearch} className="glass-card rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search exams by name, conducting body, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Search
            </button>
          </div>
        </form>
      </motion.div>

      {/* Exam Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {exams.length} of {totalExams} exams
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading real-time exam data...</p>
        </div>
      ) : (
        <>
          {/* Exam Cards */}
          <div className="space-y-4">
            {exams.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No exams found. Try adjusting your filters or check back later for updates.</p>
              </div>
            ) : (
              exams.map((exam, index) => {
                const daysRemaining = getDaysRemaining(exam.applicationDeadline)
                const colorClass = categoryColors[exam.category] || categoryColors['Other']

                return (
                  <motion.div
                    key={exam._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-2xl p-6 card-hover"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
                              {exam.conductingBody?.charAt(0) || 'E'}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{exam.name}</h3>
                              <p className="text-gray-600 font-semibold flex items-center space-x-1">
                                <FaBuilding className="text-sm" />
                                <span>{exam.conductingBody}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleSaveExam(exam._id)}
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            savedExams.has(exam._id)
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <FaBookmark className={savedExams.has(exam._id) ? 'text-yellow-600' : 'text-gray-600'} />
                        </button>
                      </div>

                      {/* Category & Education Badge */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-block px-3 py-1 bg-gradient-to-r ${colorClass} text-white rounded-full text-xs font-semibold`}>
                          {exam.category}
                        </span>
                        {exam.qualification?.toLowerCase().includes('10th') && (
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            After 10th
                          </span>
                        )}
                        {exam.qualification?.toLowerCase().includes('12th') && (
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            After 12th/PUC
                          </span>
                        )}
                        {(exam.qualification?.toLowerCase().includes('graduat') || exam.qualification?.toLowerCase().includes('degree')) && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            After Degree
                          </span>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaGraduationCap className="text-blue-600" />
                          <span className="text-sm">{exam.qualification || 'As per notification'}</span>
                        </div>
                        {exam.vacancies && (
                          <div className="flex items-center space-x-2 text-gray-700">
                            <FaUsers className="text-green-600" />
                            <span className="text-sm">{exam.vacancies} vacancies</span>
                          </div>
                        )}
                        {exam.applicationDeadline && (
                          <div className="flex items-center space-x-2 text-gray-700">
                            <FaCalendarAlt className="text-orange-600" />
                            <span className="text-sm">Deadline: {formatDate(exam.applicationDeadline)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaClock className="text-gray-500" />
                          <span className="text-sm">Posted: {formatDate(exam.createdAt)}</span>
                        </div>
                      </div>

                      {/* Deadline Alert */}
                      {daysRemaining !== null && (
                        <div className={`p-3 rounded-lg ${
                          daysRemaining <= 7 ? 'bg-red-50 border border-red-200' : 
                          daysRemaining <= 30 ? 'bg-yellow-50 border border-yellow-200' : 
                          'bg-green-50 border border-green-200'
                        }`}>
                          <p className={`text-sm font-semibold ${
                            daysRemaining <= 7 ? 'text-red-700' : 
                            daysRemaining <= 30 ? 'text-yellow-700' : 
                            'text-green-700'
                          }`}>
                            ⏰ {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Deadline passed'}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Link
                          to={`/exams/${exam._id}`}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
                        >
                          <span>View Details</span>
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </Link>
                        {exam.applicationLink && (
                          <a
                            href={exam.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2"
                          >
                            <span>Apply Now</span>
                            <FaExternalLinkAlt className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex justify-center space-x-4">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default CompetitiveExamsPage
