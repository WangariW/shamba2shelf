import { useState } from "react";
import api from "../../api/axios";

export default function RouteOptimization() {
  const [buyerLat, setBuyerLat] = useState("");
  const [buyerLng, setBuyerLng] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);

    try {
      const response = await api.post("/route/optimize", {
        buyerLat: parseFloat(buyerLat),
        buyerLng: parseFloat(buyerLng),
      });

      setResult(response.data);
    } catch (err) {
      alert("Route optimization failed.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Route Optimization</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Buyer Latitude:</label>
        <input
          type="number"
          value={buyerLat}
          onChange={e => setBuyerLat(e.target.value)}
        />

        <label style={{ marginLeft: "20px" }}>Buyer Longitude:</label>
        <input
          type="number"
          value={buyerLng}
          onChange={e => setBuyerLng(e.target.value)}
        />

        <button onClick={handleOptimize} disabled={loading}>
          {loading ? "Processing..." : "Optimize Route"}
        </button>
      </div>

      {result && (
        <pre
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
