import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Plan } from "@shared/schema";
import { Link } from "wouter";
import { useWhatsAppRedirect } from "@/hooks/use-whatsapp-redirect";
import { useParallelData } from "@/hooks/use-parallel-data";
import { PlansGridSkeleton } from "@/components/loading/plan-skeleton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";

const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2).replace('.', ',');
};

export default function Plans() {
  const { redirectToWhatsApp } = useWhatsAppRedirect();
  const [showCopay, setShowCopay] = useState(false);

  // Usar hook otimizado para carregamento paralelo
  const { data, isLoading, hasError } = useParallelData({ plans: true });
  const plansData = data.plans || [];
  const error = hasError;

  // Sort plans to put the popular one in the center
  const plans = [...plansData].sort((a, b) => {
    if (a.isPopular && !b.isPopular) return 0; // Popular plan goes to middle
    if (!a.isPopular && b.isPopular) return 0;
    return 0;
  });

  // Reorder to put popular plan in center position for 3-column layout
  const orderedPlans = plans.length === 3 ? (() => {
    const popularIndex = plans.findIndex(plan => plan.isPopular);
    if (popularIndex !== -1 && popularIndex !== 1) {
      const reordered = [...plans];
      const popularPlan = reordered.splice(popularIndex, 1)[0];
      reordered.splice(1, 0, popularPlan); // Insert at middle position (index 1)
      return reordered;
    }
    return plans;
  })() : plans;

  // Grid columns responsive to number of plans (keeps grid visually centered)
  const gridColsMd = orderedPlans.length >= 2 ? 'md:grid-cols-2' : '';
  const gridColsLg = orderedPlans.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C8587] to-[#1a5a5c] py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-[28px] md:text-[36px] font-bold text-[#fbf9f7] mb-4">Nossos Planos</h1>
            <p className="text-xl text-[#fbf9f7] mb-8">Encontre o plano ideal para seu pet</p>
          </div>
          <PlansGridSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C8587] to-[#1a5a5c] flex items-center justify-center">
        <div className="text-white text-xl">Erro ao carregar planos. Tente novamente.</div>
      </div>
    );
  }

  return (
    <main>
      {/* Plans Section */}
      <section className="pt-32 pb-20 text-[#fbf9f7] bg-[#277677]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
          <div className="text-center mb-12 sm:mb-16">
            <AnimatedSection animation="slideUp" delay={200}>
              <h1 className="font-bold mb-4 text-[#fbf9f7] text-[36px]">
                Nossos <span className="text-[#E1AC33]">Planos</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="slideUp" delay={400}>
              <p className="max-w-2xl mx-auto text-[#fbf9f7] text-[18px] sm:text-[18px] md:text-[18px] mb-6 sm:mb-8 px-4 pl-[0px] pr-[0px] font-normal">
                <span className="block sm:inline">Escolha a proteção ideal</span>
                <span className="block sm:inline"> para seu melhor amigo</span>
              </p>
            </AnimatedSection>
            
            

            {/* Plan Toggle */}
            <AnimatedSection animation="scale" delay={600}>
              <div className="mb-8 sm:mb-12">
                <div className="p-1 rounded-lg bg-[#E1AC33] text-[#fbf9f7] mx-auto max-w-2xl">
                  <Button
                    onClick={() => setShowCopay(false)}
                    className={`w-1/2 py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target ${!showCopay ? 'bg-[#277677]' : 'bg-[#E1AC33]'}`}
                    style={{ transition: 'none' }}
                    onMouseEnter={(e) => { e.preventDefault(); }}
                    data-testid="button-no-copay"
                  >
                    Sem Coparticipação
                  </Button>
                  <Button
                    onClick={() => setShowCopay(true)}
                    className={`w-1/2 py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target ${showCopay ? 'bg-[#277677]' : 'bg-[#E1AC33]'}`}
                    style={{ transition: 'none' }}
                    onMouseEnter={(e) => { e.preventDefault(); }}
                    data-testid="button-with-copay"
                  >
                    Com Coparticipação
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Plans Grid */}
          <AnimatedList animation="slideUp" delay={800} staggerDelay={200}>
            <div className={`grid grid-cols-1 ${gridColsMd} ${gridColsLg} gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-4xl mx-auto px-4 sm:px-0 pl-[0px] pr-[0px]`}>
              {orderedPlans.map((plan, index) => (
                <Card key={plan.id || index} className={`relative transition-all duration-300 hover:shadow-2xl flex flex-col h-[480px] sm:h-[560px] w-full ${plan.isPopular ? 'bg-[#FBF9F7] border-[#E1AC33] border-2' : 'bg-[#FBF9F7] border-[#277677]/30'}`}>
                {plan.isPopular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#E1AC33] text-[#FBF9F7] px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6 flex-shrink-0">
                  <CardTitle className="tracking-tight sm:text-2xl lg:text-3xl font-bold text-[#277677] sm:mb-4 text-[26px] mt-[0px] mb-[0px] pt-[4px] pb-[4px]">{plan.name}</CardTitle>
                  <div className="mb-3 sm:mb-4">
                    <span className="sm:text-3xl lg:text-4xl font-bold text-[#277677] text-[28px]">R${formatPrice(showCopay ? plan.priceWithCopay : plan.priceNormal)}</span>
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
                        <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.name === 'Padrão' ? 'text-[#E1AC33]' : 'text-[#277677]'}`} />
                        <span className="text-sm sm:text-base lg:text-[17px] font-normal text-[#302e2b] leading-relaxed text-left">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto flex-shrink-0">
                    <Link href={plan.redirectUrl || '/contact'}>
                      <Button 
                        className={`w-full h-10 sm:h-12 text-sm sm:text-base lg:text-lg font-semibold rounded-lg transition-all duration-200 mobile-touch-target ${
                          plan.isPopular 
                            ? 'bg-[#E1AC33] hover:bg-[#E1AC33]/90 text-[#FBF9F7]' 
                            : 'bg-[#277677] hover:bg-[#277677]/90 text-[#FBF9F7]'
                        }`}
                        data-testid={`button-plan-${plan.name.toLowerCase()}`}
                      >
                        {plan.buttonText || `Contratar Plano ${plan.name}`}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </AnimatedList>
        </div>
      </section>
      {/* Additional Information Section */}
      <section className="py-20 bg-[#DED8CE]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
          <div className="text-center mb-16">
            <AnimatedSection animation="slideUp" delay={1200}>
              <h2 className="font-bold mb-4 text-[#302e2b] text-[26px] md:text-[34px] whitespace-nowrap">
                Informações <span className="text-[#277677]">importantes</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection animation="slideUp" delay={1400}>
              <p className="text-[18px] text-[#302e2b] max-w-2xl mx-auto font-normal">
                Tudo que você precisa saber sobre nossos planos
              </p>
            </AnimatedSection>
          </div>

          <AnimatedList animation="slideUp" delay={1600} staggerDelay={200}>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="rounded-2xl p-8 shadow-xl bg-[#fbf9f7] h-[480px] sm:h-[420px] flex flex-col">
                <h3 className="text-[24px] font-bold text-[#302e2b] mb-6">Informações Gerais</h3>
                <div className="space-y-6 flex-grow">
                  <div>
                    <h4 className="font-semibold mb-2 text-[#302e2b] text-[18px]">Carência</h4>
                    <p className="text-[#302e2b] text-[16px]">Todos os planos têm início imediato, sem período de carência.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-[#302e2b] text-[18px]">Limites de Uso</h4>
                    <p className="text-[#302e2b] text-[16px]">Consulte os limites específicos de cada serviço no contrato do plano escolhido.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-[#302e2b] text-[18px]">Coparticipação</h4>
                    <p className="text-[#302e2b] text-[16px]">Nos planos com coparticipação, você paga uma taxa reduzida por alguns procedimentos.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-8 shadow-xl bg-[#fbf9f7] h-[480px] sm:h-[420px] flex flex-col">
                <h3 className="text-[24px] font-bold text-[#302e2b] mb-6">Planos Locais</h3>
                <div className="space-y-6 mb-6 flex-grow">
                  <div>
                    <h4 className="font-semibold mb-2 text-[#302e2b] text-[18px]">Cobertura Regional</h4>
                    <p className="text-[#302e2b] text-[16px]">Oferecemos também planos com processo simplificado e atendimento personalizado para nossa região de Teresina PI.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-[#302e2b] text-[18px]">Rede Credenciada Local</h4>
                    <p className="text-[#302e2b] text-[16px]">Acesso facilitado a veterinários e clínicas parceiras próximas à sua localidade.</p>
                  </div>
                  
                </div>
                <div className="mt-auto">
                  <Button 
                    className="bg-[#E1AC33] hover:bg-[#E1AC33]/90 text-[#FBF9F7] font-semibold px-8 py-3 text-[18px] rounded-lg h-12"
                    data-testid="button-local-plans"
                    onClick={() => redirectToWhatsApp('Olá! Gostaria de consultar os planos locais disponíveis na minha região.')}
                  >
                    Consultar Planos Locais
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedList>
        </div>
      </section>
    </main>
  );
}