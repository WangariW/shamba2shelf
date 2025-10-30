/* eslint-disable no-unused-vars */
import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";

// Product images
import nyeribeansImage from "../../assets/images/roasted-beans-2.jpg";
import robustagroundImage from "../../assets/images/ground-coffee.jpg";
import blendbeansImage from "../../assets/images/blend-beans.jpeg";
import murangagroundImage from "../../assets/images/arabica-muranga.jpg";
import embubeansImage from "../../assets/images/robusta-beans.jpg";
import merugroundImage from "../../assets/images/arabica-meru.jpg";
import heroImage from "../../assets/images/coffee-packaging-2.jpg";

export default function ProductDetails() {
  const { id } = useParams();

  const products = [
    {
      id: 1,
      name: "Arabica AA Nyeri Beans",
      type: "Arabica",
      form: "Beans",
      price: "KSh 1200/kg",
      image: nyeribeansImage,
      farmer: "Kamau Farm",
      county: "Nyeri",
      description:
        "Arabica AA from Kamau Farm is grown in Nyeri’s high altitudes, producing a vibrant, fruity cup with floral undertones and bright acidity.",
    },
    {
      id: 2,
      name: "Robusta Kirinyaga Ground",
      type: "Robusta",
      form: "Ground Coffee",
      price: "KSh 1000/kg",
      image: robustagroundImage,
      farmer: "Wanjiru Estate",
      county: "Kirinyaga",
      description:
        "A bold, full-bodied Robusta ground coffee from Wanjiru Estate, known for its strong aroma and creamy finish.",
    },
    {
      id: 3,
      name: "Blend Kiambu Beans",
      type: "Blend",
      form: "Beans",
      price: "KSh 1100/kg",
      image: blendbeansImage,
      farmer: "Gatundu Coffee Co.",
      county: "Kiambu",
      description:
        "A premium blend of Arabica and Robusta beans from Kiambu, balanced for smoothness, depth, and mild acidity.",
    },
    {
      id: 4,
      name: "Arabica Muranga Ground",
      type: "Arabica",
      form: "Ground Coffee",
      price: "KSh 1150/kg",
      image: murangagroundImage,
      farmer: "Nduta Farm",
      county: "Muranga",
      description:
        "Nduta Farm’s Muranga-grown Arabica is roasted medium-dark to highlight nutty, chocolatey notes and low bitterness.",
    },
    {
      id: 5,
      name: "Robusta Embu Beans",
      type: "Robusta",
      form: "Beans",
      price: "KSh 950/kg",
      image: embubeansImage,
      farmer: "Gikundu Farm",
      county: "Embu",
      description:
        "Robusta beans from Gikundu Farm feature a deep, rich taste profile with earthy tones and exceptional crema.",
    },
    {
      id: 6,
      name: "Arabica Meru Ground",
      type: "Arabica",
      form: "Ground Coffee",
      price: "KSh 1180/kg",
      image: merugroundImage,
      farmer: "Muriuki Estate",
      county: "Meru",
      description:
        "Meru Arabica ground coffee offers delicate sweetness, medium body, and hints of citrus, perfect for pour-overs.",
    },
  ];

  const product = products.find((p) => p.id === parseInt(id));
  if (!product) return <p className="text-center mt-20">Product not found</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* HERO SECTION */}
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

      {/* PRODUCT DETAILS */}
      <section className="py-16 px-6 md:px-20 flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
        {/* Image */}
        <motion.img
          src={product.image}
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
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold">Type:</span> {product.type}</p>
            <p><span className="font-semibold">Form:</span> {product.form}</p>
            <p><span className="font-semibold">Farmer:</span> {product.farmer}</p>
            <p><span className="font-semibold">County:</span> {product.county}</p>
          </div>

          <p className="text-2xl font-semibold text-[#360816] dark:text-amber-300 mt-4">
            {product.price}
          </p>

          {/* QR Code */}
          <div className="flex flex-col items-center mt-8">
            <QRCodeCanvas
              value={`https://shamba2shelf.com/trace/${product.id}`}
              size={100}
              bgColor="#ffffff"
              fgColor="#360816"
              includeMargin={false}
              className="rounded-md shadow-md mb-4"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Scan to trace origin and authenticity
            </p>
          </div>

          {/* Buttons */}
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
