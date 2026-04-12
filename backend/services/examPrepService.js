const axios = require('axios');
const logger = require('../config/logger');

class ExamPrepService {
  constructor() {
    this.pythonLLMUrl = process.env.PYTHON_LLM_URL || 'http://localhost:8000';
    this.usePythonLLM = process.env.USE_PYTHON_LLM === 'true';
  }

  /**
   * Generate AI-powered preparation guide for an exam
   */
  async generatePreparationGuide(examData, userEducation = '12th') {
    try {
      if (this.usePythonLLM) {
        logger.info(`🤖 Generating AI prep guide for: ${examData.name}`);

        const response = await axios.post(`${this.pythonLLMUrl}/api/generate-prep-guide`, {
          examName: examData.name,
          conductingBody: examData.conductingBody,
          category: examData.category,
          qualification: examData.qualification,
          stages: examData.stages,
          userEducation,
        });

        if (response.data.success) {
          logger.info('✅ AI prep guide generated successfully');
          return response.data.data.guide;
        }
      }

      // Fallback: Generate basic guide
      logger.warn('Python LLM not available, generating basic prep guide');
      return this.generateBasicPrepGuide(examData);
    } catch (error) {
      logger.error(`Error generating prep guide: ${error.message}`);
      return this.generateBasicPrepGuide(examData);
    }
  }

  /**
   * Generate basic preparation guide as fallback
   */
  generateBasicPrepGuide(examData) {
    return {
      syllabusOverview: this.generateSyllabusOverview(examData),
      studyRoadmap: this.generateStudyRoadmap(examData),
      strategy: this.generateStrategy(examData),
      timeline: this.generateTimeline(examData),
      resources: this.generateResources(examData),
      tips: this.generateTips(examData),
      generatedAt: new Date(),
    };
  }

  /**
   * Generate syllabus overview based on exam category
   */
  generateSyllabusOverview(examData) {
    const categorySyllabus = {
      'UPSC': 'General Studies (History, Geography, Polity, Economy, Science), CSAT (Aptitude & Reasoning), Essay Writing, Optional Subject (2 papers), Current Affairs',
      'SSC': 'General Intelligence & Reasoning, Quantitative Aptitude, English Language, General Awareness, Computer Knowledge',
      'Banking': 'Quantitative Aptitude, Reasoning Ability, English Language, General Awareness (Banking & Current Affairs), Computer Knowledge',
      'Defence': 'Mathematics, General Knowledge, English Language, Physics, Chemistry, Current Affairs, Physical Fitness',
      'Entrance': 'Subject-specific topics (Physics, Chemistry, Mathematics/Biology), Aptitude, Current Affairs',
      'State PSC': 'State-specific General Studies, Indian History & Polity, Geography, Economy, Current Affairs, Regional Language',
      'Teaching': 'Teaching Aptitude, Child Development & Pedagogy, Subject Knowledge, General Awareness, Language Proficiency',
    };

    return categorySyllabus[examData.category] || 'Refer to official notification for detailed syllabus';
  }

  /**
   * Generate study roadmap
   */
  generateStudyRoadmap(examData) {
    const stages = examData.stages && examData.stages.length > 0 
      ? examData.stages.join(' → ') 
      : 'Single Stage Exam';

    return `Exam Pattern: ${stages}\n\n` +
      `Phase 1: Foundation Building (Months 1-2)\n` +
      `- Understand complete syllabus and exam pattern\n` +
      `- Gather study materials and resources\n` +
      `- Build strong fundamentals in core subjects\n\n` +
      `Phase 2: Intensive Study (Months 3-5)\n` +
      `- Complete syllabus topic by topic\n` +
      `- Make short notes for revision\n` +
      `- Start solving previous year papers\n\n` +
      `Phase 3: Practice & Revision (Months 6-7)\n` +
      `- Daily mock tests and practice papers\n` +
      `- Revise notes regularly\n` +
      `- Focus on weak areas\n\n` +
      `Phase 4: Final Preparation (Month 8)\n` +
      `- Full-length mock tests daily\n` +
      `- Quick revision of all topics\n` +
      `- Stay updated with current affairs`;
  }

