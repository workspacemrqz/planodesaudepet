import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { type Plan } from "@shared/schema";
import { Link } from "wouter";
import { useWhatsAppRedirect } from "@/hooks/use-whatsapp-redirect";
import { useHomePageData } from "@/hooks/use-parallel-data";
import { PlansGridSkeleton } from "@/components/loading/plan-skeleton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";
import { createRedirectHandler } from "@/lib/redirect-utils";

const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2).replace('.', ',');
};

export default function PlansSection() {
  const { redirectToWhatsApp } = useWhatsAppRedirect();
  const [activeTab, setActiveTab] = useState("with_waiting_period");

  // Usar hook otimizado para carregamento paralelo de dados da home
  const { data, isLoading, hasError } = useHomePageData();
  const plansData = data.plans || [];
  const error = hasError;

  // Separar planos por tipo
  const plansWithWaitingPeriod = plansData.filter(plan => plan.planType === "with_waiting_period");
  const plansWithoutWaitingPeriod = plansData.filter(plan => plan.planType === "without_waiting_period");

  // Ordenar planos por displayOrder
  const sortPlans = (plans: Plan[]) => [...plans].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const currentPlans = activeTab === "with_waiting_period" 
    ? sortPlans(plansWithWaitingPeriod)
    : sortPlans(plansWithoutWaitingPeriod);

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#2C8587] to-[#1a5a5c]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[28px] md:text-[36px] mb-4 text-[#fbf9f7] font-bold leading-tight">
              Escolha o <span className="text-primary">plano ideal</span> para seu pet
            </h2>
            <p className="max-w-2xl mx-auto text-[#fbf9f7] text-base sm:text-lg md:text-xl lg:text-2xl font-medium px-4 mb-4">
              Encontre o plano ideal para seu pet
            </p>
          </div>
          <PlansGridSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#2C8587] to-[#1a5a5c]">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">Erro ao carregar planos. Tente novamente.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 text-[#fbf9f7] bg-[#2c8587]" style={{backgroundColor: '#277677'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px] text-center">
        <div className="text-center mb-12 sm:mb-16">
          <AnimatedSection animation="slideUp" delay={100}>
            <h2 className="text-[30px] mb-4 text-[#fbf9f7] font-bold leading-tight">
              Escolha o <span className="text-primary">plano ideal</span> para seu pet
            </h2>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={200}>
            <p className="max-w-2xl mx-auto text-[#fbf9f7] text-[18px] font-normal px-4">
              Oferecemos opções com e sem coparticipação, além de planos locais com menos burocracia
            </p>
          </AnimatedSection>
        </div>

        {/* Plan Tabs */}
        <AnimatedSection animation="scale" delay={300}>
          <div className="mb-8 sm:mb-12">
            <div className="p-1 rounded-lg bg-[#e1ac33] text-[#fbf9f7] mx-auto max-w-2xl">
              <Button
                onClick={() => setActiveTab("with_waiting_period")}
                className={`w-1/2 py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target ${activeTab === "with_waiting_period" ? 'bg-[#2C8587]' : 'bg-[#E1AC33]'}`}
                style={{ transition: 'none' }}
                onMouseEnter={(e) => { e.preventDefault(); }}
                onMouseLeave={(e) => { e.preventDefault(); }}
              >
                Com carência e sem coparticipação
              </Button>
              <Button
                onClick={() => setActiveTab("without_waiting_period")}
                className={`w-1/2 py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target ${activeTab === "without_waiting_period" ? 'bg-[#2C8587]' : 'bg-[#E1AC33]'}`}
                style={{ transition: 'none' }}
                onMouseEnter={(e) => { e.preventDefault(); }}
                onMouseLeave={(e) => { e.preventDefault(); }}
              >
                Sem carência e com coparticipação
              </Button>
            </div>
          </div>
        </AnimatedSection>

        {/* Plans Grid */}
        <AnimatedList 
          animation="slideUp" 
          delay={400} 
          staggerDelay={100}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-4xl mx-auto px-4 sm:px-0 pl-[0px] pr-[0px]"
        >
          {currentPlans.map((plan, index) => (
            <Card key={plan.id || index} className="relative transition-all duration-300 hover:shadow-2xl flex flex-col h-[480px] sm:h-[560px] w-full bg-[#FBF9F7] border-[#277677]/30">

              
              <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6 flex-shrink-0">
                <CardTitle className="tracking-tight sm:text-2xl lg:text-3xl font-bold text-[#277677] sm:mb-4 text-[26px] mt-[0px] mb-[0px] pt-[4px] pb-[4px]">{plan.name}</CardTitle>
                <div className="mb-3 sm:mb-4">
                  <span className="sm:text-3xl lg:text-4xl font-bold text-[#277677] text-[28px]">R${formatPrice(plan.price)}</span>
                  <span className="text-sm sm:text-base lg:text-lg font-medium text-[#302e2b]">/mês</span>
                </div>
                <div className="bg-[#277677]/10 px-3 sm:px-4 py-2 sm:py-3 rounded-xl">
                  <p className="text-[#277677] font-medium text-sm sm:text-base lg:text-lg">{plan.description}</p>
                </div>
              </CardHeader>
              
              <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8 flex flex-col flex-grow">
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow text-left overflow-y-auto">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3 text-left">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#277677]" />
                      <span className="text-sm sm:text-base lg:text-[17px] font-normal text-[#302e2b] leading-relaxed text-left">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto flex-shrink-0">
                  <Button 
                    className="w-full h-10 sm:h-12 text-sm sm:text-base lg:text-lg font-semibold rounded-lg transition-all duration-200 mobile-touch-target bg-[#277677] hover:bg-[#277677]/90 text-[#FBF9F7]"
                    onClick={createRedirectHandler(plan.redirectUrl)}
                  >
                    {plan.buttonText || `Contratar Plano ${plan.name}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </AnimatedList>


      </div>
    </section>
  );
}
