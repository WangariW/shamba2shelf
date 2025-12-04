require('dotenv').config({ path: './.env' });
const cloudinary = require('../src/config/cloudinary');
const path = require('path');
const fs = require('fs');

const farmerImageMapping = [
  { fileName: 'everlyne-nduta.webp', farmerEmail: 'ndutafarms@gmail.com' },
  { fileName: 'jeff-wachira.jpg', farmerEmail: 'jwachira@gikira.com' },
  { fileName: 'john-mwangi.jpeg', farmerEmail: 'john.mwangi@mkulima.com' },
  { fileName: 'kamau-mwangi.jpeg', farmerEmail: 'kmfarm@gmail.com' },
  { fileName: 'nduta-munini.jpeg', farmerEmail: 'nduta.coffees@hotmail.com' },
  { fileName: 'robin-wangome.jpg', farmerEmail: 'rwangome@yahoo.com' },
  { fileName: 'samuel-kariuki.jpeg', farmerEmail: 'skariuki@gmail.com' },
  { fileName: 'wanjiru-kisim.jpg', farmerEmail: 'agrikisim@yahoo.com' }
];

const uploadFarmerImages = async () => {
  try {
    console.log('🚀 Starting farmer images upload to Cloudinary...\n');

    const uploadedImages = [];

    for (const image of farmerImageMapping) {
      const imagePath = path.join(__dirname, '../farmer-images', image.fileName);

      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  Image not found: ${image.fileName} - Skipping...`);
        continue;
      }

      console.log(`📤 Uploading: ${image.fileName}...`);

      const result = await cloudinary.uploader.upload(imagePath, {
        folder: 'shamba2shelf-farmers',
        public_id: image.fileName.split('.')[0],
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' }
        ]
      });

      uploadedImages.push({
        farmerEmail: image.farmerEmail,
        fileName: image.fileName,
        url: result.secure_url,
        publicId: result.public_id
      });

      console.log(`✅ Uploaded: ${image.fileName}`);
      console.log(`   URL: ${result.secure_url}\n`);
    }

    fs.writeFileSync(
      path.join(__dirname, 'uploaded-farmer-images.json'),
      JSON.stringify(uploadedImages, null, 2)
    );

    console.log('🎉 All farmer images uploaded!');
    console.log(`📊 Total uploaded: ${uploadedImages.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

uploadFarmerImages();