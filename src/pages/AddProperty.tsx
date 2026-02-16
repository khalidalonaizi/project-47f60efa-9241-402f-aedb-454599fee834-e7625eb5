import { useState, useEffect } from 'react';
import { saudiCityNamesAr } from '@/lib/propertyTypes';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUploadWithCamera from '@/components/ImageUploadWithCamera';
import LocationPicker from '@/components/LocationPicker';
import { Building2, MapPin, BedDouble, Bath, Ruler, ChevronLeft, ImageIcon, Navigation } from 'lucide-react';

const propertySchema = z.object({
  title: z.string().trim().min(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' }),
  description: z.string().trim().min(20, { message: 'الوصف يجب أن يكون 20 حرف على الأقل' }),
  price: z.number().positive({ message: 'السعر يجب أن يكون رقم موجب' }),
  city: z.string().min(1, { message: 'اختر المدينة' }),
  neighborhood: z.string().optional(),
  propertyType: z.string().min(1, { message: 'اختر نوع العقار' }),
  listingType: z.string().min(1, { message: 'اختر نوع الإعلان' }),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  area: z.number().positive({ message: 'المساحة يجب أن تكون رقم موجب' }),
});

const amenitiesList = [
  'موقف سيارات',
  'مسبح',
  'حديقة',
  'مصعد',
  'أمن وحراسة',
  'مكيف مركزي',
  'غرفة خادمة',
  'غرفة سائق',
  'صالة رياضية',
  'ملعب أطفال',
];

const cities = saudiCityNamesAr;

const propertyTypes = [
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'land', label: 'أرض' },
  { value: 'building', label: 'عمارة' },
  { value: 'office', label: 'مكتب' },
  { value: 'shop', label: 'محل تجاري' },
];

const AddProperty = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      propertySchema.parse({
        title,
        description,
        price: parseFloat(price) || 0,
        city,
        neighborhood,
        propertyType,
        listingType,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        area: parseFloat(area) || 0,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);

    const { error } = await supabase.from('properties').insert({
      user_id: user.id,
      title,
      description,
      price: parseFloat(price),
      city,
      neighborhood,
      property_type: propertyType,
      listing_type: listingType,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      area: parseFloat(area),
      latitude,
      longitude,
      amenities: selectedAmenities,
      images: images,
      is_approved: true,
      status: 'approved',
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة العقار',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم بنجاح!',
        description: 'تم نشر إعلانك بنجاح',
      });
      navigate('/my-properties');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="h-4 w-4 ml-1" />
          رجوع
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">إضافة إعلان عقاري جديد</CardTitle>
            <CardDescription>أدخل تفاصيل العقار لإضافته للموقع</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  معلومات أساسية
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="عنوان الإعلان"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
                  </div>
                  
                  <Select value={propertyType || undefined} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="نوع العقار" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propertyType && <p className="text-destructive text-sm">{errors.propertyType}</p>}
                  
                  <Select value={listingType} onValueChange={setListingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="نوع الإعلان" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">للبيع</SelectItem>
                      <SelectItem value="rent">للإيجار</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="md:col-span-2">
                    <Textarea
                      placeholder="وصف تفصيلي للعقار..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                    {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  الموقع
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Select value={city || undefined} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && <p className="text-destructive text-sm">{errors.city}</p>}
                  
                  <Input
                    placeholder="الحي"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  />
                </div>

                {/* Location Picker */}
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    تحديد الموقع على الخريطة
                  </h4>
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={handleLocationChange}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  التفاصيل
                </h3>
                
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Ruler className="h-4 w-4" /> المساحة (م²)
                    </div>
                    <Input
                      type="number"
                      placeholder="المساحة"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                    {errors.area && <p className="text-destructive text-sm mt-1">{errors.area}</p>}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <BedDouble className="h-4 w-4" /> غرف النوم
                    </div>
                    <Input
                      type="number"
                      placeholder="غرف النوم"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Bath className="h-4 w-4" /> الحمامات
                    </div>
                    <Input
                      type="number"
                      placeholder="الحمامات"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      السعر (ريال)
                    </div>
                    <Input
                      type="number"
                      placeholder="السعر"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    {errors.price && <p className="text-destructive text-sm mt-1">{errors.price}</p>}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  صور العقار
                </h3>
                {user && (
                  <ImageUploadWithCamera
                    userId={user.id}
                    onImagesChange={setImages}
                    existingImages={images}
                    maxImages={10}
                  />
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">المميزات</h3>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                      />
                      <label htmlFor={amenity} className="text-sm cursor-pointer">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" variant="hero" disabled={isLoading}>
                {isLoading ? 'جاري الإضافة...' : 'نشر الإعلان'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;