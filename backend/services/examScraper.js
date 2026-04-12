const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const logger = require('../config/logger');
const Exam = require('../models/Exam');
const ExamUpdate = require('../models/ExamUpdate');

const parser = new Parser();
const examCache = new NodeCache({ stdTTL: 21600 }); // 6 hours TTL

class ExamScraper {
  constructor() {
    this.examSources = {
      freejobalert: 'https://www.freejobalert.com/feed/',
      employmentnews: 'https://employmentnews.gov.in/Rss.aspx',
    };
  }

  /**
   * Main function to scrape all competitive exams
   */
  async scrapeAllExams() {
    logger.info('🔍 Starting competitive exam scraping...');
    let allExams = [];

    // Add comprehensive baseline exams for all education levels
    const baselineExams = this.getBaselineExams();
    allExams = [...baselineExams];
    logger.info(`✅ Added ${baselineExams.length} baseline exams`);

    // Try multiple sources for real-time updates
    try {
      const rssExams = await this.scrapeFromRSSFeeds();
      allExams = [...allExams, ...rssExams];
      logger.info(`✅ Fetched ${rssExams.length} exams from RSS feeds`);
    } catch (error) {
      logger.warn(`RSS scraping failed: ${error.message}`);
    }

    try {
      const sarkariResultExams = await this.scrapeSarkariResult();
      allExams = [...allExams, ...sarkariResultExams];
      logger.info(`✅ Fetched ${sarkariResultExams.length} exams from Sarkari Result`);
    } catch (error) {
      logger.warn(`Sarkari Result scraping failed: ${error.message}`);
    }

    try {
      const upscExams = await this.scrapeUPSC();
      allExams = [...allExams, ...upscExams];
      logger.info(`✅ Fetched ${upscExams.length} exams from UPSC`);
    } catch (error) {
      logger.warn(`UPSC scraping failed: ${error.message}`);
    }

    // Deduplicate and save to database
    if (allExams.length > 0) {
      const uniqueExams = this.deduplicateExams(allExams);
      await this.saveExamsToDB(uniqueExams);
      logger.info(`💾 Saved ${uniqueExams.length} unique exams to database`);
    }

    return allExams;
  }

