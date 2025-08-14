import { useQuery } from "@tanstack/react-query";
import { ContactSubmission } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mail, Phone, MapPin, Calendar, Heart, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function ContactSubmissionsTab() {
  const [isOpen, setIsOpen] = useState(false);
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
          <Mail className="h-12 w-12 text-[#145759] mx-auto mb-4" />
          <p className="text-[#FBF9F7]">Nenhum formulário de contato encontrado.</p>
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
    <div className="border rounded-lg px-4 mt-[10px] mb-[10px] bg-[#145759]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger 
          className="flex w-full items-center justify-between py-4 hover:bg-[#145759]/90 transition-colors"
          data-testid="collapsible-forms-trigger"
        >
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#E1AC33]" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#FBF9F7]">
                Formulários de Contato
              </h3>
              <p className="text-sm text-[#FBF9F7]/70">
                Total de {submissions.length} formulário{submissions.length !== 1 ? 's' : ''} recebido{submissions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-[#FBF9F7] transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 text-[#FBF9F7] transition-transform" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="pb-4" data-testid="collapsible-forms-content">
          <div className="grid gap-4">
            {submissions.map((submission) => (
          <Card key={submission.id} className="rounded-lg border text-card-foreground border-[#277677]/30 shadow-sm transition-all duration-300 hover:shadow-2xl bg-[#114b4c]">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-[#FBF9F7] flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#E1AC33]" />
                  {submission.name}
                </CardTitle>
                <div className="text-xs text-[#FBF9F7]/70 flex items-center gap-1">
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
                    <Mail className="h-4 w-4 text-[#E1AC33]" />
                    <span className="text-[#FBF9F7]">{submission.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-[#E1AC33]" />
                    <span className="text-[#FBF9F7]">{submission.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#E1AC33]" />
                    <span className="text-[#FBF9F7]">{submission.city}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-[#FBF9F7]">Pet:</span>
                    <span className="ml-2 text-[#FBF9F7]">{submission.petName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-[#FBF9F7]">Tipo:</span>
                    <Badge variant="secondary" className="ml-2 bg-[#E1AC33] text-[#145759]">
                      {getAnimalTypeLabel(submission.animalType)}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-[#FBF9F7]">Idade:</span>
                    <Badge variant="outline" className="ml-2 border-[#E1AC33] text-[#FBF9F7]">
                      {submission.petAge}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Plan Interest */}
              <div className="p-3 rounded-lg bg-[#e1ac3300]">
                <div className="text-sm">
                  <span className="font-medium text-[#FBF9F7]">Plano de interesse:</span>
                  <Badge className="ml-2 bg-[#E1AC33] text-[#145759]">
                    {getPlanLabel(submission.planInterest)}
                  </Badge>
                </div>
              </div>

              {/* Message */}
              {submission.message && (
                <div className="border-l-4 border-[#E1AC33] pl-4">
                  <p className="text-sm font-medium text-[#FBF9F7] mb-1">Mensagem:</p>
                  <p className="text-sm text-[#FBF9F7] leading-relaxed">
                    {submission.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="bg-[#E1AC33] text-[#fbf9f7] hover:bg-[#E1AC33]/90"
                  onClick={() => window.open(`mailto:${submission.email}?subject=Proposta UNIPET PLAN para ${submission.petName}`)}
                  data-testid={`button-email-${submission.id}`}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  E-mail
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#E1AC33] hover:bg-[#E1AC33]/10 bg-[#2c8587] text-[#fbf9f7]"
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}