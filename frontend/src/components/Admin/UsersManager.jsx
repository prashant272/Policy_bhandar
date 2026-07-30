import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Users, X, Info, Edit2, Trash2 } from 'lucide-react';

export default function UsersManager() {
  const [usersList, setUsersList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', mobile: '', email: '', password: '', unlockedCategories: [] });

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

  const fetchCategories = async () => {
    try {
      const [catRes, subcatRes] = await Promise.all([
        API.get('/materials/categories'),
        API.get('/materials/subcategories')
      ]);
      let items = [];
      if (catRes.data.success) {
         items = [...items, ...catRes.data.data.filter(c => c.isLeaderCategory)];
      }
      if (subcatRes.data.success) {
         items = [...items, ...subcatRes.data.data.filter(s => s.isMainSubcategory)];
      }
      setCategoriesList(items);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
    fetchCategories();
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

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      mobile: user.mobile || '',
      email: user.email || '',
      password: '', // empty password by default unless changing
      unlockedCategories: user.unlockedCategories ? user.unlockedCategories.map(c => typeof c === 'object' ? c._id : c) : []
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const updateData = { ...editFormData };
      if (!updateData.password) delete updateData.password;

      const res = await API.put(`/admin/users/${editingUser._id}`, updateData);
      if (res.data.success) {
        setMessage('Success: User details updated successfully!');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update user details');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setMessage('');
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setMessage('Success: User deleted successfully!');
        fetchUsers();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete user');
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
                <th className="p-4 whitespace-nowrap">Advisor Name</th>
                <th className="p-4 whitespace-nowrap">Mobile</th>
                <th className="p-4 whitespace-nowrap">Email</th>
                <th className="p-4 whitespace-nowrap">Location</th>
                <th className="p-4 whitespace-nowrap">System Role</th>
                <th className="p-4 whitespace-nowrap">Subscription Plan</th>
                <th className="p-4 whitespace-nowrap">Unlocked Categories</th>
                <th className="p-4 text-center whitespace-nowrap">Downloads Today</th>
                <th className="p-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {usersList.map((usr) => (
                <tr key={usr._id} className="hover:bg-white/3 transition-colors">
                  <td className="p-4 font-bold text-white whitespace-nowrap min-w-[200px]">
                    <div>{usr.name}</div>
                    <div className="text-[10px] text-gray-500 font-normal mt-0.5">{usr.agentType || 'Insurance Advisor'}</div>
                  </td>
                  <td className="p-4 font-semibold text-gray-400 whitespace-nowrap">{usr.mobile}</td>
                  <td className="p-4 text-gray-400 whitespace-nowrap">{usr.email}</td>
                  <td className="p-4 text-gray-400 whitespace-nowrap">
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
                  <td className="p-4">
                    {(() => {
                      const planId = typeof usr.activePlan === 'object' ? usr.activePlan?._id : usr.activePlan;
                      const plan = plansList.find(p => p._id === planId);
                      if (plan && plan.name === 'All Free') {
                        return <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-[10px] font-bold">Full Access (All Free)</span>;
                      }
                      
                      const cats = [...(usr.unlockedCategories || []), ...(usr.purchasedAddons || [])];
                      if (cats.length === 0) return <span className="text-gray-600">-</span>;
                      
                      // Remove duplicates by ID and map to name
                      const uniqueCatsMap = new Map();
                      cats.forEach(c => {
                        const id = typeof c === 'object' ? c._id?.toString() : c.toString();
                        let name = typeof c === 'object' ? c.name : 'Unknown';
                        if (name === 'Unknown') {
                          const foundCat = categoriesList.find(catItem => catItem._id === id);
                          if (foundCat) name = foundCat.name;
                        }
                        if (id && !uniqueCatsMap.has(id)) uniqueCatsMap.set(id, name);
                      });
                      
                      const uniqueCats = Array.from(uniqueCatsMap.values());
                      
                      return (
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {uniqueCats.map((name, i) => (
                            <span key={i} className="bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded text-[10px] truncate" title={name}>
                              {name}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-4 text-center font-bold text-gray-400">
                    {(() => {
                      const limit = (() => {
                        if (!usr.activePlan) return 5;
                        const planId = typeof usr.activePlan === 'object' ? usr.activePlan._id : usr.activePlan;
                        const plan = plansList.find(p => p._id === planId);
                        if (!plan) return 5;
                        return plan.dailyDownloadLimit;
                      })();
                      const isUnlimited = limit === -1;
                      const limitReached = !isUnlimited && usr.downloadCount >= limit;
                      return (
                        <>
                          <span className={limitReached ? 'text-red-400' : 'text-emerald-400'}>
                            {usr.downloadCount}
                          </span>
                          <span className="text-gray-600 font-normal">
                            {isUnlimited ? ' / ∞' : ` / ${limit}`}
                          </span>
                        </>
                      );
                    })()}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <button onClick={() => handleEditClick(usr)} className="p-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 rounded transition-colors" title="Edit User">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteUser(usr._id)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded transition-colors" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">No advisors registered in the database yet.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-indigo-400 font-semibold animate-pulse">Loading advisors dataset...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0b1021] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-bold text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-[#0c101c] border border-white/10 text-sm rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Mobile</label>
                <input
                  type="text"
                  value={editFormData.mobile}
                  onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})}
                  className="w-full bg-[#0c101c] border border-white/10 text-sm rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full bg-[#0c101c] border border-white/10 text-sm rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">New Password (leave empty to keep current)</label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  className="w-full bg-[#0c101c] border border-white/10 text-sm rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Unlocked Categories</label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {categoriesList.map(c => {
                    const isChecked = editFormData.unlockedCategories.includes(c._id);
                    return (
                      <div 
                        key={c._id}
                        onClick={() => {
                          if (isChecked) {
                            setEditFormData(prev => ({ ...prev, unlockedCategories: prev.unlockedCategories.filter(id => id !== c._id) }));
                          } else {
                            setEditFormData(prev => ({ ...prev, unlockedCategories: [...prev.unlockedCategories, c._id] }));
                          }
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-[#0c101c] hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-bold text-xs ${isChecked ? 'text-indigo-400' : 'text-gray-300'}`}>{c.name}</span>
                          {isChecked && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Selected</span>}
                          {!isChecked && c.isLeaderCategory && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">Leader</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
