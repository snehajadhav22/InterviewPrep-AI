import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Sparkles, Mail, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await API.post('/auth/forgot-password', { email });
      setSuccess('A recovery email link has been simulated. Check your backend console logs!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full filter blur-[100px] opacity-15 bg-blue-500 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full filter blur-[100px] opacity-15 bg-indigo-500 pointer-events-none"></div>

      <div className="w-full max-w-md relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Reset Password</h2>
          <p className="text-sm text-slate-400 mt-2">Enter your email to receive recovery instructions.</p>
        </div>

        {/* Card */}
        <div className="glass-card-glow rounded-3xl p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Link Sent</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We have simulated sending a recovery email to <strong className="text-slate-200">{email}</strong>. In production, this would send a secure token link.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors pt-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                    required
                  />
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 mt-6"
              >
                {isSubmitting ? 'Sending Link...' : 'Send Recovery Link'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
