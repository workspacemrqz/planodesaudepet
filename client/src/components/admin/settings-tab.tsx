import React, { useState, useEffect } from "react";
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
import { SimpleImageUploader } from "@/components/SimpleImageUploader";
import { getImageUrlSync } from "@/lib/image-utils";

// Função para formatar telefone brasileiro com formatação dinâmica para 8 ou 9 dígitos
const formatBrazilianPhone = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Se não tem números, retorna vazio
  if (!numbers) return '';
  
  // Garante que sempre comece com 55 (código do Brasil)
  let cleanNumbers = numbers;
  if (!cleanNumbers.startsWith('55')) {
    cleanNumbers = '55' + cleanNumbers;
  }
  
  // Limita a 13 dígitos (55 + 11 dígitos locais máximo)
  cleanNumbers = cleanNumbers.substring(0, 13);
  
  // Aplica a formatação baseada no tamanho
  if (cleanNumbers.length <= 2) {
    return `+${cleanNumbers}`;
  } else if (cleanNumbers.length <= 4) {
    return `+${cleanNumbers.substring(0, 2)} (${cleanNumbers.substring(2)})`;
  } else if (cleanNumbers.length <= 9) {
    return `+${cleanNumbers.substring(0, 2)} (${cleanNumbers.substring(2, 4)}) ${cleanNumbers.substring(4)}`;
  } else {
    const areaCode = cleanNumbers.substring(2, 4);
    const phoneDigits = cleanNumbers.substring(4);
    
    // Formatação dinâmica baseada na quantidade de dígitos após DDD
    if (phoneDigits.length <= 8) {
      // Formato para 8 dígitos: +55 (XX) XXXX-XXXX
      const firstPart = phoneDigits.substring(0, 4);
      const secondPart = phoneDigits.substring(4);
      return `+55 (${areaCode}) ${firstPart}${secondPart ? '-' + secondPart : ''}`;
    } else {
      // Formato para 9 dígitos: +55 (XX) XXXXX-XXXX
      const firstPart = phoneDigits.substring(0, 5);
      const secondPart = phoneDigits.substring(5);
      return `+55 (${areaCode}) ${firstPart}${secondPart ? '-' + secondPart : ''}`;
    }
  }
};

// Função para extrair apenas números de um telefone formatado
const extractPhoneNumbers = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, '');
};

// Validação para telefones brasileiros (8 ou 9 dígitos após DDD)
const brazilianPhoneSchema = z.string()
  .refine((value) => {
    if (!value) return true; // Campo opcional
    const numbers = extractPhoneNumbers(value);
    // Aceita 55 + 2 dígitos (DDD) + 8 ou 9 dígitos = 12 ou 13 dígitos total
    return (numbers.length === 12 || numbers.length === 13) && numbers.startsWith('55');
  }, "Telefone deve ter o formato +55 (XX) XXXX-XXXX ou +55 (XX) XXXXX-XXXX");

