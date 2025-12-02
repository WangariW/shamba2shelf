/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";

export default function TracePage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (error) {
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ef]">
        <p className="text-[#360816] text-lg font-medium">Loading story...</p>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ef]">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">
            {error || "Product not found"}
          </p>
          <Link to="/marketplace" className="text-[#360816] underline">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f3ef] py-10 px-6 md:px-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 md:p-10 mb-10"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src={product.images || "/placeholder-coffee.jpg"}
            alt={product.name}
            className="w-full md:w-1/3 h-64 object-cover rounded-xl shadow-md"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#360816] mb-2">
              {product.name}
            </h1>

            <p className="text-gray-600 mb-1">
              {product.variety} • {product.roastLevel} •{" "}
              {product.processingMethod}
            </p>

            <p className="text-gray-600 mb-1">
              📍 Grown at {product.altitudeGrown}m
            </p>

            <p className="text-[#360816] font-semibold mb-2">
              KES {product.price} per kg
            </p>

            <p className="text-sm text-gray-500 mb-4">
              By {product.farmerId?.firstName} {product.farmerId?.lastName}
            </p>

            {product.qrCode && (
              <div className="mt-4 flex justify-center md:justify-start">
                <div className="text-center">
                  <img
                    src={product.qrCode}
                    alt="QR Code"
                    className="w-32 h-32 rounded-md shadow-sm mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Scan to trace this coffee
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        {product.story?.intro && (
          <StoryCard
            title="The Story Behind Your Coffee"
            text={product.story.intro}
            icon="☕"
          />
        )}

        {product.story?.farmerBackground && (
          <StoryCard
            title="Meet the Farmer"
            text={product.story.farmerBackground}
            icon="👨‍🌾"
          />
        )}

        {product.story?.farmDetails && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-md p-6 md:p-8 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold text-[#360816] mb-4 flex items-center gap-2">
              <span>🌱</span> Farm Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              {product.story.farmDetails.location && (
                <Detail label="Location" value={product.story.farmDetails.location} />
              )}
              {product.story.farmDetails.size && (
                <Detail label="Farm Size" value={product.story.farmDetails.size} />
              )}
              {product.story.farmDetails.altitude && (
                <Detail label="Altitude" value={product.story.farmDetails.altitude} />
              )}
              {product.story.farmDetails.practices && (
                <div className="md:col-span-2">
                  <p className="font-semibold text-[#360816] mb-2">
                    Farming Practices:
                  </p>
                  <p className="leading-relaxed">
                    {product.story.farmDetails.practices}
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {product.story?.processingJourney && (
          <StoryCard
            title="From Cherry to Cup"
            text={product.story.processingJourney}
            icon="🔥"
          />
        )}

        {product.story?.impact && (
          <StoryCard
            title="Community Impact"
            text={product.story.impact}
            icon="🤝"
          />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-[#360816] text-white rounded-2xl shadow-md p-8 mt-12"
      >
        <h2 className="text-3xl font-bold text-center mb-10 font-archivo">
          Farm-to-Cup Journey
        </h2>

        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            {
              icon: "🌱",
              title: "Harvest",
              desc: "Fresh cherries hand-picked at peak ripeness.",
            },
            {
              icon: "🔥",
              title: "Processing",
              desc: "Beans pulped, fermented, dried and roasted with care.",
            },
            {
              icon: "📦",
              title: "Packaging",
              desc: "Every batch sealed with a unique QR code.",
            },
            {
              icon: "☕",
              title: "Your Cup",
              desc: "Enjoy authentic Kenyan coffee, farmer-to-you.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition"
            >
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-200 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="text-center mt-10">
        <Link
          to="/marketplace"
          className="inline-block bg-[#360816] text-white px-8 py-3 rounded-md hover:bg-[#4a0a20] transition font-semibold"
        >
          ← Back to Marketplace
        </Link>
      </div>
    </div>
  );
}

function StoryCard({ title, text, icon }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-md p-6 md:p-8 hover:shadow-lg transition"
    >
      <h2 className="text-2xl font-semibold text-[#360816] mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>} {title}
      </h2>
      <p className="text-gray-700 leading-relaxed">{text}</p>
    </motion.section>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="font-semibold text-[#360816]">{label}:</p>
      <p>{value}</p>
    </div>
  );
}
