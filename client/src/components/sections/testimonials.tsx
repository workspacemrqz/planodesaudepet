import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Maria Silva",
      location: "São Paulo, SP",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      testimonial: "Minha Luna foi atendida super rápido quando precisou de uma cirurgia de emergência. O processo foi simples e sem burocracia. Recomendo demais!"
    },
    {
      name: "Carlos Mendes", 
      location: "Rio de Janeiro, RJ",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      testimonial: "O plano familiar cobriu tudo que meus dois cães precisaram. Desde vacinas até exames especializados. Vale cada centavo!"
    },
    {
      name: "Ana Costa",
      location: "Belo Horizonte, MG", 
      image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      testimonial: "Atendimento 24h salvou a vida do meu gato. A equipe é muito profissional e o suporte sempre disponível. Indico para todos!"
    }
  ];

  const renderStars = () => (
    <div className="flex mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-primary fill-current" />
      ))}
    </div>
  );

  return (
    <section className="py-20 text-[#277677] bg-[#ded8ce]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[#302e2b] leading-tight">
            O que nossos <span className="text-[#277677]">clientes dizem</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#302e2b] font-semibold px-4">Depoimentos reais de quem confia na UNIPET PLAN</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0 pl-[0px] pr-[0px]">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="rounded-2xl shadow-lg border-0" style={{backgroundColor: '#FBF9F7'}}>
              <CardContent className="pt-6 sm:pt-8 p-4 sm:p-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={`${testimonial.name} com seu pet`} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="ml-3 sm:ml-4">
                    <h4 className="font-semibold text-[#302e2b] text-sm sm:text-base">{testimonial.name}</h4>
                    <p className="text-[#302e2b] text-xs sm:text-sm">{testimonial.location}</p>
                  </div>
                </div>
                {renderStars()}
                <p className="text-[#302e2b] italic text-sm sm:text-base leading-relaxed">
                  "{testimonial.testimonial}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
