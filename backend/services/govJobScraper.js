const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const logger = require('../config/logger');

const parser = new Parser();

class GovJobScraper {
  constructor() {
    this.dataGovApiKey = process.env.DATA_GOV_IN_API_KEY;
  }

  /**
   * Main function to scrape government jobs from multiple sources
   */
  async scrapeGovernmentJobs({ state = '', category = '', page = 1 } = {}) {
    let allJobs = [];

    // Try data.gov.in API first
    try {
      const dataGovJobs = await this.fetchFromDataGovIn({ state, category });
      allJobs = [...allJobs, ...dataGovJobs];
      logger.info(`Fetched ${dataGovJobs.length} jobs from data.gov.in`);
    } catch (error) {
      logger.warn(`data.gov.in API failed: ${error.message}`);
    }

    // Fallback to RSS feeds
    if (allJobs.length === 0) {
      try {
        const rssJobs = await this.fetchFromRSSFeeds({ state, category });
        allJobs = [...allJobs, ...rssJobs];
        logger.info(`Fetched ${rssJobs.length} jobs from RSS feeds`);
      } catch (error) {
        logger.warn(`RSS feed scraping failed: ${error.message}`);
      }
    }

    // Last resort: HTML scraping
    if (allJobs.length === 0) {
      try {
        const scrapedJobs = await this.scrapeFromWebsites({ state, category });
        allJobs = [...allJobs, ...scrapedJobs];
        logger.info(`Fetched ${scrapedJobs.length} jobs from HTML scraping`);
      } catch (error) {
        logger.error(`HTML scraping failed: ${error.message}`);
      }
    }

    // Paginate results
    const jobsPerPage = 20;
    const startIndex = (page - 1) * jobsPerPage;
    const paginatedJobs = allJobs.slice(startIndex, startIndex + jobsPerPage);

    return {
      jobs: paginatedJobs,
      total: allJobs.length,
      page: parseInt(page),
      totalPages: Math.ceil(allJobs.length / jobsPerPage),
    };
  }

  /**
   * Fetch from data.gov.in API
   */
  async fetchFromDataGovIn({ state, category }) {
    // Resource IDs for employment-related datasets
    const resourceIds = [
      '3594254b-4e3e-4b56-9e22-e7e9b5544c67', // Central Government Jobs
      'd6b75681-b8b4-4d85-9c45-63f518262bb8', // State Government Jobs
    ];

    const jobs = [];

    for (const resourceId of resourceIds) {
      try {
        const response = await axios.get(
          `https://api.data.gov.in/resource/${resourceId}`,
          {
            params: {
              'api-key': this.dataGovApiKey || '579b464db66ec23bdd000001c61163d748e1b45f16e5d508e15bb335',
              format: 'json',
              limit: 100,
            },
            timeout: 10000,
          }
        );

        if (response.data.records) {
          const normalizedJobs = response.data.records.map(record => 
            this.normalizeDataGovJob(record)
          ).filter(job => job !== null);

          jobs.push(...normalizedJobs);
        }
      } catch (error) {
        logger.warn(`Failed to fetch from data.gov.in resource ${resourceId}: ${error.message}`);
      }
    }

    return jobs;
  }

  /**
   * Normalize data.gov.in job record
   */
  normalizeDataGovJob(record) {
    try {
      return {
        id: `govt_${record.id || Math.random().toString(36).substr(2, 9)}`,
        title: record.post_name || record.job_title || record.designation || 'Government Position',
        department: record.department || record.organization || record.ministry || 'Unknown Department',
        location: record.state || record.location || record.district || 'India',
        qualification: record.qualification || record.education || 'As per government norms',
        vacancies: parseInt(record.vacancies || record.total_vacancies) || null,
        lastDate: record.last_date || record.application_end_date || record.closing_date ? 
          new Date(record.last_date || record.application_end_date || record.closing_date) : null,
        postedDate: record.posted_date || record.start_date || record.publish_date ? 
          new Date(record.posted_date || record.start_date || record.publish_date) : new Date(),
        applyUrl: record.apply_link || record.application_url || record.official_website || '#',
        description: record.description || record.details || '',
        ageLimit: {
          min: parseInt(record.min_age) || null,
          max: parseInt(record.max_age) || null,
        },
        salary: record.salary || record.pay_scale || 'As per government pay matrix',
        jobSource: 'government',
        apiSource: 'data.gov.in',
        urgent: false,
        remote: false,
        skills: this.extractGovtSkills(record),
      };
    } catch (error) {
      logger.warn(`Error normalizing data.gov.in job: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetch from RSS feeds (freejobalert, employment news)
   */
  async fetchFromRSSFeeds({ state, category }) {
    const rssFeeds = [
      'https://www.freejobalert.com/feed/',
      'https://employmentnews.gov.in/Rss.aspx',
    ];

    const jobs = [];

    for (const feedUrl of rssFeeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        
        if (feed.items) {
          feed.items.forEach(item => {
            const job = this.normalizeRSSJob(item);
            if (job) {
              // Filter by state if specified
              if (state && !job.location.toLowerCase().includes(state.toLowerCase())) {
                return;
              }
              jobs.push(job);
            }
          });
        }
      } catch (error) {
        logger.warn(`Failed to parse RSS feed ${feedUrl}: ${error.message}`);
      }
    }

    return jobs;
  }

  /**
   * Normalize RSS feed item to job
   */
  normalizeRSSJob(item) {
    try {
      const title = item.title || '';
      const content = item.contentSnippet || item.content || '';
      
      // Extract department from title
      const department = this.extractDepartment(title);
      
      // Try to extract last date
      const lastDateMatch = content.match(/last\s*date.*?(\d{2}[-/]\d{2}[-/]\d{4})/i);
      const lastDate = lastDateMatch ? new Date(lastDateMatch[1]) : null;

      return {
        id: `govt_rss_${Math.random().toString(36).substr(2, 9)}`,
        title: title,
        department: department,
        location: this.extractLocation(title) || 'India',
        qualification: this.extractQualification(content) || 'As per government norms',
        vacancies: this.extractVacancies(content),
        lastDate: lastDate,
        postedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        applyUrl: item.link || '#',
        description: content.substring(0, 500),
        jobSource: 'government',
        apiSource: 'rss-feed',
        urgent: this.isUrgent(lastDate),
        remote: false,
        skills: [],
      };
    } catch (error) {
      logger.warn(`Error normalizing RSS job: ${error.message}`);
      return null;
    }
  }

  /**
   * Scrape from government job websites (HTML scraping)
   */
  async scrapeFromWebsites({ state, category }) {
    // This is a fallback - websites may change structure
    const jobs = [];
    
    try {
      // Example: Scrape employment news portal
      const response = await axios.get('https://employmentnews.gov.in/ViewNotification.aspx', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      
      // Parse job listings from table
      $('table tr').each((index, element) => {
        try {
          const title = $(element).find('td:first-child').text().trim();
          const link = $(element).find('a').attr('href');
          
          if (title && title.length > 10) {
            jobs.push({
              id: `govt_scraped_${Math.random().toString(36).substr(2, 9)}`,
              title: title,
              department: 'Government of India',
              location: state || 'India',
              qualification: 'As per government norms',
              vacancies: null,
              lastDate: null,
              postedDate: new Date(),
              applyUrl: link ? `https://employmentnews.gov.in/${link}` : '#',
              description: '',
              jobSource: 'government',
              apiSource: 'employmentnews',
              urgent: false,
              remote: false,
              skills: [],
            });
          }
        } catch (error) {
          // Skip malformed entries
        }
      });
    } catch (error) {
      logger.warn(`HTML scraping failed: ${error.message}`);
    }

    return jobs;
  }

  /**
   * Extract department from job title
   */
  extractDepartment(title) {
    const departments = [
      'Railway', 'Bank', 'SSC', 'UPSC', 'Defense', 'Police',
      'Teaching', 'Medical', 'Engineering', 'Clerk', 'PO',
    ];

    for (const dept of departments) {
      if (title.toLowerCase().includes(dept.toLowerCase())) {
        return dept;
      }
    }

    return 'Government Department';
  }

  /**
   * Extract location from title
   */
  extractLocation(title) {
    const states = [
      'Delhi', 'Mumbai', 'Karnataka', 'Tamil Nadu', 'UP', 'Uttar Pradesh',
      'Maharashtra', 'Rajasthan', 'Bihar', 'West Bengal', 'Gujarat',
    ];

    for (const state of states) {
      if (title.toLowerCase().includes(state.toLowerCase())) {
        return state;
      }
    }

    return null;
  }

  /**
   * Extract qualification from content
   */
  extractQualification(content) {
    const quals = [
      '10th', '12th', 'ITI', 'Diploma', 'Graduate', 'Post Graduate',
      'B.Tech', 'B.E', 'B.Com', 'B.A', 'B.Sc', 'M.Tech', 'MBA',
    ];

    const found = quals.filter(q => content.toLowerCase().includes(q.toLowerCase()));
    return found.length > 0 ? found.join(', ') : null;
  }

  /**
   * Extract vacancies count
   */
  extractVacancies(content) {
    const match = content.match(/(\d+)\s*vacancies?/i) || 
                  content.match(/(\d+)\s*posts?/i) ||
                  content.match(/(\d+)\s*positions?/i);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Check if job is urgent (deadline within 7 days)
   */
  isUrgent(lastDate) {
    if (!lastDate) return false;
    const now = new Date();
    const diffDays = Math.floor((lastDate - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }

  /**
   * Extract skills for government jobs
   */
  extractGovtSkills(record) {
    const skills = [];
    const text = JSON.stringify(record).toLowerCase();

    if (text.includes('computer') || text.includes('typing')) skills.push('Computer Operations');
    if (text.includes('excel') || text.includes('spreadsheet')) skills.push('MS Excel');
    if (text.includes('accounts') || text.includes('accounting')) skills.push('Accounting');
    if (text.includes('teaching') || text.includes('pedagogy')) skills.push('Teaching');
    if (text.includes('engineering') || text.includes('technical')) skills.push('Technical Knowledge');

    return skills;
  }
}

module.exports = new GovJobScraper();
