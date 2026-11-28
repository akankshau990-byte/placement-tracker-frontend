import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const InterviewPrepDrawer = ({ app, onClose, onSaved, backendUrl, token }) => {
  const [stipend, setStipend] = useState("");
  const [referralContact, setReferralContact] = useState("");
  const [dsaQuestions, setDsaQuestions] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

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

  const hasExistingQuestions = dsaQuestions.trim().length > 20;

  // Dynamic Backend AI Call: First time full prep kit + resources, next clicks append 15 NEW questions
  const handleGenerateDynamicQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/questions/generate`,
        {
          companyName: app.companyName,
          role: app.role,
          existingQuestions: dsaQuestions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const fetchedQuestions = res.data.questions;
      setDsaQuestions((prev) =>
        prev.trim()
          ? `${prev.trim()}\n\n--- MORE QUESTIONS BATCH ---\n\n${fetchedQuestions}`
          : fetchedQuestions,
      );
      toast.success(
        hasExistingQuestions
          ? `15 new questions added for ${app.companyName}!`
          : `Full Prep Kit & Sources loaded for ${app.companyName}!`,
      );
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Questions load karne mein error aaya.");
    } finally {
      setLoadingQuestions(false);
    }
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
          maxWidth: "560px",
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
            <div className="d-flex justify-content-between align-items-center mb-1 gap-2 flex-wrap">
              <label className="form-label fw-semibold mb-0">
                💻 Complete Prep Kit, Sources & Questions
              </label>
              <div className="d-flex gap-1">
                {hasExistingQuestions && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDsaQuestions("")}
                    title="Clear all questions"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-primary fw-semibold"
                  onClick={handleGenerateDynamicQuestions}
                  disabled={loadingQuestions}
                >
                  {loadingQuestions
                    ? "⏳ Generating..."
                    : hasExistingQuestions
                      ? "➕ Load 15 More Questions"
                      : `✨ Get ${app.companyName} Full Kit`}
                </button>
              </div>
            </div>
            <textarea
              className="form-control"
              rows="11"
              placeholder="Click button above to load Hiring Pattern, Prep Sources (LeetCode/GFG/Striver), DSA, Core CS & HR questions..."
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
              rows="2"
              placeholder="Round dates, interviewer feedback, topics to revise..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </div>

          <div className="mt-auto pt-3 border-top d-flex gap-2">
            <button
              type="submit"
              className="btn btn-success fw-bold flex-grow-1"
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
