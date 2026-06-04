import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Plus, Trash2, X, Play, Video, Tag } from 'lucide-react';

export default function TrainingManager() {
  const [categories, setCategories] = useState([]);
  const [trainings, setTrainings] = useState([]);
  
  // Status Messages
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Global Setting
  const [isPublic, setIsPublic] = useState(true);

  // Form States
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '', youtubeVideoId: '', categoryId: '' });

  const fetchCategories = async () => {
    try {
      const res = await API.get('/trainings/categories');
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0 && !trainingForm.categoryId) {
          setTrainingForm(prev => ({ ...prev, categoryId: res.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching training categories:', err);
    }
  };

  const fetchTrainings = async () => {
    try {
      const res = await API.get('/trainings?all=true'); // fetch all
      if (res.data.success) {
        setTrainings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await API.get('/settings');
      if (res.data.success) {
        setIsPublic(res.data.data.isTrainingPublic);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTrainings();
    fetchSettings();
  }, []);

  const togglePublicSetting = async () => {
    try {
      const res = await API.put('/settings', { isTrainingPublic: !isPublic });
      if (res.data.success) {
        setIsPublic(!isPublic);
        setMessage(`Success: Training module is now ${!isPublic ? 'PUBLIC (Available to all)' : 'RESTRICTED (Available only via specific plans)'}`);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update settings');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/trainings/categories', categoryForm);
      if (res.data.success) {
        setMessage('Success: Category created successfully!');
        setCategoryForm({ name: '', description: '' });
        await fetchCategories();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create category');
    }
    setLoading(false);
  };

  const handleCategoryDelete = async (catId) => {
    if (!window.confirm('Warning: Deleting this category will deactivate all trainings under it. Proceed?')) return;
    try {
      const res = await API.delete(`/trainings/categories/${catId}`);
      if (res.data.success) {
        setMessage('Success: Category deleted successfully');
        await fetchCategories();
        await fetchTrainings();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleTrainingSubmit = async (e) => {
    e.preventDefault();
    if (!trainingForm.categoryId) {
      setMessage('Error: Please select a category first.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/trainings', trainingForm);
      if (res.data.success) {
        setMessage('Success: Training video added successfully!');
        setTrainingForm(prev => ({ ...prev, title: '', description: '', youtubeVideoId: '' }));
        await fetchTrainings();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add training');
    }
    setLoading(false);
  };

  const handleTrainingDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training?')) return;
    try {
      const res = await API.delete(`/trainings/${id}`);
      if (res.data.success) {
        setMessage('Success: Training deleted successfully!');
        await fetchTrainings();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete training');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Play className="text-red-500" size={22} />
            <span>Training Management</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Manage training categories and embed YouTube videos.</p>
        </div>

        {/* Global Public Toggle */}
        <div className="flex flex-col items-end">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-900 border border-white/10 rounded-xl shadow-lg">
            <span className="text-xs font-bold text-white">Global Access:</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={isPublic} onChange={togglePublicSetting} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isPublic ? 'text-emerald-400' : 'text-gray-500'}`}>
              {isPublic ? 'Public (All Users)' : 'Restricted (By Plan)'}
            </span>
          </label>
          <p className="text-[9px] text-gray-500 mt-2 max-w-[200px] text-right leading-tight">
            If restricted, only users with a purchased plan that explicitly includes Training Access can view it.
          </p>
        </div>
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

      {/* Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-effect p-6 rounded-2xl border border-white/5 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-1.5">
            <Tag className="text-indigo-400" size={16} />
            <span>Create Category</span>
          </h3>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category Name</label>
              <input
                type="text" required
                value={categoryForm.name}
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-indigo-500"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-premium hover:bg-gradient-premium-hover py-2.5 rounded-xl font-semibold text-white text-xs cursor-pointer">
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-effect p-6 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Existing Categories</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase font-semibold">
                <th className="p-3">Name</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {categories.map(c => (
                <tr key={c._id} className="hover:bg-white/3">
                  <td className="p-3 font-bold text-white">{c.name}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleCategoryDelete(c._id)} className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan="2" className="p-6 text-center text-gray-500">No categories found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Videos Section */}
      <div className="border-t border-white/10 pt-8">
        <h3 className="text-md font-bold text-white flex items-center space-x-2 mb-4">
          <Video className="text-red-400" size={18} />
          <span>Video Manager</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass-effect p-6 rounded-2xl border border-white/5 shadow-xl h-fit">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Add YouTube Video</h4>
            <form onSubmit={handleTrainingSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                <select required value={trainingForm.categoryId} onChange={e => setTrainingForm({ ...trainingForm, categoryId: e.target.value })} className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-indigo-500 [&>option]:bg-[#0b1021]">
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
                <input type="text" required value={trainingForm.title} onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })} className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">YouTube Link / Video ID</label>
                <input type="text" required value={trainingForm.youtubeVideoId} onChange={e => setTrainingForm({ ...trainingForm, youtubeVideoId: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-indigo-500" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-premium hover:bg-gradient-premium-hover py-2.5 rounded-xl font-semibold text-white text-xs cursor-pointer">
                {loading ? 'Adding...' : 'Add Video'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-effect p-6 rounded-2xl border border-white/5 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase font-semibold">
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                   {trainings.map(t => (
                     <tr key={t._id} className="hover:bg-white/3">
                       <td className="p-3 font-semibold text-white">
                         <div className="flex items-center space-x-3">
                           <img src={`https://img.youtube.com/vi/${t.youtubeVideoId}/default.jpg`} className="w-12 h-8 object-cover rounded" alt="thumb" />
                           <span>{t.title}</span>
                         </div>
                       </td>
                       <td className="p-3">{t.categoryId?.name || 'Unknown'}</td>
                       <td className="p-3">
                         <span className={`px-2 py-1 rounded text-[9px] font-bold ${t.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                           {t.isActive ? 'ACTIVE' : 'INACTIVE'}
                         </span>
                       </td>
                       <td className="p-3 text-right">
                          <button onClick={() => handleTrainingDelete(t._id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                       </td>
                     </tr>
                   ))}
                   {trainings.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No training videos added yet.</td></tr>}
                 </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
