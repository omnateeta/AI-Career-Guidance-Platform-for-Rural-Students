import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle, FaCircle, FaBook, FaVideo, FaClock, FaTrophy } from 'react-icons/fa'

const LearningPathPage = () => {
  const learningPath = {
    career: 'Software Engineer',
    title: 'Complete Software Engineering Roadmap',
    duration: '6 months',
    progress: 35,
    steps: [
      {
        stepNumber: 1,
        title: 'HTML & CSS Fundamentals',
        type: 'course',
        duration: '2 weeks',
        skills: ['HTML5', 'CSS3', 'Responsive Design'],
        completed: true,
        resources: [
          { title: 'HTML Full Course', platform: 'freeCodeCamp', type: 'video', duration: '2 hours', free: true },
          { title: 'CSS Crash Course', platform: 'Traversy Media', type: 'video', duration: '1.5 hours', free: true },
        ],
      },
      {
        stepNumber: 2,
        title: 'JavaScript Mastery',
        type: 'course',
        duration: '4 weeks',
        skills: ['ES6+', 'DOM', 'Async/Await'],
        completed: true,
        resources: [
          { title: 'JavaScript Algorithms', platform: 'freeCodeCamp', type: 'course', duration: '300 hours', free: true },
          { title: 'JS Info', platform: 'javascript.info', type: 'article', duration: 'Self-paced', free: true },
        ],
      },
      {
        stepNumber: 3,
        title: 'React.js Deep Dive',
        type: 'course',
        duration: '6 weeks',
        skills: ['Components', 'Hooks', 'State Management'],
        completed: false,
        current: true,
        resources: [
          { title: 'React Official Tutorial', platform: 'react.dev', type: 'course', duration: 'Self-paced', free: true },
          { title: 'React Course 2024', platform: 'YouTube', type: 'video', duration: '8 hours', free: true },
        ],
      },
      {
        stepNumber: 4,
        title: 'Backend with Node.js',
        type: 'course',
        duration: '6 weeks',
        skills: ['Express', 'REST APIs', 'MongoDB'],
        completed: false,
        resources: [
          { title: 'Node.js & Express', platform: 'Coursera', type: 'course', duration: '6 weeks', free: false },
          { title: 'Node.js Tutorial', platform: 'YouTube', type: 'video', duration: '5 hours', free: true },
        ],
      },
      {
        stepNumber: 5,
        title: 'TypeScript Essentials',
        type: 'course',
        duration: '3 weeks',
        skills: ['Types', 'Interfaces', 'Generics'],
        completed: false,
        resources: [
          { title: 'TypeScript Full Course', platform: 'YouTube', type: 'video', duration: '4 hours', free: true },
        ],
      },
      {
        stepNumber: 6,
        title: 'Build Portfolio Projects',
        type: 'project',
        duration: '4 weeks',
        skills: ['Real-world Apps', 'Git', 'Deployment'],
        completed: false,
        resources: [
          { title: 'Project Ideas', platform: 'GitHub', type: 'article', duration: 'Self-paced', free: true },
        ],
      },
    ],
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
        <h1 className="text-4xl font-bold text-gradient mb-2">Your Learning Path 📚</h1>
        <p className="text-gray-600 text-lg">Personalized roadmap to become a <span className="font-semibold text-primary-600">{learningPath.career}</span></p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 mb-8 bg-gradient-to-r from-primary-50 to-secondary-50"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Overall Progress</h3>
            <div className="text-4xl font-bold text-gradient">{learningPath.progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className="bg-gradient-to-r from-primary-600 to-secondary-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${learningPath.progress}%` }}
              ></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Duration</h3>
            <div className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <FaClock className="text-primary-600" />
              <span>{learningPath.duration}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Steps Completed</h3>
            <div className="text-2xl font-bold text-gray-900">
              {learningPath.steps.filter(s => s.completed).length} / {learningPath.steps.length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Learning Steps */}
      <div className="space-y-6">
        {learningPath.steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card rounded-2xl p-6 card-hover ${
              step.current ? 'border-2 border-primary-500' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Step Indicator */}
              <div className="flex-shrink-0">
                {step.completed ? (
                  <FaCheckCircle className="w-10 h-10 text-green-500" />
                ) : step.current ? (
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                    {step.stepNumber}
                  </div>
                ) : (
                  <FaCircle className="w-10 h-10 text-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <FaClock />
                        <span>{step.duration}</span>
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {step.type}
                      </span>
                      {step.current && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold animate-pulse">
                          Current Step
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {step.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Resources */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <FaBook className="text-primary-600" />
                    <span>Recommended Resources:</span>
                  </h4>
                  {step.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        {resource.type === 'video' && <FaVideo className="text-red-500" />}
                        {resource.type === 'course' && <FaBook className="text-blue-500" />}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{resource.title}</p>
                          <p className="text-xs text-gray-600">{resource.platform} • {resource.duration}</p>
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

                {/* Action Button */}
                {!step.completed && (
                  <button className="mt-4 px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2">
                    <FaTrophy className="w-4 h-4" />
                    <span>{step.completed ? 'Completed ✓' : step.current ? 'Continue Learning' : 'Start Step'}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivational Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 glass-card rounded-2xl p-8 text-center bg-gradient-to-r from-green-50 to-blue-50"
      >
        <h3 className="text-2xl font-bold mb-2">🎯 Keep Going!</h3>
        <p className="text-gray-600">
          You're making great progress. Complete one step at a time and you'll reach your goal!
        </p>
      </motion.div>
    </div>
  )
}

export default LearningPathPage
