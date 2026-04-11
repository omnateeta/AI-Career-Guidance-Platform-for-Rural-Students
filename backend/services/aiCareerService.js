const axios = require('axios');
const logger = require('../config/logger');

class AICareerService {
  constructor() {
    this.pythonLLMUrl = process.env.PYTHON_LLM_URL || 'http://localhost:8000';
    this.usePythonLLM = process.env.USE_PYTHON_LLM === 'true';
    logger.info(`AI Service initialized - Using Python LLM: ${this.usePythonLLM}`);
  }

  /**
   * Generate initial career paths based on education level
   * @param {string} educationLevel - "10th", "12th", "Diploma", "Degree"
   * @returns {Array} Array of career path nodes
   */
  async generateInitialPaths(educationLevel) {
    try {
      if (this.usePythonLLM) {
        // Use Python LLM Service
        logger.info(`Using Python LLM service to generate paths for ${educationLevel}`);
        
        const response = await axios.post(`${this.pythonLLMUrl}/api/generate-paths`, {
          educationLevel,
          preferences: {}
        });

        if (!response.data.success) {
          throw new Error('Python LLM service returned error');
        }

        const paths = response.data.data.nodes;
        logger.info(`Generated ${paths.length} paths from Python LLM service`);
        
        // Add education level and depth to each node
        const enrichedPaths = paths.map((path) => ({
          ...path,
          educationLevel,
          parentNodeId: null,
          depth: 0,
          cachedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          children: [],
        }));

        return enrichedPaths;
      } else {
        // Fallback to local database
        logger.warn('Python LLM not enabled, using fallback data');
        return this.getFallbackPaths(educationLevel);
      }
    } catch (error) {
      logger.error('Error generating initial paths:', error);
      
      // Fallback data if service fails
      logger.warn('Using fallback career paths data');
      return this.getFallbackPaths(educationLevel);
    }
  }

  /**
   * Expand a node to generate its children
   * @param {string} nodeId - The node to expand
   * @param {Object} parentNodeData - Parent node data for context
   * @returns {Array} Array of child nodes
   */
  async expandNode(nodeId, parentNodeData) {
    try {
      if (this.usePythonLLM) {
        // Use Python LLM Service
        logger.info(`Using Python LLM service to expand node: ${nodeId}`);
        
        const response = await axios.post(`${this.pythonLLMUrl}/api/expand-node/${nodeId}`, {
          sessionId: null,
          userId: null
        });

        if (!response.data.success) {
          throw new Error('Python LLM service returned error');
        }

        const children = response.data.data.children;
        logger.info(`Generated ${children.length} children from Python LLM service`);
        
        const { label, category, educationLevel } = parentNodeData;
        const newDepth = parentNodeData.depth + 1;

        // Enrich children with parent context
        const enrichedChildren = children.map((child) => ({
          ...child,
          educationLevel,
          parentNodeId: nodeId,
          depth: newDepth,
          cachedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          children: [],
        }));

        return enrichedChildren;
      } else {
        // Fallback
        logger.warn('Python LLM not enabled for node expansion');
        return [];
      }
    } catch (error) {
      logger.error('Error expanding node:', error);
      return [];
    }
  }

  /**
   * Get detailed career information for a node
   * @param {Object} nodeData - The career node
   * @returns {Object} Detailed career information
   */
  async getCareerDetails(nodeData) {
    try {
      if (this.usePythonLLM) {
        // Use Python LLM Service
        logger.info(`Using Python LLM service to get details for: ${nodeData.nodeId}`);
        
        const response = await axios.get(`${this.pythonLLMUrl}/api/career-details/${nodeData.nodeId}`, {
          params: { language: 'en' }
        });

        if (!response.data.success) {
          throw new Error('Python LLM service returned error');
        }

        const details = response.data.data.details;
        logger.info(`Retrieved career details from Python LLM service`);
        
        return details;
      } else {
        // Fallback - generate basic details
        logger.warn('Python LLM not enabled, generating basic details');
        return this.getBasicCareerDetails(nodeData);
      }
    } catch (error) {
      logger.error('Error getting career details:', error);
      return this.getBasicCareerDetails(nodeData);
    }
  }

