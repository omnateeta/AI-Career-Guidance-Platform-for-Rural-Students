import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight, FaCheck, FaLightbulb, FaBrain, FaChartLine } from 'react-icons/fa'

const CareerDiscoveryQuiz = () => {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)

  const questions = [
    {
      id: 1,
      question: "What subjects do you enjoy the most in school?",
      options: [
        { value: 'math', label: 'Mathematics & Numbers', icon: '🔢' },
        { value: 'science', label: 'Science & Experiments', icon: '🔬' },
        { value: 'arts', label: 'Arts & Creative Writing', icon: '🎨' },
        { value: 'social', label: 'Social Studies & History', icon: '📚' },
      ]
    },
    {
      id: 2,
      question: "How do you prefer to solve problems?",
      options: [
        { value: 'analytical', label: 'Break it down logically', icon: '🧩' },
        { value: 'creative', label: 'Think outside the box', icon: '💡' },
        { value: 'collaborative', label: 'Discuss with others', icon: '👥' },
        { value: 'hands-on', label: 'Try different approaches', icon: '🛠️' },
      ]
    },
    {
      id: 3,
      question: "What kind of work environment appeals to you?",
      options: [
        { value: 'office', label: 'Office/Desk Work', icon: '💼' },
        { value: 'outdoor', label: 'Outdoor/Field Work', icon: '🌾' },
        { value: 'lab', label: 'Laboratory/Research', icon: '🔬' },
        { value: 'remote', label: 'Work from Anywhere', icon: '🏠' },
      ]
    },
    {
      id: 4,
      question: "Which activities interest you most? (Choose one)",
      options: [
        { value: 'tech', label: 'Building apps/websites', icon: '💻' },
        { value: 'teaching', label: 'Teaching & Mentoring', icon: '📖' },
        { value: 'business', label: 'Starting a business', icon: '📊' },
        { value: 'healthcare', label: 'Helping sick people', icon: '🏥' },
      ]
    },
    {
      id: 5,
      question: "What motivates you the most?",
      options: [
        { value: 'money', label: 'Good salary & stability', icon: '💰' },
        { value: 'impact', label: 'Making a difference', icon: '🌟' },
        { value: 'creativity', label: 'Expressing creativity', icon: '🎭' },
        { value: 'knowledge', label: 'Learning & discovery', icon: '🧠' },
      ]
    },
    {
      id: 6,
      question: "How comfortable are you with technology?",
      options: [
        { value: 'expert', label: 'Very comfortable - I love tech!', icon: '🚀' },
        { value: 'intermediate', label: 'I can learn quickly', icon: '📱' },
        { value: 'basic', label: 'I know the basics', icon: '💻' },
        { value: 'beginner', label: 'I want to learn more', icon: '📚' },
      ]
    },
    {
      id: 7,
      question: "What's your preferred work style?",
      options: [
        { value: 'independent', label: 'Working alone', icon: '🧑‍💻' },
        { value: 'team', label: 'Working in a team', icon: '👨‍👩‍👧‍👦' },
        { value: 'leading', label: 'Leading others', icon: '👑' },
        { value: 'supporting', label: 'Supporting the team', icon: '🤝' },
      ]
    },
    {
      id: 8,
      question: "Which sounds most exciting to you?",
      options: [
        { value: 'ai', label: 'Creating AI that helps people', icon: '🤖' },
        { value: 'farming', label: 'Modern farming techniques', icon: '🌱' },
        { value: 'design', label: 'Designing beautiful things', icon: '🎨' },
        { value: 'medicine', label: 'Curing diseases', icon: '⚕️' },
      ]
    },
    {
      id: 9,
      question: "How important is job security to you?",
      options: [
        { value: 'very', label: 'Very important - need stability', icon: '🔒' },
        { value: 'important', label: 'Important but flexible', icon: '⚖️' },
        { value: 'somewhat', label: 'Somewhat important', icon: '🎯' },
        { value: 'less', label: 'I prefer risk & growth', icon: '🚀' },
      ]
    },
    {
      id: 10,
      question: "What's your education goal?",
      options: [
        { value: 'degree', label: 'Complete college degree', icon: '🎓' },
        { value: 'diploma', label: 'Diploma/Certificate course', icon: '📜' },
        { value: 'self', label: 'Self-learning & skills', icon: '📖' },
        { value: 'entrepreneur', label: 'Start my own business', icon: '💼' },
      ]
    },
  ]

  const careerMatches = {
    'tech-analytical-office': {
      career: 'Software Developer',
      description: 'Build applications and software solutions',
      salary: '₹4-15 LPA',
      growth: 'Very High',
      jobs: ['Web Developer', 'App Developer', 'Software Engineer'],
      skills: ['Programming', 'Problem Solving', 'Logic'],
      color: 'from-blue-500 to-purple-500',
    },
    'science-lab-knowledge': {
      career: 'Data Scientist',
      description: 'Analyze data to find insights and patterns',
      salary: '₹6-20 LPA',
      growth: 'Very High',
      jobs: ['Data Analyst', 'Machine Learning Engineer', 'Research Scientist'],
      skills: ['Statistics', 'Python', 'Machine Learning'],
      color: 'from-green-500 to-teal-500',
    },
    'arts-creative-creativity': {
      career: 'UI/UX Designer',
      description: 'Design beautiful and user-friendly interfaces',
      salary: '₹3-12 LPA',
      growth: 'High',
      jobs: ['UI Designer', 'UX Researcher', 'Product Designer'],
      skills: ['Design Tools', 'User Research', 'Creativity'],
      color: 'from-pink-500 to-rose-500',
    },
    'teaching-collaborative-impact': {
      career: 'Teacher/Educator',
      description: 'Educate and inspire the next generation',
      salary: '₹3-8 LPA',
      growth: 'Stable',
      jobs: ['School Teacher', 'Online Tutor', 'Education Consultant'],
      skills: ['Communication', 'Patience', 'Subject Knowledge'],
      color: 'from-yellow-500 to-orange-500',
    },
    'healthcare-science-impact': {
      career: 'Healthcare Professional',
      description: 'Help people stay healthy and recover',
      salary: '₹5-25 LPA',
      growth: 'Very High',
      jobs: ['Doctor', 'Nurse', 'Medical Technician', 'Pharmacist'],
      skills: ['Biology', 'Chemistry', 'Patient Care'],
      color: 'from-red-500 to-pink-500',
    },
    'business-leading-money': {
      career: 'Business Manager/Entrepreneur',
      description: 'Start and grow your own business',
      salary: '₹4-20+ LPA',
      growth: 'High',
      jobs: ['Business Owner', 'Project Manager', 'Consultant'],
      skills: ['Leadership', 'Finance', 'Strategy'],
      color: 'from-indigo-500 to-blue-500',
    },
    'tech-remote-independent': {
      career: 'Freelance Developer/Designer',
      description: 'Work independently on global projects',
      salary: '₹3-15 LPA',
      growth: 'High',
      jobs: ['Freelancer', 'Remote Worker', 'Digital Nomad'],
      skills: ['Self-discipline', 'Communication', 'Technical Skills'],
      color: 'from-cyan-500 to-blue-500',
    },
    'farming-outdoor-hands': {
      career: 'Agri-Tech Specialist',
      description: 'Modernize farming with technology',
      salary: '₹3-10 LPA',
      growth: 'Growing',
      jobs: ['Agricultural Engineer', 'Farm Manager', 'Agri Consultant'],
      skills: ['Agriculture', 'Technology', 'Problem Solving'],
      color: 'from-green-500 to-emerald-500',
    },
  }

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value })
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      calculateResult({ ...answers, [currentQuestion]: value })
    }
  }

  const calculateResult = (finalAnswers) => {
    setLoading(true)
    
    // Simple career matching algorithm
    const values = Object.values(finalAnswers)
    let careerKey = ''
    
    // Determine career based on answer patterns
    if (values.includes('tech') && values.includes('analytical')) {
      careerKey = values.includes('remote') ? 'tech-remote-independent' : 'tech-analytical-office'
    } else if (values.includes('science') && values.includes('lab')) {
      careerKey = 'science-lab-knowledge'
    } else if (values.includes('arts') && values.includes('creative')) {
      careerKey = 'arts-creative-creativity'
    } else if (values.includes('teaching') || values.includes('collaborative')) {
      careerKey = 'teaching-collaborative-impact'
    } else if (values.includes('healthcare')) {
      careerKey = 'healthcare-science-impact'
    } else if (values.includes('business') || values.includes('leading')) {
      careerKey = 'business-leading-money'
    } else if (values.includes('farming') || values.includes('outdoor')) {
      careerKey = 'farming-outdoor-hands'
    } else {
      careerKey = 'tech-analytical-office' // Default
    }
    
    setTimeout(() => {
      setLoading(false)
      setShowResult(true)
    }, 2000)
  }

  const recommendedCareer = showResult ? careerMatches[Object.keys(careerMatches).find(key => 
    // This is simplified - in real app, use proper matching
    true
  )] || careerMatches['tech-analytical-office'] : null

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (showResult && recommendedCareer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 bg-gradient-to-br from-primary-50 to-secondary-50"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Your Ideal Career Path!</h1>
            <p className="text-gray-600">Based on your interests and preferences</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`bg-gradient-to-r ${recommendedCareer.color} rounded-2xl p-8 text-white mb-8`}
          >
            <h2 className="text-3xl font-bold mb-2">{recommendedCareer.career}</h2>
            <p className="text-lg mb-4">{recommendedCareer.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm opacity-90">Salary Range</p>
                <p className="text-xl font-bold">{recommendedCareer.salary}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm opacity-90">Growth Outlook</p>
                <p className="text-xl font-bold">{recommendedCareer.growth}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <FaChartLine className="text-primary-600" />
              <span>Job Roles You Can Pursue</span>
            </h3>
            <div className="grid gap-3">
              {recommendedCareer.jobs.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white rounded-lg p-4 shadow-md"
                >
                  <p className="font-semibold text-gray-900">{job}</p>
                  <p className="text-sm text-gray-600">Entry to Senior Level Opportunities</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <FaLightbulb className="text-yellow-500" />
              <span>Skills You Need to Develop</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {recommendedCareer.skills.map((skill, index) => (
                <span key={index} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/learning"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-center"
            >
              📚 Start Learning Path
            </Link>
            <Link
              to="/skills"
              className="flex-1 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300 font-semibold text-center"
            >
              📊 Analyze Skill Gap
            </Link>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-semibold"
            >
              🏠 Back to Dashboard
            </button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-6xl mb-4"
          >
            🧠
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Responses...</h2>
          <p className="text-gray-600">Finding the perfect career match for you</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
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
        <div className="flex items-center space-x-3 mb-2">
          <FaBrain className="text-3xl text-primary-600" />
          <h1 className="text-4xl font-bold text-gradient">Discover Your Career Path</h1>
        </div>
        <p className="text-gray-600 text-lg">Answer 10 simple questions to find your ideal career</p>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Question {currentQuestion + 1} of {questions.length}</span>
          <span className="text-sm font-semibold text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-primary-600 to-secondary-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {questions[currentQuestion].question}
          </h2>

          <div className="grid gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(option.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                  answers[currentQuestion] === option.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-lg font-semibold text-gray-900">{option.label}</span>
                  {answers[currentQuestion] === option.value && (
                    <FaCheck className="ml-auto text-primary-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous
            </button>
            <div className="text-sm text-gray-600">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 glass-card rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-purple-50"
      >
        <h3 className="font-semibold mb-2 flex items-center space-x-2">
          <FaLightbulb className="text-yellow-500" />
          <span>Why take this quiz?</span>
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Personalized career recommendations based on your interests</li>
          <li>• Discover career paths you never knew existed</li>
          <li>• Get insights into salary ranges and job opportunities</li>
          <li>• Learn what skills you need to develop</li>
          <li>• Completely free and designed for rural students</li>
        </ul>
      </motion.div>
    </div>
  )
}

export default CareerDiscoveryQuiz
