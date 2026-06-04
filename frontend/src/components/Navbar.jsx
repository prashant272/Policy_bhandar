import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Menu, X, ChevronDown, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import API from '../services/api';

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

const SubcategoryDropdownNode = ({ node }) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative group/sub w-full">
      {hasChildren ? (
        <div className="w-full">
          {node.isClickable !== false ? (
            <Link
              to={`/category/${node.categoryId}?subcat=${node._id}`}
              className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left"
            >
              <span>{node.name}</span>
              <span className="text-gray-500 text-[9px]">▶</span>
            </Link>
          ) : (
            <div className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left">
              <span>{node.name}</span>
              <span className="text-gray-500 text-[9px]">▶</span>
            </div>
          )}
          {/* Sub-dropdown to the right */}
          <div className="absolute left-full top-0 ml-1 w-56 glass-effect border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 p-2 z-50">
            {node.children.map(child => (
              <SubcategoryDropdownNode key={child._id} node={child} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {node.isClickable !== false ? (
            <Link
              to={`/category/${node.categoryId}?subcat=${node._id}`}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {node.name}
            </Link>
          ) : (
            <div className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-default">
              {node.name}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function Navbar({ onOpenProfileModal, categories = [] }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, loading, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchAllSubcategories = async () => {
      if (!categories || categories.length === 0) return;
      try {
        const promises = categories.map(cat => API.get(`/materials/categories/${cat._id}/subcategories`));
        const results = await Promise.all(promises);
        const newMap = {};
        results.forEach((res, index) => {
          if (res.data.success) {
            newMap[categories[index]._id] = res.data.data;
          }
        });
        setSubcategoriesMap(newMap);
      } catch (err) {
        console.error('Error fetching navbar subcategories:', err);
      }
    };
    fetchAllSubcategories();
  }, [categories]);  const linkClass = `px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${
    isHomePage
      ? isScrolled
        ? '!text-slate-900 hover:!text-orange-600'
        : '!text-white hover:!text-amber-400'
      : '!text-slate-900 hover:!text-orange-600'
  }`;

  const profileBtnClass = `flex items-center space-x-2 text-sm font-semibold transition-colors cursor-pointer ${
    isHomePage
      ? isScrolled
        ? '!text-slate-900 hover:!text-orange-600'
        : '!text-white hover:!text-amber-400'
      : '!text-slate-900 hover:!text-orange-600'
  }`;

  const mobileBtnClass = `focus:outline-none transition-colors cursor-pointer ${
    isHomePage
      ? isScrolled
        ? '!text-slate-900 hover:!text-slate-700'
        : '!text-white hover:!text-amber-400'
      : '!text-slate-900 hover:!text-slate-700'
  }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isHomePage
          ? isScrolled
            ? 'glass-effect border-b border-white/10 shadow-lg py-1'
            : 'bg-transparent border-transparent py-3'
          : 'glass-effect border-b border-white/10 shadow-lg py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center py-1">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Policybhandar Logo" 
                className={`w-auto object-contain hover:scale-[1.03] transition-all duration-300 ${
                  isHomePage && !isScrolled
                    ? 'h-12 md:h-20 mt-0 md:mt-2'
                    : 'h-10 md:h-14 mt-0'
                }`}
              />
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={linkClass}>Home</Link>
            
            {/* Category Dropdown */}
            <div className="relative group">
              <button className={`flex items-center space-x-1 ${linkClass}`}>
                Our Services
                <ChevronDown size={14} className="transition-colors" />
              </button>
              
              <div className="absolute top-full left-0 mt-1 w-56 glass-effect border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 z-50">
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    const catSubs = subcategoriesMap[cat._id] || [];
                    const subTree = buildSubcategoryTree(catSubs);
                    const hasSubs = subTree.length > 0;

                    return (
                      <div key={cat._id} className="relative group/cat w-full">
                        {cat.isClickable !== false ? (
                          <Link 
                            to={`/category/${cat._id}`}
                            className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                          >
                            <span>{cat.name}</span>
                            {hasSubs && <span className="text-gray-500 text-[10px]">▶</span>}
                          </Link>
                        ) : (
                          <div className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left">
                            <span>{cat.name}</span>
                            {hasSubs && <span className="text-gray-500 text-[10px]">▶</span>}
                          </div>
                        )}
                        
                        {/* Subcategories Dropdown Flyout */}
                        {hasSubs && (
                          <div className="absolute left-full top-0 ml-1 w-56 glass-effect border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-200 p-2 z-50">
                            {subTree.map(subNode => (
                              <SubcategoryDropdownNode key={subNode._id} node={subNode} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span className="block px-4 py-2 text-xs text-gray-500">No categories loaded</span>
                )}
              </div>
            </div>

            <Link to="/training" className={linkClass}>Training</Link>
            <Link to="/blogs" className={linkClass}>Blogs</Link>
            <Link to="/pricing" className={linkClass}>Pricing</Link>
          </div>

          {/* Auth Button or User Dropdown */}
          <div className="hidden md:flex items-center">
            {loading ? (
              <div className="w-32 h-10 bg-white/10 animate-pulse rounded-full border border-white/5"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={profileBtnClass}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center overflow-hidden !text-white text-lg font-bold uppercase shadow-sm">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  {user.name.split(' ')[0]}
                  <ChevronDown size={14} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-effect border border-white/10 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-white/5 mb-1">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <p className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded px-1.5 py-0.5 inline-block mt-1 uppercase tracking-wider font-bold">
                        {user.role} - {user.subscriptionType}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenProfileModal();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2 border-b border-white/5"
                    >
                      <UserIcon size={14} /> My Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-orange-600/90 hover:bg-orange-600 !text-white border-2 border-orange-400 hover:border-white shadow-lg px-6 py-2.5 rounded-full font-extrabold tracking-wide uppercase text-sm transition-all shadow-orange-500/20"
              >
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={mobileBtnClass}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-effect border-b border-white/10 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
          >
            Home
          </Link>
          
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Our Services</p>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat._id}`}
                onClick={() => setIsOpen(false)}
                className="block pl-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <Link
            to="/training"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
          >
            Training
          </Link>
          <Link
            to="/blogs"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
          >
            Blogs
          </Link>
          <Link
            to="/pricing"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
          >
            Pricing
          </Link>

          <div className="pt-4 border-t border-white/5">
            {loading ? (
              <div className="w-full h-12 bg-white/10 animate-pulse rounded-xl mx-3"></div>
            ) : user ? (
              <div className="space-y-2 px-3">
                <p className="text-sm font-semibold text-white">Signed in as {user.name}</p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="block w-full text-center bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 py-2 rounded-lg text-sm text-red-400 font-medium cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-orange-600 hover:bg-orange-500 !text-white border border-orange-400 hover:border-white px-5 py-3 rounded-xl font-extrabold tracking-wide uppercase text-sm shadow-lg transition-colors w-full"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
