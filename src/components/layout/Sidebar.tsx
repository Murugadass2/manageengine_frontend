import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  CheckSquare,
  Building2,
  Users,
  HardDrive,
  Boxes,
  CalendarClock,
  CheckCheck,
  BookOpen,
  BarChart3,
  ScrollText,
  Clock,
  Settings,
  PlusCircle,
  HelpCircle,
  UserPlus,
  X,
} from 'lucide-react';

interface SidebarProps {
  onOpenCreateTicket: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateTicket, isOpen = false, onClose }) => {
  const { role } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Tickets', icon: Ticket, badge: 'Active' },
    { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/technicians', label: 'Technicians', icon: Users },
    { to: '/assets', label: 'Assets', icon: HardDrive },
    { to: '/inventory', label: 'Inventory', icon: Boxes },
    { to: '/maintenance', label: 'Maintenance', icon: CalendarClock },
    { to: '/approvals', label: 'Approvals', icon: CheckCheck },
    { to: '/kb', label: 'Knowledge Base', icon: BookOpen },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/audit', label: 'Audit Logs', icon: ScrollText },
    ...(role === 'SUPER_ADMIN'
      ? [{ to: '/employees', label: 'Employee IDs', icon: UserPlus, badge: 'Admin' }]
      : []),
    { to: '/sla', label: 'SLA Matrix', icon: Clock },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 lg:top-16 left-0 z-40 lg:z-auto w-64 bg-navy-950 text-slate-300 border-r border-navy-800 flex flex-col flex-shrink-0 h-[calc(100vh-4rem)] select-none overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-3 border-b border-navy-800 lg:hidden">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Navigation Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Ticket Quick Button */}
        <div className="p-4 border-b border-navy-800">
          <button
            onClick={() => {
              onOpenCreateTicket();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold py-2.5 px-4 rounded-xl shadow-gold-glow transition-all active:scale-[0.98] text-sm"
          >
            <PlusCircle className="w-4 h-4 text-navy-950" />
            <span>New Ticket</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-3 px-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Core Operations
        </div>

        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-800 text-gold-400 border border-navy-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="px-3 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Hotel Resources
        </div>

        {navItems.slice(3, 10).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="px-3 pt-3 pb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Administration
        </div>

        {navItems.slice(10).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status Badge */}
      <div className="p-3 border-t border-navy-800 bg-navy-900/60">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>DazzleDesk v2.6 Online</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Role: <span className="text-gold-400 font-semibold">{role}</span>
        </div>
      </div>
    </aside>
    </>
  );
};
