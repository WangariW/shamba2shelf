require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product");
const Farmer = require("../src/models/Farmer");
const QRCodeService = require("../src/services/qrCodeService");

async function run() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected\n");

    const FRONTEND_URL = process.env.FRONTEND_PUBLIC_URL;
    if (!FRONTEND_URL) throw new Error("FRONTEND_PUBLIC_URL is missing.");

    console.log("🔍 Fetching all products...");
    const products = await Product.find();

    let count = 0;

    for (const product of products) {
      const farmer = await Farmer.findById(product.farmerId);
      if (!farmer) {
        console.log(`⚠️ Skipping product (farmer missing): ${product.name}`);
        continue;
      }

      const qrData = await QRCodeService.generateProductQR(product, farmer);

      product.qrCode = qrData.qrCodeImage;
      product.detailedQr = qrData.detailedQrData;
      product.verificationUrl = qrData.verificationUrl;
      product.traceabilityId = qrData.traceabilityId;

      await product.save();

      console.log(`✅ Updated QR for: ${product.name}`);
      count++;
    }

    console.log("\n🎉 QR regeneration complete!");
    console.log(`📦 Total updated products: ${count}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ QR regeneration failed:", err);
    process.exit(1);
  }
}

run();
