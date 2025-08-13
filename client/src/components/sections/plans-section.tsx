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
    <section className="py-20 bg-[#32989a] text-[#fbf9f7]" style={{backgroundColor: '#FBF9F7'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="md:text-4xl mb-4 text-[#fbf9f7] text-[40px] font-bold">
            Escolha o <span className="text-primary">plano ideal</span> para seu pet
          </h2>
          <p className="max-w-2xl mx-auto text-[#fbf9f7] font-semibold text-[22px]">
            Oferecemos opções com e sem coparticipação, além de planos locais com menos burocracia
          </p>
        </div>

        {/* Plan Comparison Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted p-1 rounded-lg">
            <Button
              variant={!showCopay ? "default" : "ghost"}
              onClick={() => setShowCopay(false)}
              className="px-6 py-2"
            >
              Sem Coparticipação
            </Button>
            <Button
              variant={showCopay ? "default" : "ghost"}
              onClick={() => setShowCopay(true)}
              className="px-6 py-2"
            >
              Com Coparticipação
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary border-2' : 'unipet-card'} shadow-lg flex flex-col h-full bg-[#fbf9f7]`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4 bg-[#fbf9f7] text-[#e1ac33]">
                <CardTitle className="font-semibold tracking-tight mb-2 text-[#32989a] text-[30px]">{plan.name}</CardTitle>
                <div className="text-4xl font-bold mb-2 text-[#32989a]">
                  R${plan.price}
                  <span className="text-lg font-normal text-[#32989a]">/mês</span>
                </div>
                <div className="bg-[#F3EEE8] px-4 py-2 rounded-lg">
                  <p className="text-[#277677] font-medium">{plan.description}</p>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-grow text-[#277677]">
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-[#277677] flex-shrink-0" />
                      <span className="text-[#277677]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full bg-[#E1AC33] text-white mt-auto"
                >
                  Contratar Plano
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Local Plans CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/20 max-w-4xl mx-auto shadow-xl border-primary/30 shadow-lg">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold text-primary mb-4">Planos Locais com Menos Burocracia</h3>
              <p className="text-white text-lg mb-6">
                Oferecemos também planos regionais com processo simplificado e atendimento personalizado para sua região.
              </p>
              <Button className="unipet-button-primary text-white text-lg px-8 py-3">
                Consultar Planos Locais
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
