require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const Product = require("../src/models/Product");

async function run() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected\n");

    const FRONTEND_URL = process.env.FRONTEND_URL;
    if (!FRONTEND_URL) {
      throw new Error("FRONTEND_URL is missing from .env");
    }

    console.log("Using FRONTEND_URL:", FRONTEND_URL);

    const products = await Product.find({});
    console.log(`Found ${products.length} products.\n`);

    for (const product of products) {
      const url = `${FRONTEND_URL}/trace/${product._id}`;
      
      const qrImage = await QRCode.toDataURL(url, {
        width: 256,
        margin: 1,
        color: { dark: "#000", light: "#fff" },
      });

      product.qrCode = qrImage;
      await product.save();

      console.log(`✅ Updated QR for: ${product.name}`);
      console.log(`   URL: ${url}\n`);
    }

    console.log("🎉 ALL QR CODES UPDATED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
