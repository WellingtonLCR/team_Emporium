
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { AboutSection } from '@/components/AboutSection';
import { MissionVisionValues } from '@/components/MissionVisionValues';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';
import { ContactSection } from '@/components/ContactSection';
import { SupportPoliciesSection } from '@/components/SupportPoliciesSection';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onSearch={setSearchQuery} />
        <Hero />
        <AboutSection />
        <MissionVisionValues />
        <div id="products">
          <ProductGrid searchQuery={searchQuery} />
        </div>
        <ContactSection />
        <SupportPoliciesSection />
        <Footer />
      </div>
    </CartProvider>
  );
};

export default Index;
