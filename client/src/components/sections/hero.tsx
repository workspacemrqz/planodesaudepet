import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, DollarSign, Clock, Hospital } from "lucide-react";
import { useLocation } from "wouter";
import { useWhatsAppRedirect } from "@/hooks/use-whatsapp-redirect";
import { AnimatedSection, AnimatedList } from "@/components/ui/animated-section";
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";
import { RobustImage } from "@/components/ui/image";
import { Typewriter } from "@/components/ui/typewriter";
import { OptimizedImage } from "@/components/ui/optimized-image";

export default function Hero() {
  const [, setLocation] = useLocation();
  const { redirectToWhatsApp } = useWhatsAppRedirect();
  const { settings } = useSiteSettingsWithDefaults();
  
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
      text: "Atendimento emergencial 24h"
    }
  ];

  return (
    <section className="min-h-screen flex items-center bg-[#FBF9F7] pt-8 pb-20 sm:py-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full pl-[20px] pr-[20px]">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <AnimatedSection animation="slideUp" delay={100}>
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-[#302e2b] leading-tight"
              >
                Cuidado completo para o seu{" "}
                <span className="text-primary">
                  <Typewriter 
                    text={[
                      "melhor amigo",
                      "companheiro de quatro patas",
                      "membro da família",
                      "xodó da casa",
                      "pet"
                    ]}
                    speed={100}
                    waitTime={3000}
                    deleteSpeed={50}
                    loop={true}
                    showCursor={true}
                    cursorChar="|"
                    cursorClassName="ml-1"
                  />
                </span>
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="slideUp" delay={200}>
              <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed text-[#302e2b] font-normal">
                Planos de saúde pet sem carência, cobertura para animais domésticos e Silvestres com preços acessíveis a partir de R$20/mês.
              </p>
            </AnimatedSection>
            
            {/* Key Benefits */}
            <AnimatedSection animation="slideUp" delay={300}>
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
            </AnimatedSection>

            <AnimatedSection animation="slideUp" delay={400}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 text-white rounded-lg h-12 sm:h-14 min-w-0 sm:min-w-[150px] mobile-touch-target"
                style={{
                  background: 'linear-gradient(to top, #1c6363, #277677)'
                }}
                onClick={() => {
                  setLocation('/planos');
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
              >
                Ver Planos
              </Button>
              <Button 
                className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 bg-[#277677]/20 backdrop-blur-sm hover:bg-[#277677]/30 rounded-lg h-12 sm:h-14 min-w-0 sm:min-w-[180px] border border-[#277677]/30 text-[#277677] mobile-touch-target"
                onClick={() => window.open('https://wa.me/558632327374', '_blank')}
              >
                Solicitar Cotação
              </Button>
              </div>
            </AnimatedSection>
          </div>

          <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
            <AnimatedSection animation="slideLeft" delay={150}>
              {/* Happy pets with owners image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <OptimizedImage 
                  src={settings.mainImage}
                  fallback="/Cachorros.jpg"
                  alt="Família brasileira feliz com seus pets" 
                  fallbackSrc="/Cachorros.jpg"
                  className="w-full h-auto max-h-[400px] sm:max-h-[500px] lg:max-h-none object-cover" 
                  onError={(error) => console.warn('Hero image error:', error)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent"></div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="scale" delay={500}>
              {/* Floating Stats Card */}
              <Card className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-card/95 backdrop-blur-sm shadow-xl rounded-xl">
                <CardContent className="p-3 sm:p-6 sm:pt-6 bg-[#2776776e] pt-[12px] pb-[12px] pl-[12px] pr-[12px] text-center rounded-xl">
                  <div 
                    className="text-lg sm:text-2xl font-bold mb-1 text-[#fbf9f7]"
                  >
                    50.000+
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">Pets Atendidos</div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
