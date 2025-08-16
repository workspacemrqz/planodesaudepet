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
import { Edit, CreditCard, Star, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const planFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  features: z.array(z.string()).min(1, "Pelo menos uma funcionalidade é obrigatória"),
  buttonText: z.string().min(1, "Texto do botão é obrigatório"),
  redirectUrl: z.string().min(1, "URL de redirecionamento é obrigatória"),
  isPopular: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planFormSchema>;

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
                      <FormLabel>Nome do Plano</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Padrão" {...field} data-testid="input-plan-name" />
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
                        <Input placeholder="Ex: Proteção essencial" {...field} data-testid="input-plan-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-4'}`}>
                <FormItem>
                  <FormLabel>Preço Normal (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="0,00" 
                      value={priceNormalInput}
                      onChange={(e) => setPriceNormalInput(e.target.value)}
                      data-testid="input-plan-price-normal"
                      className=""
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Preço com Coparticipação (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="0,00" 
                      value={priceWithCopayInput}
                      onChange={(e) => setPriceWithCopayInput(e.target.value)}
                      data-testid="input-plan-price-copay"
                      className=""
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
                      <FormLabel>Texto do Botão</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Contratar Plano" {...field} data-testid="input-plan-button-text" />
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
                      <FormLabel>URL de Redirecionamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: /contact" {...field} data-testid="input-plan-redirect-url" />
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
                  className="mt-2"
                  data-testid="textarea-plan-features"
                />
              </div>



              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-plan"
                  className="bg-[#2C8587] text-[#F7F5F3] border-[#2C8587] hover:bg-[#2C8587] hover:text-[#F7F5F3] focus:bg-[#2C8587] focus:text-[#F7F5F3] active:bg-[#2C8587] active:text-[#F7F5F3]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updatePlanMutation.isPending}
                  data-testid="button-save-plan"
                  className="text-[#FBF9F7]"
                >
                  Atualizar Plano
                </Button>
              </div>
            </form>
          </Form>
          </div>
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
                  onClick={() => handleEdit(plan)}
                  className="h-8 w-8 p-0 text-[#FBF9F7] !bg-[#2F8585] hover:!bg-[#2F8585] focus:!bg-[#2F8585] active:!bg-[#2F8585]"
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
                      ? 'bg-[#E1AC33] text-[#FBF9F7] hover:bg-[#E1AC33] focus:bg-[#E1AC33] active:bg-[#E1AC33] hover:text-[#FBF9F7] focus:text-[#FBF9F7] active:text-[#FBF9F7]' 
                      : 'bg-[#4B5563] text-[#FBF9F7] hover:bg-[#4B5563] focus:bg-[#4B5563] active:bg-[#4B5563] hover:text-[#FBF9F7] focus:text-[#FBF9F7] active:text-[#FBF9F7]'
                  }`}
                  data-testid={`button-popular-plan-${plan.id}`}
                  title={plan.isPopular ? "Remover como mais popular" : "Marcar como mais popular"}
                >
                  <Star className={`h-4 w-4 ${plan.isPopular ? 'fill-current' : ''}`} />
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