import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star, MessageSquare, Quote, X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../../services/api';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/pagination';

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', designation: '', message: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await API.get('/testimonials');
      if (res.data.success) {
        setTestimonials(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/testimonials', formData);
      if (res.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setFormData({ name: '', designation: '', message: '', rating: 5 });
        }, 3000);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit testimonial. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star key={index} size={14} className={index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
    ));
  };

  return (
    <section className="bg-white border border-slate-100/90 rounded-[3rem] p-6 sm:p-8 lg:p-12 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.03)] relative overflow-hidden">
      
      {/* Ambient glow orbs */}
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/10 to-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-gradient-to-tl from-orange-500/10 to-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/5 text-orange-600 border border-orange-500/10 text-xs font-bold tracking-wider uppercase">
            <MessageSquare size={12} className="text-orange-500 animate-pulse" />
            Client Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Trusted by <span className="text-gradient">Advisors</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-premium rounded-full" />
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all duration-300 shadow-lg cursor-pointer shrink-0 hover:shadow-xl hover:-translate-y-0.5"
        >
          Submit Feedback
        </button>
      </div>

      {/* ── Testimonials Carousel ── */}
      <div className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-slate-100 overflow-hidden animate-pulse">
                <div className="p-8 space-y-4">
                  <div className="h-4 w-20 bg-slate-100 rounded-full" />
                  <div className="h-3 bg-slate-100 rounded-full" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded-full" />
                  <div className="h-3 w-4/6 bg-slate-100 rounded-full" />
                  <div className="mt-8 flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-24 bg-slate-100 rounded-full" />
                      <div className="h-2 w-16 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-slate-50/50 rounded-[2rem] border border-slate-100/80">
            <Quote size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-sm">No testimonials yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="testimonial-swiper-wrapper pb-10">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              loop={testimonials.length > 3}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="w-full !pb-14"
            >
              {testimonials.map((t) => (
                <SwiperSlide key={t._id} className="!h-auto flex">
                  <div className="w-full h-full bg-white border border-slate-100/80 rounded-[2rem] p-8 flex flex-col shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.1)] transition-all duration-500 relative group overflow-hidden">
                    
                    {/* Background Quote Mark */}
                    <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] group-hover:-translate-x-2 group-hover:translate-y-2 transition-all duration-500 pointer-events-none">
                      <Quote size={140} className="text-slate-900" />
                    </div>
                    
                    {/* Top gradient border on hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-premium scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    
                    <div className="flex-1 flex flex-col z-10 relative">
                      <div className="flex items-center gap-1 mb-6">
                        {renderStars(t.rating)}
                      </div>
                      
                      <p className="text-slate-600 text-sm leading-relaxed font-medium flex-1">
                        "{t.message}"
                      </p>
                      
                      <div className="mt-8 pt-6 border-t border-slate-100/60 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
                          <span className="text-orange-600 font-extrabold text-lg">
                            {t.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
                            {t.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {t.designation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* ── Submit Testimonial Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {submitSuccess ? (
              <div className="p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Thank You!</h3>
                <p className="text-slate-500 font-medium">
                  Your feedback has been submitted successfully and is pending approval from our team.
                </p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h3 className="text-lg font-extrabold text-slate-900">Share Your Experience</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#f8fafc]">
                  <div className="space-y-4">
                    
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Your Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all text-sm font-medium"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Designation / Agency <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all text-sm font-medium"
                        placeholder="e.g. Senior LIC Agent, Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Rating <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-xl w-fit">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({...formData, rating: star})}
                            className="focus:outline-none cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star size={20} className={star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Your Message <span className="text-red-500">*</span></label>
                      <textarea 
                        required
                        rows="4"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all text-sm font-medium resize-none"
                        placeholder="How did Policy Bhandar help you?"
                      ></textarea>
                    </div>

                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-gradient-premium hover:opacity-90 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Submit Testimonial'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Swiper Pagination CSS Override to match theme */}
      <style>{`
        .testimonial-swiper-wrapper .swiper-pagination-bullet {
          background-color: #cbd5e1;
          opacity: 1;
        }
        .testimonial-swiper-wrapper .swiper-pagination-bullet-active {
          background-image: linear-gradient(to right, #f97316, #fbbf24);
          background-color: transparent;
        }
      `}</style>
    </section>
  );
}
