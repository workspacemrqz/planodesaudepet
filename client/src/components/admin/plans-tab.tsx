import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plan, InsertPlan } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Star, GripVertical, CreditCard } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

const planFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  features: z.array(z.string()).min(1, "Pelo menos uma funcionalidade é obrigatória"),
  buttonText: z.string().min(1, "Texto do botão é obrigatório"),
  redirectUrl: z.string().min(1, "URL de redirecionamento é obrigatória"),
  isPopular: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planFormSchema>;

// Componente sortable para cada plano
function SortablePlan({ 
  plan, 
  onEdit, 
  onTogglePopular,
  isMobile,
  index
}: { 
  plan: Plan; 
  onEdit: (plan: Plan) => void; 
  onTogglePopular: (planId: string) => void;
  isMobile: boolean;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plan.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };



  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`bg-[#145759] shadow-lg ${plan.isPopular ? 'ring-2 ring-[#E1AC33]' : ''} min-h-[120px] flex`}
    >
      <div className="flex items-center justify-center w-full py-8">
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded"
            >
              <GripVertical className="h-5 w-5 text-[#FBF9F7]" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-[#FBF9F7] text-xl">{plan.name}</CardTitle>
              <span className="text-[#9fb8b8] text-xs font-medium bg-[#277677]/30 px-2 py-1 rounded-md">
                {index === 0 ? 'Esquerda' : 'Direita'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onTogglePopular(plan.id)}
              variant="ghost"
              className={plan.isPopular 
                ? "bg-[#E1AC33] text-[#FBF9F7] border-0 hover:bg-[#E1AC33] hover:text-[#FBF9F7]" 
                : "bg-[#bababa] text-[#F0EEEC] border-0 hover:bg-[#bababa] hover:text-[#F0EEEC]"
              }
            >
              <Star className={`h-4 w-4 ${plan.isPopular ? 'fill-[#FBF9F7]' : 'fill-[#F0EEEC]'}`} />
            </Button>
            <Button
              size="sm"
              onClick={() => onEdit(plan)}
              className="h-8 w-8 p-0 text-[#FBF9F7] !bg-[#277677] hover:!bg-[#2F8585]"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function PlansTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [featuresInput, setFeaturesInput] = useState("");
  const [priceNormalInput, setPriceNormalInput] = useState("0,00");
  const [priceWithCopayInput, setPriceWithCopayInput] = useState("0,00");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["/api/admin/plans"],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      features: [],
      buttonText: "Contratar Plano",
      redirectUrl: "/contact",
      isPopular: false,
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPlan> }) => {
      const response = await apiRequest("PUT", `/api/admin/plans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      // Notificação de sucesso removida
      setIsDialogOpen(false);
      setEditingPlan(null);
      form.reset();
      setFeaturesInput("");
    },
    onError: () => {
      toast({ title: "Erro ao atualizar plano", variant: "destructive" });
    },
  });



  const togglePopularMutation = useMutation({
    mutationFn: async (planId: string) => {
      // First, set all plans to not popular
      if (plans) {
        const updates = plans.map(async (plan) => {
          const isPopular = plan.id === planId ? !plan.isPopular : false;
          return apiRequest("PUT", `/api/admin/plans/${plan.id}`, { isPopular });
        });
        await Promise.all(updates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      // Notificação de sucesso removida
    },
    onError: () => {
      toast({ title: "Erro ao atualizar popularidade", variant: "destructive" });
    },
  });

  // Mutation para reordenar planos
  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; displayOrder: number }[]) => {
      const promises = updates.map(update => 
        apiRequest("PUT", `/api/admin/plans/${update.id}`, { displayOrder: update.displayOrder })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      // Notificação de sucesso removida
    },
    onError: () => {
      toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && plans) {
      const oldIndex = plans.findIndex(plan => plan.id === active.id);
      const newIndex = plans.findIndex(plan => plan.id === over?.id);
      
      const reorderedPlans = arrayMove(plans, oldIndex, newIndex);
      
      // Atualizar displayOrder baseado na nova ordem
      const updates = reorderedPlans.map((plan, index) => ({
        id: plan.id,
        displayOrder: index + 1,
      }));
      
      reorderMutation.mutate(updates);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      description: plan.description,
      features: plan.features,
      buttonText: plan.buttonText || "Contratar Plano",
      redirectUrl: plan.redirectUrl || "/contact",
      isPopular: plan.isPopular,
    });
    setFeaturesInput(plan.features.join('\n'));
    setPriceNormalInput((plan.priceNormal / 100).toFixed(2).replace('.', ','));
    setPriceWithCopayInput((plan.priceWithCopay / 100).toFixed(2).replace('.', ','));
    setIsDialogOpen(true);
  };



  const handleTogglePopular = (plan: Plan) => {
    togglePopularMutation.mutate(plan.id);
  };

  const parsePrice = (priceString: string): number => {
    // Remove espaços e substitui vírgula por ponto
    const cleanPrice = priceString.replace(/\s/g, '').replace(',', '.');
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? 0 : Math.round(price * 100); // Converte para centavos
  };

  const onSubmit = (data: PlanFormData) => {
    const features = featuresInput.split('\n').filter(f => f.trim()).map(f => f.trim());
    const planData = {
      ...data,
      priceNormal: parsePrice(priceNormalInput),
      priceWithCopay: parsePrice(priceWithCopayInput),
      features,
      isActive: true,
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: planData });
    }
  };

  const resetForm = () => {
    form.reset();
    setFeaturesInput("");
    setPriceNormalInput("0,00");
    setPriceWithCopayInput("0,00");
    setEditingPlan(null);
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  const sortedPlans = plans ? [...plans].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold mb-1 text-[#fbf9f7]">
          Gerenciar Planos
        </h3>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto admin-dialog-content p-0">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-[#ffffff]">
                Editar Plano {editingPlan?.name}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 admin-no-focus">
              <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-4'}`}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                                      <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Nome do Plano</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Padrão" 
                        {...field} 
                        data-testid="input-plan-name"
                        className="bg-[#195d5e] text-[#FBF9F7] placeholder:text-[#aaaaaa] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                                      <FormItem>
                    <FormLabel className="text-[#FBF9F7]">Descrição</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Proteção essencial" 
                        {...field} 
                        data-testid="input-plan-description"
                        className="bg-[#195d5e] text-[#FBF9F7] placeholder:text-[#aaaaaa] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  )}
                />
              </div>

              <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-4'}`}>
                <FormItem>
                  <FormLabel className="text-[#FBF9F7]">Preço Normal (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="0,00" 
                      value={priceNormalInput}
                      onChange={(e) => setPriceNormalInput(e.target.value)}
                      data-testid="input-plan-price-normal"
                      className="bg-[#195d5e] text-[#FBF9F7] placeholder:text-[#aaaaaa] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel className="text-[#FBF9F7]">Preço com Coparticipação (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="0,00" 
                      value={priceWithCopayInput}
                      onChange={(e) => setPriceWithCopayInput(e.target.value)}
                      data-testid="input-plan-price-copay"
                      className="bg-[#195d5e] text-[#FBF9F7] placeholder:text-[#aaaaaa] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    />
                  </FormControl>
                </FormItem>
              </div>

              <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-4'}`}>
                <FormField
                  control={form.control}
                  name="buttonText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">Texto do Botão</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Contratar Plano" 
                          {...field} 
                          data-testid="input-plan-button-text"
                          className="bg-[#195d5e] text-[#FBF9F7] placeholder:text-[#aaaaaa] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="redirectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">URL de Redirecionamento</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: /contact" 
                          {...field} 
                          data-testid="input-plan-redirect-url"
                          className="bg-[#195d5e] text-[#FBF9F7] placeholder:text-[#aaaaaa] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="text-[#FBF9F7]">Funcionalidades (uma por linha)</FormLabel>
                <Textarea
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Consultas veterinárias&#10;Vacinas anuais&#10;Emergências básicas"
                  rows={6}
                  className="mt-2 bg-[#195d5e] text-[#FBF9F7] placeholder:text-[#aaaaaa] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  data-testid="textarea-plan-features"
                />
              </div>



              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-plan"
                  className="bg-[#2C8587] text-[#F7F5F3] hover:bg-[#2C8587] hover:text-[#F7F5F3] focus:bg-[#2C8587] focus:text-[#F7F5F3] active:bg-[#2C8587] active:text-[#F7F5F3]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updatePlanMutation.isPending}
                  data-testid="button-save-plan"
                  className="text-[#ffffff]"
                >
                  Atualizar Plano
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </DialogContent>
      </Dialog>
      {plans && plans.length > 0 ? (
        <div className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-[#FBF9F7]">
              Arraste e solte para reordenar os planos
            </p>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sortedPlans.map(plan => plan.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sortedPlans.map((plan, index) => (
                  <SortablePlan
                    key={plan.id}
                    plan={plan}
                    onEdit={handleEdit}
                    onTogglePopular={(planId) => togglePopularMutation.mutate(planId)}
                    isMobile={isMobile}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <CreditCard className="h-12 w-12 text-[#145759] mx-auto mb-4" />
            <p className="text-[#FBF9F7]">Nenhum plano cadastrado ainda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}