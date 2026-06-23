import React, { useState, useEffect } from 'react';
import API from '../services/api';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { 
  Award, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  BarChart2,
  PieChart as PieIcon,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/analytics/overview');
      setData(res.data);
    } catch (err) {
      setError('Failed to fetch analytics metrics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-32 bg-slate-800/40 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800/40 rounded-2xl"></div>
          <div className="h-80 bg-slate-800/40 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const categoryPerformance = data?.category_performance || [];
  const scoreTrend = data?.score_trend || [];
  const scoreDistribution = data?.score_distribution || [];
  const weeklyProgress = data?.weekly_progress || [];

  // Cell colors for Pie chart
  const PIE_COLORS = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981'];

  // Safe Fallback mock data if none is generated yet
  const displayScoreTrend = scoreTrend.length > 0 ? scoreTrend : [
    { interview_num: 1, date: '2026-06-01', score: 6.0, role: 'Software Developer' },
    { interview_num: 2, date: '2026-06-05', score: 7.2, role: 'Software Developer' },
    { interview_num: 3, date: '2026-06-10', score: 8.5, role: 'Software Developer' }
  ];

  const displayCategoryPerformance = categoryPerformance.some(c => c.score > 0) 
    ? categoryPerformance 
    : [
        { subject: 'Python', score: 7.0 },
        { subject: 'DBMS', score: 6.5 },
        { subject: 'OOP', score: 8.0 },
        { subject: 'Operating System', score: 5.5 },
        { subject: 'Computer Networks', score: 6.0 },
        { subject: 'HR', score: 8.5 }
      ];

  const displayDistribution = scoreDistribution.some(c => c.count > 0)
    ? scoreDistribution
    : [
        { range: '0-4', count: 0 },
        { range: '5-6', count: 1 },
        { range: '7-8', count: 2 },
        { range: '9-10', count: 1 }
      ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Detailed Analytics</h2>
        <p className="text-sm text-slate-400 mt-1">Deconstruct your technical performance metrics, category scores, and weekly activity timelines.</p>
      </div>

      {/* Stats KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Interviews" value={data?.total_interviews || 0} icon={Calendar} color="blue" />
        <StatCard title="Average Score" value={`${data?.average_score || 0.0}/10`} icon={Award} color="green" />
        <StatCard title="Best Subject" value={data?.best_subject === 'N/A' ? 'N/A' : data?.best_subject.split(' ')[0]} trend={data?.best_subject.split('(')[1]?.replace(')', '') || 'N/A'} trendType="neutral" color="purple" />
        <StatCard title="Weakest Subject" value={data?.weakest_subject === 'N/A' ? 'N/A' : data?.weakest_subject.split(' ')[0]} trend={data?.weakest_subject.split('(')[1]?.replace(')', '') || 'N/A'} trendType="neutral" color="amber" />
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend over time */}
        <Card title="Score Improvement Timeline">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayScoreTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" domain={[0, 10]} fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 8 }} dot={{ strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Performance Radar Chart */}
        <Card title="Subject Category Breakdown">
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={displayCategoryPerformance}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#475569" fontSize={9} />
                <Radar name="Average Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score distribution cell */}
        <Card title="Score Band Distributions">
          <div className="h-72 flex items-center justify-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {displayDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-1/2 space-y-3 pl-4">
              {displayDistribution.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                  <div className="text-xs">
                    <span className="font-semibold text-white">{entry.range} Score: </span>
                    <span className="text-slate-400">{entry.count} interviews</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Weekly Progress bar Chart */}
        <Card title="Weekly Preparation Volume">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress.length > 0 ? weeklyProgress : [
                { week: 'Week 1', interviews: 1 },
                { week: 'Week 2', interviews: 2 },
                { week: 'Week 3', interviews: 1 },
                { week: 'Week 4', interviews: 3 }
              ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="interviews" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
