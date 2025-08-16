import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, DollarSign, CalendarCheck, Hospital, MapPin, UserCheck, Microscope, Ambulance } from "lucide-react";
import { useLocation } from "wouter";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";
import { getImageUrlSync } from "@/lib/image-utils";

export default function Features() {
  const [, setLocation] = useLocation();
  const { settings } = useSiteSettingsWithDefaults();
  
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
      description: "Atendimento rápido para agendar consultas com facilidade"
    },
    {
      icon: Hospital,
      title: "Rede 24h",
      description: "Atendimento 24 h para urgencia e emergência"
    }
  ];

  const networkFeatures = [
    {
      icon: MapPin,
      text: "Unidades em teresina e região"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        <div className="text-center mb-12 sm:mb-16">
          <AnimatedSection animation="slideUp" delay={200}>
            <h2 className="font-bold mb-4 text-[#302e2b] text-[28px] md:text-[36px] leading-tight">
              Por que escolher a <span className="text-[#277677]">UNIPET PLAN?</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={400}>
            <p className="text-[18px] text-[#302e2b] max-w-2xl mx-auto font-normal px-4">
              Oferecemos o melhor cuidado para seu pet, com praticidade e confiança
            </p>
          </AnimatedSection>
        </div>

        <AnimatedList 
          animation="slideUp" 
          delay={600} 
          staggerDelay={150}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20 px-4 sm:px-0 pl-[0px] pr-[0px]"
        >
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="text-center border border-primary/30 rounded-lg p-4 sm:p-6 shadow-md text-[#fbf9f7] bg-[#277677] mt-[0px] mb-[0px] pt-[12px] pb-[12px] pl-[16px] pr-[16px] ml-[0px] mr-[0px] h-[200px] sm:h-[240px] flex flex-col items-center"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#fbf9f7] bg-[#036566]">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#FBF9F7]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#fbf9f7]">{feature.title}</h3>
                <p className="text-sm sm:text-base text-[#fbf9f7] leading-relaxed px-0 sm:px-2">{feature.description}</p>
              </div>
            );
          })}
        </AnimatedList>

        {/* Network Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center px-4 sm:px-0 pl-[0px] pr-[0px]">
          <div className="order-2 lg:order-1">
            <AnimatedSection animation="slideRight" delay={1000}>
              {/* Network credentialed image */}
              <img 
                src={getImageUrlSync(settings.networkImage, 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600')} 
                alt="Rede credenciada de hospitais veterinários" 
                className="rounded-2xl shadow-xl w-full h-auto max-h-[300px] sm:max-h-[400px] lg:max-h-none object-cover" 
              />
            </AnimatedSection>
          </div>
          <div className="order-1 lg:order-2">
            <AnimatedSection animation="slideLeft" delay={1000}>
              <h3 className="sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-[#302e2b] text-[25px]">
                Rede Credenciada<br /><span className="text-[#277677]">Hospital 24h</span>
              </h3>
            </AnimatedSection>
            <AnimatedSection animation="slideLeft" delay={1200}>
              <p className="text-[#302e2b] text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                Tenha acesso a uma das maiores redes de hospitais veterinários do Brasil, 
                com atendimento 24 horas e profissionais especializados.
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="slideLeft" delay={1400}>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {networkFeatures.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#277677] flex-shrink-0" />
                      <span className="text-[#302e2b] text-sm sm:text-base">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="scale" delay={1600}>
              <Button 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 sm:h-12 px-4 py-2 unipet-button-primary text-white bg-[#277677] mobile-touch-target w-full sm:w-auto"
                onClick={() => {
                  setLocation('/rede-credenciada');
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
              >
                Encontrar Unidade Próxima
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
