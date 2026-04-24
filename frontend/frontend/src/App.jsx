import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { SkillInput } from './components/features/SkillInput';
import { ResumeUpload } from './components/features/ResumeUpload';
import { Recommendations } from './components/features/Recommendations';
import { Roadmap } from './components/features/Roadmap';
import { Trends } from './components/features/Trends';
import { motion, AnimatePresence } from 'framer-motion';
import { saveUserSkills, me } from './services/api';
import { Landing } from './pages/Landing';
import { useAuth } from './auth/useAuth.jsx';
import { Loader2, Sparkles, BarChart3, Map, User, CheckCircle2, Circle } from 'lucide-react';

function App() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (auth.isAuthed && auth.user) {
      setProfile(auth.user);
      // Fetch skills from backend for this user
      me().then(res => {
        if (res.data?.user?.skills) {
          setSkills(res.data.user.skills);
        }
      }).catch(console.error);
    }
  }, [auth.isAuthed, auth.user]);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-saas-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-saas-400 font-medium animate-pulse">Initializing Elevate AI...</p>
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
    // Hard replace for fresh analysis
    const merged = Array.from(
      new Set((extracted || []).map((s) => (s || '').trim().toLowerCase()).filter(Boolean))
    );

    setSkills(merged);

    if (auth.user?.email) {
      try {
        await saveUserSkills(auth.user.email, merged);
      } catch (e) {
        console.error(e);
      }
    }

    setActiveTab('recommendations');
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div key={auth.user?.email || 'dashboard'} className="min-h-screen bg-saas-950 text-white selection:bg-primary/30">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={auth.user} onLogout={auth.logout}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full h-full"
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                    Welcome back, {auth.user?.name || 'Explorer'} <Sparkles className="w-8 h-8 text-yellow-400" />
                  </h1>
                  <p className="text-saas-400 text-lg max-w-2xl">
                    Your AI-powered career co-pilot is ready. Your profile is currently synced with {skills.length} skills.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="col-span-1 border border-saas-800 bg-saas-900/50 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="p-3 bg-primary/20 rounded-xl">
                        <User className="w-6 h-6 text-primary-light" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Refresh your profile</h3>
                    <p className="text-saas-400 mb-6 relative z-10">Upload a new resume to update your skill set and see how it changes your career matches.</p>
                    <button 
                      onClick={() => setActiveTab('skills')}
                      className="relative z-10 text-primary-light font-medium hover:text-white transition-colors flex items-center gap-2"
                    >
                      Update Profile <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="col-span-1 border border-saas-800 bg-saas-900/50 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="p-3 bg-accent/20 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-accent-light" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Market Intelligence</h3>
                    <p className="text-saas-400 mb-6 relative z-10">Explore high-demand skills and salary trends based on live job market data.</p>
                    <button 
                      onClick={() => setActiveTab('trends')}
                      className="relative z-10 text-accent-light font-medium hover:text-white transition-colors flex items-center gap-2"
                    >
                      Explore Trends <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-full text-center mb-4">
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Build Your Profile</h1>
                  <p className="text-saas-400">Our AI will analyze your resume to extract core competencies and hidden skills.</p>
                </div>
                <ResumeUpload
                  email={auth.user?.email}
                  onSkillsExtracted={handleSkillsExtracted}
                />
                <div className="w-full max-w-2xl flex items-center gap-4 my-2">
                  <div className="h-px bg-saas-800 flex-1" />
                  <span className="text-xs font-medium text-saas-500 uppercase">Or Add Manually</span>
                  <div className="h-px bg-saas-800 flex-1" />
                </div>
                <SkillInput skills={skills} onSkillsChange={setSkills} />
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="min-h-[60vh]">
                <Recommendations skills={skills} onGenerateRoadmap={handleGenerateRoadmap} />
              </div>
            )}

            {activeTab === 'roadmap' && (
              <div className="min-h-[60vh]">
                <Roadmap role={targetRole} skills={skills} />
              </div>
            )}

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

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default App;