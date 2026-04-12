const axios = require('axios');
const logger = require('../config/logger');

/**
 * College Finder Service using OpenStreetMap Overpass API
 * Fetches REAL colleges/universities based on GPS coordinates
 */

class CollegeFinderService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    this.cache = new Map();
    this.CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Haversine formula to calculate distance between two coordinates
   * @param {number} lat1 - User latitude
   * @param {number} lon1 - User longitude
   * @param {number} lat2 - College latitude
   * @param {number} lon2 - College longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Build Overpass QL query for colleges
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in meters (default 5000)
   * @param {string} type - College type filter
   * @returns {string} Overpass QL query
   */
  buildOverpassQuery(lat, lng, radius = 5000, type = 'all') {
    // Base query for educational institutions
    let query = `[out:json][timeout:30];
      (
        node["amenity"="college"](around:${radius},${lat},${lng});
        node["amenity"="university"](around:${radius},${lat},${lng});
        way["amenity"="college"](around:${radius},${lat},${lng});
        way["amenity"="university"](around:${radius},${lat},${lng});
      );
      out center;`;

    // Type-specific filtering (optional enhancement)
    if (type === 'engineering') {
      query = `[out:json][timeout:30];
        (
          node["amenity"="college"]["name"~"engineering|technology|institute",i](around:${radius},${lat},${lng});
          node["amenity"="university"]["name"~"engineering|technology|institute",i](around:${radius},${lat},${lng});
          way["amenity"="college"]["name"~"engineering|technology|institute",i](around:${radius},${lat},${lng});
          way["amenity"="university"]["name"~"engineering|technology|institute",i](around:${radius},${lat},${lng});
        );
        out center;`;
    } else if (type === 'medical') {
      query = `[out:json][timeout:30];
        (
          node["amenity"="college"]["name"~"medical|health",i](around:${radius},${lat},${lng});
          node["amenity"="university"]["name"~"medical|health",i](around:${radius},${lat},${lng});
          way["amenity"="college"]["name"~"medical|health",i](around:${radius},${lat},${lng});
          way["amenity"="university"]["name"~"medical|health",i](around:${radius},${lat},${lng});
        );
        out center;`;
    }

    return query;
  }

  /**
   * Fetch colleges from Overpass API
   * @param {number} lat - User latitude
   * @param {number} lng - User longitude
   * @param {number} radius - Search radius in meters
   * @param {string} type - College type
   * @returns {Array} Array of college objects
   */
  async fetchCollegesFromOverpass(lat, lng, radius = 5000, type = 'all') {
    try {
      const query = this.buildOverpassQuery(lat, lng, radius, type);

      logger.info(`🔍 Fetching colleges from Overpass API at (${lat}, ${lng}), radius: ${radius}m`);

      const response = await axios.post(this.overpassUrl, `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000, // 30 seconds timeout
      });

      logger.info(`✅ Overpass API returned ${response.data.elements?.length || 0} elements`);

      return this.parseOverpassResponse(response.data, lat, lng);
    } catch (error) {
      logger.error('❌ Error fetching from Overpass API:', error.message);
      
      // Retry with larger radius if no results
      if (radius < 15000) {
        logger.info(`🔄 Retrying with larger radius: ${radius + 5000}m`);
        return this.fetchCollegesFromOverpass(lat, lng, radius + 5000, type);
      }

      throw new Error(`Failed to fetch colleges: ${error.message}`);
    }
  }

  /**
   * Parse Overpass API response
   * @param {Object} data - Overpass API response
   * @param {number} userLat - User latitude
   * @param {number} userLng - User longitude
   * @returns {Array} Parsed and formatted college data
   */
  parseOverpassResponse(data, userLat, userLng) {
    const colleges = [];
    const seen = new Set();

    if (!data.elements || data.elements.length === 0) {
      logger.warn('⚠️ No elements found in Overpass response');
      return [];
    }

    data.elements.forEach(element => {
      // Get coordinates
      let lat, lng;
      if (element.type === 'node') {
        lat = element.lat;
        lng = element.lon;
      } else if (element.type === 'way' && element.center) {
        lat = element.center.lat;
        lng = element.center.lon;
      } else {
        return; // Skip invalid elements
      }

      // Get name
      const name = element.tags?.name || element.tags?.['name:en'] || 'Unnamed Institution';

      // Skip duplicates
      const key = `${name}-${lat.toFixed(4)}-${lng.toFixed(4)}`;
      if (seen.has(key)) return;
      seen.add(key);

      // Calculate distance
      const distance = this.calculateDistance(userLat, userLng, lat, lng);

      // Extract additional info
      const college = {
        name: name,
        lat: lat,
        lng: lng,
        distance: parseFloat(distance.toFixed(2)),
        distanceText: `${distance.toFixed(1)} km`,
        type: element.tags?.amenity || 'college',
        address: this.buildAddress(element.tags),
        website: element.tags?.website || element.tags?.['contact:website'] || null,
        phone: element.tags?.phone || element.tags?.['contact:phone'] || null,
        operator: element.tags?.operator || null,
      };

      colleges.push(college);
    });

    // Sort by distance (nearest first)
    colleges.sort((a, b) => a.distance - b.distance);

    logger.info(`📊 Parsed ${colleges.length} unique colleges from Overpass response`);

    return colleges;
  }

  /**
   * Build address string from tags
   * @param {Object} tags - OSM tags
   * @returns {string} Formatted address
   */
  buildAddress(tags) {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

    return parts.length > 0 ? parts.join(', ') : null;
  }

  /**
   * Get nearby colleges with caching
   * @param {number} lat - User latitude
   * @param {number} lng - User longitude
   * @param {Object} options - Query options
   * @returns {Array} Array of colleges
   */
  async getNearbyColleges(lat, lng, options = {}) {
    const { radius = 5000, type = 'all', limit = 20 } = options;

    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates provided');
    }

    // Check cache
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}-${radius}-${type}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info('💾 Returning cached college data');
      return cached.data;
    }

    // Fetch from Overpass
    const colleges = await this.fetchCollegesFromOverpass(lat, lng, radius, type);

    // Limit results
    const limited = colleges.slice(0, limit);

    // Cache the result
    this.cache.set(cacheKey, {
      data: limited,
      timestamp: Date.now(),
    });

    logger.info(`✅ Returning ${limited.length} colleges (cached for 30 min)`);

    return limited;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
    logger.info('🗑️ College finder cache cleared');
  }
}

// Singleton instance
const collegeFinderService = new CollegeFinderService();

module.exports = collegeFinderService;
