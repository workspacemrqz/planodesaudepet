import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, Settings, MessageSquare, CreditCard, MapPin, HelpCircle, Shield } from "lucide-react";
import ContactSubmissionsTab from "@/components/admin/contact-submissions-tab";
import PlansTab from "@/components/admin/plans-tab";
import NetworkUnitsTab from "@/components/admin/network-units-tab";
import FaqTab from "@/components/admin/faq-tab";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("contact");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7]">
      {/* Header */}
      <header className="bg-[#277677] shadow-lg border-b border-[#277677]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#E1AC33] p-2 rounded-lg">
                <Shield className="h-6 w-6 text-[#277677]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#FBF9F7]">
                  Painel Administrativo
                </h1>
                <p className="text-[#FBF9F7]/70 text-sm">
                  UNIPET PLAN - Sistema de Gerenciamento
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-[#FBF9F7] text-sm">
                Bem-vindo, <span className="font-semibold">{user?.username}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-[#FBF9F7] text-[#FBF9F7] hover:bg-[#FBF9F7] hover:text-[#277677] transition-colors"
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#277677] mb-2">
            Central de Administração
          </h2>
          <p className="text-[#302e2b]/70">
            Gerencie todos os aspectos da plataforma UNIPET PLAN
          </p>
        </div>

        <Card className="shadow-lg border-none">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-0 bg-gradient-to-r from-[#277677]/5 to-[#E1AC33]/5">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-1 bg-transparent h-auto p-1">
                  <TabsTrigger 
                    value="contact" 
                    className="flex items-center gap-2 data-[state=active]:bg-[#277677] data-[state=active]:text-[#FBF9F7] py-3 px-4 rounded-lg font-medium transition-all"
                    data-testid="tab-contact"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Formulários</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="plans" 
                    className="flex items-center gap-2 data-[state=active]:bg-[#277677] data-[state=active]:text-[#FBF9F7] py-3 px-4 rounded-lg font-medium transition-all"
                    data-testid="tab-plans"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden sm:inline">Planos</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="network" 
                    className="flex items-center gap-2 data-[state=active]:bg-[#277677] data-[state=active]:text-[#FBF9F7] py-3 px-4 rounded-lg font-medium transition-all"
                    data-testid="tab-network"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Rede</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="faq" 
                    className="flex items-center gap-2 data-[state=active]:bg-[#277677] data-[state=active]:text-[#FBF9F7] py-3 px-4 rounded-lg font-medium transition-all"
                    data-testid="tab-faq"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">FAQ</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <div className="p-6">
                <TabsContent value="contact" className="mt-0">
                  <ContactSubmissionsTab />
                </TabsContent>
                
                <TabsContent value="plans" className="mt-0">
                  <PlansTab />
                </TabsContent>
                
                <TabsContent value="network" className="mt-0">
                  <NetworkUnitsTab />
                </TabsContent>
                
                <TabsContent value="faq" className="mt-0">
                  <FaqTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}