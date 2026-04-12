const Job = require('../models/JobListing');
const Scholarship = require('../models/Scholarship');
const Exam = require('../models/Exam');
const logger = require('../config/logger');

// GET /api/notifications - Get aggregated real-time notifications
const getNotifications = async (req, res) => {
  try {
    console.log('📢 Fetching real-time notifications...');

    const notifications = [];

    // Fetch latest jobs
    try {
      const jobs = await Job.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      jobs.forEach(job => {
        const location = job.location ? ` in ${job.location}` : '';
        const type = job.type ? ` (${job.type})` : '';
        notifications.push({
          id: `job_${job._id}`,
          type: 'job',
          icon: '🔥',
          text: `${job.title}${location}${type} - Apply Now`,
          priority: job.isGovernment ? 1 : 2,
          timestamp: job.createdAt,
          link: `/jobs/${job._id}`,
        });
      });
    } catch (error) {
      logger.warn(`Failed to fetch jobs for notifications: ${error.message}`);
    }

    // Fetch latest scholarships
    try {
      const scholarships = await Scholarship.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      scholarships.forEach(scholarship => {
        const deadline = scholarship.deadline 
          ? ` - Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}`
          : '';
        notifications.push({
          id: `scholarship_${scholarship._id}`,
          type: 'scholarship',
          icon: '🎓',
          text: `${scholarship.name}${deadline}`,
          priority: 1,
          timestamp: scholarship.createdAt,
          link: `/scholarships/${scholarship._id}`,
        });
      });
    } catch (error) {
      logger.warn(`Failed to fetch scholarships for notifications: ${error.message}`);
    }

    // Fetch latest exams
    try {
      const exams = await Exam.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      exams.forEach(exam => {
        const deadline = exam.applicationDeadline
          ? ` - Apply by ${new Date(exam.applicationDeadline).toLocaleDateString()}`
          : '';
        notifications.push({
          id: `exam_${exam._id}`,
          type: 'exam',
          icon: '📢',
          text: `${exam.name} by ${exam.conductingBody}${deadline}`,
          priority: 1,
          timestamp: exam.createdAt,
          link: `/exams/${exam._id}`,
        });
      });
    } catch (error) {
      logger.warn(`Failed to fetch exams for notifications: ${error.message}`);
    }

    // Sort by priority and timestamp
    notifications.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // Take top 15 notifications
    const topNotifications = notifications.slice(0, 15);

    console.log(`✅ Generated ${topNotifications.length} notifications`);

    res.json({
      success: true,
      count: topNotifications.length,
      notifications: topNotifications,
    });
  } catch (error) {
    logger.error(`Error in getNotifications: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
};
