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
import DeveloperProjectsSection from "@/components/DeveloperProjectsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Gavel } from "lucide-react";
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
        
        <DeveloperProjectsSection />

        {/* Real Estate Auction - Coming Soon */}
        <section className="container mx-auto px-4 py-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-dashed border-amber-500/30 p-10 text-center">
            <div className="absolute top-4 left-4">
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 text-sm">
                قريباً
              </Badge>
            </div>
            <Gavel className="h-16 w-16 mx-auto text-amber-500/60 mb-4" />
            <h2 className="text-3xl font-bold mb-3">المزاد العقاري</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              سيتم إضافة خدمة المزاد العقاري قريباً لتمكينك من المشاركة في مزادات عقارية شفافة وآمنة
            </p>
            <p className="text-amber-600 dark:text-amber-400 font-semibold mt-4">🚧 سيُضاف قريباً 🚧</p>
          </div>
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
