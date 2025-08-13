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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, Phone, Star } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SimpleImageUploader } from "@/components/SimpleImageUploader";

const networkUnitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  rating: z.number().min(10).max(50, "Rating deve ser entre 1.0 e 5.0"),
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
      rating: 40,
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
      form.reset();
      setServicesInput("");
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
      setEditingUnit(null);
      form.reset();
      setServicesInput("");
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

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ unitId, imageURL }: { unitId: string, imageURL: string }) => {
      const response = await apiRequest("PUT", `/api/admin/network-units/${unitId}/image`, { imageURL });
      return await response.json();
    },
    onSuccess: (data) => {
      // Update the preview with the normalized object path
      if (data.objectPath) {
        setUploadedImageUrl(data.objectPath);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/network-units"] });
      toast({
        title: "Sucesso",
        description: "Imagem atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar imagem",
        variant: "destructive",
      });
    },
  });

  // Handle file selection and upload
  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Get upload URL
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      const uploadURL = data.uploadURL;
      
      // Upload file directly to storage
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      // Set the uploaded image URL for preview
      setUploadedImageUrl(uploadURL);
      
      // If editing a unit, update the image immediately with the presigned URL
      // The server will convert it to the proper object path
      if (editingUnit) {
        uploadImageMutation.mutate({ 
          unitId: editingUnit.id, 
          imageURL: uploadURL 
        });
      }
      
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso",
      });
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar imagem",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (unit: NetworkUnit) => {
    setEditingUnit(unit);
    form.reset({
      name: unit.name,
      address: unit.address,
      phone: unit.phone,
      rating: unit.rating,
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
    setIsDialogOpen(true);
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

  const resetForm = () => {
    form.reset();
    setServicesInput("");
    setEditingUnit(null);
    setUploadedImageUrl(null);
    setIsUploading(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#FBF9F7]">Gerenciar Rede Credenciada</h3>
          <p className="text-sm text-[#FBF9F7]/70">
            Adicione, edite ou remova unidades da rede credenciada
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 hover:bg-[#277677]/90 text-[#fbf9f7] bg-[#145759]" data-testid="button-add-unit">
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#277677]">
                {editingUnit ? "Editar Unidade" : "Nova Unidade"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 admin-no-focus">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Unidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Hospital Animal's São Paulo" {...field} data-testid="input-unit-name" className="focus:ring-0 focus:ring-offset-0 focus:border-gray-300 hover:border-gray-300" />
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
                        <Textarea placeholder="Endereço completo" {...field} data-testid="textarea-unit-address" className="focus:ring-0 focus:ring-offset-0 focus:border-gray-300 hover:border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} data-testid="input-unit-phone" className="focus:ring-0 focus:ring-offset-0 focus:border-gray-300 hover:border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avaliação (1.0 a 5.0)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            min="10"
                            max="50"
                            placeholder="45 (para 4.5)"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-unit-rating"
                            className="focus:ring-0 focus:ring-offset-0 focus:border-gray-300 hover:border-gray-300"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-[#e6e6e6]">Digite como número inteiro (45 para 4.5 estrelas)</p>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <FormLabel>Imagem da Unidade</FormLabel>
                  
                  {/* Image preview container */}
                  {uploadedImageUrl && (
                    <div className="w-32 h-32 border-2 border-[#277677] rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={uploadedImageUrl} 
                        alt="Preview da imagem"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, show a placeholder
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <SimpleImageUploader
                    onFileSelect={handleFileSelect}
                    isUploading={isUploading}
                    hasImage={!!uploadedImageUrl}
                    buttonClassName="w-full bg-[#277677] hover:bg-[#1f5a5c] text-white disabled:opacity-50"
                  />
                  
                  {uploadedImageUrl && !isUploading && (
                    <div className="text-sm p-2 rounded border bg-[#277677] text-[#ffffff]">
                      ✓ Imagem carregada com sucesso
                    </div>
                  )}
                </div>

                <div>
                  <FormLabel>Serviços Disponíveis (um por linha)</FormLabel>
                  <Textarea
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                    placeholder="Emergência 24h&#10;Cirurgia&#10;Internação&#10;Exames"
                    rows={6}
                    className="mt-2 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 hover:border-gray-300"
                    data-testid="textarea-unit-services"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel-unit"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
                    data-testid="button-save-unit"
                    className="text-[#ffffff]"
                  >
                    {editingUnit ? "Atualizar" : "Criar"} Unidade
                  </Button>
                </div>
              </form>
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