const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Response = require('../models/Response');

// POST /api/questionnaire - Submit a questionnaire response
router.post(
  '/',
  [
    body('stage').notEmpty().withMessage('Stage is required'),
    body('region').notEmpty().withMessage('Region is required'),
    body('sleepHours').isNumeric().withMessage('Sleep hours must be a number'),
    body('appetite').isBoolean().withMessage('Appetite must be a boolean'),
    body('mood').isBoolean().withMessage('Mood must be a boolean'),
    body('support').optional({ nullable: true, checkFalsy: false }).custom((value) => {
      if (value === null || value === undefined || typeof value === 'boolean') {
        return true;
      }
      throw new Error('Support must be a boolean or null');
    }),
    body('history').isBoolean().withMessage('History must be a boolean'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { stage, region, sleepHours, appetite, mood, support, history, questionnaireResponses } = req.body;

      // Debug: Log received data
      console.log('[Backend] Received data:', { stage, region, sleepHours, appetite, mood, support, history, questionnaireResponses });

      // Calculate score (count of positive risk factors)
      // Note: support field handling:
      // - true = adequate support (NOT a risk factor)
      // - false = lack of support (IS a risk factor)
      // - null/undefined = not answered (NOT a risk factor - don't count it)
      // So we count !support (lack of support) as a positive risk factor, but only if support is explicitly false
      const supportRiskFactor = support === false ? true : false; // Only count if explicitly false (lack of support)
      const positiveCount = [appetite, mood, supportRiskFactor, history].filter(Boolean).length;
      
      // Debug: Log calculation
      console.log('[Backend] Risk calculation:', {
        appetite,
        mood,
        support,
        supportRiskFactor,
        history,
        positiveCount
      });
      
      // Determine result label based on score
      // If 2 or more positive risk factors, it's "Possible PPD Risk"
      const resultLabel = positiveCount >= 2 ? 'Possible PPD Risk' : 'Low Risk';

      // Create new response
      // Convert questionnaireResponses plain object to Map for Mongoose
      const questionnaireResponsesMap = questionnaireResponses 
        ? new Map(Object.entries(questionnaireResponses))
        : new Map();
      
      const response = new Response({
        stage,
        region,
        sleepHours: parseFloat(sleepHours),
        appetite,
        mood,
        support,
        history,
        resultLabel,
        score: positiveCount,
        // Store individual question responses if provided
        questionnaireResponses: questionnaireResponsesMap,
      });

      // Save to MongoDB - this is the single source of truth for all data
      // All questionnaire responses are permanently stored in MongoDB
      const savedResponse = await response.save();

      console.log(savedResponse,'savedResponse');

      res.status(201).json({
        success: true,
        data: savedResponse,
      });
    } catch (error) {
      console.error('Error saving response:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save questionnaire response',
        message: error.message,
      });
    }
  }
);

// GET /api/questionnaire - Get all questionnaire responses from MongoDB (excluding deleted)
router.get('/', async (req, res) => {
  try {
    // Fetch all non-deleted responses from MongoDB (single source of truth)
    // Filter out deleted items (only show where deleted is not true)
    const responses = await Response.find({ 
      deleted: { $ne: true }
    }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: responses.length,
      data: responses,
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questionnaire responses',
      message: error.message,
    });
  }
});

// GET /api/questionnaire/stats - Get aggregate statistics
router.get('/stats', async (req, res) => {
  try {
    const responses = await Response.find({ 
      deleted: { $ne: true }
    });

    if (responses.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          averageScore: 0,
          riskDistribution: {
            lowRisk: 0,
            possibleRisk: 0,
          },
          averageSleepHours: 0,
          averageSleepByStage: {},
          averageSleepByRegion: {},
        },
      });
    }

    // Calculate average risk score
    const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = (totalScore / responses.length).toFixed(2);

    // Risk distribution
    const riskDistribution = {
      lowRisk: responses.filter(r => r.resultLabel === 'Low Risk').length,
      possibleRisk: responses.filter(r => r.resultLabel === 'Possible PPD Risk').length,
    };

    // Average sleep hours
    const totalSleep = responses.reduce((sum, r) => sum + (r.sleepHours || 0), 0);
    const averageSleepHours = (totalSleep / responses.length).toFixed(2);

    // Average sleep by stage
    const sleepByStage = {};
    const stageCounts = {};
    responses.forEach(r => {
      if (!sleepByStage[r.stage]) {
        sleepByStage[r.stage] = 0;
        stageCounts[r.stage] = 0;
      }
      sleepByStage[r.stage] += r.sleepHours || 0;
      stageCounts[r.stage]++;
    });
    const averageSleepByStage = {};
    Object.keys(sleepByStage).forEach(stage => {
      averageSleepByStage[stage] = (sleepByStage[stage] / stageCounts[stage]).toFixed(2);
    });

    // Average sleep by region
    const sleepByRegion = {};
    const regionCounts = {};
    responses.forEach(r => {
      if (!sleepByRegion[r.region]) {
        sleepByRegion[r.region] = 0;
        regionCounts[r.region] = 0;
      }
      sleepByRegion[r.region] += r.sleepHours || 0;
      regionCounts[r.region]++;
    });
    const averageSleepByRegion = {};
    Object.keys(sleepByRegion).forEach(region => {
      averageSleepByRegion[region] = (sleepByRegion[region] / regionCounts[region]).toFixed(2);
    });

    res.json({
      success: true,
      data: {
        total: responses.length,
        averageScore: parseFloat(averageScore),
        riskDistribution,
        averageSleepHours: parseFloat(averageSleepHours),
        averageSleepByStage,
        averageSleepByRegion,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message,
    });
  }
});

// GET /api/questionnaire/:id - Get a specific questionnaire response
router.get('/:id', async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    if (!response) {
      return res.status(404).json({
        success: false,
        error: 'Response not found',
      });
    }
    // Don't return deleted responses
    if (response.deleted === true) {
      return res.status(404).json({
        success: false,
        error: 'Response not found',
      });
    }
    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questionnaire response',
      message: error.message,
    });
  }
});

// DELETE /api/questionnaire/:id - Soft delete a questionnaire response
router.delete('/:id', async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    if (!response) {
      return res.status(404).json({
        success: false,
        error: 'Response not found',
      });
    }

    // Soft delete: set deleted flag to true instead of actually deleting
    response.deleted = true;
    await response.save();

    res.json({
      success: true,
      message: 'Response deleted successfully',
      data: response,
    });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete questionnaire response',
      message: error.message,
    });
  }
});

module.exports = router;

