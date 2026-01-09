import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { Building2, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';

const SITE_NAME = 'عقار السعودية';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'البريد الإلكتروني غير صالح' }),
});

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }),
  email: z.string().trim().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
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

  // Listen for PASSWORD_RECOVERY event from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetMode(true);
      }
    });

    // Also check URL hash for recovery token (Supabase sends tokens in hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setIsResetMode(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !isResetMode) {
      navigate('/');
    }
  }, [user, navigate, isResetMode]);

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
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      let message = 'حدث خطأ أثناء تسجيل الدخول';
      if (error.message.includes('Invalid login credentials')) {
        message = 'بيانات الدخول غير صحيحة';
      }
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'مرحباً!',
        description: 'تم تسجيل الدخول بنجاح',
      });
      navigate('/');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تسجيل الدخول عبر جوجل',
        variant: 'destructive',
      });
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
        confirmPassword: signupConfirmPassword 
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
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);

    if (error) {
      let message = 'حدث خطأ أثناء إنشاء الحساب';
      if (error.message.includes('already registered')) {
        message = 'هذا البريد الإلكتروني مسجل بالفعل';
      }
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: `مرحباً بك في ${SITE_NAME}! 🎉`,
        description: `تم إنشاء حسابك بنجاح. تم إرسال رابط تأكيد من ${SITE_NAME} إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد لتفعيل حسابك.`,
        duration: 8000,
      });
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupName('');
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
        title: `تم الإرسال من ${SITE_NAME}! 📧`,
        description: `تم إرسال رابط إعادة تعيين كلمة المرور من ${SITE_NAME} إلى بريدك الإلكتروني`,
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
      } else if (error.message.includes('same password')) {
        errorMessage = 'لا يمكن استخدام نفس كلمة المرور القديمة';
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
        description: `تم إعادة تعيين كلمة المرور بنجاح في ${SITE_NAME}`,
      });
    }
  };

  // Show reset password form if coming from reset link
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
              {resetSuccess 
                ? `يمكنك الآن تسجيل الدخول في ${SITE_NAME} بكلمة المرور الجديدة`
                : 'أدخل كلمة المرور الجديدة'}
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
                    <p className="text-sm text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين من {SITE_NAME}</p>
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
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">أو</span>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    تسجيل الدخول عبر جوجل
                  </Button>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
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
                  {isLoading ? 'جاري التحميل...' : 'إنشاء حساب'}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">أو</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  التسجيل عبر جوجل
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