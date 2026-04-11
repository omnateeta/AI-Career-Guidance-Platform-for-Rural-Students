import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { FaRocket, FaBrain, FaGlobe, FaChartLine, FaUsers, FaMobileAlt } from 'react-icons/fa'

const LandingPage = () => {
  const { t } = useLanguage()

  const features = [
    {
      icon: FaBrain,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized career suggestions based on your interests, skills, and market trends',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: FaChartLine,
      title: 'Real-Time Job Insights',
      description: 'Access live job market data and trending careers in your region',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FaGlobe,
      title: 'Multi-Language Support',
      description: 'Learn in your preferred language with support for regional languages',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: FaUsers,
      title: 'Mentor Connection',
      description: 'Connect with experienced professionals who guide your career journey',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: FaMobileAlt,
      title: 'Works Everywhere',
      description: 'Optimized for low bandwidth areas with offline capabilities',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: FaRocket,
      title: 'Skill Development',
      description: 'Get personalized learning paths with real courses and certifications',
      gradient: 'from-pink-500 to-rose-500',
    },
  ]

  const stats = [
    { value: '50K+', label: 'Students Helped' },
    { value: '500+', label: 'Career Paths' },
    { value: '1000+', label: 'Learning Resources' },
    { value: '200+', label: 'Expert Mentors' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-shadow-lg"
            >
              {t('welcome')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-white/90"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register" className="btn-gradient bg-white text-primary-600 hover:bg-gray-100">
                {t('getStarted')} →
              </Link>
              <Link to="/login" className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all duration-300 font-semibold">
                {t('login')}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L48 10C96 20 192 40 288 53.3C384 67 480 73 576 70C672 67 768 53 864 46.7C960 40 1056 40 1152 46.7C1248 53 1344 67 1392 73.3L1440 80V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V0Z" fill="url(#paint0_linear)" />
            <defs>
              <linearGradient id="paint0_linear" x1="720" y1="0" x2="720" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F8FAFC" />
                <stop offset="1" stopColor="#F1F5F9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center glass-card rounded-xl p-6"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to discover, plan, and achieve your career goals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-8 card-hover group"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Shape Your Future?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of rural students who are already discovering their dream careers with AI guidance
            </p>
            <Link to="/register" className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Your Journey Today 🚀
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 Margdarshak AI. Empowering rural students worldwide.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
