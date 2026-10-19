import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AddApplication() {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [notes, setNotes] = useState(""); // Naya state

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://placement-tracker-backend-sik5.onrender.com/api/applications",
        {
          companyName,
          role,
          status,
          appliedDate: appliedDate || undefined,
          interviewDate: interviewDate || undefined,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Application Added Successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to add application");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4 text-center">Add Job Application</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label font-weight-bold">Company Name</label>
          <input
            type="text"
            className="form-control"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label font-weight-bold">Role</label>
          <input
            type="text"
            className="form-control"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label font-weight-bold">Status</label>
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
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label font-weight-bold">Applied Date</label>
            <input
              type="date"
              className="form-control"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label font-weight-bold">
              Interview Date
            </label>
            <input
              type="date"
              className="form-control"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label font-weight-bold">
            Preparation / Interview Notes
          </label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="E.g., Round 1 cleared, focus on DSA Graphs and System Design..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100 fw-bold">
          Submit Application
        </button>
      </form>
    </div>
  );
}

export default AddApplication;
