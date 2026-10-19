import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

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

  const handleAvatarUpdate = async (e) => {
    e.preventDefault();
    if (!avatarUrl.trim()) return;

    const newUrl = avatarUrl;
    setAvatarUrl(""); // Clears the input field IMMEDIATELY on click

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "https://placement-tracker-backend-sik5.onrender.com/api/auth/update-avatar",
        { avatar: newUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(res.data.message || "Profile picture updated!");
      setUser((prev) => ({ ...prev, avatar: newUrl }));
    } catch (error) {
      toast.error("Failed to update profile picture");
      fetchProfile();
    }
  };

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
    <div className="container mt-5" style={{ maxWidth: "650px" }}>
      <h2 className="text-center mb-4">My Account Profile</h2>

      {/* User Details & Photo Card */}
      <div className="card p-4 shadow-sm mb-4 text-center">
        <div className="mb-3">
          <img
            src={
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="Profile Avatar"
            className="rounded-circle img-thumbnail shadow-sm"
            style={{ width: "130px", height: "130px", objectFit: "cover" }}
          />
        </div>

        <h4 className="fw-bold mb-1">{user.name || "N/A"}</h4>
        <p className="text-muted mb-3">{user.email || "N/A"}</p>

        {/* Update Avatar Form */}
        <form onSubmit={handleAvatarUpdate} className="mt-2">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Paste Image URL or Avatar Link..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              📸 Change Photo
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="card p-4 shadow-sm">
        <h5 className="card-title mb-3">Change Password</h5>
        <form onSubmit={handlePasswordChange}>
          {/* Hidden Accessibility Field */}
          <input
            type="text"
            name="username"
            value={user.email || ""}
            readOnly
            hidden
            autoComplete="username"
          />

          <div className="mb-3">
            <label className="form-label font-weight-bold">
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              required
              autoComplete="current-password"
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
              autoComplete="new-password"
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
