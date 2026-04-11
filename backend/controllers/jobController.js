const jobAggregator = require('../services/jobAggregator');
const jobMatchingService = require('../services/jobMatchingService');
const jobAlertService = require('../services/jobAlertService');
const User = require('../models/User');
const logger = require('../config/logger');

// GET /api/jobs/private - Get private sector jobs
const getPrivateJobs = async (req, res) => {
  try {
    const { location, skills, page = 1, sortBy = 'latest' } = req.query;
    
    const keywords = skills || 'software developer';
    
    const result = await jobAggregator.fetchPrivateJobs({
      location: location || 'India',
      keywords,
      page: parseInt(page),
    });

    // If API returned no jobs, provide helpful message
    if (result.jobs.length === 0) {
      return res.json({
        success: true,
        type: 'private',
        count: 0,
        total: 0,
        message: 'No private jobs available. Add your Adzuna API keys to .env file for real-time data.',
        jobs: [],
      });
    }

    res.json({
      success: true,
      type: 'private',
      count: result.jobs.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      jobs: result.jobs,
    });
  } catch (error) {
    logger.error(`Error in getPrivateJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch private jobs',
      error: error.message,
    });
  }
};

// GET /api/jobs/government - Get government jobs
const getGovernmentJobs = async (req, res) => {
  try {
    const { state, category, page = 1 } = req.query;
    
    const result = await jobAggregator.fetchGovernmentJobs({
      state: state || '',
      category: category || '',
      page: parseInt(page),
    });

    if (result.jobs.length === 0) {
      return res.json({
        success: true,
        type: 'government',
        count: 0,
        total: 0,
        message: 'No government jobs available at the moment. Check back later!',
        jobs: [],
      });
    }

    res.json({
      success: true,
      type: 'government',
      count: result.jobs.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      jobs: result.jobs,
    });
  } catch (error) {
    logger.error(`Error in getGovernmentJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch government jobs',
      error: error.message,
    });
  }
};

// GET /api/jobs/all - Get all jobs with AI matching
const getAllJobs = async (req, res) => {
  try {
    const { type = 'all', matchThreshold = 60, location, skills, page = 1 } = req.query;
    const userId = req.user?.id;

    let privateResult = { jobs: [], total: 0 };
    let governmentResult = { jobs: [], total: 0 };

    // Fetch based on type
    if (type === 'all' || type === 'private') {
      privateResult = await jobAggregator.fetchPrivateJobs({
        location: location || 'India',
        keywords: skills || '',
        page: parseInt(page),
      });
    }

    if (type === 'all' || type === 'government') {
      governmentResult = await jobAggregator.fetchGovernmentJobs({
        state: location || '',
        page: parseInt(page),
      });
    }

    // Merge jobs
    let allJobs = jobAggregator.mergeAndDeduplicate(
      privateResult.jobs,
      governmentResult.jobs
    );

    // Apply AI matching if user is authenticated
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        allJobs = jobMatchingService.filterAndSortByMatch(
          allJobs,
          user.toObject(),
          parseInt(matchThreshold)
        );
      }
    }

    // Pagination
    const jobsPerPage = 20;
    const startIndex = (parseInt(page) - 1) * jobsPerPage;
    const paginatedJobs = allJobs.slice(startIndex, startIndex + jobsPerPage);

    res.json({
      success: true,
      type: type,
      count: paginatedJobs.length,
      total: allJobs.length,
      page: parseInt(page),
      totalPages: Math.ceil(allJobs.length / jobsPerPage),
      aiMatching: userId ? 'enabled' : 'disabled',
      matchThreshold: parseInt(matchThreshold),
      jobs: paginatedJobs,
    });
  } catch (error) {
    logger.error(`Error in getAllJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message,
    });
  }
};

// GET /api/jobs/nearby - Get jobs near user location
const getNearbyJobs = async (req, res) => {
  try {
    const { lat, lng, radius = 50, page = 1 } = req.query;
    const userId = req.user?.id;

    if (!lat || !lng) {
      // Try to get location from user profile
      if (userId) {
        const user = await User.findById(userId);
        if (user?.profile?.location) {
          // Note: In production, you'd geocode the pincode to lat/lng
          // For now, return message asking for coordinates
          return res.json({
            success: true,
            message: 'Please provide latitude and longitude parameters for nearby search',
            jobs: [],
          });
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Convert radius from km to meters
    const radiusInMeters = parseInt(radius) * 1000;

    // Use MongoDB geospatial query (requires geoLocation field with 2dsphere index)
    const JobListing = require('../models/JobListing');
    
    const jobs = await JobListing.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      },
      isActive: true,
    }).limit(50);

    res.json({
      success: true,
      count: jobs.length,
      radius: `${radius} km`,
      jobs,
    });
  } catch (error) {
    logger.error(`Error in getNearbyJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby jobs',
      error: error.message,
    });
  }
};

// POST /api/jobs/subscribe - Subscribe to job alerts
const subscribeToAlerts = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const alertPreferences = req.body;
    
    const alert = await jobAlertService.subscribe(userId, alertPreferences);

    res.json({
      success: true,
      message: 'Successfully subscribed to job alerts',
      alert,
    });
  } catch (error) {
    logger.error(`Error in subscribeToAlerts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to job alerts',
      error: error.message,
    });
  }
};

// GET /api/jobs/alerts/preferences - Get user's alert preferences
const getAlertPreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const preferences = await jobAlertService.getAlertPreferences(userId);

    res.json({
      success: true,
      preferences: preferences || { subscribed: false },
    });
  } catch (error) {
    logger.error(`Error in getAlertPreferences: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert preferences',
      error: error.message,
    });
  }
};

// DELETE /api/jobs/alerts/unsubscribe - Unsubscribe from job alerts
const unsubscribeFromAlerts = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    await jobAlertService.unsubscribe(userId);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from job alerts',
    });
  } catch (error) {
    logger.error(`Error in unsubscribeFromAlerts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from job alerts',
      error: error.message,
    });
  }
};

// GET /api/jobs/trending - Get trending/most viewed jobs
const getTrendingJobs = async (req, res) => {
  try {
    const JobListing = require('../models/JobListing');
    
    const jobs = await JobListing.find({ isActive: true })
      .sort({ views: -1, postedDate: -1 })
      .limit(20);

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    logger.error(`Error in getTrendingJobs: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending jobs',
      error: error.message,
    });
  }
};

module.exports = {
  getPrivateJobs,
  getGovernmentJobs,
  getAllJobs,
  getNearbyJobs,
  subscribeToAlerts,
  getAlertPreferences,
  unsubscribeFromAlerts,
  getTrendingJobs,
};