  /**
   * Get comprehensive baseline exams for all education levels
   */
  getBaselineExams() {
    return [
      // After 10th Standard
      {
        name: 'National Defence Academy (NDA)',
        conductingBody: 'Union Public Service Commission (UPSC)',
        category: 'Defence',
        description: 'Join the Indian Armed Forces as an officer after 12th. NDA is the premier entrance exam for candidates aspiring to join Army, Navy, and Air Force.',
        qualification: '12th Pass (PCM for Air Force/Navy, Any stream for Army)',
        ageLimit: { min: 16.5, max: 19.5, relaxation: 'None' },
        officialWebsite: 'https://upsc.gov.in/',
        applicationLink: 'https://upsconline.nic.in/',
        vacancies: 400,
        examMode: 'Offline',
        stages: ['Written Exam', 'SSB Interview', 'Medical Test'],
        examPattern: 'Mathematics (300 marks) + General Ability Test (600 marks) = 900 marks total',
        apiSource: 'baseline',
        externalId: 'baseline_nda_001',
        isActive: true,
        syllabusOverview: 'Mathematics: Algebra, Calculus, Trigonometry, Geometry, Statistics. GAT: English, Physics, Chemistry, General Science, History, Geography, Current Affairs.',
      },
      {
        name: 'SSC CHSL (10+2 Level)',
        conductingBody: 'Staff Selection Commission (SSC)',
        category: 'SSC',
        description: 'Recruitment for Lower Divisional Clerk (LDC), Data Entry Operator (DEO), and Postal Assistant positions in various government departments.',
        qualification: '12th Pass from recognized board',
        ageLimit: { min: 18, max: 27, relaxation: 'OBC: 3 years, SC/ST: 5 years' },
        officialWebsite: 'https://ssc.nic.in/',
        applicationLink: 'https://ssc.nic.in/',
        vacancies: 4500,
        examMode: 'Online',
        stages: ['Tier-I (CBT)', 'Tier-II (Descriptive)', 'Tier-III (Skill Test)'],
        examPattern: 'Tier-I: General Intelligence (25 Q), English Language (25 Q), Quantitative Aptitude (25 Q), General Awareness (25 Q) = 100 marks',
        apiSource: 'baseline',
        externalId: 'baseline_ssc_chsl_002',
        isActive: true,
        syllabusOverview: 'General Intelligence: Analogies, Classification, Series, Coding-Decoding. English: Vocabulary, Grammar, Comprehension. Quantitative: Arithmetic, Algebra, Geometry, Trigonometry. General Awareness: Current Affairs, History, Geography, Economics, Science.',
      },
      {
        name: 'Railway Recruitment Board (RRB) Group D',
        conductingBody: 'Railway Recruitment Board (RRB)',
        category: 'Railway',
        description: 'Recruitment for Level-1 posts like Track Maintainer, Helper, Assistant, and other Group D positions in Indian Railways.',
        qualification: '10th Pass or ITI from recognized institution',
        ageLimit: { min: 18, max: 33, relaxation: 'OBC: 3 years, SC/ST: 5 years' },
        officialWebsite: 'https://www.rrbcdg.gov.in/',
        applicationLink: 'https://www.rrbcdg.gov.in/',
        vacancies: 32000,
        examMode: 'Online',
        stages: ['Computer Based Test (CBT)', 'Physical Efficiency Test (PET)', 'Document Verification'],
        examPattern: 'Mathematics (25 Q), General Intelligence & Reasoning (30 Q), General Science (25 Q), General Awareness (20 Q) = 100 marks',
        apiSource: 'baseline',
        externalId: 'baseline_rrb_groupd_003',
        isActive: true,
        syllabusOverview: 'Mathematics: Number System, BODMAS, Decimals, Fractions, LCM & HCF, Ratio & Proportion, Percentages, Mensuration, Time & Work. Reasoning: Analogies, Coding-Decoding, Venn Diagrams, Syllogism. Science: Physics, Chemistry, Life Science (10th standard level).',
      },

      // After PUC/12th/Diploma
      {
        name: 'UPSC Civil Services Examination (CSE)',
        conductingBody: 'Union Public Service Commission (UPSC)',
        category: 'UPSC',
        description: 'India\'s most prestigious exam for recruitment to IAS, IPS, IFS, and other Group A & B services. Conducted in three stages.',
        qualification: 'Graduation in any discipline from recognized university',
        ageLimit: { min: 21, max: 32, relaxation: 'OBC: 3 years, SC/ST: 5 years, PwBD: 10 years' },
        officialWebsite: 'https://upsc.gov.in/',
        applicationLink: 'https://upsconline.nic.in/',
        vacancies: 1000,
        examMode: 'Offline',
        stages: ['Prelims', 'Mains', 'Interview'],
        examPattern: 'Prelims: GS Paper-I (100 Q, 200 marks) + CSAT Paper-II (80 Q, 200 marks). Mains: 9 Papers (Essay, GS 1-4, Optional 1-2, Language 2). Interview: 275 marks.',
        apiSource: 'baseline',
        externalId: 'baseline_upsc_cse_004',
        isActive: true,
        syllabusOverview: 'Prelims GS: Current Affairs, History, Geography, Polity, Economy, Environment, Science & Technology. CSAT: Comprehension, Logical Reasoning, Analytical Ability, Basic Numeracy. Mains: Essay Writing, Indian Heritage, Governance, International Relations, Ethics, Optional Subject.',
      },
      {
        name: 'SSC Combined Graduate Level (CGL)',
        conductingBody: 'Staff Selection Commission (SSC)',
        category: 'SSC',
        description: 'Recruitment for Group B & C posts in various ministries including Inspector, Auditor, Accountant, Assistant Section Officer, and Tax Assistant.',
        qualification: 'Bachelor\'s Degree from recognized university',
        ageLimit: { min: 18, max: 32, relaxation: 'OBC: 3 years, SC/ST: 5 years' },
        officialWebsite: 'https://ssc.nic.in/',
        applicationLink: 'https://ssc.nic.in/',
        vacancies: 8000,
        examMode: 'Online',
        stages: ['Tier-I', 'Tier-II', 'Tier-III (Descriptive)', 'Skill Test (if applicable)'],
        examPattern: 'Tier-I: Reasoning (25 Q), General Awareness (25 Q), Quantitative Aptitude (25 Q), English (25 Q) = 200 marks. Tier-II: Maths, English, Statistics/Finance.',
        apiSource: 'baseline',
        externalId: 'baseline_ssc_cgl_005',
        isActive: true,
        syllabusOverview: 'Quantitative Aptitude: Arithmetic (Percentage, Profit & Loss, Time & Work, Speed & Distance), Algebra, Geometry, Trigonometry, Data Interpretation. Reasoning: Analogy, Classification, Series, Coding, Puzzles, Blood Relations, Direction Sense. English: Reading Comprehension, Cloze Test, Error Detection, Sentence Improvement, Vocabulary. General Awareness: Current Affairs, History, Geography, Polity, Economics, Science, Static GK.',
      },
      {
        name: 'IBPS Probationary Officer (PO)',
        conductingBody: 'Institute of Banking Personnel Selection (IBPS)',
        category: 'Banking',
        description: 'Recruitment for Probationary Officer/Management Trainee positions in 11 public sector banks across India.',
        qualification: 'Bachelor\'s Degree in any discipline from recognized university',
        ageLimit: { min: 20, max: 30, relaxation: 'OBC: 3 years, SC/ST: 5 years, PwBD: 10 years' },
        officialWebsite: 'https://www.ibps.in/',
        applicationLink: 'https://www.ibps.in/',
        vacancies: 3000,
        examMode: 'Online',
        stages: ['Prelims', 'Mains', 'Interview'],
        examPattern: 'Prelims: English (30 Q), Quantitative Aptitude (35 Q), Reasoning (35 Q) = 100 marks. Mains: Reasoning & Computer Aptitude (45 Q), General/Economy/Banking Awareness (40 Q), English Language (35 Q), Data Analysis & Interpretation (35 Q).',
        apiSource: 'baseline',
        externalId: 'baseline_ibps_po_006',
        isActive: true,
        syllabusOverview: 'Quantitative Aptitude: Simplification, Number Series, Data Interpretation, Quadratic Equations, Arithmetic (Profit & Loss, Time & Work, Speed & Distance, Mixture & Alligation, Partnership). Reasoning: Puzzles, Seating Arrangement, Syllogism, Inequalities, Blood Relations, Coding-Decoding, Direction & Distance. English: Reading Comprehension, Cloze Test, Error Detection, Para Jumbles, Phrase Replacement. Banking Awareness: RBI Functions, Banking Terms, Financial Awareness, Current Affairs.',
      },
      {
        name: 'SBI PO (State Bank of India)',
        conductingBody: 'State Bank of India (SBI)',
        category: 'Banking',
        description: 'Recruitment for Probationary Officer positions in India\'s largest public sector bank. Higher salary and better growth prospects than IBPS PO.',
        qualification: 'Graduation in any discipline from recognized university',
        ageLimit: { min: 21, max: 30, relaxation: 'OBC: 3 years, SC/ST: 5 years, PwBD: 10 years' },
        officialWebsite: 'https://sbi.co.in/',
        applicationLink: 'https://sbi.co.in/web/careers',
        vacancies: 2000,
        examMode: 'Online',
        stages: ['Prelims', 'Mains', 'Group Exercise & Interview'],
        examPattern: 'Similar to IBPS PO but with higher difficulty level. Mains includes Descriptive Test (Letter & Essay Writing).',
        apiSource: 'baseline',
        externalId: 'baseline_sbi_po_007',
        isActive: true,
        syllabusOverview: 'Same as IBPS PO but with advanced level questions. Focus on high-level Data Interpretation, Advanced Arithmetic, Critical Reasoning, and Banking & Financial Awareness.',
      },
      {
        name: 'RRB NTPC (Non-Technical Popular Categories)',
        conductingBody: 'Railway Recruitment Board (RRB)',
        category: 'Railway',
        description: 'Recruitment for non-technical positions in Indian Railways including Station Master, Goods Guard, Commercial Apprentice, and various clerk positions.',
        qualification: 'Graduation for undergraduate posts, 12th for graduate posts',
        ageLimit: { min: 18, max: 33, relaxation: 'OBC: 3 years, SC/ST: 5 years' },
        officialWebsite: 'https://www.rrbcdg.gov.in/',
        applicationLink: 'https://www.rrbcdg.gov.in/',
        vacancies: 35000,
        examMode: 'Online',
        stages: ['CBT-1', 'CBT-2', 'Skill Test', 'Document Verification'],
        examPattern: 'CBT-1: Mathematics (30 Q), General Intelligence & Reasoning (30 Q), General Awareness (40 Q) = 100 marks. CBT-2: Same subjects with 35, 35, 50 questions respectively.',
        apiSource: 'baseline',
        externalId: 'baseline_rrb_ntpc_008',
        isActive: true,
        syllabusOverview: 'Mathematics: Number System, Decimals, Fractions, LCM & HCF, Ratio & Proportion, Percentages, Mensuration, Time & Work, Time & Distance, Simple & Compound Interest, Algebra, Geometry, Trigonometry, Statistics. Reasoning: Analogies, Classification, Coding-Decoding, Blood Relations, Venn Diagrams, Syllogism, Puzzles. General Awareness: Current Affairs, Games & Sports, Art & Culture of India, Indian Literature, Monuments, General Science, Politics & Economics, Indian Geography, Life Science.',
      },
      {
        name: 'CTET (Central Teacher Eligibility Test)',
        conductingBody: 'Central Board of Secondary Education (CBSE)',
        category: 'Teaching',
        description: 'Mandatory eligibility test for becoming a teacher in Classes 1-8 (Paper-I) and Classes 6-8 (Paper-II) in central government schools like KVS, NVS, and Delhi Government schools.',
        qualification: 'D.El.Ed for Paper-I, B.Ed for Paper-II',
        ageLimit: { min: null, max: null, relaxation: 'No age limit' },
        officialWebsite: 'https://ctet.nic.in/',
        applicationLink: 'https://ctet.nic.in/',
        vacancies: null,
        examMode: 'Offline',
        stages: ['Paper-I (for Class 1-5)', 'Paper-II (for Class 6-8)'],
        examPattern: 'Paper-I: Child Development (30 Q), Mathematics (30 Q), Environmental Studies (30 Q), Language-I (30 Q), Language-II (30 Q) = 150 marks. Paper-II: Child Development (30 Q), Mathematics & Science (60 Q), Social Studies (60 Q), Language-I (30 Q), Language-II (30 Q) = 150 marks.',
        apiSource: 'baseline',
        externalId: 'baseline_ctet_009',
        isActive: true,
        syllabusOverview: 'Child Development & Pedagogy: Learning & Cognition, Inclusive Education, Teaching Methodologies. Mathematics: Number System, Geometry, Mensuration, Data Handling, Pedagogical issues. EVS: Family & Friends, Food, Shelter, Water, Travel, Environment. Languages: Comprehension, Grammar, Vocabulary, Pedagogy of language development.',
      },
      {
        name: 'GATE (Graduate Aptitude Test in Engineering)',
        conductingBody: 'IITs & IISc (Rotating)',
        category: 'Entrance',
        description: 'National-level exam for admission to M.Tech/ME/PhD programs in IITs, NITs, IISc, and recruitment in Public Sector Undertakings (PSUs) like IOCL, NTPC, BHEL.',
        qualification: 'B.E./B.Tech (3rd year onwards) or M.Sc./MCA',
        ageLimit: { min: null, max: null, relaxation: 'No age limit' },
        officialWebsite: 'https://gate.iitk.ac.in/',
        applicationLink: 'https://gate.iitk.ac.in/',
        vacancies: null,
        examMode: 'Online',
        stages: ['Single Paper (3 hours)'],
        examPattern: 'General Aptitude (15 marks) + Engineering Mathematics (13 marks) + Subject Paper (72 marks) = 100 marks. MCQ, MSQ, and NAT type questions.',
        apiSource: 'baseline',
        externalId: 'baseline_gate_010',
        isActive: true,
        syllabusOverview: 'General Aptitude: Verbal Ability (English grammar, vocabulary, sentence completion), Numerical Ability (computation, estimation, reasoning). Engineering Mathematics: Linear Algebra, Calculus, Differential Equations, Probability & Statistics. Subject-specific topics based on chosen paper (CSE, ECE, ME, CE, EE, etc.).',
      },
      {
        name: 'NDA (National Defence Academy) - After 12th',
        conductingBody: 'Union Public Service Commission (UPSC)',
        category: 'Defence',
        description: 'Entrance exam for admission to National Defence Academy for Army, Navy, and Air Force wings. Conducted twice a year.',
        qualification: '12th Pass (10+2) for Air Force & Navy (with Physics & Maths), 12th Pass (any stream) for Army',
        ageLimit: { min: 16.5, max: 19.5, relaxation: 'None' },
        officialWebsite: 'https://upsc.gov.in/',
        applicationLink: 'https://upsconline.nic.in/',
        vacancies: 400,
        examMode: 'Offline',
        stages: ['Written Examination', 'SSB Interview', 'Medical Examination'],
        examPattern: 'Mathematics (120 questions, 300 marks, 2.5 hours) + General Ability Test (150 questions, 600 marks, 2 hours) = 900 marks total. Negative marking: 0.83 for Maths, 1.33 for GAT.',
        apiSource: 'baseline',
        externalId: 'baseline_nda_011',
        isActive: true,
        syllabusOverview: 'Mathematics: Algebra (Sets, Relations, Functions, Complex Numbers, Quadratic Equations), Matrices & Determinants, Trigonometry, Analytical Geometry, Differential & Integral Calculus, Vector Algebra, Statistics & Probability. GAT: English (Grammar, Vocabulary, Comprehension), Physics (Mechanics, Thermodynamics, Optics, Electricity), Chemistry (Atomic Structure, Chemical Bonding, Acids & Bases), General Science, History, Geography, Current Events.',
      },
      {
        name: 'CDS (Combined Defence Services)',
        conductingBody: 'Union Public Service Commission (UPSC)',
        category: 'Defence',
        description: 'Exam for commission in Indian Military Academy, Indian Naval Academy, Air Force Academy, and Officers\' Training Academy. For graduates only.',
        qualification: 'Bachelor\'s Degree from recognized university',
        ageLimit: { min: 19, max: 25, relaxation: 'Varies by academy' },
        officialWebsite: 'https://upsc.gov.in/',
        applicationLink: 'https://upsconline.nic.in/',
        vacancies: 450,
        examMode: 'Offline',
        stages: ['Written Exam', 'SSB Interview', 'Medical Test'],
        examPattern: 'IMA/INA/AFA: English (120 Q, 100 marks), General Knowledge (120 Q, 100 marks), Elementary Mathematics (100 Q, 100 marks) = 300 marks. OTA: English (120 Q, 100 marks), General Knowledge (120 Q, 100 marks) = 200 marks.',
        apiSource: 'baseline',
        externalId: 'baseline_cds_012',
        isActive: true,
        syllabusOverview: 'English: Synonyms, Antonyms, Sentence Improvement, Error Detection, Comprehension, Para Jumbles. General Knowledge: Physics, Chemistry, General Science, Geography, History, Current Affairs. Mathematics: Arithmetic (Number System, Time & Work, Percentages), Algebra, Trigonometry, Geometry, Mensuration, Statistics.',
      },
      {
        name: 'State PSC Exams (Various States)',
        conductingBody: 'State Public Service Commissions',
        category: 'State PSC',
        description: 'State-level civil services exams for recruitment to various state government posts like Deputy Collector, DSP, BDO, and other administrative positions.',
        qualification: 'Bachelor\'s Degree from recognized university',
        ageLimit: { min: 21, max: 35, relaxation: 'Varies by state and category' },
        officialWebsite: 'https://statepsc.gov.in/',
        applicationLink: 'Check respective state PSC website',
        vacancies: 500,
        examMode: 'Offline',
        stages: ['Prelims', 'Mains', 'Interview'],
        examPattern: 'Prelims: General Studies Paper-I & II (200 marks each). Mains: 4-6 papers including Essay, GS, Optional Subject, Language. Interview: 100 marks.',
        apiSource: 'baseline',
        externalId: 'baseline_state_psc_013',
        isActive: true,
        syllabusOverview: 'General Studies: History (National & State), Geography (India & State), Indian Polity & Constitution, Economy, General Science, Environmental Ecology, Current Affairs (National & International), State-specific topics. Optional Subject: Choose from Literature, History, Geography, Public Administration, Sociology, etc.',
      },
      {
        name: 'Bank Clerk (IBPS/SBI)',
        conductingBody: 'IBPS / SBI',
        category: 'Banking',
        description: 'Recruitment for Clerk/Junior Associate positions in public sector banks. Easier than PO exams with good job security.',
        qualification: 'Bachelor\'s Degree in any discipline',
        ageLimit: { min: 20, max: 28, relaxation: 'OBC: 3 years, SC/ST: 5 years' },
        officialWebsite: 'https://www.ibps.in/',
        applicationLink: 'https://www.ibps.in/',
        vacancies: 10000,
        examMode: 'Online',
        stages: ['Prelims', 'Mains'],
        examPattern: 'Prelims: English Language (30 Q), Numerical Ability (35 Q), Reasoning Ability (35 Q) = 100 marks. Mains: Reasoning & Computer Aptitude (45 Q), General/Economy/Banking Awareness (50 Q), English Language (40 Q), Data Analysis & Interpretation (35 Q).',
        apiSource: 'baseline',
        externalId: 'baseline_bank_clerk_014',
        isActive: true,
        syllabusOverview: 'Similar to PO exams but with easier difficulty level. Focus on Speed & Accuracy in Quantitative Aptitude, Basic Reasoning, English Grammar & Comprehension, and Banking Awareness.',
      },
      {
        name: 'UPSC EPFO (Employees\' Provident Fund Organisation)',
        conductingBody: 'Union Public Service Commission (UPSC)',
        category: 'UPSC',
        description: 'Recruitment for Enforcement Officer/Accounts Officer and other positions in EPFO. Good work-life balance with central government benefits.',
        qualification: 'Bachelor\'s Degree from recognized university',
        ageLimit: { min: 21, max: 40, relaxation: 'OBC: 3 years, SC/ST: 5 years' },
        officialWebsite: 'https://upsc.gov.in/',
        applicationLink: 'https://upsconline.nic.in/',
        vacancies: 500,
        examMode: 'Offline',
        stages: ['Recruitment Test', 'Interview'],
        examPattern: 'General English (25 Q), Indian Freedom Struggle (25 Q), Current Events (25 Q), Indian Economy (25 Q), General Accounting Principles (25 Q), Industrial Relations & Labour Laws (25 Q), General Science & Computer Applications (25 Q), Quantitative Aptitude (25 Q) = 200 marks.',
        apiSource: 'baseline',
        externalId: 'baseline_epfo_015',
        isActive: true,
        syllabusOverview: 'English: Grammar, Vocabulary, Comprehension. History: Indian National Movement (1857-1947). Economy: Indian Economy, Planning, Poverty, Inflation. Accounting: Basic Accounting Principles, Book-keeping. Labour Laws: Industrial Disputes Act, Factories Act, EPF Act. Computer: Basics, MS Office, Internet.',
      },
    ];
  }

