import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Card from '../components/Card';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Code2, 
  Briefcase, 
  TrendingUp, 
  Sparkles,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const fetchLatestResume = async () => {
    try {
      const res = await API.get('/resumes/latest');
      setResume(res.data);
    } catch (err) {
      console.log("No resume uploaded yet.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF format resumes are supported.');
      return;
    }

    setUploadLoading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/resumes/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResume(res.data);
      setSuccess('Resume analyzed successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while analyzing the resume.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Helper to color-code ATS scores
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/25';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/25';
    return 'bg-rose-500/10 border-rose-500/25';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800/40 rounded-xl w-48"></div>
        <div className="h-64 bg-slate-800/40 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Resume Analyzer</h2>
        <p className="text-sm text-slate-400 mt-1">Check your resume ATS friendliness, get missing skills highlights, and tailor mock questions.</p>
      </div>

      {/* Upload Box / Action section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card hover={false} title="Upload Resume">
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/20'
              }`}
            >
              {uploadLoading ? (
                <div className="py-12 space-y-4">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-semibold text-slate-300">Extracting text & evaluating with Gemini AI...</p>
                </div>
              ) : (
                <div className="py-8 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-750 flex items-center justify-center mx-auto text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Drag & drop resume</p>
                    <p className="text-[10px] text-slate-500 mt-1">PDF file format only (Max 10MB)</p>
                  </div>
                  
                  <label className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-blue-500/10">
                    Browse File
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[11px] text-emerald-300">{success}</p>
              </div>
            )}
          </Card>

          {resume && (
            <Card hover={false} className={`p-6 text-center ${getScoreBg(resume.ats_score)}`}>
              <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-slate-800 bg-slate-900 shadow-xl mb-4">
                <div className={`text-4xl font-extrabold ${getScoreColor(resume.ats_score)} font-sans`}>
                  {resume.ats_score}
                </div>
                <div className="absolute -bottom-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ATS Score
                </div>
              </div>
              
              <h3 className="text-base font-bold text-white">ATS Alignment Report</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {resume.ats_score >= 80 
                  ? 'Your resume is highly optimized for applicant scanners. Core keywords and parameters match standard targets.'
                  : resume.ats_score >= 60
                    ? 'Good foundation, but you are missing key industry jargon and formatting standards. See recommendations.'
                    : 'Critical issues detected. The ATS parser may drop your profile due to format incompatibilities.'}
              </p>
            </Card>
          )}
        </div>

        {/* Detailed Results */}
        <div className="lg:col-span-2 space-y-6">
          {resume ? (
            <>
              {/* Summary */}
              <Card hover={false} title="Professional Summary">
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{resume.summary}"
                </p>
              </Card>

              {/* Skills and roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card hover={false} title="Suggested Roles">
                  <div className="flex flex-wrap gap-2">
                    {resume.suggested_roles.map((role, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                        {role}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card hover={false} title="ATS Missing Keywords">
                  <div className="flex flex-wrap gap-2">
                    {resume.missing_skills.length > 0 ? (
                      resume.missing_skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-300 flex items-center gap-1.5"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No missing skills detected! Excellent job.</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card hover={false} title="Strength Highlights">
                  <ul className="space-y-3">
                    {resume.strengths.map((str, idx) => (
                      <li key={idx} className="flex gap-2.5 text-xs text-slate-400 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card hover={false} title="Improvement Suggestions">
                  <ul className="space-y-3">
                    {resume.improvements.map((imp, idx) => (
                      <li key={idx} className="flex gap-2.5 text-xs text-slate-400 leading-relaxed">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Suggested Interview Questions */}
              <Card hover={false} title="Suggested Mock Practice Questions">
                <div className="space-y-3">
                  {resume.suggested_questions.map((q, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-850 flex gap-3 items-start"
                    >
                      <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{q}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card hover={false} className="py-24 text-center space-y-6">
              <FileText className="w-16 h-16 text-slate-700 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">No analysis report available</h3>
                <p className="text-sm text-slate-400 mt-2">Upload your resume in the side panel to generate ATS alignment metrics.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
