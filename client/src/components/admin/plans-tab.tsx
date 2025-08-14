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
import { Edit, CreditCard, Star, Check, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const planFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  priceNormal: z.number().min(0, "Preço deve ser maior que 0"),
  priceWithCopay: z.number().min(0, "Preço com coparticipação deve ser maior que 0"),
  description: z.string().min(1, "Descrição é obrigatória"),
  features: z.array(z.string()).min(1, "Pelo menos uma funcionalidade é obrigatória"),
  isPopular: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planFormSchema>;

export default function PlansTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [featuresInput, setFeaturesInput] = useState("");
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["/api/admin/plans"],
  });

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      priceNormal: 0,
      priceWithCopay: 0,
      description: "",
      features: [],
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
      toast({ title: "Plano atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingPlan(null);
      form.reset();
      setFeaturesInput("");
    },
    onError: () => {
      toast({ title: "Erro ao atualizar plano", variant: "destructive" });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/plans/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      toast({ title: "Plano removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover plano", variant: "destructive" });
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
      toast({ title: "Status de popularidade atualizado!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar popularidade", variant: "destructive" });
    },
  });

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      priceNormal: plan.priceNormal,
      priceWithCopay: plan.priceWithCopay,
      description: plan.description,
      features: plan.features,
      isPopular: plan.isPopular,
    });
    setFeaturesInput(plan.features.join('\n'));
    setIsDialogOpen(true);
  };

  const handleDelete = (plan: Plan) => {
    if (confirm(`Tem certeza que deseja remover o plano "${plan.name}"?`)) {
      deletePlanMutation.mutate(plan.id);
    }
  };

  const handleTogglePopular = (plan: Plan) => {
    togglePopularMutation.mutate(plan.id);
  };

  const onSubmit = (data: PlanFormData) => {
    const features = featuresInput.split('\n').filter(f => f.trim()).map(f => f.trim());
    const planData = {
      ...data,
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#ffffff]">
              Editar Plano {editingPlan?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 admin-no-focus">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Plano</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Básico" {...field} data-testid="input-plan-name" className="focus:ring-0 !focus:ring-0 focus:ring-offset-0 !focus:ring-offset-0 focus:border-gray-300 !focus:border-gray-300 focus:outline-none !focus:outline-none" />
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
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Proteção essencial" {...field} data-testid="input-plan-description" className="focus:ring-0 !focus:ring-0 focus:ring-offset-0 !focus:ring-offset-0 focus:border-gray-300 !focus:border-gray-300 focus:outline-none !focus:outline-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceNormal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Normal (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-plan-price-normal"
                          className="focus:ring-0 !focus:ring-0 focus:ring-offset-0 !focus:ring-offset-0 focus:border-gray-300 !focus:border-gray-300 focus:outline-none !focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priceWithCopay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço com Coparticipação (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-plan-price-copay"
                          className="focus:ring-0 focus:ring-offset-0 focus:border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Funcionalidades (uma por linha)</FormLabel>
                <Textarea
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Consultas veterinárias&#10;Vacinas anuais&#10;Emergências básicas"
                  rows={6}
                  className="mt-2 focus:ring-0 !focus:ring-0 focus:ring-offset-0 !focus:ring-offset-0 focus:border-gray-300 !focus:border-gray-300 focus:outline-none !focus:outline-none"
                  data-testid="textarea-plan-features"
                />
              </div>



              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-plan"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updatePlanMutation.isPending}
                  data-testid="button-save-plan"
                >
                  Atualizar Plano
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        {plans?.map((plan) => (
          <div key={plan.id} className="border rounded-lg px-4 mt-[10px] mb-[10px] bg-[#145759]">
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <h3 className="text-[#FBF9F7] font-medium">{plan.name}</h3>
                {plan.isPopular && (
                  <Badge className="bg-[#E1AC33] text-[#FBF9F7] text-xs mt-1">
                    Mais Popular
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(plan)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground rounded-md h-8 w-8 p-0 text-[#FBF9F7] bg-[#2f8585]"
                  data-testid={`button-edit-plan-${plan.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleTogglePopular(plan)}
                  className={`h-8 w-8 p-0 ${
                    plan.isPopular 
                      ? 'bg-[#E1AC33] text-[#FBF9F7]' 
                      : 'bg-[#4B5563] text-[#FBF9F7]'
                  }`}
                  data-testid={`button-popular-plan-${plan.id}`}
                  title={plan.isPopular ? "Remover como mais popular" : "Marcar como mais popular"}
                >
                  <Star className={`h-4 w-4 ${plan.isPopular ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(plan)}
                  className="h-8 w-8 p-0 bg-[#FBF9F7] text-[#2F8585]"
                  data-testid={`button-delete-plan-${plan.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {(!plans || plans.length === 0) && (
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