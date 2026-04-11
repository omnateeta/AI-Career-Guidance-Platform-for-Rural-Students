const NodeCache = require('node-cache');

// Create cache instance with configuration
const careerCache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 86400, // 24 hours default
  checkperiod: 3600, // Check for expired keys every hour
  useClones: false, // Better performance
  maxKeys: 10000, // Limit cache size
});

// Event listeners for cache operations
careerCache.on('set', (key, value) => {
  // console.log(`Cache set: ${key}`);
});

careerCache.on('del', (key, value) => {
  // console.log(`Cache deleted: ${key}`);
});

careerCache.on('expired', (key, value) => {
  // console.log(`Cache expired: ${key}`);
});

// Helper functions
const cacheHelpers = {
  // Get from cache with fallback
  async getOrSet(key, fetchFunction, ttl = null) {
    const cached = careerCache.get(key);
    if (cached) {
      return { data: cached, fromCache: true };
    }

    const data = await fetchFunction();
    careerCache.set(key, data, ttl);
    return { data, fromCache: false };
  },

  // Invalidate specific key
  invalidate(key) {
    careerCache.del(key);
  },

  // Invalidate keys by pattern
  invalidatePattern(pattern) {
    const keys = careerCache.keys();
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        careerCache.del(key);
      }
    });
  },

  // Get cache statistics
  getStats() {
    return careerCache.getStats();
  },

  // Clear entire cache
  flush() {
    careerCache.flushAll();
  },
};

module.exports = {
  careerCache,
  ...cacheHelpers,
};
