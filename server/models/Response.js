const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  stage: { type: String, required: true },
  region: { type: String, required: true },
  sleepHours: { type: Number, required: true, default: 0 },
  appetite: { type: Boolean, required: true },
  mood: { type: Boolean, required: true },
  support: { type: Boolean, required: false }, // true = adequate support, false = lack of support, null/undefined = not answered
  history: { type: Boolean, required: true },
  resultLabel: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true, default: 10 },
  riskFactors: { type: [String], default: [] },
  riskThreshold: { type: Number, required: true, default: 5 },
  modelVersion: { type: String, required: true, default: 'weighted-v1' },
  riskBreakdown: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  // Store individual question responses for accurate reconstruction
  // Using Schema.Types.Mixed to store a plain object with q1-q9 keys
  questionnaireResponses: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  deleted: { type: Boolean, default: false }, // Soft delete flag
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', ResponseSchema);

