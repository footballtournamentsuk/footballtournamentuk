import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, UserCircle, Settings, HelpCircle, MessageSquare, Plus, Shield, Smartphone } from "lucide-react";
import { SupportModal } from "@/components/SupportModal";
import { useCoreWebVitals } from "@/hooks/useCoreWebVitals";
import { usePWAInstall } from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Support from "./pages/Support";
import Partners from "./pages/Partners";
import TeamView from "./pages/TeamView";
import TournamentDetails from "./pages/TournamentDetails";
import CityTournaments from "./pages/CityTournaments";
import FAQ from "./pages/FAQ";
import TournamentRouter from "./components/TournamentRouter";
import { TournamentCityRedirect } from "./components/RedirectRoutes";
import Policies from "./pages/Policies";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import Verify from "./pages/Verify";
import AlertVerify from "./pages/AlertVerify";
import CheckEmail from "./pages/CheckEmail";
import Tournaments from "./pages/Tournaments";
import { Admin } from "./pages/Admin";
import AlertManagement from "./pages/AlertManagement";
import HowItWorks from "./pages/HowItWorks";
import YouthTournaments from "./pages/YouthTournaments";
import TournamentFormats from "./pages/TournamentFormats";
import Regions from "./pages/Regions";
import { Footer } from "./components/Footer";
import { CookieConsent } from "./components/CookieConsent";
import { ScrollToTop } from "./components/ScrollToTop";
import BottomNavigation from "./components/BottomNavigation";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

const queryClient = new QueryClient();

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const { canInstall, triggerInstall } = usePWAInstall();
  
  // Track Core Web Vitals for performance analytics
  useCoreWebVitals();

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name && name.trim()) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const displayName = profile?.full_name || user?.email || 'User';
  const initials = getInitials(profile?.full_name, user?.email);
  
  // Simple admin check - in production, you'd check roles from a profiles table
  const isAdmin = user?.email?.includes("admin") || user?.email?.includes("owner");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          Football Tournaments UK
        </Link>
        <div className="flex items-center gap-4">
          {canInstall && (
            <Button
              onClick={triggerInstall}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Download App"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full p-0 hover:bg-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-background border border-border shadow-lg z-50" 
                align="end" 
                forceMount
              >
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    View / Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile?tab=tournaments" className="flex items-center gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Create Tournament
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsSupportModalOpen(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/faq" className="flex items-center gap-2 cursor-pointer">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      const { error } = await signOut();
                      if (error) {
                        toast({
                          title: "Sign out failed",
                          description: error.message || "Unable to sign out. Please try again.",
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Signed out successfully",
                          description: "You have been signed out of your account.",
                        });
                        // Force redirect to auth page
                        window.location.href = '/auth';
                      }
                    } catch (error: any) {
                      toast({
                        title: "Sign out error",
                        description: error.message || "An unexpected error occurred.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Support Modal */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </nav>
  );
};

const App = () => {
  // Handle SPA routing redirects stored in sessionStorage
  React.useEffect(() => {
    const storedRedirect = sessionStorage.getItem('spa_redirect');
    if (storedRedirect) {
      sessionStorage.removeItem('spa_redirect');
      window.history.replaceState(null, '', storedRedirect);
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <ScrollToTop />
          <Navigation />
          <main className="flex-1 pt-16 pb-[env(safe-area-inset-bottom)]">
            <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/tournaments" element={<Tournaments />} />
             <Route path="/auth" element={<Auth />} />
             <Route path="/verify" element={<Verify />} />
             <Route path="/alerts/verify" element={<AlertVerify />} />
             <Route path="/check-email" element={<CheckEmail />} />
             <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/partners" element={<Partners />} />
             <Route path="/faq" element={<FAQ />} />
             <Route path="/how-it-works" element={<HowItWorks />} />
             <Route path="/youth-tournaments" element={<YouthTournaments />} />
             <Route path="/tournament-formats" element={<TournamentFormats />} />
             <Route path="/regions" element={<Regions />} />
             <Route path="/admin" element={<Admin />} />
             <Route path="/teams/:id" element={<TeamView />} />
             <Route path="/city/:citySlug" element={<CityTournaments />} />
             {/* 301 redirects from old /tournaments/{city} URLs to new /city/{slug} format */}
             <Route path="/tournaments/:city" element={<TournamentCityRedirect />} />
             <Route path="/policies" element={<Policies />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/alerts/manage/:managementToken" element={<AlertManagement />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <CookieConsent />
          <PWAInstallPrompt />
          <BottomNavigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
