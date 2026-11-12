import React, { useState, useEffect } from 'react';
import { approvalsApi } from '../services/api';
import { Approval } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckCheck, Check, X, Clock, FileText, AlertCircle, ShieldCheck } from 'lucide-react';

export const ApprovalWorkflowPage: React.FC = () => {
  const { role } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [loading, setLoading] = useState(true);

  // Process Modal
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [decisionAction, setDecisionAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadApprovals();
  }, [activeTab]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await approvalsApi.getAll(activeTab);
      setApprovals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (approval: Approval, action: 'APPROVED' | 'REJECTED') => {
    setSelectedApproval(approval);
    setDecisionAction(action);
    setReason(action === 'APPROVED' ? 'Approved by hotel operational management' : 'Exceeds current operational quota');
  };

  const submitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    try {
      await approvalsApi.process(selectedApproval.id, decisionAction, reason);
      setSelectedApproval(null);
      loadApprovals();
    } catch (e) {
      alert('Failed to process approval');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">
            Approval Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational expenditure, emergency parts procurement, and specialized maintenance approvals
          </p>
        </div>
      </div>

      {/* Tabs Row (Matching Mockup Panel 12: Approvals) */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'border-gold-500 text-navy-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Pending Approvals</span>
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'APPROVED'
              ? 'border-gold-500 text-navy-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Approved</span>
        </button>
        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'REJECTED'
              ? 'border-gold-500 text-navy-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <X className="w-3.5 h-3.5 text-rose-500" />
          <span>Rejected</span>
        </button>
      </div>

      {/* Approvals Cards / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading approval requests...</div>
        ) : approvals.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No {activeTab.toLowerCase()} approval requests found.
          </div>
        ) : (
          approvals.map((req) => (
            <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-navy-950">{req.requestNo}</span>
                  {req.amount && (
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-gold-50 text-gold-700 border border-gold-200">
                      ₹{req.amount.toLocaleString()}
                    </span>
                  )}
                  {req.ticket && (
                    <span className="text-[11px] text-slate-500">
                      Linked Ticket: <span className="font-mono font-semibold">{req.ticket.ticketNumber}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                <p className="text-xs text-slate-600">{req.description}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Requested by <span className="font-semibold text-slate-700">{req.requester.name}</span> ({req.requester.employeeCode}) on{' '}
                  {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {req.reason && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                    <span className="font-semibold text-slate-700">Remarks:</span> {req.reason}
                  </div>
                )}
              </div>

              {/* Action Buttons (Matching Mockup Panel 12) */}
              {req.status === 'PENDING' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDecision(req, 'APPROVED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleDecision(req, 'REJECTED')}
                    className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Decision Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className={`text-sm font-bold mb-1 ${decisionAction === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {decisionAction === 'APPROVED' ? 'Approve Request' : 'Reject Request'}: {selectedApproval.requestNo}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedApproval.title}</p>
            <form onSubmit={submitDecision} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manager Remarks / Reason
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApproval(null)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 font-bold text-xs rounded-lg text-white ${
                    decisionAction === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {decisionAction}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
