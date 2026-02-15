import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedDashboardRouteProps {
  allowedAccountTypes: string[];
  children: React.ReactNode;
}

const ProtectedDashboardRoute = ({ allowedAccountTypes, children }: ProtectedDashboardRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    const checkAccountType = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("user_id", user.id)
        .maybeSingle();

      const type = data?.account_type || "individual";
      setAccountType(type);

      if (!allowedAccountTypes.includes(type)) {
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية الوصول لهذه الصفحة",
          variant: "destructive",
        });
        // Redirect to the correct dashboard
        const dashboardMap: Record<string, string> = {
          individual: "/dashboard/user",
          real_estate_office: "/dashboard/office",
          financing_provider: "/dashboard/financing",
          appraiser: "/dashboard/appraiser",
          developer: "/dashboard/developer",
        };
        navigate(dashboardMap[type] || "/dashboard/user");
      }
      setChecking(false);
    };

    checkAccountType();
  }, [user, authLoading, allowedAccountTypes, navigate, toast]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!accountType || !allowedAccountTypes.includes(accountType)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedDashboardRoute;
