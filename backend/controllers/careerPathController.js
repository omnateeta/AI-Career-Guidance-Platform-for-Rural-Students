const CareerNode = require('../models/CareerNode');
const CareerSession = require('../models/CareerSession');
const aiCareerService = require('../services/aiCareerService');
const educationScraper = require('../services/educationScraper');
const { careerCache } = require('../config/cache');
const logger = require('../config/logger');

// @desc    Generate initial career paths based on education level
// @route   POST /api/career/generate-paths
// @access  Private
exports.generatePaths = async (req, res) => {
  try {
    const { educationLevel } = req.body;

    if (!educationLevel) {
      return res.status(400).json({
        success: false,
        message: 'Education level is required',
      });
    }

    // Check MongoDB cache first
    const cachedNodes = await CareerNode.find({
      educationLevel,
      parentNodeId: null,
      expiresAt: { $gt: new Date() },
    }).lean(); // Use .lean() to return plain JavaScript objects

    if (cachedNodes.length > 0) {
      logger.info(`Returning cached paths for ${educationLevel}`);
      
      // Create session to track exploration
      const session = await CareerSession.create({
        userId: req.user.id,
        startingEducation: educationLevel,
        exploredNodes: cachedNodes.map((n) => ({
          nodeId: n.nodeId,
          timestamp: new Date(),
          depth: 0,
        })),
      });

      // Clean the nodes before sending
      const cleanNodes = cachedNodes.map(node => ({
        nodeId: node.nodeId,
        parentNodeId: node.parentNodeId,
        educationLevel: node.educationLevel,
        label: node.label,
        category: node.category,
        description: node.description,
        duration: node.duration,
        eligibility: node.eligibility,
        demand: node.demand,
        metadata: node.metadata,
        depth: node.depth,
        children: node.children || [],
      }));

      return res.json({
        success: true,
        data: {
          nodes: cleanNodes,
          sessionId: session._id,
        },
        cached: true,
      });
    }

    // Check in-memory cache
    const cacheKey = `initial-paths-${educationLevel}`;
    const memoryCached = careerCache.get(cacheKey);
    if (memoryCached) {
      const session = await CareerSession.create({
        userId: req.user.id,
        startingEducation: educationLevel,
        exploredNodes: memoryCached.map((n) => ({
          nodeId: n.nodeId,
          timestamp: new Date(),
          depth: 0,
        })),
      });

      return res.json({
        success: true,
        data: { nodes: memoryCached, sessionId: session._id },
        cached: true,
      });
    }

    // Generate via AI
    logger.info(`Generating new paths for ${educationLevel} via AI`);
    const nodes = await aiCareerService.generateInitialPaths(educationLevel);

    // Save to MongoDB
    await CareerNode.insertMany(nodes);

    // Convert to plain objects and remove Mongoose internals
    const cleanNodes = nodes.map(node => ({
      nodeId: node.nodeId,
      parentNodeId: node.parentNodeId,
      educationLevel: node.educationLevel,
      label: node.label,
      category: node.category,
      description: node.description,
      duration: node.duration,
      eligibility: node.eligibility,
      demand: node.demand,
      metadata: node.metadata,
      depth: node.depth,
      children: node.children || [],
    }));

    // Save to memory cache
    careerCache.set(cacheKey, cleanNodes);

    // Create session
    const session = await CareerSession.create({
      userId: req.user.id,
      startingEducation: educationLevel,
      exploredNodes: cleanNodes.map((n) => ({
        nodeId: n.nodeId,
        timestamp: new Date(),
        depth: 0,
      })),
    });

    res.json({
      success: true,
      data: { nodes: cleanNodes, sessionId: session._id },
      cached: false,
    });
  } catch (error) {
    logger.error('Error generating paths:', error);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate career paths',
      error: error.message,
      details: error.response?.data || error.stack,
    });
  }
};

