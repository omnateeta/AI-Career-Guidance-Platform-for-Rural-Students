import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheckCircle, FaCircle, FaBook, FaVideo, 
  FaClock, FaTrophy, FaPlay, FaExternalLinkAlt, FaYoutube,
  FaSpinner, FaStar, FaEye
} from 'react-icons/fa';

const LearningPathPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

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
        youtubeVideos: [
          {
            id: 'qz0aGYrrlhU',
            title: 'HTML & CSS Full Course - Build a Website',
            channel: 'freeCodeCamp',
            views: '15M views',
            duration: '2:03:45',
            rating: 4.9,
            thumbnail: 'https://img.youtube.com/vi/qz0aGYrrlhU/maxresdefault.jpg'
          },
          {
            id: 'mU6anWqZJcc',
            title: 'CSS Full Course - 2024 Edition',
            channel: 'Traversy Media',
            views: '8.5M views',
            duration: '1:32:18',
            rating: 4.8,
            thumbnail: 'https://img.youtube.com/vi/mU6anWqZJcc/maxresdefault.jpg'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'JavaScript Mastery',
        type: 'course',
        duration: '4 weeks',
        skills: ['ES6+', 'DOM', 'Async/Await'],
        completed: true,
        youtubeVideos: [
          {
            id: 'PkZNo7MFNFg',
            title: 'JavaScript Tutorial for Beginners - Full Course',
            channel: 'Programming with Mosh',
            views: '22M views',
            duration: '3:06:23',
            rating: 4.9,
            thumbnail: 'https://img.youtube.com/vi/PkZNo7MFNFg/maxresdefault.jpg'
          },
          {
            id: 'W6NZfCO5SIk',
            title: 'JavaScript Programming - Full Course',
            channel: 'freeCodeCamp',
            views: '12M views',
            duration: '7:45:12',
            rating: 4.9,
            thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg'
          }
        ]
      },
      {
        stepNumber: 3,
        title: 'React.js Deep Dive',
        type: 'course',
        duration: '6 weeks',
        skills: ['Components', 'Hooks', 'State Management'],
        completed: false,
        current: true,
        youtubeVideos: [
          {
            id: 'nJcWLzMq1oU',
            title: 'React Course 2024 - Build 4 Real Projects',
            channel: 'Dave Gray',
            views: '5.2M views',
            duration: '8:15:30',
            rating: 4.9,
            thumbnail: 'https://img.youtube.com/vi/nJcWLzMq1oU/maxresdefault.jpg'
          },
          {
            id: 'SqcY0GlETPk',
            title: 'React Tutorial for Beginners',
            channel: 'Programming with Mosh',
            views: '9.8M views',
            duration: '2:25:44',
            rating: 4.8,
            thumbnail: 'https://img.youtube.com/vi/SqcY0GlETPk/maxresdefault.jpg'
          }
        ]
      },
      {
        stepNumber: 4,
        title: 'Backend with Node.js',
        type: 'course',
        duration: '6 weeks',
        skills: ['Express', 'REST APIs', 'MongoDB'],
        completed: false,
        youtubeVideos: [
          {
            id: 'Oe421EPjeBE',
            title: 'Node.js & Express.js Full Course',
            channel: 'freeCodeCamp',
            views: '7.3M views',
            duration: '8:16:48',
            rating: 4.8,
            thumbnail: 'https://img.youtube.com/vi/Oe421EPjeBE/maxresdefault.jpg'
          },
          {
            id: 'TlB_eWDSMt4',
            title: 'Node.js Tutorial for Beginners',
            channel: 'Programming with Mosh',
            views: '11M views',
            duration: '1:43:28',
            rating: 4.9,
            thumbnail: 'https://img.youtube.com/vi/TlB_eWDSMt4/maxresdefault.jpg'
          }
        ]
      },
      {
        stepNumber: 5,
        title: 'TypeScript Essentials',
        type: 'course',
        duration: '3 weeks',
        skills: ['Types', 'Interfaces', 'Generics'],
        completed: false,
        youtubeVideos: [
          {
            id: 'BCg4U1Fz2s8',
            title: 'TypeScript Course for Beginners 2024',
            channel: 'Programming with Mosh',
            views: '4.5M views',
            duration: '1:58:32',
            rating: 4.8,
            thumbnail: 'https://img.youtube.com/vi/BCg4U1Fz2s8/maxresdefault.jpg'
          }
        ]
      },
      {
        stepNumber: 6,
        title: 'Build Portfolio Projects',
        type: 'project',
        duration: '4 weeks',
        skills: ['Real-world Apps', 'Git', 'Deployment'],
        completed: false,
        youtubeVideos: [
          {
            id: '85fSjKdEj7o',
            title: 'Build 5 JavaScript Projects for Portfolio',
            channel: 'Web Dev Simplified',
            views: '3.2M views',
            duration: '3:45:20',
            rating: 4.7,
            thumbnail: 'https://img.youtube.com/vi/85fSjKdEj7o/maxresdefault.jpg'
          }
        ]
      },
    ],
  };

  const openVideo = (video) => {
    setVideoLoading(true);
    setSelectedVideo(video);
    setTimeout(() => setVideoLoading(false), 1000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-3">
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Your Learning Path 📚</h1>
        <p className="text-gray-600">
          Personalized roadmap to become a <span className="font-semibold text-primary-600">{learningPath.career}</span>
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 mb-6 bg-gradient-to-r from-primary-50 to-secondary-50"
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

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Video Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedVideo.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedVideo.channel}</p>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Video Player */}
              <div className="relative bg-black aspect-video">
                {videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <FaSpinner className="animate-spin text-5xl text-primary-600" />
                  </div>
                )}
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setVideoLoading(false)}
                />
              </div>

              {/* Video Info */}
              <div className="p-6">
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaEye className="text-gray-600" />
                    <span className="text-sm text-gray-700">{selectedVideo.views}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-500" />
                    <span className="text-sm font-semibold">{selectedVideo.rating}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-gray-600" />
                    <span className="text-sm text-gray-700">{selectedVideo.duration}</span>
                  </div>
                </div>
                
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  <FaYoutube />
                  <span>Watch on YouTube</span>
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
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

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {step.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top YouTube Videos Section */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <FaYoutube className="text-red-600" />
                    <span>Top Free Video Tutorials</span>
                    <span className="text-xs text-gray-500 font-normal">(Most Viewed)</span>
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    {step.youtubeVideos.map((video, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => openVideo(video)}
                      >
                        {/* Video Thumbnail */}
                        <div className="relative rounded-xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                              <FaPlay className="text-white text-2xl ml-1" />
                            </div>
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute bottom-2 right-2 bg-black/90 text-white px-2 py-1 rounded text-xs font-semibold">
                            {video.duration}
                          </div>

                          {/* Top Rated Badge */}
                          {idx === 0 && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
                              <FaStar />
                              <span>#1 Top Rated</span>
                            </div>
                          )}
                        </div>

                        {/* Video Info */}
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {video.title}
                          </h5>
                          <p className="text-sm text-gray-600 mb-2">{video.channel}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <FaEye />
                              <span>{video.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaStar className="text-yellow-500" />
                              <span>{video.rating}</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                {!step.completed && (
                  <button className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2">
                    <FaTrophy className="w-4 h-4" />
                    <span>{step.current ? 'Continue Learning' : 'Start Step'}</span>
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
          You're making great progress. Watch the top-rated videos and complete one step at a time!
        </p>
      </motion.div>
    </div>
  );
};

export default LearningPathPage;
