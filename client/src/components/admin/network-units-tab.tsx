import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NetworkUnit, InsertNetworkUnit } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Stepper, { Step } from "@/components/ui/Stepper";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, MapPin, Phone, Star, ChevronLeft, ChevronRight, Search, Filter, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SimpleImageUploader } from "@/components/SimpleImageUploader";
import { RobustImage } from "@/components/ui/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

const networkUnitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  rating: z.number().min(1).max(5, "Rating deve ser entre 1 e 5"),
  services: z.array(z.string()).min(1, "Pelo menos um serviço é obrigatório"),
  imageUrl: z.string().optional(),
  whatsapp: z.string().regex(/^\d{11}$/, "WhatsApp deve conter exatamente 11 dígitos"),
  googleMapsUrl: z.string().url("URL do Google Maps deve ser válida"),
});

type NetworkUnitFormData = z.infer<typeof networkUnitFormSchema>;

const AVAILABLE_SERVICES = [
  "Consulta clínica geral",
  "Consulta especializada (dermatologia, cardiologia, etc.)",
  "Atendimento emergencial / urgência 24h",
  "Avaliação comportamental",
  "Aplicação de vacinas obrigatórias",
  "Aplicação de vacinas opcionais",
  "Controle de ectoparasitas (pulgas e carrapatos)",
  "Vermifugação",
  "Exames laboratoriais (sangue, urina, fezes)",
  "Exames de imagem (raio-X, ultrassonografia, endoscopia)",
  "Eletrocardiograma (ECG)",
  "Testes alérgicos",
  "Castração",
  "Cirurgias de emergência",
  "Cirurgias ortopédicas",
  "Cirurgias odontológicas",
  "Cirurgias oftalmológicas",
  "Internação clínica",
  "Internação cirúrgica",
  "Terapia intensiva / UTI veterinária",
  "Tratamento com fluidoterapia",
  "Aplicação de medicamentos",
  "Limpeza dental (profilaxia)",
  "Extração dentária",
  "Avaliação odontológica",
  "Banho e tosa higiênica",
  "Tosa por padrão de raça",
  "Hidratação de pelagem",
  "Limpeza de ouvidos / corte de unhas",
  "Avaliação nutricional",
  "Plano alimentar personalizado",
  "Programa de controle de obesidade",
  "Microchipagem",
  "Emissão de atestados de saúde",
  "Emissão de passaporte pet / documentação para viagens",
  "Venda de produtos pet (ração, medicamentos, acessórios)"
];

