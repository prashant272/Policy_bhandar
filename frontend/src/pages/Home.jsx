// Home Section Components
import Hero from '../components/Home/Hero';
import About from '../components/Home/About';
import MediaGallery from '../components/Home/MediaGallery';
import BlogSection from '../components/Home/BlogSection';
import TestimonialSection from '../components/Home/TestimonialSection';
import FAQSection from '../components/Home/FAQSection';

export default function Home() {
  return (
    <div className="pb-20 bg-white leading-tight">
      
      {/* 1. Hero Section (Edge-to-Edge full bleed) */}
      <Hero />
      
      {/* Centered layout wrapper */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-8 space-y-8">

        {/* About Section */}
        <About />

        {/* Media Gallery Section */}
        <MediaGallery />

        {/* Blog Section */}
        <BlogSection />

        {/* Testimonial Section */}
        <TestimonialSection />

        {/* FAQ Section */}
        <FAQSection />

      </div>
    </div>
  );
}
