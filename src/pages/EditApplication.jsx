import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditApplication() {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchSingleApplication = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://placement-tracker-backend-sik5.onrender.com/api/applications",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const appToEdit = response.data.find((app) => app._id === id);
        if (appToEdit) {
          setCompanyName(appToEdit.companyName);
          setRole(appToEdit.role);
          setStatus(appToEdit.status);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchSingleApplication();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://placement-tracker-backend-sik5.onrender.com/api/applications/${id}`,
        { companyName, role, status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Application Updated! ✅");
      navigate("/dashboard");
    } catch (error) {
      console.log("Update Error:", error);
      alert("Failed to update.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Edit Application ✏️</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <br />
        <div>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
        <br />
        <div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <br />
        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#ffb84d",
            border: "none",
            cursor: "pointer",
          }}
        >
          Update Job
        </button>
        <br />
        <br />
        <button type="button" onClick={() => navigate("/dashboard")}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditApplication;
