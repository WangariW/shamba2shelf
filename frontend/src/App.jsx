import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import FarmerDashboard from "./pages/Farmer/FarmerDashboard";
import Marketplace from "./pages/Buyer/Marketplace";
import BuyerDashboard from "./pages/Buyer/BuyerDashboard";
import Traceability from "./pages/Traceability";
import Checkout from "./pages/Buyer/Checkout";
import ProductDetails from "./pages/Buyer/ProductDetails";
import OrderReview from "./pages/Buyer/OrderReview";
import OrderSuccess from "./pages/Buyer/OrderSuccess";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./api/axios";

export default function App(){
  return(
    
    <div className="min-h-screen bg-amber-50 text-gray-800">
      <Navbar/>


      {/* Page Content*/ }
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/buyer/signup" element={<Signup />} />
          <Route path="/farmer/login" element={<Login />} />
          <Route path="/farmer/dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/buyer/dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/buyer/marketplace" element={<Marketplace />} />
          <Route path="/traceability" element={<Traceability/>} /> 
          <Route path="/buyer/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>} /> 
          <Route path="/product/:id" element={<ProductDetails />} /> 
          <Route path="/buyer/order-review" element={<ProtectedRoute><OrderReview /></ProtectedRoute>}/>
          <Route path="/buyer/order-success" element={<OrderSuccess />} />
        </Routes>
      </main>
    </div>
  );
}




 