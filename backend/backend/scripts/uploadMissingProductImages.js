require('dotenv').config({ path: './.env' });
const cloudinary = require('../src/config/cloudinary');
const path = require('path');
const fs = require('fs');

const imageMapping = [
  { fileName: 'arabica-embu.jpeg', productName: 'Arabica Embu Reserve' },
  { fileName: 'arabica-k7.jpeg', productName: 'Arabica K7 Muranga'},
  { fileName: 'arabica-muranga.jpeg', productName: 'Arabica Muranga Ground' },
  { fileName: 'batian-espresso.jpeg', productName: 'Batian Nyeri Espresso' },
  { fileName: 'batian-nyeri.jpeg', productName: 'Batian Nyeri Premium' },
  { fileName: 'ruiru-11-kiambu.jpeg', productName: 'Ruiru 11 Kiambu Estate' },
  { fileName: 'sl34.jpeg', productName: 'SL34 Kirinyaga Supreme' }
];

const uploadImages = async () => {
  try {
    console.log('🚀 Starting image upload to Cloudinary...\n');

    const uploadedImages = [];

    for (const image of imageMapping) {
      const imagePath = path.join(__dirname, '../product-images', image.fileName);

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

    const existingFile = path.join(__dirname, 'uploaded-images.json');
    let allImages = [];
    
    if (fs.existsSync(existingFile)) {
      allImages = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
    }
    
    allImages = [...allImages, ...uploadedImages];

    fs.writeFileSync(
      existingFile,
      JSON.stringify(allImages, null, 2)
    );

    console.log('🎉 All images uploaded successfully!');
    console.log(`📄 URLs saved to: scripts/uploaded-images.json`);
    console.log(`📊 Total uploaded: ${uploadedImages.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    process.exit(1);
  }
};

uploadImages();