import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AddApplication() {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "https://placement-tracker-backend-sik5.onrender.com/api/applications",
        {
          companyName: companyName,
          role: role,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Job Application Added Successfully!");

      navigate("/dashboard");
    } catch (error) {
      console.log("Error:", error);
      toast.error("Failed to add application");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-4">Add New Application </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Company Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Google, TCS"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Role</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Frontend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Current Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-bold">
              Save Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddApplication;
