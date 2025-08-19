import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";
import { getImageUrlSync } from "@/lib/image-utils";

export default function About() {
  const { settings, shouldShow } = useSiteSettingsWithDefaults();
  


  const values = [
    {
      title: "Missão",
      content: "Garantir que todos os pets tenham acesso a cuidados de saúde de qualidade, proporcionando tranquilidade às famílias brasileiras que amam seus animais de estimação."
    },
    {
      title: "Visão", 
      content: "Ser a principal referência em planos de saúde para pets no Brasil, reconhecida pela excelência no atendimento e compromisso com o bem-estar animal."
    },
    {
      title: "Valores",
      content: "Transparência, comprometimento com o bem-estar animal, atendimento humanizado, preços justos e acessibilidade para todas as famílias brasileiras."
    }
  ];

  return (
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <AnimatedSection animation="slideUp" delay={100}>
            <h1 className="font-bold mb-4 text-white text-[28px] md:text-[36px]">
              Sobre a <span className="text-[#e1ac33]">UNIPET PLAN</span>
            </h1>
          </AnimatedSection>
        </div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <AnimatedSection animation="slideRight" delay={200}>
            <div>
              <img 
                src={getImageUrlSync(settings.aboutImage, '/inicio-sobre.jpg')} 
                alt="Conceito de seguro pet com veterinário cuidando de animal"
                className="rounded-2xl shadow-xl w-full h-auto sm:mt-0 mt-[-2rem]"
              />
            </div>
          </AnimatedSection>
          <div>
            <AnimatedSection animation="slideLeft" delay={200}>
              <h2 className="text-3xl font-bold mb-6 text-[#e1ac33]">Nossa História</h2>
            </AnimatedSection>
            <AnimatedSection animation="slideLeft" delay={300}>
              {shouldShow.ourStory && (
                <div className="text-lg leading-relaxed text-[#ffffff] whitespace-pre-line">
                  {settings.ourStory}
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>



        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {values.map((item, index) => (
            <AnimatedSection key={index} animation="slideUp" delay={800 + (index * 200)}>
              <Card className="backdrop-blur-sm shadow-xl border-0 h-full" style={{backgroundColor: '#FBF9F7'}}>
                <CardHeader>
                  <CardTitle className="text-2xl text-[#302E2B]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#302e2b] leading-relaxed">{item.content}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <AnimatedSection animation="slideUp" delay={600}>
            <h2 className="text-[28px] md:text-[36px] font-bold mb-4 text-white">
              Nosso <span className="text-primary">Compromisso</span>
            </h2>
          </AnimatedSection>
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="slideUp" delay={700}>
              <p className="text-[18px] text-white/90 leading-relaxed mb-8 font-normal">
                Nossa equipe é formada por veterinários, especialistas em seguros e profissionais 
                apaixonados por animais. Trabalhamos incansavelmente para garantir que cada pet 
                receba o cuidado que merece, quando precisa.
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedSection animation="slideUp" delay={800}>
                <Card className="backdrop-blur-sm shadow-xl border-0 h-full" style={{backgroundColor: '#FBF9F7'}}>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-[#302E2B] mb-4">Atendimento Humanizado</h3>
                    <p className="text-[#302e2b]">
                      Tratamos cada pet como se fosse nosso, oferecendo cuidado personalizado 
                      e suporte emocional para as famílias em momentos difíceis.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
              <AnimatedSection animation="slideUp" delay={900}>
                <Card className="backdrop-blur-sm shadow-xl border-0 h-full" style={{backgroundColor: '#FBF9F7'}}>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-[#302E2B] mb-4">Inovação Constante</h3>
                    <p className="text-[#302e2b]">
                      Investimos continuamente em tecnologia e processos para tornar 
                      o acesso aos cuidados veterinários mais fácil e eficiente.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
