import React, { useState, useEffect } from 'react';
import { ticketsApi, departmentsApi, assetsApi, kbApi } from '../../services/api';
import { Department, Asset, KnowledgeArticle } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, AlertCircle, Check, BookOpen } from 'lucide-react';

interface TicketCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticket: any) => void;
}

export const TicketCreateModal: React.FC<TicketCreateModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
}) => {
  const { user, role } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [type, setType] = useState('SERVICE_REQUEST');
  const [priority, setPriority] = useState('MEDIUM');
  const [location, setLocation] = useState('Room 205');
  const [assetId, setAssetId] = useState('');
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [suggestedKb, setSuggestedKb] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  // Real-time suggested solutions when typing subject
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (subject.trim().length > 3) {
        try {
          const res = await kbApi.getAll({ search: subject.trim() });
          setSuggestedKb(res.slice(0, 2));
        } catch (e) {
          // ignore
        }
      } else {
        setSuggestedKb([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [subject]);

  const loadFormData = async () => {
    try {
      const [deptData, assetData] = await Promise.all([
        departmentsApi.getAll(),
        assetsApi.getAll(),
      ]);
      setDepartments(deptData);
      setAssets(assetData);
      if (deptData.length > 0 && !departmentId) {
        const userDepartment = ['DEPT_MANAGER', 'TECHNICIAN'].includes(role)
          ? deptData.find((department) => department.id === user?.departmentId)
          : undefined;
        const defaultDepartment =
          userDepartment || deptData.find((department) => department.code === 'MAINT') || deptData[0];
        setDepartmentId(defaultDepartment.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !departmentId) {
      setError('Please fill in all required fields (Subject, Description, and Department).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newTicket = await ticketsApi.create({
        subject,
        description,
        departmentId,
        type,
        priority,
        location,
        assetId: assetId || undefined,
      });

      onTicketCreated(newTicket);
      onClose();
      // Reset
      setSubject('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  const prioritySlaLabels: Record<string, string> = {
    CRITICAL: '15 min response • 2 hr resolution',
    HIGH: '30 min response • 4 hr resolution',
    MEDIUM: '2 hr response • 12 hr resolution',
    LOW: '4 hr response • 24 hr resolution',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-white">Create New Service Ticket</h2>
              <p className="text-xs text-slate-400">Hotel Dazzle Drop Operations Service Desk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. AC not cooling in Room 205"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all font-medium text-slate-900"
              required
            />
          </div>

          {/* Suggested Knowledge Base Self-Service Helper */}
          {suggestedKb.length > 0 && (
            <div className="p-3 bg-amber-50/70 border border-gold-300/80 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <BookOpen className="w-3.5 h-3.5 text-gold-600" />
                <span>Suggested Knowledge Solutions (May resolve without a ticket)</span>
              </div>
              <div className="space-y-1.5">
                {suggestedKb.map((article) => (
                  <div key={article.id} className="text-xs bg-white p-2 rounded-lg border border-amber-200">
                    <div className="font-semibold text-slate-800">{article.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{article.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department & Ticket Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ticket Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
              >
                <option value="MAINTENANCE_REQUEST">Maintenance Request</option>
                <option value="INCIDENT">Incident</option>
                <option value="SERVICE_REQUEST">Service Request</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="COMPLAINT">Complaint</option>
                <option value="GENERAL_REQUEST">General Request</option>
              </select>
            </div>
          </div>

          {/* Priority & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority & SLA Policy
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
              >
                <option value="CRITICAL">Critical (Emergency / VIP Impact)</option>
                <option value="HIGH">High (Guest Inconvenience)</option>
                <option value="MEDIUM">Medium (Standard Operational)</option>
                <option value="LOW">Low (Routine)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                SLA: <span className="font-semibold text-gold-600">{prioritySlaLabels[priority]}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hotel Location / Room No.
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Room 205, Floor 2, Grand Ballroom"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 font-medium"
              />
            </div>
          </div>

          {/* Link Asset (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Link Registered Hotel Asset (Optional)
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
            >
              <option value="">None / Not Applicable</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} - {a.name} ({a.location || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details of the issue, symptoms observed, guest requests, or diagnostic notes..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all font-sans text-slate-800"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold text-xs rounded-lg shadow-gold-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Generating Ticket...' : 'Create Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
