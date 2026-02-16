import { useState, useEffect } from "react";
import { saudiCityNamesAr, propertyTypesSelectAr } from '@/lib/propertyTypes';
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import MapSearch from "@/components/MapSearch";
import PropertyComparison from "@/components/PropertyComparison";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";
import { useGeolocation, calculateDistance, formatDistance } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import { 
  Filter, 
  Grid3X3, 
  List, 
  MapPin, 
  RotateCcw, 
  Search, 
  SlidersHorizontal, 
  Loader2, 
  Map, 
  ChevronDown, 
  ChevronUp,
  LocateFixed,
  Navigation,
  Save,
  Bookmark,
  Trash2,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Property {
  id: string;
  title: string;
  price: number;
  listing_type: string;
  neighborhood: string | null;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: string[] | null;
  is_featured: boolean | null;
  property_type: string;
  amenities: string[] | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [minPrice, setMinPrice] = useState(50);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [minArea, setMinArea] = useState(1);
  const [maxArea, setMaxArea] = useState(10000);
  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [sortByDistance, setSortByDistance] = useState(false);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [filterName, setFilterName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { selectedProperties, toggleProperty, removeProperty, clearAll, isSelected } = usePropertyComparison();
  const { latitude: userLat, longitude: userLng, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const { user } = useAuth();

  // Generate shareable URL with all filters
  const generateShareableUrl = () => {
    const params = new URLSearchParams();
    if (listingType) params.set('type', listingType);
    if (city) params.set('city', city);
    if (neighborhood) params.set('neighborhood', neighborhood);
    if (propertyType) params.set('propertyType', propertyType);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (minPrice !== 50) params.set('minPrice', minPrice.toString());
    if (maxPrice !== 10000000) params.set('maxPrice', maxPrice.toString());
    if (minArea !== 1) params.set('minArea', minArea.toString());
    if (maxArea !== 10000) params.set('maxArea', maxArea.toString());
    if (searchQuery) params.set('q', searchQuery);
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
    if (maxDistance) params.set('maxDistance', maxDistance.toString());
    if (sortByDistance) params.set('sortByDistance', 'true');
    
    return `${window.location.origin}/search?${params.toString()}`;
  };

  const shareSearchUrl = async () => {
    const url = generateShareableUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'بحث عقارات',
          text: 'شاهد نتائج البحث عن العقارات',
          url: url,
        });
      } catch (err) {
        // User cancelled or share failed, copy to clipboard instead
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("تم نسخ رابط البحث");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("فشل نسخ الرابط");
    }
  };

  // Load filters from URL on mount
  useEffect(() => {
    const openFilters = searchParams.get('openFilters');
    if (openFilters === 'true') {
      setFiltersOpen(true);
      setShowFilters(true);
    }
    
    // Load filters from URL
    const urlType = searchParams.get('type');
    const urlCity = searchParams.get('city');
    const urlNeighborhood = searchParams.get('neighborhood');
    const urlPropertyType = searchParams.get('propertyType');
    const urlBedrooms = searchParams.get('bedrooms');
    const urlBathrooms = searchParams.get('bathrooms');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');
    const urlMinArea = searchParams.get('minArea');
    const urlMaxArea = searchParams.get('maxArea');
    const urlQuery = searchParams.get('q');
    const urlAmenities = searchParams.get('amenities');
    const urlMaxDistance = searchParams.get('maxDistance');
    const urlSortByDistance = searchParams.get('sortByDistance');
    
    if (urlType === 'sale' || urlType === 'rent') setListingType(urlType);
    if (urlCity) setCity(urlCity);
    if (urlNeighborhood) setNeighborhood(urlNeighborhood);
    if (urlPropertyType) setPropertyType(urlPropertyType);
    if (urlBedrooms) setBedrooms(urlBedrooms);
    if (urlBathrooms) setBathrooms(urlBathrooms);
    if (urlMinPrice) setMinPrice(parseInt(urlMinPrice));
    if (urlMaxPrice) setMaxPrice(parseInt(urlMaxPrice));
    if (urlMinArea) setMinArea(parseInt(urlMinArea));
    if (urlMaxArea) setMaxArea(parseInt(urlMaxArea));
    if (urlQuery) setSearchQuery(urlQuery);
    if (urlAmenities) setSelectedAmenities(urlAmenities.split(','));
    if (urlMaxDistance) setMaxDistance(parseInt(urlMaxDistance));
    if (urlSortByDistance === 'true') setSortByDistance(true);
  }, [searchParams]);

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Load saved filters
  useEffect(() => {
    if (user) {
      loadSavedFilters();
    }
  }, [user]);

  const loadSavedFilters = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("saved_search_filters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setSavedFilters(data);
    }
  };

  const saveCurrentFilters = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لحفظ الفلاتر");
      return;
    }
    if (!filterName.trim()) {
      toast.error("يرجى إدخال اسم للفلتر");
      return;
    }

    const filters = {
      listingType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      city,
      neighborhood,
      propertyType,
      selectedAmenities,
      maxDistance,
      sortByDistance,
    };

    const { error } = await supabase.from("saved_search_filters").insert({
      user_id: user.id,
      name: filterName.trim(),
      filters,
    });

    if (error) {
      toast.error("حدث خطأ أثناء حفظ الفلتر");
    } else {
      toast.success("تم حفظ الفلتر بنجاح");
      setFilterName("");
      setSaveDialogOpen(false);
      loadSavedFilters();
    }
  };

  const applySavedFilter = (filter: any) => {
    const f = filter.filters;
    setListingType(f.listingType || "sale");
    setMinPrice(f.minPrice || 50);
    setMaxPrice(f.maxPrice || 10000000);
    setMinArea(f.minArea || 1);
    setMaxArea(f.maxArea || 10000);
    setBedrooms(f.bedrooms || "");
    setBathrooms(f.bathrooms || "");
    setCity(f.city || "");
    setNeighborhood(f.neighborhood || "");
    setPropertyType(f.propertyType || "");
    setSelectedAmenities(f.selectedAmenities || []);
    setMaxDistance(f.maxDistance || null);
    setSortByDistance(f.sortByDistance || false);
    setLoadDialogOpen(false);
    toast.success(`تم تطبيق الفلتر: ${filter.name}`);
  };

  const deleteSavedFilter = async (id: string) => {
    const { error } = await supabase.from("saved_search_filters").delete().eq("id", id);
    if (error) {
      toast.error("حدث خطأ أثناء حذف الفلتر");
    } else {
      toast.success("تم حذف الفلتر");
      loadSavedFilters();
    }
  };

  const cities = saudiCityNamesAr;

  const localPropertyTypes = propertyTypesSelectAr;

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

  const distanceOptions = [
    { value: "all", label: "الكل" },
    { value: "5", label: "5 كم" },
    { value: "10", label: "10 كم" },
    { value: "25", label: "25 كم" },
    { value: "50", label: "50 كم" },
    { value: "100", label: "100 كم" },
  ];

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    // Use properties_public view for public access
    const { data, error } = await supabase
      .from('properties_public')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties((data || []) as Property[]);
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  const resetFilters = () => {
    setMinPrice(50);
    setMaxPrice(10000000);
    setMinArea(1);
    setMaxArea(10000);
    setBedrooms("");
    setBathrooms("");
    setCity("");
    setNeighborhood("");
    setPropertyType("");
    setSearchQuery("");
    setSelectedAmenities([]);
    setMaxDistance(null);
    setSortByDistance(false);
  };

  // قيم محددة مسبقاً للاختيار السريع
  const pricePresets = [
    { label: "50 ألف", value: 50000 },
    { label: "100 ألف", value: 100000 },
    { label: "250 ألف", value: 250000 },
    { label: "500 ألف", value: 500000 },
    { label: "1 مليون", value: 1000000 },
    { label: "5 ملايين", value: 5000000 },
    { label: "10 ملايين", value: 10000000 },
  ];

  const areaPresets = [
    { label: "100 م²", value: 100 },
    { label: "200 م²", value: 200 },
    { label: "500 م²", value: 500 },
    { label: "1000 م²", value: 1000 },
    { label: "5000 م²", value: 5000 },
    { label: "10000 م²", value: 10000 },
  ];

  // Calculate distances and filter/sort properties
  const propertiesWithDistance = properties.map((property) => {
    let distance: number | undefined;
    if (userLat && userLng && property.latitude && property.longitude) {
      distance = calculateDistance(userLat, userLng, property.latitude, property.longitude);
    }
    return { ...property, distance };
  });

  const filteredProperties = propertiesWithDistance.filter((property) => {
    if (listingType === "sale" && property.listing_type !== "sale") return false;
    if (listingType === "rent" && property.listing_type !== "rent") return false;
    if (city && property.city !== city) return false;
    if (neighborhood && property.neighborhood && !property.neighborhood.includes(neighborhood)) return false;
    if (propertyType && property.property_type !== propertyType) return false;
    if (bedrooms && property.bedrooms !== parseInt(bedrooms)) return false;
    if (bathrooms && property.bathrooms !== parseInt(bathrooms)) return false;
    if (property.area && (property.area < minArea || property.area > maxArea)) return false;
    if (property.price < minPrice || property.price > maxPrice) return false;
    if (searchQuery && !property.title.includes(searchQuery) && !property.neighborhood?.includes(searchQuery)) return false;
    if (selectedAmenities.length > 0) {
      const propAmenities = property.amenities || [];
      if (!selectedAmenities.every(a => propAmenities.includes(a))) return false;
    }
    // Distance filter
    if (maxDistance && property.distance !== undefined && property.distance > maxDistance) return false;
    return true;
  });

  // Sort by distance if enabled
  const sortedProperties = sortByDistance && userLat && userLng
    ? [...filteredProperties].sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      })
    : filteredProperties;

  const scrollToProperties = () => {
    const element = document.getElementById('properties-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Ads First */}
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              اكتشف العقارات المتاحة
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              تصفح أحدث العقارات للبيع والإيجار في جميع أنحاء المملكة
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{properties.length}</p>
                <p className="text-sm text-muted-foreground">عقار متاح</p>
              </div>
              {userLat && userLng && (
                <div className="text-center">
                  <div className="flex items-center gap-1 text-success">
                    <LocateFixed className="w-4 h-4" />
                    <p className="text-sm">تم تحديد موقعك</p>
                  </div>
                </div>
              )}
            </div>

            {/* Search Button to Toggle Filters */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="hero" size="lg" className="gap-2">
                  <Search className="w-5 h-5" />
                  بحث متقدم
                  {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-6">
                <div className="bg-card rounded-2xl p-6 card-shadow max-w-4xl mx-auto animate-fade-in">
                  {/* Listing Type Toggle */}
                  <div className="flex gap-2 mb-6 justify-center">
                    <Button
                      variant={listingType === "sale" ? "hero" : "outline"}
                      className="min-w-24"
                      onClick={() => setListingType("sale")}
                    >
                      للبيع
                    </Button>
                    <Button
                      variant={listingType === "rent" ? "hero" : "outline"}
                      className="min-w-24"
                      onClick={() => setListingType("rent")}
                    >
                      للإيجار
                    </Button>
                  </div>

                  {/* Search Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="ابحث عن عقار..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    <Select value={city || "all"} onValueChange={(v) => setCity(v === "all" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={propertyType || "all"} onValueChange={(v) => setPropertyType(v === "all" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="نوع العقار" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {localPropertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Neighborhood */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Input
                      placeholder="الحي"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                    />
                    <Select value={bedrooms || "all"} onValueChange={(v) => setBedrooms(v === "all" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="عدد الغرف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>{num} غرف</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={bathrooms || "all"} onValueChange={(v) => setBathrooms(v === "all" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="عدد الحمامات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>{num} حمام</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Filters */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">
                      نطاق السعر (ر.س)
                    </Label>
                    {/* قيم محددة مسبقاً للسعر */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pricePresets.map((preset) => (
                        <Button
                          key={preset.value}
                          variant={maxPrice === preset.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMaxPrice(preset.value)}
                          className="text-xs"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">الحد الأدنى</Label>
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(Math.max(50, Math.min(10000000, Number(e.target.value) || 50)))}
                            min={50}
                            max={10000000}
                            className="h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">ر.س</span>
                        </div>
                        <Slider
                          value={[minPrice]}
                          onValueChange={(v) => setMinPrice(v[0])}
                          min={50}
                          max={10000000}
                          step={1000}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">الحد الأقصى</Label>
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Math.max(50, Math.min(10000000, Number(e.target.value) || 10000000)))}
                            min={50}
                            max={10000000}
                            className="h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">ر.س</span>
                        </div>
                        <Slider
                          value={[maxPrice]}
                          onValueChange={(v) => setMaxPrice(v[0])}
                          min={50}
                          max={10000000}
                          step={1000}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Area Filters */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">
                      نطاق المساحة (م²)
                    </Label>
                    {/* قيم محددة مسبقاً للمساحة */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {areaPresets.map((preset) => (
                        <Button
                          key={preset.value}
                          variant={maxArea === preset.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMaxArea(preset.value)}
                          className="text-xs"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">الحد الأدنى</Label>
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            type="number"
                            value={minArea}
                            onChange={(e) => setMinArea(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
                            min={1}
                            max={10000}
                            className="h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">م²</span>
                        </div>
                        <Slider
                          value={[minArea]}
                          onValueChange={(v) => setMinArea(v[0])}
                          min={1}
                          max={10000}
                          step={10}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">الحد الأقصى</Label>
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            type="number"
                            value={maxArea}
                            onChange={(e) => setMaxArea(Math.max(1, Math.min(10000, Number(e.target.value) || 10000)))}
                            min={1}
                            max={10000}
                            className="h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">م²</span>
                        </div>
                        <Slider
                          value={[maxArea]}
                          onValueChange={(v) => setMaxArea(v[0])}
                          min={1}
                          max={10000}
                          step={10}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save/Load Filters */}
                  {user && (
                    <div className="flex gap-2 mb-6 justify-center flex-wrap">
                      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Save className="w-4 h-4" />
                            حفظ الفلاتر
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>حفظ إعدادات الفلاتر</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label>اسم الفلتر</Label>
                              <Input
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="مثال: عقارات الرياض"
                                className="mt-2"
                              />
                            </div>
                            <Button onClick={saveCurrentFilters} className="w-full">
                              حفظ
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Bookmark className="w-4 h-4" />
                            الفلاتر المحفوظة ({savedFilters.length})
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>الفلاتر المحفوظة</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2 mt-4 max-h-80 overflow-y-auto">
                            {savedFilters.length === 0 ? (
                              <p className="text-center text-muted-foreground py-4">لا توجد فلاتر محفوظة</p>
                            ) : (
                              savedFilters.map((filter) => (
                                <div
                                  key={filter.id}
                                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <button
                                    onClick={() => applySavedFilter(filter)}
                                    className="flex-1 text-right"
                                  >
                                    <span className="font-medium">{filter.name}</span>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(filter.created_at).toLocaleDateString("ar-SA")}
                                    </p>
                                  </button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteSavedFilter(filter.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {/* Share URL Button */}
                  <div className="flex gap-2 mb-6 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={shareSearchUrl}
                    >
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
                      {copied ? "تم النسخ!" : "مشاركة رابط البحث"}
                    </Button>
                  </div>

                  {/* Distance Filter */}
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-primary" />
                        البحث حسب المسافة
                      </Label>
                      {!userLat && !geoLoading && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={requestLocation}
                          className="gap-2"
                        >
                          <LocateFixed className="w-4 h-4" />
                          تحديد موقعي
                        </Button>
                      )}
                      {geoLoading && (
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري تحديد الموقع...
                        </span>
                      )}
                    </div>
                    
                    {userLat && userLng && (
                      <div className="grid grid-cols-2 gap-4">
                        <Select 
                          value={maxDistance?.toString() || "all"} 
                          onValueChange={(v) => setMaxDistance(v === "all" ? null : parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="المسافة القصوى" />
                          </SelectTrigger>
                          <SelectContent>
                            {distanceOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="sortByDistance"
                            checked={sortByDistance}
                            onCheckedChange={(checked) => setSortByDistance(!!checked)}
                          />
                          <label htmlFor="sortByDistance" className="text-sm cursor-pointer">
                            ترتيب حسب الأقرب
                          </label>
                        </div>
                      </div>
                    )}
                    {geoError && (
                      <p className="text-sm text-destructive mt-2">{geoError}</p>
                    )}
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">المميزات</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {amenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-center gap-2">
                          <Checkbox
                            id={amenity.id}
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAmenities([...selectedAmenities, amenity.id]);
                              } else {
                                setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity.id));
                              }
                            }}
                          />
                          <label htmlFor={amenity.id} className="text-sm cursor-pointer">
                            {amenity.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground">
                      <RotateCcw className="w-4 h-4 ml-1" />
                      إعادة تعيين
                    </Button>
                    <Button variant="hero" onClick={scrollToProperties}>
                      <Search className="w-4 h-4 ml-2" />
                      عرض {sortedProperties.length} نتيجة
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Show All Button */}
            <div className="mt-6">
              <Button 
                variant="outline" 
                onClick={scrollToProperties}
                className="gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                عرض الكل ({sortedProperties.length} عقار)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div id="properties-list" className="container py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Filter className="w-4 h-4 ml-1" />
              الفلاتر
            </Button>
            <p className="text-muted-foreground">
              <span className="font-bold text-foreground">{sortedProperties.length}</span>{" "}
              عقار متاح
            </p>
            {sortByDistance && userLat && (
              <span className="text-sm text-success flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                مرتب حسب الأقرب
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              title="عرض شبكي"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              title="عرض قائمة"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("map")}
              title="عرض خريطة"
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar Ad */}
        <div className="mb-6">
          <AdvertisementBanner location="search" variant="banner" />
        </div>

        {/* Results Grid/List/Map */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "map" ? (
          <MapSearch onClose={() => setViewMode("grid")} />
        ) : sortedProperties.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {sortedProperties.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard 
                  id={property.id}
                  title={property.title}
                  price={property.price}
                  priceType={property.listing_type as "sale" | "rent"}
                  location={property.neighborhood || property.city}
                  city={property.city}
                  bedrooms={property.bedrooms || 0}
                  bathrooms={property.bathrooms || 0}
                  area={property.area || 0}
                  image={property.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"}
                  isFeatured={property.is_featured || false}
                  isCompareSelected={isSelected(property.id)}
                  onCompareToggle={toggleProperty}
                  distance={property.distance}
                />
              </div>
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
      </div>

      {/* Property Comparison */}
      <PropertyComparison 
        selectedProperties={selectedProperties}
        onRemoveProperty={removeProperty}
        onClearAll={clearAll}
      />

      <Footer />
    </div>
  );
};

export default SearchPage;
