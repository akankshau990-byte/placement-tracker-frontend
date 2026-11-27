import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Comprehensive Tech & Role Keywords Dictionary for ATS Parsing
const TECH_KEYWORDS = [
  "react",
  "reactjs",
  "node",
  "nodejs",
  "express",
  "expressjs",
  "mongodb",
  "mongoose",
  "javascript",
  "typescript",
  "html",
  "css",
  "tailwind",
  "bootstrap",
  "redux",
  "next",
  "nextjs",
  "python",
  "java",
  "c++",
  "sql",
  "mysql",
  "postgresql",
  "firebase",
  "aws",
  "docker",
  "git",
  "github",
  "rest",
  "api",
  "graphql",
  "jwt",
  "authentication",
  "dsa",
  "data structures",
  "algorithms",
  "oop",
  "system design",
  "agile",
  "ci/cd",
  "vercel",
  "render",
  "linux",
  "testing",
  "jest",
  "full stack",
  "frontend",
  "backend",
  "software engineer",
  "intern",
  "developer",
  "ui/ux",
  "responsive",
  "problem solving",
];

const ResumeMatcher = ({
  initialJobTitle = "",
  initialJobDesc = "",
  onClose,
}) => {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState(null);

  // Load saved resume from localStorage on mount
  useEffect(() => {
    const savedResume = localStorage.getItem("user_saved_resume");
    if (savedResume) {
      setResumeText(savedResume);
    }
    if (initialJobTitle || initialJobDesc) {
      setJobText(`${initialJobTitle}\n${initialJobDesc}`.trim());
    }
  }, [initialJobTitle, initialJobDesc]);

  const handleSaveResume = () => {
    if (!resumeText.trim()) {
      toast.warning("Pehle apna resume text paste karein.");
      return;
    }
    localStorage.setItem("user_saved_resume", resumeText);
    toast.success("Resume saved locally for instant future scans!");
  };

  const analyzeMatch = () => {
    if (!resumeText.trim() || !jobText.trim()) {
      toast.error("Resume text aur Job Role/Description dono required hain!");
      return;
    }

    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobText.toLowerCase();

    // Extract relevant tech/domain keywords present in the Job Description/Title
    let targetKeywords = TECH_KEYWORDS.filter((kw) => {
      const regex = new RegExp(
        `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i",
      );
      return regex.test(jobLower);
    });

    // Fallback: agar job description bahut chhota hai (sirf role title), toh role-based core skills add karein
    if (targetKeywords.length < 3) {
      if (jobLower.includes("react") || jobLower.includes("frontend")) {
        targetKeywords = [
          ...new Set([
            ...targetKeywords,
            "react",
            "javascript",
            "html",
            "css",
            "git",
            "api",
          ]),
        ];
      } else if (jobLower.includes("node") || jobLower.includes("backend")) {
        targetKeywords = [
          ...new Set([
            ...targetKeywords,
            "nodejs",
            "express",
            "mongodb",
            "sql",
            "rest",
            "api",
            "git",
          ]),
        ];
      } else if (jobLower.includes("full stack") || jobLower.includes("mern")) {
        targetKeywords = [
          ...new Set([
            ...targetKeywords,
            "react",
            "nodejs",
            "express",
            "mongodb",
            "javascript",
            "git",
            "api",
          ]),
        ];
      } else {
        targetKeywords = [
          ...new Set([
            ...targetKeywords,
            "javascript",
            "git",
            "dsa",
            "problem solving",
            "api",
          ]),
        ];
      }
    }

    const matched = [];
    const missing = [];

    targetKeywords.forEach((kw) => {
      const regex = new RegExp(
        `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i",
      );
      if (regex.test(resumeLower)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const score =
      targetKeywords.length > 0
        ? Math.round((matched.length / targetKeywords.length) * 100)
        : 0;

    setResult({ score, matched, missing });
  };

  return (
    <div className="card border-primary shadow mb-4">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">🎯 ATS Resume & Job Keyword Matcher</h6>
        {onClose && (
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={onClose}
          ></button>
        )}
      </div>

      <div className="card-body">
        <div className="row g-3">
          {/* Left: User Resume */}
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold mb-0">
                1. Your Resume Text (Skills, Projects, Experience)
              </label>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleSaveResume}
              >
                💾 Save Resume
              </button>
            </div>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Paste your resume content here (e.g., Built MERN stack apps using React, Node.js, Express, MongoDB, JWT, REST APIs...)"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          {/* Right: Job Description / Role */}
          <div className="col-md-6">
            <label className="form-label fw-semibold mb-1">
              2. Target Job Role & Description
            </label>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Paste the job description or role requirements here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 text-end">
          <button
            type="button"
            className="btn btn-primary fw-bold px-4"
            onClick={analyzeMatch}
          >
            Analyze ATS Match Score
          </button>
        </div>

        {/* Result Section */}
        {result && (
          <div className="mt-4 p-3 bg-light rounded border">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="mb-0 fw-bold">
                ATS Compatibility Score:{" "}
                <span
                  className={
                    result.score >= 75
                      ? "text-success"
                      : result.score >= 45
                        ? "text-warning"
                        : "text-danger"
                  }
                >
                  {result.score}%
                </span>
              </h5>
              <span className="badge bg-dark">
                {result.matched.length} /{" "}
                {result.matched.length + result.missing.length} Keywords Matched
              </span>
            </div>

            <div className="progress mb-3" style={{ height: "12px" }}>
              <div
                className={`progress-bar ${
                  result.score >= 75
                    ? "bg-success"
                    : result.score >= 45
                      ? "bg-warning"
                      : "bg-danger"
                }`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-2">
                <p className="fw-semibold text-success mb-1">
                  ✅ Matched Skills:
                </p>
                <div className="d-flex flex-wrap gap-1">
                  {result.matched.length > 0 ? (
                    result.matched.map((kw) => (
                      <span key={kw} className="badge bg-success">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted small">
                      No direct keyword matches yet.
                    </span>
                  )}
                </div>
              </div>

              <div className="col-md-6 mb-2">
                <p className="fw-semibold text-danger mb-1">
                  ⚠️ Missing Keywords (Add to Resume):
                </p>
                <div className="d-flex flex-wrap gap-1">
                  {result.missing.length > 0 ? (
                    result.missing.map((kw) => (
                      <span key={kw} className="badge bg-danger">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-success small fw-semibold">
                      All detected keywords matched!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeMatcher;
