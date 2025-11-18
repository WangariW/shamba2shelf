/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import heroImage from "../../assets/images/coffee-packaging-2.jpg";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await res.json();
        console.log("Fetched product:", data);
        setProduct(data.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center mt-20">Loading product details...</p>;
  if (!product) return <p className="text-center mt-20">Product not found.</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <section
        className="relative w-full h-[50vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center text-white px-6">
          <motion.h1
            className="text-5xl font-bold mb-3 font-archivo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {product.name}
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover the story behind this traceable, farm-fresh coffee.
          </motion.p>
        </div>
      </section>

    
      <section className="py-16 px-6 md:px-20 flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
        <motion.img
          src={product.images?.[0] || "https://via.placeholder.com/500"}
          alt={product.name}
          className="rounded-xl shadow-lg w-full md:w-[45%] object-cover"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Text Details */}
        <motion.div
          className="md:w-[55%] space-y-5"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-[#360816] dark:text-amber-300 font-archivo">
            {product.name}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-adamina">
            {product.description || "No description available for this product."}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold">Variety:</span> {product.variety}</p>
            <p><span className="font-semibold">Roast:</span> {product.roastLevel}</p>
            <p><span className="font-semibold">Method:</span> {product.processingMethod}</p>
            <p><span className="font-semibold">Altitude:</span> {product.altitudeGrown}m</p>
            <p><span className="font-semibold">Farmer:</span> {product.farmerId?.firstName} {product.farmerId?.lastName}</p>
          </div>

          <p className="text-2xl font-semibold text-[#360816] dark:text-amber-300 mt-4">
            KES {product.price}
          </p>

          {/* QR Code */}
          <div className="flex flex-col items-center mt-8">
            {product.qrCode && (
              <img
                src={product.qrCode}
                alt="QR Code"
                className="w-28 h-28 mx-auto rounded-md shadow-md mb-3"
              />
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Scan to trace origin and authenticity
            </p>
          </div>

        
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/buyer/checkout"
              className="bg-[#360816] text-white px-8 py-3 rounded-md hover:bg-[#4a0a20] transition"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/buyer/marketplace"
              className="border border-[#360816] dark:border-amber-300 text-[#360816] dark:text-amber-300 px-8 py-3 rounded-md hover:bg-[#360816] hover:text-white dark:hover:bg-amber-300 dark:hover:text-gray-900 transition"
            >
              Back to Marketplace
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
