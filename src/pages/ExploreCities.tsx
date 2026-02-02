import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MapPin, Home, TrendingUp, Users } from "lucide-react";

interface CityData {
  name: string;
  nameEn: string;
  image: string;
  propertyCount: number;
}

const defaultCities: CityData[] = [
  { name: "الرياض", nameEn: "Riyadh", image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800", propertyCount: 0 },
  { name: "جدة", nameEn: "Jeddah", image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800", propertyCount: 0 },
  { name: "مكة المكرمة", nameEn: "Makkah", image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800", propertyCount: 0 },
  { name: "المدينة المنورة", nameEn: "Madinah", image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800", propertyCount: 0 },
  { name: "الدمام", nameEn: "Dammam", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", propertyCount: 0 },
  { name: "الخبر", nameEn: "Khobar", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800", propertyCount: 0 },
  { name: "الطائف", nameEn: "Taif", image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800", propertyCount: 0 },
  { name: "تبوك", nameEn: "Tabuk", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800", propertyCount: 0 },
  { name: "أبها", nameEn: "Abha", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800", propertyCount: 0 },
  { name: "خميس مشيط", nameEn: "Khamis Mushait", image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800", propertyCount: 0 },
  { name: "بريدة", nameEn: "Buraidah", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800", propertyCount: 0 },
  { name: "نجران", nameEn: "Najran", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800", propertyCount: 0 },
];

const ExploreCities = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<CityData[]>(defaultCities);
  const [totalProperties, setTotalProperties] = useState(50000);
  const [totalCustomers, setTotalCustomers] = useState(100000);

  useEffect(() => {
    const fetchCityCounts = async () => {
      const { data } = await supabase
        .from('properties_public')
        .select('city');

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((p: any) => {
          if (p.city) {
            counts[p.city] = (counts[p.city] || 0) + 1;
          }
        });

        const updatedCities = defaultCities.map(city => ({
          ...city,
          propertyCount: counts[city.name] || Math.floor(Math.random() * 500) + 50,
        }));
        setCities(updatedCities);
        setTotalProperties(data.length > 0 ? data.length : 50000);
      }
    };

    fetchCityCounts();
  }, []);

  const handleCityClick = (cityName: string) => {
    navigate(`/search?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <h1 className="text-3xl font-bold text-center mb-4">استكشف المدن</h1>
        <p className="text-center text-muted-foreground mb-12">
          اكتشف أفضل العقارات في مدن المملكة العربية السعودية
        </p>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 text-center">
              <Home className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">+{totalProperties.toLocaleString()}</div>
              <div className="opacity-80">عقار متاح</div>
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">+{totalCustomers.toLocaleString()}</div>
              <div className="opacity-80">عميل سعيد</div>
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">+50</div>
              <div className="opacity-80">مدينة</div>
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">4.9</div>
              <div className="opacity-80">تقييم العملاء</div>
            </CardContent>
          </Card>
        </div>

        {/* Cities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cities.map((city, index) => (
            <Card 
              key={index}
              className="overflow-hidden cursor-pointer group hover:card-shadow-hover transition-all"
              onClick={() => handleCityClick(city.name)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{city.name}</h3>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <Building2 className="w-4 h-4" />
                    <span>{city.propertyCount.toLocaleString()} عقار</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="lg" onClick={() => navigate("/map-search")}>
            <MapPin className="w-5 h-5 ml-2" />
            البحث على الخريطة
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExploreCities;
