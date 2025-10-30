/* eslint-disable no-unused-vars */
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "../assets/images/plantation.jpg";
import aboutImage from "../assets/images/coffeepicking1.jpg";
import coffeeSortingImage from "../assets/images/coffee-sorting.jpg";
import farmerImage from "../assets/images/farmer-2.jpg"


export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800 dark:bg-[#1f1b18] dark:text-gray-100 transition-colors duration-300">

      {/*hero*/}
      <section
        className="relative w-full h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay*/}
        <div className="absolute inset-0 bg-black bg-opacity-40 dark:bg-opacity-60"></div>

        {/* text box */}
        <div className="relative bg-white/90 dark:bg-[#2a2520]/90 backdrop-blur-sm rounded-xl p-10 max-w-2xl text-center shadow-lg">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-4">
            From the Shamba to Your Shelf
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
            Experience authentic, traceable coffee directly from farmers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
            to="/buyer/marketplace"
            className="bg-[#1f1b18] dark:bg-[#c49a6c] text-white dark:text-[#1f1b18] px-6 py-3 rounded-md hover:bg-gray-800 dark:hover:bg-[#b18755] transition">
            Explore Marketplace
            </Link>

            <Link
            to="/login"
            className="border border-gray-700 dark:border-[#c49a6c] text-gray-700 dark:text-[#c49a6c] px-6 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a2520] transition">
               Login
            </Link>
          </div>
        </div>
      </section>

      {/*about*/}
      <section className="bg-white dark:bg-[#1f1b18] py-20 px-6 md:px-20 space-y-20 ">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2 flex justify-center">
            <img
              src={aboutImage}
              alt="Coffee plantation"
              className="rounded-lg border-2 border-gray-300 dark:border-[#3a322b] shadow-md w-[500px] md:w-[550px]"
            />
          </div>


          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-[#f5f5f5] mb-4">
              About Us
            </h2>
            <p className="text-lg text-[#360816] dark:text-gray-300 leading-relaxed font-adamina">
              At <span className="font-semibold text-[#360816] dark:text-[#c49a6c]">Shamba2Shelf</span>,
              we believe every cup of coffee has a story worth sharing — one that begins
              in the rich soils of local farms and ends in your hands. Our platform connects
              dedicated coffee farmers directly with buyers, creating transparent, fair,
              and traceable farm-to-cup experiences.
            </p>
          </div>
        </div>


        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-600 my-10"></div>


        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          <div className="md:w-1/2 flex justify-center">
            <img
              src={coffeeSortingImage}
              alt="Coffee sorting"
              className="rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md w-[500px] md:w-[550px]"
            />
          </div>


          <div className="md:w-1/2 text-center md:text-left">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Empowering Farmers
            </h3>
            <p className="text-lg text-[#360816] dark:text-[#f5d7c2] leading-relaxed font-adamina">
              Coffee is more than a beverage — it is a livelihood. We work hand in hand with
              local farmers to ensure their craft is appreciated, their stories are told,
              and their efforts are rewarded. Through fair trade, transparency, and innovation,
              <span className="font-semibold text-[#360816] dark:text-[#e3b898]"> Shamba2Shelf </span>
              brings the farm closer to every cup.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
        <section className="bg-white py-24 px-6 md:px-20 text-center md:text-left">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">

      {/* Vision */}
       <motion.div
        className="flex flex-col items-center md:items-start text-[#360816]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      <div className="w-36 h-36 border-4 border-[#1D2128] rounded-full flex items-center justify-center mb-6">
        {/* Mountain Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-16 h-16 text-[#171A1F]"
        >
          <path d="M12 2L1 21h22L12 2zm0 4.84L18.93 19H5.07L12 6.84zM11 10v4h2v-4h-2z" />
        </svg>
      </div>
      <h3 className="text-4xl font-bold text-[#171A1F] mb-4 font-archivo">Our Vision</h3>
      <p className="text-lg font-semibold leading-relaxed font-adamina max-w-lg">
        To build a transparent, sustainable bridge between farmers and buyers —
        empowering local coffee growers and making every cup meaningful.
      </p>
    </motion.div>

    {/* Mission */}
    <motion.div
      className="flex flex-col items-center md:items-start text-[#360816]"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      <div className="w-36 h-36 border-4 border-[#1D2128] rounded-full flex items-center justify-center mb-6">
        {/* Bulb Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="w-16 h-16 text-[#171A1F]"
        >
          <path d="M9 21h6v-1H9v1zm3-20C7.48 1 4 4.48 4 9c0 2.86 1.51 5.37 3.84 6.78L8 17h8l.16-1.22C18.49 14.37 20 11.86 20 9c0-4.52-3.48-8-8-8zm0 13h-2v-2h2v2zm1-4h-4V7h4v3z" />
        </svg>
      </div>
      <h3 className="text-4xl font-bold text-[#171A1F] mb-4 font-archivo">Our Mission</h3>
          <p className="text-lg font-semibold leading-relaxed font-adamina max-w-lg">
          To connect passionate coffee farmers with conscious buyers through
          technology, ensuring fairness, traceability, and a direct farm-to-cup
          experience.
          </p>
        </motion.div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#5e391c] dark:bg-[#2f1b0f] py-16 px-6 md:px-20 text-white rounded-2xl mx-auto max-w-7xl shadow-lg my-16"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div
            className="md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}>

          <h2 className="text-4xl font-bold text-white mb-4 font-archivo">Get Started!

          </h2>
          <p className="text-lg text-gray-100 leading-relaxed font-adamina mb-6">
        Join our coffee community and discover traceable, high-quality beans
        sourced directly from passionate farmers across the region.
      </p>
      <Link
        to="/signup"
        className="inline-block bg-[#360816] text-white px-8 py-3 rounded-md hover:bg-[#4a0a20] transition font-semibold"
      >
        Sign Up Now
      </Link>
    </motion.div>


            <motion.div
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}>

              <img
              src={farmerImage}
              alt="Farmer"
              className="rounded-xl shadow-md w-[900px] md:w-[1050px] border-2 border-[#fff3] object-cover"/>
            </motion.div>
          </div>
        </section>

        {/*footer*/}
        <footer className="bg-[#7d7d80] dark:bg-[#1a1a1a] text-gray-300 dark:text-gray-400 py-10 px-6 md:px-20 transition-colors duration-500">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 font-archivo">
              Shamba2Shelf
              </h3>
              <p className="text-sm text-gray-400 ">
                From the shamba to your shelf — connecting farmers and buyers through
                trust, traceability, and great coffee.
              </p>
             </div>

    
              <div>
               <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
               <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/buyer/marketplace" className="hover:text-white transition">Marketplace</Link></li>
              <li><Link to="/farmer/dashboard" className="hover:text-white transition">Farmer Dashboard</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
            </ul>
          </div>

    
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Contact</h4>
            <p className="text-sm">Email: support@shamba2shelf.com</p>
            <p className="text-sm">Phone: +254 712 345 678</p>
            <p className="text-sm">Location: Nairobi, Kenya</p>
          </div>
        </div>


        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Shamba2Shelf. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
