import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const SearchableSelect = ({ options, value, onChange, placeholder = "-- Select --" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    const textToSearch = opt.cleanName || opt.label;
    return textToSearch.toLowerCase().startsWith(searchTerm.toLowerCase());
  });
  // Sort alphabetically
  filteredOptions.sort((a, b) => {
    const nameA = a.cleanName || a.label;
    const nameB = b.cleanName || b.label;
    return nameA.localeCompare(nameB);
  });

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-2">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-gray-400 text-[10px]">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-[200] w-full bottom-full mb-1 bg-[#0b0f19] border border-white/10 rounded-lg shadow-2xl max-h-64 flex flex-col">
          <div className="p-2 border-b border-white/10 sticky top-0 bg-[#0b0f19]">
            <input 
              type="text" 
              className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar pb-1">
            <div 
              className="px-3 py-2 text-xs text-gray-400 hover:bg-white/10 cursor-pointer"
              onClick={() => { onChange(""); setIsOpen(false); }}
            >
              {placeholder}
            </div>
            {filteredOptions.map(opt => (
              <div 
                key={opt.value}
                className={`px-3 py-2 text-xs text-white hover:bg-indigo-600 transition-colors cursor-pointer truncate ${value === opt.value ? 'bg-indigo-500/40 font-bold' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-xs text-gray-500 text-center">No matches found</div>
            )}
          </div>
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

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter States
  const [filterType, setFilterType] = useState('');
  const [filterSubcat, setFilterSubcat] = useState('');
  const [allClickableSubcategories, setAllClickableSubcategories] = useState([]);

  // Edit / Form States
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  
  const [previewForm, setPreviewForm] = useState({ categoryId: '', subcategoryId: '' });
  const [previewSubcategories, setPreviewSubcategories] = useState([]);

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



  // Fetch materials with pagination
  const fetchMaterials = async (pageNum = 1, query = searchQuery, tab = activeSubTab, fType = filterType, fSubcat = filterSubcat) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const typeQuery = tab === 'thumbnails' ? '&tabType=thumbnails' : '&tabType=main';
      const fTypeQuery = fType ? `&type=${fType}` : '';
      const fSubcatQuery = fSubcat ? `&subcategoryId=${fSubcat}` : '';

      const matRes = await API.get(`/admin/materials?page=${pageNum}&limit=20&search=${encodeURIComponent(query)}${typeQuery}${fTypeQuery}${fSubcatQuery}`);
      if (matRes.data.success) {
        if (pageNum === 1) {
          setMaterials(matRes.data.data);
        } else {
          setMaterials(prev => {
            const existingIds = new Set(prev.map(m => m._id));
            const newMaterials = matRes.data.data.filter(m => !existingIds.has(m._id));
            return [...prev, ...newMaterials];
          });
        }
        setHasMore(matRes.data.pagination?.hasMore ?? false);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const isFirstMount = useRef(true);

  // Debounced Search Fetch
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchMaterials(1, searchQuery, activeSubTab, filterType, filterSubcat);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Dropdown Filter Changes
  useEffect(() => {
    if (!isFirstMount.current) {
      setPage(1);
      fetchMaterials(1, searchQuery, activeSubTab, filterType, filterSubcat);
    }
  }, [filterType, filterSubcat, activeSubTab]);

  const observer = useRef();
  const lastMaterialElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchMaterials(nextPage, searchQuery);
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, searchQuery, activeSubTab]);

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
      await fetchMaterials(1);
      setPage(1);

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

      // Fetch all subcategories for filtering
      const subcatsRes = await API.get('/materials/subcategories');
      if (subcatsRes.data.success) {
        setAllClickableSubcategories(subcatsRes.data.data.filter(s => s.isClickable));
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

  // Fetch subcategories when preview form category changes
  useEffect(() => {
    if (previewForm.categoryId) {
      API.get(`/materials/categories/${previewForm.categoryId}/subcategories`)
        .then(res => {
          if (res.data.success) {
            setPreviewSubcategories(res.data.data);
          }
        })
        .catch(err => console.error('Error loading preview subcategories:', err));
    } else {
      setPreviewSubcategories([]);
    }
  }, [previewForm.categoryId]);

  const openPreview = (mat) => {
    setPreviewMaterial(mat);
    setPreviewForm({
      categoryId: mat.categoryId?._id || mat.categoryId || (categories.length > 0 ? categories[0]._id : ''),
      subcategoryId: mat.subcategoryId?._id || mat.subcategoryId || ''
    });
  };

  const handlePreviewAssign = async () => {
    if (!previewMaterial) return;
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('title', previewMaterial.title || '');
      formData.append('categoryId', previewForm.categoryId);
      formData.append('subcategoryId', previewForm.subcategoryId);
      formData.append('type', previewMaterial.type || 'Banner');
      formData.append('language', previewMaterial.language || 'English');
      formData.append('companyName', previewMaterial.companyName || '');
      formData.append('tags', previewMaterial.tags && Array.isArray(previewMaterial.tags) ? previewMaterial.tags.join(', ') : (previewMaterial.tags || ''));
      formData.append('isPremium', previewMaterial.isPremium || false);
      if (previewMaterial.watermarkTemplateId) {
        formData.append('watermarkTemplateId', previewMaterial.watermarkTemplateId?._id || previewMaterial.watermarkTemplateId);
      }

      const res = await API.put(`/admin/materials/${previewMaterial._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setMessage('Category assigned successfully!');
        fetchMaterials(1);
        setPreviewMaterial(null); // Close modal
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Assign failed');
    } finally {
      setLoading(false);
    }
  };

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
      } else if (materialForm.fileUrl) {
        formData.append('fileUrl', materialForm.fileUrl);
      }

      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail);
      } else if (materialForm.thumbnail) {
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
    setSelectedThumbnail(null);
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
            onClick={() => { setActiveSubTab('list'); setMessage(''); setPage(1); fetchMaterials(1, searchQuery, 'list'); }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              activeSubTab === 'list'
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            Manage List
          </button>

          <button
            onClick={() => { setActiveSubTab('thumbnails'); setMessage(''); setPage(1); fetchMaterials(1, searchQuery, 'thumbnails'); }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'thumbnails'
                ? 'bg-orange-600/10 border-orange-500/30 text-orange-400'
                : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            <Image size={14} />
            <span>Thumbnails</span>
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
      {(activeSubTab === 'list' || activeSubTab === 'thumbnails') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
            <select
              value={filterSubcat}
              onChange={(e) => setFilterSubcat(e.target.value)}
              className="bg-[#0b1021] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-auto shadow-md"
            >
              <option value="">All Subcategories</option>
              {allClickableSubcategories.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#0b1021] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-full sm:w-auto shadow-md"
            >
              <option value="">All Types</option>
              <option value="Banner">Image / Banner</option>
              <option value="Reel">Reels</option>
              <option value="Video">Video</option>
              <option value="PDF">PDF</option>
              <option value="Brochure">Brochure</option>
              <option value="PPT">PPT</option>
            </select>

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
                {materials.map((mat, index) => {
                  const isLastItem = index === materials.length - 1;
                  return (
                  <tr key={mat._id} ref={isLastItem ? lastMaterialElementRef : null} className="hover:bg-white/3 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center space-x-3">
                      <div 
                        className="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                        onClick={() => openPreview(mat)}
                        title="Click to preview"
                      >
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
                      </div>
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
                  );
                })}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      {materials.length === 0 ? "No marketing materials uploaded yet." : "No materials match your search."}
                    </td>
                  </tr>
                )}
                {loadingMore && (
                  <tr>
                    <td colSpan="8" className="p-4 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* Bulk Recover Sub-tab */}
      {activeSubTab === 'bulk-recover' && (
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles size={16} className="text-green-400" />
                <span>Bulk Recover from R2 ({unassignedFiles.length} found)</span>
              </h3>
              <button
                onClick={handleBulkSubmit}
                disabled={loading || selectedUnassigned.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20"
              >
                {loading ? 'Assigning...' : `Assign ${selectedUnassigned.length} Selected`}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category</label>
                <select
                  value={bulkForm.categoryId}
                  onChange={e => setBulkForm({ ...bulkForm, categoryId: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-green-500"
                >
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subcategory</label>
                <select
                  value={bulkForm.subcategoryId}
                  onChange={e => setBulkForm({ ...bulkForm, subcategoryId: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-green-500"
                >
                  <option value="">-- Choose Subcategory --</option>
                  {orderedSubcategories.map(s => (
                    <option key={s._id} value={s._id}>
                      {'\u00A0'.repeat(s.depth * 4)}{s.depth > 0 ? '↳ ' : ''}{s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Content Type</label>
                <select
                  value={bulkForm.type}
                  onChange={e => setBulkForm({ ...bulkForm, type: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-green-500"
                >
                  <option value="Banner">Banner (Image)</option>
                  <option value="Reel">Reel (Video)</option>
                  <option value="PDF">PDF / Brochure</option>
                  <option value="PPT">PPT Presentation</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Company</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={bulkForm.companyName}
                  onChange={e => setBulkForm({ ...bulkForm, companyName: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            {loading && unassignedFiles.length === 0 ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : unassignedFiles.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-xl">
                <Sparkles className="mx-auto text-gray-500 mb-2" size={24} />
                <p className="text-gray-400 text-sm">No recoverable materials found!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto p-2">
                {unassignedFiles.map(file => {
                  const isSelected = selectedUnassigned.includes(file._id);
                  const isVideo = file.fileUrl?.toLowerCase().match(/\.(mp4|mov|webm)$/);
                  const isPdf = file.fileUrl?.toLowerCase().match(/\.(pdf)$/);
                  const isPpt = file.fileUrl?.toLowerCase().match(/\.(ppt|pptx)$/);
                  
                  return (
                    <div 
                      key={file._id}
                      onClick={() => toggleSelectUnassigned(file._id)}
                      className={`relative group cursor-pointer rounded-xl overflow-hidden aspect-[4/5] border-2 transition-all ${
                        isSelected ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-transparent bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {/* Background Content */}
                      {isVideo ? (
                        <video src={file.fileUrl} className="w-full h-full object-cover" preload="metadata" />
                      ) : isPdf ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e]">
                          <FileText size={48} className="text-red-500 mb-2" />
                          <span className="text-white font-bold text-xs tracking-widest bg-red-600 px-2 py-0.5 rounded">PDF</span>
                        </div>
                      ) : isPpt ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e]">
                          <FileText size={48} className="text-orange-500 mb-2" />
                          <span className="text-white font-bold text-xs tracking-widest bg-orange-600 px-2 py-0.5 rounded">PPT</span>
                        </div>
                      ) : (
                        <img src={file.thumbnail || file.fileUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      
                      {/* Visual Overlay and Buttons */}
                      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="absolute inset-0 bg-black/40" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                          {isSelected ? (
                            <div className="bg-green-500 rounded-full p-1.5 shadow-lg mb-2">
                              <FileCheck size={20} className="text-white" />
                            </div>
                          ) : (
                            <p className="text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded mb-2">Click anywhere to Select</p>
                          )}
                          {!isSelected && (
                            <button 
                              type="button"
                              onMouseDown={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation(); 
                                setQuickAssignFile(file); 
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1 transition-transform hover:scale-105 mt-2 cursor-pointer relative z-20"
                            >
                              <Sparkles size={12} />
                              <span>Quick Assign</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Title Bar */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 z-10">
                        <p className="text-[10px] text-white truncate" title={file.title}>
                          {file.title || file.fileUrl?.split('/').pop()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                  <div className="w-full space-y-2">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Main File</label>
                    <input
                      type="file"
                      onChange={e => setSelectedFile(e.target.files[0])}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-gray-300 file:bg-indigo-600 file:border-0 file:rounded file:text-white file:px-3 file:py-1 file:mr-4 file:font-semibold cursor-pointer"
                    />
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Custom Thumbnail (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setSelectedThumbnail(e.target.files[0])}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs text-gray-300 file:bg-indigo-600 file:border-0 file:rounded file:text-white file:px-3 file:py-1 file:mr-4 file:font-semibold cursor-pointer"
                    />
                  </div>
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
                      disabled={!!selectedThumbnail || !!selectedFile}
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

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-[#0b1021] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-white font-bold truncate pr-4">{previewMaterial.title}</h3>
              <button 
                onClick={() => setPreviewMaterial(null)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center min-h-[300px] bg-black/50">
              {previewMaterial.type === 'Reel' || previewMaterial.type === 'Video' ? (
                <video 
                  src={previewMaterial.fileUrl} 
                  controls 
                  autoPlay 
                  ref={(el) => { if (el) el.playbackRate = 2.0; }}
                  className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
                />
              ) : previewMaterial.type === 'Banner' || previewMaterial.thumbnail ? (
                <img 
                  src={previewMaterial.fileUrl || previewMaterial.thumbnail} 
                  alt={previewMaterial.title} 
                  className="max-w-full max-h-[60vh] rounded-lg object-contain shadow-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
                  {previewMaterial.type === 'PPT' ? (
                    <FileCheck size={64} className="text-orange-400" />
                  ) : (
                    <FileText size={64} className="text-red-400" />
                  )}
                  <p className="text-sm">Preview not available for document types.</p>
                  <a 
                    href={previewMaterial.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Download / Open File
                  </a>
                </div>
              )}
            </div>
            
            {/* Quick Assign Panel inside Preview */}
            <div className="p-4 border-t border-white/10 bg-[#0b0f19] flex flex-col sm:flex-row items-center gap-4 rounded-b-2xl">
              <div className="flex-1 flex gap-4 w-full">
                <div className="flex-1 relative z-50">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category</label>
                  <select
                    value={previewForm.categoryId}
                    onChange={e => setPreviewForm({ ...previewForm, categoryId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 [&>option]:bg-[#0b0f19]"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 relative z-50">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subcategory</label>
                  <SearchableSelect
                    value={previewForm.subcategoryId}
                    onChange={(val) => setPreviewForm({ ...previewForm, subcategoryId: val })}
                    placeholder="-- Select Subcategory --"
                    options={flattenSubcategoryTree(buildSubcategoryTree(previewSubcategories)).map(s => ({
                      value: s._id,
                      label: `${'\u00A0'.repeat(s.depth * 4)}${s.depth > 0 ? '↳ ' : ''}${s.name}`,
                      cleanName: s.name
                    }))}
                  />
                </div>
              </div>
              <button
                onClick={handlePreviewAssign}
                disabled={loading}
                className="mt-4 sm:mt-0 px-6 py-2 h-[38px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap self-end sm:self-end flex items-center justify-center"
              >
                {loading ? 'Assigning...' : 'Assign Category'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
