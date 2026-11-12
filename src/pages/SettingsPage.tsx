import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi, slaApi, departmentsApi } from '../services/api';
import { SLAPolicy, Department } from '../types';
import { Settings, User, Clock, Shield, Bell, Save, CheckCircle2, UserPlus, AlertCircle, Users } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Employee creation (Admin only)
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const [departments, setDepartments] = useState<Department[]>([]);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [empRole, setEmpRole] = useState('EMPLOYEE');
  const [empDepartmentId, setEmpDepartmentId] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empPassword, setEmpPassword] = useState('Password@123');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');
  const [createErrorMsg, setCreateErrorMsg] = useState('');
  const [userList, setUserList] = useState<any[]>([]);

  // SLA policies
  const [slaPolicies, setSlaPolicies] = useState<SLAPolicy[]>([]);
  const [savingSla, setSavingSla] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
    loadSla();
    if (isAdmin) {
      loadDepartmentsAndUsers();
    }
  }, [user, isAdmin]);

  const loadDepartmentsAndUsers = async () => {
    try {
      const [deptData, usersData] = await Promise.all([
        departmentsApi.getAll(),
        usersApi.getAll()
      ]);
      setDepartments(deptData);
      setUserList(usersData);
      if (deptData.length > 0 && !empDepartmentId) {
        setEmpDepartmentId(deptData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateSuccessMsg('');
    setCreateErrorMsg('');

    try {
      await usersApi.createUser({
        name: empName,
        email: empEmail,
        employeeCode: empCode,
        role: empRole,
        departmentId: empDepartmentId || undefined,
        phone: empPhone || undefined,
        password: empPassword || 'Password@123',
      });

      setCreateSuccessMsg(`Employee ${empName} (${empCode}) created successfully!`);
      setEmpName('');
      setEmpEmail('');
      setEmpCode('');
      setEmpPhone('');
      setEmpPassword('Password@123');
      loadDepartmentsAndUsers();
      setTimeout(() => setCreateSuccessMsg(''), 4000);
    } catch (err: any) {
      setCreateErrorMsg(err.message || 'Failed to create employee');
      setTimeout(() => setCreateErrorMsg(''), 5000);
    } finally {
      setCreatingUser(false);
    }
  };

  const loadSla = async () => {
    try {
      const data = await slaApi.getAll();
      setSlaPolicies(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await usersApi.updateProfile({ name, phone });
      await refreshUser();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (e) {
      alert('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSlaUpdate = async (policy: SLAPolicy, responseMin: number, resMin: number) => {
    setSavingSla(true);
    try {
      await slaApi.update(policy.id, {
        responseMinutes: responseMin,
        resolutionMinutes: resMin,
        escalationRole: policy.escalationRole,
        isActive: true,
      });
      loadSla();
      alert(`SLA policy for ${policy.priority} updated successfully!`);
    } catch (e) {
      alert('Failed to update SLA');
    } finally {
      setSavingSla(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">
          User Profile & System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal account profile, notification preferences, and hotel SLA policies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card (Matching Mockup Panel 13: User Profile & Settings) */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 text-navy-950 font-bold text-2xl flex items-center justify-center shadow-gold-glow mb-4">
            {user?.name?.slice(0, 2).toUpperCase() || 'DD'}
          </div>
          <h2 className="text-base font-bold text-navy-950">{user?.name}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
          <span className="mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold-50 text-gold-700 border border-gold-200">
            {user?.role}
          </span>
          <div className="w-full mt-6 pt-4 border-t border-slate-100 text-left text-xs space-y-2">
            <div>
              <span className="text-slate-400">Employee ID:</span>{' '}
              <span className="font-mono font-bold text-slate-800">{user?.employeeCode}</span>
            </div>
            <div>
              <span className="text-slate-400">Department:</span>{' '}
              <span className="font-semibold text-slate-800">{user?.department?.name || 'General Operations'}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-4">
            Update Profile Information
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone / Mobile Extension</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving...' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Admin Only: Employee ID & Account Management */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gold-50 border border-gold-200 text-gold-700">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                  Employee ID Creation (Admin Access Only)
                </h2>
                <p className="text-xs text-slate-500">
                  Provision new employee identity, allocate employee ID code, assign department & role.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              SUPER_ADMIN AUTHORIZED
            </span>
          </div>

          {createSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{createSuccessMsg}</span>
            </div>
          )}

          {createErrorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-medium">{createErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="e.g. Anand Muruga"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Employee Code / ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                placeholder="e.g. EMP-305"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={empEmail}
                onChange={(e) => setEmpEmail(e.target.value)}
                placeholder="e.g. employee@dazzledrop.com"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                System Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={empRole}
                onChange={(e) => setEmpRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-medium"
              >
                <option value="EMPLOYEE">EMPLOYEE (Requester)</option>
                <option value="TECHNICIAN">TECHNICIAN (Field Staff)</option>
                <option value="DEPT_MANAGER">DEPT_MANAGER (Department Head)</option>
                <option value="HOTEL_MANAGER">HOTEL_MANAGER (Executive Approver)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Admin Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={empDepartmentId}
                onChange={(e) => setEmpDepartmentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
              >
                <option value="">-- None / General Staff --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={empPhone}
                onChange={(e) => setEmpPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                placeholder="Default: Password@123"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-mono"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={creatingUser}
                className="px-6 py-2.5 bg-gold-600 hover:bg-gold-500 text-navy-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{creatingUser ? 'Creating Employee ID...' : 'Create Employee ID'}</span>
              </button>
            </div>
          </form>

          {/* Directory of Employees */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Created Employee Staff Directory ({userList.length} Accounts)
              </h3>
            </div>
            <div className="overflow-x-auto max-h-64 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Emp ID</th>
                    <th className="py-2.5 px-3 font-bold">Name</th>
                    <th className="py-2.5 px-3 font-bold">Email</th>
                    <th className="py-2.5 px-3 font-bold">Role</th>
                    <th className="py-2.5 px-3 font-bold">Department</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-gold-700">{u.employeeCode}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{u.email}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{u.department?.name || '—'}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SLA Policy Matrix (Section 5 from prompt specifications) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gold-600" />
          <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
            SLA Policy & Escalation Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Priority</th>
                <th className="py-3 px-4 font-bold">First Response SLA</th>
                <th className="py-3 px-4 font-bold">Resolution SLA</th>
                <th className="py-3 px-4 font-bold">Escalation Role</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slaPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-navy-950">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        policy.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : policy.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : policy.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {policy.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {policy.responseMinutes} minutes
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {policy.resolutionMinutes >= 60
                      ? `${policy.resolutionMinutes / 60} hours`
                      : `${policy.resolutionMinutes} minutes`}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {policy.escalationRole.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                      Active Policy
                    </span>
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
