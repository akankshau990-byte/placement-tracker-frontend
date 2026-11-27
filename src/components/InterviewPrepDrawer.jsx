import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Curated Most-Asked DSA & Technical Questions by Company & Role
const COMPANY_QUESTION_BANK = {
  tcs: [
    "1. Reverse a String / Check Palindrome without built-in methods",
    "2. Find Second Largest Element & Remove Duplicates in an Array",
    "3. Fibonacci Series, Prime Number & Armstrong Number Logic",
    "4. OOPs Concepts: Polymorphism, Inheritance, Encapsulation with real examples",
    "5. SQL Joins (Inner, Left, Right) & Second Highest Salary Query",
    "6. DBMS Normalization (1NF, 2NF, 3NF) & ACID Properties",
  ],
  infosys: [
    "1. Two Sum & Subarray with Given Sum",
    "2. Valid Parentheses using Stack",
    "3. Binary Search & Merge Sort Time Complexity",
    "4. Difference between Process and Thread (OS)",
    "5. Primary Key vs Foreign Key vs Unique Key in SQL",
  ],
  wipro: [
    "1. Count Frequency of Characters in a String",
    "2. Detect Loop in a Linked List (Floyd's Cycle Detection)",
    "3. Deadlock Conditions & Prevention in Operating Systems",
    "4. TCP vs UDP & HTTP vs HTTPS",
  ],
  accenture: [
    "1. Anagram Check & Longest Common Prefix",
    "2. Missing Number in Array (1 to N)",
    "3. Abstract Class vs Interface",
    "4. SDLC Models (Agile vs Waterfall)",
  ],
  amazon: [
    "1. LRU Cache Implementation (HashMap + Doubly Linked List)",
    "2. Number of Islands (BFS / DFS Graph Traversal)",
    "3. Merge Intervals & Trapping Rain Water",
    "4. Lowest Common Ancestor in a Binary Tree",
    "5. Amazon Leadership Principles (Customer Obsession, Ownership)",
  ],
  google: [
    "1. Word Ladder / Shortest Path in Unweighted Graph",
    "2. Dynamic Programming: Longest Increasing Subsequence",
    "3. Merge K Sorted Lists using Min-Heap",
    "4. System Design: URL Shortener / Rate Limiter",
  ],
  microsoft: [
    "1. Reverse Nodes in k-Group (Linked List)",
    "2. Validate Binary Search Tree (BST)",
    "3. Topological Sort (Course Schedule)",
    "4. Copy List with Random Pointer",
  ],
  default: [
    "1. Two Sum, Kadane's Maximum Subarray & Sliding Window Basics",
    "2. Reverse a Linked List & Merge Two Sorted Lists",
    "3. React Virtual DOM, useEffect Lifecycle & State Management",
    "4. Node.js Event Loop, Promises vs Async/Await & REST API Status Codes",
    "5. MongoDB Indexing, Aggregation & JWT Authentication Flow",
  ],
};

const InterviewPrepDrawer = ({ app, onClose, onSaved, backendUrl, token }) => {
  const [stipend, setStipend] = useState("");
  const [referralContact, setReferralContact] = useState("");
  const [dsaQuestions, setDsaQuestions] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!app) return;
    const raw = app.notes || "";

    if (raw.includes("---PREP_VAULT---")) {
      try {
        const jsonPart = raw.split("---PREP_VAULT---")[1];
        const parsed = JSON.parse(jsonPart);
        setStipend(parsed.stipend || "");
        setReferralContact(parsed.referralContact || "");
        setDsaQuestions(parsed.dsaQuestions || "");
        setGeneralNotes(parsed.generalNotes || "");
      } catch {
        setGeneralNotes(raw);
      }
    } else {
      setStipend("");
      setReferralContact("");
      setDsaQuestions("");
      setGeneralNotes(raw);
    }
  }, [app]);

  if (!app) return null;

  // Company ke hisaab se top asked questions fetch karke box mein daalne wala helper
  const handleLoadCompanyQuestions = () => {
    const compKey = (app.companyName || "").trim().toLowerCase();
    let matchedList = COMPANY_QUESTION_BANK.default;

    for (const key of Object.keys(COMPANY_QUESTION_BANK)) {
      if (key !== "default" && compKey.includes(key)) {
        matchedList = COMPANY_QUESTION_BANK[key];
        break;
      }
    }

    const formattedQuestions = matchedList.join("\n");
    setDsaQuestions((prev) =>
      prev.trim()
        ? `${prev.trim()}\n\n--- Top Asked Questions (${app.companyName}) ---\n${formattedQuestions}`
        : formattedQuestions,
    );
    toast.info(`Loaded top interview questions for ${app.companyName}!`);
  };

  const handleSaveVault = async (e) => {
    e.preventDefault();
    setSaving(true);

    const summaryParts = [];
    if (stipend.trim()) summaryParts.push(`CTC/Stipend: ${stipend.trim()}`);
    if (generalNotes.trim()) summaryParts.push(generalNotes.trim());
    const readablePrefix = summaryParts.join(" | ") || "Prep Vault Added";

    const payloadJson = JSON.stringify({
      stipend,
      referralContact,
      dsaQuestions,
      generalNotes,
    });

    const combinedNotes = `${readablePrefix} ---PREP_VAULT---${payloadJson}`;

    try {
      const res = await axios.put(
        `${backendUrl}/api/applications/${app._id}`,
        {
          companyName: app.companyName,
          role: app.role,
          status: app.status,
          appliedDate: app.appliedDate,
          interviewDate: app.interviewDate,
          notes: combinedNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const updatedApp = res.data.application ||
        res.data || { ...app, notes: combinedNotes };
      onSaved(updatedApp);
      toast.success(`${app.companyName} Prep Vault saved!`);
      onClose();
    } catch (error) {
      console.error("Error saving prep vault:", error);
      toast.error("Vault save karne mein error aaya.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          zIndex: 1040,
        }}
      />

      <div
        className="bg-white shadow-lg p-4 d-flex flex-column"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "100%",
          maxWidth: "480px",
          height: "100vh",
          zIndex: 1050,
          overflowY: "auto",
        }}
      >
        <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
          <div>
            <span className="badge bg-primary mb-1">{app.status}</span>
            <h4 className="fw-bold mb-0">{app.companyName}</h4>
            <small className="text-muted">{app.role}</small>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          />
        </div>

        <form
          onSubmit={handleSaveVault}
          className="d-flex flex-column gap-3 flex-grow-1"
        >
          <div>
            <label className="form-label fw-semibold">
              💰 Stipend / CTC Package
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. ₹30,000/month or 12 LPA"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              🤝 HR / Referral Contact & Links
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Recruiter LinkedIn URL, email, or referral name"
              value={referralContact}
              onChange={(e) => setReferralContact(e.target.value)}
            />
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold mb-0">
                💻 Asked DSA & Technical Questions
              </label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary fw-semibold"
                onClick={handleLoadCompanyQuestions}
              >
                ✨ Load {app.companyName} Questions
              </button>
            </div>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Click 'Load Questions' above to auto-fill top asked questions, or type your own..."
              value={dsaQuestions}
              onChange={(e) => setDsaQuestions(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label fw-semibold">
              📝 General Interview & Round Notes
            </label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Round dates, interviewer feedback, topics to revise..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </div>

          <div className="mt-auto pt-3 border-top d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary fw-bold flex-grow-1"
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save to Prep Vault"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default InterviewPrepDrawer;
