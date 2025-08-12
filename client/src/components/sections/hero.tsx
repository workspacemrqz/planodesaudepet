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
            <p className="text-xl text-white/90 mb-8 leading-relaxed" style={{ lineHeight: "1.7" }}>
              Planos de saúde pet com cobertura nacional, sem carência, preços acessíveis a partir de R$20 e rede conveniada Hospital Animal's 24h.
            </p>
            
            {/* Key Benefits */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-white/90">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="unipet-button-primary text-lg px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Ver Planos
              </Button>
              <Button 
                variant="outline" 
                className="text-lg px-8 py-4 font-semibold border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Solicitar Cotação
              </Button>
            </div>
          </div>

          <div className="relative">
            {/* Happy pets with owners image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Família brasileira feliz com seus pets" 
                className="w-full h-auto filter brightness-110 contrast-105" 
                style={{ filter: "sepia(5%) hue-rotate(180deg) brightness(110%) contrast(105%)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
            </div>
            
            {/* Floating Stats Card - Repositioned */}
            <Card className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-primary/20">
              <CardContent className="pt-4 pb-4 px-6">
                <div className="text-2xl font-bold text-primary mb-1">50.000+</div>
                <div className="text-[#101010] text-sm font-medium">Pets protegidos</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
