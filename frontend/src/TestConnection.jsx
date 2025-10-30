import React, { useEffect } from "react";
import api from "./api/axios";

const TestConnection = () => {
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await api.get("/health");
        console.log(" Backend Connected:", response.data);
      } catch (error) {
        console.error(" Backend connection failed:", error.message);
      }
    };

    checkConnection();
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2> Testing Backend Connection...</h2>
      <p>Open the browser console (Ctrl + Shift + J) to see the result.</p>
    </div>
  );
};

export default TestConnection;
