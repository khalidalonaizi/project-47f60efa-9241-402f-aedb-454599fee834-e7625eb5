export const propertyTypes = [
  { value: 'apartment', labelAr: 'شقة', labelEn: 'Apartment' },
  { value: 'villa', labelAr: 'فيلا', labelEn: 'Villa' },
  { value: 'townhouse', labelAr: 'تاون هوس', labelEn: 'Townhouse' },
  { value: 'duplex', labelAr: 'دوبلكس', labelEn: 'Duplex' },
  { value: 'studio', labelAr: 'ستديو', labelEn: 'Studio' },
  { value: 'room', labelAr: 'غرفة', labelEn: 'Room' },
  { value: 'ground_floor', labelAr: 'دور أرضي', labelEn: 'Ground Floor' },
  { value: 'upper_floor', labelAr: 'دور علوي', labelEn: 'Upper Floor' },
  { value: 'hotel_apartments', labelAr: 'شقق فندقية', labelEn: 'Hotel Apartments' },
  { value: 'building', labelAr: 'عمارة', labelEn: 'Building' },
  { value: 'tower', labelAr: 'برج', labelEn: 'Tower' },
  { value: 'land', labelAr: 'أرض', labelEn: 'Land' },
  { value: 'raw_land', labelAr: 'أرض خام', labelEn: 'Raw Land' },
  { value: 'plot', labelAr: 'مخطط', labelEn: 'Plot' },
  { value: 'farm', labelAr: 'مزرعة', labelEn: 'Farm' },
  { value: 'chalet', labelAr: 'شاليه', labelEn: 'Chalet' },
  { value: 'rest_house', labelAr: 'استراحة', labelEn: 'Rest House' },
  { value: 'warehouse', labelAr: 'مستودع', labelEn: 'Warehouse' },
  { value: 'office', labelAr: 'مكتب', labelEn: 'Office' },
  { value: 'shop', labelAr: 'محل', labelEn: 'Shop' },
];

export const getPropertyTypeLabel = (value: string, language: 'ar' | 'en' = 'ar'): string => {
  const type = propertyTypes.find(t => t.value === value);
  if (!type) return value;
  return language === 'ar' ? type.labelAr : type.labelEn;
};

export const saudiCities = [
  { value: 'riyadh', labelAr: 'الرياض', labelEn: 'Riyadh' },
  { value: 'jeddah', labelAr: 'جدة', labelEn: 'Jeddah' },
  { value: 'makkah', labelAr: 'مكة المكرمة', labelEn: 'Makkah' },
  { value: 'madinah', labelAr: 'المدينة المنورة', labelEn: 'Madinah' },
  { value: 'dammam', labelAr: 'الدمام', labelEn: 'Dammam' },
  { value: 'khobar', labelAr: 'الخبر', labelEn: 'Khobar' },
  { value: 'dhahran', labelAr: 'الظهران', labelEn: 'Dhahran' },
  { value: 'taif', labelAr: 'الطائف', labelEn: 'Taif' },
  { value: 'tabuk', labelAr: 'تبوك', labelEn: 'Tabuk' },
  { value: 'abha', labelAr: 'أبها', labelEn: 'Abha' },
  { value: 'khamis_mushait', labelAr: 'خميس مشيط', labelEn: 'Khamis Mushait' },
  { value: 'buraidah', labelAr: 'بريدة', labelEn: 'Buraidah' },
  { value: 'najran', labelAr: 'نجران', labelEn: 'Najran' },
  { value: 'jazan', labelAr: 'جازان', labelEn: 'Jazan' },
  { value: 'yanbu', labelAr: 'ينبع', labelEn: 'Yanbu' },
  { value: 'hail', labelAr: 'حائل', labelEn: 'Hail' },
  { value: 'jubail', labelAr: 'الجبيل', labelEn: 'Jubail' },
  { value: 'al_ahsa', labelAr: 'الأحساء', labelEn: 'Al Ahsa' },
  { value: 'al_qatif', labelAr: 'القطيف', labelEn: 'Al Qatif' },
  { value: 'al_kharj', labelAr: 'الخرج', labelEn: 'Al Kharj' },
];

export const getCityLabel = (value: string, language: 'ar' | 'en' = 'ar'): string => {
  const city = saudiCities.find(c => c.value === value || c.labelAr === value || c.labelEn === value);
  if (!city) return value;
  return language === 'ar' ? city.labelAr : city.labelEn;
};
