import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedDashboardRoute from "@/components/ProtectedDashboardRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import MyProperties from "./pages/MyProperties";
import Admin from "./pages/Admin";
import FeaturedAdsManagement from "./pages/FeaturedAdsManagement";
import FinancingOffersManagement from "./pages/FinancingOffersManagement";
import FinancingOfferDetails from "./pages/FinancingOfferDetails";
import FinancingOfferPublicDetails from "./pages/FinancingOfferPublicDetails";
import EditFinancingOffer from "./pages/EditFinancingOffer";
import PropertyDetails from "./pages/PropertyDetails";
import NeighborhoodGuide from "./pages/NeighborhoodGuide";
import Financing from "./pages/Financing";
import SavedReports from "./pages/SavedReports";
import Messages from "./pages/Messages";
import PriceAlerts from "./pages/PriceAlerts";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import MapSearchPage from "./pages/MapSearchPage";
import NotFound from "./pages/NotFound";

// New pages
import Appraisers from "./pages/Appraisers";
import AppraiserDetails from "./pages/AppraiserDetails";

// Dashboard pages
import UserDashboard from "./pages/dashboard/UserDashboard";
import OfficeDashboard from "./pages/dashboard/OfficeDashboard";
import FinancingDashboard from "./pages/dashboard/FinancingDashboard";
import AppraiserDashboard from "./pages/dashboard/AppraiserDashboard";
import DeveloperDashboard from "./pages/dashboard/DeveloperDashboard";
import PropertyManagementRequests from "./pages/dashboard/PropertyManagementRequests";

// Other pages
import PropertyManagementRequest from "./pages/PropertyManagementRequest";

// New pages
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import PropertyEvaluation from "./pages/PropertyEvaluation";
import BrokerageServices from "./pages/BrokerageServices";
import TransactionGuarantee from "./pages/TransactionGuarantee";
import ExploreCities from "./pages/ExploreCities";
import Developers from "./pages/Developers";
import DeveloperDetails from "./pages/DeveloperDetails";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/map-search" element={<MapSearchPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/add-property" element={<AddProperty />} />
              <Route path="/edit-property/:id" element={<EditProperty />} />
              <Route path="/my-properties" element={<MyProperties />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/featured" element={<FeaturedAdsManagement />} />
              <Route path="/admin/financing-offers" element={<FinancingOffersManagement />} />
              <Route path="/admin/financing-offers/:id" element={<FinancingOfferDetails />} />
              <Route path="/admin/financing-offers/:id/edit" element={<EditFinancingOffer />} />
              <Route path="/financing/:id" element={<FinancingOfferPublicDetails />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard/user" element={<ProtectedDashboardRoute allowedAccountTypes={["individual"]}><UserDashboard /></ProtectedDashboardRoute>} />
              <Route path="/dashboard/office" element={<ProtectedDashboardRoute allowedAccountTypes={["real_estate_office"]}><OfficeDashboard /></ProtectedDashboardRoute>} />
              <Route path="/dashboard/office/property-management" element={<ProtectedDashboardRoute allowedAccountTypes={["real_estate_office"]}><PropertyManagementRequests /></ProtectedDashboardRoute>} />
              <Route path="/dashboard/financing" element={<ProtectedDashboardRoute allowedAccountTypes={["financing_provider"]}><FinancingDashboard /></ProtectedDashboardRoute>} />
              <Route path="/dashboard/appraiser" element={<ProtectedDashboardRoute allowedAccountTypes={["appraiser"]}><AppraiserDashboard /></ProtectedDashboardRoute>} />
              <Route path="/dashboard/developer" element={<ProtectedDashboardRoute allowedAccountTypes={["developer"]}><DeveloperDashboard /></ProtectedDashboardRoute>} />
              {/* Property Management Request */}
              <Route path="/property-management-request" element={<PropertyManagementRequest />} />
              
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/neighborhood-guide" element={<NeighborhoodGuide />} />
              <Route path="/financing" element={<Financing />} />
              <Route path="/saved-reports" element={<SavedReports />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/price-alerts" element={<PriceAlerts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              
              {/* Company Pages */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<ContactUs />} />
              
              {/* Support Pages */}
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              
              {/* Service Pages */}
              <Route path="/property-evaluation" element={<PropertyEvaluation />} />
              <Route path="/brokerage-services" element={<BrokerageServices />} />
              <Route path="/transaction-guarantee" element={<TransactionGuarantee />} />
              <Route path="/explore-cities" element={<ExploreCities />} />
              
              {/* Appraisers Pages */}
              <Route path="/appraisers" element={<Appraisers />} />
              <Route path="/appraiser/:id" element={<AppraiserDetails />} />
              
              {/* Developers Pages */}
              <Route path="/developers" element={<Developers />} />
              <Route path="/developer/:id" element={<DeveloperDetails />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
