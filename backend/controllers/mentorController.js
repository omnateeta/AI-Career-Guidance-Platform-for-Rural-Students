const Mentor = require('../models/Mentor');
const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Get all available mentors
// @route   GET /api/mentors
// @access  Private
exports.getAllMentors = async (req, res) => {
  try {
    const { expertise, language, available } = req.query;

    // Build query
    let query = { isVerified: true };

    if (expertise) {
      query.expertise = { $in: [expertise] };
    }

    if (language) {
      query.languagesSpoken = { $in: [language] };
    }

    if (available === 'true') {
      query['availability.status'] = 'available';
    }

    const mentors = await Mentor.find(query)
      .populate('userId', 'profile.name profile.avatar profile.location')
      .sort({ 'rating.average': -1, totalSessions: -1 })
      .lean();

    // Format response
    const formattedMentors = mentors.map(mentor => ({
      id: mentor._id,
      name: mentor.userId?.profile?.name || 'Anonymous Mentor',
      avatar: mentor.userId?.profile?.avatar || '👨‍💼',
      title: `${mentor.profile.currentRole || 'Professional'} at ${mentor.profile.currentCompany || 'Company'}`,
      bio: mentor.profile.bio,
      expertise: mentor.expertise,
      languages: mentor.languagesSpoken,
      rating: mentor.rating.average,
      reviewCount: mentor.rating.count,
      totalSessions: mentor.totalSessions,
      available: mentor.availability.status === 'available',
      availability: mentor.availability,
      nextSlot: getNextAvailableSlot(mentor.availability),
      responseTime: mentor.responseTime,
      isFeatured: mentor.isFeatured,
    }));

    logger.info(`Fetched ${formattedMentors.length} mentors`);

    res.json({
      success: true,
      data: { mentors: formattedMentors },
    });
  } catch (error) {
    logger.error('Error fetching mentors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors',
      error: error.message,
    });
  }
};

// @desc    Book a mentorship session
// @route   POST /api/mentors/:id/book
// @access  Private
exports.bookSession = async (req, res) => {
  try {
    const { date, timeSlot, message, sessionType } = req.body;
    const mentorId = req.params.id;

    if (!date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Date and time slot are required',
      });
    }

    const mentor = await Mentor.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    if (!mentor.canAcceptStudents()) {
      return res.status(400).json({
        success: false,
        message: 'Mentor is currently unavailable or at capacity',
      });
    }

    // Create session booking
    const session = {
      studentId: req.user.id,
      mentorId: mentor._id,
      date: new Date(date),
      timeSlot,
      sessionType: sessionType || 'video',
      message: message || '',
      status: 'pending',
      bookedAt: new Date(),
    };

    // In a real app, you'd save this to a Session model
    // For now, we'll increment the current students count
    mentor.availability.currentStudents += 1;
    mentor.totalSessions += 1;
    await mentor.save();

    logger.info(`Session booked with mentor ${mentor._id} by student ${req.user.id}`);

    res.json({
      success: true,
      message: 'Session booked successfully! Mentor will confirm shortly.',
      data: {
        session,
        mentorName: mentor.userId?.profile?.name,
      },
    });
  } catch (error) {
    logger.error('Error booking session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book session',
      error: error.message,
    });
  }
};

// @desc    Send message to mentor
// @route   POST /api/mentors/:id/message
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const mentorId = req.params.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    const mentor = await Mentor.findById(mentorId).populate('userId');

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    // In a real app, save to Message model
    // For now, return success response
    logger.info(`Message sent to mentor ${mentorId} from ${req.user.id}`);

    res.json({
      success: true,
      message: 'Message sent successfully!',
      data: {
        mentorName: mentor.userId?.profile?.name,
        messageSent: message,
        timestamp: new Date(),
        expectedResponse: mentor.responseTime,
      },
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

// @desc    Get mentor details
// @route   GET /api/mentors/:id
// @access  Private
exports.getMentorDetails = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('userId', 'profile.name profile.avatar profile.location profile.email')
      .lean();

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    res.json({
      success: true,
      data: { mentor },
    });
  } catch (error) {
    logger.error('Error fetching mentor details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor details',
      error: error.message,
    });
  }
};

