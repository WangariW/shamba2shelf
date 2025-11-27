require("dotenv").config();
const axios = require("axios");

const ORS_API_KEY = process.env.ORS_API_KEY;

if (!ORS_API_KEY) {
  console.error("❌ ORS_API_KEY is missing in .env");
  process.exit(1);
}

// Example: Nairobi CBD → Westlands
// [lng, lat]
const locations = [
  [36.8219, -1.2921], // Nairobi CBD
  [36.8110, -1.2680], // Westlands
];

async function testORS() {
  try {
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/matrix/driving-car",
      {
        locations,
        metrics: ["distance", "duration"],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ ORS matrix response:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error("❌ ORS error:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testORS();
