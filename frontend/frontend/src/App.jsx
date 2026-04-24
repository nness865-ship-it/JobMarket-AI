import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { SkillInput } from './components/features/SkillInput';
import { ResumeUpload } from './components/features/ResumeUpload';
import { Recommendations } from './components/features/Recommendations';
import { Roadmap } from './components/features/Roadmap';
import { Trends } from './components/features/Trends';
import { motion, AnimatePresence } from 'framer-motion';
import { saveUserSkills } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [targetRole, setTargetRole] = useState('');
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState([]);

  const handleGenerateRoadmap = (role) => {
    setTargetRole(role);
    setActiveTab('roadmap');
  };

  const handleSkillsExtracted = async (extracted) => {
    const merged = Array.from(
      new Set([...(skills || []), ...(extracted || [])].map((s) => (s || '').trim().toLowerCase()).filter(Boolean))
    );

    setSkills(merged);

    if (email) {
      try {
        await saveUserSkills(email, merged);
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
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
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
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                  Welcome to Elevate AI
                </h1>
                <p className="text-saas-400 text-lg max-w-2xl">
                  Your AI-powered career co-pilot. Build your profile, discover perfect roles, and generate learning paths to get there.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="col-span-1 border border-saas-800 bg-saas-900/50 rounded-2xl p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">Fast-track with your resume</h3>
                  <p className="text-saas-400 mb-6 relative z-10">Upload a PDF resume to instantly build your skill profile and start getting matched immediately.</p>
                  <button 
                    onClick={() => setActiveTab('skills')}
                    className="relative z-10 text-primary-light font-medium hover:text-white transition-colors"
                  >
                    Go to Skill Profile &rarr;
                  </button>
                </div>
                
                <div className="col-span-1 border border-saas-800 bg-saas-900/50 rounded-2xl p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">Explore the Market</h3>
                  <p className="text-saas-400 mb-6 relative z-10">View real-time trends for top skills, role distributions, and salary trajectories across the industry.</p>
                  <button 
                    onClick={() => setActiveTab('trends')}
                    className="relative z-10 text-accent-light text-accent font-medium hover:text-white transition-colors"
                  >
                    View Market Trends &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-full text-center mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Build Your Profile</h1>
                <p className="text-saas-400">Tell us what you know, or let us parse it from your resume.</p>
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
              <SkillInput email={email} onEmailChange={setEmail} />
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="min-h-[60vh]">
              <Recommendations email={email} onGenerateRoadmap={handleGenerateRoadmap} />
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="min-h-[60vh]">
              <Roadmap role={targetRole} email={email} />
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
  );
}

export default App;

 