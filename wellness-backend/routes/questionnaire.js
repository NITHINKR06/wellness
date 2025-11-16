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
    body('support').isBoolean().withMessage('Support must be a boolean'),
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

      // Calculate score (count of positive responses)
      const positiveCount = [appetite, mood, support, history].filter(Boolean).length;
      
      // Determine result label based on score
      // If 2 or more positive responses, it's "Possible PPD Risk"
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

      // Save to database
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

// GET /api/questionnaire - Get all questionnaire responses
router.get('/', async (req, res) => {
  try {
    const responses = await Response.find().sort({ createdAt: -1 });
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

module.exports = router;

