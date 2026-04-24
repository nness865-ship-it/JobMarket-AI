import { useState } from "react";
import { uploadResume } from "../../services/api";

export function ResumeUpload({ email, onSkillsExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    const trimmedEmail = (email || "").trim();

    if (!trimmedEmail) {
      alert("Please enter email in the Skill Profile section first.");
      return;
    }

    if (!file) {
      alert("Please select a PDF resume.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", trimmedEmail);

    try {
      setLoading(true);
      const response = await uploadResume(formData);
      const data = response.data || {};

      alert(data.message || "Resume uploaded successfully ✅");
      console.log("Resume extraction result:", data);

      const extracted =
        data.skills || data.extracted_skills || data.extractedSkills || [];

      if (onSkillsExtracted && Array.isArray(extracted)) {
        onSkillsExtracted(extracted);
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-900/40 backdrop-blur p-8">
        <header className="mb-4">
          <p className="text-xs font-semibold tracking-wide text-sky-400 uppercase">
            Resume Parser
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">
            Upload & Extract Details
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Upload your latest resume in PDF format and our AI will automatically extract your experience and skills.
          </p>
        </header>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-slate-200">
              Resume file (PDF)
            </span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-xs text-slate-300
                         file:mr-3 file:rounded-md file:border-0 file:bg-sky-500 file:px-3 file:py-2
                         file:text-xs file:font-medium file:text-white
                         hover:file:bg-sky-400"
            />
          </label>

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Upload & Extract"}
          </button>
        </div>
      </div>
    </div>
  );
}