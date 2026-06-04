import React from 'react';
import { FolderTree, LayoutGrid, Users, LogOut, ShieldAlert, MessageSquare, Mail } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'categories', label: 'Category Management', icon: <FolderTree size={18} /> },
    { id: 'materials', label: 'Marketing Materials', icon: <LayoutGrid size={18} /> },
    { id: 'watermarks', label: 'Watermark Templates', icon: <LayoutGrid size={18} /> },
    { id: 'trainings', label: 'Trainings', icon: <FolderTree size={18} /> },
    { id: 'plans', label: 'Pricing Plans', icon: <FolderTree size={18} /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare size={18} /> },
    { id: 'leads', label: 'Leads & Inquiries', icon: <Mail size={18} /> },
    ...(user?.role === 'SuperAdmin' ? [{ id: 'users', label: 'Users & Subscriptions', icon: <Users size={18} /> }] : [])
  ];

  return (
    <aside className="w-64 bg-slate-950/40 border-r border-white/5 flex flex-col h-screen sticky top-0">
      
      {/* Sidebar Header Logo */}
      <div className="p-6 border-b border-white/5 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 className="text-md font-bold text-white tracking-wider">Policybhandar</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Admin Console</p>
        </div>
      </div>

      {/* Logged in Admin Profile Shortcard */}
      <div className="p-4 mx-4 my-4 bg-white/3 border border-white/5 rounded-2xl flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold uppercase text-xs">
          {user?.name?.charAt(0) || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
          <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/35 rounded px-1.5 py-0.5 inline-block uppercase font-bold tracking-wider mt-0.5">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
              activeTab === item.id
                ? 'bg-gradient-premium text-white shadow-lg shadow-indigo-500/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/3'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Footer Section */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Secure Logout</span>
        </button>
      </div>

    </aside>
  );
}
