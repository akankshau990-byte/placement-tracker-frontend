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

function Dashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchApplications(token);
    }
  }, []);

  const fetchApplications = async (token) => {
    try {
      const response = await axios.get(
        "https://placement-tracker-backend-sik5.onrender.com/api/applications",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setApplications(response.data);
    } catch (error) {
      console.log("Error fetching applications:", error);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await axios.delete(
          `https://placement-tracker-backend-sik5.onrender.com/api/applications/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setApplications(applications.filter((app) => app._id !== id));
        toast.warning("Application Deleted!");
      } catch (error) {
        console.log("Error deleting application:", error);
        toast.error("Failed to delete application.");
      }
    }
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
      .toLowerCase()
      .includes(search.toLowerCase());
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
      return a.companyName.localeCompare(b.companyName);
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
      <h2 className="text-center mb-4">My Job Applications</h2>

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

      {/* Analytics Chart (Fixed Node error with width 99% and minHeight) */}
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

      {/* Table Section */}
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
            {sortedApplications.map((app) => (
              <tr key={app._id}>
                <td className="align-middle fw-bold">{app.companyName}</td>
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
                    ? new Date(app.interviewDate).toLocaleDateString("en-GB")
                    : "N/A"}
                </td>
                {/* Notes Display Logic Fix */}
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
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => navigate(`/edit-application/${app._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(app._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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
    </div>
  );
}

export default Dashboard;
