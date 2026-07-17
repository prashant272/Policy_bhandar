import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, ArrowRight, Activity, Phone, KeyRound } from 'lucide-react';
import API from '../services/api';

export default function LoginPage() {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverifiedUserId, setUnverifiedUserId] = useState(null);

  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetUserId, setResetUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!identifier || !password) {
      return setError('Please enter both mobile/email and password.');
    }

    try {
      const res = await login(identifier, password);
      if (res && res.error) {
        setError(res.error);
        if (res.unverifiedUserId) {
          setUnverifiedUserId(res.unverifiedUserId);
        }
      } else {
        // Success
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleForgotPasswordInit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!identifier) return setError('Please enter your email or mobile number.');
    try {
      const res = await API.post('/auth/forgot-password-init', { identifier });
      if (res.data.success) {
        setResetUserId(res.data.userId);
        setForgotPasswordStep(2);
        setSuccessMessage('OTP sent to your registered email and WhatsApp.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    }
  };

  const handleForgotPasswordVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!otp || !newPassword) return setError('Please enter OTP and new password.');
    try {
      const res = await API.post('/auth/forgot-password-verify', { userId: resetUserId, otp, newPassword });
      if (res.data.success) {
        setForgotPasswordStep(0);
        setPassword('');
        setOtp('');
        setNewPassword('');
        setSuccessMessage('Password reset successfully! You can now log in.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP or reset password.');
    }
  };

  return (
    <div className="w-full flex-grow bg-[#f8f9fa] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden border border-gray-100">
        
        {/* Left Column: Brand & Visuals */}
        <div className="w-full md:w-5/12 bg-slate-900 p-12 flex flex-col justify-between text-white relative overflow-hidden hidden md:flex">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute w-full h-full bg-gradient-to-br from-indigo-500/20 via-transparent to-orange-500/20"></div>
            <div className="absolute w-64 h-64 bg-orange-500 rounded-full blur-[100px] -top-20 -left-20 opacity-30"></div>
            <div className="absolute w-64 h-64 bg-indigo-500 rounded-full blur-[100px] -bottom-20 -right-20 opacity-30"></div>
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl mb-8">
              <Activity className="text-orange-400 w-8 h-8" />
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-6 tracking-tight">
              Unlock Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Agency's</span> Potential.
            </h2>
            <p className="text-slate-300 text-lg max-w-sm leading-relaxed font-medium">
              Join the elite club of top insurance professionals. Access premium collaterals and skyrocket your sales.
            </p>
          </div>

          <div className="relative z-10 mt-16 bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Bank-Grade Security</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Your data is protected with state-of-the-art 256-bit encryption and rigorous security protocols.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="w-full md:w-7/12 flex items-center justify-center p-8 md:p-16 lg:p-20 bg-white relative">
          
          <div className="w-full max-w-md">
            
            <div className="text-center md:text-left mb-10">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {forgotPasswordStep === 0 ? 'Welcome Back' : forgotPasswordStep === 1 ? 'Reset Password' : 'Verify OTP'}
              </h2>
              <p className="mt-3 text-slate-500 font-medium text-base">
                {forgotPasswordStep === 0 ? (
                  <>
                    New to Policybhandar?{' '}
                    <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 transition-colors underline-offset-4 hover:underline">
                      Create an account
                    </Link>
                  </>
                ) : (
                  <>
                    Remember your password?{' '}
                    <button type="button" onClick={() => { setForgotPasswordStep(0); setError(''); setSuccessMessage(''); }} className="font-bold text-orange-600 hover:text-orange-700 transition-colors underline-offset-4 hover:underline">
                      Back to login
                    </button>
                  </>
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-100 flex flex-col gap-2 font-medium shadow-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                    {error}
                  </span>
                  {unverifiedUserId && forgotPasswordStep === 0 && (
                    <Link 
                      to="/register" 
                      state={{ initiateVerification: true, identifier }} 
                      className="font-bold text-red-800 hover:text-red-900 underline mt-1"
                    >
                      Click here to verify your account
                    </Link>
                  )}
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm border border-emerald-100 flex flex-col gap-2 font-medium shadow-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">✓</div>
                    {successMessage}
                  </span>
                </div>
              )}

              {forgotPasswordStep === 0 && (
                <>
                  <div className="space-y-5">
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Email or Mobile Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                          placeholder="Enter registered email or mobile"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-slate-700 transition-colors group-focus-within:text-orange-600">Password</label>
                        <button type="button" onClick={() => setForgotPasswordStep(1)} className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">Forgot password?</button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400 tracking-wider"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="group relative w-full flex justify-center items-center gap-3 py-4 mt-8 rounded-2xl text-base font-black !text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(234,88,12,0.6)] hover:-translate-y-1"
                  >
                    {loading ? (
                      <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span className="relative z-10 !text-white tracking-widest uppercase">Secure Sign In</span>
                        <ArrowRight className="w-5 h-5 relative z-10 !text-white group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </>
              )}

              {forgotPasswordStep === 1 && (
                <>
                  <div className="space-y-5">
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Email or Mobile Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
                          placeholder="Enter registered email or mobile"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleForgotPasswordInit}
                    className="group relative w-full flex justify-center items-center gap-3 py-4 mt-8 rounded-2xl text-base font-black !text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(234,88,12,0.6)] hover:-translate-y-1"
                  >
                    <span className="relative z-10 !text-white tracking-widest uppercase">Send OTP</span>
                    <ArrowRight className="w-5 h-5 relative z-10 !text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              )}

              {forgotPasswordStep === 2 && (
                <>
                  <div className="space-y-5">
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">Enter OTP</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          name="otp"
                          autoComplete="one-time-code"
                          inputMode="numeric"
                          maxLength={6}
                          className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400 tracking-[0.3em]"
                          placeholder="000000"
                        />
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-orange-600">New Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          name="newPassword"
                          autoComplete="new-password"
                          className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400 tracking-wider"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleForgotPasswordVerify}
                    className="group relative w-full flex justify-center items-center gap-3 py-4 mt-8 rounded-2xl text-base font-black !text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.6)] hover:-translate-y-1"
                  >
                    <span className="relative z-10 !text-white tracking-widest uppercase">Reset Password</span>
                  </button>
                </>
              )}
              
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
