/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

export default function DeleteProductModal({ isOpen, onClose, onConfirm, product }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-[#252525] p-6 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-red-600">
          Delete Product
        </h2>

        <p className="mb-6">
          Are you sure you want to delete <strong>{product?.name}</strong>?<br />
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
