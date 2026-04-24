import React, { useEffect, useRef, useState } from 'react';
import { Layout } from './components/layout/Layout';
import { SkillInput } from './components/features/SkillInput';
import { ResumeUpload } from './components/features/ResumeUpload';
import { Recommendations } from './components/features/Recommendations';
import { Roadmap } from './components/features/Roadmap';
import { Trends } from './components/features/Trends';
import { motion, AnimatePresence } from 'framer-motion';
import { getUser, recommendJobs, saveUserSkills } from './services/api';
import { Landing } from './pages/Landing';
import { useAuth } from './auth/useAuth.jsx';
import { Loader2, Sparkles, BarChart3, Map, User, CheckCircle2, Circle } from 'lucide-react';

function App() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetRole, setTargetRole] = useState('');
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState([]);
  const [stats, setStats] = useState(null);
  const [recsAutoRunKey, setRecsAutoRunKey] = useState(0);
  const [profile, setProfile] = useState({ status: 'idle', updatedAt: null });
  const lastLoadedEmailRef = useRef('');

  // When authenticated, bind profile email automatically
  useEffect(() => {
    if (auth.isAuthed && auth.user?.email) {
      setEmail(auth.user.email);
    }
  }, [auth.isAuthed, auth.user]);

  const handleGenerateRoadmap = (role) => {
    setTargetRole(role);
    setActiveTab('roadmap');
  };

  const handleSkillsExtracted = async (extracted) => {
    // Replace skills entirely on resume upload as requested by user
    const freshSkills = Array.from(
      new Set((extracted || []).map((s) => (s || '').trim().toLowerCase()).filter(Boolean))
    );
    setSkills(freshSkills);
    if (email) {
      try { await saveUserSkills(email, freshSkills); } catch (e) { console.error(e); }
    }
    // Refresh dashboard stats + recommendations automatically
    if (email) {
      try {
        const res = await recommendJobs(email);
        if (res.data?.stats) setStats(res.data.stats);
      } catch (e) {
        console.error(e);
      }
    }
    setRecsAutoRunKey((k) => k + 1);
    setActiveTab('recommendations');
  };

  const handleSkillsSaved = (savedSkills) => {
    setSkills(savedSkills);
    // Refresh dashboard stats + recommendations automatically
    if (email) {
      recommendJobs(email)
        .then((res) => { if (res.data?.stats) setStats(res.data.stats); })
        .catch((e) => console.error(e));
    }
    setRecsAutoRunKey((k) => k + 1);
    setActiveTab('recommendations');
  };

  // Load existing profile from DB when email changes (SaaS-like persistence)
  useEffect(() => {
    const trimmed = (email || '').trim();
    if (!trimmed) {
      setProfile({ status: 'idle', updatedAt: null });
      return;
    }

    // Avoid refetch loop if user keeps typing same email
    if (lastLoadedEmailRef.current === trimmed) return;
    lastLoadedEmailRef.current = trimmed;

    setProfile((p) => ({ ...p, status: 'loading' }));
    getUser(trimmed)
      .then((res) => {
        const data = res.data || {};
        const dbSkills = Array.isArray(data.skills) ? data.skills : [];
        setSkills(dbSkills);
        setProfile({ status: 'loaded', updatedAt: data.updated_at || null });

        // Also refresh stats if possible
        return recommendJobs(trimmed);
      })
      .then((res) => {
        if (res?.data?.stats) setStats(res.data.stats);
      })
      .catch((err) => {
        // If user doesn't exist yet, that's fine — they'll create it on save/upload
        console.error(err);
        setProfile({ status: 'error', updatedAt: null });
        setStats(null);
        setSkills([]);
      });
  }, [email]);

  // Auto-run recommendations whenever user opens the recommendations tab
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const prev = prevTabRef.current;
    prevTabRef.current = activeTab;

    if (activeTab === 'recommendations' && prev !== 'recommendations') {
      if (email.trim() && skills.length > 0) {
        setRecsAutoRunKey((k) => k + 1);
      }
    }
  }, [activeTab, email, skills.length]);

  // Auto-generate roadmap when user opens Roadmap tab:
  // - If no targetRole selected, use the best match role from stats.
  // - If stats aren't available yet, compute them first from backend.
  useEffect(() => {
    const trimmedEmail = email.trim();
    if (activeTab !== 'roadmap') return;
    if (!trimmedEmail) return;
    if (targetRole) return;

    const bestRole = stats?.bestRole;
    if (bestRole) {
      setTargetRole(bestRole);
      return;
    }

    if (skills.length === 0) return;

    recommendJobs(trimmedEmail)
      .then((res) => {
        if (res?.data?.stats) setStats(res.data.stats);
        const roleFromApi = res?.data?.stats?.bestRole;
        if (roleFromApi) setTargetRole(roleFromApi);
      })
      .catch((e) => console.error(e));
  }, [activeTab, email, skills.length, stats, targetRole]);

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const checklist = [
    { label: 'Enter your email', done: email.trim().length > 0 },
    { label: 'Add your skills', done: skills.length > 0 },
    { label: 'View recommendations', done: !!stats },
  ];

  const kpiCards = [
    {
      label: 'Total Skills',
      value: skills.length || '—',
      sub: skills.length > 0 ? 'in your profile' : 'Add skills to start',
      color: 'from-primary/20 to-primary/5',
      icon: <User className="w-5 h-5 text-primary-light" />,
      tab: 'skills',
    },
    {
      label: 'Best Match Role',
      value: stats?.bestRole || '—',
      sub: stats ? `${stats.bestMatchPercentage}% match` : 'Generate recommendations',
      color: 'from-emerald-500/20 to-emerald-500/5',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      tab: 'recommendations',
    },
    {
      label: 'Skill Gaps',
      value: stats?.skillGapCount ?? '—',
      sub: stats ? 'skills to learn' : 'Generate recommendations',
      color: 'from-amber-500/20 to-amber-500/5',
      icon: <Map className="w-5 h-5 text-amber-400" />,
      tab: 'roadmap',
    },
    {
      label: 'Profile Completion',
      value: stats ? `${stats.profileCompletion}%` : '—',
      sub: stats ? 'of your profile' : 'Add skills first',
      color: 'from-accent/20 to-accent/5',
      icon: <BarChart3 className="w-5 h-5 text-accent-light" />,
      tab: 'skills',
    },
  ];

  if (auth.status === 'loading') {
    return (
      <div className="min-h-screen bg-saas-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!auth.isAuthed) {
    return <Landing key="landing" />;
  }

  return (
    <div key={auth.user?.email || 'dashboard'}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} email={email} profile={profile}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full h-full"
          >

            {/* ─── DASHBOARD ─── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent-light">Elevate AI</span>
                  </h1>
                  <p className="text-saas-400 text-lg max-w-2xl">
                    Your AI-powered career co-pilot. Build your profile, discover perfect roles, and generate learning paths to get there.
                  </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpiCards.map((card) => (
                    <button
                      key={card.label}
                      onClick={() => setActiveTab(card.tab)}
                      className={`group relative rounded-xl border border-saas-800 bg-gradient-to-br ${card.color} p-5 text-left hover:border-saas-600 transition-all duration-200 hover:-translate-y-0.5`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-saas-900/60 rounded-lg">{card.icon}</div>
                      </div>
                      <p className="text-2xl font-bold text-white mb-0.5 truncate">{card.value}</p>
                      <p className="text-xs font-semibold text-saas-400 uppercase tracking-wide">{card.label}</p>
                      <p className="text-xs text-saas-500 mt-1">{card.sub}</p>
                    </button>
                  ))}
                </div>

                {/* Quick Actions + Getting Started */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Getting Started Checklist */}
                  <div className="lg:col-span-1 bg-saas-900 border border-saas-800 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-white mb-4">Getting Started</h3>
                    <ul className="space-y-3">
                      {checklist.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          {item.done
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            : <Circle className="w-4 h-4 text-saas-600 shrink-0" />
                          }
                          <span className={item.done ? 'text-saas-300 line-through decoration-saas-600' : 'text-saas-200'}>
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Feature Cards */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-saas-800 bg-saas-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-saas-600 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-base font-bold text-white mb-2 relative z-10">Resume Parsing</h3>
                      <p className="text-saas-400 text-sm mb-4 relative z-10">Upload a PDF to instantly extract your skills using our spaCy NLP pipeline.</p>
                      <button onClick={() => setActiveTab('skills')} className="relative z-10 text-primary-light text-sm font-medium hover:text-white transition-colors">
                        Upload Resume →
                      </button>
                    </div>

                    <div className="border border-saas-800 bg-saas-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-saas-600 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-base font-bold text-white mb-2 relative z-10">Job Recommendations</h3>
                      <p className="text-saas-400 text-sm mb-4 relative z-10">AI-computed match scores between your skill profile and live job roles.</p>
                      <button onClick={() => setActiveTab('recommendations')} className="relative z-10 text-accent-light text-sm font-medium hover:text-white transition-colors">
                        See Matches →
                      </button>
                    </div>

                    <div className="border border-saas-800 bg-saas-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-saas-600 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-base font-bold text-white mb-2 relative z-10">Learning Roadmap</h3>
                      <p className="text-saas-400 text-sm mb-4 relative z-10">Step-by-step skill gap roadmaps with progress tracking.</p>
                      <button onClick={() => setActiveTab('roadmap')} className="relative z-10 text-emerald-400 text-sm font-medium hover:text-white transition-colors">
                        View Roadmap →
                      </button>
                    </div>

                    <div className="border border-saas-800 bg-saas-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-saas-600 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-base font-bold text-white mb-2 relative z-10">Market Intelligence</h3>
                      <p className="text-saas-400 text-sm mb-4 relative z-10">Live charts of top skills, role distribution, and salary trends.</p>
                      <button onClick={() => setActiveTab('trends')} className="relative z-10 text-amber-400 text-sm font-medium hover:text-white transition-colors">
                        Explore Trends →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── SKILL PROFILE ─── */}
            {activeTab === 'skills' && (
              <div className="space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-full text-center mb-4">
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Build Your Profile</h1>
                  <p className="text-saas-400">Tell us what you know, or let our AI parse it from your resume.</p>
                </div>
                <ResumeUpload
                  email={email}
                  onSkillsExtracted={handleSkillsExtracted}
                />
                <div className="w-full max-w-2xl flex items-center gap-4 my-2">
                  <div className="h-px bg-saas-800 flex-1" />
                  <span className="text-xs font-medium text-saas-500 uppercase">Or Add Manually</span>
                  <div className="h-px bg-saas-800 flex-1" />
                </div>
                <SkillInput
                  email={email}
                  skills={skills}
                  onSkillsChange={setSkills}
                  onSkillsSaved={handleSkillsSaved}
                />
              </div>
            )}

            {/* ─── RECOMMENDATIONS ─── */}
            {activeTab === 'recommendations' && (
              <div className="min-h-[60vh]">
                <Recommendations
                  email={email}
                  onGenerateRoadmap={handleGenerateRoadmap}
                  onStatsUpdate={setStats}
                  autoRunKey={recsAutoRunKey}
                />
              </div>
            )}

            {/* ─── ROADMAP ─── */}
            {activeTab === 'roadmap' && (
              <div className="min-h-[60vh]">
                <Roadmap role={targetRole} email={email} />
              </div>
            )}

            {/* ─── TRENDS ─── */}
            {activeTab === 'trends' && (
              <div className="min-h-[60vh]">
                <Trends />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </Layout>
    </div>
  );
}

export default App;