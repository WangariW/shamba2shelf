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
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ef] dark:bg-gray-900">
        <p className="text-[#360816] dark:text-amber-400 text-lg font-medium">Loading story...</p>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ef] dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">
            {error || "Product not found"}
          </p>
          <Link to="/buyer/marketplace" className="text-[#360816] dark:text-amber-400 underline">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f3ef] dark:bg-gray-900 py-10 px-6 md:px-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 md:p-10 mb-10"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src={product.images?.[0] || "/placeholder-coffee.jpg"}
            alt={product.name}
            className="w-full md:w-1/3 h-64 object-cover rounded-xl shadow-md"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#360816] dark:text-amber-400 mb-2">
              {product.name}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-1">
              {product.variety} • {product.roastLevel} • {product.processingMethod}
            </p>

            <p className="text-gray-600 dark:text-gray-300 mb-1">
              📍 Grown at {product.altitudeGrown}m
            </p>

            <p className="text-[#360816] dark:text-amber-300 font-semibold mb-2">
              KES {product.price} per kg
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              By {product.farmerId?.name || `${product.farmerId?.firstName} ${product.farmerId?.lastName}`}
            </p>

            {product.qrCode && (
              <div className="mt-4 flex justify-center md:justify-start">
                <div className="text-center">
                  <img
                    src={product.qrCode}
                    alt="QR Code"
                    className="w-32 h-32 rounded-md shadow-sm mx-auto"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 md:p-8 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold text-[#360816] dark:text-amber-400 mb-4 flex items-center gap-2">
              <span>🌱</span> Farm Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
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
                  <p className="font-semibold text-[#360816] dark:text-amber-400 mb-2">
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

      {/* COFFEE PROCESS SLIDESHOW */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-12 mb-12"
      >
        <h2 className="text-4xl font-bold text-center mb-8 text-[#360816] dark:text-amber-400 font-archivo">
          From Farm to Your Cup
        </h2>
        <CoffeeProcessSlideshow />
      </motion.section>

      <div className="text-center mt-10">
        <Link
          to="/buyer/marketplace"
          className="inline-block bg-[#360816] dark:bg-amber-600 text-white px-8 py-3 rounded-md hover:bg-[#4a0a20] dark:hover:bg-amber-700 transition font-semibold"
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
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 md:p-8 hover:shadow-lg transition"
    >
      <h2 className="text-2xl font-semibold text-[#360816] dark:text-amber-400 mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>} {title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{text}</p>
    </motion.section>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="font-semibold text-[#360816] dark:text-amber-400">{label}:</p>
      <p className="text-gray-700 dark:text-gray-300">{value}</p>
    </div>
  );
}

// Coffee Process Slideshow Component
function CoffeeProcessSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stages = [
    { image: "/coffee-process/picking.jpg", title: "Picking", desc: "Hand-picked coffee cherries at peak ripeness" },
    { image: "/coffee-process/coffee-sorting.jpg", title: "Sorting", desc: "Carefully sorted to ensure only the best cherries" },
    { image: "/coffee-process/coffee-washing.jpg", title: "Washing", desc: "Washed to remove pulp and prepare for drying" },
    { image: "/coffee-process/coffee-drying.jpg", title: "Drying", desc: "Sun-dried to perfection on raised beds" },
    { image: "/coffee-process/green-beans.jpg", title: "Green Beans", desc: "Hulled and graded green coffee beans" },
    { image: "/coffee-process/roasting.jpg", title: "Roasting", desc: "Expertly roasted to bring out unique flavors" },
    { image: "/coffee-process/coffee-in-sack-2.jpg", title: "Storage", desc: "Stored in traditional coffee sacks" },
    { image: "/coffee-process/coffee-packaging.jpg", title: "Packaging", desc: "Packaged fresh with traceability QR code" },
    { image: "/coffee-process/brewed-coffee-2.jpg", title: "Brewed", desc: "Your perfect cup of authentic Kenyan coffee" }
  ];

  // Auto-advance every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [stages.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % stages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + stages.length) % stages.length);
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
      {/* Main Image */}
      <div className="relative h-[500px] md:h-[600px]">
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={stages[currentIndex].image}
          alt={stages[currentIndex].title}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Stage Info */}
        <motion.div
          key={`info-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 p-8 text-white"
        >
          <p className="text-amber-400 text-sm font-semibold mb-2">
            Stage {currentIndex + 1} of {stages.length}
          </p>
          <h3 className="text-4xl font-bold mb-3 font-archivo">
            {stages[currentIndex].title}
          </h3>
          <p className="text-lg text-gray-200">
            {stages[currentIndex].desc}
          </p>
        </motion.div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-4 rounded-full transition z-10"
          aria-label="Previous stage"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-4 rounded-full transition z-10"
          aria-label="Next stage"
        >
          →
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 py-6 bg-gradient-to-br from-[#360816] to-[#5e391c] dark:from-amber-900 dark:to-amber-800">
        {stages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-amber-400"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to stage ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}