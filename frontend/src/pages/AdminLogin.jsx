import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const { user, login, logout, loading } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in as admin, redirect directly
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'SuperAdmin' || user.role === 'SubAdmin') {
        navigate('/admin');
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!identifier || !password) {
      setError('Please enter both identifier (email/mobile) and password.');
      return;
    }

    setBtnLoading(true);

    try {
      const res = await login(identifier, password);
      
      if (res.success) {
        // Fetch user from context (it is updated by login)
        // Since state update is async, we can check backend response or let it load
      } else {
        setError(res.error || 'Invalid credentials');
        setBtnLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setBtnLoading(false);
    }
  };

  // Additional check when user state updates after a successful login trigger
  useEffect(() => {
    if (user && btnLoading) {
      if (user.role === 'SuperAdmin' || user.role === 'SubAdmin') {
        navigate('/admin');
      } else {
        // Logged in user is not an admin! Reject and log out
        setError('Access Denied: You do not have administrator privileges.');
        logout();
        setBtnLoading(false);
      }
    }
  }, [user, btnLoading, navigate, logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070a13] px-4 relative overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-effect rounded-2xl border border-white/10 shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Shield Icon header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 animate-pulse">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-gray-400 mt-1.5">Sign in to manage Policybhandar console.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-xs font-semibold text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl animate-in shake duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Email or Mobile Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
              <input
                type="text"
                required
                placeholder="admin@policybhandar.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-150 transform active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950/50"
          >
            {btnLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <a
            href="/"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            &larr; Return to Main Platform
          </a>
        </div>
      </div>
    </div>
  );
}
