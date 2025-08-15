import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SiteSettings, InsertSiteSettings } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Settings, Save, Phone, Mail, MessageSquare, Building, Clock, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const settingsFormSchema = z.object({
  whatsapp: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  instagramUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  facebookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  linkedinUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  youtubeUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  cnpj: z.string().optional(),
  businessHours: z.string().optional(),
  ourStory: z.string().optional(),
  privacyPolicy: z.string().optional(),
  termsOfUse: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function SettingsTab() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/site-settings");
      return await res.json();
    },
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      whatsapp: "",
      email: "",
      phone: "",
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
      cnpj: "",
      businessHours: "",
      ourStory: "",
      privacyPolicy: "",
      termsOfUse: "",
    },
  });

  // Update form when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        whatsapp: settings.whatsapp || "",
        email: settings.email || "",
        phone: settings.phone || "",
        instagramUrl: settings.instagramUrl || "",
        facebookUrl: settings.facebookUrl || "",
        linkedinUrl: settings.linkedinUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        cnpj: settings.cnpj || "",
        businessHours: settings.businessHours || "",
        ourStory: settings.ourStory || "",
        privacyPolicy: settings.privacyPolicy || "",
        termsOfUse: settings.termsOfUse || "",
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const res = await apiRequest("PUT", "/api/admin/site-settings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações do site foram salvas com sucesso.",
      });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      console.error("Error updating settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    setIsSubmitting(true);
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin text-[#145759] mx-auto mb-4" />
          <p className="text-[#FBF9F7]">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#FBF9F7]">Configurações do Site</h3>
        <p className="text-sm text-[#FBF9F7]">
          Gerencie as informações de contato e conteúdo que aparecem no site
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 admin-no-focus">
          
          {/* Contact Information */}
          <Card className="bg-[#115051]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FBF9F7]">
                <Phone className="h-4 w-4 text-[#FBF9F7]" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Número do WhatsApp que aparecerá no rodapé e página de contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="contato@unipetplan.com.br"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Email de contato que aparecerá no rodapé e página de contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0800 123 4567"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Telefone fixo que aparecerá no rodapé e página de contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0001-00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        CNPJ da empresa que aparecerá no rodapé
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="bg-[#115051]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FBF9F7]">
                <MessageSquare className="h-4 w-4 text-[#FBF9F7]" />
                Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">Instagram</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/unipetplan"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Link do Instagram (deixe vazio para ocultar o ícone)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">Facebook</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://facebook.com/unipetplan"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Link do Facebook (deixe vazio para ocultar o ícone)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">LinkedIn</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://linkedin.com/company/unipetplan"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Link do LinkedIn (deixe vazio para ocultar o ícone)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="youtubeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">YouTube</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/@unipetplan"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Link do YouTube (deixe vazio para ocultar o ícone)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="bg-[#115051]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FBF9F7]">
                <Clock className="h-4 w-4 text-[#FBF9F7]" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Horário de Atendimento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Segunda a Sexta: 8h às 18h\nSábado: 8h às 14h\nEmergências: 24h todos os dias"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[#9fb8b8]">
                      Horários de funcionamento que aparecerão no rodapé e página de contato
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ourStory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Nossa História</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A UNIPET PLAN nasceu da paixão de veterinários experientes..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[#9fb8b8]">
                      Texto institucional que aparecerá na página "Sobre"
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Legal Pages */}
          <Card className="bg-[#115051]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FBF9F7]">
                <FileText className="h-4 w-4 text-[#FBF9F7]" />
                Páginas Legais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="privacyPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Política de Privacidade</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="# Política de Privacidade\n\n## 1. Informações Gerais\n\nA UNIPET PLAN está comprometida em proteger a privacidade..."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[#9fb8b8]">
                      Conteúdo da página de Política de Privacidade (suporta formatação markdown simples)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="termsOfUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Termos de Uso</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="# Termos de Uso\n\n## 1. Aceitação dos Termos\n\nAo acessar e utilizar o site da UNIPET PLAN..."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[#9fb8b8]">
                      Conteúdo da página de Termos de Uso (suporta formatação markdown simples)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#E1AC33] text-[#FBF9F7] px-6 py-2 font-medium hover:bg-[#E1AC33] focus:bg-[#E1AC33] active:bg-[#E1AC33]"
            >
              <Save className="h-4 w-4 mr-2 text-[#FBF9F7]" />
              {isSubmitting ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}