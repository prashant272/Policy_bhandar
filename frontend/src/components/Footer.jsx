import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Phone, Mail, MapPin, Award, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterCategoryItem = ({ category }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  return (
    <li className="flex flex-col">
      <div className="flex items-center justify-between group">
        {category.isClickable !== false ? (
          <Link 
            to={`/category/${category._id}`} 
            className="text-sm text-slate-700 font-bold hover:text-orange-500 inline-block transition-colors"
          >
            {category.name}
          </Link>
        ) : (
          <span 
            className="text-sm text-slate-400 font-bold inline-block cursor-default"
          >
            {category.name}
          </span>
        )}
        {hasSubcategories && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-orange-500 transition-colors"
          >
            <ChevronDown size={14} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      {/* Subcategories Collapse */}
      {hasSubcategories && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
          <ul className="pl-3 border-l border-slate-200 space-y-2 py-1">
            {category.subcategories.map(sub => (
              <li key={sub._id}>
                {sub.isClickable !== false ? (
                  <Link 
                    to={`/category/${category._id}?subcat=${sub._id}`}
                    className="text-xs text-slate-600 font-bold hover:text-orange-500 inline-block transition-colors"
                  >
                    {sub.name}
                  </Link>
                ) : (
                  <span 
                    className="text-xs text-slate-400 font-bold inline-block cursor-default"
                  >
                    {sub.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export default function Footer({ categories = [] }) {
  const { user } = useContext(AuthContext);

  return (
    <footer className="bg-white border-t border-slate-200 z-10">
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand & About (Spans 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="Policy Bhandar Logo" className="h-12 object-contain" />
            </div>
            <p className="text-sm text-slate-700 leading-snug font-medium pr-4">
              Empowering insurance professionals with premium marketing materials, advanced training, and mentorship to digitally transform their advisory business.
            </p>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-900 font-bold">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                  <Phone size={14} className="text-orange-500" />
                </div>
                <span>+91 9818826521</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-900 font-bold">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                  <Mail size={14} className="text-orange-500" />
                </div>
                <span>caykverma@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Quick Links</h5>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Blogs', 'Pricing', 'Testimonials'].map((link, i) => (
                <li key={i}>
                  <Link to={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`} className="text-sm text-slate-700 font-bold hover:text-orange-500 inline-block transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services (Spans 3 cols) - Dynamic Categories & Subcategories */}
          <div className="lg:col-span-3">
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Our Services</h5>
            <ul className="space-y-2">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <FooterCategoryItem key={category._id} category={category} />
                ))
              ) : (
                <li className="text-sm text-slate-500 italic">Loading services...</li>
              )}
            </ul>
          </div>

          {/* Contact Details (Spans 3 cols) */}
          <div className="lg:col-span-3">
            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Contact Us</h5>
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3 text-sm text-slate-900 font-bold">
                <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <span className="leading-snug">B1/6 Third Floor B-Block,<br />Back Street, Near KD Grand Banquet Hall,<br />Sewak Park, Kakrola, Delhi 110078</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-900 font-bold">
                <Phone size={16} className="text-orange-500 shrink-0" />
                <span>+91 9818826521</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-900 font-bold">
                <Mail size={16} className="text-orange-500 shrink-0" />
                <span>caykverma@gmail.com</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Follow Us</h5>
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a href="https://www.facebook.com/policybhandar" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:border-transparent transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/policybhandar/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#E1306C] hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/company/policy-bhandar/people/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white hover:border-transparent transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-bold">
            © {new Date().getFullYear()} Policy Bhandar. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-500 font-bold hover:text-orange-500 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-500 font-bold hover:text-orange-500 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-slate-500 font-bold hover:text-orange-500 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