  /**
   * Scrape from RSS feeds (FreeJobAlert, Employment News)
   */
  async scrapeFromRSSFeeds() {
    const exams = [];
    const rssFeeds = [
      { url: 'https://www.freejobalert.com/feed/', source: 'freejobalert' },
      { url: 'https://employmentnews.gov.in/Rss.aspx', source: 'employmentnews' },
    ];

    for (const feed of rssFeeds) {
      try {
        const feedData = await parser.parseURL(feed.url);
        
        if (feedData.items) {
          for (const item of feedData.items) {
            const exam = this.parseRSSItem(item, feed.source);
            if (exam) {
              exams.push(exam);
            }
          }
        }
      } catch (error) {
        logger.warn(`Failed to parse RSS feed ${feed.url}: ${error.message}`);
      }
    }

    return exams;
  }

  /**
   * Parse RSS feed item into exam object
   */
  parseRSSItem(item, source) {
    try {
      const title = item.title || '';
      const content = item.contentSnippet || item.content || '';
      const link = item.link || '#';

      // Determine exam category from title/content
      const category = this.categorizeExam(title, content);
      
      // Extract key information
      const examInfo = this.extractExamInfo(title, content);

      return {
        name: examInfo.name || title,
        conductingBody: examInfo.conductingBody || this.extractConductingBody(title),
        category,
        description: content.substring(0, 500),
        qualification: examInfo.qualification || 'As per official notification',
        ageLimit: examInfo.ageLimit || {},
        examDate: examInfo.examDate || null,
        examDateText: examInfo.examDateText || 'To be announced',
        applicationDeadline: examInfo.applicationDeadline || null,
        officialWebsite: this.extractOfficialWebsite(title),
        applicationLink: link,
        vacancies: examInfo.vacancies || null,
        stages: examInfo.stages || [],
        apiSource: source,
        externalId: `rss_${Math.random().toString(36).substr(2, 9)}`,
        lastScraped: new Date(),
        isActive: true,
      };
    } catch (error) {
      logger.warn(`Error parsing RSS item: ${error.message}`);
      return null;
    }
  }

