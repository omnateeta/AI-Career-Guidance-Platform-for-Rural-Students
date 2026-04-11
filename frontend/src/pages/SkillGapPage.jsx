import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCheck, FaTimes, FaLightbulb, FaBook, FaVideo, FaCertificate } from 'react-icons/fa'

const SkillGapPage = () => {
  const targetCareer = 'Software Engineer'
  
  const skillsData = [
    { name: 'JavaScript', current: 75, required: 90, priority: 'high' },
    { name: 'React', current: 60, required: 85, priority: 'high' },
    { name: 'Node.js', current: 40, required: 75, priority: 'medium' },
    { name: 'Python', current: 50, required: 70, priority: 'medium' },
    { name: 'SQL', current: 65, required: 75, priority: 'low' },
    { name: 'Git', current: 55, required: 80, priority: 'medium' },
    { name: 'TypeScript', current: 30, required: 70, priority: 'high' },
    { name: 'Docker', current: 20, required: 60, priority: 'low' },
  ]

  const missingSkills = [
    {
      name: 'TypeScript',
      priority: 'high',
      time: '2-3 weeks',
      resources: [
        { title: 'TypeScript Full Course', type: 'video', platform: 'YouTube', url: '#', free: true },
        { title: 'Official TypeScript Handbook', type: 'article', platform: 'typescriptlang.org', url: '#', free: true },
      ],
    },
    {
      name: 'React Advanced Patterns',
      priority: 'high',
      time: '3-4 weeks',
      resources: [
        { title: 'React Patterns', type: 'course', platform: 'freeCodeCamp', url: '#', free: true },
        { title: 'Advanced React', type: 'video', platform: 'YouTube', url: '#', free: true },
      ],
    },
    {
      name: 'Node.js & Express',
      priority: 'medium',
      time: '4-5 weeks',
      resources: [
        { title: 'Node.js Tutorial', type: 'course', platform: 'Coursera', url: '#', free: false },
        { title: 'Express.js Guide', type: 'article', platform: 'expressjs.com', url: '#', free: true },
      ],
    },
    {
      name: 'Docker Basics',
      priority: 'low',
      time: '1-2 weeks',
      resources: [
        { title: 'Docker for Beginners', type: 'video', platform: 'YouTube', url: '#', free: true },
        { title: 'Docker Documentation', type: 'article', platform: 'docker.com', url: '#', free: true },
      ],
    },
  ]

  const overallMatch = 58

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
        <h1 className="text-4xl font-bold text-gradient mb-2">Skill Gap Analysis 📊</h1>
        <p className="text-gray-600 text-lg">Compare your current skills with industry requirements for <span className="font-semibold text-primary-600">{targetCareer}</span></p>
      </motion.div>

      {/* Overall Match */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 mb-8 bg-gradient-to-r from-primary-50 to-secondary-50"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Overall Skill Match</h2>
          <div className="text-6xl font-bold text-gradient mb-2">{overallMatch}%</div>
          <p className="text-gray-600">You're on the right track! Keep learning to close the gap.</p>
          <div className="w-full max-w-md mx-auto mt-4 bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-primary-600 to-secondary-600 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${overallMatch}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Skills Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Skills Breakdown</h2>
        <div className="glass-card rounded-2xl p-6">
          <div className="space-y-4">
            {skillsData.map((skill, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                    {skill.current >= skill.required ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    skill.priority === 'high' ? 'bg-red-100 text-red-700' :
                    skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {skill.priority} priority
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Your Level</span>
                      <span className="text-xs font-bold text-primary-600">{skill.current}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${skill.current}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Required</span>
                      <span className="text-xs font-bold text-secondary-600">{skill.required}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-secondary-600 h-2 rounded-full"
                        style={{ width: `${skill.required}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Missing Skills with Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <FaLightbulb className="text-yellow-500" />
          <span>Recommended Learning Path</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {missingSkills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass-card rounded-2xl p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{skill.name}</h3>
                  <p className="text-sm text-gray-600">Estimated time: {skill.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  skill.priority === 'high' ? 'bg-red-100 text-red-700' :
                  skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {skill.priority}
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Learning Resources:</h4>
                {skill.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      {resource.type === 'video' && <FaVideo className="text-red-500" />}
                      {resource.type === 'course' && <FaBook className="text-blue-500" />}
                      {resource.type === 'article' && <FaBook className="text-green-500" />}
                      {resource.type === 'certification' && <FaCertificate className="text-purple-500" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{resource.title}</p>
                        <p className="text-xs text-gray-600">{resource.platform}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      resource.free ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {resource.free ? 'Free' : 'Paid'}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card rounded-2xl p-8 text-center bg-gradient-to-r from-primary-50 to-secondary-50"
      >
        <h3 className="text-2xl font-bold mb-2">🎯 Ready to Close the Gap?</h3>
        <p className="text-gray-600 mb-4">Start learning with personalized recommendations</p>
        <Link
          to="/learning"
          className="inline-block px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
        >
          Generate Learning Path
        </Link>
      </motion.div>
    </div>
  )
}

export default SkillGapPage
