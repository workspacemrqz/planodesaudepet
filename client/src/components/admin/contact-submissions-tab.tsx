import { useQuery } from "@tanstack/react-query";
import { ContactSubmission } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mail, Phone, MapPin, Calendar, ChevronDown } from "lucide-react";

// Função temporária para formatação de data (substitui date-fns)
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
};


export default function ContactSubmissionsTab() {
  const { data: submissions, isLoading, error } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contact/submissions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/contact/submissions", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Falha ao carregar formulários");
      }
      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-[#277677] rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#277677]">
        <CardContent className="p-6 text-center bg-[#277677]">
          <p className="text-red-600">Erro ao carregar formulários: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-6 text-center bg-[#277677] rounded-lg">
        <Mail className="h-12 w-12 text-[#FBF9F7] mx-auto mb-4" />
        <p className="text-[#FBF9F7]">Nenhum formulário de contato encontrado.</p>
      </div>
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
      case "padrao": return "Padrão - R$45/mês";
      case "premium": return "Premium - R$80/mês";
      case "local": return "Plano Local";
      default: return plan;
    }
  };

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div key={submission.id} className="rounded-lg px-4 mt-[10px] mb-[10px] bg-[#277677]">
          <Collapsible>
            <CollapsibleTrigger 
              className="flex w-full items-center justify-between py-4 hover:bg-[#277677]/90 transition-colors"
              data-testid={`collapsible-form-trigger-${submission.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-[#FBF9F7]">
                    {submission.name}
                  </h3>
                  <p className="text-sm text-[#FBF9F7]/70">
                    {formatDate(submission.createdAt)}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-[#FBF9F7] transition-transform ui-open:rotate-180" />
            </CollapsibleTrigger>

            <CollapsibleContent className="pb-4" data-testid={`collapsible-form-content-${submission.id}`}>
              <div className="space-y-4">
                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-[#2C8587]" />
                      <span className="text-[#FBF9F7]">{submission.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-[#2C8587]" />
                      <span className="text-[#FBF9F7]">{submission.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-[#2C8587]" />
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
                      <Badge variant="secondary" className="ml-2 bg-[#2c8587] text-[#fbf9f7]">
                        {getAnimalTypeLabel(submission.animalType)}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-[#FBF9F7]">Idade:</span>
                      <Badge variant="outline" className="ml-2 text-[#FBF9F7]">
                        {submission.petAge}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Plan Interest */}
                <div className="p-3 rounded-lg bg-[#e1ac3300] pl-[0px] pr-[0px]">
                  <div className="text-sm space-y-2">
                    <div className="font-medium text-[#FBF9F7]">Plano de interesse:</div>
                    <Badge className="bg-[#2f8585] text-[#fbf9f7]">
                      {getPlanLabel(submission.planInterest)}
                    </Badge>
                  </div>
                </div>

                {/* Message */}
                {submission.message && (
                  <div className="pl-4">
                    <p className="text-sm font-medium text-[#FBF9F7] mb-1">Mensagem:</p>
                    <p className="text-sm text-[#FBF9F7] leading-relaxed">
                      {submission.message}
                    </p>
                  </div>
                )}

                
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </div>
  );
}