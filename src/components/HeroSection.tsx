import { Button } from "@/components/ui/button";
import { Building, Home, MapPin, Search, Store } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"buy" | "rent">("buy");
  const [propertyType, setPropertyType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const propertyTypes = [
    { id: "all", label: "الكل", icon: Building },
    { id: "apartment", label: "شقة", icon: Building },
    { id: "villa", label: "فيلا", icon: Home },
    { id: "commercial", label: "تجاري", icon: Store },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('openFilters', 'true');
    if (searchQuery) params.set('q', searchQuery);
    if (activeTab) params.set('type', activeTab);
    if (propertyType !== 'all') params.set('propertyType', propertyType);
    navigate(`/search?${params.toString()}`);
  };

  const handleCityClick = (city: string) => {
    navigate(`/search?openFilters=true&city=${encodeURIComponent(city)}`);
  };

  return (
    <section className="hero-gradient py-12 lg:py-20">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            ابحث عن عقارك المثالي في
            <span className="text-primary"> المملكة العربية السعودية</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            أكثر من 50,000 عقار للبيع والإيجار في جميع مناطق المملكة
          </p>

          {/* Search Card */}
          <div className="bg-card rounded-2xl card-shadow p-4 md:p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("buy")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  activeTab === "buy"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                للبيع
              </button>
              <button
                onClick={() => setActiveTab("rent")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  activeTab === "rent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                للإيجار
              </button>
            </div>

            {/* Property Types */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setPropertyType(type.id)}
                  className={`flex items-center gap-2 py-2 px-4 rounded-lg whitespace-nowrap transition-all ${
                    propertyType === type.id
                      ? "bg-accent text-accent-foreground border-2 border-primary"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث بالمدينة، الحي، أو اسم المشروع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full h-14 pr-12 pl-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="hero" size="xl" className="md:w-auto" onClick={handleSearch}>
                <Search className="w-5 h-5" />
                بحث
              </Button>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="text-sm text-muted-foreground">بحث سريع:</span>
              {["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة"].map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
