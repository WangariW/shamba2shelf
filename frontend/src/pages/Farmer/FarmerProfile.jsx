import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FarmerLocationForm from "../../components/FarmerLocationForm";
import api from "../../api/axios";

export default function FarmerProfile() {
  const navigate = useNavigate();

  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("farmerLocation");
    return saved
      ? JSON.parse(saved)
      : { county: "", town: "", pickupPoint: "" };
  });

  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const farmerId = localStorage.getItem("userId"); 

  
  useEffect(() => {
    const loadFarmerProfile = async () => {
      try {
        const res = await api.get(`/farmers/${farmerId}`);
        const farmerData = res.data?.data?.farmer;
        
        if (farmerData) {
          setFarmer(farmerData);
          
          // Pre-fill location if exists
          if (farmerData.county || farmerData.nearestTown || farmerData.pickupPoint) {
            setLocation({
              county: farmerData.county || "",
              town: farmerData.nearestTown || "",
              pickupPoint: farmerData.pickupPoint || ""
            });
          }
        }
      } catch (error) {
        console.error("Failed to load farmer profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFarmerProfile();
  }, [farmerId]);

  useEffect(() => {
    localStorage.setItem("farmerLocation", JSON.stringify(location));
  }, [location]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put(`/farmers/${farmerId}/location`, location);
      console.log("Backend response:", res.data);


      alert("Farmer location saved successfully!");
      navigate("/farmer/dashboard");
      
    } catch (error) {
      console.error("Error saving farmer location:", error);
      alert(error.response?.data?.message || "Failed to save location");
    } finally {
      setLoading(false);
    }
  };
  if (!farmerId) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white dark:bg-[#1B1B1B] min-h-screen">
      <h1 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
        Farmer Profile
      </h1>
   
      {farmer && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {farmer.name} • {farmer.email}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-gray-50 dark:bg-[#252525] shadow p-5 rounded-lg">
          <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-100">
            Location
          </h2>
          <FarmerLocationForm value={location} onChange={setLocation} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-green-700 text-white px-4 py-2 rounded w-full ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-800"
          }`}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}