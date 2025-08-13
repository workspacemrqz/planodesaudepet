import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NetworkUnit, InsertNetworkUnit } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, Phone, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SimpleImageUploader } from "@/components/SimpleImageUploader";

const networkUnitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  rating: z.number().min(1).max(5, "Rating deve ser entre 1 e 5"),
  services: z.array(z.string()).min(1, "Pelo menos um serviço é obrigatório"),
  imageUrl: z.string().optional(),
});

type NetworkUnitFormData = z.infer<typeof networkUnitFormSchema>;

export default function NetworkUnitsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<NetworkUnit | null>(null);
  const [servicesInput, setServicesInput] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const { data: units, isLoading } = useQuery<NetworkUnit[]>({
    queryKey: ["/api/admin/network-units"],
  });

  const form = useForm<NetworkUnitFormData>({
    resolver: zodResolver(networkUnitFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      rating: 4,
      services: [],
      imageUrl: "",
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: InsertNetworkUnit) => {
      const response = await apiRequest("POST", "/api/admin/network-units", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/network-units"] });
      toast({ title: "Unidade criada com sucesso!" });
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
      toast({ title: "Unidade atualizada com sucesso!" });
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
      toast({ title: "Unidade removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover unidade", variant: "destructive" });
    },
  });



  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Get presigned URL
      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
      });
      const { uploadURL } = await uploadResponse.json();
      
      // Upload to object storage
      const putResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!putResponse.ok) {
        throw new Error('Upload failed');
      }
      
      // Set the uploaded image URL for preview only
      setUploadedImageUrl(uploadURL);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Falha no upload da imagem",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
    setServicesInput("");
    setUploadedImageUrl(null);
    setCurrentStep(1);
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
    });
    setServicesInput(unit.services.join("\n"));
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
    setCurrentStep(1);
    setIsDialogOpen(true);
  };

  const handleNewUnit = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleDelete = (unit: NetworkUnit) => {
    if (confirm(`Tem certeza que deseja remover "${unit.name}"?`)) {
      deleteUnitMutation.mutate(unit.id);
    }
  };

  const onSubmit = (data: NetworkUnitFormData) => {
    const services = servicesInput.split("\n").filter(s => s.trim().length > 0);
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold mb-1 text-[#fbf9f7]">
          Gerenciar Unidades da Rede
        </h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewUnit}
              className="bg-[#145759] hover:bg-[#145759]/90 text-[#fbf9f7]"
              data-testid="button-add-unit"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#e5e7eb]">
                {editingUnit ? "Editar Unidade" : "Nova Unidade"} - Passo {currentStep} de 3
              </DialogTitle>
            </DialogHeader>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#E1AC33] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            <Form {...form}>
              <div className="space-y-4 admin-no-focus" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}>
                
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-[#277677]">Informações Básicas</h4>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Unidade</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Hospital Veterinário São Paulo"
                              {...field}
                              data-testid="input-unit-name"
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
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rua das Flores, 123 - Centro"
                              {...field}
                              data-testid="input-unit-address"
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
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(11) 99999-9999"
                              {...field}
                              data-testid="input-unit-phone"
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
                          <FormLabel>Avaliação</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                min={1}
                                max={5}
                                step={0.1}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                                className="w-full"
                                data-testid="slider-unit-rating"
                              />
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>1</span>
                                <span className="font-medium text-[#277677]">{field.value.toFixed(1)}</span>
                                <span>5</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Image Upload */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-[#277677]">Imagem da Unidade</h4>
                    
                    <div className="space-y-3">
                      <SimpleImageUploader onFileSelect={handleImageUpload} isUploading={isUploading} hasImage={!!uploadedImageUrl} />
                      
                      {uploadedImageUrl && !isUploading && (
                        <div className="space-y-3">
                          <div className="text-sm p-2 rounded border bg-[#277677] text-[#ffffff]">
                            ✓ Imagem carregada com sucesso
                          </div>
                          <div className="w-32 h-32 border-2 border-[#277677] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img 
                              src={uploadedImageUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden text-gray-500 text-xs">Erro ao carregar</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Services */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-[#277677]">Serviços Disponíveis</h4>
                    
                    <div>
                      <FormLabel>Serviços (um por linha)</FormLabel>
                      <Textarea
                        value={servicesInput}
                        onChange={(e) => setServicesInput(e.target.value)}
                        placeholder="Emergência 24h&#10;Cirurgia&#10;Internação&#10;Exames"
                        rows={8}
                        className="mt-2 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 hover:border-gray-300"
                        data-testid="textarea-unit-services"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <div>
                    {currentStep > 1 && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={prevStep}
                        data-testid="button-prev-step"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-unit"
                    >
                      Cancelar
                    </Button>
                    
                    {currentStep < 3 ? (
                      <Button 
                        type="button"
                        onClick={nextStep}
                        data-testid="button-next-step"
                        className="text-[#ffffff]"
                      >
                        Próximo
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)(e);
                        }}
                        disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
                        data-testid="button-save-unit"
                        className="text-[#ffffff]"
                      >
                        {editingUnit ? "Atualizar" : "Criar"} Unidade
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {units?.map((unit) => (
          <div key={unit.id} className="border border-[#2F8585] rounded-lg bg-[#145759] p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-[#FBF9F7] font-medium">{unit.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(unit)}
                  className="h-8 w-8 p-0 bg-[#2F8585] text-[#FBF9F7] hover:bg-[#2F8585] hover:text-[#FBF9F7] transition-none"
                  data-testid={`button-edit-unit-${unit.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(unit)}
                  className="h-8 w-8 p-0 bg-[#FBF9F7] text-[#2F8585] hover:bg-[#FBF9F7] hover:text-[#2F8585] transition-none"
                  data-testid={`button-delete-unit-${unit.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {(!units || units.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-[#277677] mx-auto mb-4" />
            <p className="text-[#302e2b]">Nenhuma unidade cadastrada ainda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}