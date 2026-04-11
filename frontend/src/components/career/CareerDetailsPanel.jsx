import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaTimes, FaVolumeUp, FaGraduationCap, FaToolbox, FaMoneyBillWave, FaChartLine, FaBriefcase, FaBook } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const CareerDetailsPanel = ({ node, onClose, onSpeak }) => {
  const { token } = useContext(AuthContext);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (node && node.nodeId) {
      fetchCareerDetails();
    }
  }, [node?.nodeId, language]);

  const fetchCareerDetails = async () => {
    if (!node?.nodeId) {
      setError('Invalid node data');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First, try to get from backend API
      const response = await axios.get(`/api/career/career-details/${node.nodeId}`, {
        params: { language },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setDetails(response.data.data.details);
      } else {
        // Fallback to node metadata if API fails
        generateDetailsFromNode();
      }
    } catch (error) {
      console.error('Error fetching career details:', error);
      // Fallback to node metadata
      generateDetailsFromNode();
    } finally {
      setLoading(false);
    }
  };

  const generateDetailsFromNode = () => {
    // Generate details from available node data
    const generatedDetails = {
      detailedDescription: node.description || 'No description available',
      educationPath: node.metadata?.educationPath || [],
      requiredSkills: node.metadata?.skills?.slice(0, 5) || [],
      softSkills: ['Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability'],
      technicalSkills: node.metadata?.skills || [],
      salaryRange: node.metadata?.averageSalary || { entry: 'N/A', mid: 'N/A', senior: 'N/A' },
      growthOpportunities: node.metadata?.growthOpportunities || [],
      topRecruiters: node.metadata?.topRecruiters || [],
      workEnvironment: 'Professional work environment with opportunities for growth',
      futureOutlook: node.metadata?.futureOutlook || 'Positive growth trajectory',
      relatedCareers: [],
      recommendedCourses: [],
      governmentExams: node.metadata?.governmentExams || []
    };
    
    setDetails(generatedDetails);
  };

  const handleSpeak = (text) => {
    if (onSpeak) {
      onSpeak(text);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{node.label}</h2>
          <div className="flex items-center space-x-2">
            {details && (
              <button
                onClick={() => handleSpeak(details.detailedDescription)}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Listen to explanation"
              >
                <FaVolumeUp />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mt-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading career details...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-gray-800 font-semibold text-lg mb-2">Error Loading Details</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchCareerDetails()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : details ? (
          <>
            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{details.detailedDescription}</p>
            </div>

            {/* Education Path */}
            {details.educationPath && details.educationPath.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FaGraduationCap className="mr-2 text-primary-600" />
                  Education Path
                </h3>
                <div className="space-y-2">
                  {details.educationPath.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {(details.requiredSkills || details.technicalSkills || details.softSkills) && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  🎯 Required Skills
                </h3>
                
                {details.technicalSkills && details.technicalSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Technical Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {details.technicalSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {details.softSkills && details.softSkills.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Soft Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {details.softSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Salary Range */}
            {details.salaryRange && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-green-600" />
                  Salary Range
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(details.salaryRange).map(([level, amount]) => (
                    <div
                      key={level}
                      className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200"
                    >
                      <p className="text-xs text-gray-600 capitalize">{level}</p>
                      <p className="text-lg font-bold text-green-700">{amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Opportunities */}
            {details.growthOpportunities && details.growthOpportunities.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FaChartLine className="mr-2 text-blue-600" />
                  Growth Opportunities
                </h3>
                <ul className="space-y-2">
                  {details.growthOpportunities.map((opp, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">▸</span>
                      <span className="text-sm text-gray-700">{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top Recruiters */}
            {details.topRecruiters && details.topRecruiters.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FaBriefcase className="mr-2 text-orange-600" />
                  Top Recruiters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {details.topRecruiters.map((company, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Courses */}
            {details.recommendedCourses && details.recommendedCourses.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FaBook className="mr-2 text-indigo-600" />
                  Recommended Courses
                </h3>
                <ul className="space-y-2">
                  {details.recommendedCourses.map((course, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-indigo-600 mt-1">▸</span>
                      <span className="text-sm text-gray-700">{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Future Outlook */}
            {details.futureOutlook && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 Future Outlook</h3>
                <p className="text-sm text-gray-700">{details.futureOutlook}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <p className="text-gray-600 font-medium">No details available</p>
            <p className="text-sm text-gray-500 mt-2">Try refreshing or selecting another career</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CareerDetailsPanel;
