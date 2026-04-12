import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaAward, 
  FaFilter, 
  FaClock, 
  FaMoneyBillWave, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaSync,
  FaInfoCircle,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaUsers,
  FaRupeeSign
} from 'react-icons/fa'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ScholarshipsPage = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('all') // all, government, private
  const [scholarships, setScholarships] = useState([])
  const [matchedScholarships, setMatchedScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMatchOnly, setShowMatchOnly] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    educationLevel: '',
    state: '',
    category: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    government: 0,
    private: 0,
    expiringSoon: 0,
    matched: 0,
  })

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ]

  // Education levels
  const educationLevels = ['10th', '12th', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD']
  const categories = ['General', 'OBC', 'SC', 'ST', 'Minority']

  // Fetch scholarships
  const fetchScholarships = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching scholarships...', { activeTab, showMatchOnly, filters })
      
      if (showMatchOnly) {
        // Fetch matched scholarships (requires auth)
        const response = await axios.get('/api/scholarships/match', {
          params: { limit: 50 },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        
        console.log('📦 Matched scholarships response:', response.data)
        
        const data = response.data.data || response.data.success
        setMatchedScholarships(data.matched || [])
        setScholarships(data.matched || [])
        setStats({
          total: data.stats?.totalAvailable || 0,
          matched: data.stats?.matched || 0,
          government: (data.matched || []).filter(s => s.type === 'government').length,
          private: (data.matched || []).filter(s => s.type === 'private').length,
          expiringSoon: data.stats?.expiringSoon || 0,
        })
      } else {
        // Fetch all scholarships with filters (public)
        const response = await axios.get('/api/scholarships', {
          params: {
            type: activeTab === 'all' ? '' : activeTab,
            ...filters,
          },
        })
        
        console.log('📦 All scholarships response:', response.data)
        console.log('✅ Scholarships count:', response.data.data?.scholarships?.length || response.data.success?.scholarships?.length)
        
        const data = response.data.data || response.data.success
        setScholarships(data.scholarships || [])
        setStats(data.stats || {
          total: 0,
          government: 0,
          private: 0,
          expiringSoon: 0,
        })
      }
    } catch (error) {
      console.error('❌ Error fetching scholarships:', error)
      console.error('Error response:', error.response?.data)
      setScholarships([])
      setStats({ total: 0, government: 0, private: 0, expiringSoon: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [activeTab, showMatchOnly, filters])

  // Handle filter apply
  const handleApplyFilters = () => {
    fetchScholarships()
    setShowFilters(false)
  }

  // Client-side filter to ensure filters work even if backend doesn't filter properly
  const applyClientSideFilters = (scholarshipsList) => {
    let filtered = [...scholarshipsList];
    
    // Filter by education level
    if (filters.educationLevel) {
      console.log('🎯 Client-side filtering by education:', filters.educationLevel);
      console.log('📊 Before:', filtered.length, 'scholarships');
      
      filtered = filtered.filter(s => {
        const levels = s.eligibility?.educationLevel;
        // Show if no levels specified, includes 'Any', or includes selected level
        if (!levels || levels.length === 0) {
          console.log(`  ❌ "${s.name}" - No education levels specified, skipping`);
          return false; // Don't show if no education levels specified
        }
        if (levels.includes('Any')) {
          console.log(`  ✅ "${s.name}" - Has 'Any', showing`);
          return true;
        }
        const matches = levels.includes(filters.educationLevel);
        console.log(`  ${matches ? '✅' : '❌'} "${s.name}" - Levels: [${levels.join(', ')}], matches ${filters.educationLevel}?`, matches);
        return matches;
      });
      
      console.log('📊 After education filter:', filtered.length, 'scholarships');
    }
    
    // Filter by state
    if (filters.state) {
      filtered = filtered.filter(s => {
        const states = s.eligibility?.state;
        if (!states || states.length === 0) return true; // All India
        return states.includes('All India') || states.includes(filters.state);
      });
    }
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(s => {
        const cats = s.eligibility?.category;
        if (!cats || cats.length === 0 || cats.includes('Any')) return true;
        return cats.includes(filters.category);
      });
    }
    
    return filtered;
  }

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchScholarships()
    setRefreshing(false)
  }

  // Get deadline status
  const getDeadlineStatus = (daysUntilDeadline) => {
    if (daysUntilDeadline === null || daysUntilDeadline === 999) {
      return { text: 'Rolling', color: 'text-blue-600', bg: 'bg-blue-50' }
    }
    if (daysUntilDeadline < 0) {
      return { text: 'Expired', color: 'text-red-600', bg: 'bg-red-50' }
    }
    if (daysUntilDeadline <= 30) {
      return { text: `${daysUntilDeadline} days left`, color: 'text-orange-600', bg: 'bg-orange-50' }
    }
    return { text: `${daysUntilDeadline} days left`, color: 'text-green-600', bg: 'bg-green-50' }
  }

  // Filter scholarships by tab AND apply client-side filters
  const filteredScholarships = applyClientSideFilters(
    scholarships.filter(s => {
      if (activeTab === 'government') return s.type === 'government'
      if (activeTab === 'private') return s.type === 'private'
      return true
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-28 md:pt-32 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FaAward className="text-primary-600" />
                  Scholarship Assistance
                </h1>
                <p className="text-gray-600 mt-2">
                  Discover real scholarships you can apply for today
                </p>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
              >
                <FaSync className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <FaAward className="text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    <p className="text-xs text-blue-700">Total Available</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-900">{stats.matched || stats.total}</p>
                    <p className="text-xs text-green-700">Matched for You</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900">{stats.government}</p>
                    <p className="text-xs text-purple-700">Government</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <FaClock className="text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-orange-900">{stats.expiringSoon}</p>
                    <p className="text-xs text-orange-700">Expiring Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Match Toggle */}
            <button
              onClick={() => setShowMatchOnly(!showMatchOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showMatchOnly
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaCheckCircle className="inline mr-2" />
              Best Match for Me
            </button>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaFilter />
              Filters
            </button>

            {/* Tabs */}
            <div className="flex gap-2 ml-auto">
              {[
                { key: 'all', label: 'All', icon: FaAward },
                { key: 'government', label: 'Government', icon: FaGraduationCap },
                { key: 'private', label: 'Private', icon: FaUsers },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200">
                  {/* Education Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaGraduationCap className="inline mr-2" />
                      Education Level
                    </label>
                    <select
                      value={filters.educationLevel}
                      onChange={(e) => setFilters({...filters, educationLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Levels</option>
                      {educationLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2" />
                      State
                    </label>
                    <select
                      value={filters.state}
                      onChange={(e) => setFilters({...filters, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All States</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUsers className="inline mr-2" />
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setFilters({ educationLevel: '', state: '', category: '' })
                      setShowFilters(false)
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-md"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 bg-gray-200 rounded mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredScholarships.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-gray-200/50 text-center"
          >
            <FaAward className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Scholarships Found
            </h3>
            <p className="text-gray-600 mb-4">
              {showMatchOnly
                ? "No scholarships match your profile. Try updating your profile or turning off 'Best Match' filter."
                : "No scholarships available for the selected filters. Try adjusting your criteria or check back later."}
            </p>
            {showMatchOnly && (
              <button
                onClick={() => setShowMatchOnly(false)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                View All Scholarships
              </button>
            )}
          </motion.div>
        ) : (
          /* Scholarship Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((scholarship, index) => (
              <ScholarshipCard
                key={scholarship._id || index}
                scholarship={scholarship}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Scholarship Card Component
const ScholarshipCard = ({ scholarship, index }) => {
  // Calculate daysUntilDeadline if not present
  let daysUntilDeadline = scholarship.daysUntilDeadline;
  
  if (daysUntilDeadline === undefined && scholarship.deadlines?.endDate) {
    const now = new Date();
    const deadline = new Date(scholarship.deadlines.endDate);
    const diffTime = deadline - now;
    daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Handle undefined or null
  if (daysUntilDeadline === undefined || daysUntilDeadline === null) {
    daysUntilDeadline = scholarship.deadlines?.isRolling ? 999 : null;
  }
  
  const deadlineStatus = getDeadlineStatus(daysUntilDeadline)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Card Header */}
      <div className={`p-4 ${
        scholarship.type === 'government'
          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
          : 'bg-gradient-to-r from-green-500 to-teal-500'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              {scholarship.name}
            </h3>
            <p className="text-white/90 text-sm flex items-center gap-1">
              <FaAward className="text-xs" />
              {scholarship.provider}
            </p>
          </div>
          <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
            {scholarship.type === 'government' ? '🏛️ Govt' : '🏢 Private'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Match Score */}
        {scholarship.matchScore !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  scholarship.matchScore >= 80
                    ? 'bg-green-500'
                    : scholarship.matchScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
                }`}
                style={{ width: `${scholarship.matchScore}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {scholarship.matchScore}% Match
            </span>
          </div>
        )}

        {/* Benefits */}
        <div className="flex items-center gap-2 text-gray-700">
          <FaMoneyBillWave className="text-green-600" />
          <span className="font-medium">{scholarship.benefits?.amount || 'Not specified'}</span>
        </div>

        {/* Eligibility Summary */}
        <div className="text-sm text-gray-600 space-y-1">
          {scholarship.eligibility?.educationLevel && scholarship.eligibility.educationLevel.length > 0 && (
            <p className="flex items-center gap-2">
              <FaGraduationCap className="text-primary-600 flex-shrink-0" />
              <span className="line-clamp-1">
                {scholarship.eligibility.educationLevel.join(', ')}
              </span>
            </p>
          )}
          
          {scholarship.eligibility?.incomeLimit && (
            <p className="flex items-center gap-2">
              <FaRupeeSign className="text-green-600 flex-shrink-0" />
              <span>Income limit: ₹{scholarship.eligibility.incomeLimit.toLocaleString()}/year</span>
            </p>
          )}
        </div>

        {/* Deadline */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${deadlineStatus.bg}`}>
          <FaClock className={deadlineStatus.color} />
          <span className={`text-sm font-medium ${deadlineStatus.color}`}>
            {deadlineStatus.text}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <a
            href={scholarship.applicationDetails?.applyLink || scholarship.applyLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              const link = scholarship.applicationDetails?.applyLink || scholarship.applyLink
              if (!link || link === '#') {
                e.preventDefault()
                alert('Application link not available for this scholarship. Please search for the official website.')
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:shadow-md transition-all font-medium text-sm ${
              scholarship.applicationDetails?.applyLink || scholarship.applyLink
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {scholarship.applicationDetails?.applyLink || scholarship.applyLink ? (
              <>
                Apply Now
                <FaExternalLinkAlt className="text-xs" />
              </>
            ) : (
              'Link Not Available'
            )}
          </a>
          <button 
            onClick={() => {
              alert(`Scholarship: ${scholarship.name}\n\nProvider: ${scholarship.provider}\n\nAmount: ${scholarship.benefits?.amount || 'Not specified'}\n\nEligibility:\n- Education: ${(scholarship.eligibility?.educationLevel || []).join(', ') || 'Not specified'}\n- Category: ${scholarship.eligibility?.category || 'Not specified'}\n- Income Limit: ${scholarship.eligibility?.incomeLimit ? '₹' + scholarship.eligibility.incomeLimit.toLocaleString() : 'Not specified'}\n\n${scholarship.description || ''}`)
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="View Details"
          >
            <FaInfoCircle />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Helper function
function getDeadlineStatus(daysUntilDeadline) {
  // Handle undefined, null, or non-numeric values
  if (daysUntilDeadline === undefined || daysUntilDeadline === null || isNaN(daysUntilDeadline)) {
    return { text: 'No deadline info', color: 'text-gray-600', bg: 'bg-gray-50' }
  }
  
  if (daysUntilDeadline === 999) {
    return { text: 'Rolling Admissions', color: 'text-blue-600', bg: 'bg-blue-50' }
  }
  
  if (daysUntilDeadline < 0) {
    return { text: 'Expired', color: 'text-red-600', bg: 'bg-red-50' }
  }
  
  if (daysUntilDeadline <= 30) {
    return { text: `${daysUntilDeadline} days left`, color: 'text-orange-600', bg: 'bg-orange-50' }
  }
  
  return { text: `${daysUntilDeadline} days left`, color: 'text-green-600', bg: 'bg-green-50' }
}

export default ScholarshipsPage
