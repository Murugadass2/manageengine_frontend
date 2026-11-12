import React, { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import { DashboardMetrics } from '../types';
import { Download, BarChart3, PieChart as PieIcon, ShieldCheck, CheckCircle2, Inbox } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getDashboard();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = reportsApi.exportTicketsUrl();
  };

  const COLORS = ['#D4AF37', '#1C2541', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with Export (Matching Mockup Panel 9: Reports & Analytics) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">
            Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational service velocity, departmental volume distribution, and SLA adherence trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 text-xs font-semibold rounded-xl text-slate-700 shadow-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar (Matching Mockup Panel 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Total Tickets</div>
            <div className="text-2xl font-bold font-mono text-navy-950 mt-0.5">
              {metrics?.summary.totalTickets.toLocaleString() || '1,248'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Resolved</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">
              {metrics?.summary.resolvedTickets.toLocaleString() || '612'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-50 text-gold-600 border border-gold-200 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">SLA Compliance</div>
            <div className="text-2xl font-bold font-mono text-navy-950 mt-0.5">
              {metrics?.summary.slaCompliance || '96.5'}%
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid (Matching Mockup Panel 9: Ticket Overview + By Department) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Overview Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gold-600" />
            <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">Ticket Overview</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.ticketTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#1C2541',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" fill="#1C2541" radius={[4, 4, 0, 0]} name="Raised" />
                <Bar dataKey="resolved" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Department Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-4 h-4 text-gold-600" />
            <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">By Department</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.departmentPerformance.slice(0, 5) || []}
                  dataKey="ticketCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {metrics?.departmentPerformance.slice(0, 5).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#1C2541',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  layout="horizontal"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
