import { useState, useEffect } from "react";
import { uploadResume } from "../../services/api";
import { CheckCircle2, Sparkles } from "lucide-react";
export function ResumeUpload({ email, onSkillsExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!email || email.includes('@elevateai.guest')) {
      const savedResumeData = localStorage.getItem('guest_resume_data');
      if (savedResumeData) {
        try {
          const resumeData = JSON.parse(savedResumeData);
          setResult({
            message: resumeData.message || 'Previously uploaded resume data restored',
            category: resumeData.category,
            field_detected: resumeData.fieldDetected
          });
          console.log('📄 Restored resume data for guest user');
        } catch (error) {
          console.error('Failed to load guest resume data:', error);
        }
      }
    }
  }, [email]);
  const handleUpload = async () => {
    const trimmedEmail = (email || "").trim();
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
      console.log("Resume extraction result:", data);
      setResult(data);
      const extracted =
        data.skills || data.extracted_skills || data.extractedSkills || [];
      if (!email || email.includes('@elevateai.guest')) {
        const resumeData = {
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          extractedSkills: extracted,
          category: data.category,
          fieldDetected: data.field_detected,
          message: data.message
        };
        localStorage.setItem('guest_resume_data', JSON.stringify(resumeData));
        console.log('💾 Saved resume data for guest user');
      }
      if (onSkillsExtracted && Array.isArray(extracted)) {
        onSkillsExtracted(extracted);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown upload error";
      alert(`Upload failed: ${errorMessage} ❌`);
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
        {result && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Resume Processed Successfully!</span>
            </div>
            <p className="text-slate-300 text-sm mb-2">{result.message}</p>
            {result.category && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Field Detected:</span>
                <span className="text-white">{result.category}</span>
              </div>
            )}
          </div>
        )}
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