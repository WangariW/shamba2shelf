/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";

import farmer1 from "../../assets/images/kamau-farmer.jpg";
import farmer2 from "../../assets/images/wanjiru-farmer.jpg";
import farmer3 from "../../assets/images/nduta-farm.jpg";
import heroImage from "../../assets/images/coffee-packaging-2.jpg";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [selectedForm, setSelectedForm] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products?limit=30");
        const data = await res.json();
        console.log("Fetched products:", data);
        setProducts(data.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);


  const counties = ["All", "Nyeri", "Kirinyaga", "Kiambu", "Muranga", "Embu", "Meru"];
  const forms = ["All", "Beans", "Ground Coffee"];
  const types = ["All", "Arabica", "Robusta", "Blend"];

  const filteredProducts = products.filter((p) => 
     p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      
      <section
        className="relative w-full h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <motion.div
          className="relative text-center text-white px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold mb-4 font-archivo">Discover Traceable Coffee</h1>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            Browse authentic Kenyan coffee — from beans to ground, all directly sourced
            from local farmers.
          </p>
          <a
            href="#products"
            className="bg-[#360816] px-6 py-3 rounded-md hover:bg-[#4a0a20] transition font-semibold"
          >
            Browse Products
          </a>
        </motion.div>
      </section>

      {/*Products*/}
      <section id="products" className="py-20 px-6 md:px-20">
        <h2 className="text-4xl font-bold text-center mb-10 font-archivo">
          Our Coffee Selection
        </h2>

        
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 mb-10 max-w-5xl mx-auto">
          <input
            type="text"
            placeholder="Search coffee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-[30%] px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-amber-400 dark:bg-gray-800"
          />

          {[ 
            { value: selectedCounty, set: setSelectedCounty, options: counties },
            { value: selectedForm, set: setSelectedForm, options: forms },
            { value: selectedType, set: setSelectedType, options: types },
          ].map((filter, idx) => (
            <select
              key={idx}
              value={filter.value}
              onChange={(e) => filter.set(e.target.value)}
              className="w-full md:w-[20%] px-4 py-3 rounded-md border border-gray-300 dark:bg-gray-800 focus:ring-2 focus:ring-[#3B1F0E] dark:focus:ring-amber-400"
            >
              {filter.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          ))}
        </div>

        {/*Product Cards*/}
        <motion.div
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { delayChildren: 0.2, staggerChildren: 0.1 },
            },
          }}
        >
          {filteredProducts.map((p) => (
            <motion.div
              key={p._id}
              whileHover={{ scale: 1.03 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition flex flex-col text-center"
            >
              <img src={p.image} alt={p.name} className="w-full h-56 object-cover hover:opacity-90 transition"/>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-2xl font-semibold mb-2">{p.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1"> Type: {p.type}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Form: {p.form}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">County: {p.county}</p>
                <p className="text-[#360816] dark:text-amber-300 font-semibold mb-3">{p.price}</p>
                <p className="text-sm text-gray-500 mb-4">By {p.farmer}</p>

                <div className="flex justify-center mb-3 transition-transform hover:scale-105">
                  {p.qrCode && (
                    <img
                      src={p.qrCode}
                      alt="QR Code"
                      className="mt-2 w-24 h-24 mx-auto rounded-md shadow-md cursor-pointer"
                      onClick={() =>
                        window.open(`http://localhost:5173/product/${p._id}`, "_blank")
                      }
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1 italic"> Scan to trace origin</p>
                </div>

                <Link
                  to={`/trace/${p._id || p.id}`}
                  className="mt-auto block w-full bg-[#360816] text-white py-2 rounded-md hover:bg-[#4a0a20] transition font-semibold"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      
      <section className="bg-[#F7F3F0] dark:bg-gray-800 py-20 px-6 md:px-20">
        <h2 className="text-4xl font-bold text-center mb-10 font-archivo">
          Meet Our Farmers
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              name: "Kamau Farm",
              img: farmer1,
              story:
                "Located in Nyeri’s lush highlands, Kamau’s family farm has been growing Arabica beans for over three generations.",
            },
            {
              name: "Wanjiru Estate",
              img: farmer2,
              story:
                "Nestled in Kirinyaga, Wanjiru Estate is known for sustainable farming and empowering women in coffee production.",
            },
            {
              name: "Nduta Farm",
              img: farmer3,
              story:
                "From Muranga hills, Nduta Farm blends tradition and technology to deliver rich, traceable coffee experiences.",
            },
          ].map((f) => (
            <motion.div
              key={f.name}
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md text-center hover:shadow-xl transition"
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={f.img}
                alt={f.name}
                className="w-full h-60 object-cover rounded-lg mb-4"
              />
              <h3 className="text-2xl font-semibold text-[#360816] dark:text-amber-300 mb-2">
                {f.name}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{f.story}</p>
            </motion.div>
          ))}
        </div>
      </section>

      
      <section className="bg-[#360816] text-white py-20 px-6 md:px-20 text-center overflow-hidden">
        <motion.h2
          className="text-4xl font-bold mb-10 font-archivo"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          The Farm-to-Cup Journey
        </motion.h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            { title: "Farm Harvest", desc: "Fresh coffee cherries are handpicked by our farmers.", icon: "🌱" },
            { title: "Processing", desc: "Beans are pulped, dried, and roasted locally.", icon: "🔥" },
            { title: "Packaging", desc: "Each batch is packed with a traceable QR code.", icon: "📦" },
            { title: "Your Cup", desc: "Enjoy authentic Kenyan coffee — straight from the farm.", icon: "☕" },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition cursor-default"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center text-3xl"
                initial={{ rotate: -10, scale: 0 }}
                whileInView={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                {s.icon}
              </motion.div>

              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-200 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
