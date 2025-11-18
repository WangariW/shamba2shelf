/* eslint-disable no-unused-vars */
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const Product = require("./models/Product");
const User = require("./models/User");

const products = [
  {
    name: "Arabica AA Nyeri Beans",
    variety: "SL28",
    roastLevel: "Medium",
    processingMethod: "Washed",
    altitudeGrown: 1800,
    price: 1200,
    quantity: 50,
    description: "Arabica beans nurtured in Nyeri’s fertile volcanic soils. Floral aromas and smooth finish from the misty slopes.",
    images: ["https://your-cloudinary-url.com/roasted-beans-2.jpg"],
  },
  {
    name: "Robusta Kirinyaga Ground",
    variety: "Ruiru 11",
    roastLevel: "Dark",
    processingMethod: "Washed",
    altitudeGrown: 1600,
    price: 1000,
    quantity: 60,
    description: "Bold Robusta beans from Kirinyaga’s lower slopes. Deep body and rich aroma.",
    images: ["https://your-cloudinary-url.com/ground-coffee.jpg"],
  },
  {
    name: "Blend Kiambu Beans",
    variety: "SL34",
    roastLevel: "Medium",
    processingMethod: "Natural",
    altitudeGrown: 1700,
    price: 1100,
    quantity: 55,
    description: "Smooth blend from Kiambu’s green hills. Balanced flavor and mellow sweetness.",
    images: ["https://your-cloudinary-url.com/blend-beans.jpeg"],
  },
  {
    name: "Arabica Murang’a Ground",
    variety: "SL28",
    roastLevel: "Light",
    processingMethod: "Natural",
    altitudeGrown: 1650,
    price: 1150,
    quantity: 40,
    description: "High-altitude Arabica from Murang’a’s fertile ridges. Bright, fruity flavor.",
    images: ["https://your-cloudinary-url.com/arabica-muranga.jpg"],
  },
  {
    name: "Robusta Embu Beans",
    variety: "Ruiru 11",
    roastLevel: "Medium",
    processingMethod: "Natural",
    altitudeGrown: 1550,
    price: 950,
    quantity: 70,
    description: "Earthy Robusta grown on Embu’s eastern ridges. Intense flavor and strong body.",
    images: ["https://your-cloudinary-url.com/robusta-beans.jpg"],
  },
  {
    name: "Arabica Meru Ground",
    variety: "Batian",
    roastLevel: "Light",
    processingMethod: "Honey",
    altitudeGrown: 1750,
    price: 1180,
    quantity: 60,
    description: "Sweet, aromatic Arabica from Meru’s highlands. Silky, balanced cup.",
    images: ["https://your-cloudinary-url.com/arabica-meru.jpg"],
  },
  {
    name: "Batian Nyeri Premium",
    variety: "Batian",
    roastLevel: "Medium",
    processingMethod: "Washed",
    altitudeGrown: 1800,
    price: 1250,
    quantity: 45,
    description: "Premium Batian hybrid offering smooth, citrusy notes from Nyeri.",
    images: ["https://your-cloudinary-url.com/roasted-beans-2.jpg"],
  },
  {
    name: "SL28 Kirinyaga Peaberry",
    variety: "SL28",
    roastLevel: "Medium",
    processingMethod: "Washed",
    altitudeGrown: 1650,
    price: 1300,
    quantity: 40,
    description: "Rare peaberries from Kirinyaga’s volcanic soils with chocolatey undertones.",
    images: ["https://your-cloudinary-url.com/ground-coffee.jpg"],
  },
  {
    name: "Ruiru 11 Kiambu Estate",
    variety: "Ruiru 11",
    roastLevel: "Medium",
    processingMethod: "Semi-washed",
    altitudeGrown: 1700,
    price: 1120,
    quantity: 50,
    description: "Balanced Ruiru 11 from the cool Tigoni highlands. Low acidity and smooth finish.",
    images: ["https://your-cloudinary-url.com/blend-beans.jpeg"],
  },
  {
    name: "Blue Mountain Embu Gold",
    variety: "Blue Mountain",
    roastLevel: "Medium",
    processingMethod: "Pulped Natural",
    altitudeGrown: 1850,
    price: 1400,
    quantity: 35,
    description: "Jamaican Blue Mountain grown locally in Embu. Sweet, clean cup for specialty lovers.",
    images: ["https://your-cloudinary-url.com/robusta-beans.jpg"],
  },
  {
    name: "Arabica K7 Murang’a",
    variety: "K7",
    roastLevel: "Light",
    processingMethod: "Semi-washed",
    altitudeGrown: 1650,
    price: 1160,
    quantity: 45,
    description: "Classic K7 varietal with nutty aroma and smooth body.",
    images: ["https://your-cloudinary-url.com/arabica-muranga.jpg"],
  },
  {
    name: "Kent Meru Classic",
    variety: "Kent",
    roastLevel: "Medium",
    processingMethod: "Washed",
    altitudeGrown: 1750,
    price: 1200,
    quantity: 50,
    description: "Traditional Kent beans from shaded farms. Cocoa-rich sweetness.",
    images: ["https://your-cloudinary-url.com/arabica-meru.jpg"],
  },
  {
    name: "SL34 Kirinyaga Supreme",
    variety: "SL34",
    roastLevel: "Dark",
    processingMethod: "Natural",
    altitudeGrown: 1650,
    price: 1280,
    quantity: 40,
    description: "Premium SL34 with red fruit and spice aroma. Vibrant cup.",
    images: ["https://your-cloudinary-url.com/ground-coffee.jpg"],
  },
  {
    name: "Batian Nyeri Espresso",
    variety: "Batian",
    roastLevel: "Dark",
    processingMethod: "Natural",
    altitudeGrown: 1800,
    price: 1250,
    quantity: 40,
    description: "Dark Batian roast crafted for espresso fans. Rich crema and depth.",
    images: ["https://your-cloudinary-url.com/roasted-beans-2.jpg"],
  },
  {
    name: "Arabica Embu Reserve",
    variety: "SL28",
    roastLevel: "Medium",
    processingMethod: "Honey",
    altitudeGrown: 1750,
    price: 1190,
    quantity: 55,
    description: "Limited reserve Arabica from Embu hills. Caramel tones and smooth body.",
    images: ["https://your-cloudinary-url.com/robusta-beans.jpg"],
  },
];

const seedProducts = async () => {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected");

    const farmer = await User.findOne({ role: "farmer" });
    if (!farmer) {
      console.log("⚠️ No farmer found. Please create one first.");
      process.exit(1);
    }

    console.log("🧹 Clearing old products...");
    await Product.deleteMany({});

    console.log("📦 Creating new products...");
    for (const p of products) {
      const productUrl = `http://localhost:5173/product/${new mongoose.Types.ObjectId()}`;
      const qrCodeDataUrl = await QRCode.toDataURL(productUrl);

      const newProduct = new Product({
        ...p,
        farmerId: farmer._id,
        qrCode: qrCodeDataUrl,
        isActive: true,
      });
      await newProduct.save();
      console.log(`✅ Added: ${p.name}`);
    }

    console.log("🎉 Products seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding products:", err);
    process.exit(1);
  }
};

seedProducts();
