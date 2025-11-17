const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Response = require('../models/Response');
const { calculateRiskScore } = require('../utils/riskModel');
const authMiddleware = require('../middleware/auth');

// POST /api/questionnaire - Submit a questionnaire response
const QUESTION_IDS = ['q1','q2','q3','q4','q5','q6','q7','q8','q9'];

router.use(authMiddleware);

router.post(
  '/',
  [
    body('stage').notEmpty().withMessage('Stage is required'),
    body('region').notEmpty().withMessage('Region is required'),
    body('middleEastCountry').custom((value, { req }) => {
      if (req.body.region === 'Middle East') {
        if (!value || typeof value !== 'string') {
          throw new Error('Middle East country is required and must be a string when region is Middle East');
        }
      } else if (value && typeof value !== 'string') {
        throw new Error('Middle East country must be a string');
      }
      return true;
    }),
    body('sleepHours').isNumeric().withMessage('Sleep hours must be a number'),
    body('questionnaireResponses')
      .isObject()
      .withMessage('questionnaireResponses must be an object with boolean answers')
      .custom((responses) => {
        const missing = QUESTION_IDS.filter((id) => !Object.prototype.hasOwnProperty.call(responses, id));
        if (missing.length) {
          throw new Error(`Missing responses for: ${missing.join(', ')}`);
        }
        const invalid = Object.entries(responses).filter(
          ([key, value]) => !QUESTION_IDS.includes(key) || typeof value !== 'boolean'
        );
        if (invalid.length) {
          throw new Error('All responses must be booleans for known questions');
        }
        return true;
      }),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { stage, region, sleepHours, questionnaireResponses, middleEastCountry } = req.body;
      const normalizedCountry =
        typeof middleEastCountry === 'string' ? middleEastCountry.trim() : undefined;

      const {
        score,
        maxScore,
        threshold,
        resultLabel,
        riskFactors,
        breakdown,
        normalizedResponses,
        modelVersion,
      } = calculateRiskScore(questionnaireResponses);

      const appetite = normalizedResponses.q4 === true;
      const mood =
        normalizedResponses.q1 === true ||
        normalizedResponses.q2 === true ||
        normalizedResponses.q3 === true ||
        normalizedResponses.q5 === true ||
        normalizedResponses.q6 === true ||
        normalizedResponses.q7 === true;
      const supportValue = Object.prototype.hasOwnProperty.call(normalizedResponses, 'q9')
        ? normalizedResponses.q9
        : null;
      const history = normalizedResponses.q8 === true;

      // Create new response
      // Convert questionnaireResponses plain object to Map for Mongoose
      const questionnaireResponsesMap = new Map(Object.entries(normalizedResponses));
      
      const response = new Response({
        userId: req.userId,
        stage,
        region,
        sleepHours: parseFloat(sleepHours),
        middleEastCountry: region === 'Middle East' ? normalizedCountry : undefined,
        appetite,
        mood,
        support: supportValue,
        history,
        resultLabel,
        score,
        maxScore,
        riskThreshold: threshold,
        modelVersion,
        riskFactors,
        riskBreakdown: new Map(Object.entries(breakdown)),
        // Store normalized responses to guarantee consistent casing/booleans
        questionnaireResponses: questionnaireResponsesMap,
      });

      // Save to MongoDB - this is the single source of truth for all data
      // All questionnaire responses are permanently stored in MongoDB
      const savedResponse = await response.save();

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
      userId: req.userId,
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
      userId: req.userId,
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
    const response = await Response.findOne({ _id: req.params.id, userId: req.userId });
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
    const response = await Response.findOne({ _id: req.params.id, userId: req.userId });
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

