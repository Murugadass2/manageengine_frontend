import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Notification } from '../../types';
import { notificationsApi } from '../../services/api';
import {
  Bell,
  Search,
  User as UserIcon,
  Shield,
  Briefcase,
  Wrench,
  UserCheck,
  Check,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { user, role, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      // ignore in silent polling
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const rolesList: { role: UserRole; label: string; icon: any; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Administrator', icon: Shield, desc: 'Full enterprise control' },
    { role: 'HOTEL_MANAGER', label: 'Hotel Manager', icon: Briefcase, desc: 'Hotel-wide view & approvals' },
    { role: 'DEPT_MANAGER', label: 'Department Manager', icon: UserCheck, desc: 'Maintenance / IT Dept Head' },
    { role: 'TECHNICIAN', label: 'Technician (Arun Kumar)', icon: Wrench, desc: 'Assigned tasks & work logs' },
    { role: 'EMPLOYEE', label: 'Employee (Ramesh Kumar)', icon: UserIcon, desc: 'Requester & self-service' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950 text-white border-b border-navy-800 shadow-md">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-16">
        {/* Brand / Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded-lg lg:hidden hover:bg-navy-900 text-slate-300 hover:text-white border border-navy-800"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-gold-400" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-glow flex-shrink-0">
            <span className="font-serif font-bold text-navy-950 text-lg sm:text-xl tracking-tighter">DD</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif font-bold text-base sm:text-lg text-white tracking-wide truncate max-w-[130px] xs:max-w-none">
                HOTEL DAZZLE DROP
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                Service Desk
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Stay Luxurious • Work Seamless
            </p>
          </div>
        </div>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ticket ID (HD-2026-...), Room, Guest, Asset..."
              className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
            />
          </div>
        </form>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 border border-gold-500/40 rounded-lg px-3 py-1.5 text-xs font-medium text-gold-300 transition-colors shadow-sm"
              title="Quickly test another role"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span className="hidden sm:inline font-semibold">Switch Persona:</span>
              <span className="text-white font-bold">{user?.role?.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 text-gold-400 ml-0.5" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-2 border-b border-navy-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold-400">
                    Enterprise Role Switcher
                  </p>
                  <p className="text-xs text-slate-400">Experience the portal as different hotel staff</p>
                </div>
                <div className="py-1">
                  {rolesList.map((item) => {
                    const Icon = item.icon;
                    const isActive = role === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchRole(item.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                          isActive ? 'bg-gold-500/15 text-gold-300' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-400'}`} />
                          <div>
                            <div className="text-xs font-medium">{item.label}</div>
                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                          </div>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-gold-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-navy-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 bg-navy-950 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gold-400" />
                    <span className="font-semibold text-xs">Notifications ({unreadCount} new)</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-gold-400 hover:text-gold-300 underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.linkUrl) navigate(item.linkUrl);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !item.isRead ? 'bg-amber-50/40 border-l-2 border-gold-500' : ''
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-900 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 text-navy-950 font-bold text-xs flex items-center justify-center shadow">
                {user?.name?.slice(0, 2).toUpperCase() || 'DD'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white leading-tight">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] text-gold-400 font-medium">
                  {user?.employeeCode} • {user?.department?.name || 'Hotel Ops'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-1 text-slate-200 z-50">
                <div className="px-4 py-2.5 border-b border-navy-800">
                  <div className="text-xs font-bold text-white">{user?.name}</div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                  <div className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 font-semibold uppercase">
                    {user?.role}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-navy-800 text-slate-300 hover:text-white"
                >
                  Profile & Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 text-rose-400 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
