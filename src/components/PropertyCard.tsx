import { Badge } from "@/components/ui/badge";
import { Bath, Bed, Heart, MapPin, Maximize, GitCompare } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  priceType: "sale" | "rent";
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isCompareSelected?: boolean;
  onCompareToggle?: (id: string) => void;
}

const PropertyCard = ({
  id,
  title,
  price,
  priceType,
  location,
  city,
  bedrooms,
  bathrooms,
  area,
  image,
  isNew,
  isFeatured,
  isCompareSelected,
  onCompareToggle,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompareToggle?.(id);
  };

  return (
    <Link to={`/property/${id}`} className="block group bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isNew && (
            <Badge className="bg-success text-success-foreground">جديد</Badge>
          )}
          {isFeatured && (
            <Badge className="bg-gold text-foreground">مميز</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 left-3 flex gap-2">
          {onCompareToggle && (
            <button
              onClick={handleCompareClick}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                isCompareSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card/80 hover:bg-card text-muted-foreground"
              }`}
              title="إضافة للمقارنة"
            >
              <GitCompare className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleFavoriteClick}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
              }`}
            />
          </button>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">
          {formatPrice(price)} ر.س
          {priceType === "rent" && <span className="text-sm font-normal"> / شهري</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {location}، {city}
          </span>
        </div>

        {/* Specs */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{bedrooms} غرف</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{bathrooms} حمام</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Maximize className="w-4 h-4" />
            <span className="text-sm">{area} م²</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