// @desc    Get mentor reviews
// @route   GET /api/mentors/:id/reviews
// @access  Public
exports.getMentorReviews = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('reviews.studentId', 'profile.name profile.avatar')
      .lean();

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    res.json({
      success: true,
      data: {
        reviews: mentor.reviews,
        averageRating: mentor.rating.average,
        totalReviews: mentor.rating.count,
      },
    });
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// @desc    Apply to become a mentor
// @route   POST /api/mentors/apply
// @access  Private
exports.applyToBecomeMentor = async (req, res) => {
  try {
    const {
      bio,
      tagline,
      expertise,
      industries,
      languagesSpoken,
      yearsOfExperience,
      currentRole,
      currentCompany,
      linkedIn,
      website,
      availableHours,
      maxStudents,
      whyDoYouWantToMentor,
    } = req.body;

    // Validate required fields
    if (!bio || !expertise || !languagesSpoken || !whyDoYouWantToMentor) {
      return res.status(400).json({
        success: false,
        message: 'Bio, expertise, languages, and motivation are required',
      });
    }

    // Check if user is already a mentor
    const existingMentor = await Mentor.findOne({ userId: req.user.id });
    if (existingMentor) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a mentor',
      });
    }

    // Check if user has completed their profile
    const user = await User.findById(req.user.id);
    if (!user || !user.profile || !user.profile.name) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile first',
      });
    }

    // Create mentor profile with pending verification
    const mentor = await Mentor.create({
      userId: req.user.id,
      profile: {
        bio,
        tagline: tagline || '',
        yearsOfExperience: yearsOfExperience || 0,
        currentRole: currentRole || '',
        currentCompany: currentCompany || '',
        linkedIn: linkedIn || '',
        website: website || '',
      },
      expertise: Array.isArray(expertise) ? expertise : [expertise],
      industries: industries || [],
      languagesSpoken: Array.isArray(languagesSpoken) ? languagesSpoken : [languagesSpoken],
      availability: {
        status: 'unavailable', // Start as unavailable until verified
        maxStudents: maxStudents || 5,
        currentStudents: 0,
        availableHours: availableHours || [],
      },
      isVerified: false, // Requires admin verification
      isFeatured: false,
      totalSessions: 0,
      rating: {
        average: 0,
        count: 0,
      },
      reviews: [],
      matchedStudents: [],
      responseTime: 'within 48 hours',
    });

    // Update user role to mentor
    user.role = 'mentor';
    await user.save();

    logger.info(`User ${req.user.id} applied to become a mentor`);

    res.status(201).json({
      success: true,
      message: 'Your mentor application has been submitted successfully! Our team will review it within 48 hours.',
      data: {
        mentor: {
          id: mentor._id,
          isVerified: mentor.isVerified,
          status: 'pending_review',
        },
      },
    });
  } catch (error) {
    logger.error('Error applying to become mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit mentor application',
      error: error.message,
    });
  }
};

// @desc    Check if user is a mentor
// @route   GET /api/mentors/my-status
// @access  Private
exports.getMyMentorStatus = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.id })
      .populate('userId', 'profile.name profile.email profile.location')
      .lean();

    if (!mentor) {
      return res.json({
        success: true,
        data: {
          isMentor: false,
          status: 'not_registered',
        },
      });
    }

    res.json({
      success: true,
      data: {
        isMentor: true,
        status: mentor.isVerified ? 'verified' : 'pending_review',
        mentor: {
          id: mentor._id,
          isVerified: mentor.isVerified,
          totalSessions: mentor.totalSessions,
          rating: mentor.rating,
          availability: mentor.availability,
          expertise: mentor.expertise,
          matchedStudents: mentor.matchedStudents.length,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching mentor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor status',
      error: error.message,
    });
  }
};

// Helper function to get next available slot
function getNextAvailableSlot(availability) {
  if (!availability || !availability.availableHours || availability.availableHours.length === 0) {
    return null;
  }

  if (availability.status !== 'available') {
    return null;
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  const currentDay = days[today.getDay()];
  const currentTime = today.getHours();

  // Find next available day
  for (let i = 0; i < availability.availableHours.length; i++) {
    const slot = availability.availableHours[i];
    const dayIndex = days.indexOf(slot.day);
    const todayIndex = days.indexOf(currentDay);

    if (dayIndex >= todayIndex) {
      const dayName = slot.day.charAt(0).toUpperCase() + slot.day.slice(1);
      if (dayIndex === todayIndex) {
        return `Today, ${slot.startTime}`;
      } else if (dayIndex === todayIndex + 1) {
        return `Tomorrow, ${slot.startTime}`;
      } else {
        return `${dayName}, ${slot.startTime}`;
      }
    }
  }

  return 'Next week';
}
