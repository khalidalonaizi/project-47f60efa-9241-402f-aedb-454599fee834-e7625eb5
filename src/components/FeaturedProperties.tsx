import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const properties = [
  {
    id: "1",
    title: "فيلا فاخرة في حي الملقا",
    price: 3500000,
    priceType: "sale" as const,
    location: "حي الملقا",
    city: "الرياض",
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "2",
    title: "شقة حديثة في جدة",
    price: 1200000,
    priceType: "sale" as const,
    location: "حي الروضة",
    city: "جدة",
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    isFeatured: true,
  },
  {
    id: "3",
    title: "شقة للإيجار في الدمام",
    price: 4500,
    priceType: "rent" as const,
    location: "حي الفيصلية",
    city: "الدمام",
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    isNew: true,
  },
  {
    id: "4",
    title: "فيلا دوبلكس في الخبر",
    price: 2800000,
    priceType: "sale" as const,
    location: "حي اليرموك",
    city: "الخبر",
    bedrooms: 6,
    bathrooms: 5,
    area: 550,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
  },
  {
    id: "5",
    title: "شقة فاخرة مطلة على البحر",
    price: 8000,
    priceType: "rent" as const,
    location: "كورنيش جدة",
    city: "جدة",
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    isFeatured: true,
  },
  {
    id: "6",
    title: "مجمع سكني جديد",
    price: 1800000,
    priceType: "sale" as const,
    location: "حي النرجس",
    city: "الرياض",
    bedrooms: 4,
    bathrooms: 3,
    area: 300,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    isNew: true,
  },
];

const FeaturedProperties = () => {
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
          <Button variant="outline" className="hidden md:flex gap-2">
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PropertyCard {...property} />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Button variant="outline" className="gap-2">
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
