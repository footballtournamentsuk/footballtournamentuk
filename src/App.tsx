import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut, User, UserCircle, Settings, HelpCircle, MessageSquare, Plus, Shield, Smartphone, Menu, Search, MapPin, Trophy, Users, FileText } from "lucide-react";
import { useCoreWebVitals } from "@/hooks/useCoreWebVitals";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
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
import AlertManage from "./pages/AlertManage";
import CheckEmail from "./pages/CheckEmail";
import Tournaments from "./pages/Tournaments";
import { Admin } from "./pages/Admin";
import { AdminBlog } from "./pages/AdminBlog";
import AlertManagement from "./pages/AlertManagement";
import HowItWorks from "./pages/HowItWorks";
import YouthTournaments from "./pages/YouthTournaments";
import TournamentFormats from "./pages/TournamentFormats";
import Regions from "./pages/Regions";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogTag from "./pages/BlogTag";
import { Footer } from "./components/Footer";
import { Suspense, lazy } from "react";

// Lazy load non-critical components
const CookieConsent = lazy(() => import("./components/CookieConsent").then(m => ({
  default: m.CookieConsent
})));
const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt").then(m => ({
  default: m.PWAInstallPrompt
})));
const SupportModal = lazy(() => import("./components/SupportModal").then(m => ({
  default: m.SupportModal
})));
import { ScrollToTop } from "./components/ScrollToTop";
import BottomNavigation from "./components/BottomNavigation";
import { useTournamentAlerts } from "./hooks/useTournamentAlerts";

// Extend Window interface for GTM dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}
const queryClient = new QueryClient();