  /**
   * Get basic career details as fallback
   * @param {Object} nodeData 
   * @returns {Object}
   */
  getBasicCareerDetails(nodeData) {
    const { label, category, description, metadata } = nodeData;
    
    return {
      detailedDescription: `${description} This pathway offers excellent opportunities for students looking to build a successful career in this field.`,
      educationPath: metadata?.educationPath || [],
      requiredSkills: metadata?.skills?.slice(0, 5) || [],
      softSkills: ["Communication", "Problem Solving", "Teamwork", "Time Management", "Adaptability"],
      technicalSkills: metadata?.skills || [],
      salaryRange: metadata?.averageSalary || { entry: "N/A", mid: "N/A", senior: "N/A" },
      growthOpportunities: metadata?.growthOpportunities || [],
      topRecruiters: metadata?.topRecruiters || [],
      workEnvironment: "Professional work environment with opportunities for growth and development",
      futureOutlook: metadata?.futureOutlook || "Positive growth trajectory with increasing demand",
      relatedCareers: [],
      recommendedCourses: [],
      governmentExams: metadata?.governmentExams || []
    };
  }

  /**
   * Get fallback career paths when AI service is unavailable
   * @param {string} educationLevel 
   * @returns {Array}
   */
  getFallbackPaths(educationLevel) {
    const fallbackData = {
      '10th': [
        {
          nodeId: '10th-puc-science',
          label: 'PUC Science',
          category: 'stream',
          description: 'Pre-University Course in Science stream with Physics, Chemistry, Maths/Biology',
          duration: '2 years',
          eligibility: 'Pass 10th Standard',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '3-5 LPA', mid: '6-10 LPA', senior: '12-20 LPA' },
            growthRate: 80,
            skills: ['Analytical Thinking', 'Problem Solving'],
            educationPath: ['Complete 10th', 'Join PUC Science', 'Prepare for entrance exams'],
            growthOpportunities: ['Engineering', 'Medicine', 'Research']
          }
        },
        {
          nodeId: '10th-puc-commerce',
          label: 'PUC Commerce',
          category: 'stream',
          description: 'Pre-University Course in Commerce with Accountancy, Business Studies, Economics',
          duration: '2 years',
          eligibility: 'Pass 10th Standard',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '3-5 LPA', mid: '6-10 LPA', senior: '10-18 LPA' },
            growthRate: 75,
            skills: ['Numerical Ability', 'Business Acumen'],
            educationPath: ['Complete 10th', 'Join PUC Commerce', 'Learn accounting software'],
            growthOpportunities: ['CA', 'Banking', 'Business']
          }
        },
        {
          nodeId: '10th-puc-arts',
          label: 'PUC Arts/Humanities',
          category: 'stream',
          description: 'Pre-University Course in Arts with History, Political Science, Sociology',
          duration: '2 years',
          eligibility: 'Pass 10th Standard',
          demand: 'medium',
          metadata: {
            averageSalary: { entry: '2-4 LPA', mid: '5-8 LPA', senior: '8-15 LPA' },
            growthRate: 65,
            skills: ['Communication', 'Critical Thinking'],
            educationPath: ['Complete 10th', 'Join PUC Arts', 'Prepare for competitive exams'],
            growthOpportunities: ['Civil Services', 'Teaching', 'Journalism']
          }
        },
        {
          nodeId: '10th-iti-electrician',
          label: 'ITI Electrician',
          category: 'certification',
          description: 'Industrial Training Institute course in Electrician trade',
          duration: '2 years',
          eligibility: 'Pass 10th Standard',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '2-3 LPA', mid: '4-6 LPA', senior: '6-10 LPA' },
            growthRate: 70,
            skills: ['Electrical Wiring', 'Safety Protocols'],
            educationPath: ['Complete 10th', 'Join ITI', 'Get certified'],
            growthOpportunities: ['Government Jobs', 'Private Sector', 'Self-employment']
          }
        },
        {
          nodeId: '10th-diploma-engineering',
          label: 'Diploma in Engineering',
          category: 'degree',
          description: '3-year diploma in various engineering fields after 10th',
          duration: '3 years',
          eligibility: 'Pass 10th Standard with good marks',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '3-5 LPA', mid: '6-9 LPA', senior: '10-15 LPA' },
            growthRate: 75,
            skills: ['Technical Skills', 'Practical Knowledge'],
            educationPath: ['Complete 10th', 'Enterance exam', 'Join Polytechnic'],
            growthOpportunities: ['Lateral Engineering', 'Government Jobs', 'Private Sector']
          }
        }
      ],
      '12th': [
        {
          nodeId: '12th-engineering',
          label: 'B.E./B.Tech Engineering',
          category: 'degree',
          description: 'Bachelor of Engineering/Technology in various specializations',
          duration: '4 years',
          eligibility: '12th with PCM and entrance exam',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '4-8 LPA', mid: '10-15 LPA', senior: '20-40 LPA' },
            growthRate: 85,
            skills: ['Programming', 'Problem Solving', 'Mathematics'],
            educationPath: ['Complete 12th PCM', 'Clear JEE/CET', 'Join Engineering College'],
            growthOpportunities: ['Software Industry', 'Core Engineering', 'Higher Studies']
          }
        },
        {
          nodeId: '12th-medical',
          label: 'MBBS/BDS Medical',
          category: 'degree',
          description: 'Medical degree to become a doctor or dentist',
          duration: '5.5 years',
          eligibility: '12th with PCB and NEET',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '5-8 LPA', mid: '12-20 LPA', senior: '25-50 LPA' },
            growthRate: 90,
            skills: ['Biology', 'Patient Care', 'Diagnosis'],
            educationPath: ['Complete 12th PCB', 'Clear NEET', 'Complete MBBS'],
            growthOpportunities: ['Specialization', 'Private Practice', 'Government Service']
          }
        },
        {
          nodeId: '12th-bca',
          label: 'BCA (Computer Applications)',
          category: 'degree',
          description: 'Bachelor of Computer Applications for IT careers',
          duration: '3 years',
          eligibility: '12th in any stream',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '3-6 LPA', mid: '8-12 LPA', senior: '15-25 LPA' },
            growthRate: 80,
            skills: ['Programming', 'Database Management', 'Web Development'],
            educationPath: ['Complete 12th', 'Join BCA', 'Learn programming languages'],
            growthOpportunities: ['Software Developer', 'Data Analyst', 'MCA']
          }
        },
        {
          nodeId: '12th-bcom',
          label: 'B.Com (Commerce)',
          category: 'degree',
          description: 'Bachelor of Commerce for finance and accounting careers',
          duration: '3 years',
          eligibility: '12th in Commerce',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '3-5 LPA', mid: '6-10 LPA', senior: '12-20 LPA' },
            growthRate: 70,
            skills: ['Accounting', 'Finance', 'Taxation'],
            educationPath: ['Complete 12th Commerce', 'Join B.Com', 'Pursue CA/CS'],
            growthOpportunities: ['Chartered Accountant', 'Banking', 'Finance']
          }
        }
      ],
      'Diploma': [
        {
          nodeId: 'diploma-lateral-engineering',
          label: 'Lateral Entry to B.Tech',
          category: 'degree',
          description: 'Direct admission to 2nd year of Engineering after Diploma',
          duration: '3 years',
          eligibility: 'Diploma in Engineering',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '4-7 LPA', mid: '10-15 LPA', senior: '18-30 LPA' },
            growthRate: 80,
            skills: ['Advanced Engineering', 'Design', 'Project Management'],
            educationPath: ['Complete Diploma', 'Clear entrance exam', 'Join B.Tech 2nd year'],
            growthOpportunities: ['Engineering Services', 'Management', 'Entrepreneurship']
          }
        },
        {
          nodeId: 'diploma-job',
          label: 'Direct Job after Diploma',
          category: 'job',
          description: 'Start working in technical roles immediately',
          duration: 'Immediate',
          eligibility: 'Diploma completed',
          demand: 'medium',
          metadata: {
            averageSalary: { entry: '2-4 LPA', mid: '5-8 LPA', senior: '10-15 LPA' },
            growthRate: 65,
            skills: ['Technical Skills', 'Practical Knowledge'],
            educationPath: ['Complete Diploma', 'Apply for jobs', 'Gain experience'],
            growthOpportunities: ['Senior Technician', 'Supervisor', 'Self-employment']
          }
        }
      ],
      'Degree': [
        {
          nodeId: 'degree-mtech',
          label: 'M.Tech (Master of Technology)',
          category: 'degree',
          description: 'Post-graduate engineering specialization',
          duration: '2 years',
          eligibility: 'B.Tech/B.E. with GATE',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '6-10 LPA', mid: '15-25 LPA', senior: '30-50 LPA' },
            growthRate: 85,
            skills: ['Advanced Specialization', 'Research', 'Innovation'],
            educationPath: ['Complete B.Tech', 'Clear GATE', 'Join M.Tech'],
            growthOpportunities: ['R&D', 'Teaching', 'Senior Engineering Roles']
          }
        },
        {
          nodeId: 'degree-mba',
          label: 'MBA (Master of Business Administration)',
          category: 'degree',
          description: 'Post-graduate management degree',
          duration: '2 years',
          eligibility: 'Any Bachelor\'s degree with CAT/MAT',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '8-15 LPA', mid: '20-35 LPA', senior: '40-80 LPA' },
            growthRate: 90,
            skills: ['Leadership', 'Strategy', 'Management'],
            educationPath: ['Complete Degree', 'Clear CAT/MAT', 'Join MBA'],
            growthOpportunities: ['Management Roles', 'Entrepreneurship', 'Consulting']
          }
        },
        {
          nodeId: 'degree-job-it',
          label: 'IT/Software Jobs',
          category: 'job',
          description: 'Start career in Information Technology',
          duration: 'Immediate',
          eligibility: 'Bachelor\'s degree (any)',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '3-6 LPA', mid: '8-15 LPA', senior: '18-35 LPA' },
            growthRate: 85,
            skills: ['Programming', 'Communication', 'Problem Solving'],
            educationPath: ['Complete Degree', 'Learn programming', 'Apply for jobs'],
            growthOpportunities: ['Senior Developer', 'Team Lead', 'Architect']
          }
        },
        {
          nodeId: 'degree-government-exams',
          label: 'Government Exams (UPSC/SSC/Bank)',
          category: 'certification',
          description: 'Prepare for competitive government examinations',
          duration: '1-2 years preparation',
          eligibility: 'Bachelor\'s degree',
          demand: 'high',
          metadata: {
            averageSalary: { entry: '5-8 LPA', mid: '10-15 LPA', senior: '15-25 LPA' },
            growthRate: 75,
            skills: ['General Knowledge', 'Aptitude', 'Reasoning'],
            educationPath: ['Complete Degree', 'Start preparation', 'Clear exams'],
            growthOpportunities: ['Administrative Roles', 'Banking', 'Public Sector']
          }
        }
      ]
    };

    const paths = fallbackData[educationLevel] || fallbackData['10th'];
    
    // Add additional fields
    return paths.map(path => ({
      ...path,
      educationLevel,
      parentNodeId: null,
      depth: 0,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      children: [],
    }));
  }
}

module.exports = new AICareerService();
