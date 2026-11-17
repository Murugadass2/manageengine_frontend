import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsApi, departmentsApi } from '../services/api';
import { Ticket, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { SLACountdown } from '../components/common/SLACountdown';
import { StatusBadge, PriorityBadge } from '../components/common/Badges';
import {
  ArrowLeft,
  User,
  Wrench,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Send,
  Lock,
  MessageSquare,
  FileText,
  Activity,
  Paperclip,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Star,
  Sparkles,
  Layers,
} from 'lucide-react';

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'comments' | 'worklogs' | 'attachments'>('details');

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Work log modal/input
  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [workHours, setWorkHours] = useState('1.5');
  const [workDesc, setWorkDesc] = useState('');

  // Resolve modal
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('Repaired and verified optimal performance.');

  // Close rating modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [starRating, setStarRating] = useState(5);
  const [closeFeedback, setCloseFeedback] = useState('Prompt service, problem fully resolved.');

  // Reassign modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  const loadTicket = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ticketsApi.getById(id);
      setTicket(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string, remarks?: string) => {
    if (!ticket) return;
    try {
      const updated = await ticketsApi.updateStatus(ticket.id, newStatus, remarks);
      setTicket({ ...ticket, ...updated });
      loadTicket();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignmentAction = async (action: 'ACCEPT' | 'REJECT') => {
    if (!ticket) return;
    try {
      const reason = action === 'REJECT' ? prompt('Reason for rejecting ticket assignment:') : undefined;
      if (action === 'REJECT' && !reason) return;

      const updated = await ticketsApi.handleAssignment(ticket.id, action, reason || undefined);
      setTicket({ ...ticket, ...updated });
      loadTicket();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await ticketsApi.addComment(ticket.id, commentText.trim(), isInternalNote);
      setCommentText('');
      loadTicket();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddWorkLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !workHours || !workDesc) return;

    try {
      await ticketsApi.addWorkLog(ticket.id, parseFloat(workHours), workDesc);
      setShowWorkLogModal(false);
      setWorkDesc('');
      loadTicket();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    try {
      await ticketsApi.updateStatus(ticket.id, 'RESOLVED', resolveNotes);
      setShowResolveModal(false);
      loadTicket();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    try {
      await ticketsApi.close(ticket.id, starRating, closeFeedback);
      setShowCloseModal(false);
      loadTicket();
    } catch (e) {
      console.error(e);
    }
  };

  const openAssignModal = async () => {
    if (!ticket) return;
    setShowAssignModal(true);
    try {
      const techs = await departmentsApi.getTechnicians(ticket.departmentId);
      setTechnicians(techs);
      if (techs.length > 0) setSelectedTechId(techs[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !selectedTechId) return;

    try {
      await ticketsApi.assign(ticket.id, selectedTechId, reassignReason);
      setShowAssignModal(false);
      setReassignReason('');
      loadTicket();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading ticket dossier...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold text-rose-600">Ticket not found or unauthorized access.</p>
        <button
          onClick={() => navigate('/tickets')}
          className="mt-4 px-4 py-2 bg-navy-900 text-white rounded-lg text-xs"
        >
          Return to Ticket Queue
        </button>
      </div>
    );
  }

  const isDepartmentTeamMember =
    role === 'TECHNICIAN' ||
    (role === 'EMPLOYEE' && user?.departmentId === ticket.departmentId);
  const isAssignedTeamMember =
    isDepartmentTeamMember && user?.id === ticket.assignedTechnicianId;
  const canAcceptTicket =
    isDepartmentTeamMember &&
    user?.departmentId === ticket.departmentId &&
    (!ticket.assignedTechnicianId || ticket.assignedTechnicianId === user.id) &&
    ['NEW', 'OPEN', 'ASSIGNED'].includes(ticket.status);
  const isResolvedOrClosed = ['RESOLVED', 'CLOSED', 'CANCELLED'].includes(ticket.status);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tickets')}
            className="p-2 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition-colors"
            title="Back to Tickets"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-navy-950">{ticket.ticketNumber}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-base font-bold text-slate-800 mt-0.5">{ticket.subject}</h1>
          </div>
        </div>

        {/* Dynamic Workflow Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Technician Acceptance */}
          {canAcceptTicket && (
            <button
              onClick={() => handleAssignmentAction('ACCEPT')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accept Ticket</span>
            </button>
          )}
          {isAssignedTeamMember && ticket.status === 'ASSIGNED' && (
              <button
                onClick={() => handleAssignmentAction('REJECT')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
          )}

          {/* In Progress */}
          {isAssignedTeamMember && ticket.status === 'ACCEPTED' && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-navy-950 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Commence Work (In Progress)</span>
            </button>
          )}

          {/* Log Work */}
          {isAssignedTeamMember && ticket.status === 'IN_PROGRESS' && (
            <button
              onClick={() => setShowWorkLogModal(true)}
              className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              <span>Log Work Hours</span>
            </button>
          )}

          {/* Mark Resolved */}
          {isAssignedTeamMember && ticket.status === 'IN_PROGRESS' && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}

          {/* Confirm & Close (Requester confirmation) */}
          {ticket.status === 'RESOLVED' && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="px-4 py-1.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 text-xs font-bold rounded-lg shadow-gold-glow transition-all flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-navy-950" />
              <span>Confirm & Close Ticket</span>
            </button>
          )}

          {/* Reopen */}
          {ticket.status === 'RESOLVED' && (
            <button
              onClick={() => handleStatusChange('REOPENED', 'Requester reported issue still unresolved.')}
              className="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen</span>
            </button>
          )}

          {/* Reassign (Manager / Admin) */}
          {role !== 'EMPLOYEE' && (
            <button
              onClick={openAssignModal}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Reassign
            </button>
          )}
        </div>
      </div>

      {/* Overview Info Cards & Live SLA Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Requester Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Requester</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">{ticket.requester?.name}</div>
            <div className="text-[11px] text-slate-500">{ticket.requester?.employeeCode} • {ticket.requester?.phone || 'Hotel Staff'}</div>
          </div>
        </div>

        {/* Assigned Technician Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold-50 text-gold-600 border border-gold-200 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Assigned To</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {ticket.assignedTechnician ? ticket.assignedTechnician.name : 'Unassigned'}
            </div>
            <div className="text-[11px] text-slate-500">
              {ticket.assignedTechnician ? ticket.assignedTechnician.employeeCode : 'Awaiting dispatch'}
            </div>
          </div>
        </div>

        {/* Department & Location */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Department & Location</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">{ticket.department?.name}</div>
            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>{ticket.location || 'All Hotel Areas'}</span>
            </div>
          </div>
        </div>

        {/* SLA Due & Countdown Timer */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">SLA Resolution Due</span>
            <span className="text-[11px] font-semibold text-slate-700">
              {new Date(ticket.resolutionDueAt).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
              {new Date(ticket.resolutionDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <SLACountdown
            targetDate={ticket.resolutionDueAt}
            isResolved={isResolvedOrClosed}
            resolvedAt={ticket.resolvedAt}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 pt-3 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-gold-500 text-navy-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Details</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'activity'
                ? 'border-gold-500 text-navy-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity History ({ticket.history?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'comments'
                ? 'border-gold-500 text-navy-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comments & Notes ({ticket.comments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('worklogs')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'worklogs'
                ? 'border-gold-500 text-navy-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Work Logs ({ticket.workLogs?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'attachments'
                ? 'border-gold-500 text-navy-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Attachments</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                  {ticket.description}
                </div>
              </div>

              {ticket.resolutionNotes && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Resolution Summary</span>
                  </div>
                  <p className="text-xs text-emerald-800">{ticket.resolutionNotes}</p>
                </div>
              )}

              {ticket.feedback && (
                <div className="p-4 bg-amber-50 border border-gold-300 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-navy-950">Requester Satisfaction Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (ticket.satisfactionRating || 5)
                              ? 'text-gold-500 fill-gold-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 italic">"{ticket.feedback}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="text-slate-500">Ticket Type</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{ticket.type}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="text-slate-500">Impact & Urgency</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{ticket.impact} / {ticket.urgency}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="text-slate-500">Linked Hotel Asset</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {ticket.asset ? `${ticket.asset.assetTag} - ${ticket.asset.name}` : 'No asset linked'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVITY TIMELINE */}
          {activeTab === 'activity' && (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {ticket.history?.map((hist: any, idx: number) => (
                <div key={hist.id || idx} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-gold-500 ring-4 ring-white"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {hist.actor?.name || 'System Auto-Engine'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(hist.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {hist.details || `${hist.action} performed.`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: COMMENTS & INTERNAL NOTES */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Existing comments */}
              <div className="space-y-3">
                {ticket.comments?.map((comment: any) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      comment.isInternal
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-bold">
                        <span>{comment.user.name}</span>
                        {comment.isInternal && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-200 text-amber-900 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Internal Tech Note
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="whitespace-pre-line">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Add comment input */}
              <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Add Communication</label>
                  {role !== 'EMPLOYEE' && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded text-gold-600 focus:ring-gold-500"
                      />
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span className="font-semibold text-amber-800">Technician Internal Note (Hidden from Requester)</span>
                    </label>
                  )}
                </div>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? 'Add internal diagnostics, part ordering details, or staff observations...'
                        : 'Reply to employee or share updates...'
                    }
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-4 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: WORK LOGS */}
          {activeTab === 'worklogs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Technician Labor & Work Logs
                </span>
                {isAssignedTeamMember && (
                  <button
                    onClick={() => setShowWorkLogModal(true)}
                    className="px-3 py-1.5 bg-navy-900 text-gold-400 font-bold text-xs rounded-lg hover:bg-navy-800 transition-colors"
                  >
                    + Log Time
                  </button>
                )}
              </div>

              {ticket.workLogs?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No work hours recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {ticket.workLogs?.map((log: any) => (
                    <div key={log.id} className="py-3 flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {log.technician?.name} ({log.technician?.employeeCode})
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">{log.description}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="px-2.5 py-1 rounded bg-gold-50 text-gold-700 font-mono font-bold text-xs border border-gold-200">
                        {log.hoursSpent} hrs
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                <Paperclip className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Drop room photos or inspection documents here</p>
                <p className="text-[11px] text-slate-400 mt-1">Supported formats: JPG, PNG, PDF (Up to 10MB)</p>
                <button
                  type="button"
                  onClick={() => alert('Simulated upload: file attached successfully to ticket HD-2026-000123.')}
                  className="mt-3 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Browse Files
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Log Work Hours */}
      {showWorkLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-navy-950 mb-1">Record Technician Labor Hours</h3>
            <p className="text-xs text-slate-500 mb-4">Log diagnostic and repair time for ticket {ticket.ticketNumber}</p>
            <form onSubmit={handleAddWorkLog} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hours Spent</label>
                <input
                  type="number"
                  step="0.1"
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Description</label>
                <textarea
                  rows={3}
                  value={workDesc}
                  onChange={(e) => setWorkDesc(e.target.value)}
                  placeholder="Detail operations performed, parts tested or replaced..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWorkLogModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 font-bold text-xs rounded-lg hover:bg-navy-800"
                >
                  Save Work Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Resolve Ticket */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-emerald-800 mb-1">Mark Ticket as Resolved</h3>
            <p className="text-xs text-slate-500 mb-4">Provide resolution notes for the requester</p>
            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Summary</label>
                <textarea
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirm & Close (Satisfaction Rating) */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-navy-950 mb-1">Confirm Service & Close Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">How satisfied are you with the resolution?</p>
            <form onSubmit={handleCloseSubmit} className="space-y-4">
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setStarRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= starRating ? 'text-gold-500 fill-gold-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Remarks</label>
                <textarea
                  rows={2}
                  value={closeFeedback}
                  onChange={(e) => setCloseFeedback(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold text-xs rounded-lg shadow-gold-glow"
                >
                  Submit & Close Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reassign Technician */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-navy-950 mb-1">Reassign Department Technician</h3>
            <p className="text-xs text-slate-500 mb-4">Choose technician in {ticket.department?.name}</p>
            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Technician</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  required
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.employeeCode}) • Active load: {t._count?.assignedTickets || 0}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Reassignment</label>
                <input
                  type="text"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Skill specialization, shift change..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 font-bold text-xs rounded-lg hover:bg-navy-800"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
