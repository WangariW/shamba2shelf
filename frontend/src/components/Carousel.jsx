/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Jane Wambui",
    role: "Farmer – Kirinyaga",
    message:
      "Since joining Shamba2Shelf, I earn fair prices and connect directly with buyers. My coffee finally tells its story!",
    image: "/src/assets/images/farmer-3.jpg",
  },
  {
    name: "Michael Otieno",
    role: "Buyer – Nairobi",
    message:
      "The traceability feature is a game changer. I know exactly where my coffee comes from, and it tastes even better.",
    image: "/src/assets/images/farmer-2.jpg",
  },
  {
    name: "Grace Kilonzo",
    role: "Exporter – Machakos",
    message:
      "I love how transparent the process is. It builds trust across everyone in the supply chain.",
    image: "/src/assets/images/coffee-sorting.jpg",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);

  // Scroll fade + upward motion
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0.1 0.9", "0.9 0.1"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((current + 1) % testimonials.length);
  const prev = () => setCurrent((current - 1 + testimonials.length) % testimonials.length);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className="relative flex flex-col items-center justify-center w-full max-w-5xl mx-auto"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-[#1f1b18] shadow-xl rounded-2xl p-10 text-center relative w-full"
        >
          <Quote className="w-10 h-10 text-amber-500 dark:text-amber-400 mx-auto mb-4" />
          <p className="text-lg italic text-gray-700 dark:text-gray-200 mb-6">
            "{testimonials[current].message}"
          </p>
          <div className="flex flex-col items-center">
            <img
              src={testimonials[current].image}
              alt={testimonials[current].name}
              className="w-16 h-16 rounded-full object-cover border-4 border-[#3B1F0E] dark:border-amber-400 mb-3"
            />
            <h4 className="font-bold text-[#3B1F0E] dark:text-amber-400">
              {testimonials[current].name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {testimonials[current].role}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="absolute inset-x-0 flex justify-between px-6 mt-4">
        <button
          onClick={prev}
          className="bg-[#3B1F0E]/10 dark:bg-amber-400/20 p-2 rounded-full hover:bg-[#3B1F0E]/20 dark:hover:bg-amber-400/40 transition"
        >
          <ChevronLeft className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
        </button>
        <button
          onClick={next}
          className="bg-[#3B1F0E]/10 dark:bg-amber-400/20 p-2 rounded-full hover:bg-[#3B1F0E]/20 dark:hover:bg-amber-400/40 transition"
        >
          <ChevronRight className="w-6 h-6 text-[#3B1F0E] dark:text-amber-400" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {testimonials.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current
                ? "bg-[#3B1F0E] dark:bg-amber-400 scale-110"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          ></div>
        ))}
      </div>
    </motion.div>
  );
}
