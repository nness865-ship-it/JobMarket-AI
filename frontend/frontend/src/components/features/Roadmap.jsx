import React, { useState, useEffect } from 'react';
import { generateRoadmap, saveSkillProgress } from '../../services/api';
import { useAuth } from '../../auth/useAuth';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Loader2, 
  BookOpen, 
  ChevronRight, 
  Trophy, 
  Sparkles, 
  PartyPopper,
  Lock,
  Unlock,
  Flag,
  Target,
  Zap,
  Layout,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const STORAGE_KEY = 'roadmap_progress';
const SKILL_TRACKER_KEY = 'skill_tracker_data';

function loadProgress(role) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[role] || [];
  } catch { return []; }
}

function saveProgress(role, completedIds) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[role] = completedIds;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

// Save skill tracker data when steps are completed
function saveSkillTrackerEntry(role, step, isCompleting) {
  if (!isCompleting) return; // Only save when completing, not when unchecking
  
  try {
    const trackerData = JSON.parse(localStorage.getItem(SKILL_TRACKER_KEY) || '{}');
    const stepKey = `${role}-${step.id}`;
    
    trackerData[stepKey] = {
      stepId: step.id,
      role: role,
      stepTitle: step.title,
      skills: step.skills || [],
      completedDate: new Date().toISOString(),
      duration: step.duration || 'N/A'
    };
    
    localStorage.setItem(SKILL_TRACKER_KEY, JSON.stringify(trackerData));
    console.log('✅ Saved to Skill Tracker:', step.title, 'for role:', role);
  } catch (error) {
    console.error('Failed to save skill tracker data:', error);
  }
}

// Remove from skill tracker when step is unchecked
function removeFromSkillTracker(role, stepId) {
  try {
    const trackerData = JSON.parse(localStorage.getItem(SKILL_TRACKER_KEY) || '{}');
    const stepKey = `${role}-${stepId}`;
    
    if (trackerData[stepKey]) {
      delete trackerData[stepKey];
      localStorage.setItem(SKILL_TRACKER_KEY, JSON.stringify(trackerData));
      console.log('❌ Removed from Skill Tracker:', stepId, 'for role:', role);
    }
  } catch (error) {
    console.error('Failed to remove from skill tracker:', error);
  }
}

