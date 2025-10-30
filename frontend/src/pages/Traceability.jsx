/* eslint-disable no-unused-vars */
import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";


// Mock data — later replace with dynamic backend data
const mockTraceData = {
  "NY-ARB-0425":{
    productName: "Nyeri Arabica Beans",
    productType: "Coffee Beans",
    roastLevel: "Medium Roast",
    origin: "Nyeri County, Kenya",
    batchId: "NY-ARB-0425",
    harvestDate: "April 2025",
    farmer: {
      name: "Mwangi Kamau",
      farmName: "Green Highlands Estate",
      story:
      "Mwangi Kamau is a second-generation farmer from Nyeri who believes in sustainable coffee growing. His beans are handpicked, sun-dried, and processed locally to maintain their natural flavor and aroma.",
      photo: "/src/assets/images/farmer-2.jpg",
    },
    steps: [
      { stage: "Harvested", date: "Apr 10, 2025", location: "Nyeri, Kenya" },
      { stage: "Processed", date: "Apr 13, 2025", location: "Karatina Mills" },
      { stage: "Roasted", date: "Apr 16, 2025", location: "Shamba2Shelf Facility, Nairobi" },
      { stage: "Packaged", date: "Apr 17, 2025", location: "Nairobi, Kenya" },
      { stage: "Delivered", date: "Apr 20, 2025", location: "Shamba2Shelf Marketplace" },
  ],
},
"KR-RBS-0501": {
    productName: "Kirinyaga Robusta Ground Coffee",
    productType: "Ground Coffee",
    roastLevel: "Dark Roast",
    origin: "Kirinyaga County, Kenya",
    batchId: "KR-RBS-0501",
    harvestDate: "May 2025",
    farmer: {
      name: "Jane Wambui",
      farmName: "Riverbend Coffee Co.",
      story:
        "Jane is a farmer in Kirinyaga focusing on premium Robusta blends with full-bodied flavor and a smooth finish.",
      photo: "/src/assets/images/farmer-3.jpg",
    },
    steps: [
      { stage: "Harvested", date: "May 3, 2025", location: "Kirinyaga, Kenya" },
      { stage: "Processed", date: "May 5, 2025", location: "Kagumo Factory" },
      { stage: "Roasted", date: "May 7, 2025", location: "Shamba2Shelf Facility, Nairobi" },
      { stage: "Packaged", date: "May 9, 2025", location: "Nairobi, Kenya" },
      { stage: "Delivered", date: "May 12, 2025", location: "Shamba2Shelf Marketplace" },
    ],
  },
};

export default function Traceability() {
  const { batchId } = useParams();
  const traceData = mockTraceData[batchId];

   if (!traceData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">This traceability record may have been moved or deleted.</p>
        <Link to="/buyer/marketplace" className="bg-[#3B1F0E] text-white px-6 py-3 rounded-md">
          Back to Marketplace
        </Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#FDFBF9] text-gray-900 dark:bg-[#1E1E1E] dark:text-gray-100 transition-colors duration-500">
      {/* Header */}
      <section className="bg-[#3B1F0E] text-white py-12 text-center dark:bg-[#2A140A] transition-colors duration-500">
        <h1 className="text-4xl font-bold mb-2 font-archivo">Product Traceability</h1>
        <p className="text-lg text-gray-200 dark:text-gray-300">Transparency from farm to cup </p>
      </section>

      {/* Product Info */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 dark:bg-[#2C2C2C] dark:border-gray-700 transition-colors duration-500"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-[#3B1F0E] mb-4">
            {mockTraceData.productName}
          </h2>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Type:</strong> {mockTraceData.productType}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Roast Level:</strong> {mockTraceData.roastLevel}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Origin:</strong> {mockTraceData.origin}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Harvest Date:</strong> {mockTraceData.harvestDate}
          </p>
          <p className="text-lg text-gray-700">
            <strong>Batch ID:</strong> {mockTraceData.batchId}
          </p>
        </motion.div>
      </section>

      {/* Farmer Info */}
      <section className="bg-[#F5EFE9] py-16 px-6 dark:bg-[#24201C] transition-colors duration-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <motion.img
            src={mockTraceData.farmer.photo}
            alt={mockTraceData.farmer.name}
            className="w-72 h-72 rounded-full object-cover border-4 border-[#3B1F0E] dark:border-[#F3D4A0] shadow-md"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="text-center md:text-left"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-[#3B1F0E] dark:text-[#F3D4A0] mb-2 font-archivo">
              {mockTraceData.farmer.name}
            </h3>
            <p className="text-xl text-gray-700 font-semibold mb-1">
              {mockTraceData.farmer.farmName}
            </p>
            <p className="text-gray-600 font-adamina leading-relaxed">
              {mockTraceData.farmer.story}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Farm to Cup Journey */}
      <section className="max-w-5xl mx-auto py-20 px-6">
        <h3 className="text-3xl font-bold text-[#3B1F0E] dark:text-[#F3D4A0] text-center mb-12 font-archivo">
          Farm to Cup Journey
        </h3>

        <div className="relative border-l-4 border-[#3B1F0E] dark:border-[#F3D4A0] ml-8">
          {mockTraceData.steps.map((step, index) => (
            <motion.div
              key={index}
              className="mb-10 ml-6"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="absolute -left-4 w-8 h-8 bg-[#3B1F0E] dark:bg-[#F3D4A0] rounded-full border-4 border-white shadow-md"></div>
              <h4 className="text-2xl font-semibold text-[#3B1F0E] dark:text-[#F3D4A0]">
                {step.stage}
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{step.date}</p>
              <p className="text-gray-500 italic dark:text-gray-400">{step.location}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Back to Marketplace */}
      <div className="text-center py-10">
        <Link
          to="/buyer/marketplace"
          className="bg-[#3B1F0E] text-white px-8 py-3 rounded-md hover:bg-[#2a160a] transition dark:bg-[#F3D4A0] dark:text-[#2C2C2C] dark:hover:bg-[#e8c78a]"
        >
          ← Back to Marketplace
        </Link>
      </div>
    </div>
  );
}
