import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://placement-tracker-backend-sik5.onrender.com/api/applications",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const currentApp = response.data.find((app) => app._id === id);
        if (currentApp) {
          setCompanyName(currentApp.companyName || "");
          setRole(currentApp.role || "");
          setStatus(currentApp.status || "Applied");
          setAppliedDate(
            currentApp.appliedDate
              ? new Date(currentApp.appliedDate).toISOString().split("T")[0]
              : "",
          );
          setInterviewDate(
            currentApp.interviewDate
              ? new Date(currentApp.interviewDate).toISOString().split("T")[0]
              : "",
          );
          setNotes(currentApp.notes || "");
        }
      } catch (error) {
        console.error("Error fetching application details:", error);
      }
    };

    fetchApplication();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://placement-tracker-backend-sik5.onrender.com/api/applications/${id}`,
        {
          companyName,
          role,
          status,
          appliedDate,
          interviewDate: interviewDate || undefined,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Application Updated Successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to update application");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4 text-center">Edit Job Application</h2>
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
            placeholder="Add interview round notes, preparation topics..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary w-100 fw-bold">
            Update Job
          </button>
          <button
            type="button"
            className="btn btn-secondary w-100 fw-bold"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditApplication;
