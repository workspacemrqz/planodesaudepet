import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import ContactSubmissionsTab from "@/components/admin/contact-submissions-tab";
import PlansTab from "@/components/admin/plans-tab";
import NetworkUnitsTab from "@/components/admin/network-units-tab";
import FaqTab from "@/components/admin/faq-tab";

import SettingsTab from "@/components/admin/settings-tab";
import AdminChipTabs from "@/components/admin/admin-chip-tabs";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("contact");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7]">
      {/* Header */}
      <header className="bg-[#277677] shadow-lg border-b border-[#277677]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-[#FBF9F7]">
                  Painel Administrativo
                </h1>
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-[#145759] border-[#145759] text-[#FBF9F7] hover:bg-[#145759] hover:text-[#FBF9F7] focus:bg-[#145759] focus:text-[#FBF9F7] active:bg-[#145759] active:text-[#FBF9F7]"
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
        </div>

        <Card className="shadow-lg border-none bg-[#277677]">
          <CardContent className="p-0 bg-[#277677]">
            <CardHeader className="pb-0 p-0 bg-[#277677]">
              <AdminChipTabs 
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </CardHeader>

            <div className="p-6 bg-[#277677]">
              {/* Renderização condicional simples e direta */}
              {activeTab === "contact" && (
                <div className="bg-[#277677] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-[#FBF9F7]">Formulários de Contato</h3>
                  <ContactSubmissionsTab />
                </div>
              )}
              
              {activeTab === "plans" && (
                <div className="bg-[#277677] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-[#FBF9F7]">Gerenciamento de Planos</h3>
                  <PlansTab />
                </div>
              )}
              
              {activeTab === "network" && (
                <div className="bg-[#277677] rounded-lg p-4">
                  <NetworkUnitsTab />
                </div>
              )}
              
              {activeTab === "faq" && (
                <div className="bg-[#277677] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-[#FBF9F7]">Perguntas Frequentes</h3>
                  <FaqTab />
                </div>
              )}
              

              
              {activeTab === "settings" && (
                <div className="bg-[#277677] rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-[#FBF9F7]">Configurações</h3>
                  <SettingsTab />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}