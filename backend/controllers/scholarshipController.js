const scholarshipAggregator = require('../services/scholarshipAggregator');
const scholarshipMatchingService = require('../services/scholarshipMatchingService');
const Scholarship = require('../models/Scholarship');
const { sendResponse, sendError } = require('../utils/errorHandler');
const logger = require('../config/logger');

/**
 * GET /api/scholarships
 * Get all scholarships with optional filtering
 */
exports.getAllScholarships = async (req, res) => {
  try {
    const { type, state, category, educationLevel, search } = req.query;

    logger.info(`Fetching scholarships - type: ${type}, state: ${state}, category: ${category}`);

    // Fetch from aggregator (real-time data)
    const scholarships = await scholarshipAggregator.fetchAllScholarships({
      type,
      state,
      category,
      educationLevel,
    });

    // Apply search filter if provided
    let filtered = scholarships;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = scholarships.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.provider.toLowerCase().includes(searchLower) ||
        (s.description && s.description.toLowerCase().includes(searchLower))
      );
    }

    // Get statistics
    const stats = {
      total: filtered.length,
      government: filtered.filter(s => s.type === 'government').length,
      private: filtered.filter(s => s.type === 'private').length,
      expiringSoon: filtered.filter(s => {
        const days = s.daysUntilDeadline;
        return days !== null && days !== 999 && days > 0 && days <= 30;
      }).length,
    };

    console.log('✅ SCHOLARSHIP DATA BEING SENT:', filtered.length, 'scholarships');
    console.log('📊 Stats:', stats);

    sendResponse(res, 200, true, 'Scholarships fetched successfully', {
      scholarships: filtered,
      stats,
      filters: {
        type,
        state,
        category,
        educationLevel,
        search,
      },
    });
  } catch (error) {
    logger.error('Error in getAllScholarships:', error);
    sendError(res, 500, 'Failed to fetch scholarships. Please try again later.');
  }
};

/**
 * GET /api/scholarships/government
 * Get only government scholarships
 */
exports.getGovernmentScholarships = async (req, res) => {
  try {
    const { state, category, educationLevel } = req.query;

    logger.info('Fetching government scholarships');

    // Fetch only government scholarships
    const scholarships = await scholarshipAggregator.fetchAllScholarships({
      type: 'government',
      state,
      category,
      educationLevel,
    });

    // Sort by deadline
    scholarships.sort((a, b) => {
      if (!a.deadlines?.endDate) return 1;
      if (!b.deadlines?.endDate) return -1;
      return new Date(a.deadlines.endDate) - new Date(b.deadlines.endDate);
    });

    console.log('✅ GOVT SCHOLARSHIPS:', scholarships.length);

    sendResponse(res, 200, true, 'Government scholarships fetched', {
      scholarships,
      count: scholarships.length,
      filters: { state, category, educationLevel },
    });
  } catch (error) {
    logger.error('Error in getGovernmentScholarships:', error);
    sendError(res, 500, 'Failed to fetch government scholarships');
  }
};

/**
 * GET /api/scholarships/private
 * Get only private scholarships
 */
exports.getPrivateScholarships = async (req, res) => {
  try {
    const { educationLevel } = req.query;

    logger.info('Fetching private scholarships');

    // Fetch only private scholarships
    const scholarships = await scholarshipAggregator.fetchAllScholarships({
      type: 'private',
      educationLevel,
    });

    // Sort by deadline
    scholarships.sort((a, b) => {
      if (!a.deadlines?.endDate) return 1;
      if (!b.deadlines?.endDate) return -1;
      return new Date(a.deadlines.endDate) - new Date(b.deadlines.endDate);
    });

    console.log('✅ PRIVATE SCHOLARSHIPS:', scholarships.length);

    sendResponse(res, 200, true, 'Private scholarships fetched', {
      scholarships,
      count: scholarships.length,
      filters: { educationLevel },
    });
  } catch (error) {
    logger.error('Error in getPrivateScholarships:', error);
    sendError(res, 500, 'Failed to fetch private scholarships');
  }
};

/**
 * GET /api/scholarships/match
 * Get scholarships matched to student profile
 */