// @desc    Expand a node to show its children
// @route   POST /api/career/expand-node/:nodeId
// @access  Private
exports.expandNode = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { sessionId } = req.body;

    if (!nodeId) {
      return res.status(400).json({
        success: false,
        message: 'Node ID is required',
      });
    }

    // Check if parent node exists
    const parentNode = await CareerNode.findOne({ nodeId });

    if (!parentNode) {
      return res.status(404).json({
        success: false,
        message: 'Node not found',
      });
    }

    // Check if children are already cached
    if (parentNode.children && parentNode.children.length > 0) {
      const cachedChildren = await CareerNode.find({
        nodeId: { $in: parentNode.children },
        expiresAt: { $gt: new Date() },
      }).lean(); // Use .lean() to return plain JavaScript objects

      if (cachedChildren.length === parentNode.children.length) {
        logger.info(`Returning cached children for ${nodeId}`);
        
        // Track exploration
        if (sessionId) {
          await CareerSession.findByIdAndUpdate(sessionId, {
            $push: {
              exploredNodes: {
                nodeId,
                timestamp: new Date(),
                depth: parentNode.depth + 1,
              },
            },
          });
        }

        return res.json({
          success: true,
          data: { children: cachedChildren, parentNode },
          cached: true,
        });
      }
    }

    // Generate children via AI
    logger.info(`Expanding node: ${parentNode.label}`);
    const children = await aiCareerService.expandNode(nodeId, parentNode);

    // Update parent with child references
    parentNode.children = children.map((c) => c.nodeId);
    await parentNode.save();

    // Cache children in MongoDB
    await CareerNode.insertMany(children);

    // Clean children data before sending
    const cleanChildren = children.map(child => ({
      nodeId: child.nodeId,
      parentNodeId: child.parentNodeId,
      educationLevel: child.educationLevel,
      label: child.label,
      category: child.category,
      description: child.description,
      duration: child.duration,
      eligibility: child.eligibility,
      demand: child.demand,
      metadata: child.metadata,
      depth: child.depth,
      children: child.children || [],
    }));

    // Track exploration
    if (sessionId) {
      await CareerSession.findByIdAndUpdate(sessionId, {
        $push: {
          exploredNodes: {
            nodeId,
            timestamp: new Date(),
            depth: parentNode.depth + 1,
          },
        },
      });
    }

    res.json({
      success: true,
      data: { children: cleanChildren, parentNode },
      cached: false,
    });
  } catch (error) {
    logger.error('Error expanding node:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to expand node',
      error: error.message,
    });
  }
};

// @desc    Get detailed career information
// @route   GET /api/career/career-details/:nodeId
// @access  Private
exports.getCareerDetails = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { language } = req.query;

    if (!nodeId) {
      return res.status(400).json({
        success: false,
        message: 'Node ID is required',
      });
    }

    logger.info(`Fetching career details for: ${nodeId}`);

    // Try to find in MongoDB first
    const node = await CareerNode.findOne({ nodeId }).lean();

    if (!node) {
      logger.warn(`Node not found in database: ${nodeId}`);
      return res.status(404).json({
        success: false,
        message: 'Career node not found',
      });
    }

    // Generate detailed info via AI service
    const details = await aiCareerService.getCareerDetails(node);

    logger.info(`Successfully retrieved details for: ${nodeId}`);

    res.json({
      success: true,
      data: { details, node },
    });
  } catch (error) {
    logger.error('Error getting career details:', error);
    console.error('Full error:', error);
    
    // Return error with helpful message
    res.status(500).json({
      success: false,
      message: 'Failed to get career details',
      error: error.message,
      hint: 'The frontend will use fallback data from node metadata',
    });
  }
};

// @desc    Get user's exploration history
// @route   GET /api/career/exploration-history
// @access  Private
exports.getExplorationHistory = async (req, res) => {
  try {
    const sessions = await CareerSession.getUserSessions(req.user.id, 10);

    res.json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    logger.error('Error getting exploration history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exploration history',
      error: error.message,
    });
  }
};

// @desc    Get trending careers (from scraped data)
// @route   GET /api/career/trending
// @access  Private
exports.getTrendingCareers = async (req, res) => {
  try {
    const jobTrends = await educationScraper.scrapeJobTrends();

    res.json({
      success: true,
      data: { jobTrends },
    });
  } catch (error) {
    logger.error('Error getting trending careers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending careers',
      error: error.message,
    });
  }
};
