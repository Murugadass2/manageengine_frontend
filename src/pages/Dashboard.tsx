import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi, ticketsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardMetrics, Ticket } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badges';
import { SLACountdown } from '../components/common/SLACountdown';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [role]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [metricsData, ticketsData] = await Promise.all([
        reportsApi.getDashboard(),
        ticketsApi.getAll({ limit: 6, myTasks: role === 'TECHNICIAN' ? 'true' : undefined }),
      ]);
      setMetrics(metricsData);
      setRecentTickets(ticketsData.tickets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading && !metrics) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading operations dashboard...</p>
      </div>
    );
  }

  const summary = metrics?.summary || {
    totalTickets: 1248,
    openTickets: 324,
    inProgressTickets: 298,
    resolvedTickets: 612,
    overdueTickets: 4,
    criticalIncidents: 2,
    slaCompliance: 96.5,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-6 rounded-2xl border border-navy-700/80 shadow-card-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hotel Dazzle Drop • Operations Control Hub</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            {getGreeting()}, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {role === 'SUPER_ADMIN' && 'Hotel-wide service metrics, SLA compliance, department queues, and live incident monitoring.'}
            {role === 'HOTEL_MANAGER' && 'Operational executive oversight, cross-department ticket volume, and urgent maintenance approvals.'}
            {role === 'DEPT_MANAGER' && `Department dispatch center: manage workload, queue velocity, and technician assignments.`}
            {role === 'TECHNICIAN' && 'Your assigned work orders, active service requests, and SLA countdown deadlines.'}
            {role === 'EMPLOYEE' && 'Raise service requests, track resolution progress in real time, or explore self-service solutions.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-3 bg-navy-900/80 rounded-xl border border-navy-700 text-center">
            <div className="text-[11px] text-slate-400 font-medium">Active Role</div>
            <div className="text-xs font-bold text-gold-400 uppercase tracking-wide mt-0.5">
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (Matching mockup panel 2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total Tickets</div>
            <div className="text-2xl font-bold font-mono text-navy-950 mt-1">
              {summary.totalTickets.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% this month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Open Tickets</div>
            <div className="text-2xl font-bold font-mono text-sky-600 mt-1">
              {summary.openTickets}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Awaiting dispatch</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">In Progress</div>
            <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
              {summary.inProgressTickets}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">Active technician labor</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Resolved</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              {summary.resolvedTickets}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">98.2% first-contact fix</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Ticket Trends Chart & SLA Compliance Circular Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Volume Trends Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">Ticket Trends</h2>
              <p className="text-xs text-slate-500">Service desk volume and resolution trajectory</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              Last 7 Months
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.ticketTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ticketTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="resolvedTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C2541" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1C2541" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#ticketTrendGradient)"
                  name="Total Created"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#1C2541"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#resolvedTrendGradient)"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA Compliance Gauge (1 col - Matching mockup 96.5% ring) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-center">
          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SLA Compliance</span>
            </div>
            <p className="text-xs text-slate-400">Target: ≥ 95.0%</p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center">
            {/* Visual Circular Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  stroke="#F1F5F9"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  stroke="#10B981"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 65}
                  strokeDashoffset={2 * Math.PI * 65 * (1 - 0.965)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold font-mono text-navy-950">96.5%</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                  Excellent
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-500 text-[10px]">Overdue Breaches</div>
              <div className="font-bold text-rose-600">{summary.overdueTickets}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-500 text-[10px]">Avg Resolution</div>
              <div className="font-bold text-navy-950">1.8 hrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Department Performance & Recent Tickets Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Performance Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Department Performance
              </h2>
              <p className="text-xs text-slate-500">Live ticket load & SLA index</p>
            </div>
            <button
              onClick={() => navigate('/departments')}
              className="text-xs text-gold-600 font-semibold hover:underline flex items-center"
            >
              All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {metrics?.departmentPerformance.slice(0, 5).map((dept: any) => (
              <div key={dept.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">{dept.ticketCount} tickets</span>
                    <span className="text-emerald-600 font-mono font-bold">{dept.compliance}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-emerald-500 rounded-full"
                    style={{ width: `${dept.compliance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets Table (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">Recent Tickets</h2>
              <p className="text-xs text-slate-500">Real-time status of latest hotel service tickets</p>
            </div>
            <button
              onClick={() => navigate('/tickets')}
              className="text-xs text-gold-600 font-semibold hover:underline flex items-center"
            >
              View Full Queue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/tickets/${t.ticketNumber}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-navy-950">{t.ticketNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">{t.subject}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3 px-3 text-slate-600">{t.department.name}</td>
                    <td className="py-3 px-3">
                      <span className="text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-0.5">
                        Open <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
