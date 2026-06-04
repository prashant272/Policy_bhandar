import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Calendar, User, Tag, BookOpen } from 'lucide-react';
import API from '../services/api';

const PLACEHOLDER_FULL_BLOGS = {
  'build-personal-brand-insurance-advisor': {
    _id: '1',
    title: 'How Insurance Advisors Can Build a Strong Personal Brand',
    excerpt: "In today's competitive insurance landscape, your personal brand is your biggest asset.",
    content: `## Why Personal Branding Matters

In today's insurance market, clients have more choices than ever. What separates a thriving advisor from one who struggles? Often, it comes down to **personal brand**.

A strong personal brand means:
- Clients trust you before they even meet you
- Your name comes up in conversations naturally
- Referrals flow without constant chasing

## Step 1: Define Your Niche

Don't try to be everything to everyone. Pick a specific segment:
- Young professionals (Term + Health)
- Senior citizens (Mediclaim)
- Business owners (Group Health + Keyman)

## Step 2: Consistent Digital Presence

Post regularly on WhatsApp, Facebook, and Instagram with **your name and photo watermarked** on every marketing material. Policy Bhandar makes this instant.

## Step 3: Build Trust with Education

Share insurance tips, case studies, and success stories. Educate before you sell. Clients buy from advisors they respect.

## Step 4: Professional Appearance

- Use a professional photo
- Have a consistent color theme
- Use branded materials from Policy Bhandar

## Conclusion

Your personal brand is your long-term business asset. Start building it today with consistent, professional, watermarked materials — available instantly at Policy Bhandar.`,
    category: 'Training', author: 'Policy Bhandar Team', readTime: 5, views: 248,
    createdAt: new Date('2024-11-15'), coverImage: '/hero_ins_1.jpg',
    tags: ['Branding', 'Insurance', 'Advisor Tips'],
  },
  'top-mdrt-strategies-2025': {
    _id: '2',
    title: 'Top 5 MDRT Strategies Every Agent Must Know in 2025',
    excerpt: "MDRT achievement is within reach for every serious insurance advisor.",
    content: `## What is MDRT?

The Million Dollar Round Table (MDRT) is the **premier association** of financial professionals worldwide. Qualifying for MDRT means you are among the top 1% of advisors globally.

## Strategy 1: Set Weekly Activity Goals

MDRT advisors don't wait for motivation. They set:
- 20 calls per week
- 5 meetings per week
- 2 proposals submitted per week

## Strategy 2: Master the Sales Conversation

The best MDRT advisors use a structured conversation:
1. **Discovery** — understand the client's needs
2. **Education** — explain the risk clearly
3. **Solution** — present the right product
4. **Commitment** — ask for the decision

## Strategy 3: Use Premium Marketing Materials

Clients judge you by your materials. Use professional, watermarked brochures and flyers from **Policy Bhandar** to make every interaction count.

## Strategy 4: Build Referral Systems

Ask every satisfied client for 2 referrals. A simple system:
> "I'm glad I could help you. Do you know 2 people who might benefit from the same protection?"

## Strategy 5: Never Stop Learning

MDRT advisors attend at least 2 training programs per year. Policy Bhandar's paid training programs are designed specifically for MDRT-level goals.

## Conclusion

MDRT is a journey, not a destination. Start today with the right strategies and the right support system.`,
    category: 'Training', author: 'Policy Bhandar Team', readTime: 4, views: 512,
    createdAt: new Date('2024-12-01'), coverImage: '/hero_ins_2.jpg',
    tags: ['MDRT', 'Sales', 'Training'],
  },
};

