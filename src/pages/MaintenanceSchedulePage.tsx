import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceApi, usersApi } from '../services/api';
import { MaintenanceSchedule, User } from '../types';
import { CalendarClock, Plus, CheckSquare, Wrench, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const MaintenanceSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [equipmentName, setEquipmentName] = useState('');
  const [category, setCategory] = useState('HVAC');
  const [location, setLocation] = useState('Floor 2 Central Plant');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedData, userData] = await Promise.all([
        maintenanceApi.getAll(),
        usersApi.getAll({ role: 'TECHNICIAN' }),
      ]);
      setSchedules(schedData);
      setTechnicians(userData);
      if (userData.length > 0) setAssignedTechnicianId(userData[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertTicket = async (scheduleId: string) => {
    try {
      const ticket = await maintenanceApi.convertToTicket(scheduleId);
      alert(`Work Ticket ${ticket.ticketNumber} generated successfully!`);
      navigate(`/tickets/${ticket.ticketNumber}`);
    } catch (e) {
      alert('Failed to generate maintenance ticket');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName || !location) return;
    try {
      await maintenanceApi.create({
        equipmentName,
        category,
        location,
        frequency,
        assignedTechnicianId: assignedTechnicianId || undefined,
      });
      setShowAddModal(false);
      setEquipmentName('');
      loadData();
    } catch (e) {
      alert('Failed to create maintenance schedule');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">
            Preventive Maintenance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Routine equipment servicing, HVAC inspections, generator load tests, and elevator audits
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {/* Maintenance Table (Matching Mockup Panel 11: Maintenance Schedule) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Equipment</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Location</th>
                <th className="py-3 px-4 font-bold">Frequency</th>
                <th className="py-3 px-4 font-bold">Next Date</th>
                <th className="py-3 px-4 font-bold">Assigned To</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-navy-950">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.equipmentName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.category}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.location}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{item.frequency}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-950 whitespace-nowrap">
                    {new Date(item.nextScheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {item.assignedTechnician ? item.assignedTechnician.name : <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'SCHEDULED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleConvertTicket(item.id)}
                      className="px-3 py-1 bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Dispatch Ticket</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Schedule Maintenance */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-navy-950 mb-1">Create Maintenance Schedule</h3>
            <p className="text-xs text-slate-500 mb-4">Set up recurring preventive equipment servicing</p>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="e.g. Swimming Pool Filtration Pump System"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="ELEVATOR">Elevator</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="KITCHEN">Kitchen Cold Chain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Roof Terrace / Basement B2"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Technician</label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 font-bold text-xs rounded-lg"
                >
                  Schedule Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
