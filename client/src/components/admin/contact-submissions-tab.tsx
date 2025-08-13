import { useQuery } from "@tanstack/react-query";
import { ContactSubmission } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Calendar, Heart, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ContactSubmissionsTab() {
  const { data: submissions, isLoading, error } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contact/submissions"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Erro ao carregar formulários: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum formulário de contato encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  const getAnimalTypeLabel = (type: string) => {
    switch (type) {
      case "cao": return "Cão";
      case "gato": return "Gato";
      default: return "Outros";
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "basico": return "Básico - R$20/mês";
      case "padrao": return "Padrão - R$45/mês";
      case "premium": return "Premium - R$80/mês";
      case "local": return "Plano Local";
      default: return plan;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#277677]">
            Formulários de Contato
          </h3>
          <p className="text-sm text-[#302e2b]/70">
            Total de {submissions.length} formulário{submissions.length !== 1 ? 's' : ''} recebido{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-[#277677] flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#E1AC33]" />
                  {submission.name}
                </CardTitle>
                <div className="text-xs text-[#302e2b]/70 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(submission.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-[#277677]" />
                    <span className="text-[#302e2b]">{submission.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-[#277677]" />
                    <span className="text-[#302e2b]">{submission.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#277677]" />
                    <span className="text-[#302e2b]">{submission.city}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-[#277677]">Pet:</span>
                    <span className="ml-2 text-[#302e2b]">{submission.petName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-[#277677]">Tipo:</span>
                    <Badge variant="secondary" className="ml-2">
                      {getAnimalTypeLabel(submission.animalType)}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-[#277677]">Idade:</span>
                    <Badge variant="outline" className="ml-2">
                      {submission.petAge}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Plan Interest */}
              <div className="bg-[#277677]/5 p-3 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium text-[#277677]">Plano de interesse:</span>
                  <Badge className="ml-2 bg-[#E1AC33] text-[#277677] hover:bg-[#E1AC33]/90">
                    {getPlanLabel(submission.planInterest)}
                  </Badge>
                </div>
              </div>

              {/* Message */}
              {submission.message && (
                <div className="border-l-4 border-[#E1AC33] pl-4">
                  <p className="text-sm font-medium text-[#277677] mb-1">Mensagem:</p>
                  <p className="text-sm text-[#302e2b] leading-relaxed">
                    {submission.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="bg-[#277677] hover:bg-[#277677]/90 text-white"
                  onClick={() => window.open(`mailto:${submission.email}?subject=Proposta UNIPET PLAN para ${submission.petName}`)}
                  data-testid={`button-email-${submission.id}`}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  E-mail
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#277677] text-[#277677] hover:bg-[#277677] hover:text-white"
                  onClick={() => window.open(`tel:${submission.phone}`)}
                  data-testid={`button-call-${submission.id}`}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Ligar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}