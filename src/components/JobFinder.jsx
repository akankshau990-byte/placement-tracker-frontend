import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ResumeMatcher from "./ResumeMatcher";

const JobFinder = ({ onJobAdded, backendUrl, token }) => {
  const [domain, setDomain] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openedIds, setOpenedIds] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [selectedJobForATS, setSelectedJobForATS] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/jobs/search?domain=${encodeURIComponent(domain.trim())}`,
      );
      setJobs(res.data);
      if (res.data.length === 0) {
        toast.info(
          "Is domain ke liye koi job nahi mili. Koi aur keyword try karein.",
        );
      }
    } catch (err) {
      console.error("Job search error:", err);
      toast.error("Jobs fetch karne mein error aaya.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplyLink = (job) => {
    window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    if (!openedIds.includes(job.externalId)) {
      setOpenedIds((prev) => [...prev, job.externalId]);
    }
    toast.info("Form submit karne ke baad yahan 'Mark as Applied' dabayein.");
  };

  const handleConfirmApplied = async (job) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/applications`,
        {
          companyName: job.company,
          role: job.role,
          status: "Applied",
          appliedDate: new Date().toISOString().split("T")[0],
          notes: `Location: ${job.location} | Link: ${job.applyUrl}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setAppliedIds((prev) => [...prev, job.externalId]);
      toast.success(`${job.company} marked as Applied!`);

      const createdApp = res.data.application || res.data;
      if (onJobAdded && createdApp) {
        onJobAdded(createdApp);
      }
    } catch (err) {
      console.error("Error saving application:", err);
      toast.error("Application save karne mein error aaya.");
    }
  };

  return (
    <div className="card shadow-sm p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Find & Apply Jobs by Domain</h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-dark fw-semibold"
          onClick={() =>
            setSelectedJobForATS(
              selectedJobForATS ? null : { role: "", description: "" },
            )
          }
        >
          {selectedJobForATS
            ? "Close ATS Matcher"
            : "🎯 Open ATS Resume Matcher"}
        </button>
      </div>

      {/* ATS Matcher Panel */}
      {selectedJobForATS && (
        <ResumeMatcher
          initialJobTitle={selectedJobForATS.role}
          initialJobDesc={selectedJobForATS.description || ""}
          onClose={() => setSelectedJobForATS(null)}
        />
      )}

      <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter domain (e.g. React, Full Stack, Node.js, Frontend)..."
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary px-4"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="row g-3">
        {jobs.map((job) => {
          const isApplied = appliedIds.includes(job.externalId);
          const isOpened = openedIds.includes(job.externalId);

          return (
            <div key={job.externalId} className="col-md-6 col-lg-4">
              <div className="card h-100 p-3 border">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0">{job.role}</h6>
                  <span className="badge bg-light text-dark border">
                    {job.jobType}
                  </span>
                </div>
                <p className="text-primary fw-semibold mb-1">{job.company}</p>
                <small className="text-muted mb-3">{job.location}</small>

                <div className="mt-auto d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() =>
                      setSelectedJobForATS({
                        role: `${job.role} at ${job.company}`,
                        description:
                          job.description ||
                          `${job.role} ${job.jobType} ${job.location}`,
                      })
                    }
                  >
                    🎯 Check Resume Match
                  </button>

                  <div className="d-flex gap-2">
                    {!isApplied && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary flex-grow-1"
                        onClick={() => handleOpenApplyLink(job)}
                      >
                        {isOpened ? "Open Link Again ↗" : "Apply Now ↗"}
                      </button>
                    )}

                    {isOpened && !isApplied && (
                      <button
                        type="button"
                        className="btn btn-sm btn-warning fw-semibold flex-grow-1"
                        onClick={() => handleConfirmApplied(job)}
                      >
                        Mark as Applied ✓
                      </button>
                    )}

                    {isApplied && (
                      <button
                        type="button"
                        className="btn btn-sm btn-success w-100"
                        disabled
                      >
                        Applied ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobFinder;
