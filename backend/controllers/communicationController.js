const communicationService = require('../services/communicationService');
const CommunicationProgress = require('../models/CommunicationProgress');
const logger = require('../config/logger');

// POST /api/ai/communicate - Main AI communication EVALUATOR endpoint
const communicate = async (req, res) => {
  try {
    const { message, mode, language, context } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    logger.info(`🎯 Communication request - Mode: ${mode || 'practice'}, Language: ${language || 'en'}`);

    // Auto-detect language if not specified
    const detectedLanguage = language || communicationService.detectLanguage(message);

    // EVALUATE sentence (not chat!)
    const evaluation = await communicationService.evaluateSentence(
      message,
      detectedLanguage,
      mode || 'practice'
    );

    logger.info(`✅ Evaluation result - Status: ${evaluation.status}, Score: ${evaluation.score}%`);

    // Track progress if user is authenticated
    if (userId) {
      try {
        const progress = await CommunicationProgress.getTodayProgress(userId);
        
        // Update progress metrics
        progress.messagesExchanged += 1;
        progress.mode = mode || 'practice';
        progress.language = detectedLanguage;
        
        // Update average score
        const totalScore = (progress.averageConfidenceScore * (progress.messagesExchanged - 1)) + evaluation.score;
        progress.averageConfidenceScore = Math.round(totalScore / progress.messagesExchanged);
        
        // Award XP based on score
        const xpEarned = evaluation.score >= 80 ? 15 : evaluation.score >= 60 ? 10 : 5;
        progress.awardXP(xpEarned);
        
        // Update streak
        progress.updateStreak();
        
        // Track grammar improvements
        if (evaluation.grammar_issues && evaluation.grammar_issues.length > 0) {
          progress.grammarImprovements += evaluation.grammar_issues.length;
        }
        
        // Track vocabulary from suggestions
        if (evaluation.suggestions && evaluation.suggestions.length > 0) {
          evaluation.suggestions.forEach(word => {
            if (!progress.vocabularyLearned.includes(word)) {
              progress.vocabularyLearned.push(word);
            }
          });
        }
        
        await progress.save();
        
        // Add progress data to response
        evaluation.progress = {
          xp_earned: xpEarned,
          total_xp: progress.totalXP,
          streak: progress.streak,
          level: progress.level,
        };
      } catch (error) {
        logger.error(`Error tracking progress: ${error.message}`);
        // Don't fail the request if progress tracking fails
      }
    }

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    logger.error(`❌ Error in communicate: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate communication',
      error: error.message,
    });
  }
};

// GET /api/ai/communicate/progress - Get user progress stats
const getProgress = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get today's progress
    const todayProgress = await CommunicationProgress.getTodayProgress(userId);
    
    // Get weekly stats
    const weeklyStats = await CommunicationProgress.getWeeklyStats(userId);
    
    // Get all-time stats
    const allTimeStats = await CommunicationProgress.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$messagesExchanged' },
          totalXP: { $max: '$totalXP' },
          totalExercises: { $sum: '$exercisesCompleted' },
          totalGrammarImprovements: { $sum: '$grammarImprovements' },
          maxStreak: { $max: '$streak' },
          currentLevel: { $last: '$level' },
          vocabularyCount: { $max: { $size: '$vocabularyLearned' } },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        today: todayProgress,
        weekly: weeklyStats,
        allTime: allTimeStats[0] || {
          totalMessages: 0,
          totalXP: 0,
          totalExercises: 0,
          totalGrammarImprovements: 0,
          maxStreak: 0,
          currentLevel: 'beginner',
          vocabularyCount: 0,
        },
      },
    });
  } catch (error) {
    logger.error(`Error getting progress: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message,
    });
  }
};

// GET /api/ai/communicate/exercises - Get daily exercises
const getExercises = async (req, res) => {
  try {
    const { mode = 'practice', language = 'en', level = 'beginner' } = req.query;

    const exercise = await communicationService.generateDailyExercise(
      level,
      language,
      mode
    );

    res.json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    logger.error(`Error generating exercise: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate exercise',
      error: error.message,
    });
  }
};

// POST /api/ai/communicate/level - Update user level manually
const updateLevel = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { level } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be: beginner, intermediate, advanced, or expert',
      });
    }

    const progress = await CommunicationProgress.getTodayProgress(userId);
    progress.level = level;
    await progress.save();

    res.json({
      success: true,
      message: `Level updated to ${level}`,
      data: {
        level: progress.level,
        totalXP: progress.totalXP,
      },
    });
  } catch (error) {
    logger.error(`Error updating level: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update level',
      error: error.message,
    });
  }
};

// POST /api/ai/communicate/voice - Process voice input (evaluates spoken sentence)
const processVoice = async (req, res) => {
  try {
    const { transcript, mode, language } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: 'Voice transcript is required',
      });
    }

    logger.info(`🎤 Voice evaluation request: "${transcript}"`);

    // Evaluate voice transcript same as text
    const evaluation = await communicationService.evaluateSentence(
      transcript,
      language || 'en',
      mode || 'practice'
    );

    res.json({
      success: true,
      data: {
        ...evaluation,
        voice_input: true,
        transcript,
      },
    });
  } catch (error) {
    logger.error(`Error processing voice: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate voice input',
      error: error.message,
    });
  }
};

module.exports = {
  communicate,
  getProgress,
  getExercises,
  updateLevel,
  processVoice,
};
