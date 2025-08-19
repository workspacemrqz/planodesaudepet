import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, Settings, MessageSquare, CreditCard, MapPin, HelpCircle, Shield, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ContactSubmissionsTab from "@/components/admin/contact-submissions-tab";
import PlansTab from "@/components/admin/plans-tab";
import NetworkUnitsTab from "@/components/admin/network-units-tab";
import FaqTab from "@/components/admin/faq-tab";
import SettingsTab from "@/components/admin/settings-tab";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("contact");
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const tabs = [
    { value: "contact", label: "Formulários", icon: MessageSquare },
    { value: "plans", label: "Planos", icon: CreditCard },
    { value: "network", label: "Rede", icon: MapPin },
    { value: "faq", label: "FAQ", icon: HelpCircle },
    { value: "settings", label: "Configurações", icon: Settings },
  ];

  const activeTabData = tabs.find(tab => tab.value === activeTab);

  return (
    <div className="min-h-screen bg-[#FBF9F7]">
      {/* Header */}
      <header className="bg-[#277677] shadow-lg border-b border-[#277677]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${isMobile ? 'flex justify-between items-center' : 'flex justify-between items-center'} py-4`}>
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
                className="bg-[#FBF9F7] border-[#FBF9F7] text-[#277677] hover:bg-[#FBF9F7] hover:text-[#277677] focus:bg-[#FBF9F7] focus:text-[#277677] active:bg-[#FBF9F7] active:text-[#277677]"
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

        <Card className="shadow-lg border-none">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-0 bg-gradient-to-r from-[#277677]/5 to-[#E1AC33]/5">
                {isMobile ? (
                  // Mobile Dropdown
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between bg-[#145759] text-[#FBF9F7] border-[#145759] hover:bg-[#145759] hover:text-[#FBF9F7] focus:bg-[#145759] focus:text-[#FBF9F7] active:bg-[#145759] active:text-[#FBF9F7] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      >
                        <div className="flex items-center gap-2">
                          {activeTabData && <activeTabData.icon className="h-4 w-4" />}
                          {activeTabData?.label}
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-[#145759] border-[#145759]">
                      {tabs.map((tab) => (
                        <DropdownMenuItem
                          key={tab.value}
                          onClick={() => setActiveTab(tab.value)}
                          className="flex items-center gap-2 text-[#FBF9F7] hover:bg-[#277677] focus:bg-[#277677] cursor-pointer"
                        >
                          <tab.icon className="h-4 w-4" />
                          {tab.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  // Desktop Tabs
                  <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-1 bg-transparent h-auto p-1">
                    {tabs.map((tab) => (
                      <TabsTrigger 
                        key={tab.value}
                        value={tab.value} 
                        className="flex items-center gap-2 data-[state=active]:bg-[#145759] data-[state=active]:text-[#FBF9F7] py-3 px-4 rounded-lg font-medium"
                        data-testid={`tab-${tab.value}`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                )}
              </CardHeader>

              <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
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
                
                <TabsContent value="settings" className="mt-0">
                  <SettingsTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}