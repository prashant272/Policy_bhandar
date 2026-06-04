import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import { X, ZoomIn, Images, ChevronLeft, ChevronRight } from 'lucide-react';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

// ─── Gallery data ────────────────────────────────────────────────────────────
const galleryItems = [
  { id: 1,  src: '/gallery_01.jpg', alt: 'Policy Bhandar Team Event',           tag: 'Events',   span: 'row-span-2' },
  { id: 2,  src: '/gallery_02.jpg', alt: 'Advisor Training Session',            tag: 'Training', span: '' },
  { id: 3,  src: '/gallery_03.jpg', alt: 'Insurance Workshop',                  tag: 'Training', span: '' },
  { id: 4,  src: '/gallery_04.jpg', alt: 'Policy Bhandar Community Meet',       tag: 'Events',   span: 'col-span-2' },
  { id: 5,  src: '/gallery_05.jpg', alt: 'Advisor Network Gathering',           tag: 'Events',   span: '' },
  { id: 6,  src: '/gallery_06.jpg', alt: 'Training Program 2022',               tag: 'Training', span: '' },
  { id: 7,  src: '/gallery_07.jpg', alt: 'Agent Recognition Ceremony',          tag: 'Events',   span: 'row-span-2' },
  { id: 8,  src: '/gallery_08.jpg', alt: 'Annual Advisor Meet 2025',            tag: 'Events',   span: 'col-span-2' },
  { id: 9,  src: '/gallery_09.jpg', alt: 'Policy Bhandar Office',               tag: 'Team',     span: '' },
  { id: 10, src: '/gallery_10.jpg', alt: 'Advisor Achievement Award',           tag: 'Events',   span: '' },
  { id: 11, src: '/gallery_11.jpg', alt: 'Team Meeting',                        tag: 'Team',     span: '' },
  { id: 12, src: '/gallery_12.jpg', alt: 'Insurance Conference – Stage View',   tag: 'Events',   span: 'col-span-2' },
  { id: 13, src: '/gallery_13.jpg', alt: 'Conference – Audience',               tag: 'Events',   span: '' },
  { id: 14, src: '/gallery_14.jpg', alt: 'Award Ceremony Highlights',           tag: 'Events',   span: 'row-span-2' },
  { id: 15, src: '/gallery_15.jpg', alt: 'Networking Session',                  tag: 'Events',   span: '' },
  { id: 16, src: '/gallery_16.jpg', alt: 'Conference – Group Photo',            tag: 'Team',     span: '' },
];

export default function MediaGallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  const nextImage = () =>
    setLightboxIndex((prev) => (prev + 1) % galleryItems.length);

  return (
    <section className="bg-white border border-slate-100/90 rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(15,23,42,0.03)] relative">

      {/* Ambient glow orbs */}
      <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-gradient-to-tr from-orange-500/5 to-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/5 to-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 px-6 sm:px-8 lg:px-10 pt-8 pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/5 text-orange-600 border border-orange-500/10 text-xs font-bold tracking-wider uppercase">
            <Images size={12} className="text-orange-500 animate-pulse" />
            Media Gallery
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Our <span className="text-gradient">Moments</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-premium rounded-full" />
        </div>
        <p className="text-xs text-slate-400 font-medium max-w-xs">
          Glimpses of training sessions, events & advisor journeys at Policy Bhandar.
        </p>
      </div>

      {/* ── Swiper Gallery ── */}
      <div className="relative z-10 py-4 px-2">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          speed={800}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 120,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={{
            nextEl: '.gallery-next',
            prevEl: '.gallery-prev',
          }}
          breakpoints={{
            640:  { slidesPerView: 1.4 },
            768:  { slidesPerView: 2 },
            1024: { slidesPerView: 2.5 },
            1280: { slidesPerView: 3 },
          }}
          className="gallery-swiper w-full pb-12"
        >
          {galleryItems.map((item, index) => (
            <SwiperSlide key={item.id} className="py-6 px-2">
              <div
                onClick={() => openLightbox(index)}
                className="group relative w-full aspect-[4/3] rounded-[1.8rem] overflow-hidden cursor-pointer border border-slate-100 shadow-xl
                  transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(249,115,22,0.15)]"
              >
                {/* Image */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Top corner brackets */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-orange-400/60 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-orange-400/60 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-orange-400/60 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-orange-400/60 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/20 px-2.5 py-0.5 rounded-full border border-orange-500/20 mb-1.5 inline-block">
                        {item.tag}
                      </span>
                      <p className="text-white text-sm font-bold leading-tight line-clamp-2">
                        {item.alt}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shrink-0 ml-3 group-hover:scale-110 transition-transform duration-300">
                      <ZoomIn size={16} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Shine sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Nav Buttons */}
        <button className="gallery-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-orange-500 hover:border-orange-300 hover:shadow-orange-100 transition-all duration-300 cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <button className="gallery-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-orange-500 hover:border-orange-300 hover:shadow-orange-100 transition-all duration-300 cursor-pointer">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all duration-200 cursor-pointer z-10"
          >
            <X size={18} />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-orange-500/40 border border-white/20 hover:border-orange-400/40 flex items-center justify-center text-white transition-all duration-300 cursor-pointer z-10"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image */}
          <div
            className="relative max-w-4xl w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-orange-400/60 rounded-tl-xl z-10" />
            <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-orange-400/60 rounded-tr-xl z-10" />
            <div className="absolute bottom-14 left-4 w-5 h-5 border-b-2 border-l-2 border-orange-400/60 rounded-bl-xl z-10" />
            <div className="absolute bottom-14 right-4 w-5 h-5 border-b-2 border-r-2 border-orange-400/60 rounded-br-xl z-10" />

            <img
              src={galleryItems[lightboxIndex].src}
              alt={galleryItems[lightboxIndex].alt}
              className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 to-transparent rounded-b-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/20 px-2.5 py-0.5 rounded-full border border-orange-500/20 mb-1 inline-block">
                    {galleryItems[lightboxIndex].tag}
                  </span>
                  <p className="text-white font-semibold text-sm">{galleryItems[lightboxIndex].alt}</p>
                </div>
                <p className="text-slate-400 text-xs font-bold">
                  {lightboxIndex + 1} / {galleryItems.length}
                </p>
              </div>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-orange-500/40 border border-white/20 hover:border-orange-400/40 flex items-center justify-center text-white transition-all duration-300 cursor-pointer z-10"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </section>
  );
}
