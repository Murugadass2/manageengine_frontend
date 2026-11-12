import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi, departmentsApi } from '../services/api';
import { Department } from '../types';
import {
  UserPlus,
  Shield,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  KeyRound,
  IdCard,
} from 'lucide-react';

export const EmployeeManagementPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
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

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptData, usersData] = await Promise.all([
        departmentsApi.getAll(),
        usersApi.getAll(),
      ]);
      setDepartments(deptData);
      setUserList(usersData);
      if (deptData.length > 0 && !empDepartmentId) {
        setEmpDepartmentId(deptData[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setCreateErrorMsg('Access denied: Only Admin can create employee IDs');
      return;
    }

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
      loadData();
      setTimeout(() => setCreateSuccessMsg(''), 5000);
    } catch (err: any) {
      setCreateErrorMsg(err.message || 'Failed to create employee');
      setTimeout(() => setCreateErrorMsg(''), 5000);
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">
              Employee ID & Identity Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-100 text-gold-800 border border-gold-200">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create new official hotel employee IDs, provision system accounts, allocate departments and configure access roles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1.5 shadow-sm">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Admin Access Exclusive</span>
          </span>
        </div>
      </div>

      {!isAdmin ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-rose-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-rose-700">
            You do not have permissions to create employee IDs. Only system Administrators (`SUPER_ADMIN`) can access this tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Employee ID Form (1 column on large screens) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-gold-50 border border-gold-200 text-gold-700">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                  Create Employee ID
                </h2>
                <p className="text-[11px] text-slate-500">
                  Provision new credential and ID tag
                </p>
              </div>
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

            <form onSubmit={handleCreateEmployee} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="e.g. Ramesh Kannan"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employee ID / Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    placeholder="e.g. EMP-301, TECH-105"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="ramesh@dazzledrop.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    System Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-medium"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="DEPT_MANAGER">DEPT MANAGER</option>
                    <option value="HOTEL_MANAGER">HOTEL MANAGER</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={empDepartmentId}
                    onChange={(e) => setEmpDepartmentId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 text-xs"
                  >
                    <option value="">General</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="Default: Password@123"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{creatingUser ? 'Creating Employee ID...' : 'Create Employee ID'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Employee Directory & Search (2 columns) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-600" />
                <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                  Hotel Staff Directory ({filteredUsers.length} of {userList.length})
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, code, email..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 w-44 sm:w-56"
                  />
                </div>

                {/* Filter */}
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="HOTEL_MANAGER">HOTEL_MANAGER</option>
                  <option value="DEPT_MANAGER">DEPT_MANAGER</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-3 px-3.5 font-bold">Employee ID</th>
                    <th className="py-3 px-3.5 font-bold">Staff Member</th>
                    <th className="py-3 px-3.5 font-bold">Department</th>
                    <th className="py-3 px-3.5 font-bold">Role</th>
                    <th className="py-3 px-3.5 font-bold">Contact</th>
                    <th className="py-3 px-3.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Loading employee roster...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No employees found matching filter criteria
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-navy-950">
                          <span className="px-2 py-0.5 rounded bg-gold-50 text-gold-800 border border-gold-200 text-[11px]">
                            {u.employeeCode}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">{u.email}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="text-slate-700 font-medium">
                            {u.department?.name || 'General Operations'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'HOTEL_MANAGER'
                                ? 'bg-indigo-100 text-indigo-800'
                                : u.role === 'DEPT_MANAGER'
                                ? 'bg-blue-100 text-blue-800'
                                : u.role === 'TECHNICIAN'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px]">
                          {u.phone || '—'}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