  /**
   * Scrape Sarkari Result for latest exams
   */
  async scrapeSarkariResult() {
    const exams = [];
    
    try {
      const response = await axios.get('https://www.sarkariresult.com/', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      // Parse latest job sections
      $('table').each((index, table) => {
        try {
          $(table).find('a').each((idx, link) => {
            const title = $(link).text().trim();
            const href = $(link).attr('href');

            if (title && title.length > 10 && title.toLowerCase().includes('recruitment')) {
              const category = this.categorizeExam(title, title);
              
              exams.push({
                name: title,
                conductingBody: this.extractConductingBody(title),
                category,
                description: `Latest recruitment notification - ${title}`,
                qualification: 'As per official notification',
                ageLimit: {},
                officialWebsite: 'https://www.sarkariresult.com/',
                applicationLink: href ? `https://www.sarkariresult.com/${href}` : '#',
                vacancies: null,
                stages: [],
                apiSource: 'sarkariresult',
                externalId: `sr_${Math.random().toString(36).substr(2, 9)}`,
                lastScraped: new Date(),
                isActive: true,
              });
            }
          });
        } catch (error) {
          // Skip malformed entries
        }
      });
    } catch (error) {
      logger.warn(`Sarkari Result scraping failed: ${error.message}`);
    }

    return exams.slice(0, 50); // Limit to 50 exams
  }

  /**
   * Scrape UPSC official website
   */
  async scrapeUPSC() {
    const exams = [];

    try {
      const response = await axios.get('https://upsc.gov.in/', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      // Look for examination notifications
      $('a').each((index, element) => {
        const title = $(element).text().trim();
        const href = $(element).attr('href');

        if (title && (title.toLowerCase().includes('examination') || title.toLowerCase().includes('recruitment'))) {
          exams.push({
            name: title,
            conductingBody: 'Union Public Service Commission (UPSC)',
            category: 'UPSC',
            description: `UPSC Examination Notification - ${title}`,
            qualification: 'As per UPSC notification',
            ageLimit: {},
            officialWebsite: 'https://upsc.gov.in/',
            applicationLink: href ? `https://upsc.gov.in/${href}` : 'https://upsc.gov.in/',
            vacancies: null,
            stages: ['Prelims', 'Mains', 'Interview'],
            apiSource: 'upsc',
            externalId: `upsc_${Math.random().toString(36).substr(2, 9)}`,
            lastScraped: new Date(),
            isActive: true,
          });
        }
      });
    } catch (error) {
      logger.warn(`UPSC scraping failed: ${error.message}`);
    }

    return exams.slice(0, 20);
  }

  /**
   * Categorize exam based on title and content
   */
  categorizeExam(title, content) {
    const text = `${title} ${content}`.toLowerCase();

    if (text.includes('upsc') || text.includes('civil services') || text.includes('ias') || text.includes('ips')) {
      return 'UPSC';
    }
    if (text.includes('ssc') || text.includes('staff selection')) {
      return 'SSC';
    }
    if (text.includes('bank') || text.includes('ibps') || text.includes('sbi') || text.includes('rbi')) {
      return 'Banking';
    }
    if (text.includes('railway') || text.includes('rrb') || text.includes('rail')) {
      return 'Railway';
    }
    if (text.includes('nda') || text.includes('cds') || text.includes('defence') || text.includes('army') || text.includes('navy') || text.includes('air force')) {
      return 'Defence';
    }
    if (text.includes('neet') || text.includes('jee') || text.includes('cet') || text.includes('gate') || text.includes('entrance')) {
      return 'Entrance';
    }
    if (text.includes('psc') || text.includes('state commission')) {
      return 'State PSC';
    }
    if (text.includes('teacher') || text.includes('ctet') || text.includes('tet') || text.includes('professor')) {
      return 'Teaching';
    }

    return 'Other';
  }

  /**
   * Extract conducting body from title
   */
  extractConductingBody(title) {
    const bodies = [
      'UPSC', 'SSC', 'IBPS', 'SBI', 'RBI', 'RRB', 'NTA', 'IIT', 'NIT',
      'State PSC', 'TSPSC', 'APPSC', 'KPSC', 'MPSC', 'RPSC', 'BPSC',
      'UPPSC', 'MPPSC', 'GPSC', 'JKPSC', 'HPSC', 'UKPSC', 'OPSC',
    ];

    for (const body of bodies) {
      if (title.toUpperCase().includes(body.toUpperCase())) {
        return body;
      }
    }

    return 'Government of India';
  }

  /**
   * Extract official website URL based on conducting body
   */
  extractOfficialWebsite(title) {
    const titleUpper = title.toUpperCase();

    if (titleUpper.includes('UPSC')) return 'https://upsc.gov.in/';
    if (titleUpper.includes('SSC')) return 'https://ssc.nic.in/';
    if (titleUpper.includes('IBPS')) return 'https://www.ibps.in/';
    if (titleUpper.includes('SBI')) return 'https://sbi.co.in/';
    if (titleUpper.includes('RRB')) return 'https://www.rrbcdg.gov.in/';
    if (titleUpper.includes('NEET') || titleUpper.includes('JEE')) return 'https://nta.ac.in/';
    if (titleUpper.includes('TSPSC')) return 'https://tspsc.gov.in/';
    if (titleUpper.includes('APPSC')) return 'https://psc.ap.gov.in/';
    if (titleUpper.includes('KPSC')) return 'https://kpsc.kar.nic.in/';

    return '#';
  }

  /**
   * Extract exam information from content
   */
  extractExamInfo(title, content) {
    const info = {
      name: title,
      conductingBody: null,
      qualification: null,
      ageLimit: {},
      examDate: null,
      examDateText: null,
      applicationDeadline: null,
      vacancies: null,
      stages: [],
    };

    // Extract vacancies
    const vacancyMatch = content.match(/(\d+)\s*(vacancies?|posts?)/i);
    if (vacancyMatch) {
      info.vacancies = parseInt(vacancyMatch[1]);
    }

    // Extract last date
    const lastDateMatch = content.match(/last\s*date.*?(\d{2}[-/]\d{2}[-/]\d{4})/i);
    if (lastDateMatch) {
      info.applicationDeadline = new Date(lastDateMatch[1]);
    }

    // Extract exam stages
    if (title.toLowerCase().includes('prelims') || title.toLowerCase().includes('preliminary')) {
      info.stages.push('Prelims');
    }
    if (title.toLowerCase().includes('mains')) {
      info.stages.push('Mains');
    }
    if (title.toLowerCase().includes('interview')) {
      info.stages.push('Interview');
    }

    return info;
  }

  /**
   * Deduplicate exams based on name and conducting body
   */
  deduplicateExams(exams) {
    const seen = new Set();
    const unique = [];

    for (const exam of exams) {
      const key = `${exam.name}_${exam.conductingBody}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(exam);
      }
    }

    return unique;
  }

  /**
   * Save exams to database
   */
  async saveExamsToDB(exams) {
    const operations = exams.map(exam => ({
      updateOne: {
        filter: { 
          externalId: exam.externalId,
          apiSource: exam.apiSource,
        },
        update: { $set: exam },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Exam.bulkWrite(operations);
    }
  }

  /**
   * Get exams from cache or database
   */
  async getExams(filters = {}) {
    try {
      console.log('📦 getExams called with filters:', filters);
      
      const cacheKey = `exams_${JSON.stringify(filters)}`;
      const cached = examCache.get(cacheKey);

      if (cached) {
        logger.info('📦 Returning cached exams');
        return cached;
      }

      const query = { isActive: true };
      
      if (filters.category && filters.category !== 'all') {
        query.category = filters.category;
      }

      // Use regex search instead of $text (doesn't require text index)
      if (filters.search && filters.search.trim()) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { conductingBody: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { category: { $regex: filters.search, $options: 'i' } },
        ];
      }

      console.log('📊 MongoDB query:', JSON.stringify(query));

      const exams = await Exam.find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * 20)
        .limit(20)
        .lean(); // Convert to plain JavaScript objects for caching

      console.log('✅ Found exams:', exams.length);

      const total = await Exam.countDocuments(query);

      const result = {
        exams,
        total,
        page: filters.page || 1,
        totalPages: Math.ceil(total / 20),
      };

      // Cache for 6 hours
      examCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('❌ Error in getExams:', error);
      throw error;
    }
  }

  /**
   * Clear exam cache
   */
  clearCache() {
    examCache.flushAll();
    logger.info('🗑️ Exam cache cleared');
  }
}

module.exports = new ExamScraper();
