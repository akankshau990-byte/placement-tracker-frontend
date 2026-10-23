import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://placement-tracker-backend-sik5.onrender.com/api/auth/forgot-password",
        { email },
      );
      toast.success(res.data.message || "OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send OTP. Check your email!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://placement-tracker-backend-sik5.onrender.com/api/auth/reset-password",
        { email, otp, newPassword },
      );
      toast.success(res.data.message || "Password reset successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or Expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <div className="card p-4 shadow-sm">
        <h3 className="text-center mb-3">Forgot Password</h3>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-3">
              <label className="form-label font-weight-bold">
                Registered Email Address
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label font-weight-bold">6-Digit OTP</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label font-weight-bold">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-success w-100 fw-bold"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
