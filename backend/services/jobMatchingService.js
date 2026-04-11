const logger = require('../config/logger');

class JobMatchingService {
  /**
   * Calculate job match score for a user
   * Returns score 0-100 with detailed breakdown
   */
  calculateJobMatchScore(job, userProfile) {
    try {
      if (!userProfile || !userProfile.skills) {
        return {
          score: 0,
          matchedSkills: [],
          missingSkills: job.skills || [],
          breakdown: {
            skillsScore: 0,
            locationScore: 0,
            educationScore: 0,
            interestScore: 0,
          },
          reason: 'Complete your profile to see job matches',
        };
      }

      // Calculate individual scores
      const skillsScore = this.calculateSkillsMatch(job, userProfile);
      const locationScore = this.calculateLocationMatch(job, userProfile);
      const educationScore = this.calculateEducationMatch(job, userProfile);
      const interestScore = this.calculateInterestMatch(job, userProfile);

      // Weighted average
      const totalScore = Math.round(
        skillsScore.score * 0.4 +
        locationScore.score * 0.2 +
        educationScore.score * 0.2 +
        interestScore.score * 0.2
      );

      const breakdown = {
        skillsScore: skillsScore.score,
        locationScore: locationScore.score,
        educationScore: educationScore.score,
        interestScore: interestScore.score,
      };

      // Generate reason/recommendation
      const reason = this.generateMatchReason(totalScore, {
        skills: skillsScore,
        location: locationScore,
        education: educationScore,
        interests: interestScore,
      });

      return {
        score: Math.min(100, Math.max(0, totalScore)),
        matchedSkills: skillsScore.matched,
        missingSkills: skillsScore.missing,
        breakdown,
        reason,
      };
    } catch (error) {
      logger.error(`Error calculating match score: ${error.message}`);
      return {
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        breakdown: { skillsScore: 0, locationScore: 0, educationScore: 0, interestScore: 0 },
        reason: 'Unable to calculate match',
      };
    }
  }

  /**
   * Calculate skills match (40% weight)
   */
  calculateSkillsMatch(job, userProfile) {
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());
    const userSkills = (userProfile.skills || []).map(s => s.name.toLowerCase());

    if (jobSkills.length === 0) {
      return { score: 50, matched: [], missing: [] }; // Neutral if no skills specified
    }

    const matched = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    const missing = jobSkills.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    // Calculate score based on match percentage
    const matchPercentage = (matched.length / jobSkills.length) * 100;
    
    // Boost score if user has high proficiency in matched skills
    const proficiencyBoost = this.calculateProficiencyBonus(matched, userProfile.skills);
    
    const finalScore = Math.min(100, matchPercentage + proficiencyBoost);

