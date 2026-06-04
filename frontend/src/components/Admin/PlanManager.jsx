import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Plus, Trash2, Edit, Save, Tag, IndianRupee, Clock, DownloadCloud } from 'lucide-react';

export default function PlanManager() {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [trainingCategories, setTrainingCategories] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = {
    name: '',
    price: '',
    validityDays: 30,
    dailyDownloadLimit: 5,
    features: '',
    allowedCategories: [],
    allowedSubcategories: [],
    allowedTrainingCategories: [],
    isActive: true
  };
  
  const [form, setForm] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [plansRes, catsRes, trainingCatsRes] = await Promise.all([
        API.get('/plans'),
        API.get('/materials/categories'),
        API.get('/trainings/categories')
      ]);
      if (plansRes.data.success) setPlans(plansRes.data.data);
      if (catsRes.data.success) setCategories(catsRes.data.data);
      if (trainingCatsRes.data.success) setTrainingCategories(trainingCatsRes.data.data);
      
      // Fetch subcategories for all categories to show in the list
      const subcats = [];
      for (const cat of catsRes.data.data) {
        const subRes = await API.get(`/materials/categories/${cat._id}/subcategories`);
        if (subRes.data.success) {
          subcats.push(...subRes.data.data);
        }
      }
      setSubcategories(subcats);
    } catch (err) {
      console.error('Error fetching data for plans:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckboxChange = (type, id) => {
    setForm(prev => {
      const list = prev[type];
      if (list.includes(id)) {
        return { ...prev, [type]: list.filter(item => item !== id) };
      } else {
        return { ...prev, [type]: [...list, id] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Parse features from comma separated string to array
    const payload = {
      ...form,
      features: typeof form.features === 'string' 
        ? form.features.split(',').map(f => f.trim()).filter(f => f) 
        : form.features
    };

    try {
      if (editingId) {
        const res = await API.put(`/plans/${editingId}`, payload);
        if (res.data.success) {
          setMessage('Plan updated successfully');
          setEditingId(null);
          setForm(initialFormState);
        }
      } else {
        const res = await API.post('/plans', payload);
        if (res.data.success) {
          setMessage('Plan created successfully');
          setForm(initialFormState);
        }
      }
      await fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Operation failed');
    }
    setLoading(false);
  };

  const handleEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      ...plan,
      features: plan.features.join(', '),
      allowedCategories: plan.allowedCategories.map(c => typeof c === 'object' ? c._id : c),
      allowedSubcategories: plan.allowedSubcategories.map(c => typeof c === 'object' ? c._id : c),
      allowedTrainingCategories: plan.allowedTrainingCategories ? plan.allowedTrainingCategories.map(c => typeof c === 'object' ? c._id : c) : []
    });
    // scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      const res = await API.delete(`/plans/${id}`);
      if (res.data.success) {
        setMessage('Plan deleted');
        fetchData();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <IndianRupee className="text-emerald-500" size={22} />
          <span>Pricing Plans Control</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">Create subscription plans and configure access to specific categories and subcategories.</p>
      </div>

      {message && (
        <div className="p-4 bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-sm">
          {message}
        </div>
      )}

      {/* Form Section */}
      <div className="glass-effect p-6 rounded-2xl border border-white/5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          {editingId ? <Edit size={16} className="text-orange-400" /> : <Plus size={16} className="text-emerald-400" />}
          <span>{editingId ? 'Edit Plan' : 'Create New Plan'}</span>
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Plan Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-indigo-500" placeholder="e.g. Premium Pro" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
              <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Clock size={12}/> Validity (Days)</label>
              <input type="number" required value={form.validityDays} onChange={e => setForm({...form, validityDays: e.target.value})} className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-indigo-500" placeholder="e.g. 30" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><DownloadCloud size={12}/> Daily Download Limit</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1"
                  required={form.dailyDownloadLimit !== -1}
                  disabled={form.dailyDownloadLimit === -1}
                  value={form.dailyDownloadLimit === -1 ? '' : form.dailyDownloadLimit} 
                  onChange={e => setForm({...form, dailyDownloadLimit: Number(e.target.value)})} 
                  className={`w-full bg-[#0b1021] border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:border-indigo-500 ${form.dailyDownloadLimit === -1 ? 'opacity-50' : ''}`} 
                  placeholder="e.g. 5" 
                />
                <label className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold cursor-pointer whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    checked={form.dailyDownloadLimit === -1}
                    onChange={(e) => setForm({...form, dailyDownloadLimit: e.target.checked ? -1 : 5})}
                    className="rounded border-emerald-500/50 bg-emerald-900/30 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  Unlimited
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Features (Comma Separated)</label>
            <input type="text" value={form.features} onChange={e => setForm({...form, features: e.target.value})} className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-indigo-500" placeholder="e.g. Unlimited Downloads, Premium Banners, Priority Support" />
          </div>

          {/* Access Configuration */}
          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/50">
            <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2"><Tag size={14}/> Access Configuration</h4>
            <p className="text-[10px] text-gray-500 mb-4">Select which categories and subcategories users on this plan can download from. If left empty, they might not have access to any premium content.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {categories.map(cat => (
                <div key={cat._id} className="space-y-2 bg-[#0b1021] p-3 rounded-lg border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.allowedCategories.includes(cat._id)}
                      onChange={() => handleCheckboxChange('allowedCategories', cat._id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-bold text-white">{cat.name} (Full Category Access)</span>
                  </label>
                  
                  {/* Subcategories for this category */}
                  <div className="pl-6 space-y-1.5 border-l-2 border-white/5 ml-2">
                    {subcategories.filter(sub => sub.categoryId === cat._id).map(sub => (
                      <label key={sub._id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={form.allowedSubcategories.includes(sub._id)}
                          onChange={() => handleCheckboxChange('allowedSubcategories', sub._id)}
                          className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-xs text-gray-300">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <h5 className="text-[10px] font-bold text-red-400 uppercase mt-6 mb-3">Training Module Access</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {trainingCategories.map(cat => (
                <div key={cat._id} className="bg-[#0b1021] p-3 rounded-lg border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.allowedTrainingCategories.includes(cat._id)}
                      onChange={() => handleCheckboxChange('allowedTrainingCategories', cat._id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm font-bold text-white">{cat.name}</span>
                  </label>
                </div>
              ))}
              {trainingCategories.length === 0 && <span className="text-xs text-gray-500">No training categories found.</span>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-premium hover:bg-gradient-premium-hover py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2">
              <Save size={16} />
              {loading ? 'Saving...' : editingId ? 'Update Plan' : 'Create Plan'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(initialFormState); }} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white text-sm cursor-pointer">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan._id} className="glass-effect rounded-2xl border border-white/10 p-5 flex flex-col hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-emerald-400">₹{plan.price}</span>
                  <span className="text-xs text-gray-500">/ {plan.validityDays} days</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(plan)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors cursor-pointer"><Edit size={16} /></button>
                <button onClick={() => handleDelete(plan._id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="space-y-4 flex-grow">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Limits</p>
                <p className="text-xs text-gray-300 bg-white/5 inline-block px-2 py-1 rounded">
                  {plan.dailyDownloadLimit === -1 ? 'Unlimited Downloads/day' : `${plan.dailyDownloadLimit} Downloads/day`}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1.5">Features</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  {plan.features.slice(0, 3).map((f, i) => <li key={i} className="flex gap-1"><span className="text-emerald-500">✓</span> {f}</li>)}
                  {plan.features.length > 3 && <li className="text-gray-500 italic">+ {plan.features.length - 3} more</li>}
                </ul>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1.5">Access Grants</p>
                <div className="flex flex-wrap gap-1">
                  {plan.allowedCategories.map(c => (
                    <span key={c._id || c} className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      {c.name || 'Category'}
                    </span>
                  ))}
                  {plan.allowedSubcategories.map(s => (
                     <span key={s._id || s} className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">
                     {s.name || 'Subcategory'}
                   </span>
                  ))}
                  {plan.allowedTrainingCategories?.map(t => (
                     <span key={t._id || t} className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/20">
                     Training: {t.name || 'Category'}
                   </span>
                  ))}
                  {plan.allowedCategories.length === 0 && plan.allowedSubcategories.length === 0 && (!plan.allowedTrainingCategories || plan.allowedTrainingCategories.length === 0) && (
                    <span className="text-[9px] text-gray-600">No specific access</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No pricing plans created yet. Create one above!
          </div>
        )}
      </div>

    </div>
  );
}
