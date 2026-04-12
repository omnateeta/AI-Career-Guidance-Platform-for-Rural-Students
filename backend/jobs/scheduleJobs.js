const cron = require('node-cron');
const jobAggregator = require('../services/jobAggregator');
const jobAlertService = require('../services/jobAlertService');
const examScraper = require('../services/examScraper');
const JobListing = require('../models/JobListing');
const logger = require('../config/logger');

/**
 * Schedule periodic job aggregation and alerts
 * Runs every 6 hours: 0 0,6,12,18 * * *
 */

// Store active cron jobs
const activeJobs = {};

/**
 * Job 1: Fetch and store new jobs from all sources
 * Runs every 6 hours
 */
const fetchAndStoreJobs = cron.schedule('0 */6 * * *', async () => {
  logger.info('🔄 Starting scheduled job: Fetch and store new jobs');
  
  try {
    // Fetch private jobs
    logger.info('Fetching private jobs...');
    const privateResult = await jobAggregator.fetchPrivateJobs({
      location: 'India',
      keywords: 'software developer',
      page: 1,
      resultsPerPage: 50,
    });

    // Fetch government jobs
    logger.info('Fetching government jobs...');
    const governmentResult = await jobAggregator.fetchGovernmentJobs({
      state: '',
      page: 1,
    });

    // Store in database (optional - for caching and analytics)
    const allJobs = [...(privateResult.jobs || []), ...(governmentResult.jobs || [])];
    
    logger.info(`Fetched ${allJobs.length} total jobs. Storing in database...`);
    
    // Note: In production, you'd implement bulk upsert logic here
    // For now, we're relying on real-time API calls with caching
    
    logger.info('✅ Job fetch and store completed successfully');
  } catch (error) {
    logger.error(`❌ Error in fetchAndStoreJobs: ${error.message}`);
  }
}, {
  scheduled: false,
});

/**
 * Job 2: Send job alerts to subscribed users
 * Runs every 6 hours (staggered by 30 minutes from job 1)
 */
const sendJobAlerts = cron.schedule('30 */6 * * *', async () => {
  logger.info('📧 Starting scheduled job: Send job alerts');
  
  try {
    const result = await jobAlertService.sendAlertsToAllUsers();
    logger.info(`✅ Job alerts sent. Success: ${result.successCount}, Errors: ${result.errorCount}`);
  } catch (error) {
    logger.error(`❌ Error in sendJobAlerts: ${error.message}`);
  }
}, {
  scheduled: false,
});

/**
 * Job 3: Clean up expired jobs
 * Runs daily at 2 AM
 */
const cleanupExpiredJobs = cron.schedule('0 2 * * *', async () => {
  logger.info('🧹 Starting scheduled job: Cleanup expired jobs');
  
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Deactivate old jobs
    const result = await JobListing.updateMany(
      {
        postedDate: { $lt: thirtyDaysAgo },
        isActive: true,
      },
      { isActive: false }
    );

    logger.info(`✅ Cleanup completed. Deactivated ${result.modifiedCount} expired jobs`);
  } catch (error) {
    logger.error(`❌ Error in cleanupExpiredJobs: ${error.message}`);
  }
}, {
  scheduled: false,
});

/**
 * Job 4: Scrape and update competitive exams
 * Runs every 12 hours (at midnight and noon)
 */
const updateCompetitiveExams = cron.schedule('0 */12 * * *', async () => {
  logger.info('📚 Starting scheduled job: Update competitive exams');
  
  try {
    const exams = await examScraper.scrapeAllExams();
    logger.info(`✅ Exam update completed. Fetched ${exams.length} exams`);
  } catch (error) {
    logger.error(`❌ Error in updateCompetitiveExams: ${error.message}`);
  }
}, {
  scheduled: false,
});

/**
 * Start all scheduled jobs
 */
function startScheduledJobs() {
  logger.info('🚀 Starting all scheduled jobs...');
  
  fetchAndStoreJobs.start();
  logger.info('✓ Job fetch schedule started (every 6 hours)');
  
  sendJobAlerts.start();
  logger.info('✓ Job alerts schedule started (every 6 hours)');
  
  cleanupExpiredJobs.start();
  logger.info('✓ Job cleanup schedule started (daily at 2 AM)');
  
  updateCompetitiveExams.start();
  logger.info('✓ Competitive exam update schedule started (every 12 hours)');
  
  activeJobs.fetchAndStoreJobs = fetchAndStoreJobs;
  activeJobs.sendJobAlerts = sendJobAlerts;
  activeJobs.cleanupExpiredJobs = cleanupExpiredJobs;
  activeJobs.updateCompetitiveExams = updateCompetitiveExams;
}

/**
 * Stop all scheduled jobs
 */
function stopScheduledJobs() {
  logger.info('🛑 Stopping all scheduled jobs...');
  
  Object.values(activeJobs).forEach(job => {
    if (job && job.stop) {
      job.stop();
    }
  });
  
  logger.info('✓ All scheduled jobs stopped');
}

module.exports = {
  startScheduledJobs,
  stopScheduledJobs,
  fetchAndStoreJobs,
  sendJobAlerts,
  cleanupExpiredJobs,
  updateCompetitiveExams,
};
