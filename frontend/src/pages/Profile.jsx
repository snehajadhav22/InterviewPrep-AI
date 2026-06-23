import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import API from '../services/api';
import Card from '../components/Card';
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Lock, 
  Upload, 
  CheckCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [password, setPassword] = useState('');
  
  const [resumeData, setResumeData] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    'Software Developer',
    'Python Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst',
    'AI Engineer'
  ];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setTargetRole(user.target_role || 'Software Developer');
      setEducation(user.education || '');
      setSkills(user.skills || '');
    }
    fetchLatestResume();
  }, [user]);

  const fetchLatestResume = async () => {
    try {
      const res = await API.get('/resumes/latest');
      setResumeData(res.data);
    } catch (err) {
      // It's normal to get 404 if no resume is uploaded yet
      console.log("No resume found");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      await updateProfile({
        name,
        email,
        target_role: targetRole,
        education,
        skills,
        password: password || undefined
      });
      setProfileSuccess('Profile updated successfully!');
      setPassword(''); // Clear password field
    } catch (err) {
      setProfileError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF format is supported.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/resumes/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResumeData(res.data);
      setUploadSuccess('Resume uploaded and analyzed successfully! Your profile has been updated with suggested skills.');
      // Update local context variables since backend updates them in background
      if (res.data.missing_skills) {
        setSkills(prev => prev ? prev : res.data.strengths.slice(0, 5).join(', '));
      }
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload and analyze resume.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">User Profile</h2>
        <p className="text-sm text-slate-400 mt-1">Manage your credentials, career preferences, and resume analyzer data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Editing Form */}
        <div className="lg:col-span-2">
          <Card hover={false} title="Profile Credentials">
            {profileSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300">{profileSuccess}</p>
              </div>
            )}

            {profileError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{profileError}</p>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                      required
                    />
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                      required
                    />
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                  <div className="relative">
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-all text-sm appearance-none"
                    >
                      {roles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Education Background</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                    />
                    <GraduationCap className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma Separated)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                  />
                  <Code2 className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password (Leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                  />
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm"
              >
                {isSubmitting ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </Card>
        </div>

        {/* Resume Info & Upload */}
        <div className="space-y-6">
          <Card hover={false} title="Active Resume Info">
            {uploadSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[11px] text-emerald-300 leading-relaxed">{uploadSuccess}</p>
              </div>
            )}

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-[11px] text-rose-300 leading-relaxed">{uploadError}</p>
              </div>
            )}

            {resumeData ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-850 flex items-center gap-3">
                  <FileText className="w-10 h-10 text-blue-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{resumeData.filename}</p>
                    <p className="text-[10px] text-slate-400">Analyzed on {new Date(resumeData.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">ATS Match Score</span>
                  <span className="text-sm font-bold text-emerald-400">{resumeData.ats_score}%</span>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resume Summary</p>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {resumeData.summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-white">No Resume Uploaded</p>
                  <p className="text-[10px] text-slate-400 mt-1">Upload a PDF resume to enable ATS evaluation.</p>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploadLoading ? 'Uploading & Analyzing...' : 'Upload PDF Resume'}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={uploadLoading}
                />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
