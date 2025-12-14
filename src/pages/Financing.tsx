import { useState, useMemo } from "react";
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
  Briefcase
} from "lucide-react";

const banks = [
  {
    name: "البنك الأهلي السعودي",
    logo: "🏦",
    rate: 4.5,
    maxTenure: 25,
    maxAmount: 5000000,
    minSalary: 5000,
    maxDti: 65,
    features: ["تمويل يصل إلى 90%", "فترة سداد مرنة", "إعفاء من الرسوم الإدارية"],
  },
  {
    name: "مصرف الراجحي",
    logo: "🏛️",
    rate: 4.2,
    maxTenure: 30,
    maxAmount: 7000000,
    minSalary: 4000,
    maxDti: 60,
    features: ["متوافق مع الشريعة", "موافقة سريعة", "تأمين مجاني"],
  },
  {
    name: "بنك الرياض",
    logo: "🏢",
    rate: 4.8,
    maxTenure: 25,
    maxAmount: 4000000,
    minSalary: 6000,
    maxDti: 55,
    features: ["أقساط ثابتة", "خدمة عملاء متميزة", "تحويل الراتب اختياري"],
  },
  {
    name: "البنك السعودي الفرنسي",
    logo: "🏤",
    rate: 4.6,
    maxTenure: 20,
    maxAmount: 3500000,
    minSalary: 5500,
    maxDti: 50,
    features: ["معدل ربح تنافسي", "إجراءات سريعة", "تمويل بدون كفيل"],
  },
];

