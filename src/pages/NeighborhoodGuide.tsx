import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Building2, Users, ShoppingBag, GraduationCap, Heart, Car } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import NeighborhoodMap from "@/components/NeighborhoodMap";

const neighborhoods = [
  {
    id: 1,
    name: "حي النرجس",
    city: "الرياض",
    description: "حي راقٍ يتميز بتصميمه العصري والفلل الفاخرة، قريب من المرافق الحيوية",
    avgPrice: 3500000,
    avgRent: 25000,
    population: "45,000",
    schools: 12,
    hospitals: 3,
    malls: 2,
    rating: 4.8,
    features: ["هادئ", "عائلي", "راقي"],
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    lat: 24.8234,
    lng: 46.6388,
  },
  {
    id: 2,
    name: "حي العليا",
    city: "الرياض",
    description: "قلب الرياض التجاري، يضم أبراج المكاتب والفنادق الفاخرة والمطاعم العالمية",
    avgPrice: 4200000,
    avgRent: 35000,
    population: "32,000",
    schools: 8,
    hospitals: 5,
    malls: 4,
    rating: 4.6,
    features: ["تجاري", "حيوي", "مركزي"],
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
    lat: 24.6905,
    lng: 46.6855,
  },
  {
    id: 3,
    name: "حي الشاطئ",
    city: "جدة",
    description: "حي ساحلي فاخر يطل على البحر الأحمر، يتميز بالكورنيش والمطاعم البحرية",
    avgPrice: 5500000,
    avgRent: 45000,
    population: "28,000",
    schools: 6,
    hospitals: 2,
    malls: 3,
    rating: 4.9,
    features: ["ساحلي", "فاخر", "سياحي"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    lat: 21.5574,
    lng: 39.1132,
  },
  {
    id: 4,
    name: "حي الحمراء",
    city: "جدة",
    description: "حي تاريخي يجمع بين الأصالة والمعاصرة، قريب من المنطقة التاريخية",
    avgPrice: 2800000,
    avgRent: 18000,
    population: "55,000",
    schools: 15,
    hospitals: 4,
    malls: 2,
    rating: 4.4,
    features: ["تاريخي", "مركزي", "متنوع"],
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
    lat: 21.5441,
    lng: 39.1729,
  },
  {
    id: 5,
    name: "حي الروضة",
    city: "الدمام",
    description: "حي سكني هادئ يناسب العائلات، يتميز بالمساحات الخضراء والحدائق",
    avgPrice: 1800000,
    avgRent: 12000,
    population: "38,000",
    schools: 10,
    hospitals: 2,
    malls: 1,
    rating: 4.5,
    features: ["عائلي", "هادئ", "أخضر"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    lat: 26.4250,
    lng: 50.0920,
  },
  {
    id: 6,
    name: "حي الياسمين",
    city: "الرياض",
    description: "حي حديث يضم فلل ومجمعات سكنية راقية مع جميع الخدمات",
    avgPrice: 4000000,
    avgRent: 30000,
    population: "42,000",
    schools: 14,
    hospitals: 3,
    malls: 3,
    rating: 4.7,
    features: ["حديث", "راقي", "متكامل"],
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    lat: 24.8133,
    lng: 46.6103,
  },
];

const NeighborhoodGuide = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<number | null>(null);

  const cities = [...new Set(neighborhoods.map((n) => n.city))];

  const filteredNeighborhoods = neighborhoods.filter((n) => {
    if (selectedCity && n.city !== selectedCity) return false;
    if (searchQuery && !n.name.includes(searchQuery) && !n.city.includes(searchQuery)) return false;
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  const mapNeighborhoods = filteredNeighborhoods.map(n => ({
    id: n.id,
    name: n.name,
    city: n.city,
    lat: n.lat,
    lng: n.lng,
    avgPrice: n.avgPrice,
    rating: n.rating,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="bg-primary/5 border-b border-border">
        <div className="container py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">دليل الأحياء</h1>
          <p className="text-muted-foreground text-lg mb-8">
            اكتشف أفضل الأحياء للسكن والاستثمار في المملكة العربية السعودية
          </p>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن حي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCity === "" ? "default" : "outline"}
                onClick={() => setSelectedCity("")}
              >
                الكل
              </Button>
              {cities.map((city) => (
                <Button
                  key={city}
                  variant={selectedCity === city ? "default" : "outline"}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container py-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          الأحياء على الخريطة
        </h2>
        <NeighborhoodMap 
          neighborhoods={mapNeighborhoods}
          selectedNeighborhood={selectedNeighborhood}
          onNeighborhoodSelect={setSelectedNeighborhood}
        />
      </div>

      {/* Neighborhoods Grid */}
      <div className="container py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNeighborhoods.map((neighborhood) => (
            <Card key={neighborhood.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={neighborhood.image}
                  alt={neighborhood.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground">
                    {neighborhood.city}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3 bg-background/90 px-2 py-1 rounded-md flex items-center gap-1">
                  <span className="text-gold">★</span>
                  <span className="text-sm font-medium">{neighborhood.rating}</span>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {neighborhood.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{neighborhood.description}</p>

                <div className="flex flex-wrap gap-2">
                  {neighborhood.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>متوسط البيع: {formatPrice(neighborhood.avgPrice)} ر.س</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span>الإيجار: {formatPrice(neighborhood.avgRent)} ر.س</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>السكان: {neighborhood.population}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span>{neighborhood.schools} مدرسة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span>{neighborhood.hospitals} مستشفى</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    <span>{neighborhood.malls} مول</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/search?city=${neighborhood.city}`}>
                    عرض العقارات في {neighborhood.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNeighborhoods.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">جرب البحث بكلمات مختلفة</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NeighborhoodGuide;
