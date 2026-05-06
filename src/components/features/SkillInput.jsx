import React, { useState, useEffect } from "react";
import { saveUserSkills } from "../../services/api";
import { useAuth } from "../../auth/useAuth.jsx";
import { Plus, X, Save, CheckCircle2 } from "lucide-react";
export function SkillInput({ skills: externalSkills, onSkillsChange }) {
  const auth = useAuth();
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState(externalSkills || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (externalSkills) {
      setSkills(externalSkills);
    }
  }, [externalSkills]);
  const addSkill = () => {
    if (!skillInput.trim()) return;
    const newSkills = [...skills, skillInput.trim()];
    setSkills(newSkills);
    if (onSkillsChange) onSkillsChange(newSkills);
    setSkillInput("");
    setSaved(false);
  };
  const removeSkill = (indexToRemove) => {
    const newSkills = skills.filter((_, index) => index !== indexToRemove);
    setSkills(newSkills);
    if (onSkillsChange) onSkillsChange(newSkills);
    setSaved(false);
  };
  const saveSkills = async () => {
    if (!auth.user?.email) return;
    setSaving(true);
    try {
      await saveUserSkills(auth.user.email, skills);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-saas-800 bg-saas-900/60 shadow-xl shadow-saas-950/40 backdrop-blur p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-saas-100 mb-2">
              Add Skills Manually
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="e.g. React, Python, UI Design"
                className="flex-1 rounded-xl border border-saas-700 bg-saas-950 px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary-light transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <Plus className="w-5 h-5" />
                <span>Add</span>
              </button>
            </div>
          </div>
          {skills.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-saas-500">
                Current Skill Set ({skills.length})
              </p>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 rounded-lg bg-saas-800/80 px-3 py-2 text-sm font-medium text-white border border-saas-700 hover:border-saas-600 transition-all"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-saas-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 pt-6 border-t border-saas-800 flex items-center justify-between">
          <div className="text-sm text-saas-400">
            {saved && (
              <span className="flex items-center gap-2 text-emerald-400 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="w-4 h-4" /> Profile Updated
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={saveSkills}
            disabled={saving || skills.length === 0}
            className="flex items-center gap-2 rounded-xl bg-saas-800 border border-saas-700 px-8 py-3 font-bold text-white hover:bg-saas-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {saving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
            ) : (
              <Save className="w-5 h-5 text-primary-light" />
            )}
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}