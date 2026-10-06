import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Mail, Phone, Calendar, Search, RefreshCw, Briefcase, Zap } from 'lucide-react';

export default function WebinarLeadsManager() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/webinar/admin/registrations');
      if (res.data.success) {
        setRegistrations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching webinar registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      const res = await API.put(`/webinar/admin/registrations/${id}`, { paymentStatus: newStatus });
      if (res.data.success) {
        setRegistrations(registrations.map(r => r._id === id ? { ...r, paymentStatus: newStatus } : r));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' ? true : r.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#0b1021] rounded-[2rem] p-8 shadow-2xl border border-white/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Zap className="text-amber-500" size={32} />
            Webinar Leads
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Manage registrations for the ₹99 Star Health Agent Webinar</p>
        </div>
        <button 
          onClick={fetchRegistrations}
          className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-indigo-500/30"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c101c] border border-white/10 text-white px-11 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0c101c] border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[150px]"
        >
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0c101c] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold">Attendee Info</th>
                <th className="p-5 font-bold">Contact</th>
                <th className="p-5 font-bold">Occupation</th>
                <th className="p-5 font-bold">Date</th>
                <th className="p-5 font-bold text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 font-medium">
                    <div className="flex justify-center items-center gap-3">
                      <RefreshCw className="animate-spin text-indigo-500" size={20} />
                      Loading registrations...
                    </div>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 font-medium">
                    No registrations found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-white text-base">{reg.name}</div>
                      <div className="text-xs font-bold text-amber-500 mt-1 uppercase tracking-wider">₹{reg.amount}</div>
                    </td>
                    <td className="p-5 space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail size={14} className="text-slate-500" /> {reg.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone size={14} className="text-slate-500" /> {reg.phone}
                      </div>
                    </td>
                    <td className="p-5 text-slate-300">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-slate-500" />
                        {reg.occupation || 'N/A'}
                      </div>
                    </td>
                    <td className="p-5 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-500" />
                        {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => handleStatusToggle(reg._id, reg.paymentStatus)}
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${
                          reg.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                        title="Click to toggle status"
                      >
                        {reg.paymentStatus === 'Paid' ? 'Paid' : 'Not Paid'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
