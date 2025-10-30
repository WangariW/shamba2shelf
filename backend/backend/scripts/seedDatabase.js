const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Farmer = require('../src/models/Farmer');
const Buyer = require('../src/models/Buyer');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

// Database connection
const connectDB = require('../src/config/database');

// Sample data generators
const generateFarmerData = (index) => {
  const counties = ['Nyeri', 'Kiambu', 'Murang\'a', 'Kirinyaga', 'Embu'];
  const varieties = ['SL28', 'SL34', 'Ruiru 11', 'Batian'];
  const certifications = ['Fair Trade', 'Organic', 'Rainforest Alliance'];
  
  return {
    name: `Farmer ${index + 1} - ${['John Kamau', 'Mary Njeri', 'Peter Mwangi', 'Grace Wanjiku', 'Samuel Kiprotich'][index]}`,
    email: `farmer${index + 1}@shamba2shelf.com`,
    password: 'password123',
    phone: `+25471234567${index}`,
    county: counties[index],
    location: {
      latitude: -0.5 + (Math.random() * 2), // Random coordinates within Kenya
      longitude: 36.5 + (Math.random() * 2)
    },
    brandStory: `I am a dedicated coffee farmer with over ${10 + index * 2} years of experience growing premium coffee in ${counties[index]} county.`,
    farmSize: 2.5 + (index * 1.5),
    altitudeRange: {
      min: 1500 + (index * 100),
      max: 1800 + (index * 100)
    },
    certifications: certifications.slice(0, Math.floor(Math.random() * 3) + 1),
    varietiesGrown: varieties.slice(0, Math.floor(Math.random() * 3) + 1),
    isEmailVerified: true,
    isActive: true
  };
};

const generateProductData = (farmerId, farmerIndex, productIndex) => {
  const varieties = ['SL28', 'SL34', 'Ruiru 11', 'Batian'];
  const roastLevels = ['Light', 'Medium', 'Dark'];
  const processingMethods = ['Washed', 'Natural', 'Honey', 'Semi-washed'];
  const flavorProfiles = [
    ['Citrus', 'Floral', 'Bright'],
    ['Chocolate', 'Nutty', 'Full-body'],
    ['Berry', 'Wine', 'Complex'],
    ['Caramel', 'Vanilla', 'Sweet'],
    ['Spicy', 'Earthy', 'Bold']
  ];

  const basePrice = 800 + (Math.random() * 1200); // KES 800-2000 per kg
  const quantity = 50 + Math.floor(Math.random() * 200); // 50-250 kg

  return {
    name: `Premium Coffee Batch ${productIndex + 1} - Farmer ${farmerIndex + 1}`,
    farmerId: farmerId,
    variety: varieties[productIndex % varieties.length],
    roastLevel: roastLevels[productIndex % roastLevels.length],
    processingMethod: processingMethods[productIndex % processingMethods.length],
    altitudeGrown: 1500 + (farmerIndex * 100) + (productIndex * 20),
    harvestDate: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random date in last year
    price: Math.round(basePrice),
    quantity: quantity,
    status: 'Available',
    description: `High-quality ${varieties[productIndex % varieties.length]} coffee processed using ${processingMethods[productIndex % processingMethods.length]} method. Grown at altitude ${1500 + (farmerIndex * 100) + (productIndex * 20)}m in premium coffee region.`,
    flavorNotes: flavorProfiles[productIndex % flavorProfiles.length],
    qualityScore: 75 + Math.floor(Math.random() * 25), // 75-100
    isOrganic: Math.random() > 0.5,
    isFairTrade: Math.random() > 0.6
  };
};

const generateBuyerData = (index) => {
  const businessTypes = ['Retail', 'Wholesale', 'Cafe', 'Export'];
  const counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'];
  const businessNames = [
    'Premium Coffee Roasters Ltd',
    'Kenya Coffee Exporters Co.',
    'Mountain View Cafe Chain',
    'Wholesale Coffee Distributors'
  ];

  return {
    name: `Buyer ${index + 1} - ${['James Ndungu', 'Sarah Ochieng', 'Michael Kiptoo', 'Linda Wanjiru'][index]}`,
    email: `buyer${index + 1}@shamba2shelf.com`,
    password: 'password123',
    phone: `+25472234567${index}`,
    businessType: businessTypes[index],
    businessName: businessNames[index],
    businessLicense: `BL${10001 + index}`,
    deliveryAddress: {
      street: `${index + 1}0${index + 1} Main Street`,
      city: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'][index],
      county: counties[index],
      postalCode: `0010${index}`,
      coordinates: {
        latitude: -1.2921 + (Math.random() * 0.5),
        longitude: 36.8219 + (Math.random() * 0.5)
      }
    },
    preferences: {
      coffeeVarieties: ['SL28', 'SL34'],
      roastLevels: ['Medium', 'Dark'],
      processingMethods: ['Washed', 'Natural'],
      maxPrice: 2000,
      minQuantity: 50,
      organicOnly: false,
      fairTradeOnly: false
    },
    isEmailVerified: true,
    isActive: true
  };
};

