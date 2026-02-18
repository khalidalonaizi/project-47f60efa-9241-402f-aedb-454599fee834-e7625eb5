import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { Building2, Mail, Lock, User, ArrowRight, CheckCircle, Briefcase, Landmark, ClipboardCheck, HardHat } from 'lucide-react';

const SITE_NAME = 'عقار السعودية';

const accountTypes = [
  { value: 'individual', label: 'مستخدم فردي', icon: User, description: 'للبحث عن عقارات أو نشر إعلانات' },
  { value: 'real_estate_office', label: 'مكتب عقاري', icon: Building2, description: 'لإدارة العقارات والمكتب' },
  { value: 'financing_provider', label: 'جهة تمويلية', icon: Landmark, description: 'لنشر عروض التمويل العقاري' },
  { value: 'appraiser', label: 'مقيم عقاري', icon: ClipboardCheck, description: 'لتقديم خدمات التقييم العقاري' },
  { value: 'developer', label: 'مطوّر عقاري', icon: HardHat, description: 'لإدارة مشاريع التطوير العقاري' },
];

const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'البريد الإلكتروني غير صالح' }),
});

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }),
  email: z.string().trim().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
  confirmPassword: z.string(),
  accountType: z.enum(['individual', 'real_estate_office', 'financing_provider', 'appraiser', 'developer'], { 
    required_error: 'يرجى اختيار نوع الحساب' 
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isResetModeFromUrl = searchParams.get('reset') === 'true';
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupAccountType, setSignupAccountType] = useState<string>('individual');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetMode, setIsResetMode] = useState(isResetModeFromUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Listen for auth events (PASSWORD_RECOVERY, EMAIL_CONFIRMED)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetMode(true);
      }
      
      // Handle email confirmation - send welcome email
      if (event === 'SIGNED_IN' && session?.user) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlType = hashParams.get('type');
        if (urlType === 'signup' || urlType === 'email') {
          toast({
            title: 'تم تفعيل حسابك بنجاح! 🎉',
            description: 'مرحباً بك في عقار السعودية. يمكنك الآن استخدام جميع خدمات المنصة.',
            duration: 8000,
          });
          
          // Send welcome email
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || '',
              },
            });
          } catch (err) {
            console.error('Failed to send welcome email:', err);
          }
        }
      }
    });

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setIsResetMode(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !isResetMode) {
      // Redirect to homepage after login
      const redirectTo = searchParams.get('redirect');
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/');
      }
    }
  }, [user, isResetMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
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
    const { error, data } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      let message = 'حدث خطأ أثناء تسجيل الدخول';
      if (error.message.includes('Invalid login credentials')) {
        message = 'بيانات الدخول غير صحيحة';
      } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        message = 'يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد للضغط على رابط التفعيل.';
      }
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive',
        duration: 8000,
      });
    } else {
      toast({
        title: 'مرحباً!',
        description: 'تم تسجيل الدخول بنجاح',
      });
      // useEffect will handle redirect to homepage
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      signupSchema.parse({ 
        fullName: signupName, 
        email: signupEmail, 
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        accountType: signupAccountType,
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
    const { error, data } = await signUp(signupEmail, signupPassword, signupName);
    
    if (!error && data?.user) {
      // Update profile with account type
      await supabase
        .from('profiles')
        .update({ account_type: signupAccountType as any })
        .eq('user_id', data.user.id);
    }
    
    setIsLoading(false);

    if (error) {
      let message = 'حدث خطأ أثناء إنشاء الحساب';
      if (error.message.includes('already registered')) {
        message = 'هذا البريد الإلكتروني مسجل بالفعل';
      } else if (error.message.includes('weak_password') || error.message.includes('weak') || error.message.includes('pwned')) {
        message = 'كلمة المرور ضعيفة أو مسربة في قوائم الاختراقات. يرجى اختيار كلمة مرور أقوى ومختلفة.';
      } else if (error.message.includes('signup_disabled') || error.message.includes('Signups not allowed')) {
        message = 'التسجيل معطل حالياً. يرجى التواصل مع الإدارة.';
      }
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: `مرحباً بك في ${SITE_NAME}! 🎉`,
        description: `تم إنشاء حسابك بنجاح. تم إرسال رابط تأكيد إلى بريدك الإلكتروني.`,
        duration: 8000,
      });
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupName('');
      setSignupAccountType('');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      forgotPasswordSchema.parse({ email: forgotPasswordEmail });
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
    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال رابط إعادة التعيين',
        variant: 'destructive',
      });
    } else {
      toast({
        title: `تم الإرسال! 📧`,
        description: `تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني`,
        duration: 6000,
      });
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      resetPasswordSchema.parse({ password: newPassword, confirmPassword: confirmNewPassword });
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
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsLoading(false);

    if (error) {
      let errorMessage = 'حدث خطأ أثناء إعادة تعيين كلمة المرور';
      if (error.message.includes('Auth session missing')) {
        errorMessage = 'انتهت صلاحية الرابط. يرجى طلب رابط إعادة تعيين جديد';
      }
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
    } else {
      setResetSuccess(true);
      toast({
        title: 'تم بنجاح! 🎉',
        description: `تم إعادة تعيين كلمة المرور بنجاح`,
      });
    }
  };

  // Reset password form
  if (isResetMode) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                {resetSuccess ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <Lock className="h-8 w-8 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {resetSuccess ? 'تم إعادة تعيين كلمة المرور' : 'إعادة تعيين كلمة المرور'}
            </CardTitle>
            <CardDescription>
              {resetSuccess ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة' : 'أدخل كلمة المرور الجديدة'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <Button 
                className="w-full" 
                variant="hero"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setIsResetMode(false);
                  navigate('/auth');
                }}
              >
                الذهاب لتسجيل الدخول
              </Button>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="كلمة المرور الجديدة"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                  <PasswordStrengthIndicator password={newPassword} />
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="تأكيد كلمة المرور الجديدة"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                  {isLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{SITE_NAME}</CardTitle>
          <CardDescription>سجل دخولك أو أنشئ حساباً جديداً</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">حساب جديد</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg">نسيت كلمة المرور؟</h3>
                    <p className="text-sm text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                  </div>
                  <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                    {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full gap-2"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setErrors({});
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    العودة لتسجيل الدخول
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="كلمة المرور"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                  </div>
                  <div className="text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setErrors({});
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                    {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                  </Button>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Account Type Selection */}
                <div className="space-y-2">
                  <Label>نوع الحساب</Label>
                  <Select value={signupAccountType} onValueChange={setSignupAccountType}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <div>
                              <span className="font-medium">{type.label}</span>
                              <p className="text-xs text-muted-foreground">{type.description}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.accountType && <p className="text-destructive text-sm">{errors.accountType}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="الاسم الكامل"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  {errors.fullName && <p className="text-destructive text-sm">{errors.fullName}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="كلمة المرور"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
                  <PasswordStrengthIndicator password={signupPassword} />
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="تأكيد كلمة المرور"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
                </div>
                
                <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                  {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