exports.getMatchedScholarships = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    logger.info(`Fetching matched scholarships for user: ${userId}`);

    // Get user profile data
    const studentProfile = {
      educationLevel: req.user.educationLevel,
      state: req.user.profile?.location?.state,
      category: req.user.profile?.category,
      income: req.user.profile?.familyIncome,
      gender: req.user.profile?.gender,
    };

    // Check if profile is complete
    if (!studentProfile.educationLevel && !studentProfile.state) {
      logger.warn('User profile incomplete for scholarship matching');
    }

    // Fetch all scholarships
    const allScholarships = await scholarshipAggregator.fetchAllScholarships();

    // Match to student profile
    const matched = await scholarshipMatchingService.matchScholarships(
      allScholarships,
      studentProfile
    );

    // Get personalized recommendations
    const recommendations = await scholarshipMatchingService.getPersonalizedRecommendations(
      allScholarships,
      studentProfile,
      parseInt(limit)
    );

    // Statistics
    const stats = {
      totalAvailable: allScholarships.length,
      matched: matched.length,
      bestMatches: recommendations.bestMatches.length,
      goodMatches: recommendations.goodMatches.length,
      expiringSoon: recommendations.expiringSoon.length,
    };

    console.log('✅ MATCHED SCHOLARSHIPS:', matched.length, 'out of', allScholarships.length);

    sendResponse(res, 200, true, 'Matched scholarships fetched', {
      matched: matched.slice(0, parseInt(limit)),
      recommendations,
      stats,
      profileCompleteness: calculateProfileCompleteness(studentProfile),
    });
  } catch (error) {
    logger.error('Error in getMatchedScholarships:', error);
    sendError(res, 500, 'Failed to match scholarships. Please try again later.');
  }
};

/**
 * GET /api/scholarships/:id
 * Get single scholarship details
 */
exports.getScholarshipDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // First, try to find in database
    let scholarship = await Scholarship.findById(id);

    // If not in database, search in aggregated data
    if (!scholarship) {
      const allScholarships = await scholarshipAggregator.fetchAllScholarships();
      scholarship = allScholarships.find(s => s._id === id || s.id === id);
    }

    if (!scholarship) {
      return sendError(res, 404, 'Scholarship not found');
    }

    // Check eligibility for current user
    let eligibilityCheck = null;
    if (req.user) {
      const studentProfile = {
        educationLevel: req.user.educationLevel,
        state: req.user.profile?.location?.state,
        category: req.user.profile?.category,
        income: req.user.profile?.familyIncome,
        gender: req.user.profile?.gender,
      };

      eligibilityCheck = scholarship.checkEligibility
        ? scholarship.checkEligibility(studentProfile)
        : null;
    }

    sendResponse(res, 200, {
      scholarship,
      eligibilityCheck,
    });
  } catch (error) {
    logger.error('Error in getScholarshipDetails:', error);
    sendError(res, 500, 'Failed to fetch scholarship details');
  }
};

/**
 * POST /api/scholarships/refresh
 * Force refresh scholarship data from sources
 */
exports.refreshScholarships = async (req, res) => {
  try {
    logger.info('Manual scholarship refresh requested');

    // Clear cache
    scholarshipAggregator.clearCache();

    // Fetch fresh data
    const scholarships = await scholarshipAggregator.fetchAllScholarships();

    sendResponse(res, 200, {
      message: 'Scholarship data refreshed successfully',
      count: scholarships.length,
    });
  } catch (error) {
    logger.error('Error in refreshScholarships:', error);
    sendError(res, 500, 'Failed to refresh scholarship data');
  }
};

/**
 * Helper function to calculate profile completeness
 */
function calculateProfileCompleteness(profile) {
  const fields = [
    profile.educationLevel,
    profile.state,
    profile.category,
    profile.income,
    profile.gender,
  ];

  const filled = fields.filter(f => f !== undefined && f !== null && f !== '').length;
  const percentage = Math.round((filled / fields.length) * 100);

  return {
    percentage,
    missing: fields
      .map((f, i) => ['educationLevel', 'state', 'category', 'income', 'gender'][i])
      .filter((_, i) => fields[i] === undefined || fields[i] === null || fields[i] === ''),
  };
}
