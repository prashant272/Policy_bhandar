import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Eye, Sparkles, Calendar } from 'lucide-react';
import API from '../../services/api';

const PLACEHOLDER_BLOGS = [
  {
    _id: '1',
    title: 'How Insurance Advisors Can Build a Strong Personal Brand',
    excerpt: "In today's competitive insurance landscape, your personal brand is your biggest asset. Learn proven strategies to stand out and build lasting trust with clients.",
    category: 'Training',
    author: 'Policy Bhandar Team',
    readTime: 5,
    views: 248,
    createdAt: new Date('2024-11-15'),
    slug: 'build-personal-brand-insurance-advisor',
    coverImage: '/hero_ins_1.jpg',
  },
  {
    _id: '2',
    title: 'Top 5 MDRT Strategies Every Agent Must Know in 2025',
    excerpt: "MDRT achievement is within reach for every serious insurance advisor. Discover the top 5 strategies used by top-performing agents to consistently exceed their targets.",
    category: 'Training',
    author: 'Policy Bhandar Team',
    readTime: 4,
    views: 512,
    createdAt: new Date('2024-12-01'),
    slug: 'top-mdrt-strategies-2025',
    coverImage: '/hero_ins_2.jpg',
  },
  {
    _id: '3',
    title: 'Understanding Health Insurance: A Complete Guide for Advisors',
    excerpt: "Health insurance is one of the most complex yet essential products in an advisor's portfolio. This comprehensive guide breaks down everything you need to know.",
    category: 'Insurance Tips',
    author: 'Policy Bhandar Team',
    readTime: 7,
    views: 380,
    createdAt: new Date('2024-12-20'),
    slug: 'health-insurance-complete-guide',
    coverImage: '/hero_ins_3.jpg',
  },
];

const CATEGORY_COLORS = {
  'Training':        'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Insurance Tips':  'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Industry News':   'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Success Stories': 'bg-green-500/10 text-green-600 border-green-500/20',
  'General':         'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogSection() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/blogs?limit=3')
      .then(res => {
        setBlogs(res.data?.success && res.data.data.length > 0 ? res.data.data : PLACEHOLDER_BLOGS);
      })
      .catch(() => setBlogs(PLACEHOLDER_BLOGS))
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = (blog) => {
    navigate(`/blogs/${blog.slug}`);
  };

  return (
    <section className="bg-white border border-slate-100/90 rounded-[3rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.03)] relative overflow-hidden">

      {/* Ambient glow orbs */}
      <div className="absolute -top-32 -right-32 w-[350px] h-[350px] bg-gradient-to-tr from-orange-500/5 to-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[350px] h-[350px] bg-gradient-to-tr from-amber-500/5 to-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/5 text-orange-600 border border-orange-500/10 text-xs font-bold tracking-wider uppercase">
            <Sparkles size={12} className="text-orange-500 animate-pulse" />
            Latest from the Blog
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Insights & <span className="text-gradient">Knowledge</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-premium rounded-full" />
        </div>
        <button
          onClick={() => navigate('/blogs')}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-orange-200 text-orange-600 font-bold text-xs hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 self-start sm:self-auto cursor-pointer shrink-0"
        >
          View All Blogs
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-44 bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 bg-slate-100 rounded-full" />
                <div className="h-4 bg-slate-100 rounded-full" />
                <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
                <div className="h-3 bg-slate-100 rounded-full" />
                <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {blogs.map((blog) => {
            const catClass = CATEGORY_COLORS[blog.category] || CATEGORY_COLORS['General'];
            return (
              <div
                key={blog._id}
                onClick={() => handleCardClick(blog)}
                className="group relative rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-[0_16px_40px_rgba(249,115,22,0.12)] transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
              >
                {/* Cover */}
                <div className="relative h-48 overflow-hidden shrink-0">
                  <img
                    src={blog.coverImage || '/hero_ins_1.jpg'}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />

                  {/* Category badge on image */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/90 ${catClass}`}>
                      {blog.category}
                    </span>
                  </div>

                  {/* Corner brackets on hover */}
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-orange-400 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-orange-400 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
                    {blog.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-3 flex-1">
                    {blog.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {blog.readTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={10} /> {blog.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {formatDate(blog.createdAt)}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 group-hover:gap-2 transition-all duration-300">
                      Read <ArrowRight size={10} />
                    </span>
                  </div>
                </div>

                {/* Bottom orange bar on hover */}
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-premium scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
