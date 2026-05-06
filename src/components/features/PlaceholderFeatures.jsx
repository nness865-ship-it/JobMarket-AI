import React from 'react';
import { Rocket, Activity, FolderGit2, Settings } from 'lucide-react';
export function CareerBoost() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent-light mb-6">
        <Rocket className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-white mb-4">Career Boost</h2>
      <p className="text-slate-400 text-lg max-w-2xl">
        Accelerate your professional growth with personalized insights, certifications recommendations, and industry trends tailored to your profile.
      </p>
    </div>
  );
}
export function SkillTracker() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
        <Activity className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-white mb-4">Skill Tracker</h2>
      <p className="text-slate-400 text-lg max-w-2xl">
        Monitor your skill proficiency over time, identify knowledge gaps, and track your learning milestones.
      </p>
    </div>
  );
}
export function Projects() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
        <FolderGit2 className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-white mb-4">Projects Portfolio</h2>
      <p className="text-slate-400 text-lg max-w-2xl">
        Showcase your technical projects, open-source contributions, and real-world applications to stand out to recruiters.
      </p>
    </div>
  );
}
export function UserSettings() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-400 mb-6">
        <Settings className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-white mb-4">Account Settings</h2>
      <p className="text-slate-400 text-lg max-w-2xl">
        Manage your preferences, account details, privacy settings, and notifications here.
      </p>
    </div>
  );
}