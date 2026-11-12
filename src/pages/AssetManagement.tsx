import React, { useState, useEffect } from 'react';
import { assetsApi, departmentsApi } from '../services/api';
import { Asset, Department } from '../types';
import { HardDrive, Plus, Search, Filter, Laptop, Printer, Video, Server, Wind, CheckCircle2, X } from 'lucide-react';

export const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('COMPUTERS');
  const [location, setLocation] = useState('Floor 1');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetsData, deptsData] = await Promise.all([
        assetsApi.getAll({ category: categoryFilter, search: search || undefined }),
        departmentsApi.getAll(),
      ]);
      setAssets(assetsData);
      setDepartments(deptsData);
      if (deptsData.length > 0 && !departmentId) {
        setDepartmentId(deptsData[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTag || !name) return;
    try {
      await assetsApi.create({ assetTag, name, category, location, departmentId });
      setShowAddModal(false);
      setAssetTag('');
      setName('');
      loadData();
    } catch (e) {
      alert('Error creating asset. Asset tag must be unique.');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case 'COMPUTERS':
        return Laptop;
      case 'PRINTERS':
        return Printer;
      case 'SECURITY':
        return Video;
      case 'SERVERS':
        return Server;
      case 'HVAC':
        return Wind;
      default:
        return HardDrive;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy-950 tracking-wide">Asset Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register and track hotel IT equipment, hardware devices, HVAC systems, and room infrastructure
          </p>
        </div>
        <button
          onClick={() => {
            const nextTag = `AS-${(assets.length + 1).toString().padStart(3, '0')}`;
            setAssetTag(nextTag);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            placeholder="Search assets by tag, device model, serial or location..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-gold-500 font-medium"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl text-slate-700 w-full sm:w-auto"
        >
          <option value="ALL">All Categories</option>
          <option value="COMPUTERS">Computers & Laptops</option>
          <option value="PRINTERS">Printers & Scanners</option>
          <option value="SECURITY">CCTV & Access Control</option>
          <option value="SERVERS">Server Racks & Network</option>
          <option value="HVAC">HVAC & Chillers</option>
        </select>
      </div>

      {/* Assets Table (Matching Mockup Panel 7: Assets) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Asset ID</th>
                <th className="py-3 px-4 font-bold">Name & Model</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Department</th>
                <th className="py-3 px-4 font-bold">Location</th>
                <th className="py-3 px-4 font-bold">Assigned User</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((asset) => {
                const Icon = getCategoryIcon(asset.category);
                return (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-navy-950">{asset.assetTag}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gold-50 text-gold-600 border border-gold-200 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div>{asset.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-normal">
                            SN: {asset.serialNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{asset.category}</td>
                    <td className="py-3 px-4 text-slate-700">{asset.department?.name || 'Hotel'}</td>
                    <td className="py-3 px-4 text-slate-600">{asset.location || 'General'}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {asset.assignedUser ? asset.assignedUser.name : <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          asset.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Asset */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-navy-950">Register New Hotel Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Tag</label>
                <input
                  type="text"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Device Name / Model</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dell Latitude 5420"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-medium"
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
                    <option value="COMPUTERS">Computers</option>
                    <option value="PRINTERS">Printers</option>
                    <option value="SECURITY">Security / CCTV</option>
                    <option value="SERVERS">Servers</option>
                    <option value="HVAC">HVAC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Front Desk"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
