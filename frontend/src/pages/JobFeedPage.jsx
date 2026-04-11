import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaMapMarkerAlt, FaRupeeSign, FaClock, FaBookmark, FaExternalLinkAlt, FaSearch, FaFilter } from 'react-icons/fa'

const JobFeedPage = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)

  // Demo jobs data (fallback when API is not available)
  const demoJobs = [
    {
      id: 'job1',
      title: 'Junior Software Developer',
      company: 'TCS (Tata Consultancy Services)',
      location: 'Bangalore, Karnataka',
      type: 'Full-time',
      experience: 'Entry Level (0-2 years)',
      salary: { min: 3.5, max: 6 },
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      posted: '2 hours ago',
      remote: false,
      urgent: true,
      description: 'Join India\'s leading IT company. Work on cutting-edge projects with modern technologies.',
      applyUrl: '#',
    },
    {
      id: 'job2',
      title: 'Data Analyst - Work From Home',
      company: 'Infosys',
      location: 'Remote (Pune, Maharashtra)',
      type: 'Full-time',
      experience: 'Entry Level (0-1 years)',
      salary: { min: 4, max: 7 },
      skills: ['Python', 'SQL', 'Excel', 'Power BI'],
      posted: '5 hours ago',
      remote: true,
      urgent: false,
      description: 'Remote position available. Analyze business data and create insightful reports.',
      applyUrl: '#',
    },
    {
      id: 'job3',
      title: 'Web Developer Intern',
      company: 'Wipro Technologies',
      location: 'Hyderabad, Telangana',
      type: 'Internship',
      experience: 'Internship',
      salary: { min: 15, max: 25 },
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      posted: '1 day ago',
      remote: false,
      urgent: false,
      description: '3-month paid internship with opportunity for full-time conversion.',
      applyUrl: '#',
    },
    {
      id: 'job4',
      title: 'Python Developer',
      company: 'Cognizant',
      location: 'Chennai, Tamil Nadu',
      type: 'Full-time',
      experience: '0-2 years',
      salary: { min: 4.5, max: 8 },
      skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
      posted: '1 day ago',
      remote: true,
      urgent: true,
      description: 'Build scalable backend systems using Python and modern frameworks.',
      applyUrl: '#',
    },
    {
      id: 'job5',
      title: 'Digital Marketing Executive',
      company: 'Flipkart',
      location: 'Mumbai, Maharashtra',
      type: 'Full-time',
      experience: 'Entry Level',
      salary: { min: 3, max: 5 },
      skills: ['SEO', 'Social Media', 'Google Ads', 'Content Writing'],
      posted: '2 days ago',
      remote: false,
      urgent: false,
      description: 'Drive digital marketing campaigns for India\'s largest e-commerce platform.',
      applyUrl: '#',
    },
    {
      id: 'job6',
      title: 'UI/UX Designer',
      company: 'Zomato',
      location: 'Gurgaon, Haryana',
      type: 'Full-time',
      experience: '1-3 years',
      salary: { min: 6, max: 10 },
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      posted: '3 days ago',
      remote: true,
      urgent: false,
      description: 'Design beautiful and intuitive user interfaces for millions of users.',
      applyUrl: '#',
    },
  ]

  useEffect(() => {
    fetchJobs()
  }, [filter, page])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('No authentication token found')
        setJobs(demoJobs)
        setLoading(false)
        return
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/jobs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()
      
      if (data.success && data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs)
      } else {
        console.log('No jobs from API, using demo data')
        setJobs(demoJobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error.message)
      setError('Using demo data - Backend API not connected')
      // Fallback to demo data if API fails
      setJobs(demoJobs)
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-4xl font-bold text-gradient mb-2">Job Opportunities 💼</h1>
        <p className="text-gray-600 text-lg">Discover real-time job openings tailored to your skills</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title, skills, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchJobs()}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={fetchJobs}
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Search
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-wrap gap-3"
      >
        {['All', 'Full-time', 'Internship', 'Remote', 'Urgent'].map((filterOption, index) => (
          <button
            key={index}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              filter === filterOption
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
        >
          <p className="text-sm text-yellow-800">
            ⚠️ {error}. Showing demo jobs from top Indian companies.
          </p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading real-time jobs...</p>
        </div>
      ) : (
        <>
          {/* Job Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {jobs.length} jobs
          </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-gray-600 font-semibold">{job.company}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaBookmark className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
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
                <span className="text-sm">₹{job.salary.min}-{job.salary.max} LPA</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <FaClock className="text-gray-500" />
                <span className="text-sm">{job.posted}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {job.type}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                {job.experience}
              </span>
              {job.urgent && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  Urgent Hiring
                </span>
              )}
              {job.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center space-x-2">
                <span>Apply Now</span>
                <FaExternalLinkAlt className="w-3 h-3" />
              </button>
              <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold">
                Save
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <button 
          onClick={() => setPage(page + 1)}
          className="px-8 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300 font-semibold"
        >
          Load More Jobs
        </button>
      </motion.div>
        </>
      )}
    </div>
  )
}

export default JobFeedPage
