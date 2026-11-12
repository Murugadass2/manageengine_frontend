import React, { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import { AuditLog } from '../types';
import { ScrollText, Filter, Calendar, Shield, User } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditApi.getAll({ action: actionFilter !== 'ALL' ? actionFilter : undefined });
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable compliance journal recording security authentications, state transitions, and administrative activities
        </p>
      </div>

      {/* Filter Row (Matching Mockup Panel 14: Audit Logs) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg text-slate-700"
        >
          <option value="ALL">All Actions</option>
          <option value="TICKET_CREATED">Ticket Created</option>
          <option value="TICKET_ASSIGNED">Ticket Assigned</option>
          <option value="STATUS_CHANGED">Status Changed</option>
          <option value="APPROVAL_GRANTED">Approval Granted</option>
          <option value="USER_LOGIN">User Login</option>
        </select>
        <div className="text-xs text-slate-400 font-mono">
          Showing real-time audit ledger
        </div>
      </div>

      {/* Audit Logs Table (Matching Mockup Panel 14) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">User</th>
                <th className="py-3 px-4 font-bold">Action</th>
                <th className="py-3 px-4 font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })},{' '}
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                    {log.user ? log.user.name : 'System Auto-Engine'}
                    {log.user && (
                      <span className="block text-[10px] text-slate-400 font-normal">{log.user.role}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-lg leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
