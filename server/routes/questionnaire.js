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

      const { stage, region, sleepHours, appetite, mood, support, history } = req.body;

      // Calculate score (count of positive risk factors)
      // Note: support field handling:
      // - true = adequate support (NOT a risk factor)
      // - false = lack of support (IS a risk factor)
      // - null/undefined = not answered (NOT a risk factor - don't count it)
      // So we count !support (lack of support) as a positive risk factor, but only if support is explicitly false
      const supportRiskFactor = support === false ? true : false; // Only count if explicitly false (lack of support)
      const positiveCount = [appetite, mood, supportRiskFactor, history].filter(Boolean).length;
      
      // Determine result label based on score
      // If 2 or more positive risk factors, it's "Possible PPD Risk"
      const resultLabel = positiveCount >= 2 ? 'Possible PPD Risk' : 'Low Risk';

      // Create new response
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

