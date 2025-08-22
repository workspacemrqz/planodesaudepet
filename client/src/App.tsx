import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Plans from "@/pages/plans";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Network from "@/pages/network";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfUse from "@/pages/terms-of-use";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { AdminProtectedRoute } from "@/components/admin/admin-protected-route";
import ScrollToTop from "@/components/scroll-to-top";


function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <AdminProtectedRoute path="/admin" component={AdminDashboard} />
        
        {/* Public Routes */}
        <Route>
          <div className="min-h-screen bg-background">
            <Header />
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/planos" component={Plans} />
              <Route path="/sobre" component={About} />
              <Route path="/contato" component={Contact} />
              <Route path="/faq" component={FAQ} />
              <Route path="/rede-credenciada" component={Network} />
              <Route path="/politica-privacidade" component={PrivacyPolicy} />
              <Route path="/termos-uso" component={TermsOfUse} />
              <Route component={NotFound} />
            </Switch>
            <Footer />
          </div>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  // Suprimir erro ResizeObserver que não afeta a funcionalidade
  useEffect(() => {
    const handleResizeObserverError = (e: ErrorEvent) => {
      if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        e.stopImmediatePropagation();
        return false;
      }
    };

    window.addEventListener('error', handleResizeObserverError);

    return () => {
      window.removeEventListener('error', handleResizeObserverError);
    };
  }, []);

  // Prefetch dados críticos assim que a aplicação carrega
  useEffect(() => {
    const prefetchCriticalData = async () => {
      try {
        // Prefetch dados que são usados em múltiplas páginas
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ['plans'],
            queryFn: async () => {
              const response = await fetch('/api/plans');
              if (!response.ok) throw new Error('Failed to fetch plans');
              return response.json();
            },
            staleTime: 5 * 60 * 1000, // 5 minutos
          }),
          queryClient.prefetchQuery({
            queryKey: ['/api/network-units'],
            queryFn: async () => {
              const response = await fetch('/api/network-units');
              if (!response.ok) throw new Error('Failed to fetch network units');
              return response.json();
            },
            staleTime: 5 * 60 * 1000, // 5 minutos
          }),
          queryClient.prefetchQuery({
            queryKey: ['/api/faq'],
            queryFn: async () => {
              const response = await fetch('/api/faq');
              if (!response.ok) throw new Error('Failed to fetch FAQ');
              return response.json();
            },
            staleTime: 5 * 60 * 1000, // 5 minutos
          }),
          queryClient.prefetchQuery({
            queryKey: ['site-settings'],
            queryFn: async () => {
              const response = await fetch('/api/site-settings');
              if (!response.ok) throw new Error('Failed to fetch site settings');
              return response.json();
            },
            staleTime: 5 * 60 * 1000, // 5 minutos
          }),
        ]);
      } catch (error) {
        console.warn('Erro ao fazer prefetch dos dados:', error);
        // Não bloqueia a aplicação se o prefetch falhar
      }
    };

    prefetchCriticalData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
