import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
  created_at: string;
}

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setProperties(data);
      }
      setLoading(false);
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            عقارات مميزة
          </h2>
          <p className="text-muted-foreground">
            لا توجد عقارات متاحة حالياً
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              عقارات مميزة
            </h2>
            <p className="text-muted-foreground">
              اكتشف أفضل العقارات المتاحة في المملكة
            </p>
          </div>
          <Link to="/search">
            <Button variant="outline" className="hidden md:flex gap-2">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PropertyCard
                id={property.id}
                title={property.title}
                price={property.price}
                priceType={property.listing_type === "rent" ? "rent" : "sale"}
                location={property.neighborhood || ""}
                city={property.city}
                bedrooms={property.bedrooms || 0}
                bathrooms={property.bathrooms || 0}
                area={property.area || 0}
                image={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"}
                isNew={new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                isFeatured={property.is_featured || false}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Link to="/search">
            <Button variant="outline" className="gap-2">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
