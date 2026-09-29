import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  CheckCircle2, Calendar, Video, BookOpen, 
  IndianRupee, Clock, ChevronDown, ChevronUp, 
  Award, ShieldCheck, Users, ArrowRight,
  Star,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function StarHealthAgentPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', occupation: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const calculateTimeLeft = () => {
    const difference = +new Date("October 11, 2026 12:00:00") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const faqs =[
  {
    question: "Do I need any prior experience to become an agent?",
    answer: "No prior insurance or sales experience is required. The webinar explains the certification process from scratch."
  },
  {
    question: "Is this webinar really only ₹99?",
    answer: "Yes. The regular fee is ₹999, but seats are available for ₹99 for a limited time as part of the recruitment drive."
  },
  {
    question: "What do I need to attend the webinar?",
    answer: "You only need a smartphone or laptop with internet access. The meeting link will be sent to your registered email and WhatsApp number."
  },
  {
    question: "Is Star Health Insurance certification recognized?",
    answer: "Yes. Agent certification follows IRDAI guidelines and is recognized nationally."
  },
  {
    question: "Can I do this alongside my current job?",
    answer: "Yes. You can start part-time while continuing your current job and build it as a second income stream."
  },
  {
    question: "Will there be a live Q&A during the webinar?",
    answer: "Yes. The final part of the session includes a live Q&A with senior agents."
  }
];

  const scrollToForm = () => {
    const inputElement = document.getElementById('registration-name-input');
    if (inputElement) {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        inputElement.focus();
      }, 500);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('');
    try {
      const fullMessage = `Service Type: Agent Recruitment & Growth | Specific Requirements: Star Health Agent Webinar Registration (Occupation: ${formData.occupation})`;
      await API.post('/contacts', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: fullMessage,
        source: 'Star Health Agent Page'
      });
      setStatusMsg('Registration successful! Our team will contact you.');
      alert('Registration successful! Our team will contact you.');
      setFormData({ name: '', email: '', phone: '', occupation: '' });
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (error) {
      setStatusMsg('Error: Registration failed. Please try again.');
      alert('Error: Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#0d1e38] via-[#0f2a52] to-[#0d1e38]">
        {/* Background Accents */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#d97706]/10 to-transparent pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 animate-fade-in-up">
              
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <span className="bg-[#fef3c7] text-[#92400e] px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
                  <Star size={12} className="fill-current" />Health Insurance - Official Recruitment Drive
                </span>
                <span className="bg-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0f2a52] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Session
                </span>
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold leading-[1.1] tracking-tight animate-letter-join" style={{ color: '#ffffff' }}>
                Become a Star Health <br className="hidden md:block"/>
                Insurance Agent <span style={{ color: '#fbbf24' }}>& Build</span> <br className="hidden md:block"/>
                <span className="animate-typing" style={{ color: '#fbbf24' }}>a High-Income Career</span>
              </h1>
              
              <p className="text-base md:text-lg max-w-2xl font-medium leading-relaxed" style={{ color: '#dbeafe' }}>
                Join our free live webinar to learn how to become a certified insurance agent, understand IRDAI licensing, and start earning commission-based income from home - no prior experience needed.
              </p>

              {/* Webinar Features */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                  <Calendar color="#fbbf24" size={20} />
                  <div>
                    <div className="font-bold text-xs sm:text-sm leading-tight" style={{ color: '#ffffff' }}>90 Minutes</div>
                    <div className="text-[10px] sm:text-xs" style={{ color: '#bfdbfe' }}>Live Session</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                  <Video color="#fbbf24" size={20} />
                  <div>
                    <div className="font-bold text-xs sm:text-sm leading-tight" style={{ color: '#ffffff' }}>Live Webinar</div>
                    <div className="text-[10px] sm:text-xs" style={{ color: '#bfdbfe' }}>Session</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                  <BookOpen color="#fbbf24" size={20} />
                  <div>
                    <div className="font-bold text-xs sm:text-sm leading-tight" style={{ color: '#ffffff' }}>IRDAI Guidance</div>
                    <div className="text-[10px] sm:text-xs" style={{ color: '#bfdbfe' }}>Step by Step</div>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="pt-4 pb-2">
                <p className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#bfdbfe' }}>
                  <Clock size={16} color="#fbbf24" className="animate-pulse" /> Webinar starts on 11 Oct, 12:00 PM:
                </p>
                <div className="flex gap-3 sm:gap-4">
                  {[
                    { label: 'Days', value: timeLeft.days },
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Minutes', value: timeLeft.minutes },
                    { label: 'Seconds', value: timeLeft.seconds }
                  ].map((unit, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 min-w-[70px] sm:min-w-[80px] shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                      <span className="text-2xl sm:text-3xl font-black tabular-nums drop-shadow-md" style={{ color: '#ffffff' }}>{String(unit.value).padStart(2, '0')}</span>
                      <span className="text-[10px] sm:text-xs font-bold uppercase mt-1" style={{ color: '#bfdbfe' }}>{unit.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-6 animate-fade-in-up-delay-2">
                 <div className="text-center bg-white p-3 rounded-2xl shadow-lg border border-blue-50/20 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                    <div className="text-blue-600 font-extrabold text-xl sm:text-2xl tracking-tight">&#8377;25K+</div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 leading-tight">Avg. monthly<br/>income potential</div>
                 </div>
                 <div className="text-center bg-white p-3 rounded-2xl shadow-lg border border-blue-50/20 relative overflow-hidden group">
                    <div className="text-blue-600 font-extrabold text-xl sm:text-2xl tracking-tight">10,000+</div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 leading-tight">Agents onboarded</div>
                 </div>
                 <div className="text-center bg-white p-3 rounded-2xl shadow-lg border border-blue-50/20 relative overflow-hidden group">
                    <div className="text-blue-600 font-extrabold text-xl sm:text-2xl tracking-tight">0%</div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 leading-tight">Prior experience<br/>required</div>
                 </div>
                 <div className="text-center bg-white p-3 rounded-2xl shadow-lg border border-blue-50/20 relative overflow-hidden group">
                    <div className="text-blue-600 font-extrabold text-xl sm:text-2xl tracking-tight">15</div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1 leading-tight">To get IRDAI<br/>certified</div>
                 </div>
              </div>
            </div>

            {/* Right Registration Card */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 animate-fade-in-up-delay-1">
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100">
                
                {/* 90% OFF Badge */}
                <div className="absolute -top-4 right-6 sm:right-8 bg-red-50 text-red-600 text-[10px] sm:text-xs font-extrabold px-4 py-1.5 rounded-full border border-red-100 shadow-sm uppercase animate-float">
                  90% OFF - Today only
                </div>
                
                <h3 className="text-2xl sm:text-[28px] font-extrabold text-[#0f2a52] mb-1">Reserve your seat</h3>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-slate-400 line-through text-lg sm:text-xl font-bold">&#8377;999</span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#0f2a52] tracking-tight">&#8377;99</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                  Fill in your details - our team will send the meeting link to your email/WhatsApp.
                </p>
                
                <form onSubmit={handleRegister} className="space-y-3.5">
                  {statusMsg && (
                    <div className={`p-3 rounded-xl border text-sm font-bold text-center ${statusMsg.includes('Error') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                      {statusMsg}
                    </div>
                  )}
                  <div>
                    <input 
                      id="registration-name-input" 
                      type="text" 
                      placeholder="Enter your full name" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all text-sm font-medium" 
                    />
                  </div>
                  <div>
                    <input 
                      type="email" 
                      placeholder="you@example.com" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all text-sm font-medium" 
                    />
                  </div>
                  <div>
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all text-sm font-medium" 
                    />
                  </div>
                  <div>
                    <select 
                      required
                      value={formData.occupation}
                      onChange={e => setFormData({...formData, occupation: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-600 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1rem_center]"
                    >
                      <option value="" disabled>Select your current occupation</option>
                      <option value="employed">Salaried Employee</option>
                      <option value="business">Business Owner</option>
                      <option value="student">Student</option>
                      <option value="homemaker">Homemaker</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center gap-2 mt-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0f2a52] font-extrabold text-[16px] py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.23)] hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Register for \u20b999 \u2192'}
                  </button>
                </form>
                
                <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-slate-500 font-medium">
                  <ShieldCheck size={14} className="text-green-600" /> Your information is 100% secure.
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#0f2a52] font-bold">
                     <Video size={14} className="text-blue-600" /> Live Session
                  </div>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#0f2a52] font-bold">
                     <CheckCircle2 size={14} className="text-blue-600" /> Instant Confirmation
                  </div>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#0f2a52] font-bold">
                     <Users size={14} className="text-blue-600" /> Limited Seats
                  </div>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#0f2a52] font-bold">
                     <ShieldCheck size={14} className="text-blue-600" /> Trusted by 10,000+ Agents
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY THIS WEBINAR */}
      <section className="bg-slate-50 py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="text-center mb-16 relative">
             <span className="inline-block bg-teal-50 text-teal-700 font-extrabold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full border border-teal-100 mb-4">
               Why This Webinar
             </span>
             <h2 className="text-3xl md:text-[42px] font-extrabold text-[#0f2a52] leading-[1.2] tracking-tight">
               Everything you need to <span className="text-[#f59e0b]">start <br className="hidden md:block" /> earning</span> as an insurance agent
             </h2>
             <p className="mt-4 text-slate-600 font-medium text-sm md:text-base max-w-2xl mx-auto">
               A focused 90-minute session designed for anyone looking for a flexible, commission-based income opportunity with a trusted brand.
             </p>
           </div>

           <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-5">
                  <BookOpen size={24} />
                </div>
                <h4 className="text-[19px] font-extrabold text-[#0f2a52] mb-3">IRDAI Licensing, Simplified</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">Understand the exact steps, documents, and exam process to become a licensed Star Health agent - explained in plain language.</p>
             </div>
             
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                  <IndianRupee size={24} />
                </div>
                <h4 className="text-[19px] font-extrabold text-[#0f2a52] mb-3">Real Earning Breakdown</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">See how agent commissions, renewals, and incentives actually add up - with real examples from working agents.</p>
             </div>
             
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                  <Clock size={24} />
                </div>
                <h4 className="text-[19px] font-extrabold text-[#0f2a52] mb-3">Work On Your Own Time</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">Learn how to build a part-time or full-time agent business around your existing schedule - no office required.</p>
             </div>
           </div>
        </div>
      </section>

      {/* 3. WEBINAR AGENDA */}
      <section className="bg-[#0f2a52] py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="inline-block bg-[#fbbf24] text-[#0f2a52] font-extrabold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full mb-4">
                Webinar Agenda
              </span>
              <h2 className="text-3xl md:text-[42px] font-extrabold leading-tight tracking-tight" style={{ color: '#ffffff' }}>
                What we'll cover in 90 minutes
              </h2>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-full border border-white/10">
               <Video color="#fbbf24" size={20} />
               <span className="font-bold text-sm" style={{ color: '#ffffff' }}>Live Q&A with senior agents</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 relative z-10">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-white/20 -z-10"></div>
            
            {/* Steps */}
            {[
              { num: 1, title: "Introduction to Star Health & Policy Bhandar", desc: "Who we are, why insurance is a growing career opportunity in India." },
              { num: 2, title: "The IRDAI Agent Certification Process", desc: "Eligibility, documents, exam pattern, and timelines to get licensed." },
              { num: 3, title: "How Agent Commissions Work", desc: "A transparent look at first-year commission, renewal income, and bonuses." },
              { num: 4, title: "Tools & Support You'll Get", desc: "Lead support, training material, and mentor access post-certification." },
              { num: 5, title: "Live Q&A with Our Senior Agents", desc: "Ask anything about the role, income, and getting started." }
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-8 h-8 rounded-full bg-[#fbbf24] text-[#0f2a52] font-bold flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                  {step.num}
                </div>
                <h4 className="font-bold text-sm mb-2" style={{ color: '#ffffff' }}>{step.title}</h4>
                <p className="text-xs font-medium leading-relaxed px-2" style={{ color: '#bfdbfe' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EARNING POTENTIAL */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-teal-50 text-teal-700 font-extrabold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full border border-teal-100 mb-4">
               Earning Potential
            </span>
            <h2 className="text-3xl md:text-[36px] font-extrabold text-[#0f2a52] leading-tight tracking-tight mb-4">
              A career that grows with every policy you sell
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base max-w-3xl mx-auto">
              Health agents earn through a mix of first-year commission and long-term renewal income.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="space-y-5">
               {[
                 "Earn commission on every health policy you sell - no cap on income",
                 "Continue earning renewal income year after year from existing customers",
                 "Unlock performance bonuses and incentives as you grow your client base",
                 "Work part-time or full-time - the income scales with your effort",
                 "Get ongoing training, marketing support, and a dedicated mentor"
               ].map((text, i) => (
                 <div key={i} className="flex gap-3 items-start">
                   <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center">
                     <Check color="#ffffff" size={12} strokeWidth={3} />
                   </div>
                   <p className="text-slate-700 font-medium text-sm leading-relaxed">{text}</p>
                 </div>
               ))}
             </div>
             
             <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
               <h4 className="font-extrabold text-[#0f2a52] text-lg mb-6">Illustrative monthly income*</h4>
               <div className="space-y-6">
                 <div className="flex items-center justify-between gap-4">
                   <div className="w-1/3 text-xs font-bold text-slate-600">Part-time (5-10 policies/mo)</div>
                   <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                     <div className="bg-[#fbbf24] h-full w-[30%] rounded-full"></div>
                   </div>
                   <div className="w-20 text-right font-extrabold text-[#0f2a52]">&#8377;8K-15K</div>
                 </div>
                 <div className="flex items-center justify-between gap-4">
                   <div className="w-1/3 text-xs font-bold text-slate-600">Full-time (20-30 policies/mo)</div>
                   <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                     <div className="bg-[#fbbf24] h-full w-[60%] rounded-full"></div>
                   </div>
                   <div className="w-20 text-right font-extrabold text-[#0f2a52]">&#8377;25K-40K</div>
                 </div>
                 <div className="flex items-center justify-between gap-4">
                   <div className="w-1/3 text-xs font-bold text-slate-600">Top performing agents</div>
                   <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                     <div className="bg-[#fbbf24] h-full w-[90%] rounded-full"></div>
                   </div>
                   <div className="w-20 text-right font-extrabold text-[#0f2a52]">&#8377;60K+</div>
                 </div>
               </div>
               <p className="text-[9px] text-slate-400 mt-6 leading-tight">
                 *Indicative figures shared for illustration during the webinar; actual earnings vary based on effort, policy type, and location.
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-teal-50 text-teal-700 font-extrabold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full border border-teal-100 mb-4">
               FAQs
            </span>
            <h2 className="text-3xl md:text-[36px] font-extrabold text-[#0f2a52] leading-tight tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="font-bold text-[#0f2a52] text-[15px] sm:text-base pr-4">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 text-slate-400">
                    {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-slate-600 font-medium text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="bg-[#0f2a52] py-14 m-4 md:m-8 rounded-3xl relative overflow-hidden">
         <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
               <h2 className="text-3xl md:text-[34px] font-extrabold mb-2" style={{ color: '#ffffff' }}>Seats are limited for this live batch</h2>
               <p className="font-medium text-sm md:text-base" style={{ color: '#bfdbfe' }}>Register now for just &#8377;99 and get instant meeting access details <br className="hidden md:block"/> on email & WhatsApp.</p>
            </div>
            <button onClick={scrollToForm} className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0f2a52] px-8 py-4 rounded-xl font-extrabold text-lg transition-all shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] w-full md:w-auto">
               Register for &#8377;99 &rarr;
            </button>
         </div>
      </section>

    </div>
  );
}
