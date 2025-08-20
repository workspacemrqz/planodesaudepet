import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Plan } from "@shared/schema";
import { Link } from "wouter";
import { useWhatsAppRedirect } from "@/hooks/use-whatsapp-redirect";
import { useParallelData } from "@/hooks/use-parallel-data";
import { PlansGridSkeleton } from "@/components/loading/plan-skeleton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";
import { createRedirectHandler } from "@/lib/redirect-utils";

const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2).replace('.', ',');
};

export default function Plans() {
  const { redirectToWhatsApp } = useWhatsAppRedirect();
  const [activeTab, setActiveTab] = useState("with_waiting_period");

  // Usar hook otimizado para carregamento paralelo
  const { data, isLoading, hasError } = useParallelData({ plans: true });
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
        <div className="text-center text-white max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Ops! Algo deu errado</h2>
          <p className="text-lg mb-6">Não conseguimos carregar os planos no momento.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#E1AC33] text-[#2C8587] px-6 py-3 rounded-lg font-semibold hover:bg-[#d4a02b] transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }
  
  // If no plans available, show a friendly message
  if (!isLoading && (!plansData || plansData.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2C8587] to-[#1a5a5c] flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Planos em Breve!</h2>
          <p className="text-lg mb-6">Estamos preparando os melhores planos para seu pet. Volte em breve!</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#E1AC33] text-[#2C8587] px-6 py-3 rounded-lg font-semibold hover:bg-[#d4a02b] transition-colors"
          >
            Atualizar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* Plans Section */}
      <section className="pt-32 pb-20 text-[#fbf9f7] bg-[#277677]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
          <div className="text-center mb-12 sm:mb-16">
            <AnimatedSection animation="slideUp" delay={100}>
              <h1 className="font-bold mb-4 text-[#fbf9f7] text-[36px]">
                Nossos <span className="text-[#E1AC33]">Planos</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="slideUp" delay={200}>
              <p className="max-w-2xl mx-auto text-[#fbf9f7] text-[18px] sm:text-[18px] md:text-[18px] mb-6 sm:mb-8 px-4 pl-[0px] pr-[0px] font-normal">
                <span className="block sm:inline">Escolha a proteção ideal</span>
                <span className="block sm:inline"> para seu melhor amigo</span>
              </p>
            </AnimatedSection>
            
            

            {/* Plan Tabs */}
            <AnimatedSection animation="scale" delay={300}>
              <div className="mb-8 sm:mb-12">
                <div className="p-1 rounded-lg bg-[#E1AC33] text-[#fbf9f7] mx-auto max-w-2xl">
                  <Button
                    onClick={() => setActiveTab("with_waiting_period")}
                    className={`w-1/2 py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target ${activeTab === "with_waiting_period" ? 'bg-[#277677]' : 'bg-[#E1AC33]'}`}
                    style={{ transition: 'none' }}
                    onMouseEnter={(e) => { e.preventDefault(); }}
                    data-testid="button-with-waiting"
                  >
                    Com carência e sem coparticipação
                  </Button>
                  <Button
                    onClick={() => setActiveTab("without_waiting_period")}
                    className={`w-1/2 py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target ${activeTab === "without_waiting_period" ? 'bg-[#277677]' : 'bg-[#E1AC33]'}`}
                    style={{ transition: 'none' }}
                    onMouseEnter={(e) => { e.preventDefault(); }}
                    data-testid="button-without-waiting"
                  >
                    Sem carência e com coparticipação
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Plans Grid */}
          <AnimatedList animation="slideUp" delay={400} staggerDelay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-4xl mx-auto px-4 sm:px-0 pl-[0px] pr-[0px]">
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
                        data-testid={`button-plan-${plan.name.toLowerCase()}`}
                        onClick={createRedirectHandler(plan.redirectUrl)}
                      >
                        {plan.buttonText || `Contratar Plano ${plan.name}`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedList>
        </div>
      </section>

      {/* Detailed Plan Sections */}
      {/* PLANO BASIC */}
      <section className="py-16 bg-[#FBF9F7]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#277677] mb-4">
                Plano <span className="text-[#E1AC33]">BASIC</span>
              </h2>
              <p className="text-lg text-[#302e2b] max-w-2xl mx-auto">
                O plano essencial para cuidar da saúde do seu pet com qualidade e economia
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Serviços Inclusos */}
              <div className="space-y-6">
                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-xl font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Consultas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Clínica Geral</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Retorno Clínico</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-xl font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Exames Laboratoriais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Alanina Aminotransferase (TGP/ALT)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Albumina</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Aspartato Aminotransferase (TGO/AST)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Bilirrubinas - totais e frações</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Creatinina</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fosfatase Alcalina (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fósforo UV (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Gama Glutamil Transferase (GGT)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Hemograma (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Parasitológico de Fezes (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Proteínas Totais</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Relação Proteína / Creatinina Urinária (UPC) (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Sumário de Urina (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de Glicemia</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de Glicemia (Aparelho)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Uréia</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Procedimentos e Benefícios */}
              <div className="space-y-6">
                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-xl font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Procedimentos e Anestesia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-[#277677] mb-2">Procedimento Ambulatorial</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b]">Coleta de Exames de Sangue</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#277677] mb-2">Anestesia</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b]">Anestesia local / Tranquilização</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-xl font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Vacinas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina de Raiva</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Polivalente (V7, V8, V10)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Quádrupla V4</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Tríplice (V3)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#277677] text-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Benefícios Especiais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Desconto de 10% nos serviços, medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Consulta em horário normal (segunda a sábado de 08 às 20h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Vacinas (consultar cobertura)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Exames de sangue simples (consultar cobertura)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANO COMFORT */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#277677] mb-4">
                Plano <span className="text-[#E1AC33]">COMFORT</span>
              </h2>
              <p className="text-lg text-[#302e2b] max-w-2xl mx-auto">
                Mais conforto e praticidade para o cuidado completo do seu pet
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Consultas e Exames */}
              <div className="space-y-6">
                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-xl font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Consultas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Clínica Geral</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Retorno Clínico</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-xl font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Exames Laboratoriais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Alanina Aminotransferase (TGP/ALT)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Albumina</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Aspartato Aminotransferase (TGO/AST)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Bilirrubinas - totais e frações</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Creatinina</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fosfatase Alcalina (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fósforo UV (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Gama Glutamil Transferase (GGT)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Hemograma (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Parasitológico de Fezes (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Proteínas Totais</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Relação Proteína / Creatinina Urinária (UPC) (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Sumário de Urina (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de Glicemia</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de Glicemia (Aparelho)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Uréia</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Exames de Imagem e Demais Serviços */}
              <div className="space-y-6">
                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-xl font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Exames de Imagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Ultrassonografia (prazo 02 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Ultrassonografia Guiada</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Cistocentese guiada para coleta de urina</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-xl font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Procedimentos e Vacinas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-[#277677] mb-2">Procedimento Ambulatorial</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b]">Coleta de Exames de sangue</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#277677] mb-2">Anestesias</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b]">Anestesia local / Tranquilização</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#277677] mb-2">Vacinas</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b]">Vacina de Raiva</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b]">Vacina Polivalente (V7, V8, V10)</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b]">Vacina Quádrupla V4</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                            <span className="text-[#302e2b]">Vacina Tríplice (V3)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#277677] text-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Benefícios Especiais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Desconto de 10% nos serviços, medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Consulta em horário normal (segunda a sábado de 08 às 20h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Vacinas (consultar cobertura)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Exames de sangue e imagem (consultar cobertura)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANO PLATINUM */}
      <section className="py-16 bg-[#FBF9F7]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#277677] mb-4">
                Plano <span className="text-[#E1AC33]">PLATINUM</span>
              </h2>
              <p className="text-lg text-[#302e2b] max-w-2xl mx-auto">
                Cuidado premium com consultas especializadas e cirurgias eletivas incluídas
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Consultas */}
              <div className="space-y-6">
                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-lg font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Consultas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Clínica Geral</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Retorno Clínico</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-lg font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Especialistas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Atestado de Saúde</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Cardiologista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Dentista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Dermatologista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Oncologista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Ortopedista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Plantão</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-lg font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Cirurgia Eletiva
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Drenagem de Abscesso/Hematoma</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Drenagem de Otohematoma Unilateral</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Orquiectomia (até 15kg)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Orquiectomia (gato)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Orquiectomia/Ablação (acima de 15kg)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">OSH / Ovariohisterectomia (acima de 15kg)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">OSH / Ovariohisterectomia (gata)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">OSH / Ovariohisterectomia (coelhos e similares)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">OSH / Ovariohisterectomia (até 15kg)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Exames */}
              <div className="space-y-6">
                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-lg font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Exames Laboratoriais Simples
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 max-h-64 overflow-y-auto">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Alanina Aminotransferase (TGP/ALT)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Albumina</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Aspartato Aminotransferase (TGO/AST)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Bilirrubinas – totais e frações</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Creatinina</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fosfatase Alcalina (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fósforo UV (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Gama Glutamil Transferase (GGT)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Hemograma (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Parasitológico de Fezes (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Proteínas Totais</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Relação Proteína/Creatinina Urinária (UPC) (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Sumário de Urina (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de Glicemia</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de Glicemia (Aparelho)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Uréia</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-lg font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Exames Laboratoriais Complexos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 max-h-64 overflow-y-auto">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Cálcio sérico ou urinário</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Cálculo Renal – Análise físico-química</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Citologia do Ouvido (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Citologia Vaginal (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Colesterol Total</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Curva Glicêmica</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Dosagem de Cálcio Iônico (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fibrinogênio (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Função Hepática (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Função Renal (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Hemograma c/ Reticulócitos (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Lipidograma (Colesterol + HDL + LDL + Triglicerídeos) (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Microscopia para Sarna (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Pesquisa de Hemoparasitas (prazo 12h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Pesquisa de Microfilárias</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Tricograma</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Triglicerídeos</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-lg font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Vacinas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina de Raiva</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Polivalente (V7, V8, V10)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Quádrupla (V4)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Tríplice (V3)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina de Gripe</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Exames de Imagem e Procedimentos */}
              <div className="space-y-6">
                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-lg font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Exames de Imagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 max-h-80 overflow-y-auto">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Ultrassonografia (prazo 02 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Ultrassonografia Guiada</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">ECG Canino/Felino (prazo 2 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudos Radiológicos de Coluna (Caudal, Cervical, Cervicotorácica, Lombossacral, Toracolombar)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudo de Pelve</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudo Radiológico de Traqueia</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudo do Pescoço</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudos de Membros Pélvicos e Torácicos (diversos segmentos)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudo Radiográfico de Abdômen</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudo Radiográfico de Crânio</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudo Radiográfico de Tórax</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudo Radiológico de Esôfago</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Ultrassom Guiada p/ CAAF</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Ultrassonografia Controle (prazo 2 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Ultrassonografia Ocular</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-2 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Estudo Radiográfico de Animal Silvestre</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-lg font-bold text-[#277677] flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Procedimentos e Anestesia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <h5 className="font-semibold text-[#277677] mb-1">Procedimento Ambulatorial 1</h5>
                        <ul className="space-y-1 text-xs">
                          <li>• Coleta de Exames de Sangue</li>
                          <li>• Aplicação IM, SC, IV (sem material)</li>
                          <li>• Aplicação IM, SC, IV (sem material/domicílio)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#277677] mb-1">Procedimento Ambulatorial 2</h5>
                        <ul className="space-y-1 text-xs">
                          <li>• Aferição de Pressão Arterial</li>
                          <li>• Avaliação para Cirurgia</li>
                          <li>• Avaliação p/ Internação</li>
                          <li>• Limpeza de Pós-Operatório</li>
                          <li>• Nebulização</li>
                          <li>• Oxigenioterapia</li>
                          <li>• Teste de Fluoresceína</li>
                          <li>• Teste de Shirmer</li>
                          <li>• Tratamento Miíase (remoção grande)</li>
                          <li>• Tratamento Miíase (remoção pequena)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#277677] mb-1">Anestesia</h5>
                        <ul className="space-y-1 text-xs">
                          <li>• Anestesia Local / Tranquilização</li>
                          <li>• Adicional Hora Cirúrgica</li>
                          <li>• Anestesia Epidural</li>
                          <li>• Anestesia Geral Endovenosa</li>
                          <li>• Anestesia Inalatória (até 5kg)</li>
                          <li>• Anestesia Inalatória (5 a 15kg)</li>
                          <li>• Anestesia Inalatória (acima de 15kg)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#277677] text-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center">
                      <Check className="h-5 w-5 mr-2 text-[#E1AC33]" />
                      Benefícios Especiais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Desconto de 20% em serviços, medicamentos e materiais não cobertos pelo plano</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Consulta em horário normal: segunda a sábado, 08h–20h</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Consulta em horário de plantão: segunda a sábado, 20h–08h + domingos e feriados</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Consultas com especialistas: verificar especialidades disponíveis</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mt-0.5 mr-2 text-[#E1AC33] flex-shrink-0" />
                        <span>Vacinas, exames de sangue, exames de imagem e cirurgias eletivas: consultar cobertura</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANO INFINIT */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#277677] mb-4">
                Plano <span className="text-[#E1AC33]">INFINITY</span>
              </h2>
              <p className="text-lg text-[#302e2b] max-w-2xl mx-auto">
                Cobertura completa e ilimitada para o cuidado total do seu pet
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Consultas e Especialistas */}
              <div className="space-y-4">
                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-base font-bold text-[#277677] flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Consultas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Clínica Geral</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Retorno Clínico</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-base font-bold text-[#277677] flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Especialistas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Atestado de Saúde</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Cardiologista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Dentista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Dermatologista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Oncologista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Ortopedista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Plantão</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Nefrologista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Consulta Neurologista</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Taxa de Retorno</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-base font-bold text-[#277677] flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Vacinas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina de Raiva</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Polivalente (V7, V8, V10)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Quádrupla v4</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Tríplice (V3)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina de Gripe</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Giardia</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Vacina Quíntupla (V5, v3 ou v4+felv)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Exames Laboratoriais */}
              <div className="space-y-4">
                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-base font-bold text-[#277677] flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Exames Laboratoriais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 max-h-96 overflow-y-auto">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Alanina Aminotransferase (TGP/ALT)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Albumina</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Aspartato Aminotransferase (TGO/AST)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Bilirrubinas - totais e frações</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Creatinina</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fosfatase Alcalina (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Fósforo UV (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Gama Glutamil Transferase (GGT)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Hemograma (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Parasitológico de Fezes (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Proteínas Totais</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Relação Proteína / Creatinina Urinária (UPC) (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Sumário de Urina (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de Glicemia</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de Glicemia (Aparelho)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Uréia</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Cálcio sérico ou urinário</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Cálculo renal Análise físico química</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Citologia do Ouvido (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Citologia Vaginal (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Colesterol total</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Curva Glicêmica</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Dosagem de Cálcio Iônico (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">FIBRINOGÊNIO (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Função hepática (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Função renal (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Hemograma com contagem de reticulócitos (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Lipidograma (Colesterol + HDL + LDL + Triglicerídeos) (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Microscopia para Sarna (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Pesquisa de hemoparasitas (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Pesquisa de Microfilárias</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Tricograma</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Triglicerídeos</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Exames Complexos */}
              <div className="space-y-4">
                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-base font-bold text-[#277677] flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Exames Laboratoriais Complexos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 max-h-96 overflow-y-auto">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Análise de Líquido Cavitário (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Análise de líquor (LCR) (prazo para laudo 24 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Biópsia / histopatológico (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Biópsia de pele (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Citologia / CAAF - nódulo superficial (prazo para laudo 7 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">CITOLOGIA DE LAVADO BRONCOALVEOLAR</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Citologia de pele (Fungo e Bactéria) (prazo para laudo 07 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Compatibilidade sanguínea (doador adicional) (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Cortisol Pós Supressão Dexametasona (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Cortisol Pré e Pós Dexametasona (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">ELISA (LEISHMANIOSE CANINA) LEISH IDEXX (prazo 06 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Lactato (prazo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Mielograma (prazo para laudo 10 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Necropsia (05 até 15kg) (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Necropsia (acima de 15kg) (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Necropsia (até 05kg) (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Necropsia Estética (05kg até 15kg) (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Necropsia Estética (acima de 15kg) (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Necropsia Estética (até 05kg) (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">NT PROBNP CANINO (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">PERFIL HEMOGASOMETRIA/ELETRÓLITOS</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Pesquisa/parasitológico para Leishmania (pele, medula e linfonodo) (prazo para laudo 15 dias úteis)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">SOROLOGIA PARA CORONA VIROSE</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste de compatibilidade sanguínea (prazo para laudo 12 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">TESTE FELV</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">TESTE FIV FELV PRODVET/BIOCLIN (prazo 06 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">TESTE RÁPIDO CINOMOSE E PARVOVIROSE ACCUVET (prazo 06 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste rápido de cinomose/antígeno (ALERE) (prazo 06 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste Rápido de Erliquiose (Immunocombo IGG) (prazo 06 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste Rápido de Erliquiose SNAP 4DX (IDEXX) (prazo 06 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste Rápido de Fiv/Felv (IDEXX)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">TESTE RÁPIDO LEISHMANIOSE AC ACCUVET (prazo 01 dia útil)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste rápido para cinomose e parvovirose (IGM) (prazo 06 horas)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">Teste Rápido Parvo/Corona (ALERE)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#277677] flex-shrink-0" />
                        <span className="text-[#302e2b]">TESTE RÁPIDO TOXOPLASMOSE IGG/IGM ACCUVET (prazo 12 horas)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Exames de Imagem, Cirurgias e Benefícios */}
              <div className="space-y-4">
                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-base font-bold text-[#277677] flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Exames de Imagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 max-h-64 overflow-y-auto">
                    <ul className="space-y-1 text-xs">
                      <li>• Ultrassonografia (prazo 02 dias úteis)</li>
                      <li>• ECG (Eletrocardiograma) canino / felino</li>
                      <li>• Estudos Radiológicos de Coluna (Caudal, Cervical, Cervicotorácica, Lombossacral, Toracolombar)</li>
                      <li>• Estudo de Pelve</li>
                      <li>• Estudo Radiológico de Traqueia</li>
                      <li>• Estudo do Pescoço</li>
                      <li>• Estudos de Membros Pélvicos</li>
                      <li>• Estudos de Membros Torácicos</li>
                      <li>• Estudo Radiográfico de Abdômen</li>
                      <li>• Estudo Radiográfico de Crânio</li>
                      <li>• Estudo Radiográfico de Tórax</li>
                      <li>• Ultrassom Guiada para CAAF</li>
                      <li>• Ultrassonografia Controle</li>
                      <li>• Ultrassonografia Ocular</li>
                      <li>• BRONCOSCOPIA E LAVADO BRONQUEOALVEOLAR</li>
                      <li>• COLONOSCOPIA DIAGNÓSTICA</li>
                      <li>• ECO (Ecocardiograma)</li>
                      <li>• ELETROQUIMIOTERAPIA</li>
                      <li>• Eletroretinograma</li>
                      <li>• Tomografia Computadorizada</li>
                      <li>• Mielografia Contrastada</li>
                      <li>• E muitos outros exames especializados</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-base font-bold text-[#277677] flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Cirurgias
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2 text-xs">
                      <div>
                        <h5 className="font-semibold text-[#277677] mb-1">Cirurgias Simples</h5>
                        <p className="text-[#302e2b]">Inclui procedimentos como ablação, amputação, cateterismo, correção de hérnias, exodontia, sutura de pele e muito mais.</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#277677] mb-1">Cirurgias Eletivas</h5>
                        <p className="text-[#302e2b]">Drenagem de abscesso, orquiectomia, ovariohisterectomia e outras cirurgias programadas.</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#277677] mb-1">Cirurgias Complexas</h5>
                        <p className="text-[#302e2b]">Procedimentos avançados como alongamento de calcâneo, artrodese, cesariana, cistotomia, correção de fraturas complexas e muito mais.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#FBF9F7] border-[#277677]/20 shadow-lg">
                  <CardHeader className="bg-[#277677]/5 border-b border-[#277677]/10">
                    <CardTitle className="text-base font-bold text-[#277677] flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Procedimentos Ambulatoriais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2 text-xs">
                      <p className="text-[#302e2b]">• Coleta de Exames de Sangue</p>
                      <p className="text-[#302e2b]">• Aplicações IM, SC, IV</p>
                      <p className="text-[#302e2b]">• Aferição da Pressão arterial</p>
                      <p className="text-[#302e2b]">• Nebulização</p>
                      <p className="text-[#302e2b]">• Oxigenioterapia</p>
                      <p className="text-[#302e2b]">• Acupuntura</p>
                      <p className="text-[#302e2b]">• Bomba de infusão</p>
                      <p className="text-[#302e2b]">• Fluidoterapia</p>
                      <p className="text-[#302e2b]">• Transfusão de sangue</p>
                      <p className="text-[#302e2b]">• E muitos outros procedimentos</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#277677] text-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center">
                      <Check className="h-4 w-4 mr-2 text-[#E1AC33]" />
                      Benefícios Especiais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#E1AC33] flex-shrink-0" />
                        <span>Desconto de 30% em medicamentos e materiais oferecidos pelo parceiro e não cobertos pelo plano</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#E1AC33] flex-shrink-0" />
                        <span>Consulta em horário normal (segunda a sábado de 08 às 20h)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#E1AC33] flex-shrink-0" />
                        <span>Consulta em horário plantão (segunda a sábado de 20 às 08h, domingos e feriados)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#E1AC33] flex-shrink-0" />
                        <span>Consulta especialista (consultar especialidades)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-3 w-3 mt-0.5 mr-1 text-[#E1AC33] flex-shrink-0" />
                        <span>Vacinas, exames de sangue, exames de imagem, cirurgias eletivas e complexas (consultar cobertura)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}