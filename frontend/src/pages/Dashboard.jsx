import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { 
  Play, 
  Upload, 
  BarChart, 
  Award, 
  Calendar, 
  Zap, 
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart as ReBarChart, 
  Bar
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-32 bg-slate-800/40 rounded-2xl border border-slate-850"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-800/40 rounded-2xl border border-slate-850"></div>
          <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-850"></div>
        </div>
      </div>
    );
  }

  // Format Recharts data safely
  const recentActivity = stats?.recent_activity || [];
  
  // Format score trend for Recharts
  const scoreTrendData = recentActivity
    .filter(a => a.status === 'completed')
    .map((a, idx) => ({
      name: `Int ${idx + 1}`,
      score: a.score,
    }))
    .reverse();

  // Handle Mock chart data if no real trend is present
  const dummyTrendData = [
    { name: 'Int 1', score: 6.0 },
    { name: 'Int 2', score: 7.2 },
    { name: 'Int 3', score: 8.5 }
  ];

  const displayTrendData = scoreTrendData.length > 0 ? scoreTrendData : dummyTrendData;

  // Format dummy/real weekly progress data
  const dummyWeeklyData = [
    { week: 'Week 1', interviews: 1 },
    { week: 'Week 2', interviews: 2 },
    { week: 'Week 3', interviews: 1 },
    { week: 'Week 4', interviews: 3 }
  ];

  return (
    <div className="space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">Review your progress, launch mock tests, and analyze your resume.</p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/interview"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/25"
          >
            <Play className="w-4 h-4" /> Start Interview
          </Link>
          <Link
            to="/resume"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-semibold text-sm flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" /> Upload Resume
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Interviews"
          value={stats?.total_interviews || 0}
          icon={Calendar}
          trend="+2"
          trendType="up"
          color="blue"
        />
        <StatCard
          title="Average Score"
          value={`${stats?.average_score || 0.0}/10`}
          icon={Award}
          trend="+0.4"
          trendType="up"
          color="green"
        />
        <StatCard
          title="Best Subject"
          value={stats?.best_category === 'N/A' ? 'N/A' : stats?.best_category.split(' ')[0]}
          icon={TrendingUp}
          trend={stats?.best_category.split('(')[1]?.replace(')', '') || 'N/A'}
          trendType="neutral"
          color="purple"
        />
        <StatCard
          title="Weakest Subject"
          value={stats?.weakest_category === 'N/A' ? 'N/A' : stats?.weakest_category.split(' ')[0]}
          icon={AlertCircle}
          trend={stats?.weakest_category.split('(')[1]?.replace(')', '') || 'N/A'}
          trendType="neutral"
          color="amber"
        />
      </div>

      {/* Grid for Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress Chart & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance chart */}
          <Card title="Score Progression" className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} />
                  <YAxis stroke="#475569" domain={[0, 10]} fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Actions and Resume status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card title="Resume Optimization">
              {stats?.resume_status?.uploaded ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-white truncate">{stats.resume_status.filename}</p>
                      <p className="text-xs text-slate-400">ATS Optimization Score: <strong className="text-emerald-400">{stats.resume_status.ats_score}%</strong></p>
                    </div>
                  </div>
                  <Link to="/resume" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                    Re-analyze resume <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload your PDF resume to receive a detailed ATS scoring, identify missing skills, and get custom practice questions based on your background.
                  </p>
                  <Link
                    to="/resume"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-semibold text-xs rounded-xl inline-flex items-center gap-2 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload PDF Resume
                  </Link>
                </div>
              )}
            </Card>

            <Card title="Mock Practice">
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Launch interactive mock sessions evaluated live by Gemini. Select from core developer paths or standard behavior questions.
              </p>
              <Link
                to="/interview"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
              >
                <Play className="w-3.5 h-3.5" /> Start Practicing
              </Link>
            </Card>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <Card title="Recent Activity" className="h-full flex flex-col">
          {recentActivity.length > 0 ? (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[360px]">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  onClick={() => navigate(`/history?id=${activity.id}`)}
                  className="p-3 rounded-xl bg-slate-800/20 border border-slate-850 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="overflow-hidden pr-2">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{activity.job_role}</p>
                    <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                      <span className="capitalize">{activity.interview_type}</span>
                      <span>•</span>
                      <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    {activity.status === 'completed' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        {activity.score}/10
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <Zap className="w-8 h-8 text-slate-500 animate-bounce" />
              <div>
                <p className="text-sm font-semibold text-white">No interviews taken yet</p>
                <p className="text-xs text-slate-400 mt-1">Start your very first mock interview simulation to seed activity.</p>
              </div>
              <Link
                to="/interview"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10"
              >
                <Play className="w-3.5 h-3.5" /> Start Now
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Help helper
const ArrowRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

export default Dashboard;
