import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { LayoutGrid, Upload, Edit, Trash2, X, Plus, Image, ShieldAlert, Sparkles, FileText, FileCheck } from 'lucide-react';

// Tree helpers for nested subcategories
const buildSubcategoryTree = (items, parentId = null) => {
  const branch = [];
  items.forEach(item => {
    const itemParentId = item.parentSubcategoryId?._id || item.parentSubcategoryId || null;
    const match = parentId
      ? itemParentId?.toString() === parentId.toString()
      : !itemParentId;
    if (match) {
      const children = buildSubcategoryTree(items, item._id);
      branch.push({
        ...item,
        children: children.length > 0 ? children : []
      });
    }
  });
  return branch;
};

const flattenSubcategoryTree = (tree, depth = 0) => {
  let flat = [];
  tree.forEach(node => {
    flat.push({ ...node, depth });
    if (node.children && node.children.length > 0) {
      flat = [...flat, ...flattenSubcategoryTree(node.children, depth + 1)];
    }
  });
  return flat;
};

const TagInput = ({ value, onChange, availableTags }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const filteredSuggestions = availableTags.filter(
    t => t.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(t)
  );

  const addTag = (tag) => {
    if (!tag) return;
    const newTags = [...tags, tag];
    onChange(newTags.join(', '));
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    }
  };

  return (
    <div className="relative">
      <div className="w-full min-h-[44px] bg-[#0b1021] border border-white/10 rounded-xl px-2 py-1.5 flex flex-wrap items-center gap-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        {tags.map((tag, i) => (
          <span key={i} className="bg-indigo-500 text-white px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-200 transition-colors cursor-pointer">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? "Type a tag & press Enter..." : "Add more tags..."}
          className="flex-1 min-w-[150px] bg-transparent text-white text-sm focus:outline-none py-1 px-2"
        />
      </div>
      {showSuggestions && (filteredSuggestions.length > 0 || inputValue.trim()) && (
        <div className="absolute z-20 w-full mt-1 bg-[#0b1021] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(suggestion); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer border-b border-white/5 last:border-0"
              >
                {suggestion}
              </button>
            ))
          ) : (
            inputValue.trim() && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(inputValue.trim()); }}
                className="w-full text-left px-4 py-2.5 text-sm text-indigo-400 font-semibold hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus size={14} /> Create "{inputValue.trim()}"
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default function MaterialManager() {
  const [activeSubTab, setActiveSubTab] = useState('list'); // list or form
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [globalTags, setGlobalTags] = useState([]);
  const [watermarks, setWatermarks] = useState([]);
  
  // Status Messages
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit / Form States
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [materialForm, setMaterialForm] = useState({
    title: '',
    categoryId: '',
    subcategoryId: '',
    type: 'Banner',
    language: 'English',
    companyName: '',
    tags: '',
    isPremium: false,
    fileUrl: '',
    thumbnail: '',
    watermarkTemplateId: ''
  });

  // Fetch basic datasets
  const fetchData = async () => {
    try {
      // Fetch categories
      const catRes = await API.get('/materials/categories');
      if (catRes.data.success) {
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0 && !materialForm.categoryId) {
          setMaterialForm(prev => ({ ...prev, categoryId: catRes.data.data[0]._id }));
        }
      }

      // Fetch materials
      const matRes = await API.get('/admin/materials');
      if (matRes.data.success) {
        setMaterials(matRes.data.data);
      }

      // Fetch global tags
      const tagRes = await API.get('/materials/tags');
      if (tagRes.data.success) {
        setGlobalTags(tagRes.data.data);
      }

      // Fetch watermarks
      const wmRes = await API.get('/watermarks');
      if (wmRes.data.success) {
        setWatermarks(wmRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching material data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch subcategories when material form category changes
  useEffect(() => {
    if (materialForm.categoryId) {
      API.get(`/materials/categories/${materialForm.categoryId}/subcategories`)
        .then(res => {
          if (res.data.success) {
            setSubcategories(res.data.data);
            if (res.data.data.length > 0) {
              setMaterialForm(prev => ({ ...prev, subcategoryId: res.data.data[0]._id }));
            } else {
              setMaterialForm(prev => ({ ...prev, subcategoryId: '' }));
            }
          }
        })
        .catch(err => console.error('Error loading form subcategories:', err));
    }
  }, [materialForm.categoryId]);

  // Handle Material Submit
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', materialForm.title);
      formData.append('categoryId', materialForm.categoryId);
      formData.append('subcategoryId', materialForm.subcategoryId);
      formData.append('type', materialForm.type);
      formData.append('language', materialForm.language);
      formData.append('companyName', materialForm.companyName);
      formData.append('tags', materialForm.tags);
      formData.append('isPremium', materialForm.isPremium);
      if (materialForm.watermarkTemplateId) {
        formData.append('watermarkTemplateId', materialForm.watermarkTemplateId);
      }

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('fileUrl', materialForm.fileUrl);
        formData.append('thumbnail', materialForm.thumbnail);
      }

      let res;
      
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      if (editingMaterial) {
        // Edit / Update
        res = await API.put(`/admin/materials/${editingMaterial._id}`, formData, config);
      } else {
        // Create / Upload
        res = await API.post('/admin/materials', formData, config);
      }

      if (res.data.success) {
        setMessage(editingMaterial ? 'Success: Material updated successfully!' : 'Success: Material uploaded successfully!');
        resetForm();
        setActiveSubTab('list');
        fetchData();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Operation failed');
    }
    setLoading(false);
    setUploadProgress(0);
  };

  // Handle Material Delete
  const handleMaterialDelete = async (matId) => {
    if (!window.confirm('Are you sure you want to delete this marketing material?')) return;
    try {
      const res = await API.delete(`/admin/materials/${matId}`);
      if (res.data.success) {
        setMessage('Success: Material deleted successfully');
        fetchData();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete material');
    }
  };

  // Handle Edit Click
  const handleEditClick = (mat) => {
    setEditingMaterial(mat);
    setMaterialForm({
      title: mat.title,
      categoryId: mat.categoryId?._id || mat.categoryId || '',
      subcategoryId: mat.subcategoryId?._id || mat.subcategoryId || '',
      type: mat.type,
      language: mat.language || 'English',
      companyName: mat.companyName || '',
      tags: mat.tags?.join(', ') || '',
      isPremium: mat.isPremium || false,
      fileUrl: mat.fileUrl || '',
      thumbnail: mat.thumbnail || '',
      watermarkTemplateId: mat.watermarkTemplateId?._id || mat.watermarkTemplateId || ''
    });
    setActiveSubTab('form');
  };

  // Reset form helper
  const resetForm = () => {
    setEditingMaterial(null);
    setSelectedFile(null);
    setMaterialForm({
      title: '',
      categoryId: categories[0]?._id || '',
      subcategoryId: '',
      type: 'Banner',
      language: 'English',
      companyName: '',
      tags: '',
      isPremium: false,
      fileUrl: '',
      thumbnail: ''
    });
  };

  const subcategoryTree = buildSubcategoryTree(subcategories);
  const orderedSubcategories = flattenSubcategoryTree(subcategoryTree);

  const filteredMaterials = materials.filter(mat => 
    mat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <LayoutGrid className="text-indigo-400" size={22} />
            <span>Marketing Materials Manager</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Upload, edit, delete, and control your banners, reels, brochures, and documents.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setActiveSubTab('list'); setMessage(''); }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              activeSubTab === 'list'
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            Manage List
          </button>
          
          <button
            onClick={() => { setActiveSubTab('form'); setMessage(''); resetForm(); }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'form' && !editingMaterial
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            <Upload size={14} />
            <span>Upload New</span>
          </button>

          {editingMaterial && (
            <button
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 flex items-center space-x-1 hover:bg-yellow-500/20 transition-all cursor-pointer"
            >
              <X size={14} />
              <span>Cancel Edit</span>
            </button>
          )}
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

      {/* List Sub-tab */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <input
              type="text"
              placeholder="Search by title, company, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0b1021] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-80 shadow-md"
            />
          </div>
          <div className="glass-effect rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="p-4">Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Lang</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Subcategory</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Access Plan</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredMaterials.map((mat) => (
                  <tr key={mat._id} className="hover:bg-white/3 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center space-x-3">
                      {mat.type === 'Reel' || mat.type === 'Video' ? (
                        <video src={mat.fileUrl} muted preload="none" className="w-10 h-6 object-cover rounded border border-white/10" />
                      ) : mat.type === 'PDF' || mat.type === 'Brochure' || mat.type === 'PPT' ? (
                        <div className="w-10 h-6 bg-slate-900 border border-white/10 rounded flex items-center justify-center">
                          {mat.type === 'PPT' ? (
                            <FileCheck className="text-orange-400" size={12} />
                          ) : (
                            <FileText className="text-red-400" size={12} />
                          )}
                        </div>
                      ) : mat.thumbnail ? (
                        <img src={mat.thumbnail} alt="" className="w-10 h-6 object-cover rounded border border-white/10" />
                      ) : (
                        <div className="w-10 h-6 bg-slate-900 border border-white/10 rounded flex items-center justify-center text-gray-600">
                          <Image size={12} />
                        </div>
                      )}
                      <span className="truncate max-w-[180px]">{mat.title}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-white/5 px-2.5 py-0.5 border border-white/10 rounded-md font-semibold">{mat.type}</span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-300">{mat.language || 'English'}</td>
                    <td className="p-4 text-gray-400">{mat.categoryId?.name || 'General'}</td>
                    <td className="p-4 text-gray-400">{mat.subcategoryId?.name || '-'}</td>
                    <td className="p-4 text-gray-400">{mat.companyName || '-'}</td>
                    <td className="p-4">
                      {mat.isPremium ? (
                        <span className="text-purple-400 font-bold flex items-center space-x-1">
                          <Sparkles size={12} />
                          <span>Premium</span>
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">Free</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(mat)}
                        className="p-1.5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 rounded transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleMaterialDelete(mat._id)}
                        className="p-1.5 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer"
                        title="Delete Material"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      {materials.length === 0 ? "No marketing materials uploaded yet." : "No materials match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* Form Sub-tab (Create or Edit Form) */}
      {activeSubTab === 'form' && (
        <div className="glass-effect p-6 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
            <Upload size={16} className="text-indigo-400" />
            <span>{editingMaterial ? `Edit Content Details: ${editingMaterial.title}` : 'Publish Marketing Material'}</span>
          </h3>

          <form onSubmit={handleMaterialSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Material Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Protection Banner"
                  value={materialForm.title}
                  onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Star Health / LIC"
                  value={materialForm.companyName}
                  onChange={e => setMaterialForm({ ...materialForm, companyName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={materialForm.categoryId}
                  onChange={e => setMaterialForm({ ...materialForm, categoryId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-[#0b0f19]"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subcategory</label>
                <select
                  required
                  value={materialForm.subcategoryId}
                  onChange={e => setMaterialForm({ ...materialForm, subcategoryId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-[#0b0f19]"
                >
                  <option value="">-- Choose Subcategory --</option>
                  {orderedSubcategories.map(s => (
                    <option key={s._id} value={s._id}>
                      {'\u00A0'.repeat(s.depth * 4)}{s.depth > 0 ? '↳ ' : ''}{s.name}
                    </option>
                  ))}
                  {orderedSubcategories.length === 0 && <option value="" disabled>No subcategories. Create one first!</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Content Type</label>
                <select
                  value={materialForm.type}
                  onChange={e => setMaterialForm({ ...materialForm, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-[#0b0f19]"
                >
                  <option value="Banner">Banner (Image)</option>
                  <option value="Reel">Reel (Video)</option>
                  <option value="PDF">PDF / Brochure</option>
                  <option value="PPT">PPT Presentation</option>
                  <option value="Video">Video Link</option>
                  <option value="Brochure">Brochure Link</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Language</label>
                <select
                  value={materialForm.language || 'English'}
                  onChange={e => setMaterialForm({ ...materialForm, language: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-[#0b0f19]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Both">Both (Hindi + English)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Watermark Template</label>
                <select
                  value={materialForm.watermarkTemplateId}
                  onChange={e => setMaterialForm({ ...materialForm, watermarkTemplateId: e.target.value })}
                  disabled={materialForm.type !== 'Banner' && materialForm.type !== 'Reel'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-[#0b0f19] disabled:opacity-50"
                >
                  <option value="">-- No Watermark / Default --</option>
                  {watermarks.map(wm => (
                    <option key={wm._id} value={wm._id}>{wm.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">Only applicable for Banners and Reels</p>
              </div>

              <div className="relative z-10 md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Search Tags</label>
                <TagInput 
                  value={materialForm.tags} 
                  onChange={(val) => setMaterialForm({ ...materialForm, tags: val })}
                  availableTags={globalTags}
                />
              </div>

            </div>

            <div className="border-t border-white/5 pt-5 space-y-4">
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={materialForm.isPremium}
                  onChange={e => setMaterialForm({ ...materialForm, isPremium: e.target.checked })}
                  className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500 bg-white/5 cursor-pointer"
                />
                <label htmlFor="isPremium" className="text-sm font-semibold text-gray-300 cursor-pointer select-none">Set as Premium (PRO Plan Only)</label>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Choose File Source</label>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <input
                    type="file"
                    onChange={e => setSelectedFile(e.target.files[0])}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-gray-300 file:bg-indigo-600 file:border-0 file:rounded file:text-white file:px-3 file:py-1 file:mr-4 file:font-semibold cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 font-bold">OR</span>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="url"
                      placeholder={editingMaterial ? "Keep empty or paste new File URL" : "Paste Remote File URL"}
                      value={materialForm.fileUrl}
                      onChange={e => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                      disabled={!!selectedFile}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white disabled:opacity-30 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="url"
                      placeholder={editingMaterial ? "Keep empty or paste new Thumbnail URL" : "Paste Remote Thumbnail URL"}
                      value={materialForm.thumbnail}
                      onChange={e => setMaterialForm({ ...materialForm, thumbnail: e.target.value })}
                      disabled={!!selectedFile}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-white disabled:opacity-30 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden w-full bg-gradient-premium hover:bg-gradient-premium-hover py-3 rounded-xl font-semibold text-white text-sm transition-all shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center justify-center disabled:opacity-90 disabled:cursor-not-allowed"
            >
              {loading && uploadProgress > 0 && uploadProgress < 100 && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              )}
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                    {uploadProgress < 100 
                      ? `Uploading... ${uploadProgress}%` 
                      : 'Compressing & Finalizing... Please wait'}
                  </>
                ) : editingMaterial ? (
                  'Update Marketing Material'
                ) : (
                  'Publish Marketing Material'
                )}
              </span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