export default function NetworkUnitsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<NetworkUnit | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<NetworkUnit | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterByService, setFilterByService] = useState<string>("all");
  const [filterByCity, setFilterByCity] = useState<string>("all");
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: units, isLoading, error } = useQuery<NetworkUnit[]>({
    queryKey: ["/api/admin/network-units"],
    queryFn: async () => {
      const response = await fetch("/api/admin/network-units", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Falha ao carregar unidades da rede");
      }
      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Use predefined services list for filter dropdown
  const availableServices = useMemo(() => {
    return AVAILABLE_SERVICES.sort();
  }, []);

  // Get unique cities for filter dropdown
  const availableCities = useMemo(() => {
    if (!units) return [];
    const cities = units.map(unit => {
      // Extract city from address (assuming format like "Street, City, State")
      const addressParts = unit.address.split(',');
      return addressParts.length > 1 ? addressParts[1].trim() : addressParts[0].trim();
    });
    return Array.from(new Set(cities)).sort();
  }, [units]);

  // Filter units based on search and filter criteria
  const filteredUnits = useMemo(() => {
    if (!units) return [];
    
    return units.filter(unit => {
      // Search by name or address
      const matchesSearch = searchText === "" || 
        unit.name.toLowerCase().includes(searchText.toLowerCase()) ||
        unit.address.toLowerCase().includes(searchText.toLowerCase());
      
      // Filter by city
      const matchesCity = filterByCity === "all" || 
        unit.address.toLowerCase().includes(filterByCity.toLowerCase());
      
      // Filter by service
      const matchesService = filterByService === "all" || 
        unit.services.includes(filterByService);
      
      return matchesSearch && matchesCity && matchesService;
    });
  }, [units, searchText, filterByCity, filterByService]);

  const form = useForm<NetworkUnitFormData>({
    resolver: zodResolver(networkUnitFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      rating: 4,
      services: [],
      imageUrl: "",
      whatsapp: "",
      googleMapsUrl: "",
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: InsertNetworkUnit) => {
      const response = await apiRequest("POST", "/api/admin/network-units", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/network-units"] });
      // Notificação de sucesso removida
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar unidade", variant: "destructive" });
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertNetworkUnit> }) => {
      const response = await apiRequest("PUT", `/api/admin/network-units/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/network-units"] });
      // Notificação de sucesso removida
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar unidade", variant: "destructive" });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/network-units/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/network-units"] });
      // Notificação de sucesso removida
    },
    onError: () => {
      toast({ title: "Erro ao remover unidade", variant: "destructive" });
    },
  });



  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
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
      const response = await fetch('/api/images/upload/network/unit', {
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
      
      console.log('Image uploaded and converted to Base64 successfully');
      
      // Update local state with Base64 data
      setUploadedImageUrl(result.base64);
      
      // Show success toast
      toast({
        title: "Sucesso",
        description: "Imagem carregada e convertida com sucesso!",
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha no upload da imagem",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const resetForm = () => {
    form.reset({
      name: "",
      address: "",
      phone: "",
      rating: 4,
      services: [],
      imageUrl: "",
    });
    setSelectedServices([]);
    setUploadedImageUrl(null);
    setEditingUnit(null);
    setIsUploading(false);
  };

  const handleEdit = (unit: NetworkUnit) => {
    setEditingUnit(unit);
    form.reset({
      name: unit.name,
      address: unit.address,
      phone: unit.phone,
      rating: unit.rating / 10, // Convert from stored format (10-50) to display format (1-5)
      services: unit.services,
      imageUrl: unit.imageUrl,
      whatsapp: unit.whatsapp || "",
      googleMapsUrl: unit.googleMapsUrl || "",
    });
    setSelectedServices(unit.services);
    // Handle different URL types for preview
    let previewUrl = null;
    if (unit.imageUrl) {
      if (unit.imageUrl.startsWith('/objects/') || unit.imageUrl.startsWith('https://')) {
        previewUrl = unit.imageUrl;
      } else {
        previewUrl = unit.imageUrl;
      }
    }
    setUploadedImageUrl(previewUrl);
    setIsDialogOpen(true);
  };

  const handleNewUnit = () => {
    resetForm();
    setIsDialogOpen(true);
  };



  const handleDelete = (unit: NetworkUnit) => {
    setUnitToDelete(unit);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (unitToDelete) {
      deleteUnitMutation.mutate(unitToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setUnitToDelete(null);
          toast({
            title: "Sucesso",
            description: "Unidade removida com sucesso.",
          });
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Erro ao remover unidade. Tente novamente.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUnitToDelete(null);
  };

  const onSubmit = (data: NetworkUnitFormData) => {
    const services = selectedServices;
    const unitData: InsertNetworkUnit = {
      ...data,
      rating: data.rating * 10, // Convert from display format (1-5) to stored format (10-50)
      services,
      isActive: true,
      imageUrl: uploadedImageUrl || data.imageUrl || "",
    };

    if (editingUnit) {
      updateUnitMutation.mutate({ id: editingUnit.id, data: unitData });
    } else {
      createUnitMutation.mutate(unitData);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Erro ao carregar unidades da rede: {error.message}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className={`${isMobile ? 'block space-y-4' : 'flex items-center justify-between'} mb-6`}>
        <div>
          <h3 className="text-lg font-semibold mb-1 text-[#fbf9f7]">
            Gerenciar Unidades da Rede
          </h3>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewUnit}
              className="text-[#fbf9f7] bg-[#E1AC33] w-full sm:w-auto"
              data-testid="button-add-unit"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto mx-auto rounded-lg md:rounded-xl">
            <div className="p-6">
              <DialogHeader className="px-2 md:px-0">
                <DialogTitle className="text-[#ffffff] text-lg md:text-xl text-center md:text-left">
                  {editingUnit ? "Editar Unidade" : "Nova Unidade"}
                </DialogTitle>
              </DialogHeader>
              
              

              <Form {...form}>
                <div className="mt-2 md:mt-4 px-2 md:px-0">
                  <Stepper
                  initialStep={1}
                  onStepChange={(step) => {
                    console.log(`Network units dialog: Step changed to ${step}`);
                  }}
                  onFinalStepCompleted={() => {
                    console.log("Network units dialog: Todos os steps completados!");
                    // Sincronizar serviços selecionados com o formulário
                    form.setValue('services', selectedServices);
                    form.handleSubmit(onSubmit)();
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
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-[#FBF9F7] mb-2">Nome da Unidade</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Hospital Veterinário São Paulo"
                                {...field}
                                data-testid="input-unit-name"
                                className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
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
                            <FormLabel className="block text-sm font-medium text-[#FBF9F7] mb-2">Endereço</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Rua das Flores, 123 - Centro"
                                {...field}
                                data-testid="input-unit-address"
                                className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-[#FBF9F7] mb-2">Telefone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(11) 99999-9999"
                                {...field}
                                data-testid="input-unit-phone"
                                className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-[#FBF9F7] mb-2">WhatsApp</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <span className="inline-flex items-center px-3 text-sm text-[#302e2b] bg-[#DED8CE] rounded-l-md border border-[#c7c1b7]">
                                  https://wa.me/
                                </span>
                                <Input
                                  placeholder="11999999999"
                                  {...field}
                                  className="rounded-l-none bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                                  maxLength={11}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    field.onChange(value);
                                  }}
                                  data-testid="input-unit-whatsapp"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="googleMapsUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-[#FBF9F7] mb-2">Link do Google Maps</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://maps.google.com/..."
                                {...field}
                                data-testid="input-unit-google-maps"
                                className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FormLabel className="block text-sm font-medium text-[#FBF9F7] mb-2">Avaliação</FormLabel>
                              <span className="font-medium text-[#e1ac33]">{field.value.toFixed(1)}</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={1}
                                max={5}
                                step={0.1}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                                className="w-full"
                                data-testid="slider-unit-rating"
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
                      <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Imagem da Unidade</h3>
                      
                      <div className="space-y-3">
                        <SimpleImageUploader onFileSelect={handleImageUpload} isUploading={isUploading} hasImage={!!uploadedImageUrl} />
                        
                        {uploadedImageUrl && !isUploading && (
                          <div className="space-y-3">
                            <div className="text-sm p-2 rounded bg-[#195d5e] text-[#FBF9F7] border border-[#277677]/20">
                              ✓ Imagem carregada com sucesso
                            </div>
                            <div className="w-32 h-32 rounded-lg square-image-container bg-gray-100">
                              <img 
                                src={(() => {
                                  const url = uploadedImageUrl;
                                  console.log(`[IMAGE DEBUG] Original path: ${uploadedImageUrl}, Generated URL: ${url}`);
                                  return url;
                                })()} 
                                alt="Preview" 
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  console.error(`[IMAGE ERROR] Failed to load image:`, e.currentTarget.src);
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden text-gray-500 text-xs items-center justify-center h-full">Erro ao carregar</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Step>
                  
                  <Step>
                    <div className="space-y-3 md:space-y-4">
                      <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Serviços Disponíveis</h3>
                      
                      <div className="max-h-64 overflow-y-auto border border-[#277677] rounded-md p-3 bg-[#195d5e]">
                        <div className="grid grid-cols-1 gap-2">
                          {AVAILABLE_SERVICES.map((service, index) => (
                            <label
                              key={index}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-[#2C8587] p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedServices.includes(service)}
                                onChange={() => handleServiceToggle(service)}
                                className="rounded border-[#277677] text-[#E1AC33] focus:ring-[#E1AC33] focus:ring-offset-0 bg-[#195d5e]"
                              />
                              <span className="text-[#FBF9F7] text-sm">{service}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-xs text-[#FBF9F7]/70 mt-1">
                        Selecionados: {selectedServices.length} serviços
                      </div>
                    </div>
                  </Step>
                  
                  <Step>
                    <div className="space-y-3 md:space-y-4">
                      <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Revisão e Confirmação</h3>
                      
                      <div className="bg-[#195d5e] p-3 md:p-4 rounded-lg border border-[#277677]/20">
                        <h4 className="font-medium text-[#FBF9F7] mb-2 md:mb-3 text-left">Resumo da Unidade:</h4>
                        
                        <div className="text-sm leading-tight">
                          <div className="text-[#FBF9F7] font-medium mb-1 text-left">{form.getValues('name')}</div>
                          <div className="text-[#FBF9F7] font-medium mb-1 text-left">{form.getValues('address')}</div>
                          <div className="text-[#FBF9F7] font-medium mb-1 text-left">{form.getValues('phone')}</div>
                          <div className="text-[#FBF9F7] font-medium mb-1 text-left">{form.getValues('whatsapp')}</div>
                          <div className="text-[#FBF9F7] font-medium mb-1 text-left">{form.getValues('googleMapsUrl')}</div>
                          <div className="text-[#FBF9F7] font-medium mb-1 text-left">Avaliação: {form.getValues('rating').toFixed(1)}</div>
                        </div>
                        
                        <div className="mt-3 md:mt-4">
                          <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Serviços Selecionados:</h5>
                          <ul className="text-sm text-[#FBF9F7]/80 space-y-1">
                            {selectedServices.map((service, index) => (
                              <li key={index} className="flex items-center">
                                <span className="text-[#277677] mr-2">•</span>
                                {service}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {uploadedImageUrl && (
                          <div className="mt-3 md:mt-4">
                            <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Imagem:</h5>
                            <div className="text-sm text-[#FBF9F7]/80">
                              ✓ Imagem carregada com sucesso
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Step>
                                   </Stepper>
                 </div>
               </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Filter Section */}
      <div className="mb-6 space-y-4">

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search by name/address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#fbf9f7]">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#FBF9F7]" />
              <Input
                placeholder="Buscar..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 text-[#FBF9F7] bg-[#2E8585] placeholder:text-[#AAAAAA] admin-rede-search border-[#277677] focus:ring-[#277677] focus:border-[#277677]"
                data-testid="input-search-units"
              />
            </div>
          </div>

          {/* Filter by city */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#fbf9f7]">
              Filtrar por cidade
            </label>
            <Select value={filterByCity} onValueChange={setFilterByCity}>
              <SelectTrigger className="bg-[#195d5e] text-[#fbf9f7]" data-testid="select-city-filter">
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by service */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#fbf9f7]">
              Filtrar por serviço
            </label>
            <Select value={filterByService} onValueChange={setFilterByService}>
              <SelectTrigger className="bg-[#195d5e] text-[#fbf9f7]" data-testid="select-service-filter">
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                {availableServices.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear filters button */}
        {(searchText || filterByCity !== "all" || filterByService !== "all") && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchText("");
                setFilterByCity("all");
                setFilterByService("all");
              }}
              className="hover:text-[#fbf9f7] text-[#fbf9f7] flex items-center justify-center"
              style={{
                background: 'linear-gradient(to top, #1c6363, #277677)'
              }}
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-[#fbf9f7]">
          {filteredUnits.length === units?.length 
            ? `${filteredUnits.length} unidade${filteredUnits.length !== 1 ? 's' : ''} encontrada${filteredUnits.length !== 1 ? 's' : ''}`
            : `${filteredUnits.length} de ${units?.length} unidade${(units?.length || 0) !== 1 ? 's' : ''} encontrada${filteredUnits.length !== 1 ? 's' : ''}`
          }
        </div>
      </div>
      <div className="space-y-4">
        {filteredUnits?.map((unit) => (
          <div key={unit.id} className="rounded-lg px-4 mt-[10px] mb-[10px] bg-[#195d5e]">
            <div className={`${isMobile ? 'block' : 'flex items-center justify-between'} py-4`}>
              <div className={`${isMobile ? 'mb-3' : 'flex-1'}`}>
                <h3 className="text-[#FBF9F7] font-medium">{unit.name}</h3>
              </div>
              <div className={`flex items-center gap-1 ${isMobile ? 'justify-start' : ''}`}>
                <Button
                  size="sm"
                  onClick={() => handleEdit(unit)}
                  className="text-[#FBF9F7]"
                  style={{
                    background: 'linear-gradient(to top, #1c6363, #277677)'
                  }}
                  data-testid={`button-edit-unit-${unit.id}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDelete(unit)}
                  className="text-[#FBF9F7]"
                  style={{
                    background: 'linear-gradient(to top, #c99524, #E1AC33)'
                  }}
                  data-testid={`button-delete-unit-${unit.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2 text-[#FBF9F7]" />
                  Apagar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {(!units || units.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-[#145759] mx-auto mb-4" />
            <p className="text-[#FBF9F7]">Nenhuma unidade cadastrada ainda.</p>
          </CardContent>
        </Card>
      )}
      {units && units.length > 0 && filteredUnits.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Search className="h-12 w-12 text-[#145759] mx-auto mb-4" />
            <p className="text-[#FBF9F7]">Nenhuma unidade encontrada com os filtros aplicados.</p>
            
          </CardContent>
        </Card>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja remover a unidade "${unitToDelete?.name}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={deleteUnitMutation.isPending}
        icon={<Trash2 className="h-6 w-6" />}
      />
    </div>
  );
}