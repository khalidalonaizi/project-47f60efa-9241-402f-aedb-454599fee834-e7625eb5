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
import AdvertisementBanner from "@/components/AdvertisementBanner";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        
        {/* Top Banner Ad */}
        <section className="container mx-auto px-4 py-6">
          <AdvertisementBanner location="homepage" variant="banner" />
        </section>
        
        <FeaturedAds />
        <FinancingOffersCarousel />
        <FeaturedProperties />
        
        {/* Inline Ad */}
        <section className="container mx-auto px-4 py-6">
          <AdvertisementBanner location="homepage" variant="inline" />
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
