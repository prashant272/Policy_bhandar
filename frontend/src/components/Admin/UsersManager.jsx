import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Users, X, Info } from 'lucide-react';

export default function UsersManager() {
  const [usersList, setUsersList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setMessage(err.response?.data?.error || 'Failed to load users list.');
    }
    setLoading(false);
  };

  const fetchPlans = async () => {
    try {
      const res = await API.get('/plans');
      if (res.data.success) {
        setPlansList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  // Update user role or plan
  const handleUserUpdate = async (userId, updateData) => {
    setMessage('');
    try {
      const res = await API.put(`/admin/users/${userId}`, updateData);
      if (res.data.success) {
        setMessage('Success: User updated successfully!');
        fetchUsers();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update user settings');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Users className="text-indigo-400" size={22} />
          <span>Users & Plans Management</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">Control advisor system accounts, change system permission roles, and adjust premium subscription plans.</p>
      </div>

      {/* Message Prompt */}
      {message && (
        <div className={`p-4 rounded-xl text-sm border flex justify-between items-center ${
          message.toLowerCase().includes('success') 
            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
            : 'bg-red-950/20 text-red-400 border-red-500/20'
        }`}>
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Users List Grid */}
      <div className="glass-effect rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Advisor Name</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Email</th>
                <th className="p-4">Location</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Subscription Plan</th>
                <th className="p-4 text-center">Downloads Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {usersList.map((usr) => (
                <tr key={usr._id} className="hover:bg-white/3 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <div>{usr.name}</div>
                    <div className="text-[10px] text-gray-500 font-normal mt-0.5">{usr.agentType || 'Insurance Advisor'}</div>
                  </td>
                  <td className="p-4 font-semibold text-gray-400">{usr.mobile}</td>
                  <td className="p-4 text-gray-400">{usr.email}</td>
                  <td className="p-4 text-gray-400">
                    {usr.city || usr.state ? `${usr.city || ''}, ${usr.state || ''}` : '-'}
                  </td>
                  <td className="p-4">
                    <select
                      value={usr.role}
                      onChange={(e) => handleUserUpdate(usr._id, { role: e.target.value })}
                      className="bg-[#0c101c] border border-white/10 text-xs rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Agent">Agent</option>
                      <option value="Leader">Leader</option>
                      <option value="SubAdmin">SubAdmin</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={usr.activePlan?._id || usr.activePlan || ''}
                      onChange={(e) => handleUserUpdate(usr._id, { activePlan: e.target.value || null })}
                      className="bg-[#0c101c] border border-white/10 text-xs rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer [&>option]:bg-[#0b1021]"
                    >
                      <option value="">-- Legacy / Free --</option>
                      {plansList.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-400">
                    <span className={usr.downloadCount >= 5 ? 'text-red-400' : 'text-emerald-400'}>
                      {usr.downloadCount}
                    </span>
                    <span className="text-gray-600 font-normal"> / 5</span>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No advisors registered in the database yet.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-indigo-400 font-semibold animate-pulse">Loading advisors dataset...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
