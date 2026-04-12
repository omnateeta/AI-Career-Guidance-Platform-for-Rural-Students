import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { 
  FaArrowLeft, FaMapMarkerAlt, FaRupeeSign, FaClock, FaBookmark, 
  FaExternalLinkAlt, FaSearch, FaFilter, FaCheck, FaSpinner,
  FaTimes, FaBuilding, FaBriefcase, FaGraduationCap, FaUsers,
  FaBell, FaBriefcase as FaBriefcaseIcon, FaLandmark
} from 'react-icons/fa'

const JobFeedPage = () => {
  const { token, user } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('all') // all, private, government
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [appliedJobs, setAppliedJobs] = useState(new Set())
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [applyLoading, setApplyLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [aiMatchEnabled, setAiMatchEnabled] = useState(true)
  const [matchThreshold, setMatchThreshold] = useState(60)
  const [totalJobs, setTotalJobs] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Indian states for filter
  const indianStates = [
    'All India', 'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Tamil Nadu',
    'Telangana', 'Uttar Pradesh', 'West Bengal'
  ]

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSaved = new Set(prev)
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId)
        setSuccessMessage('Job removed from saved list')
      } else {
        newSaved.add(jobId)
        setSuccessMessage('Job saved successfully!')
      }
      return newSaved
    })
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleApplyNow = (job) => {
    setSelectedJob(job)
    setShowApplyModal(true)
  }

  const submitApplication = async () => {
    if (!selectedJob) return
    
    setApplyLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAppliedJobs(prev => new Set([...prev, selectedJob.id]))
      setShowApplyModal(false)
      setSuccessMessage('Application submitted successfully! 🎉')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error('Error applying:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setApplyLoading(false)
    }
  }

  const handleSubscribeAlerts = async (alertData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      await axios.post(`${apiUrl}/api/jobs/subscribe`, alertData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccessMessage('Successfully subscribed to job alerts! 📧')
      setShowAlertModal(false)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('Failed to subscribe. Please try again.')
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [activeTab, page, aiMatchEnabled, matchThreshold])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
      let endpoint = '/api/jobs/all'
      if (activeTab === 'private') endpoint = '/api/jobs/private'
      else if (activeTab === 'government') endpoint = '/api/jobs/government'
      
      const params = new URLSearchParams({
        page,
        location: location || 'India',
        skills: searchTerm,
      })
      
      if (activeTab === 'all' && aiMatchEnabled) {
        params.append('matchThreshold', matchThreshold)
      }
      
      const url = `${apiUrl}${endpoint}?${params}`
      console.log('🔍 Fetching jobs from:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Jobs received:', data.count, 'out of', data.total)
      
      if (data.success && data.jobs) {
        setJobs(data.jobs)
        setTotalJobs(data.total || 0)
        setTotalPages(data.totalPages || 1)
      } else {
        setJobs([])
        setTotalJobs(0)
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error.message)
      setError('Failed to fetch jobs. Please try again.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getDaysRemaining = (lastDate) => {
    if (!lastDate) return null
    const now = new Date()
    const end = new Date(lastDate)
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diff
  }

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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-3">
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Job Opportunities 💼</h1>
        <p className="text-gray-600">Discover real-time private & government jobs tailored to your skills</p>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="glass-card rounded-xl p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => { setActiveTab('all'); setPage(1); }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaBriefcaseIcon />
              <span>All Jobs</span>
            </button>
            <button
              onClick={() => { setActiveTab('private'); setPage(1); }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === 'private'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaBuilding />
              <span>Private Jobs</span>
            </button>
            <button
              onClick={() => { setActiveTab('government'); setPage(1); }}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === 'government'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaLandmark />
              <span>Government Jobs</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title, skills, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Location & AI Match Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">📍 Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-900"
            >
              {indianStates.map(state => (
                <option key={state} value={state === 'All India' ? '' : state}>{state}</option>
              ))}
            </select>
          </div>

          {activeTab === 'all' && (
            <>
              <div className="glass-card rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">🤖 AI Match</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={aiMatchEnabled}
                    onChange={(e) => setAiMatchEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show best matches only</span>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Match Threshold: {matchThreshold}%
                </label>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={matchThreshold}
                  onChange={(e) => setMatchThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800">⚠️ {error}</p>
        </motion.div>
      )}

      {/* Job Count & Alert Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {jobs.length} of {totalJobs} jobs
        </div>
        {token && (
          <button
            onClick={() => setShowAlertModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2"
          >
            <FaBell />
            <span>Get Job Alerts</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading real-time jobs...</p>
        </div>
      ) : (
        <>
          {/* Job Cards */}
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No jobs found. Try adjusting your filters.</p>
              </div>
            ) : (
              jobs.map((job, index) => (
                <motion.div
                  key={job.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-6 card-hover"
                >
                  {job.jobSource === 'government' ? (
                    // Government Job Card
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                              <FaLandmark />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                              <p className="text-gray-600 font-semibold flex items-center space-x-1">
                                <FaBuilding className="text-sm" />
                                <span>{job.department}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        {job.matchScore && (
                          <div className={`px-3 py-1 rounded-full text-white font-bold text-sm ${
                            job.matchScore >= 80 ? 'bg-green-500' : job.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {job.matchScore}% Match
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaMapMarkerAlt className="text-orange-600" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaGraduationCap className="text-blue-600" />
                          <span className="text-sm">{job.qualification || 'As per norms'}</span>
                        </div>
                        {job.vacancies && (
                          <div className="flex items-center space-x-2 text-gray-700">
                            <FaUsers className="text-green-600" />
                            <span className="text-sm">{job.vacancies} vacancies</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaClock className="text-gray-500" />
                          <span className="text-sm">Posted: {formatDate(job.postedDate)}</span>
                        </div>
                      </div>

                      {job.lastDate && (
                        <div className={`p-3 rounded-lg ${
                          getDaysRemaining(job.lastDate) <= 7 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <p className={`text-sm font-semibold ${
                            getDaysRemaining(job.lastDate) <= 7 ? 'text-red-700' : 'text-blue-700'
                          }`}>
                            ⏰ Last Date: {formatDate(job.lastDate)} 
                            {getDaysRemaining(job.lastDate) !== null && ` (${getDaysRemaining(job.lastDate)} days remaining)`}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <a
                          href={job.applyUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
                        >
                          <span>Apply Now</span>
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </a>
                        <button 
                          onClick={() => toggleSaveJob(job.id)}
                          className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                            savedJobs.has(job.id)
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <FaBookmark className={savedJobs.has(job.id) ? 'text-yellow-600' : 'text-gray-600'} />
                          <span>{savedJobs.has(job.id) ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Private Job Card
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                              {job.company?.charAt(0) || 'C'}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                              <p className="text-gray-600 font-semibold">{job.company}</p>
                            </div>
                          </div>
                        </div>
                        {job.matchScore && (
                          <div className={`px-3 py-1 rounded-full text-white font-bold text-sm ${
                            job.matchScore >= 80 ? 'bg-green-500' : job.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {job.matchScore}% Match
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaMapMarkerAlt className="text-primary-600" />
                          <span className="text-sm">{job.location}</span>
                          {job.remote && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              Remote
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaRupeeSign className="text-green-600" />
                          <span className="text-sm">₹{job.salary || 'Competitive'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaClock className="text-gray-500" />
                          <span className="text-sm">{job.posted || formatDate(job.postedDate)}</span>
                        </div>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleApplyNow(job)}
                          disabled={appliedJobs.has(job.id)}
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                            appliedJobs.has(job.id)
                              ? 'bg-green-500 text-white cursor-default'
                              : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg'
                          }`}
                        >
                          {appliedJobs.has(job.id) ? (
                            <>
                              <FaCheck />
                              <span>Applied ✓</span>
                            </>
                          ) : (
                            <>
                              <span>Apply Now</span>
                              <FaExternalLinkAlt className="w-3 h-3" />
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => toggleSaveJob(job.id)}
                          className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                            savedJobs.has(job.id)
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <FaBookmark className={savedJobs.has(job.id) ? 'text-yellow-600' : 'text-gray-600'} />
                          <span>{savedJobs.has(job.id) ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
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

      {/* Job Alert Subscription Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <JobAlertModal
            onClose={() => setShowAlertModal(false)}
            onSubmit={handleSubscribeAlerts}
            indianStates={indianStates}
          />
        )}
      </AnimatePresence>

      {/* Application Modal */}
      <AnimatePresence>
        {showApplyModal && selectedJob && (
          <ApplicationModal
            job={selectedJob}
            user={user}
            onClose={() => setShowApplyModal(false)}
            onSubmit={submitApplication}
            loading={applyLoading}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Job Alert Modal Component
const JobAlertModal = ({ onClose, onSubmit, indianStates }) => {
  const [formData, setFormData] = useState({
    locations: [],
    jobTypes: ['both'],
    skills: '',
    emailNotifications: true,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">📧 Get Job Alerts</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Locations</label>
            <select
              multiple
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value)
                setFormData({ ...formData, locations: values })
              }}
            >
              {indianStates.map(state => (
                <option key={state} value={state === 'All India' ? '' : state}>{state}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="React, Python, JavaScript"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-700">Receive email notifications</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg font-semibold">
              Subscribe
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Application Modal Component
const ApplicationModal = ({ job, user, onClose, onSubmit, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Apply for Position</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
          <h4 className="font-bold text-gray-900 text-lg">{job.title}</h4>
          <p className="text-gray-600">{job.company || job.department}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
            <input type="text" defaultValue={user?.profile?.name || ''} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
            <input type="email" defaultValue={user?.email || ''} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
            <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="+91 XXXXX XXXXX" required />
          </div>

          <div className="flex space-x-3 pt-4">
            <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
              Cancel
            </button>
            <button onClick={onSubmit} disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50">
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaBriefcase />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default JobFeedPage
