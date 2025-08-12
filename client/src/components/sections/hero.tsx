import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, DollarSign, Clock, Hospital } from "lucide-react";

export default function Hero() {
  const benefits = [
    {
      icon: CheckCircle,
      text: "Sem carência de início"
    },
    {
      icon: DollarSign,
      text: "A partir de R$20/mês"
    },
    {
      icon: Clock,
      text: "Agendamento rápido"
    },
    {
      icon: Hospital,
      text: "Rede 24h conveniada"
    }
  ];

  return (
    <section className="min-h-screen flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Cuidado completo para o seu <span className="text-primary">melhor amigo</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Planos de saúde pet com cobertura nacional, sem carência, preços acessíveis a partir de R$20 e rede conveniada Hospital Animal's 24h.
            </p>
            
            {/* Key Benefits */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="unipet-button-primary text-white text-lg px-8 py-3">
                Ver Planos
              </Button>
              <Button 
                className="unipet-button-secondary text-lg px-8 py-3 text-[#ffffff] !text-[#ffffff] hover:!text-[#ffffff]"
              >
                Solicitar Cotação
              </Button>
            </div>
          </div>

          <div className="relative">
            {/* Happy pets with owners image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Família brasileira feliz com seus pets" 
                className="w-full h-auto" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
            </div>
            
            {/* Floating Stats Card */}
            <Card className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-sm shadow-xl">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#E1AC33] mb-1">50.000+</div>
                <div className="text-muted-foreground text-sm">Pets protegidos</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
