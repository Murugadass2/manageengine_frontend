import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ticketsApi, departmentsApi } from '../services/api';
import { Ticket, Department } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badges';
import { SLACountdown } from '../components/common/SLACountdown';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

interface TicketListProps {
  onOpenCreateTicket: () => void;
  myTasksOnly?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({
  onOpenCreateTicket,
  myTasksOnly = false,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'ALL');
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('departmentId') || 'ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    departmentsApi.getAll().then(setDepartments).catch(console.error);
  }, []);

  useEffect(() => {
    loadTickets();
  }, [page, statusFilter, priorityFilter, departmentFilter, myTasksOnly]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketsApi.getAll({
        page,
        limit: 15,
        status: statusFilter,
        priority: priorityFilter,
        departmentId: departmentFilter,
        search: searchQuery || undefined,
        myTasks: myTasksOnly ? 'true' : undefined,
      });
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTickets();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">
            {myTasksOnly ? 'My Assigned Tasks' : role === 'TECHNICIAN' ? 'Department Ticket Queue' : 'All Service Tickets'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {myTasksOnly
              ? 'Work orders currently dispatched to your technician queue'
              : role === 'TECHNICIAN'
              ? 'Unclaimed and assigned tickets for your department'
              : `Managing hotel-wide incidents and service requests (${total} total tickets)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTickets()}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenCreateTicket}
            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Matching Mockup Panel 4) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by ID, Subject, Room, Floor or Keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white transition-all font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-gold-600" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_EMPLOYEE">Pending Employee</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {role !== 'TECHNICIAN' && (
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || departmentFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setDepartmentFilter('ALL');
                setSearchQuery('');
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tickets Table (Matching Mockup Panel 4: All Tickets) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">ID</th>
                <th className="py-3 px-4 font-bold">Subject</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Priority</th>
                <th className="py-3 px-4 font-bold">Department</th>
                <th className="py-3 px-4 font-bold">Technician</th>
                <th className="py-3 px-4 font-bold">Location</th>
                <th className="py-3 px-4 font-bold">SLA Remaining</th>
                <th className="py-3 px-4 font-bold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No tickets found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/tickets/${t.ticketNumber}`)}
                    className="hover:bg-amber-50/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950 whitespace-nowrap">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-sm truncate">
                      {t.subject}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {t.department?.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {t.assignedTechnician ? t.assignedTechnician.name : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                        <span>{t.location || 'General'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SLACountdown
                        targetDate={t.resolutionDueAt}
                        isResolved={['RESOLVED', 'CLOSED', 'CANCELLED'].includes(t.status)}
                        resolvedAt={t.resolvedAt}
                        compact={true}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-navy-950">{tickets.length}</span> of{' '}
            <span className="font-bold text-navy-950">{total}</span> total tickets
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold font-mono text-navy-950">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
