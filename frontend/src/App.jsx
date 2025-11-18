import { Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#1f1b18] text-gray-800 dark:text-gray-100 transition-colors duration-500">
      <Navbar />

      {/* Full-width page content */}
      <main className="w-full px-6 md:px-12 lg:px-20 py-10 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/buyer/signup" element={<Signup />} />
          <Route path="/farmer/login" element={<Login />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/marketplace" element={<Marketplace />} />
          <Route path="/trace/:id" element={<TracePage />} />
          <Route path="/farmer/profile" element={<FarmerProfile />} />
          <Route path="/traceability" element={<Traceability />} />
          <Route path="/buyer/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/buyer/order-review" element={<OrderReview />} />
          <Route path="/buyer/order-success" element={<OrderSuccess />} />
        </Routes>
      </main>
    </div>
  );
}
