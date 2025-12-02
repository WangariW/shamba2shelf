import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { useAuth } from "../../context/useAuth";
import farmerImage from "../../assets/images/green-beans.jpg";
import buyerImage from "../../assets/images/brewed-coffee-3.jpg";
import api from "../../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [role, setRole] = useState("buyer");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { 
        ...credentials, 
        role 
      });

      // After backend fix, tokens are at root level
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      }

      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate based on role
      if (role === "farmer") {
        navigate("/farmer/dashboard");
      } else if (role === "buyer") {
        navigate("/buyer/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout role={role} leftImage={role === "buyer" ? buyerImage : farmerImage}>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={handleChange}
              required
              style={{ flex: 1, padding: 8 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{ padding: "8px 12px" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="role"
              value="buyer"
              checked={role === "buyer"}
              onChange={() => setRole("buyer")}
            />{" "}
            Buyer
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="farmer"
              checked={role === "farmer"}
              onChange={() => setRole("farmer")}
            />{" "}
            Farmer
          </label>
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div>
          <button type="submit" disabled={loading} style={{ padding: "10px 16px" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}