import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Plans from "@/pages/plans";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Network from "@/pages/network";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { AdminProtectedRoute } from "@/components/admin/admin-protected-route";

function Router() {
  return (
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
            <Route component={NotFound} />
          </Switch>
          <Footer />
        </div>
      </Route>
    </Switch>
  );
}

function App() {
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
