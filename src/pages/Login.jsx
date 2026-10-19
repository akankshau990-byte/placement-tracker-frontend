import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://placement-tracker-backend-sik5.onrender.com/api/auth/login",
        {
          email: email,
          password: password,
        },
      );
      localStorage.setItem("token", response.data.token);
      console.log("Success! Backend ka Data:", response.data);
      toast.success("Login Successful! ");
      navigate("/dashboard");
    } catch (error) {
      console.log("Login Error:", error.response?.data);
      toast.error(
        "Login Failed: " +
          (error.response?.data?.message || "Something went wrong"),
      );
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: "400px" }}>
        <div className="card-body p-4">
          <h2 className="text-center mb-4 text-primary">Login 🔐</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold mb-3"
            >
              Login to Dashboard
            </button>

            <div className="text-center">
              <span className="text-muted">Don't have an account? </span>
              <span
                className="text-primary"
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/register")}
              >
                Register here
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