const CAT_COLORS = {
  'Training': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Insurance Tips': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Industry News': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Success Stories': 'bg-green-500/10 text-green-600 border-green-500/20',
  'General': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Simple markdown-like renderer for content
function RenderContent({ content }) {
  const lines = content.split('\n');
  return (
    <div className="prose prose-slate max-w-none space-y-4">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-extrabold text-slate-900 mt-8 mb-3">{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-2">{line.replace('### ', '')}</h3>;
        if (line.startsWith('- ')) return <li key={i} className="text-slate-600 text-sm leading-relaxed ml-4 list-disc">{line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
        if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-orange-400 pl-4 py-1 bg-orange-50 rounded-r-lg italic text-slate-600 text-sm">{line.replace('> ', '')}</blockquote>;
        if (line.match(/^\d+\./)) return <li key={i} className="text-slate-600 text-sm leading-relaxed ml-4 list-decimal">{line.replace(/^\d+\. /, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return (
          <p key={i} className="text-slate-600 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        );
      })}
    </div>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/blogs/${slug}`)
      .then(res => {
        if (res.data?.success) setBlog(res.data.data);
        else setBlog(PLACEHOLDER_FULL_BLOGS[slug] || null);
      })
      .catch(() => setBlog(PLACEHOLDER_FULL_BLOGS[slug] || null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-28">
        <div className="max-w-3xl mx-auto px-6 space-y-6 animate-pulse">
          <div className="h-8 w-2/3 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-28 flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen size={48} className="mx-auto text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-700">Blog not found</h2>
          <button onClick={() => navigate('/blogs')} className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm cursor-pointer">
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const catClass = CAT_COLORS[blog.category] || CAT_COLORS['General'];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">

      {/* ── Top Bar: Back button ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/blogs')}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Blogs
          </button>
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${catClass}`}>
            {blog.category}
          </span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-6">

        {/* ── Title + Meta ── */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            {blog.title}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-2xl">
            {blog.excerpt}
          </p>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1.5 text-[11px] text-slate-500 font-semibold shadow-sm">
              <User size={11} className="text-orange-500" /> {blog.author}
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1.5 text-[11px] text-slate-500 font-semibold shadow-sm">
              <Calendar size={11} className="text-orange-500" /> {formatDate(blog.createdAt)}
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1.5 text-[11px] text-slate-500 font-semibold shadow-sm">
              <Clock size={11} className="text-orange-500" /> {blog.readTime} min read
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1.5 text-[11px] text-slate-500 font-semibold shadow-sm">
              <Eye size={11} className="text-orange-500" /> {blog.views} views
            </div>
          </div>

          {/* Orange underline */}
          <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
        </div>

        {/* ── Cover Image (after title) ── */}
        <div className="relative w-full rounded-[1.5rem] overflow-hidden shadow-xl border border-slate-100 aspect-[16/7]">
          <img
            src={blog.coverImage || '/hero_ins_1.jpg'}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          {/* Subtle bottom vignette */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-900/20 to-transparent" />
        </div>

        {/* ── Article Body ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />
          <div className="p-6 sm:p-10">
            {blog.content ? (
              <RenderContent content={blog.content} />
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">{blog.excerpt}</p>
            )}
          </div>
        </div>

        {/* ── Tags ── */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={13} className="text-slate-400" />
            {blog.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-white text-slate-600 text-xs font-bold rounded-full border border-slate-200 hover:border-orange-300 hover:text-orange-600 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── CTA ── */}
        <div className="relative bg-slate-900 rounded-2xl p-8 sm:p-10 overflow-hidden text-center space-y-4">
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <span className="inline-block text-2xl">🚀</span>
            <h3 className="text-white font-extrabold text-xl leading-tight">
              Ready to grow your insurance business?
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Join Policy Bhandar and get premium marketing materials, expert training, and full advisor support.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-7 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg shadow-orange-500/30"
            >
              Get Started with Policy Bhandar
            </button>
          </div>
        </div>

        {/* ── Back link ── */}
        <div className="text-center pb-4">
          <button
            onClick={() => navigate('/blogs')}
            className="text-xs text-slate-400 hover:text-orange-500 font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Back to all articles
          </button>
        </div>
      </div>
    </div>
  );
}