  /**
   * Generate preparation strategy
   */
  generateStrategy(examData) {
    return `1. Understand the Exam:\n` +
      `- Analyze previous year question papers\n` +
      `- Identify high-weightage topics\n` +
      `- Understand marking scheme and negative marking\n\n` +
      `2. Smart Study Approach:\n` +
      `- Focus on conceptual clarity over rote learning\n` +
      `- Practice daily with time limits\n` +
      `- Learn shortcut methods for quantitative sections\n\n` +
      `3. Current Affairs Preparation:\n` +
      `- Read newspaper daily (The Hindu/Indian Express)\n` +
      `- Follow monthly current affairs magazines\n` +
      `- Make notes of important events\n\n` +
      `4. Mock Tests & Analysis:\n` +
      `- Give at least 2 mock tests per week\n` +
      `- Analyze mistakes and improve\n` +
      `- Work on time management\n\n` +
      `5. Revision Strategy:\n` +
      `- Revise weekly what you studied\n` +
      `- Maintain formula sheets and quick notes\n` +
      `- Regular revision is key to success`;
  }

  /**
   * Generate study timeline
   */
  generateTimeline(examData) {
    return `Daily Study Schedule (6-8 hours):\n\n` +
      `Morning (3 hours):\n` +
      `- 6:00-7:00 AM: Current Affairs & Newspaper\n` +
      `- 7:00-9:00 AM: Core Subject Study (Quant/Reasoning)\n\n` +
      `Afternoon (2 hours):\n` +
      `- 2:00-4:00 PM: General Studies/Subject Knowledge\n\n` +
      `Evening (2-3 hours):\n` +
      `- 5:00-7:00 PM: Practice Problems & Mock Tests\n` +
      `- 8:00-9:00 PM: Revision & Note Making\n\n` +
      `Weekly Plan:\n` +
      `- Monday-Friday: Syllabus coverage + practice\n` +
      `- Saturday: Full mock test + analysis\n` +
      `- Sunday: Revision + weak area improvement`;
  }

