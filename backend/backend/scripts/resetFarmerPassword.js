const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetFarmerPassword(farmerId, newPassword) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI); 
    console.log('Connected to MongoDB');

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the farmer's password directly in the farmers collection
    const result = await mongoose.connection.db
      .collection('farmers')
      .updateOne(
        { _id: new mongoose.Types.ObjectId(farmerId) },
        { $set: { password: hashedPassword } }
      );

    if (result.matchedCount === 0) {
      console.log('❌ Farmer not found');
    } else {
      console.log('✅ Password updated successfully!');
      console.log(`Farmer ID: ${farmerId}`);
      console.log(`New password: ${newPassword}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: Get farmer ID and new password from command line
const farmerId = process.argv[2];
const newPassword = process.argv[3] || 'Password123!';

if (!farmerId) {
  console.log('Usage: node resetFarmerPassword.js <farmerId> [newPassword]');
  console.log('Example: node resetFarmerPassword.js 507f1f77bcf86cd799439011 MyNewPass123');
  process.exit(1);
}

resetFarmerPassword(farmerId, newPassword);