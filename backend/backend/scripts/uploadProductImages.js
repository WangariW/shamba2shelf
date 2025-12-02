require('dotenv').config({ path: './.env' });
const cloudinary = require('../src/config/cloudinary');
const path = require('path');
const fs = require('fs');

const imageMapping = [
  { fileName: 'arabica-aa-nyeri.webp', productName: 'Arabica AA Nyeri Beans' },
  { fileName: 'robusta-kirinyaga.jpg', productName: 'Robusta Kirinyaga Ground' },
  { fileName: 'blend-kiambu.jpeg', productName: 'Blend Kiambu Beans' },
  { fileName: 'arabica-muranga.jpg', productName: "Arabica Murang'a Ground" },
  { fileName: 'robusta-embu.jpg', productName: 'Robusta Embu Beans' },
  { fileName: 'arabica-meru.jpg', productName: 'Arabica Meru Ground' },
  { fileName: 'sl28-kirinyaga-peaberry.png', productName: 'SL28 Kirinyaga Peaberry' },
  { fileName: 'blue-mountain-embu.jpeg', productName: 'Blue Mountain Embu Gold' },
  { fileName: 'kent-meru-classic.jpeg', productName: 'Kent Meru Classic' }
];

const uploadImages = async () => {
  try {
    console.log('🚀 Starting image upload to Cloudinary...\n');

    const uploadedImages = [];

    for (const image of imageMapping) {
      const imagePath = path.join(__dirname, '../product-images', image.fileName);

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  Image not found: ${image.fileName} - Skipping...`);
        continue;
      }

      console.log(`📤 Uploading: ${image.fileName}...`);

      const result = await cloudinary.uploader.upload(imagePath, {
        folder: 'kofisafi-products',
        public_id: image.fileName.split('.')[0],
        overwrite: true,
        resource_type: 'image'
      });

      uploadedImages.push({
        productName: image.productName,
        fileName: image.fileName,
        url: result.secure_url,
        publicId: result.public_id
      });

      console.log(`✅ Uploaded: ${image.fileName}`);
      console.log(`   URL: ${result.secure_url}\n`);
    }

    // Save URLs to a JSON file for reference
    fs.writeFileSync(
      path.join(__dirname, 'uploaded-images.json'),
      JSON.stringify(uploadedImages, null, 2)
    );

    console.log('🎉 All images uploaded successfully!');
    console.log(`📄 URLs saved to: scripts/uploaded-images.json\n`);

    // Print summary
    console.log('📋 SUMMARY:');
    console.log(`   Total uploaded: ${uploadedImages.length}`);
    uploadedImages.forEach((img, index) => {
      console.log(`   ${index + 1}. ${img.productName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    process.exit(1);
  }
};

uploadImages();