import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';

export default function WatermarkManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    layoutType: 'bottom-bar',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    textColor: '#ffffff',
    accentColor: '#a855f7',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    showUserPhoto: true,
    showUserName: true,
    showUserDetails: true,
    showUserMobile: true,
    sizeScale: 100,
    imageScale: 100,
    showSocialIcons: true,
    appendMode: false
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await API.get('/watermarks');
      setTemplates(res.data.data);
    } catch (err) {
      console.error('Error fetching watermarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      layoutType: 'bottom-bar',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      textColor: '#ffffff',
      accentColor: '#a855f7',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      showUserPhoto: true,
      showUserName: true,
      showUserDetails: true,
      showUserMobile: true,
      sizeScale: 100,
      imageScale: 100,
      showSocialIcons: true,
      appendMode: false
    });
    setLogoFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (logoFile) {
        data.append('logo', logoFile);
      }

      if (editingId) {
        await API.put(`/watermarks/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Template updated successfully');
      } else {
        await API.post('/watermarks', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Template created successfully');
      }
      resetForm();
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving template');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await API.delete(`/watermarks/${id}`);
        fetchTemplates();
      } catch (err) {
        alert('Error deleting template');
      }
    }
  };

  const handleEdit = (template) => {
    setFormData({
      name: template.name,
      layoutType: template.layoutType,
      backgroundColor: template.backgroundColor,
      textColor: template.textColor,
      accentColor: template.accentColor,
      borderColor: template.borderColor,
      showUserPhoto: template.showUserPhoto,
      showUserName: template.showUserName,
      showUserDetails: template.showUserDetails,
      showUserMobile: template.showUserMobile,
      sizeScale: template.sizeScale || 100,
      imageScale: template.imageScale || 100,
      showSocialIcons: template.showSocialIcons !== undefined ? template.showSocialIcons : true,
      appendMode: template.appendMode || false
    });
    setEditingId(template._id);
    setShowForm(true);
  };

  const renderPreview = () => {
    // Dummy user data for preview
    const user = {
      name: 'Prashant Kumar',
      agentType: 'Premium Advisor',
      company: 'LIC of India',
      mobile: '9876543210',
      profilePhoto: null
    };

    let wrapperClasses = "absolute z-10 pointer-events-none opacity-90 ";
    let innerClasses = "backdrop-blur-sm border rounded-xl p-4 flex items-center gap-4 shadow-xl ";
    
    switch (formData.layoutType) {
      case 'bottom-bar':
        wrapperClasses += "bottom-4 inset-x-4";
        break;
      case 'top-bar':
        wrapperClasses += "top-4 inset-x-4";
        break;
      case 'bottom-right-box':
        wrapperClasses += "bottom-4 right-4 max-w-sm";
        break;
      case 'bottom-left-box':
        wrapperClasses += "bottom-4 left-4 max-w-sm";
        break;
      case 'top-right-box':
        wrapperClasses += "top-4 right-4 max-w-sm";
        break;
      case 'top-left-box':
        wrapperClasses += "top-4 left-4 max-w-sm";
        break;
      default:
        wrapperClasses += "bottom-4 inset-x-4";
    }

    if (formData.layoutType === 'professional-bottom') {
      return (
        <div className={`relative w-full aspect-video bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl overflow-hidden mt-6 flex flex-col ${formData.appendMode ? 'justify-start' : 'justify-between'}`}>
          <div className="flex-1 flex items-center justify-center relative bg-slate-300">
            <ImageIcon className="text-gray-400 opacity-50" size={64} />
            <span className="absolute text-gray-400 font-bold opacity-50">SAMPLE IMAGE</span>
          </div>
          
          <div 
            className={`w-full flex items-center p-3 relative z-10 shadow-lg ${formData.appendMode ? 'bg-white' : ''}`}
            style={{ 
              backgroundColor: formData.backgroundColor || '#ffffff',
              borderTop: `2px solid ${formData.borderColor}`
            }}
          >
            {/* Left side Logo/Photo Box */}
            {(formData.showUserPhoto || formData.logoUrl) && (
              <div 
                className="rounded-xl border-4 overflow-hidden shrink-0 flex items-center justify-center bg-white"
                style={{ 
                  borderColor: formData.accentColor || '#000',
                  width: `${60 * (formData.imageScale / 100)}px`,
                  height: `${60 * (formData.imageScale / 100)}px`,
                }}
              >
                {formData.logoUrl ? (
                  <img 
                    src={formData.logoUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.logoUrl}` : formData.logoUrl} 
                    className="w-full h-full object-contain p-1" 
                    alt="Logo" 
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center font-bold bg-slate-100"
                    style={{ color: formData.textColor, fontSize: `${24 * (formData.imageScale / 100)}px` }}
                  >
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            )}
            
            {/* Right side Stacked Text */}
            <div className="flex-1 ml-4 flex flex-col justify-center leading-tight">
              <span className="text-[9px]" style={{ color: formData.textColor }}>With Best Regards,</span>
              {formData.showUserName && (
                <h4 className="font-extrabold text-sm uppercase tracking-wide my-0.5" style={{ color: formData.textColor }}>{user.name}</h4>
              )}
              {formData.showUserDetails && (
                <p className="text-[10px] font-medium" style={{ color: formData.textColor }}>
                  {user.agentType}
                </p>
              )}
              {formData.showUserMobile && (
                <p className="text-[10px]" style={{ color: formData.textColor }}>
                  {user.mobile}
                </p>
              )}
              <p className="text-[10px]" style={{ color: formData.textColor }}>
                user@example.com
              </p>
              {formData.showUserDetails && (
                <p className="text-[10px]" style={{ color: formData.textColor }}>
                  {user.company}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-video bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl overflow-hidden mt-6 flex items-center justify-center">
        <ImageIcon className="text-gray-400 opacity-50" size={64} />
        <span className="absolute text-gray-400 font-bold opacity-50">SAMPLE IMAGE</span>
        
        {/* Dynamic Watermark Preview Overlay */}
        <div className={wrapperClasses} style={{ transform: `scale(${formData.sizeScale / 100})`, transformOrigin: formData.layoutType.includes('bottom') ? 'bottom center' : 'top center' }}>
          <div 
            className={innerClasses}
            style={{ 
              backgroundColor: formData.backgroundColor,
              borderColor: formData.borderColor
            }}
          >
            {formData.logoUrl && (
              <img 
                src={formData.logoUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.logoUrl}` : formData.logoUrl} 
                className="object-contain mr-2" 
                style={{ height: `${40 * (formData.imageScale / 100)}px` }}
                alt="Logo" 
              />
            )}
            
            {formData.showUserPhoto && (
              <div 
                className="rounded-full border-2 flex items-center justify-center font-bold shrink-0 bg-slate-800"
                style={{ 
                  borderColor: formData.accentColor, 
                  color: formData.textColor,
                  width: `${56 * (formData.imageScale / 100)}px`,
                  height: `${56 * (formData.imageScale / 100)}px`,
                  fontSize: `${16 * (formData.imageScale / 100)}px`
                }}
              >
                {user.name.charAt(0)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {formData.showUserName && (
                <h4 className="font-bold text-base truncate" style={{ color: formData.textColor, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{user.name}</h4>
              )}
              {formData.showUserDetails && (
                <p className="text-xs truncate opacity-90" style={{ color: formData.textColor, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                  {user.agentType} | {user.company}
                </p>
              )}
              {formData.showSocialIcons && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold pb-px shadow-sm">f</span>
                  <span className="w-4 h-4 rounded-full bg-[#E4405F] text-white flex items-center justify-center text-[8px] font-bold pb-px shadow-sm">ig</span>
                  <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold pb-px shadow-sm">X</span>
                  <span className="w-4 h-4 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[8px] font-bold pb-px shadow-sm">in</span>
                </div>
              )}
            </div>
            
            {formData.showUserMobile && (
              <div className="text-right shrink-0">
                <p className="font-bold text-sm whitespace-nowrap" style={{ color: formData.accentColor, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                  Mob: +91 {user.mobile}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Watermark Templates</h2>
          <p className="text-gray-400 text-sm mt-1">Design and manage reusable watermark overlays</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Template
          </button>
        )}
      </div>

      {showForm ? (
        <div className="glass-effect bg-[#0d1224] border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Template' : 'New Template'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Template Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white" placeholder="e.g. Premium Bottom Bar" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Layout Position</label>
                  <select name="layoutType" value={formData.layoutType} onChange={handleInputChange} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white">
                    <option value="bottom-bar">Bottom Bar (Full Width)</option>
                    <option value="top-bar">Top Bar (Full Width)</option>
                    <option value="bottom-right-box">Bottom Right Box</option>
                    <option value="bottom-left-box">Bottom Left Box</option>
                    <option value="top-right-box">Top Right Box</option>
                    <option value="top-left-box">Top Left Box</option>
                    <option value="professional-bottom">Professional Flat Bottom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Size Scale ({formData.sizeScale}%)</label>
                  <input type="range" name="sizeScale" min="50" max="150" value={formData.sizeScale} onChange={handleInputChange} className="w-full mt-2 accent-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-1">
                    Background Color
                    <label className="flex items-center gap-1.5 text-xs font-normal text-indigo-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.backgroundColor === 'transparent'} 
                        onChange={(e) => setFormData({...formData, backgroundColor: e.target.checked ? 'transparent' : 'rgba(15, 23, 42, 0.8)'})} 
                        className="rounded bg-slate-800 border-white/20 w-3 h-3" 
                      /> Transparent
                    </label>
                  </label>
                  <input type="text" name="backgroundColor" value={formData.backgroundColor} onChange={handleInputChange} disabled={formData.backgroundColor === 'transparent'} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white disabled:opacity-50" placeholder="rgba or hex" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Border Color</label>
                  <input type="text" name="borderColor" value={formData.borderColor} onChange={handleInputChange} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white" placeholder="rgba or hex" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Text Color</label>
                  <input type="color" name="textColor" value={formData.textColor} onChange={handleInputChange} className="w-full h-10 bg-slate-950 border border-white/10 rounded-lg p-1 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Accent (Mobile) Color</label>
                  <input type="color" name="accentColor" value={formData.accentColor} onChange={handleInputChange} className="w-full h-10 bg-slate-950 border border-white/10 rounded-lg p-1 cursor-pointer" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Photo/Logo Size Scale ({formData.imageScale}%)</label>
                  <input type="range" name="imageScale" min="30" max="200" value={formData.imageScale} onChange={handleInputChange} className="w-full mt-1 accent-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Custom Logo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white text-sm" />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use user's profile photo.</p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Visibility Options</label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input type="checkbox" name="showUserPhoto" checked={formData.showUserPhoto} onChange={handleInputChange} className="rounded bg-slate-800 border-white/20" /> Show User Profile Photo
                </label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input type="checkbox" name="showUserName" checked={formData.showUserName} onChange={handleInputChange} className="rounded bg-slate-800 border-white/20" /> Show User Name
                </label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input type="checkbox" name="showUserDetails" checked={formData.showUserDetails} onChange={handleInputChange} className="rounded bg-slate-800 border-white/20" /> Show Designation & Company
                </label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input type="checkbox" name="showUserMobile" checked={formData.showUserMobile} onChange={handleInputChange} className="rounded bg-slate-800 border-white/20" /> Show Mobile Number
                </label>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input type="checkbox" name="showSocialIcons" checked={formData.showSocialIcons} onChange={handleInputChange} className="rounded bg-slate-800 border-white/20" /> Show Social Media Icons (WhatsApp, FB, Insta, X)
                </label>
                <label className="flex items-center gap-2 text-indigo-300 font-medium text-sm mt-1">
                  <input type="checkbox" name="appendMode" checked={formData.appendMode} onChange={handleInputChange} className="rounded bg-slate-800 border-indigo-400" /> Append Watermark Below Image (No Overlap)
                </label>
              </div>

              <div className="pt-4">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold w-full">
                  {editingId ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Live Preview</label>
              {renderPreview()}
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
            <div key={t._id} className="glass-effect bg-[#0d1224] border border-white/10 rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{t.name}</h3>
                  <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">{t.layoutType.replace(/-/g, ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(t)} className="text-blue-400 hover:text-blue-300"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(t._id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="space-y-2 mt-4 text-sm text-gray-400">
                <div className="flex items-center justify-between"><span>Background:</span> <span className="w-4 h-4 rounded border border-white/20" style={{background: t.backgroundColor}}></span></div>
                <div className="flex items-center justify-between"><span>Text:</span> <span className="w-4 h-4 rounded border border-white/20" style={{background: t.textColor}}></span></div>
                <div className="flex items-center justify-between"><span>Accent:</span> <span className="w-4 h-4 rounded border border-white/20" style={{background: t.accentColor}}></span></div>
              </div>
            </div>
          ))}
          {templates.length === 0 && !loading && (
            <div className="col-span-full text-center text-gray-500 py-12">
              No watermark templates found. Create one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
