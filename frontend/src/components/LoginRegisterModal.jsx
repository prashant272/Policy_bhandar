import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Mail, Phone, Lock, User as UserIcon, MapPin, Building, Briefcase } from 'lucide-react';

export default function LoginRegisterModal({ isOpen, onClose }) {
  const { login, register } = useContext(AuthContext);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    state: '',
    city: '',
    agentType: 'LIC Agent',
    company: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLoginTab) {
      const identifier = formData.email || formData.mobile;
      if (!identifier || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const res = await login(identifier, formData.password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    } else {
      // Register validation
      if (!formData.name || !formData.mobile || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Convert registration fields to FormData for photo upload support
      const regFormData = new FormData();
      regFormData.append('name', formData.name);
      regFormData.append('mobile', formData.mobile);
      regFormData.append('email', formData.email);
      regFormData.append('password', formData.password);
      regFormData.append('state', formData.state);
      regFormData.append('city', formData.city);
      regFormData.append('agentType', formData.agentType);
      regFormData.append('company', formData.company);
      if (profilePhotoFile) {
        regFormData.append('profilePhoto', profilePhotoFile);
      }

      const res = await register(regFormData);
      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-effect rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header & Tabs */}
        <div className="p-6 pb-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-sans text-gradient">Policybhandar</h2>
            <p className="text-sm text-gray-400 mt-1">Unlock Premium Marketing Materials</p>
          </div>

          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setIsLoginTab(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer ${
                isLoginTab 
                  ? 'text-indigo-400 border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer ${
                !isLoginTab 
                  ? 'text-indigo-400 border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {isLoginTab ? (
            // Login Fields
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="text"
                    name="email"
                    placeholder="Enter email or mobile"
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            // Register Fields
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Prashant Kumar"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="tel"
                      name="mobile"
                      required
                      placeholder="9999999999"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="prashant@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="state"
                      placeholder="e.g. Bihar"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Patna"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Agent Type
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 text-gray-500" size={18} />
                    <select
                      name="agentType"
                      value={formData.agentType}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm appearance-none [&>option]:bg-[#0b0f19] [&>option]:text-white"
                    >
                      <option value="LIC Agent">LIC Agent</option>
                      <option value="Health Agent">Health Agent</option>
                      <option value="General Insurance Agent">General Insurance Agent</option>
                      <option value="Mutual Fund Distributor">Mutual Fund Distributor</option>
                      <option value="Multiple Agency">Multiple Agency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="company"
                      placeholder="e.g. Star Health / LIC"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Upload Advisor Photo (Will be added in watermark)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePhotoFile(e.target.files[0])}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-gray-300 file:bg-indigo-600 file:border-0 file:rounded file:text-white file:px-3 file:py-1 file:mr-4 file:font-semibold cursor-pointer"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-premium hover:bg-gradient-premium-hover py-3 rounded-xl font-semibold text-white text-sm shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
            ) : isLoginTab ? (
              'Access Platform'
            ) : (
              'Create Advisor Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
