const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");
const computeOptimalRoute = require("../utils/routeOptimizer");

const ORS_API_KEY = process.env.ORS_API_KEY;

router.post("/optimize", async (req, res) => {
  try {
    const { buyerLat, buyerLng } = req.body;

    if (!buyerLat || !buyerLng) {
      return res.status(400).json({
        success: false,
        message: "Buyer latitude and longitude are required",
      });
    }

    const farmers = await User.find({
      role: "farmer",
      latitude: { $ne: null },
      longitude: { $ne: null },
    }).select("firstName lastName email latitude longitude county town");

    if (farmers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No farmers have location data yet",
      });
    }

    // ORS matrix expects [lon, lat]
    const locations = farmers.map((f) => [f.longitude, f.latitude]);
    locations.push([buyerLng, buyerLat]); // last index = buyer

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
    console.error(err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Route optimization failed",
      error: err.response?.data || err.message,
    });
  }
});

module.exports = router;
