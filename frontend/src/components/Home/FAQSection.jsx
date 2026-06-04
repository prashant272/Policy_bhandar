import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

const FAQS = [
  {
    question: "What exactly is Policy Bhandar?",
    answer: "Policy Bhandar is a comprehensive platform designed specifically for insurance advisors and agents. We provide instant personalized marketing materials, premium training programs (like MDRT mentorship), and digital tools to help you grow your insurance business."
  },
  {
    question: "How do I get my personalized marketing materials?",
    answer: "It's simple! Once you register and update your profile with your photo and contact details, our system automatically watermarks all our premium posters, brochures, and reels with your branding. You can download and share them instantly on WhatsApp or social media."
  },
  {
    question: "Are the training programs only for beginners?",
    answer: "Not at all. While we have foundational courses for new agents, our core specialty is advanced training—including prospecting strategies, recruitment, and our highly acclaimed MDRT Mentorship program led by industry experts like Yogendra Verma."
  },
  {
    question: "Are the insurance plan brochures updated regularly?",
    answer: "Yes. Our team constantly monitors changes from major insurance providers. Whenever a new plan is launched or an existing plan is updated, we immediately upload the latest, beautifully designed brochures to the portal."
  },
  {
    question: "How does the subscription model work?",
    answer: "We offer different tiers based on your needs. A basic free account gives you access to general resources. Upgrading to a premium subscription unlocks our full library of high-converting digital assets, exclusive training sessions, and advanced tools."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0); // First one open by default

  return (
    <section className="bg-white border border-slate-100/90 rounded-[3rem] p-6 sm:p-8 lg:p-12 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.03)] relative overflow-hidden">
      
      {/* Ambient glow */}
      <div className="absolute -top-32 -right-32 w-[350px] h-[350px] bg-gradient-to-tr from-orange-500/10 to-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 relative z-10">
        
        {/* Left: Heading */}
        <div className="lg:w-1/3 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/5 text-orange-600 border border-orange-500/10 text-xs font-bold tracking-wider uppercase">
            <HelpCircle size={12} className="text-orange-500" />
            Support & FAQs
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-premium rounded-full" />
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Everything you need to know about Policy Bhandar, our premium materials, and advisor training programs.
          </p>
          
          <div className="pt-6 hidden lg:block">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
              <Sparkles className="text-orange-500 mx-auto mb-3" size={28} />
              <h4 className="text-slate-900 font-bold mb-2">Still have questions?</h4>
              <p className="text-xs text-slate-500 mb-4">Our support team is ready to help you grow your business.</p>
              <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all w-full cursor-pointer">
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Right: Accordion */}
        <div className="lg:w-2/3 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'border-orange-500/30 bg-orange-50/30 shadow-sm shadow-orange-500/5' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between cursor-pointer focus:outline-none"
                >
                  <span className={`font-extrabold text-sm sm:text-base pr-4 transition-colors ${isOpen ? 'text-orange-600' : 'text-slate-700'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isOpen ? 'bg-orange-500 text-white rotate-180' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <ChevronDown size={16} />
                  </div>
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-500 text-sm leading-relaxed px-6 font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