const generateOrderData = (buyerId, farmerId, productId, buyerIndex, orderIndex) => {
  const quantity = 25 + Math.floor(Math.random() * 75); // 25-100 kg
  const unitPrice = 800 + (Math.random() * 1200); // KES 800-2000 per kg
  const totalAmount = quantity * unitPrice;
  
  const statuses = ['Pending', 'Confirmed', 'InTransit', 'Delivered'];
  const paymentMethods = ['M-Pesa', 'Bank Transfer', 'Card'];
  const paymentStatuses = ['Pending', 'Paid'];

  return {
    buyerId: buyerId,
    farmerId: farmerId,
    productId: productId,
    quantity: quantity,
    unitPrice: Math.round(unitPrice),
    totalAmount: Math.round(totalAmount),
    status: statuses[orderIndex % statuses.length],
    paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
    paymentMethod: paymentMethods[orderIndex % paymentMethods.length],
    paymentReference: `PAY${Date.now()}${orderIndex}`,
    deliveryAddress: {
      street: `${buyerIndex + 1}0${orderIndex + 1} Delivery Street`,
      city: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'][buyerIndex],
      county: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'][buyerIndex],
      postalCode: `0010${buyerIndex}`,
      coordinates: {
        latitude: -1.2921 + (Math.random() * 0.5),
        longitude: 36.8219 + (Math.random() * 0.5)
      }
    },
    deliveryDate: new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random future date within 30 days
    notes: `Order ${orderIndex + 1} for buyer ${buyerIndex + 1} - Premium quality coffee delivery`
  };
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding process...');
    
    // Connect to database
    await connectDB();
    
    console.log('🧹 Clearing existing data...');
    // Clear existing data
    await User.deleteMany({});
    await Farmer.deleteMany({});
    await Buyer.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    
    console.log('👤 Creating admin user...');
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@shamba2shelf.com',
      password: hashedPassword,
      phoneNumber: '+254700000000',
      address: {
        street: 'Admin Street',
        city: 'Nairobi',
        state: 'Nairobi',
        country: 'Kenya',
        zipCode: '00100'
      },
      role: 'admin',
      permissions: ['admin:all'],
      isActive: true,
      isEmailVerified: true
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    console.log('🚜 Creating farmers...');
    // Create farmers
    const farmers = [];
    for (let i = 0; i < 5; i++) {
      const farmerData = generateFarmerData(i);
      farmerData.password = await bcrypt.hash(farmerData.password, 12);
      const farmer = await Farmer.create(farmerData);
      farmers.push(farmer);
      console.log(`✅ Farmer ${i + 1} created: ${farmer.name}`);
    }

    console.log('☕ Creating products for each farmer...');
    // Create products for each farmer
    const allProducts = [];
    for (let i = 0; i < farmers.length; i++) {
      console.log(`  Creating products for ${farmers[i].name}...`);
      for (let j = 0; j < 7; j++) {
        const productData = generateProductData(farmers[i]._id, i, j);
        const product = await Product.create(productData);
        allProducts.push(product);
      }
      console.log(`  ✅ Created 7 products for farmer ${i + 1}`);
    }

    console.log('🛒 Creating buyers...');
    // Create buyers
    const buyers = [];
    for (let i = 0; i < 4; i++) {
      const buyerData = generateBuyerData(i);
      buyerData.password = await bcrypt.hash(buyerData.password, 12);
      const buyer = await Buyer.create(buyerData);
      buyers.push(buyer);
      console.log(`✅ Buyer ${i + 1} created: ${buyer.name}`);
    }

    console.log('📋 Creating orders for each buyer...');
    // Create orders for each buyer
    for (let i = 0; i < buyers.length; i++) {
      console.log(`  Creating orders for ${buyers[i].name}...`);
      for (let j = 0; j < 4; j++) {
        // Select a random farmer and their product for this order
        const randomFarmerIndex = Math.floor(Math.random() * farmers.length);
        const farmer = farmers[randomFarmerIndex];
        const farmerProducts = allProducts.filter(p => p.farmerId.toString() === farmer._id.toString());
        const randomProduct = farmerProducts[Math.floor(Math.random() * farmerProducts.length)];
        
        const orderData = generateOrderData(buyers[i]._id, farmer._id, randomProduct._id, i, j);
        const order = await Order.create(orderData);
      }
      console.log(`  ✅ Created 4 orders for buyer ${i + 1}`);
    }

    // Print summary
    console.log('\n📊 Database seeding completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`👤 Admin users: 1`);
    console.log(`🚜 Farmers: ${farmers.length}`);
    console.log(`☕ Products: ${allProducts.length}`);
    console.log(`🛒 Buyers: ${buyers.length}`);
    console.log(`📋 Orders: ${buyers.length * 4}`);
    console.log('═══════════════════════════════════════');
    
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@shamba2shelf.com / admin123');
    for (let i = 0; i < 5; i++) {
      console.log(`Farmer ${i + 1}: farmer${i + 1}@shamba2shelf.com / password123`);
    }
    for (let i = 0; i < 4; i++) {
      console.log(`Buyer ${i + 1}: buyer${i + 1}@shamba2shelf.com / password123`);
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;