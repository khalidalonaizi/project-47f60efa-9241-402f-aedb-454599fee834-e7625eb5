import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent, Building2, Wallet, ArrowLeft, Sparkles } from "lucide-react";

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

  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from("financing_offers")
        .select("id, company_name, company_type, logo_url, interest_rate, max_amount, max_tenure, is_featured")
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setOffers(data);
      }
      setLoading(false);
    };

    fetchOffers();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (offers.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [offers.length]);

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
          <Link to="/financing">
            <Button variant="outline" className="gap-2">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div 
            className="flex transition-transform duration-700 ease-in-out gap-4"
            style={{ 
              transform: `translateX(${currentIndex * (100 / Math.min(offers.length, 3))}%)`,
            }}
          >
            {offers.map((offer) => (
              <Link 
                key={offer.id} 
                to={`/financing/${offer.id}`}
                className="min-w-[calc(33.333%-1rem)] md:min-w-[calc(33.333%-1rem)] sm:min-w-[calc(50%-0.5rem)] max-sm:min-w-full flex-shrink-0"
              >
                <Card className="group h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-5">
                    {/* Featured Badge */}
                    {offer.is_featured && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white gap-1">
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
                          className="w-12 h-12 rounded-lg object-contain bg-muted p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
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
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                          <Percent className="h-4 w-4" />
                          <span className="text-lg font-bold">{offer.interest_rate}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">معدل الفائدة</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
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
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "w-6 bg-primary" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
