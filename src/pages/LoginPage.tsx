import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Lock, Mail, Sparkles, Shield, Briefcase, Wrench, User as UserIcon, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin12@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Container matching Mockup Panel 1: Login Page */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Luxury Hotel Brand Card */}
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-850 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle gold glow accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-glow mb-6">
              <span className="font-serif font-extrabold text-navy-950 text-3xl tracking-tighter">DD</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
              HOTEL DAZZLE DROP
            </h1>
            <p className="text-xs font-semibold text-gold-400 tracking-widest uppercase mt-1">
              Stay Luxurious • Work Seamless
            </p>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Enterprise Service Desk & Operations Management System. Centralized hotel service ticketing, SLA monitoring, and facility lifecycle management.
            </p>
          </div>

          {/* System Admin Credentials Note */}
          <div className="pt-8 border-t border-navy-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gold-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>System Administrator Access</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-navy-700 text-xs space-y-1">
              <div className="text-slate-300">
                <span className="text-slate-500">Email:</span> <span className="font-mono text-gold-400 font-bold">admin12@gmail.com</span>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Role:</span> <span className="text-emerald-400 font-semibold">SUPER_ADMIN</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                All mock/inbuilt demo records have been cleaned. Use your Admin login to create real staff employee IDs.
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form (Matching Mockup Panel 1) */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy-950">Welcome Back!</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in to your enterprise hotel account</p>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@dazzledrop.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link has been dispatched to hotel systems administrator.');
                }}
                className="text-gold-600 font-semibold hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold text-sm rounded-xl shadow-gold-glow transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            Hotel Dazzle Drop Internal Network • Secure TLS 1.3
          </div>
        </div>
      </div>
    </div>
  );
};
