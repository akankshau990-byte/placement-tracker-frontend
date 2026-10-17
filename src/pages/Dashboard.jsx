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
        toast.warning("Application Deleted! ");
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

  const COLORS = ["#6c757d", "#0dcaf0", "#198754", "#dc3545"];

  const filteredApplications = applications.filter((app) => {
    const matchSearch = app.companyName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter = filter === "All" || app.status === filter;
    return matchSearch && matchFilter;
  });

  // Headers for CSV Export
  const csvHeaders = [
    { label: "Company Name", key: "companyName" },
    { label: "Role", key: "role" },
    { label: "Status", key: "status" },
    { label: "Applied Date", key: "appliedDate" },
  ];

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">My Job Applications </h2>

      {/* Stat Cards Section */}
      <div className="row mb-4 text-center">
        <div className="col-md-3 mb-2">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Applications</h6>
              <h2 className="card-text fw-bold">{totalApps}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-dark bg-info shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Interviewing</h6>
              <h2 className="card-text fw-bold">{interviewingApps}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Selected</h6>
              <h2 className="card-text fw-bold">{selectedApps}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-white bg-danger shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Rejected</h6>
              <h2 className="card-text fw-bold">{rejectedApps}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart Section */}
      {totalApps > 0 && (
        <div className="card p-3 mb-4 shadow-sm">
          <h5 className="text-center mb-3">Application Status Overview</h5>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
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

      {/* Controls Section (Search, Filter, Export CSV, Add New) */}
      <div className="row mb-4 align-items-center">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search company name..."
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
        <div className="col-md-3 mb-2">
          {filteredApplications.length > 0 ? (
            <CSVLink
              data={filteredApplications}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
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
                            : "bg-secondary"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="align-middle">
                  {app.appliedDate
                    ? new Date(app.appliedDate).toLocaleDateString()
                    : "N/A"}
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
            {filteredApplications.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-3">
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