    return {
      score: finalScore,
      matched: matched,
      missing: missing,
    };
  }

  /**
   * Calculate proficiency bonus (0-20 points)
   */
  calculateProficiencyBonus(matchedSkills, userSkills) {
    if (!matchedSkills.length || !userSkills.length) return 0;

    let totalProficiency = 0;
    let count = 0;

    matchedSkills.forEach(matchedSkill => {
      const userSkill = userSkills.find(us => 
        us.name.toLowerCase().includes(matchedSkill) || 
        matchedSkill.includes(us.name.toLowerCase())
      );

      if (userSkill && userSkill.proficiency) {
        totalProficiency += userSkill.proficiency;
        count++;
      }
    });

    if (count === 0) return 0;

    // Convert average proficiency (0-100) to bonus (0-20)
    const avgProficiency = totalProficiency / count;
    return (avgProficiency / 100) * 20;
  }

  /**
   * Calculate location match (20% weight)
   */
  calculateLocationMatch(job, userProfile) {
    const userLocation = userProfile.profile?.location || {};
    const userState = (userLocation.state || '').toLowerCase();
    const userDistrict = (userLocation.district || '').toLowerCase();
    const userPincode = userLocation.pincode || '';

    const jobLocation = (job.location || '').toLowerCase();

    // Exact match
    if (userState && jobLocation.includes(userState)) {
      return 100;
    }

    // District match
    if (userDistrict && jobLocation.includes(userDistrict)) {
      return 100;
    }

    // Nearby states (simplified logic)
    const nearbyStates = this.getNearbyStates(userState);
    if (nearbyStates.some(state => jobLocation.includes(state))) {
      return 60;
    }

    // Remote job
    if (job.remote || jobLocation.includes('remote')) {
      return 80;
    }

    // Different location
    return 30;
  }

  /**
   * Get nearby states for location matching
   */
  getNearbyStates(state) {
    const stateMap = {
      'maharashtra': ['gujarat', 'madhya pradesh', 'karnataka', 'goa'],
      'karnataka': ['maharashtra', 'tamil nadu', 'kerala', 'andhra pradesh', 'telangana'],
      'tamil nadu': ['karnataka', 'kerala', 'andhra pradesh'],
      'delhi': ['haryana', 'uttar pradesh', 'rajasthan', 'punjab'],
      'uttar pradesh': ['delhi', 'haryana', 'rajasthan', 'madhya pradesh', 'bihar'],
      'rajasthan': ['gujarat', 'madhya pradesh', 'haryana', 'punjab', 'uttar pradesh'],
      'gujarat': ['maharashtra', 'rajasthan', 'madhya pradesh'],
      'west bengal': ['bihar', 'jharkhand', 'odisha'],
      'telangana': ['andhra pradesh', 'karnataka', 'maharashtra', 'tamil nadu'],
      'andhra pradesh': ['telangana', 'tamil nadu', 'karnataka'],
    };

    return stateMap[state] || [];
  }

  /**
   * Calculate education match (20% weight)
   */
  calculateEducationMatch(job, userProfile) {
    const userEducation = userProfile.education || {};
    const userLevel = userEducation.currentLevel || '';
    
    const jobQualification = (job.qualification || '').toLowerCase();
    const jobDescription = (job.description || '').toLowerCase();
    const combinedText = jobQualification + ' ' + jobDescription;

    // Education level mapping
    const educationHierarchy = {
      'primary': 1,
      'secondary': 2,
      'higher_secondary': 3,
      'undergraduate': 4,
      'graduate': 5,
      'post_graduate': 6,
    };

    const userLevelNum = educationHierarchy[userLevel] || 0;

    // Check if job has specific requirements
    if (combinedText.includes('b.tech') || combinedText.includes('b.e') || 
        combinedText.includes('bachelor') || combinedText.includes('graduate')) {
      if (userLevelNum >= 4) return 100;
      if (userLevelNum === 3) return 50;
      return 20;
    }

    if (combinedText.includes('m.tech') || combinedText.includes('master') || 
        combinedText.includes('post graduate')) {
      if (userLevelNum >= 6) return 100;
      if (userLevelNum >= 4) return 60;
      return 30;
    }

    if (combinedText.includes('10th') || combinedText.includes('matric')) {
      if (userLevelNum >= 2) return 100;
      return 50;
    }

    if (combinedText.includes('12th') || combinedText.includes('intermediate') || 
        combinedText.includes('higher secondary')) {
      if (userLevelNum >= 3) return 100;
      if (userLevelNum === 2) return 60;
      return 30;
    }

    // No specific requirement mentioned
    return 70;
  }

  /**
   * Calculate interest match (20% weight)
   */
  calculateInterestMatch(job, userProfile) {
    const userInterests = (userProfile.interests || []).map(i => i.toLowerCase());
    const userCareerGoals = (userProfile.careerGoals || []).map(g => (g.career || '').toLowerCase());
    
    const jobTitle = (job.title || '').toLowerCase();
    const jobDescription = (job.description || '').toLowerCase();
    const jobDepartment = (job.department || '').toLowerCase();
    const combinedText = jobTitle + ' ' + jobDescription + ' ' + jobDepartment;

    // Check if job matches user interests
    const interestMatches = userInterests.filter(interest => 
      combinedText.includes(interest)
    );

    // Check if job matches career goals
    const goalMatches = userCareerGoals.filter(goal => 
      combinedText.includes(goal)
    );

    const totalMatches = interestMatches.length + goalMatches.length;

    if (totalMatches === 0) return 40; // Base score
    if (totalMatches === 1) return 60;
    if (totalMatches === 2) return 80;
    return 100;
  }

  /**
   * Generate human-readable match reason
   */
  generateMatchReason(totalScore, breakdown) {
    if (totalScore >= 80) {
      return 'Excellent match! This job aligns well with your skills and preferences.';
    }

    if (totalScore >= 60) {
      const reasons = [];
      if (breakdown.skills.score >= 70) reasons.push('good skills match');
      if (breakdown.location.score >= 70) reasons.push('nearby location');
      if (breakdown.education.score >= 70) reasons.push('meets education requirements');
      
      return `Good match with ${reasons.join(', ')}. Consider upskilling to improve match.`;
    }

    if (totalScore >= 40) {
      return 'Moderate match. You may need additional skills or experience for this role.';
    }

    return 'Low match. This job may require skills or qualifications you don\'t have yet.';
  }

  /**
   * Filter and sort jobs by match score
   */
  filterAndSortByMatch(jobs, userProfile, minThreshold = 60) {
    const jobsWithScores = jobs.map(job => {
      const matchResult = this.calculateJobMatchScore(job, userProfile);
      return {
        ...job,
        matchScore: matchResult.score,
        matchDetails: matchResult,
      };
    });

    // Filter by minimum threshold
    const filtered = jobsWithScores.filter(job => job.matchScore >= minThreshold);

    // Sort by match score (descending)
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    return filtered;
  }
}

module.exports = new JobMatchingService();
