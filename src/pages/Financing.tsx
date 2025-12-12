import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Banknote, Percent, Calendar, CheckCircle, Building2, FileText, Phone } from "lucide-react";

const banks = [
  {
    name: "البنك الأهلي السعودي",
    logo: "🏦",
    rate: 4.5,
    maxTenure: 25,
    maxAmount: 5000000,
    features: ["تمويل يصل إلى 90%", "فترة سداد مرنة", "إعفاء من الرسوم الإدارية"],
  },
  {
    name: "مصرف الراجحي",
    logo: "🏛️",
    rate: 4.2,
    maxTenure: 30,
    maxAmount: 7000000,
    features: ["متوافق مع الشريعة", "موافقة سريعة", "تأمين مجاني"],
  },
  {
    name: "بنك الرياض",
    logo: "🏢",
    rate: 4.8,
    maxTenure: 25,
    maxAmount: 4000000,
    features: ["أقساط ثابتة", "خدمة عملاء متميزة", "تحويل الراتب اختياري"],
  },
  {
    name: "البنك السعودي الفرنسي",
    logo: "🏤",
    rate: 4.6,
    maxTenure: 20,
    maxAmount: 3500000,
    features: ["معدل ربح تنافسي", "إجراءات سريعة", "تمويل بدون كفيل"],
  },
];

const Financing = () => {
  const [propertyPrice, setPropertyPrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(200000);
  const [tenure, setTenure] = useState(20);
  const [interestRate, setInterestRate] = useState(4.5);

  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = tenure * 12;
  
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

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
            احسب تمويلك العقاري وقارن بين أفضل عروض البنوك
          </p>
        </div>
      </div>

      <div className="container py-12">
        <Tabs defaultValue="calculator" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calculator">حاسبة التمويل</TabsTrigger>
            <TabsTrigger value="banks">عروض البنوك</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Calculator Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    حاسبة التمويل العقاري
                  </CardTitle>
                  <CardDescription>
                    أدخل تفاصيل التمويل لحساب القسط الشهري
                  </CardDescription>
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
                      onValueChange={(v) => setPropertyPrice(v[0])}
                      min={100000}
                      max={10000000}
                      step={50000}
                    />
                    <Input
                      type="number"
                      value={propertyPrice}
                      onChange={(e) => setPropertyPrice(Number(e.target.value))}
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
                      max={30}
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

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">ملخص التمويل</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">سعر العقار</span>
                        <span className="font-medium">{formatPrice(propertyPrice)} ر.س</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">الدفعة الأولى</span>
                        <span className="font-medium">{formatPrice(downPayment)} ر.س</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">مبلغ التمويل</span>
                        <span className="font-medium">{formatPrice(loanAmount)} ر.س</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">القسط الشهري</span>
                        <span className="font-bold text-primary">{formatPrice(monthlyPayment)} ر.س</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="banks">
            <div className="grid gap-6 md:grid-cols-2">
              {banks.map((bank) => (
                <Card key={bank.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-3xl">
                        {bank.logo}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{bank.name}</CardTitle>
                        <CardDescription>معدل ربح يبدأ من {bank.rate}%</CardDescription>
                      </div>
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
                      <div className="flex items-center gap-2 col-span-2">
                        <Banknote className="w-4 h-4 text-muted-foreground" />
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
                      <Button className="flex-1" variant="outline">
                        <FileText className="w-4 h-4 ml-2" />
                        تفاصيل أكثر
                      </Button>
                      <Button className="flex-1">
                        <Phone className="w-4 h-4 ml-2" />
                        تواصل معنا
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Financing;
