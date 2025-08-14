import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function Plans() {
  const [showCopay, setShowCopay] = useState(false);

  const plans = [
    {
      name: "Básico",
      price: showCopay ? 15 : 20,
      description: "Proteção essencial para seu pet",
      features: [
        "Consultas veterinárias",
        "Vacinas anuais",
        "Emergências básicas",
        "Telemedicina veterinária"
      ],
      popular: false
    },
    {
      name: "Padrão", 
      price: showCopay ? 35 : 45,
      description: "Cobertura completa e tranquilidade",
      features: [
        "Tudo do plano Básico",
        "Exames laboratoriais",
        "Cirurgias de pequeno porte",
        "Internações",
        "Hospital Animal's 24h"
      ],
      popular: true
    },
    {
      name: "Premium",
      price: showCopay ? 60 : 80,
      description: "Máxima proteção e benefícios",
      features: [
        "Tudo do plano Padrão",
        "Cirurgias de grande porte",
        "Fisioterapia veterinária",
        "Medicina preventiva completa",
        "Cobertura nacional"
      ],
      popular: false
    }
  ];

  return (
    <main>
      {/* Plans Section */}
      <section className="pt-32 pb-20 text-[#fbf9f7] bg-[#277677]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="sm:text-3xl md:text-4xl lg:text-5xl mb-4 text-[#fbf9f7] font-bold text-[34px]">
              Nossos <span className="text-[#E1AC33]">Planos</span>
            </h2>
            <p className="max-w-2xl mx-auto text-[#fbf9f7] sm:text-lg md:text-xl mb-6 sm:mb-8 px-4 pl-[0px] pr-[0px] font-normal text-[18px]">
              Escolha a proteção ideal<br />para seu melhor amigo
            </p>
            
            

            {/* Plan Toggle */}
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
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-5xl mx-auto px-4 sm:px-0 pl-[0px] pr-[0px]">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative transition-all duration-300 hover:shadow-2xl ${plan.popular ? 'bg-[#FBF9F7] border-[#E1AC33] border-2 md:transform md:scale-105' : 'bg-[#FBF9F7] border-[#277677]/30'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#E1AC33] text-[#FBF9F7] px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                  <CardTitle className="tracking-tight sm:text-2xl lg:text-3xl font-bold text-[#277677] sm:mb-4 text-[26px] mt-[0px] mb-[0px] pt-[4px] pb-[4px]">{plan.name}</CardTitle>
                  <div className="mb-3 sm:mb-4">
                    <span className="sm:text-3xl lg:text-4xl font-bold text-[#277677] text-[28px]">R${plan.price}</span>
                    <span className="text-sm sm:text-base lg:text-lg font-medium text-[#302e2b]">/mês</span>
                  </div>
                  <div className="bg-[#277677]/10 px-3 sm:px-4 py-2 sm:py-3 rounded-xl">
                    <p className="text-[#277677] font-medium text-sm sm:text-base lg:text-lg">{plan.description}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.name === 'Padrão' ? 'text-[#E1AC33]' : 'text-[#277677]'}`} />
                        <span className="text-sm sm:text-base lg:text-[17px] font-normal text-[#302e2b] leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full h-10 sm:h-12 text-sm sm:text-base lg:text-lg font-semibold rounded-lg transition-all duration-200 mobile-touch-target ${
                      plan.popular 
                        ? 'bg-[#E1AC33] hover:bg-[#E1AC33]/90 text-[#FBF9F7]' 
                        : 'bg-[#277677] hover:bg-[#277677]/90 text-[#FBF9F7]'
                    }`}
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    Contratar Plano {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Additional Information Section */}
      <section className="py-20 bg-[#DED8CE]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold mb-4 text-[#302e2b]">
              Informações <span className="text-[#277677]">importantes</span>
            </h2>
            <p className="text-[24px] text-[#302e2b] max-w-2xl mx-auto font-medium">
              Tudo que você precisa saber sobre nossos planos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-2xl p-8 shadow-xl bg-[#fbf9f7]">
              <h3 className="text-[24px] font-bold text-[#302e2b] mb-6">Informações Gerais</h3>
              <div className="space-y-6">
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

            <div className="rounded-2xl p-8 shadow-xl bg-[#fbf9f7]">
              <h3 className="text-[24px] font-bold text-[#302e2b] mb-6">Planos Locais</h3>
              <div className="space-y-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2 text-[#302e2b] text-[18px]">Cobertura Regional</h4>
                  <p className="text-[#302e2b] text-[16px]">Oferecemos também planos regionais com processo<br />simplificado e atendimento personalizado para sua região.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-[#302e2b] text-[18px]">Rede Credenciada Local</h4>
                  <p className="text-[#302e2b] text-[16px]">Acesso facilitado a veterinários e clínicas parceiras próximas à sua localidade.</p>
                </div>
                
              </div>
              <Button 
                className="bg-[#E1AC33] hover:bg-[#E1AC33]/90 text-[#FBF9F7] font-semibold px-8 py-3 text-[18px] rounded-lg h-12"
                data-testid="button-local-plans"
              >
                Consultar Planos Locais
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}