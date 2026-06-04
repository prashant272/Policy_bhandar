import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Eye, Calendar, Search, BookOpen } from 'lucide-react';
import API from '../services/api';

const PLACEHOLDER_BLOGS = [
  {
    _id: '1', title: 'How Insurance Advisors Can Build a Strong Personal Brand',
    excerpt: "In today's competitive insurance landscape, your personal brand is your biggest asset.",
    category: 'Training', author: 'Policy Bhandar Team', readTime: 5, views: 248,
    createdAt: new Date('2024-11-15'), slug: 'build-personal-brand-insurance-advisor', coverImage: '/hero_ins_1.jpg',
  },
  {
    _id: '2', title: 'Top 5 MDRT Strategies Every Agent Must Know in 2025',
    excerpt: "MDRT achievement is within reach for every serious insurance advisor.",
    category: 'Training', author: 'Policy Bhandar Team', readTime: 4, views: 512,
    createdAt: new Date('2024-12-01'), slug: 'top-mdrt-strategies-2025', coverImage: '/hero_ins_2.jpg',
  },
  {
    _id: '3', title: 'Understanding Health Insurance: A Complete Guide for Advisors',
    excerpt: "Health insurance is one of the most complex yet essential products in an advisor's portfolio.",
    category: 'Insurance Tips', author: 'Policy Bhandar Team', readTime: 7, views: 380,
    createdAt: new Date('2024-12-20'), slug: 'health-insurance-complete-guide', coverImage: '/hero_ins_3.jpg',
  },
  {
    _id: '4', title: 'Digital Marketing for Insurance Advisors: A Beginner\'s Guide',
    excerpt: "Learn how to use social media, WhatsApp, and digital tools to grow your insurance business.",
    category: 'Industry News', author: 'Policy Bhandar Team', readTime: 6, views: 290,
    createdAt: new Date('2025-01-10'), slug: 'digital-marketing-insurance-advisors', coverImage: '/hero_ins_4.jpg',
  },
];

const CATEGORIES = ['All', 'Training', 'Insurance Tips', 'Industry News', 'Success Stories', 'General'];
const CAT_COLORS = {
  'Training': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Insurance Tips': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Industry News': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Success Stories': 'bg-green-500/10 text-green-600 border-green-500/20',
  'General': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogsPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/blogs?limit=20')
      .then(res => setBlogs(res.data?.success && res.data.data.length > 0 ? res.data.data : PLACEHOLDER_BLOGS))
      .catch(() => setBlogs(PLACEHOLDER_BLOGS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = blogs.filter(b => {
    const matchCat = activeCategory === 'All' || b.category === activeCategory;
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <div className="bg-slate-900 pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold tracking-wider uppercase">
            <BookOpen size={12} /> Policy Bhandar Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Insights & <span className="text-gradient">Knowledge</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium max-w-xl mx-auto">
            Expert training guides, insurance tips, and industry news to grow your advisory business.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-orange-400/50 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 space-y-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-slate-100 rounded-full" />
                  <div className="h-4 bg-slate-100 rounded-full" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
                  <div className="h-3 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(blog => {
              const catClass = CAT_COLORS[blog.category] || CAT_COLORS['General'];
              return (
                <div
                  key={blog._id}
                  onClick={() => navigate(`/blogs/${blog.slug}`)}
                  className="group relative rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-[0_16px_40px_rgba(249,115,22,0.12)] transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <img src={blog.coverImage || '/hero_ins_1.jpg'} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/90 ${catClass}`}>{blog.category}</span>
                    </div>
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-orange-400 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col flex-1 p-5 space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">{blog.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1">{blog.excerpt}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><Clock size={10} /> {blog.readTime} min</span>
                        <span className="flex items-center gap-1"><Eye size={10} /> {blog.views}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(blog.createdAt)}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 group-hover:gap-2 transition-all duration-300">Read <ArrowRight size={10} /></span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
