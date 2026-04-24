import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BarChart3, 
  Map, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Target, 
  Cpu,
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/useAuth.jsx';
import { cn } from '../lib/utils';

export function Landing() {
  const auth = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await auth.sendLoginOtp(email);
    setLoading(false);
    if (res.ok) {
      setStep('otp');
      setSuccess('OTP sent! Check your email.');
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(res.error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await auth.verifyLoginOtp(email, otp);
    setLoading(false);
    if (res.ok) {
      setSuccess('Verified! Logging you in...');
      setTimeout(() => {
        setShowLoginModal(false);
      }, 500);
    } else {
      setError(res.error);
    }
  };

  const features = [
    {
      title: "AI Resume Parsing",
      desc: "Upload your PDF and let our spaCy NLP engine extract your core skills automatically.",
      icon: <Cpu className="w-6 h-6" />,
      color: "text-primary-light"
    },
    {
      title: "Live Market Trends",
      desc: "Real-time analytics on top skills, role distribution, and salary growth from live APIs.",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "text-accent-light"
    },
    {
      title: "Learning Roadmaps",
      desc: "Personalized step-by-step guides to bridge your skill gaps for any target role.",
      icon: <Map className="w-6 h-6" />,
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="min-h-screen bg-saas-950 text-white selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 border-b border-saas-800 bg-saas-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Elevate AI</span>
          </div>
          <button 
            onClick={() => setShowLoginModal(true)}
            className="px-5 py-2 rounded-full bg-saas-900 border border-saas-800 text-sm font-semibold hover:bg-saas-800 transition-all"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/20 blur-[120px] -z-10 rounded-full" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent/10 blur-[100px] -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3 h-3" />
            Empowering 10,000+ Careers
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight"
          >
            Master Your Career with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-accent-light to-emerald-400">
              Intelligence
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-saas-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            The all-in-one AI platform to parse your skills, track live job market trends, 
            and build personalized roadmaps to your dream role.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-light shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-xl bg-saas-900 border border-saas-800 text-saas-100 font-bold text-lg hover:bg-saas-800 transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-8 rounded-2xl border border-saas-800 bg-saas-900/40 backdrop-blur-sm group hover:border-saas-600 transition-all"
            >
              <div className={cn("p-3 rounded-xl bg-saas-800 w-fit mb-6 group-hover:scale-110 transition-transform", f.color)}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-saas-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-saas-800 mt-20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Elevate AI</span>
          </div>
          <p className="text-saas-500 text-sm">
            © 2026 Elevate AI. All rights reserved. Built for modern careers.
          </p>
          <div className="flex gap-6 text-saas-400 text-sm">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Support</a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-saas-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-saas-900 border border-saas-800 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-2 text-saas-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-light">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-saas-400 text-sm mt-1">Sign in to access your career dashboard</p>
              </div>

              <div className="space-y-6">
                {/* Google Login */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={(cred) => auth.loginWithGoogleCredential(cred.credential)}
                    onError={() => setError("Google login failed")}
                    theme="filled_black"
                    width="100%"
                    shape="pill"
                  />
                </div>

                <div className="relative flex items-center gap-4 text-saas-600 uppercase text-[10px] font-bold tracking-widest">
                  <div className="h-px flex-1 bg-saas-800" />
                  Or Email
                  <div className="h-px flex-1 bg-saas-800" />
                </div>

                {/* Email OTP Flow */}
                <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-4">
                  {step === 'email' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-saas-400 uppercase tracking-wide">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saas-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full bg-saas-950 border border-saas-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-saas-400 uppercase tracking-wide">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        className="w-full bg-saas-950 border border-saas-700 rounded-xl py-3 px-4 text-center text-2xl font-mono tracking-[0.5em] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setStep('email')}
                        className="text-xs text-primary-light hover:underline"
                      >
                        Change email
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      step === 'email' ? 'Send Code' : 'Verify & Login'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
