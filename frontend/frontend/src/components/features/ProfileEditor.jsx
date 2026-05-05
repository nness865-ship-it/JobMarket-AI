import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, TrendingUp, DollarSign, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updateUserProfile, me } from '../../services/api';

const POSITION_LEVELS = ['Entry', 'Mid-Level', 'Senior', 'Lead', 'Manager', 'Director', 'Executive'];

const JOB_DOMAINS = [
  'Computer Science & Technology',
  'Engineering',
  'Medical & Healthcare',
  'Business & Commerce',
  'Science & Research',
  'Arts & Design',
  'Education',
  'Agriculture & Environmental',
  'Psychology & Social Sciences',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Human Resources',
  'Legal',
  'Other'
];

export function ProfileEditor({ email, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    current_job_role: '',
    job_domain: '',
    position_level: '',
    current_salary: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!email) return;
      
      // Check if this is a guest user
      if (email.includes('@elevateai.guest')) {
        // Load from localStorage for guest users
        const savedProfile = localStorage.getItem('guest_profile_data');
        if (savedProfile) {
          try {
            const profileData = JSON.parse(savedProfile);
            setFormData({
              current_job_role: profileData.current_job_role || '',
              job_domain: profileData.job_domain || '',
              position_level: profileData.position_level || '',
              current_salary: profileData.current_salary || ''
            });
            setIsEditing(false);
            console.log('👤 Restored profile data for guest user');
          } catch (error) {
            console.error('Failed to load guest profile data:', error);
          }
        }
        return;
      }
      
      // Load from API for authenticated users
      try {
        const response = await me();
        const user = response.data?.user;
        if (user?.current_job_role) {
          setFormData({
            current_job_role: user.current_job_role || '',
            job_domain: user.job_domain || '',
            position_level: user.position_level || '',
            current_salary: user.current_salary || ''
          });
          setIsEditing(false);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    setError('');
    
    // Auto-save for guest users
    if (email && email.includes('@elevateai.guest')) {
      const profileData = {
        current_job_role: newFormData.current_job_role,
        job_domain: newFormData.job_domain,
        position_level: newFormData.position_level,
        current_salary: newFormData.current_salary,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('guest_profile_data', JSON.stringify(profileData));
    }
  };

  const validateForm = () => {
    if (!formData.current_job_role.trim()) {
      setError('Current job role is required');
      return false;
    }
    if (!formData.job_domain) {
      setError('Job domain is required');
      return false;
    }
    if (!formData.position_level) {
      setError('Position level is required');
      return false;
    }
    if (formData.current_salary && isNaN(parseInt(formData.current_salary))) {
      setError('Salary must be a valid number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        email,
        current_job_role: formData.current_job_role.trim(),
        job_domain: formData.job_domain,
        position_level: formData.position_level,
        current_salary: formData.current_salary ? parseInt(formData.current_salary) : 0
      };

      // Handle guest users
      if (email.includes('@elevateai.guest')) {
        // Save to localStorage for guest users
        const profileData = {
          current_job_role: payload.current_job_role,
          job_domain: payload.job_domain,
          position_level: payload.position_level,
          current_salary: payload.current_salary,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('guest_profile_data', JSON.stringify(profileData));
        
        setSuccess('Profile saved locally! 🎉');
        setIsEditing(false);
        
        if (onProfileUpdate) {
          onProfileUpdate(profileData);
        }
        
        console.log('💾 Saved profile data for guest user');
        setTimeout(() => setSuccess(''), 3000);
        return;
      }

      // Handle authenticated users - save to backend
      const response = await updateUserProfile(payload);
      
      setSuccess('Profile updated successfully! 🎉');
      setIsEditing(false);
      
      if (onProfileUpdate) {
        onProfileUpdate(response.data?.profile);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = formData.current_job_role && formData.job_domain && formData.position_level;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            Professional Profile
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isProfileComplete 
              ? '✓ Your profile is complete and will personalize all recommendations'
              : 'Complete your profile to get domain-specific career guidance'}
          </p>
        </div>
        {isProfileComplete && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg transition-colors text-sm font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-200 text-sm">{success}</p>
        </div>
      )}

      {isEditing || !isProfileComplete ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Job Role */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Current Job Role
            </label>
            <input
              type="text"
              name="current_job_role"
              value={formData.current_job_role}
              onChange={handleChange}
              placeholder="e.g., Marketing Executive, Software Engineer, Financial Analyst"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Your current job title or role</p>
          </div>

          {/* Job Domain */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Job Domain
            </label>
            <select
              name="job_domain"
              value={formData.job_domain}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select your domain...</option>
              {JOB_DOMAINS.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">The industry or field you work in</p>
          </div>

          {/* Position Level */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Position Level
            </label>
            <select
              name="position_level"
              value={formData.position_level}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select your level...</option>
              {POSITION_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Your current career level</p>
          </div>

          {/* Current Salary */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Current Salary (Optional)
            </label>
            <input
              type="number"
              name="current_salary"
              value={formData.current_salary}
              onChange={handleChange}
              placeholder="e.g., 75000"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Used to calculate salary progression and growth potential</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-lg">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Current Role</p>
            <p className="text-lg font-semibold text-slate-50 mt-1">{formData.current_job_role}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Domain</p>
            <p className="text-lg font-semibold text-slate-50 mt-1">{formData.job_domain}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Position Level</p>
            <p className="text-lg font-semibold text-slate-50 mt-1">{formData.position_level}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Current Salary</p>
            <p className="text-lg font-semibold text-slate-50 mt-1">
              {formData.current_salary ? `$${parseInt(formData.current_salary).toLocaleString()}` : 'Not specified'}
            </p>
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <p className="text-sm text-blue-200">
          <strong>💡 Tip:</strong> Your profile information helps us generate domain-specific career pathways, salary progression estimates, and relevant job recommendations tailored to your industry.
        </p>
      </div>
    </div>
  );
}
