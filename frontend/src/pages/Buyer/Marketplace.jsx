/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import nyeribeansImage from "../../assets/images/roasted-beans-2.jpg";
import robustagroundImage from "../../assets/images/ground-coffee.jpg";
import blendbeansImage from "../../assets/images/blend-beans.jpeg";
import murangagroundImage from "../../assets/images/arabica-muranga.jpg";
import embubeansImage from "../../assets/images/robusta-beans.jpg";
import merugroundImage from "../../assets/images/arabica-meru.jpg";

import farmer1 from "../../assets/images/kamau-farmer.jpg";
import farmer2 from "../../assets/images/wanjiru-farmer.jpg";
import farmer3 from "../../assets/images/nduta-farm.jpg";
import heroImage from "../../assets/images/coffee-packaging-2.jpg";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [selectedForm, setSelectedForm] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  // === Product Data ===
  const products = [
    {
      id: 1,
      name: "Arabica AA  Nyeri Beans",
      type: "Arabica",
      form: "Beans",
      price: "KSh 1200/kg",
      image: nyeribeansImage,
      farmer: "Kamau Farm",
      county: "Nyeri",
    },
    {
      id: 2,
      name: "Robusta  Kirinyaga Ground",
      type: "Robusta",
      form: "Ground Coffee",
      price: "KSh 1000/kg",
      image: robustagroundImage,
      farmer: "Wanjiru Estate",
      county: "Kirinyaga",
    },
    {
      id: 3,
      name: "Blend  Kiambu Beans",
      type: "Blend",
      form: "Beans",
      price: "KSh 1100/kg",
      image: blendbeansImage,
      farmer: "Gatundu Coffee Co.",
      county: "Kiambu",
    },
    {
      id: 4,
      name: "Arabica  Muranga Ground",
      type: "Arabica",
      form: "Ground Coffee",
      price: "KSh 1150/kg",
      image: murangagroundImage,
      farmer: "Nduta Farm",
      county: "Muranga",
    },
    {
      id: 5,
      name: "Robusta  Embu Beans",
      type: "Robusta",
      form: "Beans",
      price: "KSh 950/kg",
      image: embubeansImage,
      farmer: "Gikundu Farm",
      county: "Embu",
    },
    {
      id: 6,
      name: "Arabica  Meru Ground",
      type: "Arabica",
      form: "Ground Coffee",
      price: "KSh 1180/kg",
      image: merugroundImage,
      farmer: "Muriuki Estate",
      county: "Meru",
    },
  ];

  // === Filter Options ===
  const counties = ["All", "Nyeri", "Kirinyaga", "Kiambu", "Muranga", "Embu", "Meru"];
  const forms = ["All", "Beans", "Ground Coffee"];
  const types = ["All", "Arabica", "Robusta", "Blend"];

  // === Filtering Logic ===
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCounty = selectedCounty === "All" || p.county === selectedCounty;
    const matchesForm = selectedForm === "All" || p.form === selectedForm;
    const matchesType = selectedType === "All" || p.type === selectedType;
    return matchesSearch && matchesCounty && matchesForm && matchesType;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* HERO SECTION  */}
      <section
        className="relative w-full h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-4">Discover Traceable Coffee</h1>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            Browse authentic Kenyan coffee — from beans to ground, all directly sourced from local farmers.
          </p>
          <Link
            to="#products"
            className="bg-[#360816] px-6 py-3 rounded-md hover:bg-[#4a0a20] transition"
          >
            Browse Products
          </Link>
        </div>
      </section>

      {/* === FILTERS & PRODUCTS === */}
      <section id="products" className="py-20 px-6 md:px-20">
        <h2 className="text-4xl font-bold text-center mb-10 font-archivo">
          Our Coffee Selection
        </h2>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 mb-10 max-w-5xl mx-auto">
          <input
            type="text"
            placeholder="Search coffee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[30%] px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#3B1F0E]"
          />

          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="w-full md:w-[20%] px-4 py-3 rounded-md border border-gray-300"
          >
            {counties.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="w-full md:w-[20%] px-4 py-3 rounded-md border border-gray-300"
          >
            {forms.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-[20%] px-4 py-3 rounded-md border border-gray-300"
          >
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Product Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition relative flex flex-col items-center text-center"
              whileHover={{ scale: 1.03 }}
            >
              <img src={p.image} alt={p.name} className="w-full h-56 object-cover" />
              <div className="p-5 w-full">
                <h3 className="text-2xl font-semibold mb-2">{p.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Type: {p.type}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Form: {p.form}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">County: {p.county}</p>
                <p className="text-[#360816] dark:text-amber-300 font-semibold mb-3">{p.price}</p>
                <p className="text-sm text-gray-500 mb-4">By {p.farmer}</p>

                {/* Centered QR Code */}
                <div className="flex justify-center">
                  <QRCodeCanvas
                    value={`https://shamba2shelf.com/trace/${p.id}`}
                    size={70}
                    bgColor="#ffffff"
                    fgColor="#360816"
                    includeMargin={false}
                    className="rounded-md shadow-md"
                  />
                </div>

                <Link
                  to={`/product/${p.id}`}
                  className="block w-full mt-4 bg-[#360816] text-white py-2 rounded-md hover:bg-[#4a0a20] transition"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === FARMER STORIES === */}
      <section className="bg-[#F7F3F0] dark:bg-gray-800 py-20 px-6 md:px-20">
        <h2 className="text-4xl font-bold text-center mb-10 font-archivo">
          Meet Our Farmers
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[ 
            { name: "Kamau Farm", img: farmer1, story: "Located in Nyeris lush highlands, Kamaus family farm has been growing Arabica beans for over three generations." },
            { name: "Wanjiru Estate", img: farmer2, story: "Nestled in Kirinyaga, Wanjiru Estate is known for sustainable farming and empowering women in coffee production." },
            { name: "Nduta Farm", img: farmer3, story: "From Muranga hills, Nduta Farm blends tradition and technology to deliver rich, traceable coffee experiences." }
          ].map((f) => (
            <div key={f.name} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md text-center">
              <img src={f.img} alt={f.name} className="w-full h-60 object-cover rounded-lg mb-4" />
              <h3 className="text-2xl font-semibold text-[#360816] dark:text-amber-300 mb-2">{f.name}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{f.story}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FARM-TO-CUP JOURNEY */}
<section className="bg-[#360816] text-white py-20 px-6 md:px-20 text-center overflow-hidden">
  <motion.h2
    className="text-4xl font-bold mb-10 font-archivo"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    viewport={{ once: true }}
  >
    The Farm-to-Cup Journey
  </motion.h2>

  <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
    {[
      {
        step: "1",
        title: "Farm Harvest",
        desc: "Fresh coffee cherries are handpicked by our farmers.",
        icon: "🌱",
      },
      {
        step: "2",
        title: "Processing",
        desc: "Beans are pulped, dried, and roasted locally.",
        icon: "🔥",
      },
      {
        step: "3",
        title: "Packaging",
        desc: "Each batch is packed with a traceable QR code.",
        icon: "📦",
      },
      {
        step: "4",
        title: "Your Cup",
        desc: "Enjoy authentic Kenyan coffee — straight from the farm.",
        icon: "☕",
      },
    ].map((s, i) => (
      <motion.div
        key={s.step}
        className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition cursor-default"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.8, delay: i * 0.2 }}
        viewport={{ once: true }}
      >
        {/* Animated Icon */}
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center text-3xl"
          initial={{ rotate: -10, scale: 0 }}
          whileInView={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
        >
          {s.icon}
        </motion.div>

        <motion.h3
          className="text-xl font-semibold mb-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.3 }}
        >
          {s.title}
        </motion.h3>
        <motion.p
          className="text-gray-200 text-sm"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.4 }}
        >
          {s.desc}
        </motion.p>
      </motion.div>
    ))}
  </div>
</section>

    </div>
  );
}
