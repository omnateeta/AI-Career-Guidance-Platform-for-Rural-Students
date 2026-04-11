const OpenAI = require('openai');
const logger = require('../config/logger');

class CommunicationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  /**
   * Process communication request and get AI response
   */
  async processCommunication(message, mode, language, context = {}) {
    try {
      const { level = 'beginner', topic = '' } = context;
      
      // Build prompt based on mode
      const prompt = this.buildPrompt(message, mode, language, level, topic);
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI communication coach. Always respond in valid JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Parse AI response
      const aiResponse = response.choices[0].message.content;
      const parsedResponse = this.parseAIResponse(aiResponse);

      // Add metadata
      parsedResponse.mode = mode;
      parsedResponse.language = language;
      parsedResponse.xp_earned = this.calculateXP(parsedResponse, mode);

      return parsedResponse;
    } catch (error) {
      logger.error(`Error in communication service: ${error.message}`);
      
      // Fallback to rule-based response if OpenAI fails
      if (error.status === 429 || error.code === 'insufficient_quota') {
        logger.warn('OpenAI quota exceeded, using fallback response');
        return this.getFallbackResponse(message, mode, language, context);
      }
      
      throw error;
    }
  }

  /**
   * Build mode-specific prompt for AI
   */
  buildPrompt(message, mode, language, level, topic) {
    const languageNames = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
    };

    const langName = languageNames[language] || 'English';

    switch (mode) {
      case 'practice':
        return this.buildPracticePrompt(message, langName, level, topic);
      case 'improve':
        return this.buildImprovePrompt(message, langName, level);
      case 'translate':
        return this.buildTranslatePrompt(message, langName);
      case 'interview':
        return this.buildInterviewPrompt(message, langName, level);
      default:
        return this.buildPracticePrompt(message, langName, level, topic);
    }
  }

  /**
   * Practice Mode Prompt
   */
  buildPracticePrompt(message, language, level, topic) {
    return `You are an AI communication coach helping rural Indian students improve their ${language} communication skills.

User Level: ${level}
Language: ${language}
Topic: ${topic || 'General conversation'}
User Message: "${message}"

Tasks:
1. Engage in natural, friendly conversation
2. Gently correct any grammar mistakes
3. Suggest better vocabulary or phrasing
4. Keep explanations simple and encouraging
5. Ask a follow-up question to continue practice

Return ONLY valid JSON in this exact format:
{
  "response": "Your conversational reply",
  "correction": "Corrected version of user's message if needed, otherwise null",
  "explanation": "Simple grammar or vocabulary tip",
  "confidence_score": 0-100,
  "next_question": "Follow-up question to keep conversation going",
  "vocabulary_suggestions": ["word1", "word2", "word3"]
}

Remember:
- Be encouraging and supportive
- Use simple language for beginners
- Focus on practical communication
- Make it feel like a real conversation`;
  }

  /**
   * Improve Mode Prompt
   */
  buildImprovePrompt(message, language, level) {
    return `You are an AI grammar and sentence improvement expert for ${language}.

User's sentence: "${message}"
User Level: ${level}

Tasks:
1. Detect all grammar errors
2. Provide corrected version
3. Provide improved/professional version
4. Explain each error simply
5. Give confidence score (0-100)
6. Suggest better vocabulary

Return ONLY valid JSON in this exact format:
{
  "original": "${message}",
  "corrected": "Grammatically correct version",
  "improved": "More professional/natural version",
  "grammar_errors": [
    {
      "error": "Description of the error",
      "correction": "How to fix it"
    }
  ],
  "explanation": "Clear, simple explanation of the main issues",
  "confidence_score": 0-100,
  "vocabulary_suggestions": ["better_word1", "better_word2", "better_word3"]
}

Rules:
- Be specific about errors
- Keep explanations simple
- Provide practical improvements
- Be encouraging`;
  }

  /**
   * Translate Mode Prompt
   */
  buildTranslatePrompt(message, sourceLanguage) {
    const targetLanguage = sourceLanguage === 'English' ? 'Hindi' : 'English';
    
    return `You are an expert translator and language teacher.

Source Language: ${sourceLanguage}
Target Language: ${targetLanguage}
Text to translate: "${message}"

Tasks:
1. Provide accurate translation
2. Explain cultural context if needed
3. Suggest alternative phrasings
4. Teach vocabulary from the translation

Return ONLY valid JSON in this exact format:
{
  "original": "${message}",
  "translated": "Accurate translation",
  "alternative_translations": ["variation1", "variation2"],
  "cultural_notes": "Important cultural context or usage tips",
  "vocabulary": [
    {
      "word": "original word",
      "translation": "translated word",
      "usage": "example sentence"
    }
  ],
  "pronunciation_tip": "How to pronounce key words",
  "confidence_score": 0-100
}

Rules:
- Maintain the original meaning
- Use natural, conversational language
- Include cultural nuances
- Be educational`;
  }

  /**
   * Interview Mode Prompt
   */
  buildInterviewPrompt(message, language, level) {
    return `You are conducting a professional job interview simulation in ${language}.

Candidate Level: ${level}
Position: Entry to Mid-level Professional Role
Previous Message: "${message || 'Starting interview'}"

Tasks:
1. If this is the start, ask a common interview question
2. If candidate responded, evaluate their answer
3. Provide feedback on their response
4. Suggest more professional phrasing
5. Give confidence score
6. Ask the next interview question

Return ONLY valid JSON in this exact format:
{
  "message": "Your response as interviewer or feedback",
  "feedback": "Constructive feedback on candidate's answer",
  "professional_version": "How to say it more professionally",
  "confidence_score": 0-100,
  "tips": ["tip1", "tip2", "tip3"],
  "next_question": "Next interview question to ask",
  "evaluation": {
    "clarity": "Score 0-100",
    "professionalism": "Score 0-100",
    "confidence": "Score 0-100"
  }
}

Interview Topics:
- Tell me about yourself
- Why should we hire you?
- What are your strengths/weaknesses?
- Where do you see yourself in 5 years?
- Describe a challenge you overcame

Rules:
- Be professional but encouraging
- Give specific, actionable feedback
- Help them improve their answers
- Simulate real interview scenarios`;
  }

  /**
   * Parse AI response and ensure valid JSON
   */
  parseAIResponse(aiResponse) {
    try {
      // Remove markdown code blocks if present
      let cleaned = aiResponse.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(cleaned);
      
      // Validate required fields
      if (!parsed.confidence_score && parsed.confidence_score !== 0) {
        parsed.confidence_score = 70; // Default
      }
      
      return parsed;
    } catch (error) {
      logger.error(`Failed to parse AI response: ${error.message}`);
      logger.error(`Raw response: ${aiResponse}`);
      
      // Return fallback response
      return {
        response: aiResponse,
        correction: null,
        explanation: 'Please try again with a clearer message.',
        confidence_score: 50,
        next_question: 'Can you rephrase that?',
        vocabulary_suggestions: [],
      };
    }
  }

  /**
   * Calculate XP earned based on response
   */
  calculateXP(response, mode) {
    let xp = 5; // Base XP for sending message
    
    // Bonus for grammar correction
    if (response.grammar_errors && response.grammar_errors.length > 0) {
      xp += 10;
    }
    
    // Bonus for low confidence (more room for improvement)
    if (response.confidence_score < 60) {
      xp += 5;
    }
    
    // Mode-specific bonuses
    if (mode === 'interview') {
      xp += 10; // Interview practice is harder
    }
    
    if (mode === 'translate') {
      xp += 8; // Translation requires more skill
    }
    
    return xp;
  }

  /**
   * Detect language from text
   */
  detectLanguage(text) {
    // Hindi (Devanagari script)
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi';
    }
    
    // Kannada script
    if (/[\u0C80-\u0CFF]/.test(text)) {
      return 'kn';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Generate daily exercise
   */
  async generateDailyExercise(level, language, mode) {
    const exercises = {
      beginner: [
        'Introduce yourself in 3 sentences',
        'Describe your daily routine',
        'Talk about your favorite hobby',
        'Write 5 sentences about your family',
      ],
      intermediate: [
        'Explain your career goals',
        'Describe a challenging situation and how you solved it',
        'Write a professional email requesting information',
        'Discuss the pros and cons of remote work',
      ],
      advanced: [
        'Present your views on AI in education',
        'Debate: Traditional jobs vs Freelancing',
        'Write a cover letter for your dream job',
        'Explain a complex topic in simple terms',
      ],
    };

    const levelExercises = exercises[level] || exercises.beginner;
    const randomExercise = levelExercises[Math.floor(Math.random() * levelExercises.length)];

    return {
      exercise: randomExercise,
      level,
      language,
      mode,
      xp_reward: 20,
    };
  }

  /**
   * Fallback response when OpenAI API is unavailable
   * Uses rule-based grammar checking and suggestions
   */
  getFallbackResponse(message, mode, language, context = {}) {
    const { level = 'beginner' } = context;
    
    // Common grammar rules for English
    const corrections = [];
    let corrected = message;
    let improved = message;
    let explanation = '';
    let confidenceScore = 80;

    if (language === 'English') {
      // Basic grammar checks
      if (/\bi\b(?![''])/g.test(message) && !/\bI\b/.test(message)) {
        corrections.push({
          error: 'Capitalize "I" when referring to yourself',
          correction: 'Change "i" to "I"',
        });
        corrected = corrected.replace(/\bi\b/g, 'I');
        confidenceScore -= 10;
      }

      // Missing "am" before "going"
      if (/\b(I|He|She|We|They) going\b/i.test(message) && !/\b(am|is|are|was|were) going\b/i.test(message)) {
        corrections.push({
          error: 'Missing auxiliary verb',
          correction: 'Add "am/is/are" before "going"',
        });
        corrected = corrected.replace(/(I) going/i, '$1 am going');
        corrected = corrected.replace(/(He|She) going/i, '$1 is going');
        corrected = corrected.replace(/(We|They) going/i, '$1 are going');
        confidenceScore -= 15;
      }

      // Common mistakes
      if (/\bgoed\b/i.test(message)) {
        corrections.push({
          error: 'Incorrect past tense',
          correction: 'Use "went" instead of "goed"',
        });
        corrected = corrected.replace(/goed/gi, 'went');
        confidenceScore -= 10;
      }

      if (/\bmore better\b/i.test(message)) {
        corrections.push({
          error: 'Double comparison',
          correction: 'Use "better" instead of "more better"',
        });
        corrected = corrected.replace(/more better/gi, 'better');
        confidenceScore -= 10;
      }

      // Generate improvement suggestion
      if (corrections.length > 0) {
        explanation = corrections.map(c => c.correction).join('. ');
        improved = corrected.charAt(0).toUpperCase() + corrected.slice(1);
      } else {
        explanation = 'Good job! Your sentence looks correct.';
        improved = message;
        confidenceScore = 90;
      }
    } else {
      // For Hindi/Kannada, provide basic encouragement
      explanation = language === 'Hindi' 
        ? 'अच्छा प्रयास! अभ्यास जारी रखें। (Good effort! Keep practicing.)'
        : 'ಉತ್ತಮ ಪ್ರಯತ್ನ! ಅಭ್ಯಾಸ ಮುಂದುವರಿಸಿ। (Good effort! Keep practicing.)';
      corrected = message;
      improved = message;
      confidenceScore = 85;
    }

    // Build mode-specific response
    const baseResponse = {
      original: message,
      corrected,
      improved,
      explanation,
      grammar_errors: corrections,
      confidence_score: Math.max(confidenceScore, 0),
      vocabulary_suggestions: [],
      xp_earned: 5,
      mode,
      language: language.toLowerCase() === 'english' ? 'en' : language.toLowerCase() === 'hindi' ? 'hi' : 'kn',
      note: 'AI service temporarily unavailable. Using basic grammar checker.',
    };

    // Add mode-specific fields
    switch (mode) {
      case 'practice':
        return {
          ...baseResponse,
          response: `Thanks for your message! ${explanation}`,
          next_question: 'Can you tell me more about your day?',
        };
      
      case 'improve':
        return {
          ...baseResponse,
          next_exercise: 'Try writing the same sentence in past tense.',
        };
      
      case 'translate':
        return {
          ...baseResponse,
          translation: message,
          note: 'Translation service requires OpenAI API. Please add credits to use this feature.',
        };
      
      case 'interview':
        return {
          ...baseResponse,
          feedback: 'Good start! Practice speaking clearly and confidently.',
          tips: ['Maintain eye contact', 'Speak slowly and clearly', 'Use professional vocabulary'],
          next_question: 'Tell me about your strengths and weaknesses.',
        };
      
      default:
        return baseResponse;
    }
  }
}

module.exports = new CommunicationService();
