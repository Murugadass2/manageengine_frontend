import React from 'react';
import { TicketPriority, TicketStatus } from '../../types';

export const PriorityBadge: React.FC<{ priority: TicketPriority | string; className?: string }> = ({
  priority,
  className = '',
}) => {
  const getStyle = () => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-400/30';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {priority}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TicketStatus | string; className?: string }> = ({
  status,
  className = '',
}) => {
  const getStyle = () => {
    switch (status?.toUpperCase()) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'OPEN':
        return 'bg-sky-50 text-sky-700 border-sky-300';
      case 'ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ACCEPTED':
        return 'bg-cyan-50 text-cyan-700 border-cyan-300';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/20';
      case 'PENDING_EMPLOYEE':
      case 'PENDING_APPROVAL':
      case 'ON_HOLD':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'REOPENED':
        return 'bg-orange-50 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border uppercase tracking-wider ${getStyle()} ${className}`}
    >
      {formatText(status || 'NEW')}
    </span>
  );
};
