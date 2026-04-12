const axios = require('axios');
const NodeCache = require('node-cache');
const crypto = require('crypto');
const logger = require('../config/logger');
const realisticJobFallback = require('./realisticJobFallback');

// Cache with 1 hour TTL
const jobCache = new NodeCache({ stdTTL: parseInt(process.env.JOB_CACHE_TTL) || 3600 });

class JobAggregator {
  constructor() {
    this.adzunaAppId = process.env.ADZUNA_APP_ID;
    this.adzunaApiKey = process.env.ADZUNA_API_KEY;
  }

  /**
   * Fetch private sector jobs from Adzuna API
   */
  async fetchPrivateJobs({ location = 'India', keywords = '', page = 1, resultsPerPage = 20 }) {
    const cacheKey = `private_jobs_${location}_${keywords}_${page}`;
    const cached = jobCache.get(cacheKey);
    
    if (cached) {
      logger.info('Returning cached private jobs');
      return cached;
    }

    try {
      // If no API keys, use realistic fallback jobs
      if (!this.adzunaAppId || this.adzunaAppId === 'your_app_id') {
        logger.warn('Adzuna API keys not configured, using realistic fallback jobs');
        const fallbackJobs = realisticJobFallback.generateRealisticJobs({
          location,
          keywords,
          page,
          resultsPerPage,
        });
        
        // Cache the fallback results
        jobCache.set(cacheKey, fallbackJobs);
        
        return fallbackJobs;
      }

      const response = await axios.get('https://api.adzuna.com/v1/api/jobs/in/search/1', {
        params: {
          app_id: this.adzunaAppId,
          app_key: this.adzunaApiKey,
          results_per_page: resultsPerPage,
          page: parseInt(page),
          what: keywords || 'software developer',
          where: location,
          'content-type': 'application/json',
        },
        timeout: 10000,
      });

      const jobs = response.data.results.map(job => this.normalizePrivateJob(job));
      
      // Cache the results
      jobCache.set(cacheKey, {
        jobs,
        total: response.data.count,
        page: parseInt(page),
        totalPages: Math.ceil(response.data.count / resultsPerPage),
      });

      logger.info(`Fetched ${jobs.length} private jobs from Adzuna`);
      return {
        jobs,
        total: response.data.count,
        page: parseInt(page),
        totalPages: Math.ceil(response.data.count / resultsPerPage),
      };
    } catch (error) {
      logger.error(`Error fetching private jobs from Adzuna: ${error.message}`);
      return { jobs: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Normalize private job data from Adzuna
   */
  normalizePrivateJob(job) {
    const salaryMin = job.salary_min ? job.salary_min / 100000 : null;
    const salaryMax = job.salary_max ? job.salary_max / 100000 : null;

    return {
      id: `private_${job.id}`,
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'India',
      description: job.description ? job.description.substring(0, 500) + '...' : '',
      salary: salaryMin && salaryMax ? `${salaryMin.toFixed(1)}-${salaryMax.toFixed(1)} LPA` : 'Competitive',
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      type: job.contract_type === 'permanent' ? 'Full-time' : job.contract_type || 'Full-time',
      posted: this.getTimeAgo(job.created),
      postedDate: job.created,
      applyUrl: job.redirect_url,
      skills: this.extractSkills(job.description || ''),
      remote: job.title.toLowerCase().includes('remote') || 
              job.description?.toLowerCase().includes('work from home') ||
              job.location?.display_name?.toLowerCase().includes('remote'),
      urgent: false,
      jobSource: 'private',
      apiSource: 'adzuna',
      externalId: job.id,
    };
  }

  /**
   * Fetch government jobs (delegated to govJobScraper)
   */
  async fetchGovernmentJobs({ state = '', category = '', page = 1 }) {
    const cacheKey = `govt_jobs_${state}_${category}_${page}`;
    const cached = jobCache.get(cacheKey);
    
    if (cached) {
      logger.info('Returning cached government jobs');
      return cached;
    }

    try {
      // Import govJobScraper dynamically to avoid circular dependency
      const govJobScraper = require('./govJobScraper');
      const result = await govJobScraper.scrapeGovernmentJobs({ state, category, page });
      
      // Cache the results
      jobCache.set(cacheKey, result);
      
      logger.info(`Fetched ${result.jobs?.length || 0} government jobs`);
      return result;
    } catch (error) {
      logger.error(`Error fetching government jobs: ${error.message}`);
      return { jobs: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Merge and deduplicate jobs from multiple sources
   */
  mergeAndDeduplicate(privateJobs, governmentJobs) {
    const allJobs = [...privateJobs, ...governmentJobs];
    const seen = new Set();
    const uniqueJobs = [];

    for (const job of allJobs) {
      // Create a hash based on title + company/department + location
      const hash = this.createJobHash(job);
      
      if (!seen.has(hash)) {
        seen.add(hash);
        uniqueJobs.push(job);
      }
    }

    // Sort by posted date (newest first)
    uniqueJobs.sort((a, b) => {
      const dateA = new Date(a.postedDate || 0);
      const dateB = new Date(b.postedDate || 0);
      return dateB - dateA;
    });

    return uniqueJobs;
  }

  /**
   * Create a hash to identify duplicate jobs
   */
  createJobHash(job) {
    const identifier = `${job.title.toLowerCase()}_${(job.company || job.department || '').toLowerCase()}_${job.location.toLowerCase()}`;
    return crypto.createHash('md5').update(identifier).digest('hex');
  }

  /**
   * Extract skills from job description
   */
  extractSkills(description) {
    const commonSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL',
      'HTML', 'CSS', 'MongoDB', 'AWS', 'Docker', 'Git',
      'Machine Learning', 'Data Analysis', 'TypeScript', 'Angular',
      'Vue.js', 'Express.js', 'PostgreSQL', 'MySQL', 'Redis',
      'Kubernetes', 'DevOps', 'Agile', 'Scrum',
      'Communication', 'Leadership', 'Problem Solving', 'Team Work',
    ];

    const foundSkills = commonSkills.filter(skill =>
      description.toLowerCase().includes(skill.toLowerCase())
    );

    return foundSkills.slice(0, 8);
  }

  /**
   * Format time ago
   */
  getTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache() {
    jobCache.flushAll();
    logger.info('Job cache cleared');
  }
}

module.exports = new JobAggregator();
