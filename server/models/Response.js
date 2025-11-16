const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  region: { type: String, required: true },
  sleepHours: { type: Number, required: true, default: 0 },
  appetite: { type: Boolean, required: true },
  mood: { type: Boolean, required: true },
  support: { type: Boolean, required: true }, // true = adequate support
  history: { type: Boolean, required: true },
  resultLabel: { type: String, required: true },
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', ResponseSchema);

