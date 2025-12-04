const express = require("express");
const router = express.Router();
const axios = require("axios");
const Farmer = require("../models/Farmer");
const computeOptimalRoute = require("../utils/routeOptimizer");

console.log("🔧 routeOptimization.js - Router created");

const ORS_API_KEY = process.env.ORS_API_KEY;

router.post("/optimize", async (req, res) => {
  console.log("📍 POST /optimize endpoint HIT!");
  console.log("📍 Request body:", req.body);
  
  try {
    const { buyerLat, buyerLng } = req.body;

    if (!buyerLat || !buyerLng) {
      console.log("❌ Missing lat/lng");
      return res.status(400).json({
        success: false,
        message: "Buyer latitude and longitude are required",
      });
    }

    console.log("🔍 Searching for farmers with location...");
    const farmers = await Farmer.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    });
    
    console.log(`✅ Found ${farmers.length} farmers with location`);

    if (farmers.length === 0) {
      console.log("❌ No farmers found!");
      return res.status(404).json({
        success: false,
        message: "No farmers have location data yet",
      });
    }

    const locations = farmers.map((f) => [f.longitude, f.latitude]);
    locations.push([buyerLng, buyerLat]);

    console.log("📍 Sending to OpenRouteService:", locations);

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

    const matrix = response.data;
    const bestRoute = computeOptimalRoute(matrix, farmers.length);

    return res.json({
      success: true,
      farmers,
      routeOrder: bestRoute.route,
      bestRoute: {
        totalDistance: bestRoute.totalDistance,
        totalDuration: bestRoute.totalDuration,
      },
    });
  } catch (err) {
    console.error("❌ Route optimization error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Route optimization failed",
      error: err.response?.data || err.message,
    });
  }
});

console.log("📍 POST /optimize route registered");

module.exports = router;