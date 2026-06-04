import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, BookOpen, Users, Award, Sparkles, Quote, CheckCircle2, Play, Flame, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';

export default function About() {
  const slides = [
    {
      url: '/founder.webp',
      fallback: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
      label: 'Mr. Yogendra Verma (Founder)',
      subtitle: '16+ Years Experience'
    },
    {
      url: '/founter2.webp',
      fallback: 'https://images.unsplash.com/photo-1552581230-c01bc0d4629d?auto=format&fit=crop&q=80&w=600',
      label: 'Elite Advisor Training & Guidance',
      subtitle: 'Trained Thousands Across India'
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [isVideoHovered, setIsVideoHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="bg-white border border-slate-100/90 rounded-[3rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.03)] space-y-6 text-left relative overflow-hidden">
      
      {/* Premium Backglow Ambient Orbs */}
      <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-gradient-to-tr from-orange-500/5 to-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/5 to-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/2 to-yellow-500/2 rounded-full blur-[140px] pointer-events-none"></div>

      {/* ==========================================================
          HEADER: MAIN SECTION TITLE
          ========================================================== */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-orange-500/5 text-orange-600 border border-orange-500/10 text-xs font-bold tracking-wider uppercase">
          <Sparkles size={12} className="text-orange-500 animate-pulse" />
          <span className="!text-orange-600">Discover Policy Bhandar</span>
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          About <span className="text-gradient">Policy Bhandar</span>
        </h2>
        <div className="w-24 h-1 bg-gradient-premium mx-auto rounded-full mt-3"></div>
      </div>

      {/* ==========================================================
          ROW 1: FOUNDER STORY & SPOTLIGHT
          ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Founder Story & Detailed Bio */}
        <div className="lg:col-span-7 space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
            <span className="!text-slate-700">Founder Spotlight</span>
          </span>
          
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Mr. Yogendra Verma
            </h3>
            <p className="text-sm font-semibold text-orange-600 flex items-center gap-1.5">
              <Award size={16} />
              <span>Insurance Expert & Visionary Leader (16+ Years Experience)</span>
            </p>
          </div>

          {/* Styled Quote Callout */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-r from-orange-50/50 to-amber-50/50 border border-orange-100/50 my-4">
            <Quote className="absolute top-4 right-4 text-orange-500/10 w-12 h-12 pointer-events-none" />
            <p className="text-sm text-slate-700 font-bold italic leading-relaxed relative z-10">
              "Policy Bhandar was founded with a single, powerful mission: to impart deep insurance knowledge and premium professional training to maximum people in the Insurance Marketing Field force, helping them scale greater heights."
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-500 leading-relaxed font-medium">
            <p>
              In a short span of fewer than 5 years, Policy Bhandar has successfully trained thousands of insurance advisors across India on a yearly basis, establishing itself as a premier destination for advisor development and financial success.
            </p>
            <p>
              Under the veteran leadership of Mr. Verma, we aim to bridge the gap between traditional advisor channels and modern digital marketing methodologies, giving every advisor the absolute competitive advantage they need.
            </p>
          </div>

          {/* Quick Credential Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100/80">
              <CheckCircle2 size={16} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700">16+ Years Training Experience</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100/80">
              <CheckCircle2 size={16} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700">Thousands of Advisors Trained</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100/80">
              <CheckCircle2 size={16} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700">Universal Advisor Portal</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100/80">
              <CheckCircle2 size={16} className="text-orange-500 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700">Actionable Success Blueprints</span>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => document.getElementById('hero-quick-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-6 py-3.5 bg-gradient-premium hover:bg-gradient-premium-hover !text-white font-extrabold uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 text-[11px] shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer w-fit"
            >
              <span className="!text-white">Contact Our Expert</span>
              <ArrowRight size={14} className="!text-white" />
            </button>
          </div>
        </div>

        {/* Right Column: Founder Image Frame (Slideshow Carousel) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
          <div className="relative group w-full aspect-[4/3] bg-gradient-to-br from-orange-400 to-amber-500 rounded-[2.5rem] p-1.5 shadow-[0_20px_50px_rgba(249,115,22,0.12)] overflow-hidden">
            {/* Slide Container */}
            <div className="relative w-full h-full rounded-[2.3rem] overflow-hidden bg-slate-900">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {/* Elegant glass shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent z-20 pointer-events-none"></div>
                  
                  <img 
                    src={slide.url} 
                    alt={slide.label} 
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = slide.fallback;
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Carousel Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-100 flex items-center justify-center text-slate-800 hover:text-orange-500 shadow-md hover:scale-105 active:scale-95 transition-all z-30 opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-100 flex items-center justify-center text-slate-800 hover:text-orange-500 shadow-md hover:scale-105 active:scale-95 transition-all z-30 opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight size={20} />
            </button>

            {/* Slide Indicator Dots */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlide(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>

            {/* Premium Overlay Floating Dynamic Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-2xl flex items-center gap-3 shadow-lg z-30 transition-all group-hover:translate-y-[-4px]">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 flex-shrink-0">
                <Flame size={20} />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider truncate">
                  {slides[activeSlide].subtitle}
                </p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {slides[activeSlide].label}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ==========================================================
          ROW 2: OUR CORE PILLARS & SERVICES GRID
          ========================================================== */}
      <div className="border-t border-slate-100/90 pt-6 space-y-4">
        <div className="text-center lg:text-left space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider">
            <span>🎯 Our Focus & Expertise</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Training & Service Solutions
          </h3>
          <p className="text-sm text-slate-500 max-w-2xl font-medium">
            We handle the full business cycle of an insurance advisor—grooming communication, mastery over products, claims coordination, and digital branding.
          </p>
        </div>

        {/* Feature Grid representing the pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1 */}
          <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100/60 hover:bg-white hover:border-orange-200 hover:shadow-[0_15px_30px_rgba(249,115,22,0.04)] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Elite Advisor Trainings</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Comprehensive paid training systems for beginners, advanced, and ultra-advanced levels with premium physical and digital study materials.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100/60 hover:bg-white hover:border-orange-200 hover:shadow-[0_15px_30px_rgba(249,115,22,0.04)] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Multi-Vertical Expertise</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              In-depth coverage for Health, Life, General, Motor, Group Health, and Society Insurance. Deep-dive comparisons and analysis.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100/60 hover:bg-white hover:border-orange-200 hover:shadow-[0_15px_30px_rgba(249,115,22,0.04)] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Interpersonal Grooming</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              We groom professional communication, soft skills, advisory ethics, and digital branding elements that immediately capture trust.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100/60 hover:bg-white hover:border-orange-200 hover:shadow-[0_15px_30px_rgba(249,115,22,0.04)] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HeartHandshake size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Claims & Support Value</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              We emphasize long-term relationships, professional values, claims guidance, renewals, and real-time market updates for clients.
            </p>
          </div>

        </div>
      </div>

      {/* ==========================================================
          ROW 3: COMPANY VIDEO & CORE PHILOSOPHY
          ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-slate-100/90 pt-6">
        
        {/* Left Column: Slogans & Quotations */}
        <div className="lg:col-span-7 space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 text-xs font-semibold uppercase tracking-wider">
            <span>🛡️ Our Credo & Slogan</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Trust is Built on Uncompromising Guarantees
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slogan Card 1 */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 space-y-3 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <Quote className="absolute -right-2 -bottom-2 text-slate-200/60 w-16 h-16 pointer-events-none" />
              <p className="text-xs font-extrabold text-orange-500 uppercase tracking-widest">Core Mission</p>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                "Save Yourself and Save Your Family with Policy Bhandar"
              </p>
            </div>

            {/* Slogan Card 2 */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-50/50 to-orange-100/10 border border-orange-100/60 space-y-3 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <Quote className="absolute -right-2 -bottom-2 text-orange-200/40 w-16 h-16 pointer-events-none" />
              <p className="text-xs font-extrabold text-orange-500 uppercase tracking-widest">Our Value Pledge</p>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                "Policy Bhandar Ka Vada, Daam Kam Fayeda Jyada"
              </p>
            </div>
          </div>

          {/* Transparency Highlight Callout Box */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800">100% Unbiased Advisory Policy</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                We present professional, granular product comparisons and honest, transparent opinions. We never compromise on integrity or recommend products that don't fit our clients' best interests.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Video Container */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Watch Video Presentation</h4>
            <p className="text-sm font-bold text-slate-800">Learn More About Policy Bhandar</p>
          </div>

          {/* YouTube Video Mock Frame wrapped in container for hover autoplay */}
          <div 
            onMouseEnter={() => setIsVideoHovered(true)}
            onMouseLeave={() => setIsVideoHovered(false)}
            className="relative aspect-video w-full rounded-[2rem] bg-slate-900 overflow-hidden shadow-2xl border border-slate-100 group cursor-pointer"
          >
            {isVideoHovered ? (
              <iframe
                src="https://www.youtube.com/embed/HV5jPLnF4qY?autoplay=1&mute=0&controls=1&rel=0"
                title="Policy Bhandar Corporate Video"
                className="w-full h-full absolute inset-0 border-0 z-20"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <a 
                href="https://www.youtube.com/watch?v=HV5jPLnF4qY&t=2s" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <img 
                  src="https://img.youtube.com/vi/HV5jPLnF4qY/maxresdefault.jpg" 
                  alt="Policy Bhandar Corporate Video Thumbnail" 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://img.youtube.com/vi/HV5jPLnF4qY/hqdefault.jpg";
                  }}
                />
                
                {/* Top Info Tag */}
                <div className="absolute top-4 left-4 bg-red-600/90 !text-white font-extrabold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider border border-white/10 shadow-md">
                  <span className="!text-white">🚨 Expert Advice Free of Cost</span>
                </div>
                
                {/* Bottom Gradient overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 flex flex-col justify-end text-left z-10">
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider leading-none">अभी कॉल करें | Policy Bhandar</span>
                  <span className="text-[9px] text-white/70 mt-1 font-medium">Watch Corporate Introduction</span>
                </div>

                {/* Centered Play Button with pulse waves */}
                <div className="absolute inset-0 flex items-center justify-center z-15">
                  <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center !text-white shadow-2xl group-hover:scale-110 transition-transform duration-300 relative">
                    <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-35"></div>
                    <Play size={20} className="ml-1 fill-white !text-white" />
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>

      </div>

    </section>
  );
}
