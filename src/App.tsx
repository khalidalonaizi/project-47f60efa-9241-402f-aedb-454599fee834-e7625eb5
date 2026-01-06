import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import Admin from "./pages/Admin";
import PropertyDetails from "./pages/PropertyDetails";
import NeighborhoodGuide from "./pages/NeighborhoodGuide";
import Financing from "./pages/Financing";
import SavedReports from "./pages/SavedReports";
import Messages from "./pages/Messages";
import PriceAlerts from "./pages/PriceAlerts";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/my-properties" element={<MyProperties />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/neighborhood-guide" element={<NeighborhoodGuide />} />
            <Route path="/financing" element={<Financing />} />
            <Route path="/saved-reports" element={<SavedReports />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/price-alerts" element={<PriceAlerts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
