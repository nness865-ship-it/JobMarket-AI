import { useState } from "react";
import axios from "axios";

export function SkillInput({ email, onEmailChange }) {
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  const addSkill = () => {
    if (!skillInput.trim()) return;

    setSkills([...skills, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const saveSkills = async () => {
    const trimmedEmail = (email || "").trim();

    if (!trimmedEmail) {
      alert("Please enter your email before saving skills");
      return;
    }

    if (!skills.length) {
      alert("Please add at least one skill");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:5000/save-user-skills", {
        email: trimmedEmail,
        skills,
      });

      alert("Skills saved successfully ✅");
    } catch (error) {
      console.error(error);
      alert("Save failed ❌");
    }
  };

  return (
    <div className="mt-10 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-900/40 backdrop-blur p-8">
        <header className="mb-6">
          <p className="text-xs font-semibold tracking-wide text-sky-400 uppercase">
            Build your profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">
            Your Skill Profile
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Add your primary skills and we will use them to personalize your recommendations.
          </p>
        </header>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange && onEmailChange(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Add skills
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />

              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Add
              </button>
            </div>
          </div>

          {skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Selected skills
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={saveSkills}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save skills
          </button>
        </div>
      </div>
    </div>
  );
}