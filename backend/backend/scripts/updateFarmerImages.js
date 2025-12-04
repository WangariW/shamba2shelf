require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Farmer = require('../src/models/Farmer');
const fs = require('fs');
const path = require('path');

const updateFarmerImages = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const uploadedImagesPath = path.join(__dirname, 'uploaded-farmer-images.json');
    
    if (!fs.existsSync(uploadedImagesPath)) {
      console.error('❌ uploaded-farmer-images.json not found. Run uploadFarmerImages.js first.');
      process.exit(1);
    }

    const uploadedImages = JSON.parse(fs.readFileSync(uploadedImagesPath, 'utf8'));

    console.log('📝 Updating farmers with Cloudinary URLs...\n');

    let updatedCount = 0;

    for (const image of uploadedImages) {
      const farmer = await Farmer.findOne({ email: image.farmerEmail });

      if (!farmer) {
        console.log(`⚠️  Farmer not found: ${image.farmerEmail}`);
        continue;
      }

      farmer.profileImage = image.url;
      await farmer.save();

      console.log(`✅ Updated: ${farmer.name}`);
      console.log(`   Image: ${image.url}\n`);
      updatedCount++;
    }

    console.log('🎉 Farmer images updated!');
    console.log(`📊 Total updated: ${updatedCount}/${uploadedImages.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateFarmerImages();