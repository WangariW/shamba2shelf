/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios.jsx";

export default function EditProductModal({ isOpen, onClose, product, onProductUpdated }) {
  const [form, setForm] = useState({
    name: "",
    variety: "",
    roastLevel: "",
    processingMethod: "",
    altitudeGrown: "",
    price: "",
    quantity: "",
    status: "",
    description: "",
    flavorNotes: "",
    newImages: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product && isOpen) {
      setForm({
        name: product.name || "",
        variety: product.variety || "",
        roastLevel: product.roastLevel || "",
        processingMethod: product.processingMethod || "",
        altitudeGrown: product.altitudeGrown || "",
        price: product.price || "",
        quantity: product.quantity || "",
        status: product.status || "Available",
        description: product.description || "",
        flavorNotes: Array.isArray(product.flavorNotes)
          ? product.flavorNotes.join(", ")
          : "",
        newImages: [],
      });
      setExistingImages(product.images || []);
      setPreviewUrls([]);
      setError("");
      setLoading(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "newImages" && files) {
      const fileArray = Array.from(files);
      setForm((prev) => ({ ...prev, newImages: fileArray }));

      const urls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("variety", form.variety);
      data.append("roastLevel", form.roastLevel);
      data.append("processingMethod", form.processingMethod);
      data.append("altitudeGrown", form.altitudeGrown);
      data.append("price", form.price);
      data.append("quantity", form.quantity);
      data.append("status", form.status);
      data.append("description", form.description);

      if (form.flavorNotes.trim() !== "") {
        form.flavorNotes.split(",").forEach((note) => {
          const clean = note.trim();
          if (clean) data.append("flavorNotes", clean);
        });
      }

      if (form.newImages && form.newImages.length) {
        form.newImages.forEach((file) => data.append("images", file));
      }

      await api.put(`/products/${product._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated");
      onProductUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update product. Try again.");
      toast.error(err.response?.data?.message || "Update failed");
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
        <h2 className="text-xl font-semibold mb-4">Edit Product</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <div className="flex flex-col gap-3">
          <input
            name="name"
            value={form.name}
            placeholder="Product Name"
            onChange={handleChange}
            className="input"
          />

          <select
            name="variety"
            value={form.variety}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select Variety</option>
            <option value="SL28">SL28</option>
            <option value="SL34">SL34</option>
            <option value="Ruiru 11">Ruiru 11</option>
            <option value="Batian">Batian</option>
            <option value="Blue Mountain">Blue Mountain</option>
            <option value="K7">K7</option>
            <option value="Kent">Kent</option>
          </select>

          <select
            name="roastLevel"
            value={form.roastLevel}
            onChange={handleChange}
            className="input"
          >
            <option value="">Roast Level</option>
            <option value="Light">Light</option>
            <option value="Medium">Medium</option>
            <option value="Dark">Dark</option>
          </select>

          <select
            name="processingMethod"
            value={form.processingMethod}
            onChange={handleChange}
            className="input"
          >
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
            value={form.altitudeGrown}
            placeholder="Altitude Grown (1000–2500)"
            onChange={handleChange}
            className="input"
          />

          <input
            type="number"
            name="price"
            value={form.price}
            placeholder="Price (KSh)"
            onChange={handleChange}
            className="input"
          />

          <input
            type="number"
            name="quantity"
            value={form.quantity}
            placeholder="Quantity (kg)"
            onChange={handleChange}
            className="input"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
          >
            <option value="Available">Available</option>
            <option value="OutOfStock">Out Of Stock</option>
            <option value="Pending">Pending</option>
          </select>

          <textarea
            name="description"
            value={form.description}
            placeholder="Description"
            rows="3"
            onChange={handleChange}
            className="input"
          />

          <input
            name="flavorNotes"
            value={form.flavorNotes}
            placeholder="Flavor notes (comma separated)"
            onChange={handleChange}
            className="input"
          />

          {existingImages && existingImages.length > 0 && (
            <div className="mt-2">
              <p className="text-sm mb-1">Existing images:</p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`existing-${idx}`}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                ))}
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            name="newImages"
            multiple
            className="input"
            onChange={handleChange}
          />

          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {previewUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`new-${idx}`}
                  className="w-16 h-16 object-cover rounded-md"
                />
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Saving..." : "Update Product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
