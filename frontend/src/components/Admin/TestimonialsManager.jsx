import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Trash2, Search, Star } from 'lucide-react';
import API from '../../services/api';

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await API.get('/testimonials/admin/all');
      if (res.data.success) {
        setTestimonials(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const res = await API.put(`/testimonials/admin/${id}/approve`);
      if (res.data.success) {
        setTestimonials(testimonials.map(t => t._id === id ? { ...t, isApproved: !currentStatus } : t));
      }
    } catch (err) {
      console.error('Error toggling approval:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await API.delete(`/testimonials/admin/${id}`);
      if (res.data.success) {
        setTestimonials(testimonials.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('Failed to delete');
    }
  };

  const filtered = testimonials.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.designation.toLowerCase().includes(search.toLowerCase()) ||
    t.message.toLowerCase().includes(search.toLowerCase())
  );

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star key={index} size={12} className={index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} className="text-indigo-400" />
            Testimonials Management
          </h2>
          <p className="text-sm text-gray-400 mt-1">Review and approve user feedback before it appears on the website.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1f2937] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#111827] rounded-2xl border border-white/5">
          <MessageSquare size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
          <p className="text-gray-400 font-medium">No testimonials found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(t => (
            <div key={t._id} className="bg-[#111827] rounded-2xl border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden group">
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${t.isApproved ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {t.isApproved ? 'Approved (Live)' : 'Pending Review'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-xs text-gray-400">{t.designation}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {renderStars(t.rating)}
                </div>

                <div className="bg-[#1f2937] rounded-xl p-4 border border-white/5">
                  <p className="text-sm text-gray-300 italic">"{t.message}"</p>
                </div>
                
                <div className="text-[10px] text-gray-500">
                  Submitted on: {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => toggleApproval(t._id, t.isApproved)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    t.isApproved 
                      ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                  }`}
                >
                  {t.isApproved ? <><X size={14} /> Unpublish</> : <><Check size={14} /> Approve & Publish</>}
                </button>

                <button
                  onClick={() => handleDelete(t._id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
