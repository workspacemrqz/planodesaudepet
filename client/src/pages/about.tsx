import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";

export default function About() {
  const { settings, shouldShow } = useSiteSettingsWithDefaults();
  
  const stats = [
    { formattedCount: "50.000+", label: "Pets Protegidos" },
    { formattedCount: "200+", label: "Clínicas Credenciadas" },
    { formattedCount: "15+", label: "Estados Atendidos" },
    { formattedCount: "98%", label: "Satisfação" }
  ];

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
    <main className="pt-0 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="font-bold mb-4 text-white text-[36px]">
            Sobre a <span className="text-[#e1ac33]">UNIPET PLAN</span>
          </h1>

        </div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <img 
              src="/inicio-sobre.jpg" 
              alt="Conceito de seguro pet com veterinário cuidando de animal"
              className="rounded-2xl shadow-xl w-full h-auto"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#e1ac33]">Nossa História</h2>
            {shouldShow.ourStory && (
              <div className="text-lg leading-relaxed text-[#ffffff] whitespace-pre-line">
                {settings.ourStory}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold mb-2 text-[#e1ac33]">
                {stat.formattedCount}
              </div>
              <div className="text-white/90">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {values.map((item, index) => (
            <Card key={index} className="backdrop-blur-sm shadow-xl border-0" style={{backgroundColor: '#FBF9F7'}}>
              <CardHeader>
                <CardTitle className="text-2xl text-[#2C8587]">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#302e2b] leading-relaxed">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Nosso <span className="text-primary">Compromisso</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Nossa equipe é formada por veterinários, especialistas em seguros e profissionais 
              apaixonados por animais. Trabalhamos incansavelmente para garantir que cada pet 
              receba o cuidado que merece, quando precisa.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="backdrop-blur-sm shadow-xl border-0" style={{backgroundColor: '#FBF9F7'}}>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-[#2C8587] mb-4">Atendimento Humanizado</h3>
                  <p className="text-[#302e2b]">
                    Tratamos cada pet como se fosse nosso, oferecendo cuidado personalizado 
                    e suporte emocional para as famílias em momentos difíceis.
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm shadow-xl border-0" style={{backgroundColor: '#FBF9F7'}}>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-[#2C8587] mb-4">Inovação Constante</h3>
                  <p className="text-[#302e2b]">
                    Investimos continuamente em tecnologia e processos para tornar 
                    o acesso aos cuidados veterinários mais fácil e eficiente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
