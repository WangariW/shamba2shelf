const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const testOrders = [
  {
    buyerId: '692d6ed669c4908a7b083a1a', 
    farmerId: '690a1ef06538883429160a19',
    productId: '69138efaa74d28eeb5104c0a', // Arabica AA Nyeri Beans
    quantity: 5,
    unitPrice: 1200,
    totalAmount: 6000,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'M-Pesa',
    deliveryAddress: {
      street: '123 Main Street',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100'
    },
    createdAt: new Date('2025-10-15'),
    deliveryDate: new Date('2025-10-18')
  },
  {
    buyerId: '692d6ed669c4908a7b083a1a',
    farmerId: '691c4ed3f90f7a7b417aab33',
    productId: '69138efaa74d28eeb5104c0e', // Robusta Kirinyaga Ground
    quantity: 10,
    unitPrice: 1000,
    totalAmount: 10000,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'M-Pesa',
    deliveryAddress: {
      street: '123 Main Street',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100'
    },
    createdAt: new Date('2025-11-05'),
    deliveryDate: new Date('2025-11-08')
  },
  {
    buyerId: '692d6ed669c4908a7b083a1a',
    farmerId: '6928f163dfeefd80e8050b02',
    productId: '69138efaa74d28eeb5104c12', // Blend Kiambu Beans
    quantity: 8,
    unitPrice: 1100,
    totalAmount: 8800,
    status: 'InTransit',
    paymentStatus: 'Paid',
    paymentMethod: 'M-Pesa',
    deliveryAddress: {
      street: '123 Main Street',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100'
    },
    createdAt: new Date('2025-11-28'),
    estimatedDeliveryDate: new Date('2025-12-05')
  },
  {
    buyerId: '692d6ed669c4908a7b083a1a',
    farmerId: '6928f163dfeefd80e8050b03',
    productId: '69138efaa74d28eeb5104c15', // Arabica Murang'a Ground
    quantity: 3,
    unitPrice: 1150,
    totalAmount: 3450,
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'M-Pesa',
    deliveryAddress: {
      street: '123 Main Street',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100'
    },
    createdAt: new Date('2025-12-01')
  },
  {
    buyerId: '692d6ed669c4908a7b083a1a',
    farmerId: '6928f163dfeefd80e8050b04',
    productId: '69138efba74d28eeb5104c18', // Robusta Embu Beans
    quantity: 12,
    unitPrice: 950,
    totalAmount: 11400,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    deliveryAddress: {
      street: '123 Main Street',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100'
    },
    createdAt: new Date('2025-09-20'),
    deliveryDate: new Date('2025-09-23')
  }
];

const createOrders = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing test orders...');
    await Order.deleteMany({ buyerId: '692d6ed669c4908a7b083a1a' });
    
    console.log('📦 Creating test orders...');
    const created = await Order.insertMany(testOrders);
    
    console.log(`✅ Created ${created.length} test orders!`);
    console.log('\nOrders created:');
    created.forEach(order => {
      console.log(`- ${order._id}: ${order.quantity}kg - Status: ${order.status} - Total: KSh ${order.totalAmount}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating orders:', error);
    process.exit(1);
  }
};

createOrders();