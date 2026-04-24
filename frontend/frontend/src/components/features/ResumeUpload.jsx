import { useState, useRef } from "react";
import { uploadResume } from "../../services/api";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, Tag } from "lucide-react";
import { cn } from "../../lib/utils";

export function ResumeUpload({ email, onSkillsExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    if (type === 'error') setTimeout(() => setStatus(null), 5000);
  };

  const handleFile = (selected) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      showStatus("error", "Only PDF files are supported.");
      return;
    }
    setFile(selected);
    setStatus(null);
    setExtractedSkills([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    const trimmedEmail = (email || "").trim();

    if (!trimmedEmail) {
      showStatus("error", "Please enter your email in the Skill Profile section below first.");
      return;
    }

    if (!file) {
      showStatus("error", "Please select a PDF resume.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", trimmedEmail);

    setLoading(true);
    setStatus(null);

    try {
      const response = await uploadResume(formData);
      const data = response.data || {};

      const extracted =
        data.skills || data.extracted_skills || data.extractedSkills || [];

      setExtractedSkills(extracted);
      showStatus("success", `Resume parsed! ${extracted.length} skill${extracted.length !== 1 ? "s" : ""} found.`);

      if (onSkillsExtracted && Array.isArray(extracted)) {
        onSkillsExtracted(extracted);
      }
    } catch (error) {
      console.error(error);
      showStatus("error", "Upload failed. Please check the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-saas-800 bg-saas-900/60 shadow-xl shadow-saas-950/40 backdrop-blur p-8">
        
        {/* Header */}
        <header className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-accent-light uppercase mb-1">
            AI Resume Parser
          </p>
          <h2 className="text-xl font-bold text-white">Upload & Extract Skills</h2>
          <p className="mt-1 text-sm text-saas-400">
            Upload your latest resume in PDF format and our AI will automatically extract your skills.
          </p>
        </header>

        {/* Status Banner */}
        {status && (
          <div className={cn(
            "flex items-center gap-2.5 rounded-lg px-4 py-3 mb-5 text-sm font-medium border",
            status.type === 'success'
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            {status.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />
            }
            {status.message}
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200",
            isDragging
              ? "border-accent bg-accent/5 scale-[1.01]"
              : file
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-saas-700 hover:border-saas-500 hover:bg-saas-800/30"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            file ? "bg-emerald-500/10 text-emerald-400" : "bg-saas-800 text-saas-400 group-hover:text-saas-200"
          )}>
            {file ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </div>

          {file ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-saas-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setExtractedSkills([]); setStatus(null); }}
                className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-saas-200">Drop your PDF here, or click to browse</p>
              <p className="text-xs text-saas-500 mt-1">PDF files only · Max 10 MB</p>
            </div>
          )}
        </div>

        {/* Extracted Skills Preview */}
        {extractedSkills.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-saas-500 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Extracted Skills ({extractedSkills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-medium text-accent-light"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !file}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload & Extract
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}