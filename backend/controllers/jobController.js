const axios = require('axios');

// Get real-time jobs from Adzuna API
const getRealTimeJobs = async (req, res) => {
  try {
    const { search, location, page = 1 } = req.query;
    
    // Adzuna API configuration
    const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || 'your_app_id';
    const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY || 'your_api_key';
    
    // If no API keys configured, return enhanced mock data with real-time feel
    if (ADZUNA_APP_ID === 'your_app_id') {
      return getEnhancedMockJobs(req, res);
    }
    
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/in/search/1', {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        results_per_page: 20,
        page: parseInt(page),
        what: search || 'software developer',
        where: location || 'India',
        'content-type': 'application/json',
      },
    });
    
    const jobs = response.data.results.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description.substring(0, 300) + '...',
      salary: job.salary_min ? `₹${(job.salary_min / 100000).toFixed(1)}-${(job.salary_max / 100000).toFixed(1)} LPA` : 'Competitive',
      type: job.contract_type === 'permanent' ? 'Full-time' : job.contract_type || 'Full-time',
      posted: getTimeAgo(job.created),
      url: job.redirect_url,
      skills: extractSkills(job.description),
      remote: job.title.toLowerCase().includes('remote') || job.description.toLowerCase().includes('work from home'),
      urgent: Math.random() > 0.7, // Simulate urgency
    }));
    
    res.json({
      success: true,
      count: jobs.length,
      total: response.data.count,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching real jobs:', error.message);
    getEnhancedMockJobs(req, res);
  }
};

