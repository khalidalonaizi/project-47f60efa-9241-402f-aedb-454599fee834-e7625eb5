import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Menu,
  LogOut,
  User,
  Moon,
  Sun,
  ChevronLeft,
  LucideIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  menuItems: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout = ({
  children,
  title,
  subtitle,
  menuItems,
  activeTab,
  onTabChange,
}: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
          <Home className="w-6 h-6" />
          <span>عقار السعودية</span>
        </Link>
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Bottom Section */}
      <div className="p-4 space-y-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-5 h-5" />
              الوضع النهاري
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              الوضع الليلي
            </>
          )}
        </Button>

        {/* Profile Link */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => navigate("/profile")}
        >
          <User className="w-5 h-5" />
          الملف الشخصي
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-64 lg:flex-col border-l">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src="" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Main Content */}
      <main className="lg:pr-64">
        <div className="container py-6 px-4 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 lg:hidden"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4 ml-1" />
              رجوع
            </Button>
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
