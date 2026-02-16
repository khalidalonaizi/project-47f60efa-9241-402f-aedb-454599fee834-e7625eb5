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
  // منطقة الرياض
  { value: 'riyadh', labelAr: 'الرياض', labelEn: 'Riyadh', region: 'الرياض' },
  { value: 'al_kharj', labelAr: 'الخرج', labelEn: 'Al Kharj', region: 'الرياض' },
  { value: 'al_dawadmi', labelAr: 'الدوادمي', labelEn: 'Al Dawadmi', region: 'الرياض' },
  { value: 'al_majmaah', labelAr: 'المجمعة', labelEn: 'Al Majmaah', region: 'الرياض' },
  { value: 'al_quwaiiyah', labelAr: 'القويعية', labelEn: 'Al Quwaiiyah', region: 'الرياض' },
  { value: 'wadi_ad_dawasir', labelAr: 'وادي الدواسر', labelEn: 'Wadi Ad Dawasir', region: 'الرياض' },
  { value: 'al_aflaj', labelAr: 'الأفلاج', labelEn: 'Al Aflaj', region: 'الرياض' },
  { value: 'al_zulfi', labelAr: 'الزلفي', labelEn: 'Al Zulfi', region: 'الرياض' },
  { value: 'shaqra', labelAr: 'شقراء', labelEn: 'Shaqra', region: 'الرياض' },
  { value: 'hotat_bani_tamim', labelAr: 'حوطة بني تميم', labelEn: 'Hotat Bani Tamim', region: 'الرياض' },
  { value: 'afif', labelAr: 'عفيف', labelEn: 'Afif', region: 'الرياض' },
  { value: 'as_sulayyil', labelAr: 'السليل', labelEn: 'As Sulayyil', region: 'الرياض' },
  { value: 'dariyah', labelAr: 'ضرماء', labelEn: 'Dariyah', region: 'الرياض' },
  { value: 'al_muzahmiyya', labelAr: 'المزاحمية', labelEn: 'Al Muzahmiyya', region: 'الرياض' },
  { value: 'rumah', labelAr: 'رماح', labelEn: 'Rumah', region: 'الرياض' },
  { value: 'thadiq', labelAr: 'ثادق', labelEn: 'Thadiq', region: 'الرياض' },
  { value: 'huraymila', labelAr: 'حريملاء', labelEn: 'Huraymila', region: 'الرياض' },
  { value: 'al_hariq', labelAr: 'الحريق', labelEn: 'Al Hariq', region: 'الرياض' },
  { value: 'al_ghat', labelAr: 'الغاط', labelEn: 'Al Ghat', region: 'الرياض' },
  { value: 'marat', labelAr: 'مرات', labelEn: 'Marat', region: 'الرياض' },
  // منطقة مكة المكرمة
  { value: 'makkah', labelAr: 'مكة المكرمة', labelEn: 'Makkah', region: 'مكة المكرمة' },
  { value: 'jeddah', labelAr: 'جدة', labelEn: 'Jeddah', region: 'مكة المكرمة' },
  { value: 'taif', labelAr: 'الطائف', labelEn: 'Taif', region: 'مكة المكرمة' },
  { value: 'al_qunfudhah', labelAr: 'القنفذة', labelEn: 'Al Qunfudhah', region: 'مكة المكرمة' },
  { value: 'al_lith', labelAr: 'الليث', labelEn: 'Al Lith', region: 'مكة المكرمة' },
  { value: 'rabigh', labelAr: 'رابغ', labelEn: 'Rabigh', region: 'مكة المكرمة' },
  { value: 'al_jumum', labelAr: 'الجموم', labelEn: 'Al Jumum', region: 'مكة المكرمة' },
  { value: 'khulays', labelAr: 'خليص', labelEn: 'Khulays', region: 'مكة المكرمة' },
  { value: 'al_kamil', labelAr: 'الكامل', labelEn: 'Al Kamil', region: 'مكة المكرمة' },
  { value: 'turubah', labelAr: 'تربة', labelEn: 'Turubah', region: 'مكة المكرمة' },
  { value: 'al_khurma', labelAr: 'الخرمة', labelEn: 'Al Khurma', region: 'مكة المكرمة' },
  { value: 'ranyah', labelAr: 'رنية', labelEn: 'Ranyah', region: 'مكة المكرمة' },
  { value: 'al_muwayh', labelAr: 'الموية', labelEn: 'Al Muwayh', region: 'مكة المكرمة' },
  { value: 'adham', labelAr: 'أضم', labelEn: 'Adham', region: 'مكة المكرمة' },
  // منطقة المدينة المنورة
  { value: 'madinah', labelAr: 'المدينة المنورة', labelEn: 'Madinah', region: 'المدينة المنورة' },
  { value: 'yanbu', labelAr: 'ينبع', labelEn: 'Yanbu', region: 'المدينة المنورة' },
  { value: 'al_ula', labelAr: 'العلا', labelEn: 'Al Ula', region: 'المدينة المنورة' },
  { value: 'al_madinah_al_hanakiyah', labelAr: 'الحناكية', labelEn: 'Al Hanakiyah', region: 'المدينة المنورة' },
  { value: 'mahd_adh_dhahab', labelAr: 'مهد الذهب', labelEn: 'Mahd Adh Dhahab', region: 'المدينة المنورة' },
  { value: 'badr', labelAr: 'بدر', labelEn: 'Badr', region: 'المدينة المنورة' },
  { value: 'khaybar', labelAr: 'خيبر', labelEn: 'Khaybar', region: 'المدينة المنورة' },
  { value: 'al_ais', labelAr: 'العيص', labelEn: 'Al Ais', region: 'المدينة المنورة' },
  // المنطقة الشرقية
  { value: 'dammam', labelAr: 'الدمام', labelEn: 'Dammam', region: 'الشرقية' },
  { value: 'khobar', labelAr: 'الخبر', labelEn: 'Khobar', region: 'الشرقية' },
  { value: 'dhahran', labelAr: 'الظهران', labelEn: 'Dhahran', region: 'الشرقية' },
  { value: 'al_ahsa', labelAr: 'الأحساء', labelEn: 'Al Ahsa', region: 'الشرقية' },
  { value: 'al_qatif', labelAr: 'القطيف', labelEn: 'Al Qatif', region: 'الشرقية' },
  { value: 'jubail', labelAr: 'الجبيل', labelEn: 'Jubail', region: 'الشرقية' },
  { value: 'hafar_al_batin', labelAr: 'حفر الباطن', labelEn: 'Hafar Al Batin', region: 'الشرقية' },
  { value: 'ras_tanura', labelAr: 'رأس تنورة', labelEn: 'Ras Tanura', region: 'الشرقية' },
  { value: 'al_khafji', labelAr: 'الخفجي', labelEn: 'Al Khafji', region: 'الشرقية' },
  { value: 'buqayq', labelAr: 'بقيق', labelEn: 'Buqayq', region: 'الشرقية' },
  { value: 'an_nuayriyah', labelAr: 'النعيرية', labelEn: 'An Nuayriyah', region: 'الشرقية' },
  { value: 'qaryat_al_ulya', labelAr: 'قرية العليا', labelEn: 'Qaryat Al Ulya', region: 'الشرقية' },
  { value: 'abqaiq', labelAr: 'أبقيق', labelEn: 'Abqaiq', region: 'الشرقية' },
  // منطقة القصيم
  { value: 'buraidah', labelAr: 'بريدة', labelEn: 'Buraidah', region: 'القصيم' },
  { value: 'unayzah', labelAr: 'عنيزة', labelEn: 'Unayzah', region: 'القصيم' },
  { value: 'ar_rass', labelAr: 'الرس', labelEn: 'Ar Rass', region: 'القصيم' },
  { value: 'al_mithnab', labelAr: 'المذنب', labelEn: 'Al Mithnab', region: 'القصيم' },
  { value: 'al_bukayriyah', labelAr: 'البكيرية', labelEn: 'Al Bukayriyah', region: 'القصيم' },
  { value: 'al_badai', labelAr: 'البدائع', labelEn: 'Al Badai', region: 'القصيم' },
  { value: 'uyun_al_jawa', labelAr: 'عيون الجواء', labelEn: 'Uyun Al Jawa', region: 'القصيم' },
  { value: 'ash_shinan', labelAr: 'الشنان', labelEn: 'Ash Shinan', region: 'القصيم' },
  // منطقة عسير
  { value: 'abha', labelAr: 'أبها', labelEn: 'Abha', region: 'عسير' },
  { value: 'khamis_mushait', labelAr: 'خميس مشيط', labelEn: 'Khamis Mushait', region: 'عسير' },
  { value: 'bisha', labelAr: 'بيشة', labelEn: 'Bisha', region: 'عسير' },
  { value: 'an_namas', labelAr: 'النماص', labelEn: 'An Namas', region: 'عسير' },
  { value: 'muhayil', labelAr: 'محايل عسير', labelEn: 'Muhayil', region: 'عسير' },
  { value: 'sarat_abidah', labelAr: 'سراة عبيدة', labelEn: 'Sarat Abidah', region: 'عسير' },
  { value: 'tathlith', labelAr: 'تثليث', labelEn: 'Tathlith', region: 'عسير' },
  { value: 'rijal_alma', labelAr: 'رجال ألمع', labelEn: 'Rijal Alma', region: 'عسير' },
  { value: 'ahad_rafidah', labelAr: 'أحد رفيدة', labelEn: 'Ahad Rafidah', region: 'عسير' },
  { value: 'dhahran_al_janub', labelAr: 'ظهران الجنوب', labelEn: 'Dhahran Al Janub', region: 'عسير' },
  { value: 'balqarn', labelAr: 'بلقرن', labelEn: 'Balqarn', region: 'عسير' },
  { value: 'al_majardah', labelAr: 'المجاردة', labelEn: 'Al Majardah', region: 'عسير' },
  { value: 'tanumah', labelAr: 'تنومة', labelEn: 'Tanumah', region: 'عسير' },
  { value: 'al_bariq', labelAr: 'البرك', labelEn: 'Al Bariq', region: 'عسير' },
  // منطقة تبوك
  { value: 'tabuk', labelAr: 'تبوك', labelEn: 'Tabuk', region: 'تبوك' },
  { value: 'al_wajh', labelAr: 'الوجه', labelEn: 'Al Wajh', region: 'تبوك' },
  { value: 'duba', labelAr: 'ضباء', labelEn: 'Duba', region: 'تبوك' },
  { value: 'tayma', labelAr: 'تيماء', labelEn: 'Tayma', region: 'تبوك' },
  { value: 'umluj', labelAr: 'أملج', labelEn: 'Umluj', region: 'تبوك' },
  { value: 'haql', labelAr: 'حقل', labelEn: 'Haql', region: 'تبوك' },
  { value: 'neom', labelAr: 'نيوم', labelEn: 'NEOM', region: 'تبوك' },
  // منطقة حائل
  { value: 'hail', labelAr: 'حائل', labelEn: 'Hail', region: 'حائل' },
  { value: 'baqaa', labelAr: 'بقعاء', labelEn: 'Baqaa', region: 'حائل' },
  { value: 'al_ghazalah', labelAr: 'الغزالة', labelEn: 'Al Ghazalah', region: 'حائل' },
  { value: 'ash_shinan_hail', labelAr: 'الشنان', labelEn: 'Ash Shinan', region: 'حائل' },
  { value: 'as_sulaimi', labelAr: 'السليمي', labelEn: 'As Sulaimi', region: 'حائل' },
  // منطقة الحدود الشمالية
  { value: 'arar', labelAr: 'عرعر', labelEn: 'Arar', region: 'الحدود الشمالية' },
  { value: 'rafha', labelAr: 'رفحاء', labelEn: 'Rafha', region: 'الحدود الشمالية' },
  { value: 'turayf', labelAr: 'طريف', labelEn: 'Turayf', region: 'الحدود الشمالية' },
  { value: 'al_uwayqilah', labelAr: 'العويقيلة', labelEn: 'Al Uwayqilah', region: 'الحدود الشمالية' },
  // منطقة جازان
  { value: 'jazan', labelAr: 'جازان', labelEn: 'Jazan', region: 'جازان' },
  { value: 'sabya', labelAr: 'صبيا', labelEn: 'Sabya', region: 'جازان' },
  { value: 'abu_arish', labelAr: 'أبو عريش', labelEn: 'Abu Arish', region: 'جازان' },
  { value: 'samtah', labelAr: 'صامطة', labelEn: 'Samtah', region: 'جازان' },
  { value: 'al_ardah', labelAr: 'العارضة', labelEn: 'Al Ardah', region: 'جازان' },
  { value: 'al_darb', labelAr: 'الدرب', labelEn: 'Al Darb', region: 'جازان' },
  { value: 'al_aydabi', labelAr: 'العيدابي', labelEn: 'Al Aydabi', region: 'جازان' },
  { value: 'farasan', labelAr: 'فرسان', labelEn: 'Farasan', region: 'جازان' },
  { value: 'ad_dayer', labelAr: 'الداير', labelEn: 'Ad Dayer', region: 'جازان' },
  { value: 'al_raith', labelAr: 'الريث', labelEn: 'Al Raith', region: 'جازان' },
  { value: 'baysh', labelAr: 'بيش', labelEn: 'Baysh', region: 'جازان' },
  { value: 'damad', labelAr: 'ضمد', labelEn: 'Damad', region: 'جازان' },
  { value: 'al_twal', labelAr: 'الطوال', labelEn: 'Al Twal', region: 'جازان' },
  { value: 'haroub', labelAr: 'هروب', labelEn: 'Haroub', region: 'جازان' },
  // منطقة نجران
  { value: 'najran', labelAr: 'نجران', labelEn: 'Najran', region: 'نجران' },
  { value: 'sharurah', labelAr: 'شرورة', labelEn: 'Sharurah', region: 'نجران' },
  { value: 'hubuna', labelAr: 'حبونا', labelEn: 'Hubuna', region: 'نجران' },
  { value: 'badr_al_janub', labelAr: 'بدر الجنوب', labelEn: 'Badr Al Janub', region: 'نجران' },
  { value: 'yadamah', labelAr: 'يدمة', labelEn: 'Yadamah', region: 'نجران' },
  { value: 'thar', labelAr: 'ثار', labelEn: 'Thar', region: 'نجران' },
  { value: 'khabash', labelAr: 'خباش', labelEn: 'Khabash', region: 'نجران' },
  // منطقة الباحة
  { value: 'al_baha', labelAr: 'الباحة', labelEn: 'Al Baha', region: 'الباحة' },
  { value: 'baljurashi', labelAr: 'بلجرشي', labelEn: 'Baljurashi', region: 'الباحة' },
  { value: 'al_makhwah', labelAr: 'المخواة', labelEn: 'Al Makhwah', region: 'الباحة' },
  { value: 'al_mandaq', labelAr: 'المندق', labelEn: 'Al Mandaq', region: 'الباحة' },
  { value: 'al_aqiq', labelAr: 'العقيق', labelEn: 'Al Aqiq', region: 'الباحة' },
  { value: 'qilwah', labelAr: 'قلوة', labelEn: 'Qilwah', region: 'الباحة' },
  // منطقة الجوف
  { value: 'sakaka', labelAr: 'سكاكا', labelEn: 'Sakaka', region: 'الجوف' },
  { value: 'al_qurayyat', labelAr: 'القريات', labelEn: 'Al Qurayyat', region: 'الجوف' },
  { value: 'dawmat_al_jandal', labelAr: 'دومة الجندل', labelEn: 'Dawmat Al Jandal', region: 'الجوف' },
  { value: 'tabarjal', labelAr: 'طبرجل', labelEn: 'Tabarjal', region: 'الجوف' },
];

export const getCityLabel = (value: string, language: 'ar' | 'en' = 'ar'): string => {
  const city = saudiCities.find(c => c.value === value || c.labelAr === value || c.labelEn === value);
  if (!city) return value;
  return language === 'ar' ? city.labelAr : city.labelEn;
};

// Helper: Get city names as simple Arabic string array (for forms that use Arabic names directly)
export const saudiCityNamesAr = saudiCities.map(c => c.labelAr);

// Helper: Get cities as {value, label} for Select components with "all" option
export const saudiCitiesSelectOptions = [
  { value: 'all', label: 'جميع المدن' },
  ...saudiCities.map(c => ({ value: c.labelAr, label: c.labelAr })),
];

// Helper: Get unique regions
export const saudiRegions = [...new Set(saudiCities.map(c => c.region))];
