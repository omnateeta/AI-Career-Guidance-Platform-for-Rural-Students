import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import CareerInsightsPage from './pages/CareerInsightsPage'
import SkillGapPage from './pages/SkillGapPage'
import LearningPathPage from './pages/LearningPathPage'
import JobFeedPage from './pages/JobFeedPage'
import MentorConnectPage from './pages/MentorConnectPage'
import ChatbotPage from './pages/ChatbotPage'
import CareerDiscoveryQuiz from './pages/CareerDiscoveryQuiz'
import ProfilePage from './pages/ProfilePage'
import ProfileEditPage from './pages/ProfileEditPage'
import CareerGuidanceFlow from './pages/CareerGuidanceFlow'
import CommunicationAssistPage from './pages/CommunicationAssistPage'
import ScholarshipsPage from './pages/ScholarshipsPage'
import NearbyCollegesPage from './pages/NearbyCollegesPage'
import JoinAsMentorPage from './pages/JoinAsMentorPage'
import CompetitiveExamsPage from './pages/CompetitiveExamsPage'
import ExamDetailPage from './pages/ExamDetailPage'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {user && <Navbar />}
      <main className={user ? 'pt-28 md:pt-32' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} 
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/career-quiz" element={<CareerDiscoveryQuiz />} />
            <Route path="/careers" element={<CareerInsightsPage />} />
            <Route path="/skills" element={<SkillGapPage />} />
            <Route path="/learning" element={<LearningPathPage />} />
            <Route path="/jobs" element={<JobFeedPage />} />
            <Route path="/exams" element={<CompetitiveExamsPage />} />
            <Route path="/exams/:examId" element={<ExamDetailPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/colleges" element={<NearbyCollegesPage />} />
            <Route path="/mentors" element={<MentorConnectPage />} />
            <Route path="/mentors/apply" element={<JoinAsMentorPage />} />
            <Route path="/communicate" element={<CommunicationAssistPage />} />
            <Route path="/chat" element={<ChatbotPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/career-guidance" element={<CareerGuidanceFlow />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
