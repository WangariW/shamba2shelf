const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Farmer = require('../src/models/Farmer');
const Buyer = require('../src/models/Buyer');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

// Database connection
const connectDB = require('../src/config/database');

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting database reset process...');
    
    // Connect to database
    await connectDB();
    
    console.log('🧹 Clearing all data...');
    // Clear all data
    await User.deleteMany({});
    await Farmer.deleteMany({});
    await Buyer.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    
    console.log('✅ Database reset completed successfully!');
    console.log('All collections have been cleared.');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run the reset
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;