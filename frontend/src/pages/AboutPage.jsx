import React, { useEffect } from 'react';
import { ShieldCheck, Users, Award, Sparkles, Target, Zap, Briefcase, ChevronRight, CheckCircle2, Quote } from 'lucide-react';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20 pb-20 bg-[#f8fafc] min-h-screen font-sans selection:bg-orange-500/30">
      
      {/* Premium Hero Section */}
      <div className="relative py-4 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/50 via-white to-white pointer-events-none"></div>
        <div className="absolute -left-40 top-20 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100/80 text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles size={14} className="text-orange-500 animate-pulse" />
            <span>Discover Our Story</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Policy Bhandar</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            India's Complete Business Builder App for Insurance Professionals. <br className="hidden md:block" />
            <span className="font-bold text-slate-800">Learn Faster. Sell Smarter. Recruit Bigger.</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 space-y-24">
        
        {/* Founder Section - Elegant Card */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2.5rem] transform rotate-1 opacity-10"></div>
          <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-xl shadow-slate-200/40 border border-slate-100 relative z-10 overflow-hidden">
            <div className="absolute -right-20 -top-20 text-slate-50 opacity-50 pointer-events-none">
              <Award size={400} strokeWidth={1} />
            </div>
            
            <div className="max-w-4xl relative z-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
                  <Award className="text-orange-500" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Yogendra Verma</h2>
                  <p className="text-orange-600 font-bold tracking-wide uppercase text-sm mt-1">Founder & CEO</p>
                </div>
              </div>
              
              <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p>
                  With more than <strong className="text-slate-900">28 years of experience</strong> in the Insurance and Financial Services industry, Yogendra Verma has dedicated his career to helping Insurance Advisors, Mutual Fund Advisors, and Business Leaders build sustainable, profitable, and long-term businesses.
                </p>
                <p>
                  Throughout his professional journey, he has trained, mentored, and guided thousands of insurance professionals across India in the areas of Sales, Recruitment (<strong className="text-orange-600">6000+ agents Recruited in 6 years</strong>), Leadership Development, Digital Marketing, Branding, Customer Acquisition, and Business Growth Strategies.
                </p>
                
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 my-10">
                  <Quote className="absolute top-6 right-6 text-slate-200 w-16 h-16 pointer-events-none" />
                  <p className="text-slate-800 font-bold italic text-xl md:text-2xl leading-relaxed relative z-10">
                    "Empower Advisors with Knowledge, Technology, and Digital Marketing so they can build a bigger business while serving their clients professionally."
                  </p>
                </div>
                
                <p>
                  Today, through Policy Bhandar, he is transforming traditional insurance selling into a <strong className="text-slate-900">Digital-First Business Model</strong>, enabling advisors and leaders to market, recruit, sell, and grow smarter than ever before.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Purpose & Why - Dual Premium Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1 */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-lg shadow-slate-200/30 border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8">
              <Target size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Why Policy Bhandar?</h2>
            <div className="space-y-6 text-slate-600 text-lg">
              <p>
                Policy Bhandar is not just another content library. It is a <strong className="text-slate-900">Complete Business Growth Ecosystem</strong> specially designed for:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Insurance Advisors', 'Mutual Fund Advisors', 'Insurance Leaders', 'Agency Managers', 'Trainers', 'Business Builders'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <ShieldCheck className="text-emerald-500 flex-shrink-0" size={20} />
                    <span className="font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="pt-2">
                Whether your goal is to generate more business, recruit more advisors, improve your digital presence, or become a recognized industry expert, Policy Bhandar provides the right knowledge, tools, and resources—all in one place.
              </p>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50/30 rounded-[2.5rem] p-8 md:p-12 shadow-lg shadow-orange-100/50 border border-orange-100/60 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <Zap size={250} className="text-orange-600" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center mb-8 relative z-10 shadow-md shadow-orange-500/20">
              <Zap size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 relative z-10">Purpose of Policy Bhandar</h2>
            <div className="space-y-6 text-slate-700 text-lg relative z-10">
              <p>
                The purpose of Policy Bhandar is to bridge the gap between traditional selling and modern digital business building. Our objective is to provide every professional with:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Professional Marketing Materials', 'AI-Powered Reels', 'Ready-to-use Presentations', 'Sales Scripts', 'WhatsApp Marketing Resources', 'Recruitment Tools', 'Digital Branding Techniques', 'Closing Strategies', 'Business Automation', 'Continuous Learning'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="text-orange-500 flex-shrink-0" size={18} />
                    <span className="font-medium text-sm text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 mt-4 border-t border-orange-200/50">
                <p className="font-bold text-slate-900">
                  Everything is available in a structured, mobile-first platform that saves time, improves productivity, and accelerates business growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Missions Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900">Our Mission</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission for Advisors */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-md shadow-slate-200/40 border border-slate-100 group hover:border-blue-200 transition-colors">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-4">Mission for Advisors</h3>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                We are committed to helping every Insurance and Mutual Fund Advisor build a stronger, more profitable, and more professional business through reliable digital tools, practical training, and continuous learning.
              </p>
              <div className="space-y-3 mb-10">
                {['Build their business faster', 'Upgrade marketing & selling skills', 'Strengthen customer relationships', 'Deliver better financial guidance', 'Improve productivity using technology', 'Build a recognizable personal brand', 'Generate more quality leads'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50/50 p-2 rounded-lg">
                    <ChevronRight className="text-blue-500" size={16} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-600 uppercase tracking-widest font-black mb-2">Our Long-Term Goal</p>
                <p className="font-bold text-slate-800 text-lg">
                  To empower <span className="text-blue-600 text-xl font-black">5,00,000+</span> Advisors through the platform and help them maximize their income while delivering greater value to their clients.
                </p>
              </div>
            </div>

            {/* Mission for Leaders */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-md shadow-slate-200/40 border border-slate-100 group hover:border-orange-200 transition-colors">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Briefcase size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-4">Mission for Leaders</h3>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                Our mission is to transform Insurance Leaders into powerful Business Builders by providing proven recruitment systems, digital marketing tools, leadership training, and scalable business processes.
              </p>
              <div className="space-y-3 mb-10">
                {['Recruit advisors completely digitally', 'Build a consistent recruitment pipeline', 'Conduct bulk hiring campaigns', 'Build high-performing advisor teams', 'Automate recruitment & follow-ups', 'Scale operations with digital systems', 'Build 100+ active advisors every year'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-medium bg-slate-50/50 p-2 rounded-lg">
                    <ChevronRight className="text-orange-500" size={16} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                <p className="text-xs text-orange-600 uppercase tracking-widest font-black mb-2">Our Long-Term Goal</p>
                <p className="font-bold text-slate-800 text-lg">
                  To empower <span className="text-orange-600 text-xl font-black">10,000+</span> Insurance Leaders to exponentially increase their recruitment, business growth, and annual earnings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Commitment - Clean Light Version */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/30 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-50 to-transparent opacity-60 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-16">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">Our Vision</h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Our vision is to make Insurance Advisory, Mutual Fund Advisory, Leadership Development, Recruitment, and Business Building more transparent, searchable, organized, and mobile-first for every professional.
                <br/><br/>
                We aspire to create India's most trusted digital platform where every advisor and leader can learn, grow, recruit, market, and manage their business from a single application.
              </p>
            </div>
            
            <div className="bg-slate-900 rounded-3xl p-10 md:p-12 text-left relative overflow-hidden shadow-2xl">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
              <h3 className="text-2xl font-bold mb-6 text-orange-400 flex items-center gap-3">
                <Sparkles size={24} />
                Our Commitment
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg mb-8">
                At Policy Bhandar, we believe that <strong className="text-white">knowledge, technology, consistency, and execution</strong> are the four pillars of long-term success. Every update, every banner, every AI reel, every presentation, every training session, and every feature in the app is created with one purpose: 
              </p>
              <div className="bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-sm">
                <p className="text-white font-bold text-xl leading-relaxed italic">
                  "To help Insurance & Mutual Fund Advisors and Leaders learn faster, recruit smarter, market better, sell more professionally, and build a business that creates lasting value for themselves and their clients."
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