const settingsFormSchema = z.object({
  whatsapp: brazilianPhoneSchema.optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: brazilianPhoneSchema.optional(),
  address: z.string().optional(),
  instagramUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  facebookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  linkedinUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  youtubeUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  cnpj: z.string().optional(),
  businessHours: z.string().optional(),
  ourStory: z.string().optional(),
  privacyPolicy: z.string().optional(),
  termsOfUse: z.string().optional(),
  mainImage: z.string().optional(),
  networkImage: z.string().optional(),
  aboutImage: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function SettingsTab() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image upload states
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [networkImageUrl, setNetworkImageUrl] = useState<string | null>(null);
  const [aboutImageUrl, setAboutImageUrl] = useState<string | null>(null);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingNetwork, setIsUploadingNetwork] = useState(false);
  const [isUploadingAbout, setIsUploadingAbout] = useState(false);

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
      address: "",
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
      cnpj: "",
      businessHours: "",
      ourStory: "",
      privacyPolicy: "",
      termsOfUse: "",
      mainImage: "",
      networkImage: "",
      aboutImage: "",
    },
  });
  
  // Image upload functions
  const handleImageUpload = async (file: File, imageType: 'main' | 'network' | 'about') => {
    // Set uploading state
    if (imageType === 'main') setIsUploadingMain(true);
    else if (imageType === 'network') setIsUploadingNetwork(true);
    else setIsUploadingAbout(true);
    
    try {
      // Step 1: Get upload URL from backend
      const uploadUrlResponse = await fetch('/api/objects/upload', {
        method: 'POST',
      });
      
      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadURL, objectPath } = await uploadUrlResponse.json();
      console.log('Got upload URL:', uploadURL);
      console.log('Object path:', objectPath);
      
      // Step 2: Upload file to the provided URL
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }
      
      console.log('File uploaded successfully');
      
      // Use the canonical URL returned by the backend
      if (imageType === 'main') {
        setMainImageUrl(objectPath);
        form.setValue('mainImage', objectPath);
      } else if (imageType === 'network') {
        setNetworkImageUrl(objectPath);
        form.setValue('networkImage', objectPath);
      } else {
        setAboutImageUrl(objectPath);
        form.setValue('aboutImage', objectPath);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Falha no upload da imagem",
        variant: "destructive",
      });
    } finally {
      // Reset uploading state
      if (imageType === 'main') setIsUploadingMain(false);
      else if (imageType === 'network') setIsUploadingNetwork(false);
      else setIsUploadingAbout(false);
    }
  };
  
  // Update image states when settings load
  useEffect(() => {
    if (settings) {
      setMainImageUrl(settings.mainImage || null);
      setNetworkImageUrl(settings.networkImage || null);
      setAboutImageUrl(settings.aboutImage || null);
    }
  }, [settings]);

  // Update form when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        whatsapp: settings.whatsapp ? formatBrazilianPhone(settings.whatsapp) : "",
        email: settings.email || "",
        phone: settings.phone ? formatBrazilianPhone(settings.phone) : "",
        address: settings.address || "",
        instagramUrl: settings.instagramUrl || "",
        facebookUrl: settings.facebookUrl || "",
        linkedinUrl: settings.linkedinUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        cnpj: settings.cnpj || "",
        businessHours: settings.businessHours || "",
        ourStory: settings.ourStory || "",
        privacyPolicy: settings.privacyPolicy || "",
        termsOfUse: settings.termsOfUse || "",
        mainImage: settings.mainImage || "",
        networkImage: settings.networkImage || "",
        aboutImage: settings.aboutImage || "",
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
      // Notificação de sucesso removida
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
    // Preparar dados para envio - salvar telefones apenas com números para compatibilidade
    const dataToSubmit = {
      ...data,
      whatsapp: data.whatsapp ? extractPhoneNumbers(data.whatsapp) : '',
      phone: data.phone ? extractPhoneNumbers(data.phone) : ''
    };
    
    console.log('Form data being submitted:', dataToSubmit);
    console.log('Image URLs:', {
      mainImage: dataToSubmit.mainImage,
      networkImage: dataToSubmit.networkImage,
      aboutImage: dataToSubmit.aboutImage
    });
    setIsSubmitting(true);
    updateSettingsMutation.mutate(dataToSubmit);
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
                          placeholder="+55 (11) 91234-5678 ou +55 (11) 1234-5678"
                          value={field.value || ''}
                          onChange={(e) => {
                            const formatted = formatBrazilianPhone(e.target.value);
                            field.onChange(formatted);
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData('text');
                            const formatted = formatBrazilianPhone(pastedText);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Número do WhatsApp
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
                          placeholder="+55 (11) 91234-5678 ou +55 (11) 1234-5678"
                          value={field.value || ''}
                          onChange={(e) => {
                            const formatted = formatBrazilianPhone(e.target.value);
                            field.onChange(formatted);
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData('text');
                            const formatted = formatBrazilianPhone(pastedText);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Número do Telefone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">Endereço</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="AVENIDA DOM SEVERINO, 1372, FATIMA - Teresina/PI"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#9fb8b8]">
                        Endereço que aparecerá na página de contato e seção de contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
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

          {/* Image Management */}
          <Card className="bg-[#115051]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FBF9F7]">
                <Settings className="h-4 w-4 text-[#FBF9F7]" />
                Gerenciamento de Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Imagem Principal</FormLabel>
                    <FormControl>
                       <div className="space-y-2">
                         <SimpleImageUploader
                           onFileSelect={async (file) => {
                             await handleImageUpload(file, 'main');
                           }}
                           isUploading={isUploadingMain}
                           hasImage={!!mainImageUrl}
                         />
                         {mainImageUrl && (
                           <div className="mt-2">
                             <img src={getImageUrlSync(mainImageUrl)} alt="Preview" className="max-w-xs max-h-32 object-cover rounded" />
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               className="mt-1 text-white hover:text-white hover:bg-white hover:text-red-600"
                               onClick={() => {
                                 setMainImageUrl(null);
                                 field.onChange("");
                               }}
                             >
                               Remover Imagem
                             </Button>
                           </div>
                         )}
                       </div>
                    </FormControl>
                    <FormDescription className="text-[#9fb8b8]">
                      Imagem principal exibida na página inicial
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="networkImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Imagem de Rede Credenciada</FormLabel>
                    <FormControl>
                       <div className="space-y-2">
                         <SimpleImageUploader
                           onFileSelect={async (file) => {
                             await handleImageUpload(file, 'network');
                           }}
                           isUploading={isUploadingNetwork}
                           hasImage={!!networkImageUrl}
                         />
                         {networkImageUrl && (
                           <div className="mt-2">
                             <img src={getImageUrlSync(networkImageUrl)} alt="Preview" className="max-w-xs max-h-32 object-cover rounded" />
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               className="mt-1 text-white hover:text-white hover:bg-white hover:text-red-600"
                               onClick={() => {
                                 setNetworkImageUrl(null);
                                 field.onChange("");
                               }}
                             >
                               Remover Imagem
                             </Button>
                           </div>
                         )}
                       </div>
                    </FormControl>
                    <FormDescription className="text-[#9fb8b8]">
                      Imagem de rede credenciada exibida na página inicial
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aboutImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Imagem Sobre a UNIPET</FormLabel>
                    <FormControl>
                       <div className="space-y-2">
                         <SimpleImageUploader
                           onFileSelect={async (file) => {
                             await handleImageUpload(file, 'about');
                           }}
                           isUploading={isUploadingAbout}
                           hasImage={!!aboutImageUrl}
                         />
                         {aboutImageUrl && (
                           <div className="mt-2">
                             <img src={getImageUrlSync(aboutImageUrl)} alt="Preview" className="max-w-xs max-h-32 object-cover rounded" />
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               className="mt-1 text-white hover:text-white hover:bg-white hover:text-red-600"
                               onClick={() => {
                                 setAboutImageUrl(null);
                                 field.onChange("");
                               }}
                             >
                               Remover Imagem
                             </Button>
                           </div>
                         )}
                       </div>
                    </FormControl>
                    <FormDescription className="text-[#9fb8b8]">
                      Imagem sobre a UNIPET exibida na página inicial e na página sobre
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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