require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Farmer = require('../src/models/Farmer');
const Buyer = require('../src/models/Buyer');
const { generateToken } = require('../src/utils/helpers');

const DEFAULT_LATITUDE = -1.286389; 
const DEFAULT_LONGITUDE = 36.817223;
const KENYAN_PHONE_REGEX = /^\+254[0-9]{9}$/;
const FALLBACK_PHONE = '+254700000000';

const migrateUsers = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const buyers = await User.find({ role: 'buyer' });
    const farmers = await User.find({ role: 'farmer' });

    console.log(`Found ${buyers.length} buyers in User collection`);
    console.log(`Found ${farmers.length} farmers in User collection\n`);

    let migratedBuyers = 0;
    let migratedFarmers = 0;
    let deletedUsers = 0;

    // --- Migrate Buyers ---
    console.log('📦 Migrating Buyers...\n');
    for (const user of buyers) {
      if (!user.email) {
        console.log(`⚠️  Buyer missing email: Skipping`);
        continue;
      }

      const existingBuyer = await Buyer.findOne({ email: user.email });
      if (existingBuyer) {
        console.log(`⚠️  Buyer already exists: ${user.email} - Skipping`);
        continue;
      }
      
      const buyerData = {
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        email: user.email,
        password: user.password || generateToken(12),
        phone: (user.phoneNumber && KENYAN_PHONE_REGEX.test(user.phoneNumber)) 
               ? user.phoneNumber 
               : FALLBACK_PHONE,
        businessType: 'Individual',
        deliveryAddress: {
          street: user.address?.street || 'Not specified',
          city: user.address?.city || user.town || 'Nairobi',
          county: user.county || 'Nairobi',
          postalCode: user.address?.zipCode || '00100',
          coordinates: {
            latitude: user.latitude ?? DEFAULT_LATITUDE,
            longitude: user.longitude ?? DEFAULT_LONGITUDE,
          },
        },
        isActive: user.isActive ?? true,
        isVerified: user.isEmailVerified ?? false,
        lastLoginAt: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await Buyer.create(buyerData);
      await User.findByIdAndDelete(user._id);
      console.log(`✅ Migrated & deleted buyer: ${user.email}`);
      migratedBuyers++;
      deletedUsers++;
    }

    // --- Migrate Farmers ---
    console.log('\n🌾 Migrating Farmers...\n');
    for (const user of farmers) {
      if (!user.email) {
        console.log(`⚠️  Farmer missing email: Skipping`);
        continue;
      }

      const existingFarmer = await Farmer.findOne({ email: user.email });
      if (existingFarmer) {
        console.log(`⚠️  Farmer already exists: ${user.email} - Skipping`);
        continue;
      }
      
      const userLatitude = user.latitude ?? DEFAULT_LATITUDE;
      const userLongitude = user.longitude ?? DEFAULT_LONGITUDE;
      
      // GeoJSON FIX: [longitude, latitude] order
      const locationCoordinates = [userLongitude, userLatitude]; 
      
      // Language FIX: Ensure it's an array
      const languageData = Array.isArray(user.communicationPreferences?.language)
          ? user.communicationPreferences.language
          : (user.communicationPreferences?.language ? [user.communicationPreferences.language] : ['English']);

      const farmerData = {
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        email: user.email,
        password: user.password || generateToken(12),
        
        // Phone FIX: Validate and use fallback if invalid
        phone: (user.phoneNumber && KENYAN_PHONE_REGEX.test(user.phoneNumber)) 
               ? user.phoneNumber 
               : FALLBACK_PHONE,

        county: user.county || null,
        nearestTown: user.town || null,
        
        // GeoJSON FIX: Correct structure for the 'location' field
        location: {
          type: 'Point',
          coordinates: locationCoordinates,
        },
        
        // Administrative FIX: Use the new 'administrativeLocation' field
        administrativeLocation: {
          county: user.county || null,
          town: user.town || null,
        },

        latitude: userLatitude,
        longitude: userLongitude,
        
        isActive: user.isActive ?? true,
        isVerified: user.isEmailVerified ?? false,
        lastLogin: user.lastLogin,
        
        // Language FIX: Use the cleaned array data
        communicationPreferences: {
          language: languageData,
        },
        
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await Farmer.create(farmerData);
      await User.findByIdAndDelete(user._id);
      console.log(`✅ Migrated & deleted farmer: ${user.email}`);
      migratedFarmers++;
      deletedUsers++;
    }

    console.log('\n🎉 Migration complete!');
    console.log(`📊 Summary:`);
    console.log(`  Buyers migrated: ${migratedBuyers}/${buyers.length}`);
    console.log(`  Farmers migrated: ${migratedFarmers}/${farmers.length}`);
    console.log(`  Total users deleted from User collection: ${deletedUsers}`);
    console.log('\n✅ All migrated users removed from User collection.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrateUsers();