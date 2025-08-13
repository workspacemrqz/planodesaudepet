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
    <section className="py-20 text-[#277677] bg-[#ded8ce]" style={{backgroundColor: '#E1AC33'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="md:text-4xl font-bold mb-4 text-[#fbf9f7] text-[40px]">
            O que nossos <span className="text-[#277677]">clientes dizem</span>
          </h2>
          <p className="text-[#fbf9f7] text-[24px]">Depoimentos reais de quem confia na UNIPET PLAN</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="rounded-2xl shadow-lg border-0" style={{backgroundColor: '#FBF9F7'}}>
              <CardContent className="pt-8">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={`${testimonial.name} com seu pet`} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="font-semibold text-[#302e2b]">{testimonial.name}</h4>
                    <p className="text-[#302e2b] text-sm">{testimonial.location}</p>
                  </div>
                </div>
                {renderStars()}
                <p className="text-[#302e2b] italic">
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
