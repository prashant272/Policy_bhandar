import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, CheckCircle2, Activity, MapPin, Building, Briefcase } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Basic Details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });

  // Step 2: OTP
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');

  // Step 3: Categories & Profile
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [profileData, setProfileData] = useState({ 
    selectedCategoryId: '', 
    selectedSubcategoryId: '', 
    state: '', 
    city: '',
    occupationType: '',
    company: '',
    designation: '',
    profilePhoto: null
  });

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
    if (profileData.selectedCategoryId) {
      API.get(`/materials/categories/${profileData.selectedCategoryId}/subcategories`)
        .then(res => {
          if (res.data.success) {
            setSubcategories(res.data.data);
            if (res.data.data.length > 0) {
              setProfileData(prev => ({ ...prev, selectedSubcategoryId: res.data.data[0]._id }));
            }
          }
        })
        .catch(err => console.error(err));
    } else {
      setSubcategories([]);
    }
  }, [profileData.selectedCategoryId]);

  // Handle Step 1 Submit (Register Init)
  const handleStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/register-init', formData);
      if (res.data.success) {
        setUserId(res.data.userId);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize registration.');
    }
    setLoading(false);
  };

  // Handle Step 2 Submit (Verify OTP)
  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/verify-otp', { userId, otp });
      if (res.data.success) {
        // Log user in automatically with the token
        localStorage.setItem('token', res.data.token);
        await fetchUser(); // Updates AuthContext
        setStep(3); // Move to profile completion
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    }
    setLoading(false);
  };

  // Handle Step 3 Submit (Complete Profile)
  const handleStep3 = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('state', profileData.state);
      formData.append('city', profileData.city);
      formData.append('selectedCategoryId', profileData.selectedCategoryId);
      formData.append('selectedSubcategoryId', profileData.selectedSubcategoryId);
      formData.append('occupationType', profileData.occupationType);
      
      if (profileData.occupationType === 'Agent' || profileData.occupationType === 'Advisor') {
        formData.append('company', profileData.company);
        formData.append('designation', profileData.designation);
      }
      
      if (profileData.profilePhoto) {
        formData.append('profilePhoto', profileData.profilePhoto);
      }

      const res = await API.post('/auth/complete-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        login(res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow bg-[#f8f9fa] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden border border-gray-100">
      
        {/* Left Column: Brand & Visuals */}
        <div className="hidden md:flex w-full md:w-5/12 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute w-full h-full bg-gradient-to-br from-indigo-500/20 via-transparent to-orange-500/20"></div>
            <div className="absolute w-64 h-64 bg-orange-500 rounded-full blur-[100px] -top-20 -left-20 opacity-30"></div>
            <div className="absolute w-64 h-64 bg-indigo-500 rounded-full blur-[100px] -bottom-20 -right-20 opacity-30"></div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
              <Activity className="text-orange-400 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Policybhandar</h1>
          </div>

          <div className="relative z-10 my-10">
            <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-6 tracking-tight">
              {step === 1 ? 'Start your journey with us.' : step === 2 ? 'Verify your identity.' : 'Personalize your feed.'}
            </h2>
            <p className="text-slate-300 text-lg max-w-sm font-medium leading-relaxed">
              {step === 1 ? 'Join thousands of agents using Policybhandar to grow their insurance business 10x.' : 
               step === 2 ? 'We sent a verification code to your email and WhatsApp.' : 
               'Tell us what products you sell so we can customize your marketing materials.'}
            </p>

            <div className="mt-12 space-y-6">
              <div className={`flex items-center gap-5 transition-all duration-300 ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${step >= 1 ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-white/10 border border-white/20 text-white/50'}`}>1</div>
                <span className={`font-bold text-lg ${step >= 1 ? 'text-white' : 'text-slate-400'}`}>Create Account</span>
              </div>
              <div className={`flex items-center gap-5 transition-all duration-300 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${step >= 2 ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-white/10 border border-white/20 text-white/50'}`}>2</div>
                <span className={`font-bold text-lg ${step >= 2 ? 'text-white' : 'text-slate-400'}`}>OTP Verification</span>
              </div>
              <div className={`flex items-center gap-5 transition-all duration-300 ${step >= 3 ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${step >= 3 ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-white/10 border border-white/20 text-white/50'}`}>3</div>
                <span className={`font-bold text-lg ${step >= 3 ? 'text-white' : 'text-slate-400'}`}>Profile Setup</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Policybhandar. All rights reserved.
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="w-full md:w-7/12 flex items-center justify-center p-8 md:p-16 lg:p-20 relative bg-white">
          <div className="w-full max-w-md">
            
            {/* STEP 1: Basic Details */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Create an account</h2>
                  <p className="mt-3 text-slate-500 font-medium text-base">
                    Already have an account? <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 transition-colors underline-offset-4 hover:underline">Log in</Link>
                  </p>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-100 font-medium shadow-sm flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>{error}</div>}

                <form onSubmit={handleStep1} className="space-y-5">
                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input
                        type="text" required
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                        placeholder="Enter Your Name"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Mobile Number (WhatsApp)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input
                        type="text" required
                        value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})}
                        className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input
                        type="email" required
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                      <input
                        type="password" required minLength="6"
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                        className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                        placeholder="Min. 6 characters"
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="group relative w-full flex justify-center items-center gap-3 py-4 mt-8 rounded-2xl text-base font-black !text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(234,88,12,0.6)] hover:-translate-y-1"
                  >
                    {loading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (
                      <>
                        <span className="relative z-10 !text-white uppercase tracking-widest">Send OTP</span>
                        <ArrowRight className="w-5 h-5 relative z-10 !text-white group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center md:text-left">
                  <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Verify Code</h2>
                  <p className="mt-3 text-slate-500 font-medium text-base">
                    We've sent a 6-digit code to your Email and WhatsApp (<strong>{formData.mobile}</strong>).
                  </p>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-100 font-medium shadow-sm flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>{error}</div>}

                <form onSubmit={handleStep2} className="space-y-6 mt-8">
                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">6-Digit OTP</label>
                    <input
                      type="text" required maxLength="6"
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full text-center text-3xl font-black tracking-[0.5em] py-5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-300"
                      placeholder="------"
                    />
                  </div>

                  <button
                    type="submit" disabled={loading || otp.length !== 6}
                    className="group relative w-full flex justify-center items-center gap-3 py-4 mt-8 rounded-2xl text-base font-black !text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(234,88,12,0.6)] hover:-translate-y-1 uppercase tracking-widest"
                  >
                    {loading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span className="!text-white">Verify & Continue</span>}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: Complete Profile */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center md:text-left">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Account Verified!</h2>
                  <p className="mt-3 text-slate-500 font-medium text-base">
                    Let's personalize your experience. What do you sell?
                  </p>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-100 font-medium shadow-sm flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>{error}</div>}

                <form onSubmit={handleStep3} className="space-y-5">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">State</label>
                      <input
                        type="text" required
                        value={profileData.state} onChange={e => setProfileData({...profileData, state: e.target.value})}
                        className="block w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                        placeholder="e.g. MH"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">City</label>
                      <input
                        type="text" required
                        value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})}
                        className="block w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                        placeholder="e.g. Mumbai"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Occupation Type</label>
                    <select
                      required
                      value={profileData.occupationType}
                      onChange={e => setProfileData({...profileData, occupationType: e.target.value})}
                      className="block w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Occupation...</option>
                      <option value="Agent">Agent</option>
                      <option value="Advisor">Advisor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {(profileData.occupationType === 'Agent' || profileData.occupationType === 'Advisor') && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Company Name</label>
                        <input
                          type="text" required
                          value={profileData.company} onChange={e => setProfileData({...profileData, company: e.target.value})}
                          className="block w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                          placeholder="e.g. LIC, Star Health"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Designation</label>
                        <input
                          type="text" required
                          value={profileData.designation} onChange={e => setProfileData({...profileData, designation: e.target.value})}
                          className="block w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                          placeholder="e.g. Sales Manager"
                        />
                      </div>
                    </div>
                  )}

                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Primary Category</label>
                    <select
                      required
                      value={profileData.selectedCategoryId}
                      onChange={e => setProfileData({...profileData, selectedCategoryId: e.target.value, selectedSubcategoryId: ''})}
                      className="block w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Specialization (Subcategory)</label>
                    <select
                      required
                      value={profileData.selectedSubcategoryId}
                      onChange={e => setProfileData({...profileData, selectedSubcategoryId: e.target.value})}
                      className="block w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Subcategory...</option>
                      {subcategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Upload Photo / Logo (Optional)</label>
                    <input
                      type="file" accept="image/*"
                      onChange={e => setProfileData({...profileData, profilePhoto: e.target.files[0]})}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-all bg-slate-50 border-2 border-slate-100 rounded-2xl file:cursor-pointer cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-3 mt-8">
                    <button
                      type="submit" disabled={loading}
                      className="group relative w-full flex justify-center items-center gap-3 py-4 rounded-2xl text-base font-black !text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(234,88,12,0.6)] hover:-translate-y-1 uppercase tracking-widest"
                    >
                      {loading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span className="!text-white">Finish Setup</span>}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      disabled={loading}
                      className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Skip for now, I'll set up my profile later
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
