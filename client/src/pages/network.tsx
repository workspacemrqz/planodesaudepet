import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Heart, 
  Stethoscope, 
  Ambulance,
  Search,
  Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NetworkUnit } from "@shared/schema";

export default function Network() {
  const { data: networkUnits, isLoading } = useQuery<NetworkUnit[]>({
    queryKey: ["/api/network-units"],
  });

  const hospitalFeatures = [
    {
      icon: Clock,
      title: "Atendimento 24h",
      description: "Emergências veterinárias todos os dias"
    },
    {
      icon: Stethoscope,
      title: "Equipamentos Modernos",
      description: "Tecnologia de ponta para diagnósticos"
    },
    {
      icon: Heart,
      title: "Especialistas",
      description: "Veterinários com formação especializada"
    },
    {
      icon: Ambulance,
      title: "UTI Veterinária",
      description: "Cuidados intensivos para casos críticos"
    }
  ];

  return (
    <main className="min-h-screen bg-[#FBF9F7]">
      
      
      {/* Network Units Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#302e2b] mb-4">
              Principais Unidades
            </h2>
            <p className="text-[#302e2b] text-lg max-w-2xl mx-auto">
              Conheça algumas das nossas principais unidades espalhadas pelo Brasil
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-[#302e2b]">Carregando unidades da rede...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {networkUnits?.map((unit) => (
              <Card key={unit.id} className="shadow-lg rounded-xl border-none bg-white overflow-hidden">
                <div className="relative">
                  <img 
                    src={unit.imageUrl} 
                    alt={unit.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-[#E1AC33] text-[#277677] font-semibold">
                    <Star className="h-3 w-3 mr-1" />
                    {(unit.rating / 10).toFixed(1)}
                  </Badge>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-[#277677] leading-tight">
                    {unit.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-[#277677] mt-1 flex-shrink-0" />
                      <span className="text-[#302e2b] text-sm">{unit.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-[#277677] flex-shrink-0" />
                      <span className="text-[#302e2b] text-sm font-medium">{unit.phone}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-[#277677] mb-3">Serviços Disponíveis:</h4>
                    <div className="flex flex-wrap gap-2">
                      {unit.services.map((service, serviceIndex) => (
                        <Badge 
                          key={serviceIndex} 
                          className="bg-[#277677]/10 text-[#277677] border-[#277677]/20"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-[#277677] text-[#FBF9F7] hover:bg-[#277677]/90"
                      data-testid={`button-contact-unit-${unit.id}`}
                    >
                      Entrar em Contato
                    </Button>
                    <Button 
                      className="border-2 border-[#277677] text-[#277677] bg-transparent hover:bg-[#277677]/10"
                      data-testid={`button-location-unit-${unit.id}`}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#277677] pl-[20px] pr-[20px]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FBF9F7] mb-4">
            Não encontrou uma unidade próxima?
          </h2>
          <p className="text-[#FBF9F7]/80 text-lg mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e descubra todas as opções disponíveis na sua região. 
            Estamos sempre expandindo nossa rede para melhor atendê-lo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#E1AC33] text-[#277677] hover:bg-[#E1AC33]/90 px-8 py-3 rounded-lg font-semibold">
              Ver Todas as Unidades
            </Button>
            <Button className="border-2 border-[#FBF9F7] text-[#FBF9F7] bg-transparent hover:bg-[#FBF9F7]/10 px-8 py-3 rounded-lg font-semibold">
              Falar com Atendimento
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}