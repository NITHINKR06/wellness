require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const questionnaireRoutes = require('./routes/questionnaire');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/questionnaire', questionnaireRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Check if MONGO_URI is set
if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  console.error('Please create a .env file with MONGO_URI=mongodb://localhost:27017/wellness_db');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Make sure MongoDB is running and MONGO_URI is correct in .env file');
    process.exit(1);
  });

