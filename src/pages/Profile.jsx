import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await axios.get(
          "https://placement-tracker-backend-sik5.onrender.com/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUser(res.data);
      } catch (error) {
        toast.error("Failed to fetch profile details");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "https://placement-tracker-backend-sik5.onrender.com/api/auth/change-password",
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(res.data.message || "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">My Account Profile</h2>

      {/* User Details Card */}
      <div className="card p-4 shadow-sm mb-4">
        <h5 className="card-title mb-3">User Details</h5>
        <div className="mb-2">
          <strong>Full Name: </strong> <span>{user.name}</span>
        </div>
        <div className="mb-2">
          <strong>Email Address: </strong> <span>{user.email}</span>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="card p-4 shadow-sm">
        <h5 className="card-title mb-3">Change Password</h5>
        <form onSubmit={handlePasswordChange}>
          <div className="mb-3">
            <label className="form-label font-weight-bold">
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label font-weight-bold">New Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-warning w-100 fw-bold">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
