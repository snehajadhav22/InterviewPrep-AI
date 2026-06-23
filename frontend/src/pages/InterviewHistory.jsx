import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import Card from '../components/Card';
import Certificate from '../components/Certificate';
import { 
  History, 
  Award, 
  Calendar, 
  ChevronRight, 
  X, 
  BookOpen, 
  FileText,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const InterviewHistory = () => {
  const [searchParams] = useSearchParams();
  const directId = searchParams.get('id');

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // If a direct ID is provided in query params, open it automatically
    if (directId && sessions.length > 0) {
      const match = sessions.find(s => s.id === parseInt(directId));
      if (match && match.status === 'completed') {
        loadSessionDetails(match.id);
      }
    }
  }, [directId, sessions]);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/interviews/history');
      setSessions(res.data);
    } catch (err) {
      setError('Failed to fetch interview history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (id) => {
    setLoading(true);
    try {
      const res = await API.get(`/interviews/${id}`);
      setSelectedSession(res.data);
      setShowCertificate(false);
    } catch (err) {
      setError('Failed to fetch session details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionExpand = (qId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const closeDetails = () => {
    setSelectedSession(null);
    setShowCertificate(false);
    setExpandedQuestions({});
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800/40 rounded-xl w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-44 bg-slate-800/40 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      {!selectedSession && (
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Interview History</h2>
          <p className="text-sm text-slate-400 mt-1">Review all your previous AI mock sessions, results, and recommendations.</p>
        </div>
      )}

      {/* Main Panel grid */}
      {!selectedSession ? (
        sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <Card 
                key={session.id} 
                hover={true}
                className="flex flex-col justify-between border border-slate-850 bg-slate-900/10 cursor-pointer"
                onClick={() => loadSessionDetails(session.id)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-3 py-1 bg-blue-600/15 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                      {session.interview_type}
                    </div>
                    {session.status === 'completed' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {session.report?.overall_score || 'N/A'}/10
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{session.job_role}</h3>
                  
                  <div className="flex gap-4 text-xs text-slate-400 mb-6">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> 
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{session.experience_level}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-blue-400 font-semibold text-xs group">
                  <span>View Full Report</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card hover={false} className="py-16 text-center max-w-xl mx-auto space-y-6">
            <History className="w-16 h-16 text-slate-500 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-white">No history found</h3>
              <p className="text-sm text-slate-400 mt-2">You haven't completed any interviews yet. Complete your first session to see records here.</p>
            </div>
          </Card>
        )
      ) : (
        /* Report / Certificate View */
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-2xl font-extrabold text-white font-sans">{selectedSession.job_role}</h3>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                {selectedSession.interview_type} • {selectedSession.experience_level} • {new Date(selectedSession.created_at).toLocaleDateString()}
              </p>
            </div>
            <button 
              onClick={closeDetails} 
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {!showCertificate ? (
            /* Show Report */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary and Stats Sidebar */}
              <div className="space-y-6 lg:col-span-1">
                <Card hover={false} title="Performance Overview">
                  <div className="text-center py-6 border-b border-slate-800">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 font-extrabold text-3xl mb-3 shadow-lg shadow-emerald-500/5">
                      {selectedSession.report?.overall_score || '0.0'}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall score out of 10</p>
                  </div>

                  <div className="pt-6 space-y-4">
                    <button
                      onClick={() => setShowCertificate(true)}
                      disabled={!selectedSession.report}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 text-sm"
                    >
                      <Award className="w-4 h-4" /> View Certificate
                    </button>
                  </div>
                </Card>

                {selectedSession.report && (
                  <Card hover={false} title="AI Career Suggestions">
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                      {selectedSession.report.career_suggestions}
                    </p>
                  </Card>
                )}

                {selectedSession.report && (
                  <Card hover={false} title="Personal Learning Paths">
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                      {selectedSession.report.learning_recommendations}
                    </p>
                  </Card>
                )}
              </div>

              {/* Questions Transcript */}
              <div className="lg:col-span-2 space-y-6">
                <Card hover={false} title="Report Summary">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedSession.report?.summary || 'No overall report generated.'}
                  </p>
                </Card>

                <div className="space-y-4">
                  <h4 className="text-base font-bold text-white tracking-wide">Question Transcript & AI Feedback</h4>
                  {selectedSession.questions.map((q, idx) => (
                    <div key={q.id} className="glass-card rounded-2xl overflow-hidden border border-slate-850">
                      {/* Accordion Header */}
                      <div 
                        onClick={() => toggleQuestionExpand(q.id)}
                        className="p-4 md:p-5 flex justify-between items-center cursor-pointer hover:bg-slate-800/20 transition-all gap-4"
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Question {idx + 1}</p>
                          <h5 className="text-sm font-bold text-white mt-1 truncate max-w-xl">{q.question_text}</h5>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${q.score >= 8 ? 'bg-emerald-500/10 text-emerald-400' : q.score >= 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {q.score !== null ? `${q.score}/10` : 'Unanswered'}
                          </span>
                          {expandedQuestions[q.id] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Accordion Content */}
                      {expandedQuestions[q.id] && (
                        <div className="px-5 pb-5 pt-1 border-t border-slate-850/80 bg-slate-900/10 space-y-4">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Answer</p>
                            <p className="text-sm text-slate-300 bg-slate-900/50 border border-slate-850 p-3 rounded-xl whitespace-pre-line italic">
                              "{q.user_answer || 'No answer submitted.'}"
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Strengths</p>
                              <p className="text-xs text-slate-400 leading-relaxed bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                                {q.strengths || 'None.'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Weaknesses</p>
                              <p className="text-xs text-slate-400 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                                {q.weaknesses || 'None.'}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Better Model Answer</p>
                            <p className="text-xs text-slate-400 leading-relaxed bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                              {q.better_answer || 'N/A'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">AI Improvement Suggestions</p>
                            <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/30 border border-slate-850 p-3 rounded-xl">
                              {q.suggestions || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Show Certificate */
            <Certificate 
              userName={selectedSession.user?.name || 'Candidate'} 
              jobRole={selectedSession.job_role} 
              score={selectedSession.report?.overall_score || '0.0'} 
              date={selectedSession.created_at} 
              onBack={() => setShowCertificate(false)} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;
