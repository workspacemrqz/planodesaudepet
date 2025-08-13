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
        "Consultas clínicas gerais",
        "Vacinas obrigatórias",
        "Alguns exames laboratoriais",
        "Internação básica",
        "Telemedicina veterinária"
      ],
      popular: false
    },
    {
      name: "Intermediário", 
      price: showCopay ? 35 : 50,
      description: "Cobertura ampliada e tranquilidade",
      features: [
        "Consultas veterinárias",
        "Vacinas completas",
        "Exames laboratoriais ampliados",
        "Ultrassonografia",
        "Internação e anestesia básica",
        "Hospital Animal's 24h"
      ],
      popular: true
    },
    {
      name: "Completo",
      price: showCopay ? 70 : 100,
      description: "Cobertura completa com especialistas",
      features: [
        "Consultas especializadas",
        "Exames de imagem",
        "Cirurgias eletivas",
        "Anestesias avançadas",
        "Fisioterapia veterinária",
        "Medicina preventiva"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: showCopay ? 140 : 200,
      description: "Máxima proteção e benefícios",
      features: [
        "Cobertura completa",
        "Consultas especializadas",
        "Vacinas diversas",
        "Exames laboratoriais e de imagem",
        "Internações",
        "Cirurgias simples e complexas",
        "Cobertura nacional"
      ],
      popular: false
    }
  ];

  return (
    <main className="pt-24 pb-20 text-[#fbf9f7] bg-[#2c8587]" style={{backgroundColor: '#277677'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="md:text-4xl mb-4 text-[#fbf9f7] text-[40px] font-bold">
            Escolha o <span className="text-primary">plano ideal</span> para seu pet
          </h1>
          <p className="max-w-2xl mx-auto text-[#fbf9f7] text-[24px] font-medium">
            Oferecemos opções com e sem coparticipação, além de planos locais com menos burocracia
          </p>
        </div>

        {/* Plan Toggle */}
        <div className="flex justify-center mb-12">
          <div className="p-1 rounded-lg bg-[#e1ac33] text-[#fbf9f7]">
            <Button
              onClick={() => setShowCopay(false)}
              className={`px-6 py-2 text-[#FBF9F7] font-medium rounded-md ${!showCopay ? 'bg-[#2C8587]' : 'bg-[#E1AC33]'}`}
              style={{ transition: 'none' }}
              onMouseEnter={(e) => { e.preventDefault(); }}
              onMouseLeave={(e) => { e.preventDefault(); }}
            >
              Sem Coparticipação
            </Button>
            <Button
              onClick={() => setShowCopay(true)}
              className={`px-6 py-2 text-[#FBF9F7] font-medium rounded-md ${showCopay ? 'bg-[#2C8587]' : 'bg-[#E1AC33]'}`}
              style={{ transition: 'none' }}
              onMouseEnter={(e) => { e.preventDefault(); }}
              onMouseLeave={(e) => { e.preventDefault(); }}
            >
              Com Coparticipação
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? (plan.name === 'Intermediário' ? 'border-[#ffc440] border-3 shadow-2xl transform scale-105 ring-2 ring-[#ffc440]/30 hover:scale-110 hover:shadow-3xl hover:ring-4 hover:ring-[#ffc440]/50 plano-padrao-destaque plano-destaque-glow' : 'border-primary border-2') : 'unipet-card'} shadow-lg flex flex-col h-full ${plan.name === 'Intermediário' ? 'bg-[#FBF9F7]' : 'bg-[#fbf9f7]'} transition-all duration-300 cursor-pointer`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent animate-pulse ${plan.name === 'Intermediário' ? 'bg-gradient-to-r from-[#ffc440] to-[#ffb800] text-[#fbf9f7] shadow-lg' : 'bg-[#ffc440] text-[#fbf9f7]'}`}>
                    {plan.name === 'Intermediário' ? '⭐ MAIS POPULAR ⭐' : 'Mais Popular'}
                  </Badge>
                </div>
              )}
              
              <CardHeader className={`text-center pb-4 rounded-t-lg ${plan.name === 'Intermediário' ? 'bg-[#FBF9F7] text-[#E1AC33]' : 'bg-[#fbf9f7] text-[#e1ac33]'}`}>
                <CardTitle className={`font-semibold tracking-tight mb-2 text-[30px] ${plan.name === 'Intermediário' ? 'text-[#E1AC33]' : 'text-[#32989a]'}`}>{plan.name}</CardTitle>
                <div className={`text-4xl font-bold mb-2 ${plan.name === 'Intermediário' ? 'text-[#E1AC33]' : 'text-[#32989a]'}`}>
                  R${plan.price}
                  <span className={`text-lg font-normal ${plan.name === 'Intermediário' ? 'text-[#E1AC33]' : 'text-[#32989a]'}`}>/mês</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#e8e8e8]">
                  <p className={`font-medium ${plan.name === 'Intermediário' ? 'text-[#E1AC33]' : 'text-[#277677]'}`}>{plan.description}</p>
                </div>
              </CardHeader>
              
              <CardContent className={`flex flex-col flex-grow ${plan.name === 'Intermediário' ? 'text-[#E1AC33] bg-[#FBF9F7]' : 'text-[#277677]'}`}>
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className={`h-4 w-4 flex-shrink-0 ${plan.name === 'Intermediário' ? 'text-[#E1AC33]' : 'text-[#277677]'}`} />
                      <span className="text-[17px] font-normal text-[#302e2b]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 px-4 py-2 w-full mt-auto text-[16px] ${plan.name === 'Intermediário' ? 'bg-[#E1AC33] text-[#FBF9F7]' : 'bg-[#32989a] text-white'}`}
                >
                  Contratar Plano {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="text-center">
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
    </main>
  );
}
