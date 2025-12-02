require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const farmersData = [
  {
    firstName: "Kamau",
    lastName: "Mwangi",
    email: "kamau.mwangi@example.com",
    password: "FarmerPassword123!", // Will be hashed
    phoneNumber: "+254712345678",
    role: "farmer",
    county: "Nyeri",
    town: "Nyeri Town",
    pickupPoint: "Kamau Farm, Nyeri",
    location: { county: "Nyeri", town: "Nyeri Town" },
    latitude: -0.4167,
    longitude: 36.9667,
    averageRating: 4.8,
    totalSales: 150,
    isVerified: true,
    isActive: true,
  },
  {
    firstName: "Wanjiru",
    lastName: "Kipchoge",
    email: "wanjiru.kipchoge@example.com",
    password: "FarmerPassword123!",
    phoneNumber: "+254723456789",
    role: "farmer",
    county: "Kirinyaga",
    town: "Kerugoya",
    pickupPoint: "Wanjiru Estate, Kirinyaga",
    location: { county: "Kirinyaga", town: "Kerugoya" },
    latitude: -0.2833,
    longitude: 37.4833,
    averageRating: 4.6,
    totalSales: 120,
    isVerified: true,
    isActive: true,
  },
  {
    firstName: "Nduta",
    lastName: "Omondi",
    email: "nduta.omondi@example.com",
    password: "FarmerPassword123!",
    phoneNumber: "+254734567890",
    role: "farmer",
    county: "Muranga",
    town: "Muranga Town",
    pickupPoint: "Nduta Farm, Muranga",
    location: { county: "Muranga", town: "Muranga Town" },
    latitude: -0.7167,
    longitude: 37.0333,
    averageRating: 4.7,
    totalSales: 180,
    isVerified: true,
    isActive: true,
  },
  {
    firstName: "Samuel",
    lastName: "Kariuki",
    email: "samuel.kariuki@example.com",
    password: "FarmerPassword123!",
    phoneNumber: "+254745678901",
    role: "farmer",
    county: "Kiambu",
    town: "Kiambu Town",
    pickupPoint: "Kariuki Farm, Kiambu",
    location: { county: "Kiambu", town: "Kiambu Town" },
    latitude: -1.1167,
    longitude: 36.8167,
    averageRating: 4.5,
    totalSales: 95,
    isVerified: true,
    isActive: true,
  },
  {
    firstName: "Rose",
    lastName: "Njeri",
    email: "rose.njeri@example.com",
    password: "FarmerPassword123!",
    phoneNumber: "+254756789012",
    role: "farmer",
    county: "Embu",
    town: "Embu Town",
    pickupPoint: "Rose's Farm, Embu",
    location: { county: "Embu", town: "Embu Town" },
    latitude: -0.5333,
    longitude: 37.4667,
    averageRating: 4.9,
    totalSales: 200,
    isVerified: true,
    isActive: true,
  },
  {
    firstName: "John",
    lastName: "Mwangi",
    email: "john.mwangi@example.com",
    password: "FarmerPassword123!",
    phoneNumber: "+254767890123",
    role: "farmer",
    county: "Meru",
    town: "Meru Town",
    pickupPoint: "Mwangi Estate, Meru",
    location: { county: "Meru", town: "Meru Town" },
    latitude: 0.0667,
    longitude: 37.65,
    averageRating: 4.4,
    totalSales: 110,
    isVerified: true,
    isActive: true,
  },
];

async function seedFarmers() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if farmers already exist
    const existingFarmers = await User.countDocuments({ role: 'farmer' });
    console.log(`ℹ️  Found ${existingFarmers} existing farmers`);

    // Hash all passwords (User schema pre-save hook will do this too, but let's be explicit)
    const farmersWithHashedPasswords = await Promise.all(
      farmersData.map(async (farmer) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(farmer.password, salt);
        return {
          ...farmer,
          password: hashedPassword
        };
      })
    );

    // Insert farmers
    const insertedFarmers = await User.insertMany(farmersWithHashedPasswords);
    console.log(`\n✅ ${insertedFarmers.length} farmers added successfully!\n`);

    // Display added farmers
    insertedFarmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.firstName} ${farmer.lastName}`);
      console.log(`   Email: ${farmer.email}`);
      console.log(`   County: ${farmer.county}`);
      console.log(`   Rating: ⭐ ${farmer.averageRating}`);
      console.log(`   ID: ${farmer._id}\n`);
    });

    console.log('🎉 Farmers seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding farmers:', error.message);
    process.exit(1);
  }
}

seedFarmers();