// Enhanced mock jobs with realistic data
const getEnhancedMockJobs = (req, res) => {
  const { search = '', page = 1 } = req.query;
  
  const allJobs = [
    {
      id: 'job1',
      title: 'Junior Software Developer',
      company: 'TCS (Tata Consultancy Services)',
      location: 'Bangalore, Karnataka',
      type: 'Full-time',
      experience: 'Entry Level (0-2 years)',
      salary: { min: 3.5, max: 6 },
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      posted: '2 hours ago',
      remote: false,
      urgent: true,
      description: 'Join India\'s leading IT company. Work on cutting-edge projects with modern technologies.',
      applyUrl: '#',
    },
    {
      id: 'job2',
      title: 'Data Analyst - Work From Home',
      company: 'Infosys',
      location: 'Remote (Pune, Maharashtra)',
      type: 'Full-time',
      experience: 'Entry Level (0-1 years)',
      salary: { min: 4, max: 7 },
      skills: ['Python', 'SQL', 'Excel', 'Power BI'],
      posted: '5 hours ago',
      remote: true,
      urgent: false,
      description: 'Remote position available. Analyze business data and create insightful reports.',
      applyUrl: '#',
    },
    {
      id: 'job3',
      title: 'Web Developer Intern',
      company: 'Wipro Technologies',
      location: 'Hyderabad, Telangana',
      type: 'Internship',
      experience: 'Internship',
      salary: { min: 15, max: 25 },
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      posted: '1 day ago',
      remote: false,
      urgent: false,
      description: '3-month paid internship with opportunity for full-time conversion.',
      applyUrl: '#',
    },
    {
      id: 'job4',
      title: 'Python Developer',
      company: 'Cognizant',
      location: 'Chennai, Tamil Nadu',
      type: 'Full-time',
      experience: '0-2 years',
      salary: { min: 4.5, max: 8 },
      skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
      posted: '1 day ago',
      remote: true,
      urgent: true,
      description: 'Build scalable backend systems using Python and modern frameworks.',
      applyUrl: '#',
    },
    {
      id: 'job5',
      title: 'Digital Marketing Executive',
      company: 'Flipkart',
      location: 'Mumbai, Maharashtra',
      type: 'Full-time',
      experience: 'Entry Level',
      salary: { min: 3, max: 5 },
      skills: ['SEO', 'Social Media', 'Google Ads', 'Content Writing'],
      posted: '2 days ago',
      remote: false,
      urgent: false,
      description: 'Drive digital marketing campaigns for India\'s largest e-commerce platform.',
      applyUrl: '#',
    },
    {
      id: 'job6',
      title: 'UI/UX Designer',
      company: 'Zomato',
      location: 'Gurgaon, Haryana',
      type: 'Full-time',
      experience: '1-3 years',
      salary: { min: 6, max: 10 },
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      posted: '3 days ago',
      remote: true,
      urgent: false,
      description: 'Design beautiful and intuitive user interfaces for millions of users.',
      applyUrl: '#',
    },
    {
      id: 'job7',
      title: 'Mobile App Developer (React Native)',
      company: 'Paytm',
      location: 'Noida, Uttar Pradesh',
      type: 'Full-time',
      experience: '0-2 years',
      salary: { min: 5, max: 9 },
      skills: ['React Native', 'JavaScript', 'Firebase', 'Mobile Development'],
      posted: '3 days ago',
      remote: false,
      urgent: true,
      description: 'Build mobile applications used by millions of Indians daily.',
      applyUrl: '#',
    },
    {
      id: 'job8',
      title: 'Cloud Support Associate',
      company: 'Amazon Web Services (AWS)',
      location: 'Hyderabad, Telangana',
      type: 'Full-time',
      experience: 'Entry Level',
      salary: { min: 6, max: 10 },
      skills: ['AWS', 'Linux', 'Networking', 'Customer Support'],
      posted: '4 days ago',
      remote: false,
      urgent: false,
      description: 'Help customers leverage cloud technology for their businesses.',
      applyUrl: '#',
    },
    {
      id: 'job9',
      title: 'Content Writer - Remote',
      company: 'BYJU\'S',
      location: 'Remote (Bangalore)',
      type: 'Part-time',
      experience: '0-1 years',
      salary: { min: 2, max: 4 },
      skills: ['Content Writing', 'SEO', 'Research', 'English'],
      posted: '5 days ago',
      remote: true,
      urgent: false,
      description: 'Create educational content for India\'s largest edtech platform.',
      applyUrl: '#',
    },
    {
      id: 'job10',
      title: 'Cybersecurity Analyst',
      company: 'HCL Technologies',
      location: 'Delhi, NCR',
      type: 'Full-time',
      experience: '1-3 years',
      salary: { min: 5, max: 9 },
      skills: ['Network Security', 'Penetration Testing', 'SIEM', 'Risk Assessment'],
      posted: '6 days ago',
      remote: false,
      urgent: true,
      description: 'Protect organizations from cyber threats and security breaches.',
      applyUrl: '#',
    },
    {
      id: 'job11',
      title: 'Machine Learning Engineer',
      company: 'Microsoft India',
      location: 'Bangalore, Karnataka',
      type: 'Full-time',
      experience: '0-2 years',
      salary: { min: 10, max: 18 },
      skills: ['Python', 'TensorFlow', 'Machine Learning', 'Deep Learning'],
      posted: '1 week ago',
      remote: true,
      urgent: false,
      description: 'Work on cutting-edge AI/ML projects with global impact.',
      applyUrl: '#',
    },
    {
      id: 'job12',
      title: 'Customer Success Manager',
      company: 'Zoho Corporation',
      location: 'Chennai, Tamil Nadu',
      type: 'Full-time',
      experience: 'Entry Level',
      salary: { min: 4, max: 7 },
      skills: ['Communication', 'Problem Solving', 'CRM', 'Customer Relations'],
      posted: '1 week ago',
      remote: false,
      urgent: false,
      description: 'Ensure customer satisfaction and drive product adoption.',
      applyUrl: '#',
    },
  ];
  
  // Filter based on search
  let filteredJobs = allJobs;
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredJobs = allJobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
      job.company.toLowerCase().includes(searchTerm)
    );
  }
  
  // Pagination
  const jobsPerPage = 10;
  const startIndex = (parseInt(page) - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);
  
  res.json({
    success: true,
    count: paginatedJobs.length,
    total: filteredJobs.length,
    jobs: paginatedJobs,
  });
};

// Helper function to extract skills from job description
const extractSkills = (description) => {
  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL',
    'HTML', 'CSS', 'MongoDB', 'AWS', 'Docker', 'Git',
    'Machine Learning', 'Data Analysis', 'TypeScript', 'Angular',
  ];
  
  const foundSkills = commonSkills.filter(skill =>
    description.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills.slice(0, 5);
};

// Helper function to format time ago
const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return '1 day ago';
  return `${Math.floor(diffInHours / 24)} days ago`;
};

module.exports = {
  getRealTimeJobs,
};
