import React, { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { User } from '../types';
import { Users, Wrench, Mail, Phone, CheckCircle, Clock } from 'lucide-react';

export const TechniciansPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const technicians = users.filter((u) => u.role === 'TECHNICIAN' || u.role === 'DEPT_MANAGER');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">
          Technicians & Field Support Staff
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Directory of active duty technicians, department heads, and ongoing work assignments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <div
            key={tech.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-navy-950 bg-slate-100 px-2 py-0.5 rounded">
                  {tech.employeeCode}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active on Duty
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{tech.name}</h3>
              <p className="text-xs font-medium text-gold-600 mt-0.5">
                {tech.role === 'DEPT_MANAGER' ? 'Department Head' : 'Specialist Technician'} • {tech.department?.name || 'Hotel Ops'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tech.email}</span>
                </div>
                {tech.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tech.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Active Workload</span>
              <span className="font-mono font-bold text-navy-950 px-2 py-0.5 bg-gold-50 border border-gold-200 rounded">
                {tech._count?.assignedTickets || 0} tickets
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
