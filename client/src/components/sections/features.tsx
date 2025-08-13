import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, DollarSign, CalendarCheck, Hospital, MapPin, UserCheck, Microscope, Ambulance } from "lucide-react";

export default function Features() {
  const mainFeatures = [
    {
      icon: Rocket,
      title: "Início Imediato",
      description: "Sem carência, seu pet estará protegido desde o primeiro dia"
    },
    {
      icon: DollarSign,
      title: "Preços Acessíveis", 
      description: "Planos a partir de R$20 para caber no seu orçamento"
    },
    {
      icon: CalendarCheck,
      title: "Agendamento Rápido",
      description: "Sistema online para agendar consultas com facilidade"
    },
    {
      icon: Hospital,
      title: "Rede 24h",
      description: "Hospital Animal's 24h conveniado em todo o país"
    }
  ];

  const networkFeatures = [
    {
      icon: MapPin,
      text: "Mais de 200 unidades no Brasil"
    },
    {
      icon: UserCheck,
      text: "Veterinários especializados"
    },
    {
      icon: Microscope,
      text: "Equipamentos de última geração"
    },
    {
      icon: Ambulance,
      text: "Atendimento de emergência"
    }
  ];

  return (
    <section className="py-20" style={{backgroundColor: '#FBF9F7'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#302e2b]">
            Por que escolher a <span className="text-[#277677]">UNIPET PLAN?</span>
          </h2>
          <p className="text-xl text-[#302e2b] max-w-2xl mx-auto">
            Oferecemos o melhor cuidado para seu pet com praticidade e confiança
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center border border-primary/30 rounded-lg p-6 shadow-md text-[#fbf9f7] bg-[#277677]">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#302e2b] bg-[#165e662e]">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#fbf9f7]">{feature.title}</h3>
                <p className="text-[#fbf9f7]">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Network Information */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Modern veterinary clinic image */}
            <img 
              src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Clínica veterinária moderna" 
              className="rounded-2xl shadow-xl w-full h-auto" 
            />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[#302e2b]">
              Rede Credenciada <span className="text-[#277677]">Hospital Animal's 24h</span>
            </h3>
            <p className="text-[#302e2b] text-lg mb-6">
              Tenha acesso a uma das maiores redes de hospitais veterinários do Brasil, 
              com atendimento 24 horas e profissionais especializados.
            </p>
            
            <div className="space-y-4 mb-8">
              {networkFeatures.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-[#302e2b]">{item.text}</span>
                  </div>
                );
              })}
            </div>
            
            <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 px-4 py-2 unipet-button-primary text-white bg-[#277677]">
              Encontrar Unidade Próxima
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
