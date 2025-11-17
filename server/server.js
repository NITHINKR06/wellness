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
    console.log('✅ Connected to MongoDB successfully');
    // Listen on all network interfaces (0.0.0.0) to allow connections from devices/emulators
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Accessible at:`);
      console.log(`   - Local: http://localhost:${PORT}/api`);
      console.log(`   - Network: http://<your-ip>:${PORT}/api`);
      console.log(`   - Android Emulator: http://10.0.2.2:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    
    // Provide specific guidance based on error type
    if (err.code === 8000 || err.codeName === 'AtlasError') {
      console.error('\n📋 MongoDB Atlas Authentication Failed. Please check:');
      console.error('   1. Username and password in MONGO_URI are correct');
      console.error('   2. Database user exists and has proper permissions');
      console.error('   3. Your IP address is whitelisted in MongoDB Atlas Network Access');
      console.error('   4. Connection string format: mongodb+srv://username:password@cluster.mongodb.net/dbname');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('\n📋 Local MongoDB Connection Failed. Please check:');
      console.error('   1. MongoDB is installed and running');
      console.error('   2. MongoDB is running on port 27017');
      console.error('   3. Connection string: mongodb://localhost:27017/wellness_db');
    } else {
      console.error('\n📋 MongoDB Connection Failed. Please check:');
      console.error('   1. MONGO_URI in .env file is correct');
      console.error('   2. MongoDB service is running');
      console.error('   3. Network connectivity');
    }
    
    console.error('\n💡 See .env.example for connection string format');
    process.exit(1);
  });

