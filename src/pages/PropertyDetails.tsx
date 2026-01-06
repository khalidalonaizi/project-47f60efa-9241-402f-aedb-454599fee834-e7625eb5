import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyReviews from '@/components/PropertyReviews';
import SendMessageDialog from '@/components/SendMessageDialog';
import PropertyLocationMap from '@/components/PropertyLocationMap';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  BedDouble, 
  Bath, 
  Ruler, 
  Heart, 
  Phone, 
  Mail,
  User,
  Calendar,
  Home,
  Check,
  Star
} from 'lucide-react';
import SocialShareButtons from '@/components/SocialShareButtons';

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  city: string;
  neighborhood: string | null;
  address: string | null;
  property_type: string;
  listing_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  amenities: string[] | null;
  images: string[] | null;
  is_approved: boolean | null;
  created_at: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
}

interface OwnerProfile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  land: 'أرض',
  building: 'عمارة',
  office: 'مكتب',
  shop: 'محل تجاري',
};

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    if (user && property) {
      checkFavorite();
    }
  }, [user, property]);

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على العقار',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    setProperty(data);

    // جلب معلومات المالك
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('user_id', data.user_id)
      .maybeSingle();

    setOwner(ownerData);
    setLoading(false);
  };

  const checkFavorite = async () => {
    if (!user || !property) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', property.id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'تنبيه',
        description: 'يجب تسجيل الدخول لإضافة العقار للمفضلة',
      });
      navigate('/auth');
      return;
    }

    if (!property) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', property.id);
      setIsFavorite(false);
      toast({ title: 'تمت الإزالة', description: 'تم إزالة العقار من المفضلة' });
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: property.id });
      setIsFavorite(true);
      toast({ title: 'تمت الإضافة', description: 'تم إضافة العقار للمفضلة' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: property?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'تم النسخ', description: 'تم نسخ رابط العقار' });
    }
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (!property) return null;

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft className="h-4 w-4" />
          <Link to="/search" className="hover:text-primary">العقارات</Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-foreground">{property.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted">
              <img
                src={images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-primary' : 'bg-background/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute top-4 right-4 flex gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
                </Badge>
                <Badge variant="secondary">
                  {propertyTypeLabels[property.property_type] || property.property_type}
                </Badge>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Property Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{property.city}</span>
                      {property.neighborhood && <span> - {property.neighborhood}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={toggleFavorite}>
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
                    </Button>
                    <SocialShareButtons
                      url={window.location.href}
                      title={property.title}
                      description={`${property.title} - ${property.city} - ${property.price.toLocaleString()} ريال`}
                    />
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary mb-6">
                  {property.price.toLocaleString()} ريال
                  {property.listing_type === 'rent' && <span className="text-lg font-normal text-muted-foreground">/شهر</span>}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
                  <div className="text-center">
                    <BedDouble className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="font-bold">{property.bedrooms || 0}</p>
                    <p className="text-sm text-muted-foreground">غرف نوم</p>
                  </div>
                  <div className="text-center">
                    <Bath className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="font-bold">{property.bathrooms || 0}</p>
                    <p className="text-sm text-muted-foreground">حمامات</p>
                  </div>
                  <div className="text-center">
                    <Ruler className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="font-bold">{property.area || 0}</p>
                    <p className="text-sm text-muted-foreground">م²</p>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2">الوصف</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">المميزات</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-success" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  الموقع على الخريطة
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden">
                  {property.latitude && property.longitude ? (
                    <PropertyLocationMap
                      latitude={property.latitude}
                      longitude={property.longitude}
                      title={property.title}
                      address={property.address || `${property.city}${property.neighborhood ? ' - ' + property.neighborhood : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2" />
                        <p>{property.city}</p>
                        {property.neighborhood && <p className="text-sm">{property.neighborhood}</p>}
                        {property.address && <p className="text-sm">{property.address}</p>}
                      </div>
                    </div>
                  )}
                </div>
                {/* Address info below map */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{property.city}</p>
                      {property.neighborhood && <p className="text-sm text-muted-foreground">{property.neighborhood}</p>}
                      {property.address && <p className="text-sm text-muted-foreground">{property.address}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* التقييمات والمراجعات */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  التقييمات والمراجعات
                </h3>
                <PropertyReviews propertyId={property.id} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">معلومات المالك</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {owner?.avatar_url ? (
                      <img src={owner.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{owner?.full_name || 'مستخدم'}</p>
                    <p className="text-sm text-muted-foreground">مالك العقار</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {owner?.phone && (
                    <Button className="w-full" variant="hero" asChild>
                      <a href={`tel:${owner.phone}`}>
                        <Phone className="h-4 w-4 ml-2" />
                        {owner.phone}
                      </a>
                    </Button>
                  )}
                  
                  <Button className="w-full" variant="outline" asChild>
                    <a href={`https://wa.me/${owner?.phone?.replace(/[^0-9]/g, '') || ''}`} target="_blank" rel="noopener noreferrer">
                      <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      واتساب
                    </a>
                  </Button>

                  {/* زر مراسلة المالك */}
                  <SendMessageDialog
                    receiverId={property.user_id}
                    propertyId={property.id}
                    propertyTitle={property.title}
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ النشر: {new Date(property.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Home className="h-4 w-4" />
                    <span>رقم الإعلان: {property.id.slice(0, 8)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetails;
