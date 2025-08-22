import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
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
import AreaCliente from "@/pages/area-cliente";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { AdminProtectedRoute } from "@/components/admin/admin-protected-route";
import ScrollToTop from "@/components/scroll-to-top";
import ErrorBoundary from "@/components/error-boundary";

// Componente de loading global com fallback robusto
function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#277677] to-[#1a5a5c] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#E1AC33] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <div className="text-[#FBF9F7] text-2xl font-bold mb-2">UNIPET PLAN</div>
        <div className="text-[#E1AC33] text-lg">Carregando...</div>
      </div>
    </div>
  );
}

// Componente de roteamento principal
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
            <Suspense fallback={<GlobalLoading />}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/planos" component={Plans} />
                <Route path="/sobre" component={About} />
                <Route path="/contato" component={Contact} />
                <Route path="/faq" component={FAQ} />
                <Route path="/rede-credenciada" component={Network} />
                <Route path="/politica-privacidade" component={PrivacyPolicy} />
                <Route path="/termos-uso" component={TermsOfUse} />
                <Route path="/area-cliente" component={AreaCliente} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
            <Footer />
          </div>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <ReactQueryDevtools initialIsOpen={false} />
          </TooltipProvider>
        </AdminAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
