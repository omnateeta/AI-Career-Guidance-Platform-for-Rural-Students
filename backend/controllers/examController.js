const examScraper = require('../services/examScraper');
const examPrepService = require('../services/examPrepService');
const Exam = require('../models/Exam');
const ExamUpdate = require('../models/ExamUpdate');
const SavedExam = require('../models/SavedExam');
const logger = require('../config/logger');

// GET /api/exams/all - Get all exams with filters
const getExams = async (req, res) => {
  try {
    console.log('🔍 Starting getExams...');
    const { category, search, page = 1 } = req.query;

    console.log('📊 Checking exam count...');
    // Check if database has exams, if not seed them automatically
    const examCount = await Exam.countDocuments();
    console.log('📊 Exam count:', examCount);
    
    if (examCount === 0) {
      logger.info('⚠️ No exams found in database. Seeding baseline exams...');
      const baselineExams = examScraper.getBaselineExams();
      await Exam.insertMany(baselineExams);
      logger.info(`✅ Seeded ${baselineExams.length} baseline exams`);
    }

    console.log('🔍 Fetching exams - Category:', category, 'Search:', search, 'Page:', page);

    const result = await examScraper.getExams({
      category,
      search,
      page: parseInt(page),
    });

    console.log('✅ Exams fetched:', result.exams.length, 'out of', result.total);

    res.json({
      success: true,
      count: result.exams.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      exams: result.exams,
    });
  } catch (error) {
    console.error('❌ Error in getExams:', error);
    logger.error(`Error in getExams: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: error.message,
    });
  }
};

// GET /api/exams/:examId - Get exam details with AI guide
const getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user?.id;

    console.log('📖 Fetching exam details:', examId);

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Increment views
    exam.views += 1;
    await exam.save();

    // Fetch latest updates for this exam
    const updates = await ExamUpdate.find({ examId, isActive: true })
      .sort({ date: -1 })
      .limit(10);

    // Generate or fetch AI preparation guide
    let preparationGuide = exam.preparationGuide;
    if (!preparationGuide || !preparationGuide.syllabusOverview) {
      console.log('🤖 Generating AI preparation guide...');
      preparationGuide = await examPrepService.generatePreparationGuide(
        exam,
        req.user?.profile?.education || '12th'
      );

      // Save generated guide to exam
      exam.preparationGuide = preparationGuide;
      await exam.save();
    }

    // Check if user saved this exam
    let isSaved = false;
    if (userId) {
      const savedExam = await SavedExam.findOne({ userId, examId });
      isSaved = !!savedExam;
    }

    res.json({
      success: true,
      exam,
      updates,
      preparationGuide,
      isSaved,
    });
  } catch (error) {
    logger.error(`Error in getExamDetails: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam details',
      error: error.message,
    });
  }
};

// GET /api/exams/category/:type - Get exams by category
const getExamsByCategory = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1 } = req.query;

    console.log('📂 Fetching exams by category:', type);

    const result = await examScraper.getExams({
      category: type,
      page: parseInt(page),
    });

    res.json({
      success: true,
      category: type,
      count: result.exams.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      exams: result.exams,
    });
  } catch (error) {
    logger.error(`Error in getExamsByCategory: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams by category',
      error: error.message,
    });
  }
};

// POST /api/exams/recommend - AI-powered recommendations
const getRecommendedExams = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    console.log('🤖 Generating exam recommendations for user:', userId);

    // Get user profile
    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userProfile = {
      education: user.profile?.education || '12th',
      interests: user.profile?.interests || [],
      location: user.profile?.location || '',
      preferredCategory: user.profile?.careerInterests?.[0] || '',
    };

    const recommendations = await examPrepService.recommendExams(userProfile);

    console.log('✅ Recommendations generated:', recommendations.length);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    logger.error(`Error in getRecommendedExams: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message,
    });
  }
};

// POST /api/exams/:examId/save - Save exam
const saveExam = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { examId } = req.params;
    const { reminderEnabled, reminderDaysBefore, notes } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    console.log('💾 Saving exam:', examId, 'for user:', userId);

    const savedExam = await SavedExam.findOneAndUpdate(
      { userId, examId },
      {
        userId,
        examId,
        reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : true,
        reminderDaysBefore: reminderDaysBefore || 7,
        notes: notes || '',
        savedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Increment saves count in exam
    await Exam.findByIdAndUpdate(examId, { $inc: { saves: 1 } });

    res.json({
      success: true,
      message: 'Exam saved successfully',
      savedExam,
    });
  } catch (error) {
    logger.error(`Error in saveExam: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to save exam',
      error: error.message,
    });
  }
};

// DELETE /api/exams/:examId/save - Unsave exam
const unsaveExam = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { examId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    console.log('🗑️ Unsaving exam:', examId, 'for user:', userId);

    await SavedExam.findOneAndDelete({ userId, examId });

    // Decrement saves count
    await Exam.findByIdAndUpdate(examId, { $inc: { saves: -1 } });

    res.json({
      success: true,
      message: 'Exam removed from saved list',
    });
  } catch (error) {
    logger.error(`Error in unsaveExam: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to unsave exam',
      error: error.message,
    });
  }
};

// GET /api/exams/saved - Get user's saved exams
const getSavedExams = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    console.log('📚 Fetching saved exams for user:', userId);

    const savedExams = await SavedExam.find({ userId })
      .populate('examId')
      .sort({ savedAt: -1 });

    res.json({
      success: true,
      count: savedExams.length,
      savedExams,
    });
  } catch (error) {
    logger.error(`Error in getSavedExams: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved exams',
      error: error.message,
    });
  }
};

// GET /api/exams/updates - Get latest exam updates
const getLatestUpdates = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    console.log('📢 Fetching latest exam updates');

    const updates = await ExamUpdate.find({ isActive: true })
      .populate('examId', 'name category conductingBody')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: updates.length,
      updates,
    });
  } catch (error) {
    logger.error(`Error in getLatestUpdates: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam updates',
      error: error.message,
    });
  }
};

// GET /api/exams/upcoming - Get exams with upcoming deadlines
const getUpcomingDeadlines = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    console.log('⏰ Fetching upcoming exam deadlines (next', days, 'days)');

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + parseInt(days));

    const exams = await Exam.find({
      isActive: true,
      applicationDeadline: {
        $gte: now,
        $lte: futureDate,
      },
    })
      .sort({ applicationDeadline: 1 })
      .limit(20);

    res.json({
      success: true,
      count: exams.length,
      days: parseInt(days),
      exams,
    });
  } catch (error) {
    logger.error(`Error in getUpcomingDeadlines: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming deadlines',
      error: error.message,
    });
  }
};

module.exports = {
  getExams,
  getExamDetails,
  getExamsByCategory,
  getRecommendedExams,
  saveExam,
  unsaveExam,
  getSavedExams,
  getLatestUpdates,
  getUpcomingDeadlines,
};
