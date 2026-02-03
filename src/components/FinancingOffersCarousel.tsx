import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent, Building2, Wallet, ArrowLeft, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";

interface FinancingOffer {
  id: string;
  company_name: string;
  company_type: string;
  logo_url: string | null;
  interest_rate: number;
  max_amount: number;
  max_tenure: number;
  is_featured: boolean;
}

const FinancingOffersCarousel = () => {
  const [offers, setOffers] = useState<FinancingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'slide' | 'fade'>('slide');

  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from("financing_offers_public" as any)
        .select("id, company_name, company_type, logo_url, interest_rate, max_amount, max_tenure, is_featured")
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setOffers(data as unknown as FinancingOffer[]);
      }
      setLoading(false);
    };

    fetchOffers();
  }, []);

  const nextSlide = useCallback(() => {
    if (offers.length <= 1 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % offers.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [offers.length, isAnimating]);

  const prevSlide = useCallback(() => {
    if (offers.length <= 1 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [offers.length, isAnimating]);

  // Auto-scroll effect with varying animation types
  useEffect(() => {
    if (offers.length <= 1) return;
    
    const interval = setInterval(() => {
      // Alternate animation types
      setAnimationType(prev => prev === 'slide' ? 'fade' : 'slide');
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [offers.length, nextSlide]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  // Get visible offers (3 at a time on desktop)
  const getVisibleOffers = () => {
    const visible = [];
    for (let i = 0; i < Math.min(3, offers.length); i++) {
      visible.push(offers[(currentIndex + i) % offers.length]);
    }
    return visible;
  };

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">العروض التمويلية</h2>
              <p className="text-muted-foreground text-sm">أفضل عروض التمويل العقاري من البنوك وشركات التمويل</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={isAnimating}
              className="hidden sm:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={isAnimating}
              className="hidden sm:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Link to="/financing">
              <Button variant="outline" className="gap-2">
                عرض الكل
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 ease-in-out ${
              animationType === 'fade' ? 'opacity-0' : ''
            }`}
            style={{
              opacity: isAnimating && animationType === 'fade' ? 0 : 1,
              transform: isAnimating && animationType === 'slide' ? 'translateX(-20px)' : 'translateX(0)',
            }}
          >
            {getVisibleOffers().map((offer, index) => (
              <Link 
                key={`${offer.id}-${index}`} 
                to={`/financing/${offer.id}`}
                className="block transform transition-all duration-500 hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <Card className="group h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden relative">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-5 relative">
                    {/* Featured Badge */}
                    {offer.is_featured && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white gap-1 animate-pulse">
                        <Sparkles className="h-3 w-3" />
                        مميز
                      </Badge>
                    )}

                    {/* Company Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {offer.logo_url ? (
                        <img 
                          src={offer.logo_url} 
                          alt={offer.company_name}
                          className="w-12 h-12 rounded-lg object-contain bg-muted p-1 transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {offer.company_name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {offer.company_type === "bank" ? "بنك" : "شركة تمويل"}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center transition-all duration-300 group-hover:bg-green-100 dark:group-hover:bg-green-950/50">
                        <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                          <Percent className="h-4 w-4" />
                          <span className="text-lg font-bold">{offer.interest_rate}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">معدل الفائدة</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center transition-all duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50">
                        <div className="text-blue-600 dark:text-blue-400 mb-1">
                          <span className="text-sm font-bold">{formatPrice(offer.max_amount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">الحد الأقصى</p>
                      </div>
                    </div>

                    {/* Tenure */}
                    <div className="mt-3 text-center text-sm text-muted-foreground">
                      مدة التمويل حتى <span className="font-semibold text-foreground">{offer.max_tenure} سنة</span>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="outline" size="sm" className="w-full">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Dots Indicator */}
          {offers.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {offers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsAnimating(false), 700);
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "w-8 bg-primary" 
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FinancingOffersCarousel;
