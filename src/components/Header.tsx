import { Button } from "@/components/ui/button";
import { Building2, Heart, Menu, Phone, User, X, LogOut, Shield, Plus, List, MessageSquare, LayoutDashboard, Moon, Sun, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/NotificationBell";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [accountType, setAccountType] = useState<string | null>(null);

  // Get user account type for dashboard routing
  useEffect(() => {
    const fetchAccountType = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("user_id", user.id)
        .single();
      if (data?.account_type) {
        setAccountType(data.account_type);
      }
    };
    fetchAccountType();
  }, [user]);

  // Get dashboard route based on account type
  const getDashboardRoute = () => {
    switch (accountType) {
      case "real_estate_office":
        return "/dashboard/office";
      case "financing_provider":
        return "/dashboard/financing";
      case "appraiser":
        return "/dashboard/appraiser";
      case "developer":
        return "/dashboard/developer";
      default:
        return "/dashboard/user";
    }
  };

  // عدد الرسائل غير المقروءة
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user!.id)
        .eq("is_read", false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const navLinks = [
    { label: "للبيع", href: "/search?type=sale" },
    { label: "للإيجار", href: "/search?type=rent" },
    { label: "البحث المتقدم", href: "/search" },
    { label: "التمويل العقاري", href: "/financing" },
    { label: "دليل الأحياء", href: "/neighborhood-guide" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">عقارات</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:flex"
              title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="hidden md:flex"
              title={language === "ar" ? "English" : "العربية"}
            >
              <Globe className="w-4 h-4" />
            </Button>

            <a 
              href="tel:+966500000000" 
              className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{language === "ar" ? "اتصل بنا" : "Contact Us"}</span>
            </a>
            
            {user && (
              <>
                <NotificationBell />
                <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
                  <Link to="/favorites">
                    <Heart className="w-5 h-5" />
                  </Link>
                </Button>
              </>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden md:flex gap-2">
                    <User className="w-4 h-4" />
                    حسابي
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardRoute()} className="flex items-center gap-2 cursor-pointer text-primary font-medium">
                      <LayoutDashboard className="w-4 h-4" />
                      لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-properties" className="flex items-center gap-2 cursor-pointer">
                      <List className="w-4 h-4" />
                      إعلاناتي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/add-property" className="flex items-center gap-2 cursor-pointer">
                      <Plus className="w-4 h-4" />
                      إضافة إعلان
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        الرسائل
                      </span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-primary">
                          <Shield className="w-4 h-4" />
                          لوحة الإدارة
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" className="hidden md:flex gap-2" asChild>
                <Link to="/auth">
                  <User className="w-4 h-4" />
                  تسجيل الدخول
                </Link>
              </Button>
            )}

            <Button variant="hero" className="hidden sm:flex" asChild>
              <Link to={user ? "/add-property" : "/auth"}>
                أضف إعلانك
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="py-2 px-4 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {user && (
                <>
                  <Link
                    to={getDashboardRoute()}
                    className="py-2 px-4 text-primary font-medium hover:bg-accent rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    لوحة التحكم
                  </Link>
                  <Link
                    to="/my-properties"
                    className="py-2 px-4 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    إعلاناتي
                  </Link>
                  <Link
                    to="/profile"
                    className="py-2 px-4 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    الملف الشخصي
                  </Link>
                  <Link
                    to="/messages"
                    className="py-2 px-4 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors flex items-center justify-between"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>الرسائل</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    to="/favorites"
                    className="py-2 px-4 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    المفضلة
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="py-2 px-4 text-primary hover:bg-accent rounded-lg transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      لوحة الإدارة
                    </Link>
                  )}
                </>
              )}
              
              {/* Mobile Theme & Language Toggles */}
              <div className="flex gap-2 px-4 mt-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === "dark" ? "نهاري" : "ليلي"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                >
                  <Globe className="w-4 h-4" />
                  {language === "ar" ? "English" : "العربية"}
                </Button>
              </div>

              <div className="flex gap-2 mt-4 px-4">
                {user ? (
                  <>
                    <Button variant="outline" className="flex-1" onClick={handleSignOut}>
                      تسجيل الخروج
                    </Button>
                    <Button variant="hero" className="flex-1" asChild>
                      <Link to="/add-property" onClick={() => setIsMenuOpen(false)}>
                        أضف إعلانك
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        تسجيل الدخول
                      </Link>
                    </Button>
                    <Button variant="hero" className="flex-1" asChild>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        أضف إعلانك
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
