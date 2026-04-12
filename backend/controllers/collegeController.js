const collegeFinderService = require('../services/collegeFinderService');
const { sendResponse, sendError } = require('../utils/errorHandler');
const logger = require('../config/logger');
const axios = require('axios');

/**
 * GET /api/colleges/nearby
 * Get nearby colleges based on GPS coordinates
 * Query params: lat, lng, radius (optional), type (optional), limit (optional)
 */
exports.getNearbyColleges = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type = 'all', limit = 20 } = req.query;

    // Validate coordinates
    if (!lat || !lng) {
      return sendError(res, 400, 'Latitude and longitude are required');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return sendError(res, 400, 'Invalid coordinates');
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return sendError(res, 400, 'Coordinates out of valid range');
    }

    logger.info(`📍 Finding colleges near (${latitude}, ${longitude}), radius: ${radius}m`);

    // Fetch nearby colleges
    const colleges = await collegeFinderService.getNearbyColleges(latitude, longitude, {
      radius: parseInt(radius),
      type,
      limit: parseInt(limit),
    });

    // Calculate statistics
    const stats = {
      total: colleges.length,
      nearest: colleges.length > 0 ? colleges[0] : null,
      averageDistance: colleges.length > 0 
        ? (colleges.reduce((sum, c) => sum + c.distance, 0) / colleges.length).toFixed(2)
        : 0,
    };

    console.log(`✅ Found ${colleges.length} colleges near user location`);

    sendResponse(res, 200, true, 'Nearby colleges fetched successfully', {
      colleges,
      stats,
      location: {
        lat: latitude,
        lng: longitude,
        searchRadius: `${(radius / 1000).toFixed(1)} km`,
      },
    });
  } catch (error) {
    logger.error('❌ Error in getNearbyColleges:', error);
    sendError(res, 500, `Failed to fetch nearby colleges: ${error.message}`);
  }
};

/**
 * POST /api/colleges/refresh-cache
 * Clear the college finder cache
 */
exports.refreshCache = async (req, res) => {
  try {
    collegeFinderService.clearCache();
    sendResponse(res, 200, true, 'College cache cleared successfully');
  } catch (error) {
    logger.error('Error clearing cache:', error);
    sendError(res, 500, 'Failed to clear cache');
  }
};

/**
 * GET /api/colleges/by-city
 * Get colleges by city name using Nominatim geocoding
 * Query params: city (required), radius (optional), type (optional), limit (optional)
 */
exports.getCollegesByCity = async (req, res) => {
  try {
    const { city, radius = 5000, type = 'all', limit = 20 } = req.query;

    // Validate city name
    if (!city || city.trim().length === 0) {
      return sendError(res, 400, 'City name is required');
    }

    const cityName = city.trim();
    logger.info(`🏙️ Searching colleges for city: ${cityName}`);

    // Step 1: Geocode city name to coordinates using Nominatim
    const coordinates = await geocodeCity(cityName);

    if (!coordinates) {
      return sendError(res, 404, `City "${cityName}" not found. Please try a different city name.`);
    }

    logger.info(`📍 Geocoded "${cityName}" to: (${coordinates.lat}, ${coordinates.lng})`);

    // Step 2: Use existing college finder service (REUSE existing logic)
    const colleges = await collegeFinderService.getNearbyColleges(coordinates.lat, coordinates.lng, {
      radius: parseInt(radius),
      type,
      limit: parseInt(limit),
    });

    // Calculate statistics
    const stats = {
      total: colleges.length,
      nearest: colleges.length > 0 ? colleges[0] : null,
      averageDistance: colleges.length > 0 
        ? (colleges.reduce((sum, c) => sum + c.distance, 0) / colleges.length).toFixed(2)
        : 0,
      searchedCity: cityName,
      geocodedLocation: coordinates,
    };

    console.log(`✅ Found ${colleges.length} colleges near ${cityName}`);

    sendResponse(res, 200, true, `Colleges found near ${cityName}`, {
      colleges,
      stats,
      location: {
        lat: coordinates.lat,
        lng: coordinates.lng,
        city: cityName,
        displayName: coordinates.displayName,
        searchRadius: `${(radius / 1000).toFixed(1)} km`,
      },
    });
  } catch (error) {
    logger.error('❌ Error in getCollegesByCity:', error);
    sendError(res, 500, `Failed to search colleges: ${error.message}`);
  }
};

/**
 * Geocode city name to coordinates using OpenStreetMap Nominatim API
 * @param {string} cityName - City name to geocode
 * @returns {Object|null} Coordinates object or null if not found
 */
async function geocodeCity(cityName) {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search`;
    
    logger.info(`🌍 Geocoding city via Nominatim: ${cityName}`);

    const response = await axios.get(nominatimUrl, {
      params: {
        q: cityName,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'AI-Career-Guidance-Platform/1.0',
      },
      timeout: 10000,
    });

    if (!response.data || response.data.length === 0) {
      logger.warn(`⚠️ City not found in Nominatim: ${cityName}`);
      return null;
    }

    const result = response.data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Extract display name for better UX
    const displayName = result.display_name || cityName;

    logger.info(`✅ Geocoded successfully: ${displayName}`);

    return {
      lat,
      lng,
      displayName,
      type: result.type,
      importance: result.importance,
    };
  } catch (error) {
    logger.error('❌ Error geocoding city:', error.message);
    
    // If Nominatim fails, try with "India" suffix for Indian cities
    if (!cityName.toLowerCase().includes('india')) {
      logger.info(`🔄 Retrying with "${cityName}, India"`);
      return geocodeCity(`${cityName}, India`);
    }
    
    return null;
  }
}
