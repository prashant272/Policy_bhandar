import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Mail, Phone, Calendar } from 'lucide-react';

export default function LeadsManager() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await API.get('/admin/contacts');
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseMessage = (msg) => {
    if (!msg) return { service: 'N/A', requirement: 'N/A' };
    const parts = msg.split('| Specific Requirements:');
    if (parts.length === 2) {
      return {
        service: parts[0].replace('Service Type:', '').trim(),
        requirement: parts[1].trim()
      };
    }
    return { service: 'N/A', requirement: msg };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Mail className="mr-3 text-orange-500" /> Leads & Inquiries
        </h2>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Info</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Requested</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-1/3">Requirements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Loading leads...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No leads found yet.</td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const { service, requirement } = parseMessage(lead.message);
                  return (
                    <tr key={lead._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 align-top">
                        <div className="flex items-center text-xs text-slate-400">
                          <Calendar size={14} className="mr-2 opacity-50" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className="font-bold text-white">{lead.name}</span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-center text-xs text-slate-300 mb-1">
                          <Phone size={12} className="mr-2 text-emerald-400" /> {lead.phone}
                        </div>
                        <div className="flex items-center text-xs text-slate-400 break-all">
                          <Mail size={12} className="mr-2 text-orange-400" /> {lead.email}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className="inline-block px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">
                          {service}
                        </span>
                      </td>
                      <td className="p-4 align-top text-xs text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                        {requirement}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
