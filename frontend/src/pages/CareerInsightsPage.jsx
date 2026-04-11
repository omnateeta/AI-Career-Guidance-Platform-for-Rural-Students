import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaChartLine, FaDollarSign, FaBriefcase, FaGraduationCap } from 'react-icons/fa'

const CareerInsightsPage = () => {
  const careers = [
    {
      title: 'Software Engineer',
      match: 92,
      salary: { entry: '₹4-6 LPA', mid: '₹10-15 LPA', senior: '₹20-30 LPA' },
      growth: 'Growing',
      demand: 'Very High',
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
      education: 'Bachelor\'s in Computer Science or related field',
      description: 'Design, develop, and maintain software applications and systems.',
    },
    {
      title: 'Data Scientist',
      match: 87,
      salary: { entry: '₹6-8 LPA', mid: '₹12-18 LPA', senior: '₹25-40 LPA' },
      growth: 'Growing',
      demand: 'Very High',
      skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow'],
      education: 'Bachelor\'s/Master\'s in Data Science, Statistics, or related field',
      description: 'Analyze complex data to help organizations make better decisions.',
    },
    {
      title: 'Digital Marketing Manager',
      match: 78,
      salary: { entry: '₹3-5 LPA', mid: '₹7-12 LPA', senior: '₹15-25 LPA' },
      growth: 'Stable',
      demand: 'High',
      skills: ['SEO', 'Social Media', 'Google Analytics', 'Content Strategy', 'Email Marketing'],
      education: 'Bachelor\'s in Marketing, Communications, or related field',
      description: 'Plan and execute marketing campaigns across digital channels.',
    },
    {
      title: 'UI/UX Designer',
      match: 85,
      salary: { entry: '₹3-5 LPA', mid: '₹8-12 LPA', senior: '₹15-22 LPA' },
      growth: 'Growing',
      demand: 'High',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
      education: 'Bachelor\'s in Design, HCI, or related field',
      description: 'Create intuitive and beautiful user interfaces and experiences.',
    },
    {
      title: 'Cloud Architect',
      match: 73,
      salary: { entry: '₹8-10 LPA', mid: '₹15-20 LPA', senior: '₹25-35 LPA' },
      growth: 'Growing',
      demand: 'Very High',
      skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'DevOps'],
      education: 'Bachelor\'s in Computer Science + Cloud Certifications',
      description: 'Design and manage cloud infrastructure and services.',
    },
    {
      title: 'Cybersecurity Analyst',
      match: 68,
      salary: { entry: '₹4-6 LPA', mid: '₹9-14 LPA', senior: '₹18-28 LPA' },
      growth: 'Growing',
      demand: 'Very High',
      skills: ['Network Security', 'Penetration Testing', 'SIEM', 'Risk Assessment', 'Compliance'],
      education: 'Bachelor\'s in Cybersecurity, IT, or related field',
      description: 'Protect organizations from cyber threats and vulnerabilities.',
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
        <h1 className="text-4xl font-bold text-gradient mb-2">Career Insights 🔍</h1>
        <p className="text-gray-600 text-lg">Explore career paths tailored to your skills and interests</p>
      </motion.div>

      {/* Career Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careers.map((career, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{career.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                career.growth === 'Growing' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {career.growth}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{career.description}</p>

            {/* Match Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Your Match</span>
                <span className="text-sm font-bold text-primary-600">{career.match}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${career.match}%` }}
                ></div>
              </div>
            </div>

            {/* Salary Info */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FaDollarSign className="text-green-600" />
                <span className="text-sm font-semibold">Salary Range</span>
              </div>
              <div className="text-xs text-gray-700 space-y-1">
                <div>Entry: {career.salary.entry}</div>
                <div>Mid: {career.salary.mid}</div>
                <div>Senior: {career.salary.senior}</div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaBriefcase className="text-primary-600" />
                <span className="text-sm font-semibold">Key Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {career.skills.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {career.skills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{career.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <FaGraduationCap className="text-purple-600" />
                <span className="text-xs text-gray-700">{career.education}</span>
              </div>
            </div>

            {/* Action Button */}
            <Link
              to="/skills"
              className="block w-full text-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Analyze Skill Gap
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-12 glass-card rounded-2xl p-8 bg-gradient-to-r from-primary-50 to-secondary-50"
      >
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <FaChartLine className="w-12 h-12 text-primary-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gradient">500+</h3>
            <p className="text-gray-600">Career Paths Available</p>
          </div>
          <div>
            <FaDollarSign className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gradient">Real-Time</h3>
            <p className="text-gray-600">Salary Insights</p>
          </div>
          <div>
            <FaBriefcase className="w-12 h-12 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gradient">10K+</h3>
            <p className="text-gray-600">Active Job Listings</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CareerInsightsPage
