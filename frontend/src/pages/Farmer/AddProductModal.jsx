import React, { useState } from "react";

const AddProductModal = ({ onClose, onAddProduct }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct({ name, price, preview });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-[#1B1B1B] text-gray-900 dark:text-gray-100 w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-center text-[#3B1F0E] dark:text-amber-400">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm mb-1">Price (KES)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-400 outline-none"
              required
            />
          </div>

          {/* Upload */}
          <div>
            <label className="block text-sm mb-1">Upload Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 
                         file:rounded-full file:border-0 file:text-sm file:font-semibold 
                         file:bg-amber-500 file:text-white hover:file:bg-amber-600 cursor-pointer"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4 flex justify-center">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:opacity-80"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
