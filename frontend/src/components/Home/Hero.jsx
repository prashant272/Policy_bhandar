import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Send, Star, ShieldCheck, Users, Search, Award } from 'lucide-react';
import API from '../../services/api';

export default function Hero() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State - Streamlined for Insurance Marketing Inquiries
  const [heroForm, setHeroForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Branding & Marketing Materials',
    requirement: ''
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    try {
      const fullMessage = `Service Type: ${heroForm.role} | Specific Requirements: ${heroForm.requirement}`;

      await API.post('/contacts', {
        name: heroForm.name,
        email: heroForm.email,
        phone: heroForm.phone,
        message: fullMessage,
        source: 'Hero Form (Policybhandar Custom Proposal Request)'
      });

      setStatus('Success: Inquiry submitted! Our support team will reach out within 2 hours.');
      window.alert('Inquiry submitted! Our technical team will reach out within 2 hours.');

      setHeroForm({ name: '', phone: '', email: '', role: 'Branding & Marketing Materials', requirement: '' });
      setTimeout(() => setStatus(''), 6000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('Error: Submission failed. Please try again.');
      window.alert('Submission failed. Please try again.');
      setTimeout(() => setStatus(''), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slides = [
    {
      image: '/hero_ins_1.jpg',
      mobileImage: '/hero_ins_1.jpg',
      title: 'Branding & Marketing Materials',
      highlight: 'High-Converting Reels & Banners',
      description: 'Get access to customizable festival banners, greetings, and viral short reels. Automatically personalized with your photo, name, and contact details in one click.',
    },
    {
      image: '/hero_ins_2.jpg',
      mobileImage: '/hero_ins_2.jpg',
      title: 'Paid Agent Trainings',
      highlight: 'Empowering Agents for Success',
      description: 'Agents play a crucial role in any organization as they are responsible for handling customers’ requests, promoting products, and providing excellent service. To ensure their effectiveness, agents need comprehensive training.',
    },
    {
      image: '/hero_ins_3.jpg',
      mobileImage: '/hero_ins_3.jpg',
      title: 'Pay Your Policies Premium',
      highlight: 'Easy & Convenient Online Payments',
      description: 'Welcome to our premium payment portal! We make it easy and convenient for you to pay your insurance premium online. Follow the simple steps to complete your premium payment.',
    },
    {
      image: '/hero_ins_4.jpg',
      mobileImage: '/hero_ins_4.jpg',
      title: 'Awesome Insurance Services',
      highlight: 'Got Your Back In Every Unpredictability',
      description: 'Hey there! Welcome to our awesome Insurance Services. We’ve got your back when it comes to all things insurance. In this crazy world of unpredictability, it’s important to be prepared, right? Welcome!',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlide];

  return (
    <section className="relative min-h-screen md:min-h-[100dvh] w-full flex items-center overflow-hidden bg-slate-950 selection:bg-amber-400 selection:text-slate-900 leading-tight">

      {/* Background Slideshow Layer */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <picture className="w-full h-full">
              <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
              <img
                src={slide.image}
                alt={`Hero Slide ${index + 1}`}
                className="w-full h-full object-cover object-[75%_center] md:object-center"
              />
            </picture>
          </div>
        ))}
        {/* Dynamic Static Overlays - Pulled out of the slide loop to avoid brightness/overlay flickering */}
        <div className="absolute inset-0 bg-slate-950/50 z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 z-20"></div>
        
        {/* Glow Lines & Orbs */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent z-30"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none z-30"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-30 pt-16 sm:pt-16 md:pt-20 lg:pt-24 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

          {/* Left Column: Slideshow Content & Premium Search */}
          <div className="lg:col-span-7 flex flex-col justify-start relative">
            <div className="flex flex-col justify-start text-left">

              {/* Stable Height Container: Prevents buttons/badges from jumping up/down when slide changes */}
              <div className="relative w-full min-h-[220px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[380px] xl:min-h-[340px] mb-6">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-x-0 top-0 transition-all duration-[1000ms] ease-in-out flex flex-col space-y-4 md:space-y-5 ${
                      index === currentSlide
                        ? 'opacity-100 translate-y-0 scale-100 z-10 pointer-events-auto'
                        : 'opacity-0 -translate-y-4 scale-95 z-0 pointer-events-none'
                    }`}
                  >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-display font-extrabold !text-white leading-[1.15] tracking-tight drop-shadow-[0_15px_50px_rgba(0,0,0,1)]">
                      {slide.title}{' '}
                      <span className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl !text-amber-400 italic font-display font-medium drop-shadow-md">
                        — {slide.highlight}
                      </span>
                    </h1>

                    <p className="text-slate-200 text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl tracking-tight opacity-90 border-l-4 border-amber-500/50 pl-6 py-1.5">
                      {slide.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons restored and polished */}
              <div className="flex flex-wrap justify-start gap-3 md:gap-6 pt-2">
                <button 
                  onClick={() => navigate('/category/all')} 
                  className="group relative px-5 py-3 md:px-8 md:py-4 bg-amber-500 text-slate-900 font-black uppercase tracking-[0.3em] overflow-hidden rounded-xl transition-all hover:scale-105 active:scale-95 text-[9px] md:text-[11px] shadow-2xl shadow-amber-500/20 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Users size={15} fill="currentColor" className="md:w-5 md:h-5" />
                    Browse Marketing Material
                  </span>
                  <div className="absolute inset-0 bg-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </button>

                <button 
                  onClick={() => document.getElementById('hero-quick-form')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="group relative px-5 py-3 md:px-8 md:py-4 bg-white/10 border-2 border-white/20 text-white font-black uppercase tracking-[0.3em] overflow-hidden rounded-xl transition-all hover:bg-white/20 hover:text-white active:scale-95 text-[9px] md:text-[11px] backdrop-blur-xl shadow-2xl shadow-black/50 cursor-pointer animate-pulse"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <ArrowRight size={15} className="md:w-5 md:h-5" />
                    Become an Agent
                  </span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-8 max-w-2xl">
                <div className="glass-badge">
                  <ShieldCheck className="text-amber-300" size={16} />
                  <span className="text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Auto-Watermarked PDFs</span>
                </div>
                <div className="glass-badge">
                  <Star className="text-amber-300" size={16} />
                  <span className="text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Premium Collaterals & Reels</span>
                </div>
                <div className="glass-badge">
                  <Users className="text-amber-300" size={16} />
                  <span className="text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Growing Advisor Network</span>
                </div>
                <div className="glass-badge">
                  <Award className="text-amber-300" size={16} />
                  <span className="text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Certified MDRT Modules</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Premium Custom Inquiry Form */}
          <div id="hero-quick-form" className="lg:col-span-12 xl:col-span-5 animate-fade-in-up delay-700 relative group lg:justify-self-end w-full max-w-[450px]">
            <div className="glass-card rounded-[2.5rem] p-6 lg:p-10 relative overflow-hidden group hover:border-white/40 transition-all duration-1000">

              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full"></div>

              <div className="relative z-10 space-y-6">
                
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl md:text-3xl font-display text-white mb-2 leading-none">
                    Grow Your <span className="text-amber-400 italic inline-block pb-1 pr-2">Agency</span>
                  </h3>
                  <p className="text-white/60 text-[10px] uppercase tracking-[0.4em] font-black italic">
                    Reels, Banners, Recruitment & Sales Training
                  </p>
                </div>

                <form onSubmit={handleApply} className="space-y-4">
                  {status && (
                    <div className={`p-3 rounded-xl border text-[11px] font-bold text-center ${
                      status.toLowerCase().includes('error') 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {status}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="group/input relative">
                      <input
                        type="text"
                        required
                        value={heroForm.name}
                        onChange={e => setHeroForm({ ...heroForm, name: e.target.value })}
                        placeholder="Full Name / Agency Name"
                        className="w-full glass-input px-6 py-4 text-white placeholder:text-white/40 text-[11px] font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="tel"
                        required
                        value={heroForm.phone}
                        onChange={e => setHeroForm({ ...heroForm, phone: e.target.value })}
                        placeholder="WhatsApp Number"
                        className="w-full glass-input px-6 py-4 text-white placeholder:text-white/40 text-[11px] font-medium"
                      />
                      <input
                        type="email"
                        required
                        value={heroForm.email}
                        onChange={e => setHeroForm({ ...heroForm, email: e.target.value })}
                        placeholder="Email Address"
                        className="w-full glass-input px-6 py-4 text-white placeholder:text-white/40 text-[11px] font-medium"
                      />
                    </div>

                    <div className="relative">
                      <select
                        value={heroForm.role}
                        onChange={e => setHeroForm({ ...heroForm, role: e.target.value })}
                        className="w-full glass-input px-6 py-4 text-white/80 placeholder:text-white/40 text-[11px] font-medium appearance-none cursor-pointer [&>option]:bg-slate-900"
                      >
                        <option value="Branding & Marketing Materials">Branding & Marketing Materials</option>
                        <option value="Paid Agent Trainings">Paid Agent Trainings</option>
                        <option value="Agent Recruitment & Growth">Agent Recruitment & Growth</option>
                        <option value="Policies Premium Support">Policies Premium Support</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-[10px]">▼</div>
                    </div>

                    <textarea
                      rows="4"
                      required
                      value={heroForm.requirement}
                      onChange={e => setHeroForm({ ...heroForm, requirement: e.target.value })}
                      placeholder="Branding / Recruitment needs (e.g. I need daily branding posters, custom marketing reels, and counselor recruitment flyers personalized with my photo and LIC code)"
                      className="w-full glass-input px-6 py-4 text-white placeholder:text-white/40 text-[11px] font-medium resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full py-5 bg-amber-500 text-slate-900 font-black uppercase tracking-[0.3em] overflow-hidden rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-[10px] shadow-2xl shadow-amber-500/30 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? 'Transmitting Request...' : 'Get Custom B2B Growth Proposal'}
                      <Send size={14} />
                    </span>
                    <div className="absolute inset-0 bg-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
                </form>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hero Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 animate-bounce hidden lg:flex">
        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-[0.5em] rotate-90 mb-8 origin-left">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-amber-400 to-transparent"></div>
      </div>

    </section>
  );
}
