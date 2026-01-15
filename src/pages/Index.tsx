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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturedAds />
        <FinancingOffersCarousel />
        <FeaturedProperties />
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
