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
    <section className="min-h-screen flex items-center bg-[#FBF9F7] py-20 sm:py-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full pl-[20px] pr-[20px]">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-[#277677] text-[28px]">
              Cuidado completo para o seu <span className="text-primary">melhor amigo</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed text-[#302e2b] font-normal">
              Planos de saúde pet com cobertura nacional, sem carência, preços acessíveis a partir de R$20 e rede conveniada Hospital Animal's 24h.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#277677] flex-shrink-0" />
                    <span className="text-[#302e2b] text-sm sm:text-base">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 text-white bg-[#277677] hover:bg-[#277677]/90 rounded-lg h-12 sm:h-14 min-w-0 sm:min-w-[150px] mobile-touch-target"
              >
                Ver Planos
              </Button>
              <Button 
                className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 bg-[#277677]/20 backdrop-blur-sm hover:bg-[#277677]/30 rounded-lg h-12 sm:h-14 min-w-0 sm:min-w-[180px] border border-[#277677]/30 text-[#277677] mobile-touch-target"
              >
                Solicitar Cotação
              </Button>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
            {/* Happy pets with owners image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Família brasileira feliz com seus pets" 
                className="w-full h-auto max-h-[400px] sm:max-h-[500px] lg:max-h-none object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
            </div>
            
            {/* Floating Stats Card */}
            <Card className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-card/95 backdrop-blur-sm shadow-xl">
              <CardContent className="p-3 sm:p-6 sm:pt-6 bg-[#2776776e] pt-[12px] pb-[12px] pl-[12px] pr-[12px] text-center">
                <div className="text-lg sm:text-2xl font-bold mb-1 text-[#fbf9f7]">50.000+</div>
                <div className="text-muted-foreground text-xs sm:text-sm">Pets protegidos</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
