/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CartContext from "../../context/CartContext.jsx";
import api from "../../api/axios.jsx";

import heroImage from "../../assets/images/coffee-packaging-2.jpg";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [selectedForm, setSelectedForm] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState([]);

  const { cartItems, addToCart: contextAddToCart } = useContext(CartContext);

  const addToCart = (product, qty = 1) => {
    if (typeof contextAddToCart === "function") {
      contextAddToCart(product, qty);
    } else {
      console.warn("addToCart not available in CartContext; fallback logging:", product, qty);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await api.get('/products?limit=30');
        console.log("Fetched products:", productsRes.data);
        setProducts(productsRes.data.data || []);

        const farmersRes = await api.get('/farmers/top-rated');
        console.log("Fetched top farmers:", farmersRes.data);
        setFarmers(farmersRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const counties = ["All", "Nyeri", "Kirinyaga", "Kiambu", "Muranga", "Embu", "Meru"];
  const forms = ["All", "Beans", "Ground Coffee"];
  const types = ["All", "Arabica", "Robusta", "Blend"];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCounty = selectedCounty === "All" || p.farmerId?.county === selectedCounty;
    const matchesForm = selectedForm === "All" || p.form === selectedForm;
    const matchesType = selectedType === "All" || p.type === selectedType;
    
    return matchesSearch && matchesCounty && matchesForm && matchesType;
  });

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
          
          <a href="#products"
            className="bg-[#360816] px-6 py-3 rounded-md hover:bg-[#4a0a20] transition font-semibold">
            Browse Products
            </a>
        </motion.div>
      </section>

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

        {loading ? (
          <div className="text-center py-10">
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p>No products found matching your filters.</p>
          </div>
        ) : (
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
                <img src={p.image || p.images?.[0]} alt={p.name} className="w-full h-56 object-cover hover:opacity-90 transition"/>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-2xl font-semibold mb-2">{p.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Type: {p.type || p.type}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Form: {p.form}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">County: {p.farmerId?.county || "N/A"}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Available: {p.quantity || "N/A"} kg</p>
                  <p className="text-[#360816] dark:text-amber-300 font-semibold mb-3">KES {p.price}</p>
                  <p className="text-sm text-gray-500 mb-4">By {p.farmerId?.name || "N/A"}</p>

                  <div className="flex flex-col items-center mb-3 transition-transform hover:scale-105">
                    {p.qrCode && (
                      <img
                        src={p.qrCode}
                        alt="QR Code"
                        className="mt-2 w-24 h-24 rounded-md shadow-md cursor-pointer"
                        onClick={() =>
                          window.open(`/trace/${p._id}`, "_blank")
                        }
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1 italic">Scan to trace origin</p>
                  </div>

                  <Link
                    to={`/product/${p._id}`}
                    className="flex-1 block text-center bg-[#360816] text-white py-2 rounded-md hover:bg-[#4a0a20] transition font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          
          </motion.div>
        )}
      </section>

      <section className="bg-[#F7F3F0] dark:bg-gray-800 py-20 px-6 md:px-20">
        <h2 className="text-4xl font-bold text-center mb-10 font-archivo">
          Meet Our Farmers
        </h2>
        {farmers.length === 0 ? (
          <p className="text-center text-gray-600">No farmers available at the moment.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {farmers.slice(0, 3).map((f) => (
              <motion.div
                key={f._id}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md text-center hover:shadow-xl transition"
                whileHover={{ scale: 1.03 }}
              >
                <div className="w-full h-60 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {f.profileImage ? (
                    <img src={f.profileImage} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                      <p className="text-gray-500">No Photo</p>
                  )}
                </div>  
                <h3 className="text-2xl font-semibold text-[#360816] dark:text-amber-300 mb-2">
                  {f.name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  📍 {f.county}
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  ⭐ Rating: {f.averageRating || "N/A"}
                </p>
              </motion.div>
            ))}
          </div>
        )}
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