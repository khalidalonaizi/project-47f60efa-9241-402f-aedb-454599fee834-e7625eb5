import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Ruler, Star, ArrowLeft, Sparkles } from "lucide-react";

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood: string | null;
  property_type: string;
  listing_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: string[] | null;
  is_featured: boolean;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  land: 'أرض',
  building: 'عمارة',
  office: 'مكتب',
  shop: 'محل تجاري',
};

const FeaturedAds = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setProperties(data);
      }
      setLoading(false);
    };

    fetchFeaturedProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
      <div className="container">
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
            <Sparkles className="w-3 h-3 ml-1" />
            إعلانات مميزة
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">العقارات الإعلانية المميزة</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            اكتشف أفضل العروض العقارية المميزة والحصرية في المملكة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} to={`/property/${property.id}`}>
              <Card className="group overflow-hidden border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-background hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={property.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600"}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Featured Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-500 text-white border-0 shadow-lg">
                      <Star className="w-3 h-3 ml-1 fill-white" />
                      مميز
                    </Badge>
                  </div>

                  {/* Listing Type Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={property.listing_type === 'sale' ? 'bg-green-500' : 'bg-blue-500'}>
                      {property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xl font-bold text-white drop-shadow-lg">
                      {formatPrice(property.price)} ر.س
                      {property.listing_type === 'rent' && <span className="text-sm font-normal">/شهري</span>}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1 text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm">{property.city}</span>
                    {property.neighborhood && <span className="text-sm">- {property.neighborhood}</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {property.bedrooms != null && (
                        <div className="flex items-center gap-1">
                          <BedDouble className="w-4 h-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms != null && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area != null && (
                        <div className="flex items-center gap-1">
                          <Ruler className="w-4 h-4" />
                          <span>{property.area} م²</span>
                        </div>
                      )}
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      {propertyTypeLabels[property.property_type] || property.property_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild size="lg" variant="outline" className="gap-2 border-amber-500/30 hover:bg-amber-500/10">
            <Link to="/search?featured=true">
              عرض جميع الإعلانات المميزة
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAds;
