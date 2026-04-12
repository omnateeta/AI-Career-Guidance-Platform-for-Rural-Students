const axios = require('axios');
const logger = require('../config/logger');

class ScholarshipMatchingService {
  constructor() {
    this.pythonLLMUrl = process.env.PYTHON_LLM_URL || 'http://localhost:8000';
    this.usePythonLLM = process.env.USE_PYTHON_LLM === 'true';
  }

  /**
   * Match scholarships to student profile
   */
  async matchScholarships(scholarships, studentProfile) {
    try {
      const { educationLevel, state, category, income, gender, profile } = studentProfile;
      
      logger.info(`Matching scholarships for student: ${educationLevel}, ${state}, ${category}`);

      // Process with Python LLM if enabled
      let processedScholarships = scholarships;
      if (this.usePythonLLM && scholarships.length > 0) {
        processedScholarships = await this.processWithLLM(scholarships);
      }

      // Calculate match scores
      const matched = processedScholarships.map(scholarship => {
        const matchScore = this.calculateMatch(scholarship, {
          educationLevel,
          state,
          category,
          income,
          gender,
        });

        return {
          ...scholarship,
          matchScore: Math.round(matchScore),
        };
      })
      .filter(s => s.matchScore >= 50) // Only show 50%+ matches
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score

      logger.info(`Matched ${matched.length} scholarships out of ${scholarships.length}`);
      return matched;
    } catch (error) {
      logger.error('Error matching scholarships:', error);
      return scholarships; // Return original if matching fails
    }
  }

  /**
   * Process scholarships with Python LLM
   */
  async processWithLLM(scholarships) {
    try {
      const response = await axios.post(`${this.pythonLLMUrl}/api/process-scholarships`, {
        scholarships: scholarships.map(s => ({
          name: s.name,
          description: s.description,
          eligibility: s.eligibility,
          benefits: s.benefits,
        })),
      }, {
        timeout: 15000,
      });

      if (response.data && response.data.processed_scholarships) {
        logger.info(`Processed ${response.data.processed_scholarships.length} scholarships with LLM`);
        
        // Merge LLM-processed data with original scholarships
        return scholarships.map((original, index) => {
          const processed = response.data.processed_scholarships[index];
          if (processed) {
            return {
              ...original,
              description: processed.summary || original.description,
              eligibility: {
                ...original.eligibility,
                otherCriteria: processed.eligibility_summary || original.eligibility.otherCriteria,
              },
            };
          }
          return original;
        });
      }

      return scholarships;
    } catch (error) {
      logger.error('Error processing scholarships with LLM:', error.message);
      logger.warn('Falling back to original scholarships without LLM processing');
      return scholarships;
    }
  }

  /**
   * Calculate match score between scholarship and student profile
   */
  calculateMatch(scholarship, profile) {
    let score = 0;
    let maxScore = 100;

    const { educationLevel, state, category, income, gender } = profile;

    // 1. Education Level Match (30 points)
    const educationScore = this.calculateEducationMatch(scholarship.eligibility, educationLevel);
    score += educationScore * 0.30;

    // 2. State/Location Match (25 points)
    const stateScore = this.calculateStateMatch(scholarship.eligibility, state);
    score += stateScore * 0.25;

    // 3. Category Match (20 points)
    const categoryScore = this.calculateCategoryMatch(scholarship.eligibility, category);
    score += categoryScore * 0.20;

    // 4. Income Bracket Match (15 points)
    const incomeScore = this.calculateIncomeMatch(scholarship.eligibility, income);
    score += incomeScore * 0.15;

    // 5. Gender Match (10 points)
    const genderScore = this.calculateGenderMatch(scholarship.eligibility, gender);
    score += genderScore * 0.10;

    // Penalty for approaching deadline (within 30 days)
    const daysUntilDeadline = scholarship.daysUntilDeadline;
    if (daysUntilDeadline !== null && daysUntilDeadline !== 999) {
      if (daysUntilDeadline < 0) {
        score = 0; // Expired
      } else if (daysUntilDeadline < 30) {
        score *= 0.7; // Reduce score for urgent deadlines
      }
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculate education level match (0-100)
   */
  calculateEducationMatch(eligibility, studentEducation) {
    if (!studentEducation) return 50; // Neutral if not provided

    const eligibleLevels = eligibility.educationLevel || [];
    
    // If "Any" is in eligible levels, full match
    if (eligibleLevels.includes('Any')) return 100;
    
    // If student's education level matches
    if (eligibleLevels.includes(studentEducation)) return 100;
    
    // Partial match for related levels
    const levelHierarchy = ['10th', '11th', '12th', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD'];
    const studentIndex = levelHierarchy.indexOf(studentEducation);
    
    for (const level of eligibleLevels) {
      const levelIndex = levelHierarchy.indexOf(level);
      if (levelIndex !== -1 && studentIndex !== -1) {
        // Close levels get partial score
        const distance = Math.abs(levelIndex - studentIndex);
        if (distance === 1) return 70;
        if (distance === 2) return 50;
      }
    }

    return 0;
  }

  /**
   * Calculate state match (0-100)
   */
  calculateStateMatch(eligibility, studentState) {
    if (!studentState) return 50; // Neutral if not provided

    const eligibleStates = eligibility.state || [];
    
    // If no state restriction or "All India", full match
    if (eligibleStates.length === 0) return 100;
    
    // Exact match
    if (eligibleStates.includes(studentState)) return 100;
    
    return 0;
  }

  /**
   * Calculate category match (0-100)
   */
  calculateCategoryMatch(eligibility, studentCategory) {
    if (!studentCategory) return 50; // Neutral if not provided

    const eligibleCategories = eligibility.category || [];
    
    // If "Any" is eligible, full match
    if (eligibleCategories.includes('Any')) return 100;
    
    // Exact match
    if (eligibleCategories.includes(studentCategory)) return 100;
    
    return 0;
  }

  /**
   * Calculate income match (0-100)
   */
  calculateIncomeMatch(eligibility, studentIncome) {
    if (!studentIncome) return 50; // Neutral if not provided

    const incomeLimit = eligibility.incomeLimit;
    
    // If no income limit, full match
    if (!incomeLimit) return 100;
    
    // If student income is within limit
    if (studentIncome <= incomeLimit) return 100;
    
    // If slightly over limit (within 20%), partial match
    if (studentIncome <= incomeLimit * 1.2) return 50;
    
    return 0;
  }

  /**
   * Calculate gender match (0-100)
   */
  calculateGenderMatch(eligibility, studentGender) {
    if (!studentGender) return 50; // Neutral if not provided

    const eligibleGender = eligibility.gender || 'Any';
    
    // If "Any" or matches
    if (eligibleGender === 'Any' || eligibleGender === studentGender) return 100;
    
    return 0;
  }

  /**
   * Get personalized scholarship recommendations
   */
  async getPersonalizedRecommendations(scholarships, studentProfile, limit = 10) {
    const matched = await this.matchScholarships(scholarships, studentProfile);
    
    // Categorize recommendations
    const recommendations = {
      bestMatches: matched.filter(s => s.matchScore >= 80).slice(0, limit),
      goodMatches: matched.filter(s => s.matchScore >= 60 && s.matchScore < 80).slice(0, limit),
      expiringSoon: matched.filter(s => {
        const days = s.daysUntilDeadline;
        return days !== null && days !== 999 && days > 0 && days <= 30;
      }).slice(0, 5),
    };

    return recommendations;
  }
}

module.exports = new ScholarshipMatchingService();
