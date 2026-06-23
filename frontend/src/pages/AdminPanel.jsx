import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Activity, 
  ShieldAlert, 
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';

const AdminPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load administrative statistics.');
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
        <div className="h-96 bg-slate-800/40 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card hover={false} className="py-16 text-center max-w-xl mx-auto space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-lg font-bold text-white">Access Denied / Error</h3>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
        </div>
      </Card>
    );
  }

  const stats = data?.stats || {};
  const users = data?.users || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Admin Panel</h2>
        <p className="text-sm text-slate-400 mt-1">Monitor global application statistics, candidate activity, and database records.</p>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="sm:col-span-1">
          <StatCard title="Total Users" value={stats.total_users || 0} icon={Users} color="blue" />
        </div>
        <div className="sm:col-span-1">
          <StatCard title="Mock Interviews" value={stats.total_interviews || 0} icon={BookOpen} color="green" />
        </div>
        <div className="sm:col-span-1">
          <StatCard title="Active Users" value={stats.active_users || 0} icon={Activity} color="purple" />
        </div>
        <div className="sm:col-span-1">
          <StatCard title="Resumes Uploaded" value={stats.total_resumes || 0} icon={FileText} color="amber" />
        </div>
        <div className="sm:col-span-1">
          <StatCard title="Global Score Avg" value={`${stats.system_avg_score || 0.0}/10`} icon={Calendar} color="blue" />
        </div>
      </div>

      {/* User Management List */}
      <Card hover={false} title="Registered Candidates & Performance Summary">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Target Job Role</th>
                <th className="px-6 py-4">Interviews Taken</th>
                <th className="px-6 py-4">ATS Match</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/10 transition-colors text-sm text-slate-300">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-200">{u.target_role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white px-2.5 py-1 rounded-lg bg-slate-800/40 text-xs">
                      {u.interviews_count} Completed
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.ats_score !== null ? (
                      <span className="font-bold text-emerald-400 text-xs">
                        {u.ats_score}% Match
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs italic">No Resume</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        Candidate
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;
