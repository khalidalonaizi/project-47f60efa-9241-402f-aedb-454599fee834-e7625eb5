import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Percent, 
  Calendar, 
  Banknote, 
  Building2, 
  CheckCircle,
  Globe,
  Landmark,
  BadgeDollarSign,
  Eye
} from "lucide-react";

// Public financing offer - without sensitive contact info (phone/email)
interface FinancingOffer {
  id: string;
  company_name: string;
  company_type: string;
  logo_url?: string;
  interest_rate: number;
  max_tenure: number;
  max_amount: number;
  min_salary: number;
  max_dti: number;
  features: string[];
  website?: string;
  description?: string;
  is_featured?: boolean;
}

interface FinancingOfferCardProps {
  offer: FinancingOffer;
  isCompatible?: boolean;
  formatPrice: (price: number) => string;
}

const FinancingOfferCard = ({ offer, isCompatible = true, formatPrice }: FinancingOfferCardProps) => {
  const navigate = useNavigate();
  const getCompanyTypeLabel = (type: string) => {
    switch (type) {
      case 'bank':
        return 'بنك';
      case 'financing_company':
        return 'شركة تمويل';
      default:
        return 'جهة تمويل';
    }
  };

  const getCompanyIcon = (type: string) => {
    return type === 'bank' ? Landmark : BadgeDollarSign;
  };

  const CompanyIcon = getCompanyIcon(offer.company_type);

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${!isCompatible ? 'opacity-60' : ''} ${offer.is_featured ? 'border-primary ring-2 ring-primary/20' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden">
              {offer.logo_url ? (
                <img src={offer.logo_url} alt={offer.company_name} className="w-full h-full object-cover" />
              ) : (
                <CompanyIcon className="w-7 h-7 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{offer.company_name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getCompanyTypeLabel(offer.company_type)}
                </Badge>
                معدل ربح يبدأ من {offer.interest_rate}%
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isCompatible && (
              <Badge className="bg-green-500/90 hover:bg-green-500">متوافق</Badge>
            )}
            {offer.is_featured && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">مميز</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {offer.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <span>معدل الربح: {offer.interest_rate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>حتى {offer.max_tenure} سنة</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-muted-foreground" />
            <span>حد أدنى: {formatPrice(offer.min_salary)} ر.س</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>تمويل يصل إلى {formatPrice(offer.max_amount)} ر.س</span>
          </div>
        </div>

        {offer.features && offer.features.length > 0 && (
          <div className="space-y-2">
            {offer.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1" 
            variant="default"
            onClick={() => navigate(`/financing/${offer.id}`)}
          >
            <Eye className="w-4 h-4 ml-2" />
            عرض التفاصيل
          </Button>
          {offer.website && (
            <a href={offer.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <Globe className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancingOfferCard;
