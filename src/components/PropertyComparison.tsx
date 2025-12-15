import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, GitCompare, Bed, Bath, Maximize, MapPin, Building2, Check, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  property_type: string;
  amenities: string[] | null;
  address: string | null;
}

interface PropertyComparisonProps {
  selectedProperties: string[];
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
}

const amenityLabels: Record<string, string> = {
  parking: "موقف سيارات",
  pool: "مسبح",
  gym: "صالة رياضية",
  garden: "حديقة",
  elevator: "مصعد",
  security: "حراسة أمنية",
  ac: "تكييف مركزي",
  furnished: "مفروشة",
};

const propertyTypeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  duplex: "دوبلكس",
  townhouse: "تاون هاوس",
  land: "أرض",
  office: "مكتب",
  commercial: "محل تجاري",
  warehouse: "مستودع",
};

export function PropertyComparison({ selectedProperties, onRemoveProperty, onClearAll }: PropertyComparisonProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selectedProperties.length > 0 && open) {
      fetchProperties();
    }
  }, [selectedProperties, open]);

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', selectedProperties);

    if (!error && data) {
      setProperties(data);
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  const allAmenities = Array.from(
    new Set(properties.flatMap(p => p.amenities || []))
  );

  if (selectedProperties.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className="shadow-lg gap-2" 
            size="lg"
          >
            <GitCompare className="w-5 h-5" />
            مقارنة ({selectedProperties.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>مقارنة العقارات</span>
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                مسح الكل
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[70vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-right font-medium text-muted-foreground min-w-[150px]">المواصفات</th>
                      {properties.map(property => (
                        <th key={property.id} className="p-4 min-w-[200px]">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-2 -left-2 h-6 w-6"
                              onClick={() => onRemoveProperty(property.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <img
                              src={property.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"}
                              alt={property.title}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <h3 className="font-bold text-sm line-clamp-2">{property.title}</h3>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* السعر */}
                    <tr className="border-b bg-muted/50">
                      <td className="p-4 font-medium">السعر</td>
                      {properties.map(property => (
                        <td key={property.id} className="p-4 text-center">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(property.price)} ر.س
                          </span>
                          <Badge variant="secondary" className="mr-2">
                            {property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    
                    {/* نوع العقار */}
                    <tr className="border-b">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        نوع العقار
                      </td>
                      {properties.map(property => (
                        <td key={property.id} className="p-4 text-center">
                          {propertyTypeLabels[property.property_type] || property.property_type}
                        </td>
                      ))}
                    </tr>
                    
                    {/* الموقع */}
                    <tr className="border-b bg-muted/50">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        الموقع
                      </td>
                      {properties.map(property => (
                        <td key={property.id} className="p-4 text-center">
                          <div>{property.city}</div>
                          {property.neighborhood && (
                            <div className="text-sm text-muted-foreground">{property.neighborhood}</div>
                          )}
                        </td>
                      ))}
                    </tr>
                    
                    {/* الغرف */}
                    <tr className="border-b">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Bed className="w-4 h-4" />
                        غرف النوم
                      </td>
                      {properties.map(property => (
                        <td key={property.id} className="p-4 text-center font-medium">
                          {property.bedrooms || '-'}
                        </td>
                      ))}
                    </tr>
                    
                    {/* الحمامات */}
                    <tr className="border-b bg-muted/50">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Bath className="w-4 h-4" />
                        الحمامات
                      </td>
                      {properties.map(property => (
                        <td key={property.id} className="p-4 text-center font-medium">
                          {property.bathrooms || '-'}
                        </td>
                      ))}
                    </tr>
                    
                    {/* المساحة */}
                    <tr className="border-b">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Maximize className="w-4 h-4" />
                        المساحة
                      </td>
                      {properties.map(property => (
                        <td key={property.id} className="p-4 text-center font-medium">
                          {property.area ? `${property.area} م²` : '-'}
                        </td>
                      ))}
                    </tr>
                    
                    {/* السعر لكل متر */}
                    <tr className="border-b bg-muted/50">
                      <td className="p-4 font-medium">سعر المتر</td>
                      {properties.map(property => (
                        <td key={property.id} className="p-4 text-center">
                          {property.area 
                            ? `${formatPrice(Math.round(property.price / property.area))} ر.س/م²`
                            : '-'}
                        </td>
                      ))}
                    </tr>
                    
                    {/* المميزات */}
                    {allAmenities.map(amenity => (
                      <tr key={amenity} className="border-b">
                        <td className="p-4 font-medium">
                          {amenityLabels[amenity] || amenity}
                        </td>
                        {properties.map(property => (
                          <td key={property.id} className="p-4 text-center">
                            {property.amenities?.includes(amenity) ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <Minus className="w-5 h-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PropertyComparison;
