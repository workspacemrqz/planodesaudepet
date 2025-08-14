import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function PlansSection() {
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
    <section className="py-20 text-[#fbf9f7] bg-[#2c8587]" style={{backgroundColor: '#277677'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px] text-center">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 text-[#fbf9f7] font-bold leading-tight">
            Escolha o <span className="text-primary">plano ideal</span><br />para seu pet
          </h2>
          <p className="max-w-2xl mx-auto text-[#fbf9f7] text-base sm:text-lg md:text-xl lg:text-2xl font-medium px-4">
            Oferecemos opções com e sem coparticipação, além de planos locais com menos burocracia
          </p>
        </div>

        {/* Plan Comparison Toggle */}
        <div className="mb-8 sm:mb-12">
          <div className="p-1 rounded-lg bg-[#e1ac33] text-[#fbf9f7] mx-auto max-w-2xl">
            <Button
              onClick={() => setShowCopay(false)}
              className={`w-1/2 py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target ${!showCopay ? 'bg-[#2C8587]' : 'bg-[#E1AC33]'}`}
              style={{ transition: 'none' }}
              onMouseEnter={(e) => { e.preventDefault(); }}
              onMouseLeave={(e) => { e.preventDefault(); }}
            >
              Sem Coparticipação
            </Button>
            <Button
              onClick={() => setShowCopay(true)}
              className={`w-1/2 py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target ${showCopay ? 'bg-[#2C8587]' : 'bg-[#E1AC33]'}`}
              style={{ transition: 'none' }}
              onMouseEnter={(e) => { e.preventDefault(); }}
              onMouseLeave={(e) => { e.preventDefault(); }}
            >
              Com Coparticipação
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0 pl-[0px] pr-[0px]">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? (plan.name === 'Padrão' ? 'border-[#ffc440] border-2' : 'border-primary border-2') : 'unipet-card'} shadow-lg flex flex-col h-full ${plan.name === 'Padrão' ? 'bg-[#FBF9F7]' : 'bg-[#fbf9f7]'}`}>
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="inline-flex items-center rounded-full border px-2 sm:px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-[#ffc440] text-[#fbf9f7]">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className={`text-center pb-3 sm:pb-4 rounded-t-lg ${plan.name === 'Padrão' ? 'bg-[#FBF9F7] text-[#E1AC33]' : 'bg-[#fbf9f7] text-[#e1ac33]'}`}>
                <CardTitle className={`font-semibold tracking-tight mb-2 text-xl sm:text-2xl lg:text-3xl ${plan.name === 'Padrão' ? 'text-[#E1AC33]' : 'text-[#32989a]'}`}>{plan.name}</CardTitle>
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${plan.name === 'Padrão' ? 'text-[#E1AC33]' : 'text-[#32989a]'}`}>
                  R${plan.price}
                  <span className={`text-sm sm:text-base lg:text-lg font-normal ${plan.name === 'Padrão' ? 'text-[#E1AC33]' : 'text-[#32989a]'}`}>/mês</span>
                </div>
                <div className="px-3 sm:px-4 py-2 rounded-xl bg-[#e8e8e8]">
                  <p className={`font-medium text-sm sm:text-base ${plan.name === 'Padrão' ? 'text-[#E1AC33]' : 'text-[#277677]'}`}>{plan.description}</p>
                </div>
              </CardHeader>
              
              <CardContent className={`flex flex-col flex-grow p-4 sm:p-6 ${plan.name === 'Padrão' ? 'text-[#E1AC33] bg-[#FBF9F7]' : 'text-[#277677]'}`}>
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.name === 'Padrão' ? 'text-[#E1AC33]' : 'text-[#277677]'}`} />
                      <span className="text-sm sm:text-base lg:text-[17px] font-normal text-[#302e2b] leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 sm:h-12 px-4 py-2 w-full mt-auto text-sm sm:text-base mobile-touch-target ${plan.name === 'Padrão' ? 'bg-[#E1AC33] text-[#FBF9F7]' : 'bg-[#32989a] text-white'}`}
                >
                  Contratar Plano {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Local Plans CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/20 max-w-4xl mx-auto shadow-xl border-primary/30 shadow-lg">
            <CardContent className="pt-8">
              <h3 className="font-bold mb-4 text-[#fbf9f7] text-[30px]">Planos Locais com Menos Burocracia</h3>
              <p className="mb-6 text-[#fbf9f7] text-[18px] font-normal">
                Oferecemos também planos regionais com processo simplificado e atendimento personalizado para sua região.
              </p>
              <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 unipet-button-primary text-lg px-8 py-3 bg-[#e1ac33] text-[#fbf9f7]">
                Consultar Planos Locais
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
