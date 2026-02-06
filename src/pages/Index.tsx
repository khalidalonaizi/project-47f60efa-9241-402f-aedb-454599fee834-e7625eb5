import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import FeaturedAds from "@/components/FeaturedAds";
import CityGrid from "@/components/CityGrid";
import StatsSection from "@/components/StatsSection";
import ServicesSection from "@/components/ServicesSection";
import HomeMapSection from "@/components/HomeMapSection";
import Footer from "@/components/Footer";
import FinancingOffersCarousel from "@/components/FinancingOffersCarousel";
import AdvancedAdvertisement from "@/components/AdvancedAdvertisement";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        
        {/* Top Slider Ad */}
        <section className="container mx-auto px-4 py-6">
          <AdvancedAdvertisement 
            location="homepage" 
            variant="slider" 
            autoSlide={true}
            slideInterval={5000}
          />
        </section>
        
        <FeaturedAds />
        <FinancingOffersCarousel />
        <FeaturedProperties />
        
        {/* Property Management Service CTA */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <h3 className="text-2xl font-bold mb-2">هل تبحث عن من يدير عقارك؟</h3>
              <p className="text-muted-foreground">تواصل مع أفضل المكاتب العقارية لإدارة ممتلكاتك باحترافية</p>
            </div>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => navigate('/property-management-request')}
            >
              <Building2 className="h-5 w-5" />
              طلب إدارة أملاك
            </Button>
          </div>
        </section>
        
        {/* Inline Ad */}
        <section className="container mx-auto px-4 py-6">
          <AdvancedAdvertisement 
            location="homepage" 
            variant="between-sections"
          />
        </section>
        
        <HomeMapSection />
        <CityGrid />
        <StatsSection />
        <ServicesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
