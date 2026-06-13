import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { X, Upload, CheckCircle2, User, Phone, Mail, Building, Briefcase, Link as LinkIcon } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, fetchUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    state: user?.state || '',
    city: user?.city || '',
    occupationType: user?.occupationType || '',
    company: user?.company || '',
    designation: user?.designation || '',
    selectedCategoryId: user?.selectedCategoryId || '',
    selectedSubcategoryId: user?.selectedSubcategoryId || '',
    profilePhotoUrl: ''
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto ? (user.profilePhoto.startsWith('/uploads') ? `${window.location.protocol}//${window.location.hostname}:5000${user.profilePhoto}` : user.profilePhoto) : null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load Categories on mount
  useEffect(() => {
    API.get('/materials/categories')
      .then(res => {
        if (res.data.success) setCategories(res.data.data);
      })
      .catch(err => console.error(err));
  }, []);

  // Load Subcategories when Category changes
  useEffect(() => {
    if (formData.selectedCategoryId) {
      API.get(`/materials/categories/${formData.selectedCategoryId}/subcategories`)
        .then(res => {
          if (res.data.success) {
            setSubcategories(res.data.data);
          }
        })
        .catch(err => console.error(err));
    } else {
      setSubcategories([]);
    }
  }, [formData.selectedCategoryId]);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        state: user.state || '',
        city: user.city || '',
        occupationType: user.occupationType || '',
        company: user.company || '',
        designation: user.designation || '',
        selectedCategoryId: user.selectedCategoryId || '',
        selectedSubcategoryId: user.selectedSubcategoryId || '',
        profilePhotoUrl: ''
      });
      setPhotoPreview(user.profilePhoto ? (user.profilePhoto.startsWith('/uploads') ? `${window.location.protocol}//${window.location.hostname}:5000${user.profilePhoto}` : user.profilePhoto) : null);
      setPhoto(null);
      setError('');
      setSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'selectedCategoryId') {
        newData.selectedSubcategoryId = ''; // Reset subcategory when category changes
      }
      return newData;
    });
    if (name === 'profilePhotoUrl' && value.trim() !== '') {
      setPhotoPreview(value);
      setPhoto(null);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, profilePhotoUrl: '' })); // clear URL if file picked
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (photo) {
        data.append('profilePhoto', photo);
      }

      const res = await API.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccess(true);
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        await fetchUser(); // Refresh the global user state
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">My Profile</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-orange-500 transition-colors rounded-full hover:bg-orange-50">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} /> Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Photo Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center text-slate-400">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <label className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <Upload size={18} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium mb-3">Upload photo OR paste link below</p>

              <div className="w-full relative max-w-xs">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="profilePhotoUrl"
                  value={formData.profilePhotoUrl}
                  onChange={handleChange}
                  placeholder="Paste Image URL here..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
              <div className="group">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full pl-12 pr-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">Mobile</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input required type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="block w-full pl-12 pr-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="block w-full pl-12 pr-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. MH" className="block w-full px-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" className="block w-full px-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">Occupation Type</label>
                <select name="occupationType" value={formData.occupationType} onChange={handleChange} className="block w-full px-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer">
                  <option value="">Select Occupation...</option>
                  <option value="Agent">Agent</option>
                  <option value="Advisor">Advisor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {(formData.occupationType === 'Agent' || formData.occupationType === 'Advisor') && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">Company</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. LIC" className="block w-full pl-12 pr-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">Designation</label>
                    <div className="relative">
                      <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Advisor" className="block w-full pl-12 pr-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" />
                    </div>
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">Primary Category</label>
                <select name="selectedCategoryId" value={formData.selectedCategoryId} onChange={handleChange} className="block w-full px-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer">
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-orange-600">Specialization (Subcategory)</label>
                <select name="selectedSubcategoryId" value={formData.selectedSubcategoryId} onChange={handleChange} className="block w-full px-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer">
                  <option value="">Select Subcategory...</option>
                  {subcategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-premium hover:bg-gradient-premium-hover text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Save Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
