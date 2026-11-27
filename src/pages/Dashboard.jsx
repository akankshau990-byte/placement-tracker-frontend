import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CSVLink } from "react-csv";
import KanbanBoard from "../components/KanbanBoard";
import JobFinder from "../components/JobFinder";

function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table");

  const backendUrl = "https://placement-tracker-backend-sik5.onrender.com";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchApplications(token);
    }
  }, []);

  const fetchApplications = async (authToken) => {
    try {
      const response = await axios.get(`${backendUrl}/api/applications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setApplications(response.data);
    } catch (error) {
      console.log("Error fetching applications:", error);
    }
  };

  const handleJobAdded = (newApp) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await axios.delete(`${backendUrl}/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(applications.filter((app) => app._id !== id));
        toast.warning("Application Deleted!");
      } catch (error) {
        console.log("Error deleting application:", error);
        toast.error("Failed to delete application.");
      }
    }
  };

  // --- SMART REMINDERS & FOLLOW-UP LOGIC ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Agle 7 dinon ke upcoming interviews filter karein
  const upcomingInterviews = applications
    .filter((app) => {
      if (
        !app.interviewDate ||
        app.status === "Rejected" ||
        app.status === "Selected"
      ) {
        return false;
      }
      const intDate = new Date(app.interviewDate);
      intDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((intDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .map((app) => {
      const intDate = new Date(app.interviewDate);
      intDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((intDate - today) / (1000 * 60 * 60 * 24));
      return { ...app, daysLeft: diffDays };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // 2. Check karein ki kisi Applied job ko 7+ din ho gaye hain kya
  const isFollowUpDue = (app) => {
    if (app.status !== "Applied" || !app.appliedDate) return false;
    const appDate = new Date(app.appliedDate);
    appDate.setHours(0, 0, 0, 0);
    const daysSinceApplied = Math.floor(
      (today - appDate) / (1000 * 60 * 60 * 24),
    );
    return daysSinceApplied >= 7;
  };

  // 3. One-click Follow-up Email Template Copy
  const handleCopyFollowUp = (app) => {
    const emailTemplate = `Subject: Follow-up on ${app.role} Application - ${app.companyName}\n\nHi Hiring Team,\n\nI hope you're doing well. I recently applied for the ${app.role} position at ${app.companyName} and wanted to kindly follow up on the status of my application. I am very enthusiastic about the opportunity to contribute to your team.\n\nThank you for your time and consideration.\n\nBest regards,\nAkanksha Kumari`;
    navigator.clipboard.writeText(emailTemplate);
    toast.success(`Follow-up email copied for ${app.companyName}!`);
  };

  const totalApps = applications.length;
  const appliedApps = applications.filter(
    (app) => app.status === "Applied",
  ).length;
  const interviewingApps = applications.filter(
    (app) => app.status === "Interviewing",
  ).length;
  const selectedApps = applications.filter(
    (app) => app.status === "Selected",
  ).length;
  const rejectedApps = applications.filter(
    (app) => app.status === "Rejected",
  ).length;

  const chartData = [
    { name: "Applied", value: appliedApps },
    { name: "Interviewing", value: interviewingApps },
    { name: "Selected", value: selectedApps },
    { name: "Rejected", value: rejectedApps },
  ];

  const COLORS = ["#0d6efd", "#0dcaf0", "#198754", "#dc3545"];

  const filteredApplications = applications.filter((app) => {
    const matchSearch = app.companyName
      ? app.companyName.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchFilter = filter === "All" || app.status === filter;
    return matchSearch && matchFilter;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.createdAt || b.appliedDate) -
        new Date(a.createdAt || a.appliedDate)
      );
    } else if (sortBy === "oldest") {
      return (
        new Date(a.createdAt || a.appliedDate) -
        new Date(b.createdAt || b.appliedDate)
      );
    } else if (sortBy === "company") {
      return (a.companyName || "").localeCompare(b.companyName || "");
    }
    return 0;
  });

  const csvHeaders = [
    { label: "Company Name", key: "companyName" },
    { label: "Role", key: "role" },
    { label: "Status", key: "status" },
    { label: "Applied Date", key: "appliedDate" },
    { label: "Interview Date", key: "interviewDate" },
    { label: "Notes", key: "notes" },
  ];

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Job Applications</h2>

        {/* View Toggle Switch (Table vs Kanban) */}
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setViewMode("table")}
          >
            📋 Table View
          </button>
          <button
            type="button"
            className={`btn ${viewMode === "kanban" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setViewMode("kanban")}
          >
            📊 Kanban Board
          </button>
        </div>
      </div>

      {/* Upcoming Interview Reminder Banner */}
      {upcomingInterviews.length > 0 && (
        <div className="alert alert-warning border-start border-4 border-warning shadow-sm mb-4">
          <h6 className="fw-bold mb-2">⏰ Upcoming Interviews (Next 7 Days)</h6>
          <div className="d-flex flex-wrap gap-2">
            {upcomingInterviews.map((item) => (
              <span
                key={item._id}
                className="badge bg-dark text-white p-2 fs-6 fw-normal"
              >
                <strong>{item.companyName}</strong> ({item.role}) —{" "}
                <span className="text-warning fw-bold">
                  {item.daysLeft === 0
                    ? "Today!"
                    : item.daysLeft === 1
                      ? "Tomorrow"
                      : `In ${item.daysLeft} days`}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Domain Job Search & Two-Step Apply Section */}
      <JobFinder
        onJobAdded={handleJobAdded}
        backendUrl={backendUrl}
        token={token}
      />

      {/* Stat Cards Section */}
      <div className="row mb-4 text-center">
        <div className="col mb-2">
          <div
            className={`card text-white bg-dark shadow-sm ${
              filter === "All" ? "border border-4 border-warning" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setFilter("All")}
          >
            <div className="card-body p-2">
              <h6 className="card-title mb-1">Total</h6>
              <h3 className="card-text fw-bold mb-0">{totalApps}</h3>
            </div>
          </div>
        </div>
        <div className="col mb-2">
          <div
            className={`card text-white bg-primary shadow-sm ${
              filter === "Applied" ? "border border-4 border-dark" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setFilter("Applied")}
          >
            <div className="card-body p-2">
              <h6 className="card-title mb-1">Applied</h6>
              <h3 className="card-text fw-bold mb-0">{appliedApps}</h3>
            </div>
          </div>
        </div>
        <div className="col mb-2">
          <div
            className={`card text-dark bg-info shadow-sm ${
              filter === "Interviewing" ? "border border-4 border-dark" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setFilter("Interviewing")}
          >
            <div className="card-body p-2">
              <h6 className="card-title mb-1">Interviewing</h6>
              <h3 className="card-text fw-bold mb-0">{interviewingApps}</h3>
            </div>
          </div>
        </div>
        <div className="col mb-2">
          <div
            className={`card text-white bg-success shadow-sm ${
              filter === "Selected" ? "border border-4 border-dark" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setFilter("Selected")}
          >
            <div className="card-body p-2">
              <h6 className="card-title mb-1">Selected</h6>
              <h3 className="card-text fw-bold mb-0">{selectedApps}</h3>
            </div>
          </div>
        </div>
        <div className="col mb-2">
          <div
            className={`card text-white bg-danger shadow-sm ${
              filter === "Rejected" ? "border border-4 border-dark" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setFilter("Rejected")}
          >
            <div className="card-body p-2">
              <h6 className="card-title mb-1">Rejected</h6>
              <h3 className="card-text fw-bold mb-0">{rejectedApps}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      {totalApps > 0 && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5 className="text-center mb-3">Application Status Overview</h5>
          <div style={{ width: "100%", height: 280, minHeight: 280 }}>
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>
        <div className="col-md-2 mb-2">
          {sortedApplications.length > 0 ? (
            <CSVLink
              data={sortedApplications}
              headers={csvHeaders}
              filename={"placement_applications.csv"}
              className="btn btn-outline-dark w-100 fw-bold"
            >
              📥 Export CSV
            </CSVLink>
          ) : (
            <button
              className="btn btn-outline-secondary w-100 fw-bold"
              disabled
            >
              📥 Export CSV
            </button>
          )}
        </div>
        <div className="col-md-2 mb-2">
          <button
            className="btn btn-success w-100 fw-bold"
            onClick={() => navigate("/add-application")}
          >
            + Add New
          </button>
        </div>
      </div>

      {/* Conditional Rendering: Table View OR Kanban View */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          applications={sortedApplications}
          setApplications={setApplications}
          backendUrl={backendUrl}
          token={token}
        />
      ) : (
        <div className="table-responsive shadow-sm">
          <table className="table table-hover table-bordered table-striped mb-0">
            <thead className="table-dark">
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Interview Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplications.map((app) => {
                const needsFollowUp = isFollowUpDue(app);
                return (
                  <tr key={app._id}>
                    <td className="align-middle fw-bold">
                      {app.companyName}
                      {needsFollowUp && (
                        <span className="badge bg-warning text-dark ms-2">
                          Follow-up Due
                        </span>
                      )}
                    </td>
                    <td className="align-middle">{app.role}</td>
                    <td className="align-middle">
                      <span
                        className={`badge ${
                          app.status === "Selected"
                            ? "bg-success"
                            : app.status === "Rejected"
                              ? "bg-danger"
                              : app.status === "Interviewing"
                                ? "bg-info text-dark"
                                : app.status === "Applied"
                                  ? "bg-primary"
                                  : "bg-secondary"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="align-middle">
                      {app.appliedDate
                        ? new Date(app.appliedDate).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>
                    <td className="align-middle">
                      {app.interviewDate
                        ? new Date(app.interviewDate).toLocaleDateString(
                            "en-GB",
                          )
                        : "N/A"}
                    </td>
                    <td className="align-middle">
                      {app.notes && String(app.notes).trim().length > 0 ? (
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: "150px" }}
                          title={app.notes}
                        >
                          {app.notes}
                        </span>
                      ) : (
                        <span className="text-muted small">No notes</span>
                      )}
                    </td>
                    <td className="align-middle">
                      <div className="d-flex flex-wrap gap-1">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            navigate(`/edit-application/${app._id}`)
                          }
                        >
                          Edit
                        </button>
                        {needsFollowUp && (
                          <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => handleCopyFollowUp(app)}
                            title="Copy Follow-up Email"
                          >
                            ✉️ Follow-up
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(app._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedApplications.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
