import { useState, useEffect } from "react";
import FarmerLocationForm from "../../components/FarmerLocationForm";
import api from "../../api/axios";
export default function FarmerProfile() {

  
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("farmerLocation");
    return saved
      ? JSON.parse(saved)
      : { county: "", town: "", pickupPoint: "" };
  });

  const farmerId = "690a1ef06538883429160a19"; 

  
  useEffect(() => {
    localStorage.setItem("farmerLocation", JSON.stringify(location));
  }, [location]);

    const handleSave = async (e) => {
      e.preventDefault();

      try {
        const res = await api.put(
          `/farmers/${farmerId}/location`,
          location
        );

        console.log("Backend response:", res.data);
        alert("Farmer location saved successfully!");
      } catch (error) {
        console.error("Error saving farmer location:", error);
        alert("Failed to save location");
      }
    };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Farmer Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white shadow p-5 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Location</h2>
          <FarmerLocationForm value={location} onChange={setLocation} />
        </div>

        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded w-full"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
