import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { SkillInput } from './components/features/SkillInput';
import { ResumeUpload } from './components/features/ResumeUpload';
import { Recommendations } from './components/features/Recommendations';
import { CareerPathways } from './components/features/CareerPathways';
import { Roadmap } from './components/features/Roadmap';
import { Trends } from './components/features/Trends';
import { SkillTracker } from './components/features/SkillTracker';
import { ProfileEditor } from './components/features/ProfileEditor';
import { CareerBoost, Projects, UserSettings } from './components/features/PlaceholderFeatures';
import { motion, AnimatePresence } from 'framer-motion';
import { saveUserSkills, me } from './services/api';
import { Landing } from './pages/Landing';
import { useAuth } from './auth/useAuth.jsx';
import { 
  Loader2, 
  Sparkles, 
  BarChart3, 
  Map, 
  User, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  BrainCircuit,
  Trophy,
  Activity,
  ChevronRight,
  LayoutDashboard,
  Briefcase
} from 'lucide-react';
function App() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    if (auth.isAuthed && auth.user) {
      setProfile(auth.user);
      me().then(res => {
        if (res.data?.user?.skills) {
          setSkills(res.data.user.skills);
        } else {
          setSkills([]);
        }
        setIsInitialLoad(false);
      }).catch(err => {
        console.error(err);
        setSkills([]);
        setIsInitialLoad(false);
      });
    } else {
      setProfile(null);
      setIsInitialLoad(true);
      const saved = localStorage.getItem('guest_skills');
      if (saved) {
        try {
          setSkills(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load guest skills", e);
          setSkills([]);
        }
      } else {
        setSkills([]);
      }
    }
    const savedRole = localStorage.getItem('active_roadmap_role');
    if (savedRole) setTargetRole(savedRole);
  }, [auth.isAuthed, auth.user]);
  useEffect(() => {
    if (targetRole) {
      localStorage.setItem('active_roadmap_role', targetRole);
    }
  }, [targetRole]);
  useEffect(() => {
    if (!isInitialLoad && auth.isAuthed && auth.user?.email && skills.length > 0) {
      saveUserSkills(auth.user.email, skills).catch(console.error);
    } else if (!auth.isAuthed && skills.length > 0) {
      localStorage.setItem('guest_skills', JSON.stringify(skills));
    }
  }, [skills, auth.isAuthed, auth.user?.email, isInitialLoad]);
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[50px] animate-pulse" />
          <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
        </div>
        <p className="mt-8 text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Intelligence...</p>
      </div>
    );
  }
  if (!auth.isAuthed) {
    return <Landing key="landing" />;
  }
  const handleGenerateRoadmap = (role) => {
    setTargetRole(role);
    setActiveTab('roadmap');
  };
  const handleSkillsExtracted = async (extracted) => {
    const merged = Array.from(
      new Set((extracted || []).map((s) => (s || '').trim().toLowerCase()).filter(Boolean))
    );
    setSkills(merged);
    setActiveTab('recommendations');
  };
  const tabVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };
  return (
    <div key={auth.user?.email || 'dashboard'} className="min-h-screen bg-[#020617] text-white selection:bg-primary/30">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={auth.user} onLogout={auth.logout}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full h-full max-w-7xl mx-auto"
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-12">
                {}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">System Live</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
                      Precision Dashboard
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                      Welcome back, <span className="text-white font-bold">{auth.user?.name || 'Explorer'}</span>. Your profile is synchronized with {skills.length} core competencies.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveTab('resume-analysis')}
                      className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                      Update Profile
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </header>
                {}
                {auth.user?.email && (
                  <div className="w-full">
                    <ProfileEditor 
                      email={auth.user.email} 
                      onProfileUpdate={(updatedProfile) => {
                        if (updatedProfile) {
                          setProfile(prev => ({ ...prev, ...updatedProfile }));
                        }
                      }}
                    />
                  </div>
                )}
                {}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Core Skills', val: skills.length, icon: BrainCircuit, color: 'text-primary-light' },
                    { label: 'Role Matches', val: '12+', icon: Trophy, color: 'text-yellow-400' },
                    { label: 'Growth Path', val: '85%', icon: Activity, color: 'text-emerald-400' },
                    { label: 'Market Val', val: 'High', icon: BarChart3, color: 'text-accent-light' }
                  ].map((s, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <s.icon className={`w-5 h-5 ${s.color}`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</span>
                      </div>
                      <div className="text-3xl font-black text-white">{s.val}</div>
                    </div>
                  ))}
                </div>
                {}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 group relative p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-light mb-8">
                        <User className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-3">Professional Synthesis</h3>
                      <p className="text-slate-400 text-lg mb-8 max-w-md">Refresh your career identity by re-analyzing your resume with our updated v2.0 extraction engine.</p>
                      <button 
                        onClick={() => setActiveTab('resume-analysis')}
                        className="flex items-center gap-2 text-primary-light font-bold hover:text-white transition-colors group/btn"
                      >
                        Launch Upload Center
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className="group relative p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent-light mb-8">
                        <BarChart3 className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-3">Pulse</h3>
                      <p className="text-slate-400 text-lg mb-8">Track real-time shifting market demands.</p>
                      <button 
                        onClick={() => setActiveTab('trends')}
                        className="flex items-center gap-2 text-accent-light font-bold hover:text-white transition-colors group/btn"
                      >
                        Market Intel
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'resume-analysis' && (
              <div className="space-y-12 flex flex-col items-center justify-center min-h-[70vh]">
                <div className="w-full text-center max-w-2xl">
                  <h1 className="text-4xl font-black tracking-tight text-white mb-4">Profile Synthesis</h1>
                  <p className="text-slate-400 text-lg leading-relaxed">Complete your professional profile and upload your resume to get personalized career recommendations.</p>
                </div>
                {}
                {auth.user?.email && (
                  <div className="w-full max-w-4xl mb-8">
                    <ProfileEditor 
                      email={auth.user.email} 
                      onProfileUpdate={(updatedProfile) => {
                        if (updatedProfile) {
                          setProfile(prev => ({ ...prev, ...updatedProfile }));
                        }
                      }}
                    />
                  </div>
                )}
                <div className="w-full max-w-4xl bg-slate-900/50 border border-white/5 rounded-[3rem] p-4 backdrop-blur-xl">
                  <div className="bg-slate-950/50 rounded-[2.5rem] p-12 border border-white/5">
                    <ResumeUpload
                      email={auth.user?.email}
                      onSkillsExtracted={handleSkillsExtracted}
                    />
                    <div className="flex items-center gap-6 my-12">
                      <div className="h-px bg-slate-800 flex-1" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Manual Entry</span>
                      <div className="h-px bg-slate-800 flex-1" />
                    </div>
                    <SkillInput skills={skills} onSkillsChange={setSkills} />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'recommendations' && (
              <div className="min-h-[70vh] py-8">
                <Recommendations email={auth.user?.email} skills={skills} onGenerateRoadmap={handleGenerateRoadmap} />
              </div>
            )}
            {activeTab === 'pathways' && (
              <div className="min-h-[70vh] py-8">
                <CareerPathways 
                  email={auth.user?.email} 
                  userSkills={skills} 
                  onGenerateRoadmap={handleGenerateRoadmap}
                  onNavigateRecommendations={() => setActiveTab('recommendations')}
                />
              </div>
            )}
            {activeTab === 'roadmap' && (
              <div className="min-h-[70vh] py-8">
                <Roadmap role={targetRole} email={auth.user?.email} skills={skills} />
              </div>
            )}
            {activeTab === 'trends' && (
              <div className="min-h-[70vh] py-8">
                <Trends />
              </div>
            )}
            {activeTab === 'boost' && (
              <div className="min-h-[70vh] py-8">
                <CareerBoost />
              </div>
            )}
            {activeTab === 'skill-tracker' && (
              <div className="min-h-[70vh] py-8">
                <SkillTracker />
              </div>
            )}
            {activeTab === 'projects' && (
              <div className="min-h-[70vh] py-8">
                <Projects />
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="min-h-[70vh] py-8">
                <UserSettings />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </div>
  );
}
export default App;