  /**
   * Generate recommended resources
   */
  generateResources(examData) {
    const categoryResources = {
      'UPSC': `
📚 STANDARD BOOKS (Must Read):
• Indian Polity - M. Laxmikanth
• India's Struggle for Independence - Bipan Chandra
• Indian Economy - Ramesh Singh
• Geography of India - G.C. Leong
• Environment - Shankar IAS Academy
• Science & Technology - Ravi P. Agrahari

📰 CURRENT AFFAIRS:
• The Hindu / Indian Express (Daily Newspaper)
• Yojana Magazine (Monthly)
• Kurukshetra Magazine (Monthly)
• Vision IAS Current Affairs (Monthly)
• Insights IAS Daily Current Affairs

🎓 ONLINE RESOURCES:
• Unacademy (Video Lectures)
• BYJU'S IAS
• Vision IAS Test Series
• Insights IAS (Free Resources)
• Mrunal.org (Economy & Geography)

✍️ PRACTICE:
• Previous 10 Years Question Papers
• Test Series (Prelims & Mains)
• Answer Writing Practice (Daily)
• Essay Writing Practice`,

      'SSC': `
📚 BOOKS:
• Quantitative Aptitude - R.S. Aggarwal
• General English - S.P. Bakshi
• General Awareness - Lucent's GK
• Reasoning - R.S. Aggarwal / Arihant
• Kiran's SSC Previous Year Papers

📱 APPS:
• Gradeup (Test Series)
• Adda247 (Daily Quiz)
• SSC Adda (Current Affairs)
• Oliveboard (Mock Tests)

🎓 ONLINE RESOURCES:
• RBE Revolution (YouTube)
• Gagan Pratap Maths (YouTube)
• Aditya Ranjan English (YouTube)
• Testbook (Mock Tests)

✍️ PRACTICE:
• Previous 5-10 Years Papers
• Daily Mock Tests
• Speed Math Practice
• Vocabulary Building (Word Power Made Easy)`,

      'Banking': `
📚 BOOKS:
• Quantitative Aptitude - R.S. Aggarwal / Arun Sharma
• Reasoning - A.K. Gupta / Arihant
• English Language - S.P. Bakshi / Wren & Martin
• Banking Awareness - Arihant
• Financial Awareness - Current Affairs

📱 APPS:
• Adda247 (Best for Banking)
• Gradeup
• Oliveboard
• PracticeMock

🎓 ONLINE RESOURCES:
• Study IQ (Banking Awareness)
• Amit Khurana (YouTube - All Subjects)
• Mohan Das (YouTube - Quant)
• Ankush Lamba (YouTube - Reasoning)

✍️ PRACTICE:
• Daily Sectional Tests
• Full-Length Mock Tests
• Speed & Accuracy Improvement
• Daily Current Affairs (Banking Focus)`,

      'Defence': `
📚 NDA BOOKS:
• Mathematics - R.D. Sharma / R.S. Aggarwal
• General Ability - Arihant NDA Guide
• Physics - NCERT (11th & 12th)
• Chemistry - NCERT (11th & 12th)
• English - Wren & Martin

📚 CDS BOOKS:
• Pathfinder for CDE - Arihant
• Mathematics - R.S. Aggarwal
• General Knowledge - Lucent

🎓 ONLINE RESOURCES:
• SSBCrack (SSB Interview)
• Major Kalshi Classes (YouTube)
• Study IQ Defence
• Adda247 Defence

✍️ PRACTICE:
• NDA/CDS Previous Years Papers
• Mock Tests
• Physical Training (Running, Push-ups)
• SSB Interview Practice`,

      'Entrance': `
📚 JEE BOOKS:
• Physics - H.C. Verma, I.E. Irodov
• Chemistry - O.P. Tandon, Morrison & Boyd
• Mathematics - R.D. Sharma, S.L. Loney

📚 NEET BOOKS:
• Physics - H.C. Verma, DC Pandey
• Chemistry - O.P. Tandon, NCERT
• Biology - NCERT (Must), Trueman's

🎓 ONLINE RESOURCES:
• Khan Academy (Free)
• Unacademy
• BYJU'S
• Vedantu
• Physics Wallah (YouTube - Free)

✍️ PRACTICE:
• Previous 15 Years Papers
• Mock Test Series
• NCERT Exemplar Problems
• Daily Problem Solving`,

      'Teaching': `
📚 BOOKS:
• Child Development & Pedagogy - Shanti Swarup
• Teaching Aptitude - RPH Editorial Board
• Language Teaching - S.K. Mangal
• CTET Success Master - Arihant
• Previous Years Papers - Kiran Publications

🎓 ONLINE RESOURCES:
• Adda247 Teaching
• Gradeup Teaching
• CTET Central (YouTube)
• Teachers Adda

✍️ PRACTICE:
• CTET Previous Papers
• Mock Tests
• Teaching Practice
• Child Psychology Case Studies`,

      'State PSC': `
📚 BOOKS:
• State-specific History & Geography
• Indian Polity - M. Laxmikanth
• State Economy - State Government Publications
• General Science - NCERT (6th-10th)
• Current Affairs - Monthly Magazines

🎓 ONLINE RESOURCES:
• State PSC Official Website
• Local Coaching Institutes
• State-specific YouTube Channels
• Vision IAS (for GS preparation)

✍️ PRACTICE:
• Previous Years Papers
• State-specific Mock Tests
• Essay Writing in Regional Language
• Answer Writing Practice`,

      'Railway': `
📚 BOOKS:
• Mathematics - R.S. Aggarwal
• Reasoning - R.S. Aggarwal
• General Science - Lucent
• General Awareness - Kiran's Railway GK
• Previous Years Papers - Kiran Publications

🎓 ONLINE RESOURCES:
• Sahil Khandelwal (YouTube - Reasoning)
• Deepak Sir (YouTube - Maths)
• Study IQ Railway
• Adda247 Railway

✍️ PRACTICE:
• Previous 10 Years Papers
• Speed Math Practice
• Daily Mock Tests
• Current Affairs (Last 6 months)`,
    };

    return categoryResources[examData.category] || 
      '📚 Refer to official notification for recommended books and study material.\n\n🎓 Join online coaching platforms for structured preparation.\n\n✍️ Practice with previous years\' question papers and mock tests.';
  }

