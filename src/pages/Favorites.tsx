import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Trash2,
  Eye,
  Home
} from 'lucide-react';

interface FavoriteProperty {
  id: string;
  property_id: string;
  created_at: string;
  property: {
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
    is_approved: boolean | null;
  } | null;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  land: 'أرض',
  building: 'عمارة',
  office: 'مكتب',
  shop: 'محل تجاري',
};

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        property_id,
        created_at,
        property:properties (
          id,
          title,
          price,
          city,
          neighborhood,
          property_type,
          listing_type,
          bedrooms,
          bathrooms,
          area,
          images,
          is_approved
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المفضلة',
        variant: 'destructive',
      });
    } else {
      // Filter out favorites where property is null (deleted properties)
      const validFavorites = (data || []).filter(f => f.property !== null) as FavoriteProperty[];
      setFavorites(validFavorites);
    }
    setLoading(false);
  };

  const removeFavorite = async (favoriteId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة العقار من المفضلة',
        variant: 'destructive',
      });
    } else {
      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast({
        title: 'تمت الإزالة',
        description: 'تم إزالة العقار من المفضلة',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-destructive/10">
            <Heart className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">المفضلة</h1>
            <p className="text-muted-foreground">العقارات التي قمت بحفظها</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-bold mb-2">لا توجد عقارات محفوظة</h2>
              <p className="text-muted-foreground mb-6">ابدأ بإضافة عقارات للمفضلة من خلال الضغط على أيقونة القلب</p>
              <Button asChild>
                <Link to="/search">
                  <Home className="h-4 w-4 ml-2" />
                  تصفح العقارات
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => {
              const property = favorite.property;
              if (!property) return null;

              const image = property.images && property.images.length > 0
                ? property.images[0]
                : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';

              return (
                <Card key={favorite.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
                      </Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFavorite(favorite.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg line-clamp-1">{property.title}</h3>
                      <Badge variant="secondary">
                        {propertyTypeLabels[property.property_type] || property.property_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{property.city}</span>
                      {property.neighborhood && <span> - {property.neighborhood}</span>}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {property.bedrooms !== null && property.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms !== null && property.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area !== null && property.area > 0 && (
                        <div className="flex items-center gap-1">
                          <Ruler className="h-4 w-4" />
                          <span>{property.area} م²</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-primary">
                        {property.price.toLocaleString()} ريال
                        {property.listing_type === 'rent' && (
                          <span className="text-sm font-normal text-muted-foreground">/شهر</span>
                        )}
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/property/${property.id}`}>
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Favorites;
