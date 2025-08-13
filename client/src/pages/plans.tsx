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
    <main className="pt-16" style={{backgroundColor: '#FBF9F7'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#277677]">
              Escolha o <span className="text-[#E1AC33]">plano ideal</span> para seu pet
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-[#302e2b] font-normal max-w-2xl mx-auto">
              Oferecemos opções com e sem coparticipação, além de planos locais com menos burocracia
            </p>
          </div>

          {/* Plan Toggle */}
          <div className="flex justify-center mb-12">
            <div className="p-1 rounded-lg bg-[#E1AC33] text-[#fbf9f7]">
              <Button
                onClick={() => setShowCopay(false)}
                className={`px-6 py-2 text-[#FBF9F7] font-medium rounded-md ${!showCopay ? 'bg-[#277677]' : 'bg-[#E1AC33]'}`}
                style={{ transition: 'none' }}
                onMouseEnter={(e) => { e.preventDefault(); }}
                data-testid="button-no-copay"
              >
                Sem Coparticipação
              </Button>
              <Button
                onClick={() => setShowCopay(true)}
                className={`px-6 py-2 text-[#FBF9F7] font-medium rounded-md ${showCopay ? 'bg-[#277677]' : 'bg-[#E1AC33]'}`}
                style={{ transition: 'none' }}
                onMouseEnter={(e) => { e.preventDefault(); }}
                data-testid="button-with-copay"
              >
                Com Coparticipação
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative transition-all duration-300 hover:shadow-2xl ${plan.popular ? 'bg-[#FBF9F7] border-[#E1AC33] border-2 transform scale-105' : 'bg-[#FBF9F7] border-[#277677]/30'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#E1AC33] text-[#FBF9F7] px-4 py-2 text-sm font-semibold">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-[32px] font-bold text-[#277677] mb-4">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-[48px] font-bold text-[#277677]">R${plan.price}</span>
                    <span className="text-[20px] font-medium text-[#302e2b]">/mês</span>
                  </div>
                  <div className="bg-[#277677]/10 px-4 py-3 rounded-xl">
                    <p className="text-[#277677] font-medium text-[18px]">{plan.description}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-8">
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className={`h-4 w-4 flex-shrink-0 ${plan.name === 'Padrão' ? 'text-[#E1AC33]' : 'text-[#277677]'}`} />
                        <span className="text-[17px] font-normal text-[#302e2b]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full h-12 text-[18px] font-semibold rounded-lg transition-all duration-200 ${
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
        </section>

        {/* Additional Information Section */}
        <section className="py-20 bg-[#277677]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[36px] font-bold mb-4 text-[#FBF9F7]">
                Informações <span className="text-[#E1AC33]">importantes</span>
              </h2>
              <p className="text-[24px] text-[#FBF9F7] max-w-2xl mx-auto font-medium">
                Tudo que você precisa saber sobre nossos planos
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-[#FBF9F7] rounded-2xl p-8 shadow-xl">
                <h3 className="text-[24px] font-bold text-[#277677] mb-6">Informações Gerais</h3>
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

              <div className="bg-[#FBF9F7] rounded-2xl p-8 shadow-xl">
                <h3 className="text-[24px] font-bold text-[#277677] mb-6">Planos Locais</h3>
                <p className="text-[#302e2b] mb-6 text-[16px]">
                  Oferecemos planos regionais com menos burocracia e processo simplificado para sua região.
                </p>
                <Button 
                  className="bg-[#277677] hover:bg-[#277677]/90 text-[#FBF9F7] font-semibold px-8 py-3 text-[18px] rounded-lg h-12"
                  data-testid="button-local-plans"
                >
                  Consultar Planos Locais
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
