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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Save, Phone, MessageSquare, Clock, FileText, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { SimpleImageUploader } from "@/components/SimpleImageUploader";
import { RobustImage } from "@/components/ui/image";
import Stepper, { Step } from "@/components/ui/Stepper";

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
    // Aceita qualquer formato durante a edição, validação será feita apenas no salvamento
    return true;
  }, "Telefone deve ter o formato +55 (XX) XXXX-XXXX ou +55 (XX) XXXXX-XXXX");

const settingsFormSchema = z.object({
  whatsapp: brazilianPhoneSchema.optional(),
  email: z.string().optional().or(z.literal("")),
  phone: brazilianPhoneSchema.optional(),
  address: z.string().optional(),
  instagramUrl: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().optional().or(z.literal("")),
  linkedinUrl: z.string().optional().or(z.literal("")),
  youtubeUrl: z.string().optional().or(z.literal("")),
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
  
  // Dialog states
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [legalDialogOpen, setLegalDialogOpen] = useState(false);
  
  // Image upload states
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [networkImageUrl, setNetworkImageUrl] = useState<string | null>(null);
  const [aboutImageUrl, setAboutImageUrl] = useState<string | null>(null);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingNetwork, setIsUploadingNetwork] = useState(false);
  const [isUploadingAbout, setIsUploadingAbout] = useState(false);

  // Temporary form data for each dialog - only saved when flow is completed
  const [tempContactData, setTempContactData] = useState<Partial<SettingsFormData>>({});
  const [tempSocialData, setTempSocialData] = useState<Partial<SettingsFormData>>({});
  const [tempImageData, setTempImageData] = useState<Partial<SettingsFormData>>({});
  const [tempCompanyData, setTempCompanyData] = useState<Partial<SettingsFormData>>({});
  const [tempLegalData, setTempLegalData] = useState<Partial<SettingsFormData>>({});

  const { data: settings, isLoading, error } = useQuery<SiteSettings>({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/site-settings", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Falha ao carregar configurações");
      }
      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
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
  
  // Image upload functions with Base64 conversion
  const handleImageUpload = async (file: File, imageType: 'main' | 'network' | 'about') => {
    console.log(`🔍 handleImageUpload called for ${imageType} with file:`, file.name);
    
    // Set uploading state
    if (imageType === 'main') setIsUploadingMain(true);
    else if (imageType === 'network') setIsUploadingNetwork(true);
    else setIsUploadingAbout(true);
    
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use: JPEG, PNG ou WebP');
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo: 5MB');
      }
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload to backend with Base64 conversion
      const response = await fetch(`/api/images/upload/${imageType}/settings`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Upload falhou');
      }
      
      console.log('🔍 Image uploaded and converted to Base64 successfully');
      
      // Update local state and temp data with Base64 data
      const base64Data = result.base64;
      
      if (imageType === 'main') {
        setMainImageUrl(base64Data);
        updateTempData('image', { mainImage: base64Data });
        console.log('🔍 Main image updated with Base64');
      } else if (imageType === 'network') {
        setNetworkImageUrl(base64Data);
        updateTempData('image', { networkImage: base64Data });
        console.log('🔍 Network image updated with Base64');
      } else {
        setAboutImageUrl(base64Data);
        updateTempData('image', { aboutImage: base64Data });
        console.log('🔍 About image updated with Base64');
      }
      
      // Show success toast
      toast({
        title: "Sucesso",
        description: "Imagem carregada e convertida com sucesso!",
      });
      
      console.log('🔍 Image upload completed successfully for:', imageType);
      
    } catch (error) {
      console.error('🔍 Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha no upload da imagem",
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
      console.log('🔍 [SETTINGS LOAD] Settings loaded:', settings);
      console.log('🔍 [SETTINGS LOAD] Image fields:', {
        mainImage: settings.mainImage,
        networkImage: settings.networkImage,
        aboutImage: settings.aboutImage
      });
      
      setMainImageUrl(settings.mainImage || null);
      setNetworkImageUrl(settings.networkImage || null);
      setAboutImageUrl(settings.aboutImage || null);
      
      console.log('🔍 [SETTINGS LOAD] Image URLs set:', {
        mainImageUrl: settings.mainImage || null,
        networkImageUrl: settings.networkImage || null,
        aboutImageUrl: settings.aboutImage || null
      });
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
      console.log('🔍 updateSettingsMutation.mutationFn called with data:', data);
      const res = await apiRequest("PUT", "/api/admin/site-settings", data);
      console.log('🔍 updateSettingsMutation.mutationFn response:', res);
      return await res.json();
    },
  });

  // Function to prepare data for submission (used internally)
  const prepareDataForSubmission = (data: SettingsFormData) => {
    console.log('🔍 prepareDataForSubmission called with data:', data);
    
    // Filter out undefined and null values, keep empty strings
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    const preparedData = {
      ...filteredData,
      whatsapp: data.whatsapp ? extractPhoneNumbers(data.whatsapp) : '',
      phone: data.phone ? extractPhoneNumbers(data.phone) : ''
    };
    
    console.log('🔍 prepareDataForSubmission returning:', preparedData);
    return preparedData;
  };

  // Function to save all temporary data and close dialog
  const saveAndCloseDialog = async (dialogType: 'contact' | 'social' | 'image' | 'company' | 'legal') => {
    console.log(`🔍 saveAndCloseDialog called for ${dialogType}`);
    console.log(`🔍 Current temp data for ${dialogType}:`, {
      contact: tempContactData,
      social: tempSocialData,
      image: tempImageData,
      company: tempCompanyData,
      legal: tempLegalData
    });
    
    try {
      console.log('🔍 saveAndCloseDialog: Setting isSubmitting to true');
      setIsSubmitting(true);
      
      // Get only the temporary data for the specific dialog being saved
      let dataToSubmit: Partial<SettingsFormData> = {};
      
      switch (dialogType) {
        case 'contact':
          dataToSubmit = tempContactData;
          console.log('🔍 Using contact temp data:', tempContactData);
          break;
        case 'social':
          dataToSubmit = tempSocialData;
          console.log('🔍 Using social temp data:', tempSocialData);
          break;
        case 'image':
          dataToSubmit = tempImageData;
          console.log('🔍 Using image temp data:', tempImageData);
          break;
        case 'company':
          dataToSubmit = tempCompanyData;
          console.log('🔍 Using company temp data:', tempCompanyData);
          break;
        case 'legal':
          dataToSubmit = tempLegalData;
          console.log('🔍 Using legal temp data:', tempLegalData);
          break;
      }
      
      console.log(`🔍 Data to submit for ${dialogType}:`, dataToSubmit);
      
      // Check if we have valid data to submit
      const hasValidData = dataToSubmit && Object.keys(dataToSubmit).length > 0;
      
      console.log('🔍 Data validation check:', {
        dataToSubmit,
        hasValidData,
        keys: dataToSubmit ? Object.keys(dataToSubmit) : [],
        values: dataToSubmit ? Object.values(dataToSubmit) : []
      });
      
      if (!hasValidData) {
        console.log(`🔍 No valid data to submit for ${dialogType}`);
        // Close dialog without saving
        switch (dialogType) {
          case 'contact':
            setContactDialogOpen(false);
            break;
          case 'social':
            setSocialDialogOpen(false);
            break;
          case 'image':
            setImageDialogOpen(false);
            break;
          case 'company':
            setCompanyDialogOpen(false);
            break;
          case 'legal':
            setLegalDialogOpen(false);
            break;
        }
        setIsSubmitting(false);
        return;
      }
      
      console.log('🔍 Proceeding with save for dialog:', dialogType);
      
      // Prepare data for submission
      const preparedData = prepareDataForSubmission(dataToSubmit as SettingsFormData);
      
      console.log('🔍 Saving data for dialog:', dialogType, preparedData);
      
      // Save to backend using a Promise wrapper
      try {
        console.log('🔍 Calling updateSettingsMutation.mutate');
        const result = await updateSettingsMutation.mutateAsync(preparedData);
        console.log('🔍 updateSettingsMutation.mutateAsync result:', result);
        
        console.log('🔍 Data saved successfully for dialog:', dialogType);
        
        // CRÍTICO: Atualizar o estado local imediatamente
        if (settings && result) {
          const updatedSettings = { ...settings, ...result };
          console.log('🔍 Updating local settings state:', updatedSettings);
          
          // Atualizar o cache do React Query
          queryClient.setQueryData(["admin-site-settings"], updatedSettings);
          queryClient.setQueryData(["site-settings"], updatedSettings);
          
          // Atualizar o estado local do componente
          // Assuming setSettings is defined elsewhere or this line is removed if not needed
          // if (setSettings) {
          //   setSettings(updatedSettings);
          // }
        }
        
        // Invalidate queries para garantir sincronização
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] }),
          queryClient.invalidateQueries({ queryKey: ["site-settings"] })
        ]);
        
        // Clear only the temporary data for the specific dialog
        switch (dialogType) {
          case 'contact':
            console.log('🔍 Clearing contact temp data');
            setTempContactData({});
            break;
          case 'social':
            console.log('🔍 Clearing social temp data');
            setTempSocialData({});
            break;
          case 'image':
            console.log('🔍 Clearing image temp data');
            setTempImageData({});
            // CRÍTICO: Resetar URLs das imagens após salvar
            setMainImageUrl(null);
            setNetworkImageUrl(null);
            setAboutImageUrl(null);
            break;
          case 'company':
            console.log('🔍 Clearing company temp data');
            setTempCompanyData({});
            break;
          case 'legal':
            console.log('🔍 Clearing legal temp data');
            setTempLegalData({});
            break;
        }
        
        console.log('🔍 Temporary data cleared for dialog:', dialogType);
        
        // Close the specific dialog
        switch (dialogType) {
          case 'contact':
            console.log('🔍 Closing contact dialog');
            setContactDialogOpen(false);
            break;
          case 'social':
            console.log('🔍 Closing social dialog');
            setSocialDialogOpen(false);
            break;
          case 'image':
            console.log('🔍 Closing image dialog');
            setImageDialogOpen(false);
            break;
          case 'company':
            console.log('🔍 Closing company dialog');
            setCompanyDialogOpen(false);
            break;
          case 'legal':
            console.log('🔍 Closing legal dialog');
            setLegalDialogOpen(false);
            break;
        }
        
        console.log('🔍 Dialog closed for dialog:', dialogType);
        
        toast({
          title: "Sucesso",
          description: "Configurações salvas com sucesso!",
        });
        
        console.log('🔍 saveAndCloseDialog completed successfully for dialog:', dialogType);
        
      } catch (mutationError) {
        console.error("🔍 Error in mutation:", mutationError);
        throw mutationError;
      }
      
    } catch (error) {
      console.error("🔍 Error in saveAndCloseDialog:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to update temporary data for a specific dialog
  const updateTempData = (dialogType: 'contact' | 'social' | 'image' | 'company' | 'legal', data: Partial<SettingsFormData>) => {
    console.log(`🔍 updateTempData called for ${dialogType} with data:`, data);
    
    switch (dialogType) {
      case 'contact':
        setTempContactData(prev => {
          const newData = { ...prev, ...data };
          console.log('🔍 Previous contact temp data:', prev);
          console.log('🔍 New contact temp data:', newData);
          return newData;
        });
        break;
      case 'social':
        setTempSocialData(prev => {
          const newData = { ...prev, ...data };
          console.log('🔍 Previous social temp data:', prev);
          console.log('🔍 New social temp data:', newData);
          return newData;
        });
        break;
      case 'image':
        setTempImageData(prev => {
          const newData = { ...prev, ...data };
          console.log('🔍 Previous image temp data:', prev);
          console.log('🔍 New image temp data:', newData);
          console.log('🔍 Full new image temp data:', newData);
          return newData;
        });
        break;
      case 'company':
        setTempCompanyData(prev => {
          const newData = { ...prev, ...data };
          console.log('🔍 Previous company temp data:', prev);
          console.log('🔍 New company temp data:', newData);
          return newData;
        });
        break;
      case 'legal':
        setTempLegalData(prev => {
          const newData = { ...prev, ...data };
          console.log('🔍 Previous legal temp data:', prev);
          console.log('🔍 New legal temp data:', newData);
          return newData;
        });
        break;
    }
    
    // Log current state of all temp data after update
    setTimeout(() => {
      console.log(`🔍 Current temp data after update for ${dialogType}:`, {
        contact: tempContactData,
        social: tempSocialData,
        image: tempImageData,
        company: tempCompanyData,
        legal: tempLegalData
      });
    }, 100);
  };

  // Function to reset temporary data when dialog is opened
  const resetTempData = (dialogType: 'contact' | 'social' | 'image' | 'company' | 'legal') => {
    console.log(`🔍 resetTempData called for ${dialogType}`);
    console.log(`🔍 Current settings:`, settings);
    
    // Initialize with current settings data when dialog is opened
    switch (dialogType) {
      case 'contact':
        const contactData = {
          whatsapp: settings?.whatsapp || '',
          email: settings?.email || '',
          phone: settings?.phone || '',
          address: settings?.address || '',
          cnpj: settings?.cnpj || '',
        };
        console.log('🔍 Setting contact temp data:', contactData);
        setTempContactData(contactData);
        // Also update the form with current values
        form.setValue('whatsapp', contactData.whatsapp);
        form.setValue('email', contactData.email);
        form.setValue('phone', contactData.phone);
        form.setValue('address', contactData.address);
        form.setValue('cnpj', contactData.cnpj);
        break;
      case 'social':
        const socialData = {
          instagramUrl: settings?.instagramUrl || '',
          facebookUrl: settings?.facebookUrl || '',
          linkedinUrl: settings?.linkedinUrl || '',
          youtubeUrl: settings?.youtubeUrl || '',
        };
        console.log('🔍 Setting social temp data:', socialData);
        setTempSocialData(socialData);
        // Also update the form with current values
        form.setValue('instagramUrl', socialData.instagramUrl);
        form.setValue('facebookUrl', socialData.facebookUrl);
        form.setValue('linkedinUrl', socialData.linkedinUrl);
        form.setValue('youtubeUrl', socialData.youtubeUrl);
        break;
      case 'image':
        const imageData = {
          mainImage: settings?.mainImage || '',
          networkImage: settings?.networkImage || '',
          aboutImage: settings?.aboutImage || '',
        };
        console.log('🔍 Setting image temp data:', imageData);
        setTempImageData(imageData);
        
        // CRÍTICO: Configurar as URLs das imagens para preview
        setMainImageUrl(settings?.mainImage || null);
        setNetworkImageUrl(settings?.networkImage || null);
        setAboutImageUrl(settings?.aboutImage || null);
        
        // Also update the form with current values
        form.setValue('mainImage', imageData.mainImage);
        form.setValue('networkImage', imageData.networkImage);
        form.setValue('aboutImage', imageData.aboutImage);
        break;
      case 'company':
        const companyData = {
          businessHours: settings?.businessHours || '',
          ourStory: settings?.ourStory || '',
        };
        console.log('🔍 Setting company temp data:', companyData);
        setTempCompanyData(companyData);
        // Also update the form with current values
        form.setValue('businessHours', companyData.businessHours);
        form.setValue('ourStory', companyData.ourStory);
        break;
      case 'legal':
        const legalData = {
          privacyPolicy: settings?.privacyPolicy || '',
          termsOfUse: settings?.termsOfUse || '',
        };
        console.log('🔍 Setting legal temp data:', legalData);
        setTempLegalData(legalData);
        // Also update the form with current values
        form.setValue('privacyPolicy', legalData.privacyPolicy);
        form.setValue('termsOfUse', legalData.termsOfUse);
        break;
    }
    
    console.log(`🔍 resetTempData completed for ${dialogType}`);
    
    // Log the current state of temp data after reset
    setTimeout(() => {
      console.log(`🔍 Current temp data after reset for ${dialogType}:`, {
        contact: tempContactData,
        social: tempSocialData,
        image: tempImageData,
        company: tempCompanyData,
        legal: tempLegalData
      });
    }, 0);
  };



  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Erro ao carregar configurações: {error.message}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

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
    <div className="space-y-4">
      {/* Contact Information Container */}
      <Card className="bg-[#277677] rounded-lg px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-[#FBF9F7]" />
            <span className="font-medium text-[#FBF9F7]">Informações de Contato</span>
          </div>
          
          <Dialog 
            open={contactDialogOpen} 
            onOpenChange={(open) => {
              if (open) {
                resetTempData('contact');
              } else {
                // Reset temporary data when dialog is closed without saving
                setTempContactData({});
              }
              setContactDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="text-[#FBF9F7]"
                style={{
                  background: 'linear-gradient(to top, #1c6363, #277677)'
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto admin-dialog-content">
              <DialogHeader>
                <DialogTitle className="text-[#FBF9F7]">Editar Informações de Contato</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <div className="space-y-6">
                  <Stepper
                    initialStep={1}
                    onStepChange={(step) => {
                      console.log(`🔍 Contact dialog: Step changed to ${step}`);
                    }}
                    onFinalStepCompleted={() => {
                      console.log("🔍 Contact dialog: Todos os steps completados!");
                      saveAndCloseDialog('contact');
                    }}
                    backButtonText="Anterior"
                    nextButtonText="Próximo"
                    backButtonProps={{
                      className: "bg-[#2C8587] text-[#F7F5F3] border-[#277677] hover:bg-[#277677] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                    nextButtonProps={{
                      className: "bg-[#277677] text-[#FBF9F7] hover:bg-[#1c6363] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                  >
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Informações Básicas</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="whatsapp"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#FBF9F7]">WhatsApp</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+55 (11) 91234-5678"
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      const formatted = formatBrazilianPhone(e.target.value);
                                      field.onChange(formatted);
                                      updateTempData('contact', { whatsapp: formatted });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
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
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateTempData('contact', { email: e.target.value });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Informações Adicionais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[#FBF9F7]">Telefone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+55 (11) 1234-5678"
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      const formatted = formatBrazilianPhone(e.target.value);
                                      field.onChange(formatted);
                                      updateTempData('contact', { phone: formatted });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
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
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateTempData('contact', { address: e.target.value });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
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
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateTempData('contact', { cnpj: e.target.value });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Revisão e Confirmação</h3>
                        
                        <div className="bg-[#145759] p-3 md:p-4 rounded-lg border border-[#277677]/20">
                          <h4 className="font-medium text-[#FBF9F7] mb-2 md:mb-3 text-left">Resumo das Informações de Contato:</h4>
                          
                          <div className="text-sm leading-tight">
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              WhatsApp: {tempContactData.whatsapp || 'Não informado'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Email: {tempContactData.email || 'Não informado'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Telefone: {tempContactData.phone || 'Não informado'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Endereço: {tempContactData.address || 'Não informado'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              CNPJ: {tempContactData.cnpj || 'Não informado'}
                            </div>
                          </div>
                          
                          <div className="mt-3 md:mt-4">
                            <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Detalhes:</h5>
                            <ul className="text-sm text-[#FBF9F7]/80 space-y-1">
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                Todas as informações serão atualizadas simultaneamente
                              </li>
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                As alterações serão aplicadas imediatamente após a confirmação
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Step>
                  </Stepper>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Social Media Container */}
      <Card className="bg-[#277677] rounded-lg px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#FBF9F7]" />
            <span className="font-medium text-[#FBF9F7]">Redes Sociais</span>
          </div>
          
          <Dialog 
            open={socialDialogOpen} 
            onOpenChange={(open) => {
              if (open) {
                resetTempData('social');
              } else {
                // Reset temporary data when dialog is closed without saving
                setTempSocialData({});
              }
              setSocialDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="text-[#FBF9F7]"
                style={{
                  background: 'linear-gradient(to top, #1c6363, #277677)'
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto admin-dialog-content">
              <DialogHeader>
                <DialogTitle className="text-[#FBF9F7]">Editar Redes Sociais</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <div className="space-y-6">
                  <Stepper
                    initialStep={1}
                    onStepChange={(step) => {
                      console.log(`🔍 Social dialog: Step changed to ${step}`);
                    }}
                    onFinalStepCompleted={() => {
                      console.log("🔍 Social dialog: Todos os steps completados!");
                      saveAndCloseDialog('social');
                    }}
                    backButtonText="Anterior"
                    nextButtonText="Próximo"
                    backButtonProps={{
                      className: "bg-[#2C8587] text-[#F7F5F3] border-[#277677] hover:bg-[#277677] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                    nextButtonProps={{
                      className: "bg-[#277677] text-[#FBF9F7] hover:bg-[#1c6363] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                  >
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Redes Principais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateTempData('social', { instagramUrl: e.target.value });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
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
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateTempData('social', { facebookUrl: e.target.value });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Redes Adicionais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateTempData('social', { linkedinUrl: e.target.value });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
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
                                    onChange={(e) => {
                                      field.onChange(e);
                                      updateTempData('social', { youtubeUrl: e.target.value });
                                    }}
                                    className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] placeholder:text-[#FBF9F7]/60"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Revisão e Confirmação</h3>
                        
                        <div className="bg-[#145759] p-3 md:p-4 rounded-lg border border-[#277677]/20">
                          <h4 className="font-medium text-[#FBF9F7] mb-2 md:mb-3 text-left">Resumo das Redes Sociais:</h4>
                          
                          <div className="text-sm leading-tight">
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Instagram: {tempSocialData.instagramUrl || 'Não informado'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Facebook: {tempSocialData.facebookUrl || 'Não informado'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              LinkedIn: {tempSocialData.linkedinUrl || 'Não informado'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              YouTube: {tempSocialData.youtubeUrl || 'Não informado'}
                            </div>
                          </div>
                          
                          <div className="mt-3 md:mt-4">
                            <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Detalhes:</h5>
                            <ul className="text-sm text-[#FBF9F7]/80 space-y-1">
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                Todas as redes sociais serão atualizadas simultaneamente
                              </li>
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                As alterações serão aplicadas imediatamente após a confirmação
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Step>
                  </Stepper>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Image Management Container */}
      <Card className="bg-[#277677] rounded-lg px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#FBF9F7]" />
            <span className="font-medium text-[#FBF9F7]">Gerenciamento de Imagens</span>
          </div>
          
          <Dialog 
            open={imageDialogOpen} 
            onOpenChange={(open) => {
              if (open) {
                resetTempData('image');
              } else {
                // Reset temporary data when dialog is closed without saving
                setTempImageData({});
              }
              setImageDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="text-[#FBF9F7]"
                style={{
                  background: 'linear-gradient(to top, #1c6363, #277677)'
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto admin-dialog-content">
              <DialogHeader>
                <DialogTitle className="text-[#FBF9F7]">Editar Gerenciamento de Imagens</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <div className="space-y-6">
                  <Stepper
                    initialStep={1}
                    onStepChange={(step) => {
                      console.log(`🔍 Image dialog: Step changed to ${step}`);
                    }}
                    onFinalStepCompleted={() => {
                      console.log("🔍 Image dialog: Todos os steps completados!");
                      saveAndCloseDialog('image');
                    }}
                    backButtonText="Anterior"
                    nextButtonText="Próximo"
                    backButtonProps={{
                      className: "bg-[#2C8587] text-[#F7F5F3] border-[#277677] hover:bg-[#277677] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                    nextButtonProps={{
                      className: "bg-[#277677] text-[#FBF9F7] hover:bg-[#1c6363] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                  >
                    <Step>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#FBF9F7] mb-4">Imagem Principal</h3>
                        
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
                                      console.log('🔍 [UPLOAD] Starting upload for main image');
                                      await handleImageUpload(file, 'main');
                                      console.log('🔍 [UPLOAD] Upload completed for main image');
                                    }}
                                    isUploading={isUploadingMain}
                                    hasImage={!!mainImageUrl}
                                  />
                                  {mainImageUrl && (
                                    <div className="mt-2">
                                      <RobustImage src={mainImageUrl} alt="Preview" className="max-w-xs max-h-32 object-cover rounded" />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-1 text-white hover:text-white hover:bg-white hover:text-red-600"
                                        onClick={() => {
                                          setMainImageUrl(null);
                                          field.onChange("");
                                          updateTempData('image', { mainImage: "" });
                                        }}
                                      >
                                        Remover Imagem
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#FBF9F7] mb-4">Imagem de Rede</h3>
                        
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
                                      console.log('🔍 [UPLOAD] Starting upload for network image');
                                      await handleImageUpload(file, 'network');
                                      console.log('🔍 [UPLOAD] Upload completed for network image');
                                    }}
                                    isUploading={isUploadingNetwork}
                                    hasImage={!!networkImageUrl}
                                  />
                                  {networkImageUrl && (
                                    <div className="mt-2">
                                      <RobustImage src={networkImageUrl} alt="Preview" className="max-w-xs max-h-32 object-cover rounded" />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-1 text-white hover:text-white hover:bg-white hover:text-red-600"
                                        onClick={() => {
                                          setNetworkImageUrl(null);
                                          field.onChange("");
                                          updateTempData('image', { networkImage: "" });
                                        }}
                                      >
                                        Remover Imagem
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#FBF9F7] mb-4">Imagem Sobre</h3>
                        
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
                                      console.log('🔍 [UPLOAD] Starting upload for about image');
                                      await handleImageUpload(file, 'about');
                                      console.log('🔍 [UPLOAD] Upload completed for about image');
                                    }}
                                    isUploading={isUploadingAbout}
                                    hasImage={!!aboutImageUrl}
                                  />
                                  {aboutImageUrl && (
                                    <div className="mt-2">
                                      <RobustImage src={aboutImageUrl} alt="Preview" className="max-w-xs max-h-32 object-cover rounded" />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-1 text-white hover:text-white hover:bg-white hover:text-red-600"
                                        onClick={() => {
                                          setAboutImageUrl(null);
                                          field.onChange("");
                                          updateTempData('image', { aboutImage: "" });
                                        }}
                                      >
                                        Remover Imagem
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Revisão e Confirmação</h3>
                        
                        <div className="bg-[#145759] p-3 md:p-4 rounded-lg border border-[#277677]/20">
                          <h4 className="font-medium text-[#FBF9F7] mb-2 md:mb-3 text-left">Resumo das Imagens:</h4>
                          
                          <div className="text-sm leading-tight">
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Imagem Principal: {tempImageData.mainImage ? 'Atualizada' : 'Não informada'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Imagem de Rede: {tempImageData.networkImage ? 'Atualizada' : 'Não informada'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Imagem Sobre: {tempImageData.aboutImage ? 'Atualizada' : 'Não informada'}
                            </div>
                          </div>
                          
                          <div className="mt-3 md:mt-4">
                            <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Detalhes:</h5>
                            <ul className="text-sm text-[#FBF9F7]/80 space-y-1">
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                Todas as imagens serão atualizadas simultaneamente
                              </li>
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                As alterações serão aplicadas imediatamente após a confirmação
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Step>
                  </Stepper>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Company Information Container */}
      <Card className="bg-[#277677] rounded-lg px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#FBF9F7]" />
            <span className="font-medium text-[#FBF9F7]">Informações da Empresa</span>
          </div>
          
          <Dialog 
            open={companyDialogOpen} 
            onOpenChange={(open) => {
              if (open) {
                resetTempData('company');
              } else {
                // Reset temporary data when dialog is closed without saving
                setTempCompanyData({});
              }
              setCompanyDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="text-[#FBF9F7]"
                style={{
                  background: 'linear-gradient(to top, #1c6363, #277677)'
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#FBF9F7]">Editar Informações da Empresa</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <div className="space-y-6">
                  <Stepper
                    initialStep={1}
                    onStepChange={(step) => {
                      console.log(`🔍 Company dialog: Step changed to ${step}`);
                    }}
                    onFinalStepCompleted={() => {
                      console.log("🔍 Company dialog: Todos os steps completados!");
                      saveAndCloseDialog('company');
                    }}
                    backButtonText="Anterior"
                    nextButtonText="Próximo"
                    backButtonProps={{
                      className: "bg-[#2C8587] text-[#F7F5F3] border-[#277677] hover:bg-[#277677] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                    nextButtonProps={{
                      className: "bg-[#277677] text-[#FBF9F7] hover:bg-[#1c6363] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                  >
                    <Step>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#FBF9F7] mb-4">Horários</h3>
                        
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
                                  onChange={(e) => {
                                    field.onChange(e);
                                    updateTempData('company', { businessHours: e.target.value });
                                  }}
                                  className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] resize-none placeholder:text-[#FBF9F7]/60"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#FBF9F7] mb-4">História</h3>
                        
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
                                  onChange={(e) => {
                                    field.onChange(e);
                                    updateTempData('company', { ourStory: e.target.value });
                                  }}
                                  className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] resize-none placeholder:text-[#FBF9F7]/60"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Revisão e Confirmação</h3>
                        
                        <div className="bg-[#145759] p-3 md:p-4 rounded-lg border border-[#277677]/20">
                          <h4 className="font-medium text-[#FBF9F7] mb-2 md:mb-3 text-left">Resumo das Informações da Empresa:</h4>
                          
                          <div className="text-sm leading-tight">
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Horário de Atendimento: {tempCompanyData.businessHours || 'Não informado'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Nossa História: {tempCompanyData.ourStory ? 'Atualizada' : 'Não informada'}
                            </div>
                          </div>
                          
                          <div className="mt-3 md:mt-4">
                            <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Detalhes:</h5>
                            <ul className="text-sm text-[#FBF9F7]/80 space-y-1">
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                Todas as informações da empresa serão atualizadas simultaneamente
                              </li>
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                As alterações serão aplicadas imediatamente após a confirmação
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Step>
                  </Stepper>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Legal Pages Container */}
      <Card className="bg-[#277677] rounded-lg px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-4 text-[#FBF9F7]" />
            <span className="font-medium text-[#FBF9F7]">Páginas Legais</span>
          </div>
          
          <Dialog 
            open={legalDialogOpen} 
            onOpenChange={(open) => {
              if (open) {
                resetTempData('legal');
              } else {
                // Reset temporary data when dialog is closed without saving
                setTempLegalData({});
              }
              setLegalDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="text-[#FBF9F7]"
                style={{
                  background: 'linear-gradient(to top, #1c6363, #277677)'
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#FBF9F7]">Editar Páginas Legais</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <div className="space-y-6">
                  <Stepper
                    initialStep={1}
                    onStepChange={(step) => {
                      console.log(`🔍 Legal dialog: Step changed to ${step}`);
                    }}
                    onFinalStepCompleted={() => {
                      console.log("🔍 Legal dialog: Todos os steps completados!");
                      saveAndCloseDialog('legal');
                    }}
                    backButtonText="Anterior"
                    nextButtonText="Próximo"
                    backButtonProps={{
                      className: "bg-[#2C8587] text-[#F7F5F3] border-[#277677] hover:bg-[#277677] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                    nextButtonProps={{
                      className: "bg-[#277677] text-[#FBF9F7] hover:bg-[#1c6363] px-3 py-2 md:px-4 rounded text-sm md:text-base w-full md:w-auto"
                    }}
                  >
                    <Step>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#FBF9F7] mb-4">Política de Privacidade</h3>
                        
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
                                  onChange={(e) => {
                                    field.onChange(e);
                                    updateTempData('legal', { privacyPolicy: e.target.value });
                                  }}
                                  className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] resize-none placeholder:text-[#FBF9F7]/60"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#FBF9F7] mb-4">Termos de Uso</h3>
                        
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
                                  onChange={(e) => {
                                    field.onChange(e);
                                    updateTempData('legal', { termsOfUse: e.target.value });
                                  }}
                                  className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] resize-none placeholder:text-[#FBF9F7]/60"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Step>
                    
                    <Step>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Revisão e Confirmação</h3>
                        
                        <div className="bg-[#145759] p-3 md:p-4 rounded-lg border border-[#277677]/20">
                          <h4 className="font-medium text-[#FBF9F7] mb-2 md:mb-3 text-left">Resumo das Páginas Legais:</h4>
                          
                          <div className="text-sm leading-tight">
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Política de Privacidade: {tempLegalData.privacyPolicy ? 'Atualizada' : 'Não informada'}
                            </div>
                            <div className="text-[#FBF9F7] font-medium mb-1 text-left">
                              <span className="text-[#277677] mr-2">•</span>
                              Termos de Uso: {tempLegalData.termsOfUse ? 'Atualizada' : 'Não informada'}
                            </div>
                          </div>
                          
                          <div className="mt-3 md:mt-4">
                            <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Detalhes:</h5>
                            <ul className="text-sm text-[#FBF9F7]/80 space-y-1">
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                Todas as páginas legais serão atualizadas simultaneamente
                              </li>
                              <li className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                As alterações serão aplicadas imediatamente após a confirmação
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Step>
                  </Stepper>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}