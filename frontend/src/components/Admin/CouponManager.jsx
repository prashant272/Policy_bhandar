import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Tag, Plus, Edit2, Trash2, X, Check, Search, Calendar, Percent, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    isActive: true,
    expiryDate: '',
    maxUses: 0
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await API.get('/admin/coupons');
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch coupons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        isActive: coupon.isActive,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
        maxUses: coupon.maxUses
      });
    } else {
      setEditingCoupon(null);
      setForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        isActive: true,
        expiryDate: '',
        maxUses: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      return toast.error('Code and Value are required');
    }

    try {
      if (editingCoupon) {
        const res = await API.put(`/admin/coupons/${editingCoupon._id}`, form);
        if (res.data.success) {
          toast.success('Coupon updated successfully');
          setCoupons(coupons.map(c => c._id === editingCoupon._id ? res.data.data : c));
        }
      } else {
        const res = await API.post('/admin/coupons', form);
        if (res.data.success) {
          toast.success('Coupon created successfully');
          setCoupons([res.data.data, ...coupons]);
        }
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await API.delete(`/admin/coupons/${id}`);
      if (res.data.success) {
        toast.success('Coupon deleted');
        setCoupons(coupons.filter(c => c._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="text-indigo-400" size={24} />
            Coupon Management
          </h2>
          <p className="text-xs text-gray-400 mt-1">Create and manage discount codes for users.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b1021] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Coupon</span>
          </button>
        </div>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-white/5">
          <Tag className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No Coupons Found</h3>
          <p className="text-sm text-gray-400 mb-6">You haven't created any coupons yet, or none match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <div key={coupon._id} className={`bg-slate-900/60 border ${coupon.isActive ? 'border-white/10' : 'border-red-500/30'} rounded-2xl p-5 hover:border-indigo-500/50 transition-all group relative overflow-hidden`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
                    {coupon.code}
                    {!coupon.isActive && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Inactive</span>}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-emerald-400">
                    {coupon.discountType === 'PERCENTAGE' ? <Percent size={14}/> : '₹'}
                    {coupon.discountValue} {coupon.discountType === 'PERCENTAGE' ? 'OFF' : 'OFF'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(coupon)} className="p-2 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 rounded-lg transition-colors text-gray-400">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(coupon._id)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-gray-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-400 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-xs"><Hash size={14}/> Used</span>
                  <span className="text-white font-medium">{coupon.currentUses} {coupon.maxUses > 0 ? `/ ${coupon.maxUses}` : '(Unlimited)'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-xs"><Calendar size={14}/> Expires</span>
                  <span className={`font-medium ${coupon.expiryDate && new Date(coupon.expiryDate) < new Date() ? 'text-red-400' : 'text-white'}`}>
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div 
            className="border border-slate-700 rounded-2xl w-full max-w-md relative shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ backgroundColor: '#0f172a' }}
          >
            <div 
              className="p-6 border-b border-slate-700 flex justify-between items-center"
              style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
            >
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#ffffff' }}>
                <Tag style={{ color: '#818cf8' }} size={20} />
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button onClick={closeModal} style={{ color: '#94a3b8' }} className="hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#cbd5e1' }}>Coupon Code</label>
                <input 
                  type="text" 
                  required
                  value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className="w-full border border-slate-600 rounded-xl px-4 py-3 focus:border-indigo-500 uppercase tracking-widest font-mono shadow-sm placeholder-slate-500"
                  placeholder="E.G. SUMMER50"
                  style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#cbd5e1' }}>Discount Type</label>
                  <select 
                    value={form.discountType}
                    onChange={e => setForm({...form, discountType: e.target.value})}
                    className="w-full border border-slate-600 rounded-xl px-4 py-3 focus:border-indigo-500 shadow-sm"
                    style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#cbd5e1' }}>Value</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step={form.discountType === 'PERCENTAGE' ? "1" : "any"}
                    max={form.discountType === 'PERCENTAGE' ? "100" : undefined}
                    value={form.discountValue}
                    onChange={e => setForm({...form, discountValue: e.target.value})}
                    className="w-full border border-slate-600 rounded-xl px-4 py-3 focus:border-indigo-500 shadow-sm placeholder-slate-500"
                    placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 500'}
                    style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#cbd5e1' }}>Max Uses (0 = unlmt)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={form.maxUses}
                    onChange={e => setForm({...form, maxUses: e.target.value})}
                    className="w-full border border-slate-600 rounded-xl px-4 py-3 focus:border-indigo-500 shadow-sm"
                    style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#cbd5e1' }}>Expiry (Opt)</label>
                  <input 
                    type="date" 
                    value={form.expiryDate}
                    onChange={e => setForm({...form, expiryDate: e.target.value})}
                    className="w-full border border-slate-600 rounded-xl px-4 py-3 focus:border-indigo-500 shadow-sm"
                    style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${form.isActive ? 'bg-indigo-500 text-white' : 'border border-slate-500'}`} style={!form.isActive ? {backgroundColor: '#334155'} : {}}>
                    {form.isActive && <Check size={16} />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={form.isActive}
                    onChange={e => setForm({...form, isActive: e.target.checked})}
                  />
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#ffffff' }}>Coupon Active</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Users can apply this coupon</p>
                  </div>
                </label>
              </div>

              <div className="pt-6 border-t border-slate-700 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
