import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from '../components/Admin/AdminSidebar';
import CategoryManager from '../components/Admin/CategoryManager';
import MaterialManager from '../components/Admin/MaterialManager';
import UsersManager from '../components/Admin/UsersManager';
import TestimonialManager from '../components/Admin/TestimonialsManager';
import WatermarkManager from '../components/Admin/WatermarkManager';
import TrainingManager from '../components/Admin/TrainingManager';
import PlanManager from '../components/Admin/PlanManager';
import LeadsManager from '../components/Admin/LeadsManager';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('categories'); // Default 1st tab is Category Management

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoryManager />;
      case 'materials':
        return <MaterialManager />;
      case 'watermarks':
        return <WatermarkManager />;
      case 'users':
        return <UsersManager />;
      case 'testimonials':
        return <TestimonialManager />;
      case 'trainings':
        return <TrainingManager />;
      case 'plans':
        return <PlanManager />;
      case 'leads':
        return <LeadsManager />;
      default:
        return <CategoryManager />;
    }
  };

  return (
    <div className="flex bg-[#070a13] min-h-screen text-slate-100 w-full admin-dark-mode">
      
      {/* Admin Sidebar Navigation */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={logout} 
      />

      {/* Main Panel Content Area */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}
