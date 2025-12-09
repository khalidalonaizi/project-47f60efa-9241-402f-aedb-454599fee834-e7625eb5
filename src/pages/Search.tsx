import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Filter, Grid3X3, List, MapPin, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

const SearchPage = () => {
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [areaRange, setAreaRange] = useState([0, 1000]);
  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const cities = [
    "الرياض",
    "جدة",
    "مكة المكرمة",
    "المدينة المنورة",
    "الدمام",
    "الخبر",
    "الظهران",
    "الطائف",
    "تبوك",
    "أبها",
  ];

  const propertyTypes = [
    "شقة",
    "فيلا",
    "دوبلكس",
    "تاون هاوس",
    "أرض",
    "مكتب",
    "محل تجاري",
    "مستودع",
  ];

  const amenities = [
    { id: "parking", label: "موقف سيارات" },
    { id: "pool", label: "مسبح" },
    { id: "gym", label: "صالة رياضية" },
    { id: "garden", label: "حديقة" },
    { id: "elevator", label: "مصعد" },
    { id: "security", label: "حراسة أمنية" },
    { id: "ac", label: "تكييف مركزي" },
    { id: "furnished", label: "مفروشة" },
  ];

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // بيانات وهمية للعقارات
  const properties = [
    {
      id: "1",
      title: "فيلا فاخرة مع مسبح خاص",
      price: 3500000,
      priceType: "sale" as const,
      location: "حي النرجس",
      city: "الرياض",
      bedrooms: 5,
      bathrooms: 4,
      area: 450,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      isNew: true,
      isFeatured: true,
    },
    {
      id: "2",
      title: "شقة حديثة بإطلالة بحرية",
      price: 850000,
      priceType: "sale" as const,
      location: "حي الشاطئ",
      city: "جدة",
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      isNew: true,
    },
    {
      id: "3",
      title: "دوبلكس عصري في موقع مميز",
      price: 15000,
      priceType: "rent" as const,
      location: "حي العليا",
      city: "الرياض",
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      isFeatured: true,
    },
    {
      id: "4",
      title: "شقة مفروشة للإيجار",
      price: 8000,
      priceType: "rent" as const,
      location: "حي الحمراء",
      city: "جدة",
      bedrooms: 2,
      bathrooms: 1,
      area: 120,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    },
    {
      id: "5",
      title: "فيلا مودرن بتصميم فريد",
      price: 4200000,
      priceType: "sale" as const,
      location: "حي الياسمين",
      city: "الرياض",
      bedrooms: 6,
      bathrooms: 5,
      area: 550,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      isNew: true,
    },
    {
      id: "6",
      title: "شقة استثمارية بعائد مميز",
      price: 650000,
      priceType: "sale" as const,
      location: "حي السلامة",
      city: "جدة",
      bedrooms: 2,
      bathrooms: 2,
      area: 95,
      image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
    },
    {
      id: "7",
      title: "تاون هاوس في مجمع سكني",
      price: 2100000,
      priceType: "sale" as const,
      location: "حي الملقا",
      city: "الرياض",
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      isFeatured: true,
    },
    {
      id: "8",
      title: "شقة فاخرة مع تراس واسع",
      price: 12000,
      priceType: "rent" as const,
      location: "حي الروضة",
      city: "الدمام",
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800",
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  const resetFilters = () => {
    setPriceRange([0, 5000000]);
    setAreaRange([0, 1000]);
    setBedrooms("");
    setBathrooms("");
    setCity("");
    setPropertyType("");
    setSearchQuery("");
    setSelectedAmenities([]);
  };

  const filteredProperties = properties.filter((property) => {
    if (listingType === "sale" && property.priceType !== "sale") return false;
    if (listingType === "rent" && property.priceType !== "rent") return false;
    if (city && property.city !== city) return false;
    if (bedrooms && property.bedrooms !== parseInt(bedrooms)) return false;
    if (bathrooms && property.bathrooms !== parseInt(bathrooms)) return false;
    if (property.area < areaRange[0] || property.area > areaRange[1]) return false;
    if (property.price < priceRange[0] || property.price > priceRange[1]) return false;
    if (searchQuery && !property.title.includes(searchQuery) && !property.location.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="bg-primary/5 border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">البحث المتقدم</h1>
          <p className="text-muted-foreground">
            ابحث عن العقار المثالي باستخدام الفلاتر المتقدمة
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:w-80 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-card rounded-2xl p-6 card-shadow sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  الفلاتر
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-muted-foreground hover:text-primary"
                >
                  <RotateCcw className="w-4 h-4 ml-1" />
                  إعادة تعيين
                </Button>
              </div>

              {/* Listing Type */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">نوع الإعلان</Label>
                <div className="flex gap-2">
                  <Button
                    variant={listingType === "sale" ? "hero" : "outline"}
                    className="flex-1"
                    onClick={() => setListingType("sale")}
                  >
                    للبيع
                  </Button>
                  <Button
                    variant={listingType === "rent" ? "hero" : "outline"}
                    className="flex-1"
                    onClick={() => setListingType("rent")}
                  >
                    للإيجار
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">البحث</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن عقار..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              {/* City */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">المدينة</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">نوع العقار</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">
                  نطاق السعر (ر.س)
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={listingType === "sale" ? 10000000 : 50000}
                  step={listingType === "sale" ? 100000 : 1000}
                  className="mb-3"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>

              {/* Area Range */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">
                  المساحة (م²)
                </Label>
                <Slider
                  value={areaRange}
                  onValueChange={setAreaRange}
                  min={0}
                  max={2000}
                  step={50}
                  className="mb-3"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{areaRange[0]} م²</span>
                  <span>{areaRange[1]} م²</span>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">عدد الغرف</Label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عدد الغرف" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} غرف
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">عدد الحمامات</Label>
                <Select value={bathrooms} onValueChange={setBathrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عدد الحمامات" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} حمام
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amenities */}
              <div>
                <Label className="text-sm font-medium mb-3 block">المميزات</Label>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <Checkbox
                        id={amenity.id}
                        checked={selectedAmenities.includes(amenity.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAmenities([...selectedAmenities, amenity.id]);
                          } else {
                            setSelectedAmenities(
                              selectedAmenities.filter((a) => a !== amenity.id)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={amenity.id}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {amenity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
                <p className="text-muted-foreground">
                  <span className="font-bold text-foreground">{filteredProperties.length}</span>{" "}
                  عقار متاح
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            {filteredProperties.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-muted-foreground mb-4">
                  حاول تعديل الفلاتر للحصول على نتائج أكثر
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
