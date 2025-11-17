require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not configured. Please set it in your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection;
    const result = await db.collection('users').dropIndex('username_1');
    console.log('Successfully dropped index:', result);
  } catch (error) {
    console.error('Failed to drop index:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

