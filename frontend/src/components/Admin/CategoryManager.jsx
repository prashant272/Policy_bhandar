import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Plus, FolderPlus, Trash2, X, FolderTree, Tag, Info, Folder } from 'lucide-react';

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

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  // Status Messages
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: 'heartPulse', isClickable: true });
  const [subcatForm, setSubcatForm] = useState({ categoryId: '', parentSubcategoryId: '', name: '', isClickable: true });

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await API.get('/materials/categories');
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(res.data.data[0]._id);
          setSubcatForm(prev => ({ ...prev, categoryId: res.data.data[0]._id, parentSubcategoryId: '' }));
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch Subcategories for the selected Category
  const fetchSubcategories = async (catId) => {
    if (!catId) return;
    try {
      const res = await API.get(`/materials/categories/${catId}/subcategories`);
      if (res.data.success) {
        setSubcategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchSubcategories(selectedCategoryId);
      setSubcatForm(prev => ({ ...prev, categoryId: selectedCategoryId, parentSubcategoryId: '' }));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  // Handle Category Submit
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/admin/categories', categoryForm);
      if (res.data.success) {
        setMessage('Success: Category created successfully!');
        setCategoryForm({ name: '', icon: 'heartPulse', isClickable: true });
        await fetchCategories();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create category');
    }
    setLoading(false);
  };

  // Handle Category Delete
  const handleCategoryDelete = async (catId) => {
    if (!window.confirm('Warning: Deleting this category will delete all subcategories and materials under it. Proceed?')) return;
    try {
      const res = await API.delete(`/admin/categories/${catId}`);
      if (res.data.success) {
        setMessage('Success: Category deleted successfully');
        if (selectedCategoryId === catId) {
          setSelectedCategoryId('');
        }
        await fetchCategories();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete category');
    }
  };

  // Handle Subcategory Submit
  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    if (!subcatForm.categoryId) {
      setMessage('Error: Please select a category first.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/admin/subcategories', subcatForm);
      if (res.data.success) {
        setMessage('Success: Subcategory created successfully!');
        setSubcatForm(prev => ({ ...prev, name: '', parentSubcategoryId: '', isClickable: true }));
        await fetchSubcategories(selectedCategoryId);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create subcategory');
    }
    setLoading(false);
  };

  // Optional: Handle Subcategory Delete
  const handleSubcategoryDelete = async (subcatId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      const res = await API.delete(`/admin/subcategories/${subcatId}`);
      if (res.data.success) {
        setMessage('Success: Subcategory deleted successfully!');
        await fetchSubcategories(selectedCategoryId);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete subcategory');
    }
  };

  const subcategoryTree = buildSubcategoryTree(subcategories);
  const orderedSubcategories = flattenSubcategoryTree(subcategoryTree);

  return (
    <div className="space-y-6">
      
      {/* Category Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <FolderTree className="text-indigo-400" size={22} />
          <span>Category & Subcategory Management</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">Configure your content organization categories and their related sub-folders.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Creation Form */}
        <div className="lg:col-span-1 glass-effect p-6 rounded-2xl border border-white/5 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-1.5">
            <Plus className="text-indigo-400" size={16} />
            <span>Create Category</span>
          </h3>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Life Insurance"
                value={categoryForm.name}
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Icon Reference (Optional)
              </label>
              <input
                type="text"
                value={categoryForm.icon}
                onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="e.g. briefcase, shield, heartPulse"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="catIsClickable"
                checked={categoryForm.isClickable}
                onChange={e => setCategoryForm({ ...categoryForm, isClickable: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="catIsClickable" className="text-sm text-gray-300">
                Make Link Clickable in Navbar
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-premium hover:bg-gradient-premium-hover py-2.5 rounded-xl font-semibold text-white text-xs transition-all cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-2 glass-effect p-6 rounded-2xl border border-white/5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Existing Categories
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase font-semibold">
                  <th className="p-3">Category Name</th>
                  <th className="p-3">Icon Key</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {categories.map(c => (
                  <tr 
                    key={c._id} 
                    className={`hover:bg-white/3 transition-colors cursor-pointer ${selectedCategoryId === c._id ? 'bg-indigo-600/10' : ''}`}
                    onClick={() => setSelectedCategoryId(c._id)}
                  >
                    <td className="p-3 font-bold text-white flex items-center space-x-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedCategoryId === c._id ? 'bg-indigo-400 animate-pulse' : 'bg-gray-600'}`}></div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-3 font-mono text-gray-400">{c.icon}</td>
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleCategoryDelete(c._id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-gray-500">No categories created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Subcategory Manager Area */}
      <div className="border-t border-white/10 pt-8">
        <h3 className="text-md font-bold text-white flex items-center space-x-2 mb-4">
          <FolderPlus className="text-purple-400" size={18} />
          <span>Subcategory Manager</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Subcategory Form */}
          <div className="lg:col-span-1 glass-effect p-6 rounded-2xl border border-white/5 shadow-xl h-fit">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Add Subcategory
            </h4>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Parent Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={e => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-[#0b0f19]"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Parent Subcategory (Optional)
                </label>
                <select
                  value={subcatForm.parentSubcategoryId}
                  onChange={e => setSubcatForm({ ...subcatForm, parentSubcategoryId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [&>option]:bg-[#0b0f19]"
                >
                  <option value="">-- None (Root Level) --</option>
                  {orderedSubcategories.map(s => (
                    <option key={s._id} value={s._id}>
                      {'\u00A0'.repeat(s.depth * 4)}{s.depth > 0 ? '↳ ' : ''}{s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Subcategory Name
                </label>
                <input
                  id="subcategory-name-input"
                  type="text"
                  required
                  placeholder="e.g. Health Insurance, Posters"
                  value={subcatForm.name}
                  onChange={e => setSubcatForm({ ...subcatForm, name: e.target.value })}
                  className="w-full bg-[#0b1021] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="subcatIsClickable"
                  checked={subcatForm.isClickable}
                  onChange={e => setSubcatForm({ ...subcatForm, isClickable: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="subcatIsClickable" className="text-sm text-gray-300">
                  Make Link Clickable in Navbar
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedCategoryId}
                className="w-full bg-gradient-premium hover:bg-gradient-premium-hover py-2.5 rounded-xl font-semibold text-white text-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                {loading ? 'Adding...' : 'Add Subcategory'}
              </button>
            </form>
          </div>

          {/* Subcategories Display Table */}
          <div className="lg:col-span-2 glass-effect p-6 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Tag className="text-purple-400" size={14} />
                <span>
                  Subcategories under:{' '}
                  <span className="text-indigo-400">
                    {categories.find(c => c._id === selectedCategoryId)?.name || '(Select above)'}
                  </span>
                </span>
              </h4>
              <span className="text-[10px] text-gray-500 flex items-center space-x-1 font-semibold">
                <Info size={12} />
                <span>Click category in table to switch</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase font-semibold">
                    <th className="p-3">Subcategory Name</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                   {orderedSubcategories.map(sub => (
                     <tr key={sub._id} className="hover:bg-white/3 transition-colors">
                       <td className="p-3 font-semibold text-white">
                         <div 
                           className="flex items-center space-x-2" 
                           style={{ paddingLeft: `${sub.depth * 20}px` }}
                         >
                           <span className="text-gray-500 font-mono text-xs">{sub.depth > 0 ? '└─ ' : ''}</span>
                           <Folder size={14} className={sub.depth > 0 ? "text-purple-400/70" : "text-purple-400"} />
                           <span className={`${sub.depth > 0 ? 'text-purple-300/80 font-normal' : 'text-purple-200 font-bold'}`}>{sub.name}</span>
                         </div>
                       </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSubcatForm(prev => ({
                                ...prev,
                                categoryId: selectedCategoryId,
                                parentSubcategoryId: sub._id,
                                name: ''
                              }));
                              document.getElementById('subcategory-name-input')?.focus();
                            }}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors cursor-pointer mr-2 inline-flex items-center justify-center"
                            title="Add Sub-subcategory inside this"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => handleSubcategoryDelete(sub._id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Delete Subcategory"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                     </tr>
                   ))}
                   {orderedSubcategories.length === 0 && selectedCategoryId && (
                     <tr>
                       <td colSpan="2" className="p-6 text-center text-gray-500">No subcategories exist for this category. Create one!</td>
                     </tr>
                   )}
                   {!selectedCategoryId && (
                     <tr>
                       <td colSpan="2" className="p-6 text-center text-gray-500">Select or create a parent category above to view subcategories.</td>
                     </tr>
                   )}
                 </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
