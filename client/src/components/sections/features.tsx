import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, DollarSign, CalendarCheck, Heart, MapPin, UserCheck, Microscope, Car } from "lucide-react";
import { useLocation } from "wouter";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";
import { RobustImage } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Base64ImageDisplay } from "@/components/Base64ImageDisplay";

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
      icon: Heart,
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
      icon: Car,
      text: "Atendimento de emergência"
    }
  ];

  return (
    <section className="py-20" style={{backgroundColor: '#FBF9F7'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        <div className="text-center mb-12 sm:mb-16">
          <AnimatedSection animation="slideUp" delay={100}>
            <h2 className="font-bold mb-4 text-[#302e2b] text-[28px] md:text-[36px] leading-tight">
              Por que escolher a <span className="text-[#277677]">UNIPET PLAN?</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={200}>
            <p className="text-[18px] text-[#302e2b] max-w-2xl mx-auto font-normal px-4">
              Oferecemos o melhor cuidado para seu pet, com praticidade e confiança
            </p>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mb-16 sm:mb-20 px-4 sm:px-0 pl-[0px] pr-[0px] relative z-10">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Feature 
                key={index} 
                feature={feature} 
                index={index} 
              />
            );
          })}
        </div>

        {/* Network Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center px-4 sm:px-0 pl-[0px] pr-[0px]">
          <div className="order-2 lg:order-1">
            <AnimatedSection animation="slideRight" delay={500}>
              {/* Network credentialed image */}
              <Base64ImageDisplay 
                base64Data={settings.networkImage}
                alt="Rede credenciada de hospitais veterinários" 
                fallbackSrc="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                className="rounded-2xl shadow-xl w-full h-auto max-h-[300px] sm:max-h-[400px] lg:max-h-none object-cover" 
                onError={() => console.warn('Features network image error')}
              />
            </AnimatedSection>
          </div>
          <div className="order-1 lg:order-2">
            <AnimatedSection animation="slideLeft" delay={500}>
              <h3 className="sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-[#302e2b] text-[25px]">
                Rede Credenciada<br /><span className="text-[#277677]">Hospital 24h</span>
              </h3>
            </AnimatedSection>
            <AnimatedSection animation="slideLeft" delay={600}>
              <p className="text-[#302e2b] text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 leading-relaxed">
                Tenha acesso a uma das maiores redes de hospitais veterinários do Brasil, 
                com atendimento 24 horas e profissionais especializados.
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="slideLeft" delay={700}>
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
            
            <AnimatedSection animation="scale" delay={800}>
              <Button 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 sm:h-12 px-4 py-2 unipet-button-primary text-white mobile-touch-target w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(to top, #1c6363, #277677)'
                }}
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

const Feature = ({
  feature,
  index,
}: {
  feature: {
    icon: any;
    title: string;
    description: string;
  };
  index: number;
}) => {
  const Icon = feature.icon;
  
  return (
    <div
      className={cn(
        "flex flex-col py-10 relative group/feature text-[#FBF9F7]",
        (index === 0 || index === 4) && "lg:border-l border-[#036566]",
        index < 4 && "lg:border-b border-[#036566]",
        // Adiciona borda direita apenas para os containers que não são o último
        index < 3 && "lg:border-r border-[#036566]",
        // Desktop: Início Imediato (index 0) - bordas esquerda arredondadas
        index === 0 && "lg:rounded-l-lg lg:rounded-tr-none",
        // Desktop: Rede 24h (index 3) - bordas direita arredondadas  
        index === 3 && "lg:rounded-r-lg",
        // Mobile: Início Imediato (index 0) - bordas topo arredondadas
        index === 0 && "rounded-t-lg",
        // Mobile: Rede 24h (index 3) - bordas base arredondadas
        index === 3 && "rounded-b-lg lg:rounded-b-none"
      )}
      style={{ backgroundColor: '#277677' }}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100/10 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100/10 to-transparent pointer-events-none" />
      )}
      
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#FBF9F7]" />
      </div>
      
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-[#E1AC33] transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-[#FBF9F7]">
          {feature.title}
        </span>
      </div>
      
      <p className="text-sm text-[#FBF9F7] max-w-xs relative z-10 px-10">
        {feature.description}
      </p>
    </div>
  );
};
