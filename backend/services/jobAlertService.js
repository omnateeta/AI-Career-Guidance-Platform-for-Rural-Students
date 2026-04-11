const JobAlert = require('../models/JobAlert');
const JobListing = require('../models/JobListing');
const User = require('../models/User');
const jobMatchingService = require('./jobMatchingService');
const emailService = require('./emailService');
const logger = require('../config/logger');

class JobAlertService {
  /**
   * Subscribe user to job alerts
   */
  async subscribe(userId, alertPreferences) {
    try {
      const {
        locations = [],
        jobTypes = ['both'],
        skills = [],
        minSalary,
        preferredRoles = [],
        emailNotifications = true,
        whatsappNotifications = false,
      } = alertPreferences;

      // Check if alert already exists
      let alert = await JobAlert.findOne({ userId, isActive: true });

      if (alert) {
        // Update existing alert
        alert.locations = locations.length > 0 ? locations : alert.locations;
        alert.jobTypes = jobTypes.length > 0 ? jobTypes : alert.jobTypes;
        alert.skills = skills.length > 0 ? skills : alert.skills;
        alert.minSalary = minSalary || alert.minSalary;
        alert.preferredRoles = preferredRoles.length > 0 ? preferredRoles : alert.preferredRoles;
        alert.emailNotifications = emailNotifications;
        alert.whatsappNotifications = whatsappNotifications;
        
        await alert.save();
        logger.info(`Updated job alert for user ${userId}`);
      } else {
        // Create new alert
        alert = await JobAlert.create({
          userId,
          locations,
          jobTypes,
          skills,
          minSalary,
          preferredRoles,
          emailNotifications,
          whatsappNotifications,
        });
        logger.info(`Created job alert for user ${userId}`);
      }

      return alert;
    } catch (error) {
      logger.error(`Error subscribing to job alerts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unsubscribe user from job alerts
   */
  async unsubscribe(userId) {
    try {
      await JobAlert.updateOne({ userId }, { isActive: false });
      logger.info(`Unsubscribed user ${userId} from job alerts`);
    } catch (error) {
      logger.error(`Error unsubscribing from job alerts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user's alert preferences
   */
  async getAlertPreferences(userId) {
    try {
      const alert = await JobAlert.findOne({ userId, isActive: true });
      return alert;
    } catch (error) {
      logger.error(`Error fetching alert preferences: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send job alerts to all subscribed users
   * Called by cron job every 6 hours
   */
  async sendAlertsToAllUsers() {
    try {
      logger.info('Starting job alert distribution...');
      
      const activeAlerts = await JobAlert.find({ isActive: true });
      logger.info(`Found ${activeAlerts.length} active job alerts`);

      let successCount = 0;
      let errorCount = 0;

      for (const alert of activeAlerts) {
        try {
          await this.sendAlertToUser(alert);
          successCount++;
        } catch (error) {
          logger.error(`Failed to send alert to user ${alert.userId}: ${error.message}`);
          errorCount++;
        }
      }

      logger.info(`Job alert distribution complete. Success: ${successCount}, Errors: ${errorCount}`);
      return { successCount, errorCount };
    } catch (error) {
      logger.error(`Error in sendAlertsToAllUsers: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send job alerts to a specific user
   */
  async sendAlertToUser(alert) {
    try {
      // Fetch user details
      const user = await User.findById(alert.userId);
      if (!user) {
        logger.warn(`User ${alert.userId} not found`);
        return;
      }

      // Find matching jobs
      const matchingJobs = await this.findMatchingJobsForAlert(alert, user);

      if (matchingJobs.length === 0) {
        logger.info(`No new matching jobs for user ${alert.userId}`);
        return;
      }

      // Send email notification
      if (alert.emailNotifications && user.email) {
        await emailService.sendJobAlertEmail(user.email, user.profile?.name, matchingJobs);
        logger.info(`Sent job alert email to ${user.email}`);
      }

      // Send real-time notification via Socket.io
      const io = require('../server').io;
      if (io) {
        io.to(`user_${alert.userId}`).emit('new_job_alert', {
          count: matchingJobs.length,
          jobs: matchingJobs.slice(0, 5), // Send top 5 jobs
        });
        logger.info(`Sent real-time job alert to user ${alert.userId}`);
      }

      // Update alert metadata
      alert.lastSentAt = new Date();
      alert.totalAlertsSent += 1;
      await alert.save();
    } catch (error) {
      logger.error(`Error sending alert to user ${alert.userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find matching jobs for an alert
   */
  async findMatchingJobsForAlert(alert, user) {
    try {
      // Build query based on alert preferences
      const query = {
        isActive: true,
        postedDate: { $gte: alert.lastSentAt || new Date(Date.now() - 6 * 60 * 60 * 1000) }, // Last 6 hours or all
      };

      // Filter by job type
      if (alert.jobTypes.length > 0 && !alert.jobTypes.includes('both')) {
        query.jobSource = { $in: alert.jobTypes };
      }

      // Filter by location
      if (alert.locations.length > 0) {
        query['location.state'] = { $in: alert.locations };
      }

      // Filter by skills
      if (alert.skills.length > 0) {
        query.requiredSkills = { $in: alert.skills };
      }

      // Filter by minimum salary
      if (alert.minSalary) {
        query['salary.max'] = { $gte: alert.minSalary * 100000 }; // Convert LPA to absolute
      }

      // Fetch matching jobs
      let jobs = await JobListing.find(query)
        .sort({ postedDate: -1 })
        .limit(20);

      // Calculate match scores
      const userProfile = user.toObject();
      const jobsWithScores = jobs.map(job => {
        const matchResult = jobMatchingService.calculateJobMatchScore(job.toObject(), userProfile);
        return {
          ...job.toObject(),
          matchScore: matchResult.score,
          matchReason: matchResult.reason,
        };
      });

      // Sort by match score
      jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

      // Return top 10 jobs with score >= 50
      return jobsWithScores
        .filter(job => job.matchScore >= 50)
        .slice(0, 10);
    } catch (error) {
      logger.error(`Error finding matching jobs: ${error.message}`);
      return [];
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(userId) {
    try {
      const alert = await JobAlert.findOne({ userId, isActive: true });
      
      if (!alert) {
        return { subscribed: false };
      }

      return {
        subscribed: true,
        totalAlertsSent: alert.totalAlertsSent,
        lastSentAt: alert.lastSentAt,
        locations: alert.locations,
        jobTypes: alert.jobTypes,
        skills: alert.skills,
        emailNotifications: alert.emailNotifications,
        whatsappNotifications: alert.whatsappNotifications,
      };
    } catch (error) {
      logger.error(`Error fetching alert stats: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new JobAlertService();