  /**
   * Generate pro tips
   */
  generateTips(examData) {
    return `✅ Start preparation early (at least 6-12 months before exam)\n` +
      `✅ Focus on accuracy first, then speed\n` +
      `✅ Practice time management during mock tests\n` +
      `✅ Stay consistent - study daily even if just 2-3 hours\n` +
      `✅ Health is important - sleep 7-8 hours, exercise regularly\n` +
      `✅ Avoid social media distractions during study hours\n` +
      `✅ Join study groups or online forums for doubt clearing\n` +
      `✅ Track your progress and adjust strategy accordingly\n` +
      `✅ Stay positive and believe in yourself\n` +
      `✅ Have a backup plan - don't put all eggs in one basket`;
  }

  /**
   * Recommend exams based on user profile
   */
  async recommendExams(userProfile) {
    try {
      if (this.usePythonLLM) {
        logger.info('🤖 Generating AI exam recommendations');

        const response = await axios.post(`${this.pythonLLMUrl}/api/recommend-exams`, {
          education: userProfile.education,
          interests: userProfile.interests,
          location: userProfile.location,
          category: userProfile.preferredCategory,
        });

        if (response.data.success) {
          logger.info('✅ AI exam recommendations generated');
          return response.data.data.recommendations;
        }
      }

      // Fallback: Rule-based recommendations
      logger.warn('Python LLM not available, using rule-based recommendations');
      return this.getRuleBasedRecommendations(userProfile);
    } catch (error) {
      logger.error(`Error generating recommendations: ${error.message}`);
      return this.getRuleBasedRecommendations(userProfile);
    }
  }

  /**
   * Get rule-based exam recommendations as fallback
   */
  getRuleBasedRecommendations(userProfile) {
    const { education = '12th', interests = [], location = '' } = userProfile;
    const recommendations = [];

    // Based on education level
    if (education === '10th') {
      recommendations.push({
        category: 'Defence',
        exams: ['NDA (after 12th)', 'SSC GD Constable'],
        reason: 'You can start preparing for Defence exams after completing 12th',
      });
    }

    if (education === '12th' || education === '12th Science') {
      recommendations.push({
        category: 'Entrance',
        exams: ['JEE Main/Advanced', 'NEET', 'State CET'],
        reason: 'Based on your Science background, engineering and medical entrance exams are ideal',
      });
      recommendations.push({
        category: 'Defence',
        exams: ['NDA', 'CDS (after graduation)'],
        reason: 'NDA is available after 12th, CDS after graduation',
      });
    }

    if (education === '12th Commerce' || education === '12th Arts') {
      recommendations.push({
        category: 'Banking',
        exams: ['IBPS Clerk', 'SBI Clerk', 'RRB Office Assistant'],
        reason: 'Banking exams are open to graduates from any stream',
      });
    }

    if (education === 'Graduate' || education === 'Degree') {
      recommendations.push({
        category: 'UPSC',
        exams: ['Civil Services (IAS/IPS)', 'CDS', 'NDA'],
        reason: 'UPSC exams offer prestigious government positions with excellent career growth',
      });
      recommendations.push({
        category: 'SSC',
        exams: ['SSC CGL', 'SSC CHSL', 'SSC MTS'],
        reason: 'SSC exams provide stable government jobs with good work-life balance',
      });
      recommendations.push({
        category: 'Banking',
        exams: ['IBPS PO', 'SBI PO', 'RBI Grade B'],
        reason: 'Banking sector offers competitive salaries and rapid career growth',
      });
    }

    // Based on interests
    if (interests.includes('teaching')) {
      recommendations.push({
        category: 'Teaching',
        exams: ['CTET', 'State TET', 'UGC NET'],
        reason: 'Based on your interest in teaching',
      });
    }

    if (interests.includes('technology') || interests.includes('engineering')) {
      recommendations.push({
        category: 'Entrance',
        exams: ['GATE', 'ESE (Engineering Services)'],
        reason: 'Perfect for engineering graduates interested in technology',
      });
    }

    return recommendations;
  }
}

module.exports = new ExamPrepService();
