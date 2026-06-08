import React, { useEffect, useState, useContext } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import MaterialCard from '../components/MaterialCard';
import { Filter, Grid, SlidersHorizontal, Search, Folder, Tag, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';


export default function CategoryPage({ onOpenAuthModal }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get('search') || '';

  const [categoryName, setCategoryName] = useState('All Materials');
  const [selectedSubcat, setSelectedSubcat] = useState(searchParams.get('subcat') || '');
  
  // Tags
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  
  // Materials list
  const [materials, setMaterials] = useState([]);
  const [materialType, setMaterialType] = useState(''); // Banner, Reel, PDF
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch tags and category meta
  const fetchCategoryMeta = async () => {
    if (!categoryId || categoryId === 'all') {
      setCategoryName('All Materials');
      setAvailableTags([]);
      return;
    }

    try {
      // Find Category Name
      const catRes = await API.get('/materials/categories');
      if (catRes.data.success) {
        const currentCat = catRes.data.data.find(c => c._id === categoryId);
        if (currentCat) setCategoryName(currentCat.name);
      }
      
      // Fetch available tags
      const currentSubcat = searchParams.get('subcat') || '';
      let tagUrl = `/materials/tags?categoryId=${categoryId}`;
      if (currentSubcat) tagUrl += `&subcategoryId=${currentSubcat}`;
      const tagRes = await API.get(tagUrl);
      if (tagRes.data.success) {
        setAvailableTags(tagRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching category metadata:', err);
    }
  };

  // Fetch materials based on parameters
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      let queryUrl = `/materials?page=${page}&limit=12`;

      if (categoryId && categoryId !== 'all') {
        queryUrl += `&categoryId=${categoryId}`;
      }
      if (selectedSubcat) {
        queryUrl += `&subcategoryId=${selectedSubcat}`;
      }
      if (materialType) {
        queryUrl += `&type=${materialType}`;
      }
      if (selectedTag) {
        queryUrl += `&tag=${encodeURIComponent(selectedTag)}`;
      }
      if (searchQuery) {
        queryUrl += `&search=${searchQuery}`;
      }

      const res = await API.get(queryUrl);
      if (res.data.success) {
        setMaterials(res.data.data);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryMeta();
    const newSubcat = searchParams.get('subcat') || '';
    if (newSubcat !== selectedSubcat) {
      setTimeout(() => setSelectedSubcat(newSubcat), 0);
    }
    setTimeout(() => {
      setPage(1);
      setSelectedTag(''); // Reset tag when category/subcat changes
    }, 0);
  }, [categoryId, searchParams]);

  useEffect(() => {
    fetchMaterials();
  }, [categoryId, selectedSubcat, materialType, searchQuery, selectedTag, page]);

  // Keep search bar in sync with URL search query
  useEffect(() => {
    setTimeout(() => setSearchQuery(searchParamQuery), 0);
  }, [searchParamQuery]);

  if (!authLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 space-y-8 min-h-screen flex items-center justify-center">
        <div className="glass-effect border border-orange-500/30 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl shadow-orange-500/20">
          <Lock size={64} className="text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-white mb-3">Login Required</h2>
          <p className="text-gray-400 text-sm mb-8">
            To access these categories, please login or create a new account to continue exploring premium marketing materials.
          </p>
          <div className="flex flex-col gap-4">
            <Link to="/login" className="w-full bg-gradient-premium hover:bg-gradient-premium-hover py-3.5 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20 block transition-transform active:scale-95">
              Login Now
            </Link>
            <Link to="/register" className="w-full bg-white/5 hover:bg-white/10 py-3.5 rounded-xl font-bold text-white border border-white/10 block transition-transform active:scale-95">
              New User? Register Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 space-y-8">
      
      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link to="/" className="text-xs text-indigo-400 hover:underline">← Back to home</Link>
          <h1 className="text-3xl font-extrabold text-white mt-1">{categoryName}</h1>
          <p className="text-xs text-gray-400 mt-1">Discover, preview, and download templates.</p>
        </div>

        {/* Local Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search within category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col gap-6">
        
        {/* Format Tabs (Moved to top) */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { name: 'Recent', value: '' },
            { name: 'Banners (Images)', value: 'Banner' },
            { name: 'Reels & Videos', value: 'Reel,Video' },
            { name: 'PDFs & Brochures', value: 'PDF,Brochure' },
            { name: 'PPT Presentations', value: 'PPT' }
          ].map((fmt) => (
            <button
              key={fmt.name}
              onClick={() => setMaterialType(fmt.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                materialType === fmt.value 
                  ? 'bg-gradient-premium !text-white shadow-lg shadow-orange-500/30 border-transparent' 
                  : 'glass-effect !text-slate-600 hover:!text-orange-500 hover:bg-white/50 border border-slate-200'
              }`}
            >
              {fmt.name}
            </button>
          ))}
        </div>

        {/* Materials Grid Area */}
        <div className="w-full space-y-6">
          
          {/* Tags Row */}
          {availableTags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 pb-4 border-b border-white/5">
              <span className="text-xs font-semibold text-gray-400 flex items-center mr-2">
                <Tag size={12} className="mr-1" /> Filters:
              </span>
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTag === '' 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                All
              </button>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTag === tag 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video w-full bg-white/5 border border-white/5 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : materials.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <MaterialCard
                    key={material._id}
                    material={material}
                    onOpenAuthModal={onOpenAuthModal}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-300 hover:text-white bg-white/5 disabled:opacity-30 transition-opacity cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-300 hover:text-white bg-white/5 disabled:opacity-30 transition-opacity cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white/5 border border-white/5 border-dashed rounded-2xl">
              <p className="text-sm text-gray-400">No marketing templates found under this filter query.</p>
              <button
                onClick={() => {
                  setMaterialType('');
                  setSearchQuery('');
                  setSelectedTag('');
                  setSearchParams({});
                }}
                className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