// Check if blog is enabled
const BLOG_ENABLED = import.meta.env.VITE_BLOG_ENABLED === 'true';
const Navigation = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const {
    canInstall,
    triggerInstall
  } = usePWAInstall();

  // Handle body scroll lock when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Track Core Web Vitals for performance analytics
  useCoreWebVitals();

  // Initialize performance monitoring
  usePerformanceMonitoring();
  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name && name.trim()) {
      return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
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

  const regionsData = [
    { name: "England", path: "/tournaments?region=england" },
    { name: "Scotland", path: "/tournaments?region=scotland" },
    { name: "Wales", path: "/tournaments?region=wales" },
    { name: "Northern Ireland", path: "/tournaments?region=northern-ireland" },
    { name: "London", path: "/tournaments?region=london" },
  ];

  const tournamentTypesData = [
    { name: "3v3", path: "/tournaments?format=3v3" },
    { name: "5v5", path: "/tournaments?format=5v5" },
    { name: "7v7", path: "/tournaments?format=7v7" },
    { name: "9v9", path: "/tournaments?format=9v9" },
    { name: "11v11", path: "/tournaments?format=11v11" },
    { name: "Youth", path: "/tournaments?category=youth" },
  ];

  return <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-primary">
            Football Tournaments UK
          </Link>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/tournaments">
                <Button variant="default" size="sm" className="font-medium">
                  <Search className="h-4 w-4 mr-2" />
                  Find Tournaments
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-medium">
                    <MapPin className="h-4 w-4 mr-2" />
                    Regions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-background border border-border shadow-lg z-50">
                  {regionsData.map((region) => (
                    <DropdownMenuItem key={region.name} asChild>
                      <Link 
                        to={region.path}
                        className="flex items-center cursor-pointer"
                      >
                        {region.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-medium">
                    <Trophy className="h-4 w-4 mr-2" />
                    Tournament Types
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-background border border-border shadow-lg z-50">
                  {tournamentTypesData.map((type) => (
                    <DropdownMenuItem key={type.name} asChild>
                      <Link 
                        to={type.path}
                        className="flex items-center cursor-pointer"
                      >
                        {type.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {BLOG_ENABLED && (
                <Link to="/blog">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Blog
                  </Button>
                </Link>
              )}

              <Link to="/how-it-works">
                <Button variant="ghost" size="sm" className="font-medium">
                  How It Works
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-medium">
                    <Users className="h-4 w-4 mr-2" />
                    For Organisers
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-background border border-border shadow-lg z-50">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/profile?tab=tournaments"
                      className="flex items-center cursor-pointer"
                    >
                      Create Tournament
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/profile?tab=extended-details"
                      className="flex items-center cursor-pointer"
                    >
                      Extended Tournament Details
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-medium">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Support
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-background border border-border shadow-lg z-50">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/faq"
                      className="flex items-center cursor-pointer"
                    >
                      FAQ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button 
                      onClick={() => setIsSupportModalOpen(true)}
                      className="flex items-center cursor-pointer w-full text-left"
                    >
                      Contact
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/guides"
                      className="flex items-center cursor-pointer"
                    >
                      Guides
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          {isMobile && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="mobile-menu-glass border-0 p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 pb-4">
                    <SheetTitle className="text-left text-xl font-bold">Menu</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
                    <Link 
                      to="/tournaments" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mobile-menu-item"
                    >
                      <Search className="h-5 w-5 shrink-0" />
                      <span>Find Tournaments</span>
                    </Link>
                    
                    {BLOG_ENABLED && (
                      <Link 
                        to="/blog" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mobile-menu-item"
                      >
                        <FileText className="h-5 w-5 shrink-0" />
                        <span>Blog</span>
                      </Link>
                    )}
                    
                    <Link 
                      to="/how-it-works" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mobile-menu-item"
                    >
                      <HelpCircle className="h-5 w-5 shrink-0" />
                      <span>How It Works</span>
                    </Link>
                    
                    <hr className="my-4 border-white/10" />
                    
                    <div className="space-y-2">
                      <div className="px-4 py-2 text-sm font-medium opacity-70">
                        Regions
                      </div>
                      {regionsData.map((region) => (
                        <Link
                          key={region.name}
                          to={region.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-menu-item pl-8"
                        >
                          <span>{region.name}</span>
                        </Link>
                      ))}
                    </div>
                    
                    <hr className="my-4 border-white/10" />
                    
                    <div className="space-y-2">
                      <div className="px-4 py-2 text-sm font-medium opacity-70">
                        Tournament Types
                      </div>
                      {tournamentTypesData.map((type) => (
                        <Link
                          key={type.name}
                          to={type.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-menu-item pl-8"
                        >
                          <span>{type.name}</span>
                        </Link>
                      ))}
                    </div>
                    
                    <hr className="my-4 border-white/10" />
                    
                    <Link 
                      to="/faq" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mobile-menu-item"
                    >
                      <HelpCircle className="h-5 w-5 shrink-0" />
                      <span>FAQ</span>
                    </Link>
                    
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSupportModalOpen(true);
                      }}
                      className="mobile-menu-item w-full text-left"
                    >
                      <MessageSquare className="h-5 w-5 shrink-0" />
                      <span>Contact Support</span>
                    </button>
                    
                    {user && (
                      <Link 
                        to="/profile?tab=tournaments" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mobile-menu-item"
                      >
                        <Plus className="h-5 w-5 shrink-0" />
                        <span>Create Tournament</span>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {canInstall && <Button onClick={triggerInstall} variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download App">
              <Smartphone className="h-4 w-4" />
            </Button>}
          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg z-50" align="end" forceMount>
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
                {isAdmin && <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSupportModalOpen(true)} className="flex items-center gap-2 cursor-pointer">
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
                <DropdownMenuItem onClick={async () => {
              try {
                const {
                  error
                } = await signOut();
                if (error) {
                  toast({
                    title: "Sign out failed",
                    description: error.message || "Unable to sign out. Please try again.",
                    variant: "destructive"
                  });
                } else {
                  toast({
                    title: "Signed out successfully",
                    description: "You have been signed out of your account."
                  });
                  // Force redirect to auth page
                  window.location.href = '/auth';
                }
              } catch (error: any) {
                toast({
                  title: "Sign out error",
                  description: error.message || "An unexpected error occurred.",
                  variant: "destructive"
                });
              }
            }} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Link to="/auth">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>}
        </div>
      </div>
      
      {/* Support Modal */}
      <Suspense fallback={null}>
        <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
      </Suspense>
    </nav>;
};

// Component to track route changes for GTM
const RouteTracker = () => {
  const location = useLocation();
  React.useEffect(() => {
    // Push pageview to dataLayer for GTM on route change
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'pageview',
      page_path: location.pathname + location.search,
      page_title: document.title
    });
  }, [location]);
  return null;
};
const App = () => {
  // Initialize tournament alerts monitoring
  useTournamentAlerts();

  // Handle SPA routing redirects stored in sessionStorage
  React.useEffect(() => {
    const storedRedirect = sessionStorage.getItem('spa_redirect');
    if (storedRedirect) {
      sessionStorage.removeItem('spa_redirect');
      window.history.replaceState(null, '', storedRedirect);
    }
  }, []);
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <RouteTracker />
          <ScrollToTop />
          <Navigation />
          <main className="flex-1 pt-16 pb-[env(safe-area-inset-bottom)]">
            <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/tournaments" element={<Tournaments />} />
             <Route path="/auth" element={<Auth />} />
             <Route path="/verify" element={<Verify />} />
              <Route path="/alerts/verify" element={<AlertVerify />} />
              <Route path="/alerts/manage" element={<AlertManage />} />
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
           <Route path="/admin/ecosystem/blog" element={<AdminBlog />} />
           <Route path="/admin/ecosystem/blog/:section" element={<AdminBlog />} />
           <Route path="/admin/ecosystem/blog/:section/:action" element={<AdminBlog />} />
           <Route path="/admin/ecosystem/blog/:section/:action/:id" element={<AdminBlog />} />
             <Route path="/teams/:id" element={<TeamView />} />
             <Route path="/tournaments/:slug" element={<TournamentDetails />} />
             <Route path="/city/:citySlug" element={<CityTournaments />} />
             {/* 301 redirects from old /tournaments/{city} URLs to new /city/{slug} format */}
             <Route path="/policies" element={<Policies />} />
             <Route path="/cookie-policy" element={<CookiePolicy />} />
             <Route path="/alerts/manage/:managementToken" element={<AlertManagement />} />
             
             {/* Blog Routes - Order matters: specific paths before :slug */}
             {BLOG_ENABLED && <>
                 <Route path="/blog" element={<Blog />} />
                 <Route path="/blog/page/:pageNumber" element={<Blog />} />
                 <Route path="/blog/tags/:tag" element={<BlogTag />} />
                 <Route path="/blog/:slug" element={<BlogPost />} />
               </>}
             
             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Suspense fallback={null}>
            <CookieConsent />
          </Suspense>
          <Suspense fallback={null}>
            <PWAInstallPrompt />
          </Suspense>
          <BottomNavigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
};
export default App;