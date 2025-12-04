import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import FarmerDashboard from "./pages/Farmer/FarmerDashboard";
import Marketplace from "./pages/Buyer/Marketplace";
import BuyerDashboard from "./pages/Buyer/BuyerDashboard";
import TracePage from "./pages/TracePage";
import Traceability from "./pages/Traceability";
import Checkout from "./pages/Buyer/Checkout";
import ProductDetails from "./pages/Buyer/ProductDetails";
import OrderReview from "./pages/Buyer/OrderReview";
import OrderSuccess from "./pages/Buyer/OrderSuccess";
import Navbar from "./components/Navbar";
import FarmerProfile from "./pages/Farmer/FarmerProfile";
import RouteOptimization from "./pages/Buyer/RouteOptimization";
import ProtectedRoute from "./components/ProtectedRoutes";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#1f1b18] text-gray-800 dark:text-gray-100 transition-colors duration-500">
      <Navbar />
      <ThemeToggle />

      <main className="w-full px-6 md:px-12 lg:px-20 py-10 overflow-x-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/buyer/signup" element={<Signup />} />
          <Route path="/farmer/login" element={<Login />} />
          <Route path="/buyer/marketplace" element={<Marketplace />} />
          <Route path="/trace/:id" element={<TracePage />} />
          <Route path="/traceability" element={<Traceability />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Protected Farmer Routes */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/profile"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected Buyer Routes */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/checkout"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/order-review"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <OrderReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/order-success"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/route-optimization"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <RouteOptimization />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}