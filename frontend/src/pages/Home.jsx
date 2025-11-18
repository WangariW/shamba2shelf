/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Sun, Moon, Quote } from "lucide-react";
import heroImage from "../assets/images/plantation.jpg";
import aboutImage from "../assets/images/coffeepicking1.jpg";
import coffeeSortingImage from "../assets/images/coffee-sorting.jpg";
import Carousel from "../components/Carousel.jsx";
import farmerImage from "../assets/images/farmer-2.jpg";

export default function Home() {
  const [dark, setDark] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 400], [0, -100]);
  const [stats, setStats] = useState({ farmers: 0, buyers: 0, batches: 0 });

  // Smooth stat counters
  useEffect(() => {
    const timeout = setTimeout(() => {
      setStats({ farmers: 120, buyers: 350, batches: 1247 });
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-white text-gray-800 dark:bg-[#1f1b18] dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      {/* 🔘 Theme Toggle */}
      <button
        onClick={() => setDark((prev) => !prev)}
        className="fixed top-6 right-6 z-50 bg-[#3B1F0E] dark:bg-amber-400 text-white dark:text-[#3B1F0E] p-3 rounded-full shadow-lg hover:scale-105 transition"
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* 🏔 Hero Section */}
      <motion.section
        className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 dark:bg-black/70"
          style={{ y: y2 }}
        ></motion.div>

        <motion.div
          className="relative bg-white/80 dark:bg-[#2a2520]/90 backdrop-blur-md rounded-xl p-10 max-w-2xl text-center shadow-lg z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ y: y1 }}
        >
          <h1 className="text-5xl font-bold mb-4 font-archivo">
            From the <span className="text-[#3B1F0E] dark:text-amber-400">Shamba</span> to Your Shelf
          </h1>
          <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
            Experience authentic, traceable coffee directly from farmers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/buyer/marketplace"
              className="bg-[#3B1F0E] dark:bg-amber-400 text-white dark:text-[#3B1F0E] px-6 py-3 rounded-md hover:scale-105 transition"
            >
              Explore Marketplace
            </Link>
            <Link
              to="/login"
              className="border border-gray-700 dark:border-amber-400 px-6 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a2520] transition"
            >
              Login
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-6 text-white text-sm animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          ↓ Scroll to explore
        </motion.div>
      </motion.section>

      {/* 🌿 About Section */}
      <section className="py-24 px-6 md:px-20 space-y-24 bg-gradient-to-b from-[#fff] to-[#f9f6f3] dark:from-[#1f1b18] dark:to-[#14110e]">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <motion.img
            src={aboutImage}
            alt="Coffee plantation"
            className="rounded-xl shadow-lg w-[500px] md:w-[550px] border-2 border-gray-300 dark:border-[#3a322b]"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 font-archivo">About Us</h2>
            <p className="text-lg leading-relaxed font-adamina">
              At <span className="font-semibold text-[#3B1F0E] dark:text-amber-400">Shamba2Shelf</span>,
              we believe every cup of coffee has a story — one that begins in
              the rich soils of local farms and ends in your hands.
            </p>
          </motion.div>
        </div>

        {/* Empowering Farmers */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          <motion.img
            src={coffeeSortingImage}
            alt="Coffee sorting"
            className="rounded-xl shadow-lg w-[500px] md:w-[550px] border-2 border-gray-300 dark:border-gray-700"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-4 font-archivo">
              Empowering Farmers
            </h3>
            <p className="text-lg leading-relaxed font-adamina">
              Coffee is more than a beverage — it is a livelihood. We work hand in hand
              with local farmers to ensure fair trade, transparency, and innovation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 📊 Stats Section */}
      <motion.section
        className="py-20 bg-[#3B1F0E] dark:bg-[#2A140A] text-white text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h3 className="text-4xl font-bold mb-12 font-archivo">
          Our Impact in Numbers
        </h3>
        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {[
            { label: "Farmers Empowered", value: stats.farmers },
            { label: "Active Buyers", value: stats.buyers },
            { label: "Batches Traced", value: stats.batches },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-6 rounded-lg bg-white/10 backdrop-blur-sm shadow-md"
            >
              <p className="text-5xl font-bold mb-2 text-amber-300">
                {stat.value.toLocaleString()}+
              </p>
              <p className="text-sm uppercase tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 💬 Testimonials Carousel */}
      <section className="bg-[#F9F6F3] dark:bg-[#2A241F] py-20 px-6 md:px-20">
  <motion.h2
    className="text-4xl font-bold text-center mb-12 text-[#3B1F0E] dark:text-amber-400 font-archivo"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    viewport={{ once: true }}
  >
    What Our Community Says
  </motion.h2>

  <Carousel />
</section>

    

      {/* ☕ CTA */}
      <motion.section
        className="bg-[#5e391c] dark:bg-[#2f1b0f] py-20 text-white text-center rounded-t-3xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold mb-4 font-archivo">
          Join Our Coffee Revolution
        </h2>
        <p className="text-lg mb-8 font-adamina">
          Sign up today and be part of Kenya’s growing traceable coffee movement.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-white text-[#3B1F0E] px-8 py-3 rounded-md hover:bg-gray-200 font-semibold transition"
        >
          Sign Up Now
        </Link>
      </motion.section>

      {/* 🧩 Footer */}
      <footer className="bg-[#7d7d80] dark:bg-[#1a1a1a] text-gray-300 py-10 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold mb-2 text-white font-archivo">
              Shamba2Shelf
            </h3>
            <p className="text-sm">
              From the shamba to your shelf — connecting farmers and buyers
              through trust and traceability.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/buyer/marketplace" className="hover:text-white">Marketplace</Link></li>
              <li><Link to="/farmer/dashboard" className="hover:text-white">Farmer Dashboard</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Contact</h4>
            <p>Email: support@shamba2shelf.com</p>
            <p>Phone: +254 712 345 678</p>
            <p>Location: Nairobi, Kenya</p>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-10 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Shamba2Shelf. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
