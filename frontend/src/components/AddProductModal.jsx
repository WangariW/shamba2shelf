/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios.jsx";

export default function AddProductModal({ isOpen, onClose, farmerId, onProductAdded }) {
  const [form, setForm] = useState({
    name: "",
    variety: "",
    roastLevel: "",
    processingMethod: "",
    altitudeGrown: "",
    price: "",
    quantity: "",
    description: "",
    flavorNotes: "",
    images: [],
  });

  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setForm({
        name: "",
        variety: "",
        roastLevel: "",
        processingMethod: "",
        altitudeGrown: "",
        price: "",
        quantity: "",
        description: "",
        flavorNotes: "",
        images: [],
      });
      setPreviewUrls([]);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images" && files) {
      const fileArray = Array.from(files);
      setForm((prev) => ({ ...prev, images: fileArray }));

      const urls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRemoveImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const data = new FormData();

      data.append("farmerId", farmerId);
      data.append("name", form.name);
      data.append("variety", form.variety);
      data.append("roastLevel", form.roastLevel);
      data.append("processingMethod", form.processingMethod);
      data.append("altitudeGrown", form.altitudeGrown);
      data.append("price", form.price);
      data.append("quantity", form.quantity);
      data.append("description", form.description);

      if (form.flavorNotes.trim() !== "") {
        form.flavorNotes.split(",").forEach((note) => {
          const clean = note.trim();
          if (clean) data.append("flavorNotes", clean);
        });
      }

      if (form.images && form.images.length) {
        form.images.forEach((file) => data.append("images", file));
      }

      await api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully");
      onProductAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error saving product. Check required fields.");
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-[#252525] p-6 rounded-xl shadow-xl w-full max-w-lg"
      >
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <div className="flex flex-col gap-3">
          <input name="name" placeholder="Product Name" onChange={handleChange} className="input" />

          <select name="variety" onChange={handleChange} className="input">
            <option value="">Select Variety</option>
            <option value="SL28">SL28</option>
            <option value="SL34">SL34</option>
            <option value="Ruiru 11">Ruiru 11</option>
            <option value="Batian">Batian</option>
            <option value="Blue Mountain">Blue Mountain</option>
            <option value="K7">K7</option>
            <option value="Kent">Kent</option>
          </select>

          <select name="roastLevel" onChange={handleChange} className="input">
            <option value="">Roast Level</option>
            <option value="Light">Light</option>
            <option value="Medium">Medium</option>
            <option value="Dark">Dark</option>
          </select>

          <select name="processingMethod" onChange={handleChange} className="input">
            <option value="">Processing Method</option>
            <option value="Washed">Washed</option>
            <option value="Natural">Natural</option>
            <option value="Honey">Honey</option>
            <option value="Semi-washed">Semi-washed</option>
            <option value="Pulped Natural">Pulped Natural</option>
          </select>

          <input
            type="number"
            name="altitudeGrown"
            placeholder="Altitude Grown (1000–2500)"
            onChange={handleChange}
            className="input"
          />

          <input type="number" name="price" placeholder="Price (KSh)" onChange={handleChange} className="input" />

          <input type="number" name="quantity" placeholder="Quantity (kg)" onChange={handleChange} className="input" />

          <textarea
            name="description"
            placeholder="Description"
            rows="3"
            onChange={handleChange}
            className="input"
          />

          <input
            name="flavorNotes"
            placeholder="Flavor notes (comma separated e.g., 'Citrus, Chocolate')"
            onChange={handleChange}
            className="input"
          />

          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="input"
          />

          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16">
                  <img src={url} alt={`preview-${idx}`} className="w-16 h-16 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-5">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            {loading ? "Saving…" : "Add Product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
