import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import Card from '../components/Card';
import Certificate from '../components/Certificate';
import { 
  Play, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  FileText,
  Award
} from 'lucide-react';

const InterviewSystem = () => {
  // Session Configuration State
  const [inSetup, setInSetup] = useState(true);
  const [jobRole, setJobRole] = useState('Software Developer');
  const [experienceLevel, setExperienceLevel] = useState('Entry-level');
  const [interviewType, setInterviewType] = useState('Technical');
  
  // Active Interview State
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [answer, setAnswer] = useState('');
  
  const [evaluation, setEvaluation] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [nextQuestionData, setNextQuestionData] = useState(null);

  // Final Report States
  const [report, setReport] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Voice States (Speech-to-Text & Text-to-Speech)
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Voice speaking defaults to muted for safety
  const recognitionRef = useRef(null);

  const roles = [
    'Software Developer',
    'Python Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst',
    'AI Engineer'
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setAnswer(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-To-Speech (AI speaks the question)
  const speakQuestion = (text) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Try Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setError('');
    try {
      // Sync candidate name from local storage user profile
      const localUser = JSON.parse(localStorage.getItem('user'));
      setCandidateName(localUser?.name || 'Candidate');

      const res = await API.post('/interviews/start', {
        job_role: jobRole,
        experience_level: experienceLevel,
        interview_type: interviewType
      });
      
      setSessionId(res.data.id);
      const firstQ = res.data.questions[0];
      setCurrentQuestion(firstQ);
      setQuestionIndex(1);
      setAnswer('');
      setEvaluation(null);
      setInSetup(false);
      
      // Speak first question
      setTimeout(() => {
        speakQuestion(firstQ.question_text);
      }, 500);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please provide an answer first.");
      return;
    }
    
    // Stop recording if listening
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setActionLoading(true);
    setError('');
    try {
      const res = await API.post(`/interviews/${sessionId}/answer`, {
        answer: answer
      });

      setEvaluation(res.data.evaluation);
      setHasNext(res.data.has_next);
      setNextQuestionData(res.data.next_question);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to evaluate answer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!nextQuestionData) return;
    
    setCurrentQuestion({
      id: nextQuestionData.id,
      question_text: nextQuestionData.question_text
    });
    setQuestionIndex(prev => prev + 1);
    setAnswer('');
    setEvaluation(null);
    setNextQuestionData(null);
    
    // Speak next question
    setTimeout(() => {
      speakQuestion(nextQuestionData.question_text);
    }, 500);
  };

  const handleGenerateReport = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await API.post(`/interviews/${sessionId}/complete`);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate summary report.');
    } finally {
      setActionLoading(false);
    }
  };

  const resetInterviewSession = () => {
    setInSetup(true);
    setSessionId(null);
    setCurrentQuestion(null);
    setAnswer('');
    setEvaluation(null);
    setReport(null);
    setShowCertificate(false);
    setQuestionIndex(1);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div>
          <h3 className="text-lg font-bold text-white">Configuring Interview Session</h3>
          <p className="text-sm text-slate-400 mt-1">Gemini AI is crafting specialized behavioral and coding questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Setup phase */}
      {inSetup && (
        <div className="max-w-xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans text-center">AI Mock Interview</h2>
            <p className="text-sm text-slate-400 mt-1 text-center">Set up your mock parameters to launch a real-time assessed simulation.</p>
          </div>

          <Card hover={false} className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                <select
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="Entry-level">Entry Level / Fresher</option>
                    <option value="Mid-level">Mid Level (2-5 Yrs)</option>
                    <option value="Senior">Senior Level (5+ Yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interview Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="Technical">Technical Domain</option>
                    <option value="HR">HR & Behavioral</option>
                    <option value="Mixed">Mixed (Tech + HR)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 mt-8"
              >
                <Play className="w-4 h-4" /> Initialize AI Assessment
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Live Question & Answer Screen */}
      {!inSetup && !report && currentQuestion && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header controls (TTS / STT alerts) */}
          <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-850 rounded-2xl">
            <div className="text-left">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Question {questionIndex} of 5</span>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">{jobRole} • {experienceLevel}</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const val = !isMuted;
                  setIsMuted(val);
                  if (!val) speakQuestion(currentQuestion.question_text);
                }} 
                className={`p-2 rounded-xl border transition-all ${isMuted ? 'border-slate-800 text-slate-500 bg-slate-900/50' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}
                title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Question display */}
          <Card hover={false} className="p-6 relative overflow-hidden">
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-relaxed">{currentQuestion.question_text}</h3>
              </div>
            </div>
          </Card>

          {/* Answer Input and microphone */}
          {!evaluation ? (
            <Card hover={false} title="Your Response">
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your detailed technical explanation here, or click the microphone to speak your answer..."
                    className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
                  />
                  
                  {/* Speech to text microphone button overlay */}
                  <button
                    onClick={toggleListening}
                    className={`absolute bottom-4 right-4 p-3 rounded-full flex items-center justify-center transition-all ${
                      isListening 
                        ? 'bg-rose-600 text-white voice-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={isListening ? "Stop Transcribing" : "Start Transcribing (Speak)"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-400">Provide clear code descriptions or architecture methodologies where applicable.</span>
                  
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={actionLoading || !answer.trim()}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 text-sm"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Response
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            /* Answer Evaluation Feedbacks */
            <div className="space-y-6 animate-fade-in">
              <Card hover={false} title="AI Assessment Feedback">
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-800 pb-5">
                  <div className="text-center shrink-0">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-2xl shadow-lg shadow-emerald-500/5 mb-1">
                      {evaluation.score}/10
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Answer Score</p>
                  </div>

                  <div className="space-y-2 text-left">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-200 block mb-0.5">Strengths:</strong>
                      {evaluation.strengths}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-200 block mb-0.5">Weaknesses:</strong>
                      {evaluation.weaknesses}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-5">
                  <div>
                    <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Better Model Answer</h5>
                    <p className="text-xs text-slate-400 leading-relaxed bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl whitespace-pre-line italic">
                      "{evaluation.better_answer}"
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Improvement suggestions</h5>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/30 border border-slate-850 p-3 rounded-xl">
                      {evaluation.suggestions}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Navigation triggers */}
              <div className="flex justify-end gap-4">
                {hasNext ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 text-sm"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateReport}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 text-sm"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Report...
                      </>
                    ) : (
                      <>
                        Generate Interview Report
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Report Screen */}
      {!inSetup && report && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-2xl font-extrabold text-white font-sans">Interview Performance Report</h3>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                Simulation Finished • {jobRole} • {experienceLevel}
              </p>
            </div>
            <button 
              onClick={resetInterviewSession} 
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition-colors"
            >
              Start New Interview
            </button>
          </div>

          {!showCertificate ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left stats column */}
              <div className="space-y-6 lg:col-span-1">
                <Card hover={false} title="Report Scorecard">
                  <div className="text-center py-6 border-b border-slate-800">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 font-extrabold text-3xl mb-3 shadow-lg shadow-emerald-500/5">
                      {report.overall_score}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average out of 10</p>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setShowCertificate(true)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 text-sm animate-pulse"
                    >
                      <Award className="w-4 h-4" /> View Certificate
                    </button>
                  </div>
                </Card>

                <Card hover={false} title="AI Career Suggestions">
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                    {report.career_suggestions}
                  </p>
                </Card>

                <Card hover={false} title="Learning Recommendations">
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                    {report.learning_recommendations}
                  </p>
                </Card>
              </div>

              {/* Detailed narrative card */}
              <div className="lg:col-span-2">
                <Card hover={false} title="Executive Summary">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {report.summary}
                  </p>
                </Card>
              </div>
            </div>
          ) : (
            <Certificate
              userName={candidateName}
              jobRole={jobRole}
              score={report.overall_score}
              date={new Date()}
              onBack={() => setShowCertificate(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewSystem;
