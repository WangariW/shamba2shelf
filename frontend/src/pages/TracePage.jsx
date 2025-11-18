/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { products } from "../data/productsData.js";

export default function TracePage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try finding locally first
    const localProduct = products.find((p) => p.id === parseInt(id));
    if (localProduct) {
      setProduct(localProduct);
      setLoading(false);
    } else {
      // Otherwise fetch from backend
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          setProduct(res.data.data);
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ef]">
        <p className="text-[#360816] text-lg font-medium">Loading story...</p>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ef]">
        <p className="text-red-600 text-lg font-semibold">Product not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f3ef] py-10 px-6 md:px-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-10"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={product.image || product.images?.[0]}
            alt={product.name}
            className="w-full md:w-1/3 h-64 object-cover rounded-lg shadow-md"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#360816] mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600 mb-1">
              {product.type || product.variety} • {product.county || "Kenya"}
            </p>
            <p className="text-[#360816] font-semibold mb-4">
              {product.price || "Price not available"}
            </p>
            <p className="text-sm text-gray-500">
              By{" "}
              {product.farmer?.name ||
                product.farmerId?.fullName ||
                product.farmer ||
                "Unknown Farmer"}
            </p>

            {/* QR Preview */}
            {product.qrCode && (
              <div className="mt-4 flex justify-center md:justify-start">
                <img
                  src={product.qrCode}
                  alt="QR Code"
                  className="w-24 h-24 rounded-md shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        {product.story?.intro && (
          <StoryCard title="Introduction" text={product.story.intro} />
        )}
        {product.story?.processingJourney && (
          <StoryCard
            title="Processing Journey"
            text={product.story.processingJourney}
          />
        )}
        {product.story?.impact && (
          <StoryCard title="Community Impact" text={product.story.impact} />
        )}
      </div>
    </div>
  );
}

function StoryCard({ title, text }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-md p-6 md:p-8 hover:shadow-xl transition"
    >
      <h2 className="text-2xl font-semibold text-[#360816] mb-3">{title}</h2>
      <p className="text-gray-700 leading-relaxed">{text}</p>
    </motion.section>
  );
}

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="bg-[#360816] text-white rounded-2xl shadow-md p-8 mt-12"
>
  <h2 className="text-3xl font-bold text-center mb-10 font-archivo">Farm-to-Cup Journey</h2>

  <div className="grid md:grid-cols-4 gap-8 text-center">
    {[
      { icon: "🌱", title: "Harvest", desc: "Fresh cherries hand-picked by farmers." },
      { icon: "🔥", title: "Processing", desc: "Beans pulped, dried, and roasted locally." },
      { icon: "📦", title: "Packaging", desc: "Each batch sealed with a unique QR code." },
      { icon: "☕", title: "Your Cup", desc: "Enjoy traceable Kenyan coffee — farm to cup." },
    ].map((step, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.05 }}
        className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition cursor-default"
      >
        <div className="text-4xl mb-3">{step.icon}</div>
        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
        <p className="text-gray-200 text-sm">{step.desc}</p>
      </motion.div>
    ))}
  </div>
</motion.div>