export function Roadmap({ role, email, skills }) {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [activePhase, setActivePhase] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [celebrateIndex, setCelebrateIndex] = useState(null);

  useEffect(() => {
    if (role) {
      handleGenerate(role, email);
    } else {
      setLoading(false);
    }
  }, [role, email]);

  useEffect(() => {
    if (roadmap?.role) {
      setCompletedSteps(loadProgress(roadmap.role));
    }
  }, [roadmap?.role]);

  const handleGenerate = async (selectedRole, userEmail) => {
    setLoading(true);
    try {
      const response = await generateRoadmap(userEmail, selectedRole, skills);
      const data = response.data?.roadmap;
      
      // Group steps into 3 phases for the new structure
      if (data && data.steps) {
        const stepsPerPhase = Math.ceil(data.steps.length / 3);
        const phases = [
          { name: "Phase 1: Foundations", steps: data.steps.slice(0, stepsPerPhase) },
          { name: "Phase 2: Advanced Core", steps: data.steps.slice(stepsPerPhase, stepsPerPhase * 2) },
          { name: "Phase 3: Mastery & Output", steps: data.steps.slice(stepsPerPhase * 2) }
        ];
        data.phases = phases;
        
        // Save roadmap data for skill tracker
        try {
          const existingRoadmaps = JSON.parse(localStorage.getItem('generated_roadmaps') || '{}');
          existingRoadmaps[selectedRole] = data;
          localStorage.setItem('generated_roadmaps', JSON.stringify(existingRoadmaps));
          console.log('💾 Saved roadmap data for:', selectedRole);
        } catch (error) {
          console.error('Failed to save roadmap data:', error);
        }
      }
      
      setRoadmap(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleStepDone = async (stepId, index, e) => {
    if (e) e.stopPropagation();
    const alreadyDone = completedSteps.includes(stepId);
    let updated;
    
    if (alreadyDone) {
      updated = completedSteps.filter(id => id !== stepId);
      // Backend sync: remove
      if (email) {
        try {
          await saveSkillProgress({
            email,
            role: roadmap.role,
            step_id: stepId,
            is_completed: false
          });
        } catch (err) { console.error(err); }
      }
    } else {
      updated = [...completedSteps, stepId];
      setCelebrateIndex(index);
      setTimeout(() => setCelebrateIndex(null), 1500);
      
      const step = roadmap.steps.find(s => s.id === stepId);
      if (step && email) {
        try {
          await saveSkillProgress({
            email,
            role: roadmap.role,
            step_id: stepId,
            is_completed: true,
            step_data: {
              stepId: step.id,
              role: roadmap.role,
              stepTitle: step.title,
              skills: step.skills,
              duration: step.duration
            }
          });
        } catch (err) { console.error(err); }
      }
    }
    setCompletedSteps(updated);
  };

  const totalSteps = roadmap?.steps?.length || 1;
  const doneCount = completedSteps.length;
  const progressPercent = Math.round((doneCount / totalSteps) * 100);
  const allDone = doneCount === totalSteps && totalSteps > 0;

  if (loading) {
    return (
      <div className="w-full h-[600px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[40px] animate-pulse" />
          <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
        </div>
        <h3 className="mt-8 text-xl font-black text-white tracking-tight">Constructing Career Path...</h3>
        <p className="text-slate-400 text-sm mt-2">Mapping your journey to {role}</p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mb-8 rotate-12">
          <Target className="w-10 h-10 text-slate-700" />
        </div>
        <h3 className="text-2xl font-black text-white mb-4">No Active Roadmap</h3>
        <p className="text-slate-400 max-w-sm mx-auto mb-8">Select a role in the Recommendations tab to lock in your personalized journey.</p>
      </div>
    );
  }

  const activePhaseData = roadmap.phases[activePhase];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
      {/* Journey Header Card */}
      <section className="relative p-10 rounded-[3rem] bg-slate-900/40 border border-white/10 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Lock className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3" /> Active Journey Locked
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3">
              Goal: {roadmap.role}
            </h2>
            {roadmap.personalized_message && (
              <p className="text-primary-light font-bold text-sm mb-4 max-w-2xl">
                {roadmap.personalized_message}
              </p>
            )}
            <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
              <span className="flex items-center gap-2"><Flag className="w-4 h-4" /> {roadmap.steps.length} Milestones</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> {doneCount} Completed</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 min-w-[280px]">
            <div className="w-full">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Level</span>
                <span className="text-sm font-black text-primary-light">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('active_roadmap_role');
                window.location.reload();
              }}
              className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group"
            >
              <Unlock className="w-3 h-3 group-hover:text-primary" /> Reset Goal
            </button>
          </div>
        </div>
      </section>

      {/* Main Structural Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Side Phase Nav */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Milestone Phases</div>
          {roadmap.phases.map((phase, idx) => {
            const phaseDoneCount = phase.steps.filter(s => completedSteps.includes(s.id)).length;
            const isPhaseActive = activePhase === idx;
            const isPhaseComplete = phaseDoneCount === phase.steps.length;

            return (
              <button
                key={idx}
                onClick={() => setActivePhase(idx)}
                className={cn(
                  "w-full p-6 rounded-[2rem] border transition-all text-left flex items-center gap-4 relative overflow-hidden group",
                  isPhaseActive 
                    ? "bg-slate-900 border-white/10 shadow-xl" 
                    : "bg-slate-900/20 border-white/5 hover:border-white/10"
                )}
              >
                {isPhaseActive && (
                  <motion.div layoutId="activePhase" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
                
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  isPhaseComplete ? "bg-emerald-500/10 text-emerald-400" : isPhaseActive ? "bg-primary/10 text-primary-light" : "bg-white/5 text-slate-500"
                )}>
                  {isPhaseComplete ? <CheckCircle2 className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                </div>
                
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phase {idx + 1}</div>
                  <div className={cn(
                    "text-sm font-black transition-colors",
                    isPhaseActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}>
                    {phase.name.split(': ')[1]}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 mt-1">
                    {phaseDoneCount}/{phase.steps.length} Milestones
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Phase Details Content */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black text-white">{activePhaseData.name}</h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Phase Tasks</span>
              </div>

              <div className="grid gap-6">
                {activePhaseData.steps.map((step, idx) => {
                  const isDone = completedSteps.includes(step.id);
                  const isCelebrating = celebrateIndex === idx && activePhaseData.steps.indexOf(step) === idx;

                  return (
                    <div 
                      key={step.id}
                      className={cn(
                        "group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden",
                        isDone 
                          ? "bg-emerald-500/5 border-emerald-500/10 opacity-80" 
                          : "bg-slate-900/40 border-white/5 hover:border-white/10"
                      )}
                    >
                      {isCelebrating && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-emerald-500/10 pointer-events-none"
                        />
                      )}

                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="shrink-0 flex md:flex-col items-center gap-4">
                          <button 
                            onClick={() => toggleStepDone(step.id, idx)}
                            className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                              isDone ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {isDone ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <div className="w-px h-full bg-white/5 hidden md:block" />
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Milestone {idx + 1}</span>
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">{step.duration}</span>
                            </div>
                            {isDone && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Achieved</span>}
                          </div>

                          <h4 className={cn(
                            "text-xl font-black transition-all",
                            isDone ? "text-emerald-300 line-through decoration-emerald-500/20" : "text-white"
                          )}>
                            {step.title}
                          </h4>

                          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                            {step.description}
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {step.skills.map((skill, sIdx) => (
                              <span key={sIdx} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/5 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-primary-light" /> {skill}
                              </span>
                            ))}
                          </div>
                          
                          <div className="pt-4 flex items-center gap-6">
                            <button className="text-xs font-black text-primary-light hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                              Access Resources <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-16 rounded-[4rem] bg-gradient-to-br from-primary/10 to-accent/10 border border-white/10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
          <PartyPopper className="w-20 h-20 text-yellow-400 mx-auto mb-8 relative z-10" />
          <h3 className="text-4xl font-black text-white mb-4 relative z-10">Ascension Complete!</h3>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 relative z-10">
            You've mastered every milestone for the <span className="text-white font-bold">{roadmap.role}</span> track. Your profile is now optimized for the next tier.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem('active_roadmap_role');
              window.location.reload();
            }}
            className="px-10 py-5 rounded-2xl bg-white text-black font-black hover:bg-slate-200 transition-all shadow-2xl relative z-10"
          >
            Start New Journey
          </button>
        </motion.div>
      )}
    </div>
  );
}
