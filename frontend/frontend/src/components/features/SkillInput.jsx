import { useEffect, useState } from "react";
import { saveUserSkills } from "../../services/api";
import { Plus, X, CheckCircle2, AlertCircle, Loader2, Tag } from "lucide-react";
import { cn } from "../../lib/utils";

export function SkillInput({ email, onEmailChange, skills: externalSkills, onSkillsChange, onSkillsSaved, emailLocked = false }) {
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }
  const [loading, setLoading] = useState(false);

  // Keep local view in sync with parent state (resume upload etc.)
  useEffect(() => {
    if (Array.isArray(externalSkills)) {
      setSkills(externalSkills);
    }
  }, [externalSkills]);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim().toLowerCase();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      showStatus("error", `"${trimmed}" is already in your list.`);
      return;
    }
    const next = [...skills, trimmed];
    setSkills(next);
    if (onSkillsChange) onSkillsChange(next);
    setSkillInput("");
  };

  const removeSkill = (indexToRemove) => {
    const next = skills.filter((_, index) => index !== indexToRemove);
    setSkills(next);
    if (onSkillsChange) onSkillsChange(next);
  };

  const saveSkills = async () => {
    const trimmedEmail = (email || "").trim();

    if (!trimmedEmail) {
      showStatus("error", "Please enter your email address before saving.");
      return;
    }

    if (!skills.length) {
      showStatus("error", "Please add at least one skill before saving.");
      return;
    }

    setLoading(true);
    try {
      const res = await saveUserSkills(trimmedEmail, skills);
      const saved = res?.data?.skills || skills;
      showStatus("success", `${skills.length} skill${skills.length > 1 ? "s" : ""} saved successfully!`);
      if (onSkillsChange) onSkillsChange(saved);
      if (onSkillsSaved) onSkillsSaved(saved);
    } catch (error) {
      console.error(error);
      showStatus("error", "Failed to save skills. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-saas-800 bg-saas-900/60 shadow-xl shadow-saas-950/40 backdrop-blur p-8">
        
        {/* Header */}
        <header className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-primary-light uppercase mb-1">
            Manual Entry
          </p>
          <h2 className="text-xl font-bold text-white">Your Skill Profile</h2>
          <p className="mt-1 text-sm text-saas-400">
            Add your primary skills and we'll use them to personalize your recommendations.
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

        <div className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-saas-200">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange && onEmailChange(e.target.value)}
              placeholder="you@example.com"
              disabled={emailLocked}
              className="w-full rounded-lg border border-saas-700 bg-saas-800/50 px-3 py-2.5 text-sm text-saas-100 placeholder:text-saas-500 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
            />
          </div>

          {/* Skill Input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-saas-200">
              Add Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Python, React, SQL..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="flex-1 rounded-lg border border-saas-700 bg-saas-800/50 px-3 py-2.5 text-sm text-saas-100 placeholder:text-saas-500 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              />
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Skill Tags */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-saas-500 flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                Selected Skills ({skills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary-light"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-primary/60 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={saveSkills}
            disabled={loading || !skills.length}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save & Get Recommendations
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}