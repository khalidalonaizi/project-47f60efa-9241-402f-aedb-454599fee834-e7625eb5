import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Common
    'home': 'الرئيسية',
    'search': 'البحث',
    'login': 'تسجيل الدخول',
    'logout': 'تسجيل الخروج',
    'profile': 'الملف الشخصي',
    'dashboard': 'لوحة التحكم',
    'settings': 'الإعدادات',
    'messages': 'الرسائل',
    'notifications': 'الإشعارات',
    'save': 'حفظ',
    'cancel': 'إلغاء',
    'delete': 'حذف',
    'edit': 'تعديل',
    'add': 'إضافة',
    'view': 'عرض',
    'close': 'إغلاق',
    
    // Account Types
    'individual': 'مستخدم فردي',
    'real_estate_office': 'مكتب عقاري',
    'financing_provider': 'جهة تمويلية',
    'appraiser': 'مقيم عقاري',
    
    // Dashboard
    'my_listings': 'إعلاناتي',
    'my_offers': 'عروضي',
    'requests': 'الطلبات',
    'reports': 'التقارير',
    'map': 'الخريطة',
    'statistics': 'الإحصائيات',
    
    // Services
    'mortgage_calculator': 'حاسبة التمويل العقاري',
    'property_evaluation': 'التقييم العقاري',
    'brokerage_services': 'خدمات الوساطة',
    'transaction_guarantee': 'ضمان المعاملات',
    
    // Property Types
    'townhouse': 'تاون هوس',
    'duplex': 'دوبلكس',
    'warehouse': 'مستودع',
    'rest_house': 'استراحة',
    'chalet': 'شاليه',
    'farm': 'مزرعة',
    'tower': 'برج',
    'studio': 'ستديو',
    'building': 'عمارة',
    'plot': 'مخطط',
    'raw_land': 'أرض خام',
    'ground_floor': 'دور أرضي',
    'upper_floor': 'دور علوي',
    'hotel_apartments': 'شقق فندقية',
    'room': 'غرفة',
    'apartment': 'شقة',
    'villa': 'فيلا',
    'land': 'أرض',
    'office': 'مكتب',
    'shop': 'محل',
    
    // Footer
    'about_us': 'من نحن',
    'careers': 'وظائف',
    'blog': 'المدونة',
    'contact_us': 'اتصل بنا',
    'sell_properties': 'بيع العقارات',
    'rent_properties': 'تأجير العقارات',
    'real_estate_financing': 'التمويل العقاري',
    'property_valuation': 'تقييم العقارات',
    'help_center': 'مركز المساعدة',
    'faq': 'الأسئلة الشائعة',
    'privacy_policy': 'سياسة الخصوصية',
    'terms_conditions': 'الشروط والأحكام',
    
    // Stats
    'happy_customers': 'عميل سعيد',
    'available_properties': 'عقار متاح',
    'cities': 'مدينة',
    'customer_rating': 'تقييم العملاء',
  },
  en: {
    // Common
    'home': 'Home',
    'search': 'Search',
    'login': 'Login',
    'logout': 'Logout',
    'profile': 'Profile',
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'messages': 'Messages',
    'notifications': 'Notifications',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'view': 'View',
    'close': 'Close',
    
    // Account Types
    'individual': 'Individual User',
    'real_estate_office': 'Real Estate Office',
    'financing_provider': 'Financing Provider',
    'appraiser': 'Real Estate Appraiser',
    
    // Dashboard
    'my_listings': 'My Listings',
    'my_offers': 'My Offers',
    'requests': 'Requests',
    'reports': 'Reports',
    'map': 'Map',
    'statistics': 'Statistics',
    
    // Services
    'mortgage_calculator': 'Mortgage Calculator',
    'property_evaluation': 'Property Evaluation',
    'brokerage_services': 'Brokerage Services',
    'transaction_guarantee': 'Transaction Guarantee',
    
    // Property Types
    'townhouse': 'Townhouse',
    'duplex': 'Duplex',
    'warehouse': 'Warehouse',
    'rest_house': 'Rest House',
    'chalet': 'Chalet',
    'farm': 'Farm',
    'tower': 'Tower',
    'studio': 'Studio',
    'building': 'Building',
    'plot': 'Plot',
    'raw_land': 'Raw Land',
    'ground_floor': 'Ground Floor',
    'upper_floor': 'Upper Floor',
    'hotel_apartments': 'Hotel Apartments',
    'room': 'Room',
    'apartment': 'Apartment',
    'villa': 'Villa',
    'land': 'Land',
    'office': 'Office',
    'shop': 'Shop',
    
    // Footer
    'about_us': 'About Us',
    'careers': 'Careers',
    'blog': 'Blog',
    'contact_us': 'Contact Us',
    'sell_properties': 'Sell Properties',
    'rent_properties': 'Rent Properties',
    'real_estate_financing': 'Real Estate Financing',
    'property_valuation': 'Property Valuation',
    'help_center': 'Help Center',
    'faq': 'FAQ',
    'privacy_policy': 'Privacy Policy',
    'terms_conditions': 'Terms & Conditions',
    
    // Stats
    'happy_customers': 'Happy Customers',
    'available_properties': 'Available Properties',
    'cities': 'Cities',
    'customer_rating': 'Customer Rating',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ar';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
