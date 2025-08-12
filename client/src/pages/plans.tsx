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
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nossos <span className="text-primary">Planos</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para seu pet. Oferecemos opções com e sem coparticipação.
          </p>
        </div>

        {/* Plan Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-secondary p-1 rounded-lg">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary border-2' : 'unipet-card hover:border-primary/50'} transition-colors duration-300`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl text-primary mb-2">{plan.name}</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  R${plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'unipet-button-primary' : 'bg-secondary hover:bg-primary hover:text-primary-foreground'} transition-colors duration-200`}
                >
                  Contratar Plano
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="unipet-card">
            <CardHeader>
              <CardTitle className="text-primary">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Carência</h4>
                <p className="text-muted-foreground text-sm">Todos os planos têm início imediato, sem período de carência.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Limites de Uso</h4>
                <p className="text-muted-foreground text-sm">Consulte os limites específicos de cada serviço no contrato do plano escolhido.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Coparticipação</h4>
                <p className="text-muted-foreground text-sm">Nos planos com coparticipação, você paga uma taxa reduzida por alguns procedimentos.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="unipet-card">
            <CardHeader>
              <CardTitle className="text-primary">Planos Locais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Oferecemos planos regionais com menos burocracia e processo simplificado para sua região.
              </p>
              <Button className="unipet-button-primary">
                Consultar Planos Locais
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