const Financing = () => {
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

  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = tenure * 12;
  
  const monthlyPayment = useMemo(() => {
    if (monthlyRate === 0) return loanAmount / numberOfPayments;
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }, [loanAmount, monthlyRate, numberOfPayments]);
  
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  // Customer calculations
  const totalIncome = salary + otherIncome;
  const totalObligationsWithLoan = monthlyObligations + monthlyPayment;
  const dti = (totalObligationsWithLoan / totalIncome) * 100; // Debt-to-Income ratio
  const remainingIncome = totalIncome - totalObligationsWithLoan;
  const maxRetirementAge = sector === 'military' ? 55 : 60;
  const maxTenureByAge = Math.max(5, maxRetirementAge - age);

  // Eligibility checks
  const eligibilityChecks = useMemo(() => {
    const checks = [];
    
    // Salary check
    if (salary >= 5000) {
      checks.push({ label: "الراتب يتجاوز الحد الأدنى", passed: true });
    } else {
      checks.push({ label: "الراتب أقل من الحد الأدنى (5,000 ر.س)", passed: false });
    }
    
    // DTI check
    if (dti <= 65) {
      checks.push({ label: `نسبة الاستقطاع ${dti.toFixed(1)}% (مقبولة)`, passed: true });
    } else {
      checks.push({ label: `نسبة الاستقطاع ${dti.toFixed(1)}% (تتجاوز 65%)`, passed: false });
    }
    
    // Age check
    if (tenure <= maxTenureByAge) {
      checks.push({ label: "مدة التمويل مناسبة لعمرك", passed: true });
    } else {
      checks.push({ label: `الحد الأقصى للتمويل ${maxTenureByAge} سنة بناءً على عمرك`, passed: false });
    }
    
    // Down payment check
    const downPaymentPercent = (downPayment / propertyPrice) * 100;
    if (downPaymentPercent >= 10) {
      checks.push({ label: `الدفعة الأولى ${downPaymentPercent.toFixed(0)}% (مقبولة)`, passed: true });
    } else {
      checks.push({ label: "الدفعة الأولى يجب أن تكون 10% على الأقل", passed: false });
    }
    
    // Remaining income check
    if (remainingIncome >= 2000) {
      checks.push({ label: "الدخل المتبقي كافٍ للمعيشة", passed: true });
    } else {
      checks.push({ label: "الدخل المتبقي أقل من 2,000 ر.س", passed: false });
    }
    
    return checks;
  }, [salary, dti, tenure, maxTenureByAge, downPayment, propertyPrice, remainingIncome]);

  const isEligible = eligibilityChecks.every(check => check.passed);
  const eligibleBanks = banks.filter(bank => 
    salary >= bank.minSalary && 
    dti <= bank.maxDti && 
    tenure <= bank.maxTenure &&
    loanAmount <= bank.maxAmount
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(Math.round(price));
  };

  const downPaymentPercentage = Math.round((downPayment / propertyPrice) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="bg-primary/5 border-b border-border">
        <div className="container py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">التمويل العقاري</h1>
          <p className="text-muted-foreground text-lg">
            احسب تمويلك العقاري بناءً على راتبك والتزاماتك وقارن بين أفضل عروض البنوك
          </p>
        </div>
      </div>

      <div className="container py-12">
        <Tabs defaultValue="calculator" className="space-y-8">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="calculator">حاسبة التمويل</TabsTrigger>
            <TabsTrigger value="eligibility">الأهلية</TabsTrigger>
            <TabsTrigger value="banks">عروض البنوك</TabsTrigger>
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

                    {/* Monthly Obligations */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          الالتزامات الشهرية
                        </Label>
                        <span className="text-primary font-bold">{formatPrice(monthlyObligations)} ر.س</span>
                      </div>
                      <Slider
                        value={[monthlyObligations]}
                        onValueChange={(v) => setMonthlyObligations(v[0])}
                        min={0}
                        max={totalIncome * 0.5}
                        step={100}
                      />
                      <p className="text-xs text-muted-foreground">
                        تشمل أقساط السيارة، البطاقات الائتمانية، القروض الأخرى
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="space-y-6">
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-primary-foreground/80 mb-2">القسط الشهري</p>
                      <p className="text-4xl font-bold">{formatPrice(monthlyPayment)} ر.س</p>
                    </div>
                  </CardContent>
                </Card>

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
                        <span className={dti > 65 ? "text-destructive" : "text-success"}>
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
                        <p className="font-bold text-success">{formatPrice(totalIncome)} ر.س</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي الالتزامات</p>
                        <p className="font-bold text-destructive">{formatPrice(totalObligationsWithLoan)} ر.س</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">الدخل المتبقي</p>
                        <p className={`font-bold text-lg ${remainingIncome >= 2000 ? "text-success" : "text-destructive"}`}>
                          {formatPrice(remainingIncome)} ر.س
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Eligibility Status */}
                <Card className={isEligible ? "border-success" : "border-destructive"}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {isEligible ? (
                        <CheckCircle className="w-8 h-8 text-success" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                      )}
                      <div>
                        <p className="font-bold text-lg">
                          {isEligible ? "مؤهل للتمويل" : "غير مؤهل حالياً"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isEligible 
                            ? `متوافق مع ${eligibleBanks.length} بنك`
                            : "راجع المتطلبات أدناه"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {eligibilityChecks.map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {check.passed ? (
                            <CheckCircle className="w-4 h-4 text-success" />
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
                        يختلف حسب البنك (4,000 - 6,000 ر.س)
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
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="banks">
            <div className="mb-6">
              {eligibleBanks.length > 0 ? (
                <Badge variant="secondary" className="mb-4">
                  {eligibleBanks.length} بنك متوافق مع بياناتك المالية
                </Badge>
              ) : (
                <Badge variant="destructive" className="mb-4">
                  لا توجد بنوك متوافقة - راجع بياناتك المالية
                </Badge>
              )}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {banks.map((bank) => {
                const isCompatible = eligibleBanks.includes(bank);
                return (
                  <Card 
                    key={bank.name} 
                    className={`hover:shadow-lg transition-shadow ${!isCompatible ? 'opacity-60' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-3xl">
                            {bank.logo}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{bank.name}</CardTitle>
                            <CardDescription>معدل ربح يبدأ من {bank.rate}%</CardDescription>
                          </div>
                        </div>
                        {isCompatible && (
                          <Badge className="bg-success">متوافق</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-muted-foreground" />
                          <span>معدل الربح: {bank.rate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>حتى {bank.maxTenure} سنة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-muted-foreground" />
                          <span>حد أدنى: {formatPrice(bank.minSalary)} ر.س</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>تمويل يصل إلى {formatPrice(bank.maxAmount)} ر.س</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {bank.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1" variant="outline" disabled={!isCompatible}>
                          <FileText className="w-4 h-4 ml-2" />
                          تفاصيل أكثر
                        </Button>
                        <Button className="flex-1" disabled={!isCompatible}>
                          <Phone className="w-4 h-4 ml-2" />
                          تواصل معنا
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Financing;
