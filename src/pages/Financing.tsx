import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import FinancingOfferCard from "@/components/FinancingOfferCard";
import ContactButton from "@/components/ContactButton";
import { 
  Calculator, 
  Banknote, 
  Percent, 
  Calendar, 
  CheckCircle, 
  Building2, 
  FileText, 
  Phone,
  Wallet,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  User,
  Briefcase,
  Printer,
  Car,
  Save,
  FolderOpen,
  Plus,
  Landmark,
  BadgeDollarSign,
  Loader2
} from "lucide-react";

// Public financing offer - without sensitive contact info
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
  is_approved?: boolean;
}

const defaultBanks: FinancingOffer[] = [
  {
    id: "1",
    company_name: "البنك الأهلي السعودي",
    company_type: "bank",
    interest_rate: 4.5,
    max_tenure: 25,
    max_amount: 5000000,
    min_salary: 5000,
    max_dti: 65,
    features: ["تمويل يصل إلى 90%", "فترة سداد مرنة", "إعفاء من الرسوم الإدارية"],
    website: "https://www.alahli.com",
  },
  {
    id: "2",
    company_name: "مصرف الراجحي",
    company_type: "bank",
    interest_rate: 4.2,
    max_tenure: 30,
    max_amount: 7000000,
    min_salary: 4000,
    max_dti: 60,
    features: ["متوافق مع الشريعة", "موافقة سريعة", "تأمين مجاني"],
    website: "https://www.alrajhibank.com.sa",
  },
  {
    id: "3",
    company_name: "بنك الرياض",
    company_type: "bank",
    interest_rate: 4.8,
    max_tenure: 25,
    max_amount: 4000000,
    min_salary: 6000,
    max_dti: 55,
    features: ["أقساط ثابتة", "خدمة عملاء متميزة", "تحويل الراتب اختياري"],
    website: "https://www.riyadbank.com",
  },
  {
    id: "4",
    company_name: "البنك السعودي الفرنسي",
    company_type: "bank",
    interest_rate: 4.6,
    max_tenure: 20,
    max_amount: 3500000,
    min_salary: 5500,
    max_dti: 50,
    features: ["معدل ربح تنافسي", "إجراءات سريعة", "تمويل بدون كفيل"],
    website: "https://www.alfransi.com.sa",
  },
  {
    id: "5",
    company_name: "شركة دار التمليك",
    company_type: "financing_company",
    interest_rate: 5.0,
    max_tenure: 20,
    max_amount: 3000000,
    min_salary: 4500,
    max_dti: 60,
    features: ["حلول تمويلية متنوعة", "تمويل العقار تحت الإنشاء", "خدمة متكاملة"],
    website: "https://www.dantamlik.com",
  },
  {
    id: "6",
    company_name: "شركة بداية للتمويل",
    company_type: "financing_company",
    interest_rate: 4.9,
    max_tenure: 25,
    max_amount: 4000000,
    min_salary: 5000,
    max_dti: 55,
    features: ["تمويل سكني متوافق مع الشريعة", "برامج دعم سكني", "استشارات مجانية"],
    website: "https://www.bidayahome.com",
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ar-SA").format(Math.round(price));
};

const Financing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Financing offers
  const [offers, setOffers] = useState<FinancingOffer[]>(defaultBanks);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Add offer dialog
  const [addOfferOpen, setAddOfferOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    company_name: "",
    company_type: "financing_company" as "bank" | "financing_company",
    interest_rate: 5,
    max_tenure: 20,
    max_amount: 3000000,
    min_salary: 5000,
    max_dti: 60,
    features: [""],
    phone: "",
    email: "",
    website: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Property details
  const [propertyPrice, setPropertyPrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(200000);
  const [tenure, setTenure] = useState(20);
  const [interestRate, setInterestRate] = useState(4.5);
  
  // Customer financial details
  const [salary, setSalary] = useState(15000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [monthlyObligations, setMonthlyObligations] = useState(0);
  const [age, setAge] = useState(30);
  const [sector, setSector] = useState<'government' | 'private' | 'military'>('private');
  
  // Personal Loan (5 years)
  const [hasPersonalLoan, setHasPersonalLoan] = useState(false);
  const [personalLoanAmount, setPersonalLoanAmount] = useState(50000);
  const [personalLoanRate, setPersonalLoanRate] = useState(5);
  
  // Car Loan
  const [hasCarLoan, setHasCarLoan] = useState(false);
  const [carLoanInstallment, setCarLoanInstallment] = useState(1500);
  
  // Credit Card
  const [hasCreditCard, setHasCreditCard] = useState(false);
  const [creditCardLimit, setCreditCardLimit] = useState(20000);

  // Save report
  const [reportName, setReportName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Print ref
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch financing offers from public view (without sensitive contact info)
  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from('financing_offers_public' as any)
      .select('id, company_name, company_type, logo_url, interest_rate, max_tenure, max_amount, min_salary, max_dti, features, website, description, is_featured, is_approved')
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .order('interest_rate', { ascending: true });

    if (!error && data && data.length > 0) {
      const dbOffers = (data as any[]).map(offer => ({
        ...offer,
        features: offer.features || [],
      })) as FinancingOffer[];
      setOffers([...dbOffers, ...defaultBanks]);
    }
    setLoadingOffers(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = tenure * 12;
  const downPaymentPercentage = Math.round((downPayment / propertyPrice) * 100);
  
  const monthlyPayment = useMemo(() => {
    if (monthlyRate === 0) return loanAmount / numberOfPayments;
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }, [loanAmount, monthlyRate, numberOfPayments]);
  
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  // Calculate personal loan monthly installment (5 years = 60 months)
  const personalLoanMonthlyRate = personalLoanRate / 100 / 12;
  const personalLoanMonths = 60;
  const personalLoanInstallment = useMemo(() => {
    if (!hasPersonalLoan) return 0;
    if (personalLoanMonthlyRate === 0) return personalLoanAmount / personalLoanMonths;
    return personalLoanAmount * (personalLoanMonthlyRate * Math.pow(1 + personalLoanMonthlyRate, personalLoanMonths)) / 
      (Math.pow(1 + personalLoanMonthlyRate, personalLoanMonths) - 1);
  }, [hasPersonalLoan, personalLoanAmount, personalLoanMonthlyRate]);

  // Credit card monthly obligation (5% of limit as per Saudi banks)
  const creditCardMonthlyObligation = hasCreditCard ? creditCardLimit * 0.05 : 0;
  
  // Car loan obligation
  const carLoanObligation = hasCarLoan ? carLoanInstallment : 0;

  // Total calculated obligations
  const calculatedObligations = personalLoanInstallment + creditCardMonthlyObligation + carLoanObligation + monthlyObligations;

  // Customer calculations
  const totalIncome = salary + otherIncome;
  const totalObligationsWithLoan = calculatedObligations + monthlyPayment;
  const dti = (totalObligationsWithLoan / totalIncome) * 100;
  const remainingIncome = totalIncome - totalObligationsWithLoan;
  const maxRetirementAge = sector === 'military' ? 55 : 60;
  const maxTenureByAge = Math.max(5, maxRetirementAge - age);

  // Eligibility checks
  const eligibilityChecks = useMemo(() => {
    const checks = [];
    
    if (salary >= 5000) {
      checks.push({ label: "الراتب يتجاوز الحد الأدنى", passed: true });
    } else {
      checks.push({ label: "الراتب أقل من الحد الأدنى (5,000 ر.س)", passed: false });
    }
    
    if (dti <= 65) {
      checks.push({ label: `نسبة الاستقطاع ${dti.toFixed(1)}% (مقبولة)`, passed: true });
    } else {
      checks.push({ label: `نسبة الاستقطاع ${dti.toFixed(1)}% (تتجاوز 65%)`, passed: false });
    }
    
    if (tenure <= maxTenureByAge) {
      checks.push({ label: "مدة التمويل مناسبة لعمرك", passed: true });
    } else {
      checks.push({ label: `الحد الأقصى للتمويل ${maxTenureByAge} سنة بناءً على عمرك`, passed: false });
    }
    
    const downPaymentPercent = (downPayment / propertyPrice) * 100;
    if (downPaymentPercent >= 10) {
      checks.push({ label: `الدفعة الأولى ${downPaymentPercent.toFixed(0)}% (مقبولة)`, passed: true });
    } else {
      checks.push({ label: "الدفعة الأولى يجب أن تكون 10% على الأقل", passed: false });
    }
    
    if (remainingIncome >= 2000) {
      checks.push({ label: "الدخل المتبقي كافٍ للمعيشة", passed: true });
    } else {
      checks.push({ label: "الدخل المتبقي أقل من 2,000 ر.س", passed: false });
    }
    
    return checks;
  }, [salary, dti, tenure, maxTenureByAge, downPayment, propertyPrice, remainingIncome]);

  const isEligible = eligibilityChecks.every(check => check.passed);
  const eligibleOffers = offers.filter(offer => 
    salary >= offer.min_salary && 
    dti <= offer.max_dti && 
    tenure <= offer.max_tenure &&
    loanAmount <= offer.max_amount
  );

  // Handle add offer
  const handleAddOffer = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لإضافة عرض تمويلي",
        variant: "destructive",
      });
      return;
    }

    if (!newOffer.company_name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الشركة",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { data: insertedOffer, error } = await supabase.from('financing_offers').insert({
      user_id: user.id,
      company_name: newOffer.company_name,
      company_type: newOffer.company_type,
      interest_rate: newOffer.interest_rate,
      max_tenure: newOffer.max_tenure,
      max_amount: newOffer.max_amount,
      min_salary: newOffer.min_salary,
      max_dti: newOffer.max_dti,
      features: newOffer.features.filter(f => f.trim()),
      phone: newOffer.phone || null,
      email: newOffer.email || null,
      website: newOffer.website || null,
      description: newOffer.description || null,
    }).select().single();

    setSubmitting(false);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العرض",
        variant: "destructive",
      });
    } else {
      // Send notifications to all users
      try {
        await supabase.functions.invoke('notify-new-financing-offer', {
          body: {
            offer_id: insertedOffer?.id,
            company_name: newOffer.company_name,
            company_type: newOffer.company_type,
            interest_rate: newOffer.interest_rate,
            max_amount: newOffer.max_amount,
            user_id: user.id,
          },
        });
      } catch (notifyError) {
        console.error('Error sending notifications:', notifyError);
      }

      toast({
        title: "تم النشر",
        description: "تم نشر العرض التمويلي بنجاح وإرسال إشعارات للمستخدمين",
      });
      setAddOfferOpen(false);
      setNewOffer({
        company_name: "",
        company_type: "financing_company",
        interest_rate: 5,
        max_tenure: 20,
        max_amount: 3000000,
        min_salary: 5000,
        max_dti: 60,
        features: [""],
        phone: "",
        email: "",
        website: "",
        description: "",
      });
      fetchOffers();
    }
  };

  // Sanitize function to prevent XSS
  const sanitizeForHtml = (value: string | number): string => {
    const str = String(value);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Print function
  const handlePrint = () => {
    const currentDate = sanitizeForHtml(new Date().toLocaleDateString('ar-SA'));
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "خطأ",
        description: "تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize all values before using in HTML
    const safeSectorLabel = sanitizeForHtml(sector === 'government' ? 'حكومي' : sector === 'private' ? 'خاص' : 'عسكري');
    const safePropertyPrice = sanitizeForHtml(formatPrice(propertyPrice));
    const safeDownPayment = sanitizeForHtml(formatPrice(downPayment));
    const safeDownPaymentPercentage = sanitizeForHtml(downPaymentPercentage);
    const safeLoanAmount = sanitizeForHtml(formatPrice(loanAmount));
    const safeTenure = sanitizeForHtml(tenure);
    const safeNumberOfPayments = sanitizeForHtml(numberOfPayments);
    const safeInterestRate = sanitizeForHtml(interestRate);
    const safeTotalInterest = sanitizeForHtml(formatPrice(totalInterest));
    const safeMonthlyPayment = sanitizeForHtml(formatPrice(monthlyPayment));
    const safeAge = sanitizeForHtml(age);
    const safeSalary = sanitizeForHtml(formatPrice(salary));
    const safeOtherIncome = sanitizeForHtml(formatPrice(otherIncome));
    const safeTotalIncome = sanitizeForHtml(formatPrice(totalIncome));
    const safeTotalObligationsWithLoan = sanitizeForHtml(formatPrice(totalObligationsWithLoan));
    const safeDti = sanitizeForHtml(dti.toFixed(1));
    const safeRemainingIncome = sanitizeForHtml(formatPrice(remainingIncome));
    const safeEligibleCount = sanitizeForHtml(eligibleOffers.length);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير التمويل العقاري</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, sans-serif; 
            padding: 40px; 
            direction: rtl;
            background: #fff;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #14B8A6; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .header h1 { color: #1f2937; font-size: 28px; margin-bottom: 5px; }
          .header p { color: #6b7280; }
          .section { margin-bottom: 25px; }
          .section-title { 
            background: #14B8A6; 
            color: white; 
            padding: 10px 15px; 
            border-radius: 5px;
            margin-bottom: 15px;
            font-size: 16px;
          }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .item { 
            display: flex; 
            justify-content: space-between; 
            padding: 10px; 
            background: #f9fafb; 
            border-radius: 5px;
          }
          .item-label { color: #6b7280; }
          .item-value { font-weight: bold; color: #1f2937; }
          .highlight { 
            background: #ccfbf1; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center;
            margin: 20px 0;
          }
          .highlight-value { font-size: 32px; color: #14B8A6; font-weight: bold; }
          .highlight-label { color: #6b7280; margin-top: 5px; }
          .eligibility { padding: 15px; border-radius: 5px; margin-top: 20px; }
          .eligible { background: #dcfce7; border: 2px solid #22c55e; }
          .not-eligible { background: #fee2e2; border: 2px solid #ef4444; }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #9ca3af;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير التمويل العقاري</h1>
          <p>تاريخ التقرير: ${currentDate}</p>
        </div>

        <div class="highlight">
          <div class="highlight-value">${safeMonthlyPayment} ر.س</div>
          <div class="highlight-label">القسط الشهري المتوقع</div>
        </div>

        <div class="section">
          <div class="section-title">تفاصيل العقار</div>
          <div class="grid">
            <div class="item">
              <span class="item-label">سعر العقار</span>
              <span class="item-value">${safePropertyPrice} ر.س</span>
            </div>
            <div class="item">
              <span class="item-label">الدفعة الأولى</span>
              <span class="item-value">${safeDownPayment} ر.س (${safeDownPaymentPercentage}%)</span>
            </div>
            <div class="item">
              <span class="item-label">مبلغ التمويل</span>
              <span class="item-value">${safeLoanAmount} ر.س</span>
            </div>
            <div class="item">
              <span class="item-label">مدة التمويل</span>
              <span class="item-value">${safeTenure} سنة (${safeNumberOfPayments} شهر)</span>
            </div>
            <div class="item">
              <span class="item-label">معدل الربح</span>
              <span class="item-value">${safeInterestRate}%</span>
            </div>
            <div class="item">
              <span class="item-label">إجمالي الأرباح</span>
              <span class="item-value">${safeTotalInterest} ر.س</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">البيانات المالية للعميل</div>
          <div class="grid">
            <div class="item">
              <span class="item-label">العمر</span>
              <span class="item-value">${safeAge} سنة</span>
            </div>
            <div class="item">
              <span class="item-label">قطاع العمل</span>
              <span class="item-value">${safeSectorLabel}</span>
            </div>
            <div class="item">
              <span class="item-label">الراتب الشهري</span>
              <span class="item-value">${safeSalary} ر.س</span>
            </div>
            <div class="item">
              <span class="item-label">دخل إضافي</span>
              <span class="item-value">${safeOtherIncome} ر.س</span>
            </div>
            <div class="item">
              <span class="item-label">إجمالي الدخل</span>
              <span class="item-value">${safeTotalIncome} ر.س</span>
            </div>
            <div class="item">
              <span class="item-label">إجمالي الالتزامات</span>
              <span class="item-value">${safeTotalObligationsWithLoan} ر.س</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ملخص الوضع المالي</div>
          <div class="grid">
            <div class="item">
              <span class="item-label">نسبة الاستقطاع (DTI)</span>
              <span class="item-value" style="color: ${Number(dti) > 65 ? '#ef4444' : '#22c55e'};">${safeDti}%</span>
            </div>
            <div class="item">
              <span class="item-label">الدخل المتبقي</span>
              <span class="item-value" style="color: ${Number(remainingIncome) >= 2000 ? '#22c55e' : '#ef4444'};">${safeRemainingIncome} ر.س</span>
            </div>
          </div>
        </div>

        <div class="eligibility ${isEligible ? 'eligible' : 'not-eligible'}">
          <strong style="font-size: 18px;">${isEligible ? '✓ مؤهل للتمويل' : '✗ غير مؤهل حالياً'}</strong>
          <p style="margin-top: 10px; color: #6b7280;">
            ${isEligible ? 'متوافق مع ' + safeEligibleCount + ' جهة تمويل' : 'يرجى مراجعة المتطلبات'}
          </p>
        </div>

        <div class="footer">
          <p>هذا التقرير للأغراض الإرشادية فقط ولا يمثل عرضاً رسمياً للتمويل</p>
          <p>يرجى التواصل مع جهة التمويل للحصول على عرض رسمي</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Save report function
  const handleSaveReport = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يرجى تسجيل الدخول لحفظ التقرير",
        variant: "destructive",
      });
      return;
    }

    if (!reportName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم للتقرير",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('saved_financing_reports').insert({
      user_id: user.id,
      report_name: reportName,
      property_price: propertyPrice,
      down_payment: downPayment,
      loan_amount: loanAmount,
      tenure,
      interest_rate: interestRate,
      monthly_payment: monthlyPayment,
      total_payment: totalPayment,
      total_interest: totalInterest,
      salary,
      other_income: otherIncome,
      total_obligations: calculatedObligations,
      dti,
      remaining_income: remainingIncome,
      age,
      sector,
      is_eligible: isEligible,
      eligible_banks_count: eligibleOffers.length,
      has_personal_loan: hasPersonalLoan,
      personal_loan_amount: personalLoanAmount,
      has_car_loan: hasCarLoan,
      car_loan_installment: carLoanInstallment,
      has_credit_card: hasCreditCard,
      credit_card_limit: creditCardLimit,
    });

    setSaving(false);
    setSaveDialogOpen(false);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التقرير",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ التقرير بنجاح",
      });
      setReportName("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="bg-primary/5 border-b border-border">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">التمويل العقاري</h1>
              <p className="text-muted-foreground text-lg">
                احسب تمويلك العقاري بناءً على راتبك والتزاماتك وقارن بين أفضل عروض البنوك وشركات التمويل العقاري
              </p>
            </div>
            <div className="flex gap-3">
              {user && (
                <Button variant="outline" onClick={() => navigate('/saved-reports')} className="gap-2">
                  <FolderOpen className="w-4 h-4" />
                  التقارير المحفوظة
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <Tabs defaultValue="calculator" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="calculator">حاسبة التمويل</TabsTrigger>
            <TabsTrigger value="eligibility">الأهلية</TabsTrigger>
            <TabsTrigger value="offers">عروض التمويل</TabsTrigger>
            <TabsTrigger value="add-offer">
              <Plus className="w-4 h-4 ml-1" />
              أضف عرض
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Calculator Form */}
              <div className="space-y-6">
                {/* Property Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      تفاصيل العقار
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Property Price */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>سعر العقار</Label>
                        <span className="text-primary font-bold">{formatPrice(propertyPrice)} ر.س</span>
                      </div>
                      <Slider
                        value={[propertyPrice]}
                        onValueChange={(v) => {
                          setPropertyPrice(v[0]);
                          setDownPayment(Math.max(v[0] * 0.1, downPayment));
                        }}
                        min={100000}
                        max={10000000}
                        step={50000}
                      />
                    </div>

                    {/* Down Payment */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>الدفعة الأولى ({downPaymentPercentage}%)</Label>
                        <span className="text-primary font-bold">{formatPrice(downPayment)} ر.س</span>
                      </div>
                      <Slider
                        value={[downPayment]}
                        onValueChange={(v) => setDownPayment(v[0])}
                        min={propertyPrice * 0.1}
                        max={propertyPrice * 0.5}
                        step={10000}
                      />
                    </div>

                    {/* Tenure */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>مدة التمويل</Label>
                        <span className="text-primary font-bold">{tenure} سنة</span>
                      </div>
                      <Slider
                        value={[tenure]}
                        onValueChange={(v) => setTenure(v[0])}
                        min={5}
                        max={Math.min(30, maxTenureByAge)}
                        step={1}
                      />
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>معدل الربح السنوي</Label>
                        <span className="text-primary font-bold">{interestRate}%</span>
                      </div>
                      <Slider
                        value={[interestRate]}
                        onValueChange={(v) => setInterestRate(v[0])}
                        min={3}
                        max={8}
                        step={0.1}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Financial Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      البيانات المالية
                    </CardTitle>
                    <CardDescription>
                      أدخل بياناتك المالية لحساب الأهلية بدقة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Age */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          العمر
                        </Label>
                        <span className="text-primary font-bold">{age} سنة</span>
                      </div>
                      <Slider
                        value={[age]}
                        onValueChange={(v) => setAge(v[0])}
                        min={21}
                        max={55}
                        step={1}
                      />
                    </div>

                    {/* Sector */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        قطاع العمل
                      </Label>
                      <div className="flex gap-2">
                        <Button 
                          variant={sector === 'government' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSector('government')}
                        >
                          حكومي
                        </Button>
                        <Button 
                          variant={sector === 'private' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSector('private')}
                        >
                          خاص
                        </Button>
                        <Button 
                          variant={sector === 'military' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSector('military')}
                        >
                          عسكري
                        </Button>
                      </div>
                    </div>

                    {/* Salary */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          الراتب الشهري
                        </Label>
                        <span className="text-primary font-bold">{formatPrice(salary)} ر.س</span>
                      </div>
                      <Slider
                        value={[salary]}
                        onValueChange={(v) => setSalary(v[0])}
                        min={3000}
                        max={100000}
                        step={500}
                      />
                      <Input
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>

                    {/* Other Income */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          دخل إضافي (اختياري)
                        </Label>
                        <span className="text-primary font-bold">{formatPrice(otherIncome)} ر.س</span>
                      </div>
                      <Slider
                        value={[otherIncome]}
                        onValueChange={(v) => setOtherIncome(v[0])}
                        min={0}
                        max={50000}
                        step={500}
                      />
                    </div>

                    {/* Monthly Obligations Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <Label className="font-bold text-base">الالتزامات الشهرية</Label>
                      
                      {/* Personal Loan Toggle */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            قرض شخصي (5 سنوات)
                          </Label>
                          <Button 
                            variant={hasPersonalLoan ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setHasPersonalLoan(!hasPersonalLoan)}
                          >
                            {hasPersonalLoan ? 'مفعل' : 'غير مفعل'}
                          </Button>
                        </div>
                        {hasPersonalLoan && (
                          <div className="space-y-3 pr-6 border-r-2 border-primary/20">
                            <div className="flex justify-between text-sm">
                              <span>مبلغ القرض</span>
                              <span className="text-primary font-bold">{formatPrice(personalLoanAmount)} ر.س</span>
                            </div>
                            <Slider
                              value={[personalLoanAmount]}
                              onValueChange={(v) => setPersonalLoanAmount(v[0])}
                              min={10000}
                              max={300000}
                              step={5000}
                            />
                            <div className="flex justify-between text-sm">
                              <span>معدل الربح</span>
                              <span className="text-primary font-bold">{personalLoanRate}%</span>
                            </div>
                            <Slider
                              value={[personalLoanRate]}
                              onValueChange={(v) => setPersonalLoanRate(v[0])}
                              min={3}
                              max={10}
                              step={0.5}
                            />
                            <div className="bg-muted p-2 rounded text-sm">
                              القسط الشهري: <strong className="text-primary">{formatPrice(personalLoanInstallment)} ر.س</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Car Loan Toggle */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            قسط سيارة
                          </Label>
                          <Button 
                            variant={hasCarLoan ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setHasCarLoan(!hasCarLoan)}
                          >
                            {hasCarLoan ? 'مفعل' : 'غير مفعل'}
                          </Button>
                        </div>
                        {hasCarLoan && (
                          <div className="space-y-3 pr-6 border-r-2 border-primary/20">
                            <div className="flex justify-between text-sm">
                              <span>القسط الشهري</span>
                              <span className="text-primary font-bold">{formatPrice(carLoanInstallment)} ر.س</span>
                            </div>
                            <Slider
                              value={[carLoanInstallment]}
                              onValueChange={(v) => setCarLoanInstallment(v[0])}
                              min={500}
                              max={10000}
                              step={100}
                            />
                          </div>
                        )}
                      </div>

                      {/* Credit Card Toggle */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            بطاقة ائتمان
                          </Label>
                          <Button 
                            variant={hasCreditCard ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setHasCreditCard(!hasCreditCard)}
                          >
                            {hasCreditCard ? 'مفعل' : 'غير مفعل'}
                          </Button>
                        </div>
                        {hasCreditCard && (
                          <div className="space-y-3 pr-6 border-r-2 border-primary/20">
                            <div className="flex justify-between text-sm">
                              <span>الحد الائتماني</span>
                              <span className="text-primary font-bold">{formatPrice(creditCardLimit)} ر.س</span>
                            </div>
                            <Slider
                              value={[creditCardLimit]}
                              onValueChange={(v) => setCreditCardLimit(v[0])}
                              min={5000}
                              max={100000}
                              step={5000}
                            />
                            <div className="bg-muted p-2 rounded text-sm">
                              الالتزام الشهري (5%): <strong className="text-primary">{formatPrice(creditCardMonthlyObligation)} ر.س</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Other Obligations */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            التزامات أخرى
                          </Label>
                          <span className="text-primary font-bold">{formatPrice(monthlyObligations)} ر.س</span>
                        </div>
                        <Slider
                          value={[monthlyObligations]}
                          onValueChange={(v) => setMonthlyObligations(v[0])}
                          min={0}
                          max={totalIncome * 0.3}
                          step={100}
                        />
                        <p className="text-xs text-muted-foreground">
                          أقساط إضافية غير مذكورة أعلاه
                        </p>
                      </div>

                      {/* Total Obligations Summary */}
                      <div className="bg-primary/5 p-4 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">إجمالي الالتزامات (بدون التمويل العقاري)</span>
                          <span className="text-lg font-bold text-primary">{formatPrice(calculatedObligations)} ر.س</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="space-y-6" ref={printRef}>
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-primary-foreground/80 mb-2">القسط الشهري</p>
                      <p className="text-4xl font-bold">{formatPrice(monthlyPayment)} ر.س</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handlePrint} variant="outline" className="flex-1">
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة التقرير
                  </Button>
                  
                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" className="flex-1" disabled={!user}>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ التقرير
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>حفظ التقرير</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="report-name">اسم التقرير</Label>
                          <Input
                            id="report-name"
                            placeholder="مثال: تمويل فيلا الرياض"
                            value={reportName}
                            onChange={(e) => setReportName(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleSaveReport} disabled={saving} className="w-full">
                          {saving ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
                      سجل الدخول
                    </Button>
                    {" "}لحفظ التقارير
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Banknote className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">مبلغ التمويل</p>
                        <p className="font-bold">{formatPrice(loanAmount)} ر.س</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Percent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
                        <p className="font-bold">{formatPrice(totalInterest)} ر.س</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">عدد الأقساط</p>
                        <p className="font-bold">{numberOfPayments} قسط</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي المبلغ</p>
                        <p className="font-bold">{formatPrice(totalPayment)} ر.س</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ملخص الوضع المالي</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>نسبة الاستقطاع (DTI)</span>
                        <span className={dti > 65 ? "text-destructive" : "text-green-600"}>
                          {dti.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={Math.min(dti, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        الحد الأقصى المسموح به 65%
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي الدخل</p>
                        <p className="font-bold text-green-600">{formatPrice(totalIncome)} ر.س</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي الالتزامات</p>
                        <p className="font-bold text-destructive">{formatPrice(totalObligationsWithLoan)} ر.س</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">الدخل المتبقي</p>
                        <p className={`font-bold text-lg ${remainingIncome >= 2000 ? "text-green-600" : "text-destructive"}`}>
                          {formatPrice(remainingIncome)} ر.س
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Eligibility Status */}
                <Card className={isEligible ? "border-green-500" : "border-destructive"}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {isEligible ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                      )}
                      <div>
                        <p className="font-bold text-lg">
                          {isEligible ? "مؤهل للتمويل" : "غير مؤهل حالياً"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isEligible 
                            ? `متوافق مع ${eligibleOffers.length} جهة تمويل`
                            : "راجع المتطلبات أدناه"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {eligibilityChecks.map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {check.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                          <span className={check.passed ? "" : "text-destructive"}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="eligibility">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>شروط التمويل العقاري</CardTitle>
                  <CardDescription>
                    الشروط العامة للحصول على تمويل عقاري في المملكة
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">العمر</p>
                      <p className="text-sm text-muted-foreground">
                        من 21 إلى 60 سنة (55 للعسكريين)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Banknote className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">الحد الأدنى للراتب</p>
                      <p className="text-sm text-muted-foreground">
                        يختلف حسب الجهة (4,000 - 6,000 ر.س)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">مدة الخدمة</p>
                      <p className="text-sm text-muted-foreground">
                        3 أشهر للقطاع الحكومي، 6 أشهر للخاص
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Percent className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">نسبة الاستقطاع</p>
                      <p className="text-sm text-muted-foreground">
                        لا تتجاوز 65% من الراتب
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">الدفعة الأولى</p>
                      <p className="text-sm text-muted-foreground">
                        10% كحد أدنى من قيمة العقار
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>المستندات المطلوبة</CardTitle>
                  <CardDescription>
                    الوثائق اللازمة لتقديم طلب التمويل
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "صورة الهوية الوطنية سارية المفعول",
                    "خطاب تعريف من جهة العمل",
                    "كشف حساب بنكي آخر 3 أشهر",
                    "صورة من صك العقار",
                    "تقييم العقار من مقيم معتمد",
                    "رخصة البناء (للعقارات الجديدة)",
                    "عقد البيع المبدئي",
                    "سجل الأسرة (للمتزوجين)",
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="offers">
            {/* Notice Banner */}
            <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">ملاحظة هامة</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    عروض التمويل من البنوك وشركات التمويل العقاري تخضع للمراجعة والموافقة قبل نشرها. يمكنك إضافة عرض جديد من تبويب "أضف عرض".
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {eligibleOffers.length > 0 ? (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                    {eligibleOffers.length} جهة تمويل متوافقة مع بياناتك المالية
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    لا توجد جهات متوافقة - راجع بياناتك المالية
                  </Badge>
                )}
                
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Landmark className="w-3 h-3" />
                    بنوك
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <BadgeDollarSign className="w-3 h-3" />
                    شركات تمويل
                  </Badge>
                </div>
              </div>
              
              <Button onClick={() => setAddOfferOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة عرض تمويلي جديد
              </Button>
            </div>
            
            {loadingOffers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {offers.map((offer) => {
                  const isCompatible = eligibleOffers.some(eo => eo.id === offer.id);
                  return (
                    <FinancingOfferCard
                      key={offer.id}
                      offer={offer}
                      isCompatible={isCompatible}
                      formatPrice={formatPrice}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add-offer">
            <div className="max-w-2xl mx-auto">
              {/* Notice Banner */}
              <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">ملاحظة هامة</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      جميع العروض التمويلية من البنوك وشركات التمويل العقاري تخضع للمراجعة والموافقة من قبل الإدارة قبل نشرها في الموقع.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    إضافة عرض تمويلي جديد
                  </CardTitle>
                  <CardDescription>
                    أضف عرض تمويلي من بنك أو شركة تمويل عقاري. سيتم مراجعة العرض قبل نشره.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!user ? (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">يجب تسجيل الدخول لإضافة عرض تمويلي</p>
                      <Button onClick={() => navigate('/auth')}>تسجيل الدخول</Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>اسم الشركة / البنك *</Label>
                          <Input
                            placeholder="اسم جهة التمويل"
                            value={newOffer.company_name}
                            onChange={(e) => setNewOffer({ ...newOffer, company_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>نوع الجهة</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={newOffer.company_type === 'bank' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setNewOffer({ ...newOffer, company_type: 'bank' })}
                              className="flex-1"
                            >
                              <Landmark className="w-4 h-4 ml-1" />
                              بنك
                            </Button>
                            <Button
                              type="button"
                              variant={newOffer.company_type === 'financing_company' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setNewOffer({ ...newOffer, company_type: 'financing_company' })}
                              className="flex-1"
                            >
                              <BadgeDollarSign className="w-4 h-4 ml-1" />
                              شركة تمويل
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>معدل الربح السنوي (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newOffer.interest_rate}
                            onChange={(e) => setNewOffer({ ...newOffer, interest_rate: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>أقصى مدة تمويل (سنوات)</Label>
                          <Input
                            type="number"
                            value={newOffer.max_tenure}
                            onChange={(e) => setNewOffer({ ...newOffer, max_tenure: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>أقصى مبلغ تمويل (ر.س)</Label>
                          <Input
                            type="number"
                            value={newOffer.max_amount}
                            onChange={(e) => setNewOffer({ ...newOffer, max_amount: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الحد الأدنى للراتب (ر.س)</Label>
                          <Input
                            type="number"
                            value={newOffer.min_salary}
                            onChange={(e) => setNewOffer({ ...newOffer, min_salary: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>وصف العرض</Label>
                        <Textarea
                          placeholder="وصف مختصر للعرض التمويلي..."
                          value={newOffer.description}
                          onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>رقم الهاتف</Label>
                          <Input
                            placeholder="920000000"
                            value={newOffer.phone}
                            onChange={(e) => setNewOffer({ ...newOffer, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>البريد الإلكتروني</Label>
                          <Input
                            type="email"
                            placeholder="info@example.com"
                            value={newOffer.email}
                            onChange={(e) => setNewOffer({ ...newOffer, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الموقع الإلكتروني</Label>
                          <Input
                            placeholder="https://..."
                            value={newOffer.website}
                            onChange={(e) => setNewOffer({ ...newOffer, website: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>مميزات العرض</Label>
                        {newOffer.features.map((feature, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              placeholder={`ميزة ${idx + 1}`}
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...newOffer.features];
                                newFeatures[idx] = e.target.value;
                                setNewOffer({ ...newOffer, features: newFeatures });
                              }}
                            />
                            {idx === newOffer.features.length - 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setNewOffer({ ...newOffer, features: [...newOffer.features, ""] })}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button onClick={handleAddOffer} disabled={submitting} className="w-full">
                        {submitting ? "جاري الإرسال..." : "إرسال العرض للمراجعة"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Financing;
