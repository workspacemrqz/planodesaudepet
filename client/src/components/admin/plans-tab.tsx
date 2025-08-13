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
import { Edit, CreditCard, Star } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#FBF9F7]">Gerenciar Planos</h3>
          <p className="text-sm text-[#FBF9F7]">
            Edite os 3 planos de seguro disponíveis no site
          </p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#277677]">
              Editar Plano {editingPlan?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Plano</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Básico" {...field} data-testid="input-plan-name" />
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
                  className="mt-2"
                  data-testid="textarea-plan-features"
                />
              </div>

              <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-plan-popular"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Marcar como plano mais popular
                    </FormLabel>
                  </FormItem>
                )}
              />

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-[#E1AC33]' : ''}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#E1AC33] text-[#277677] px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-[#277677] text-xl">{plan.name}</CardTitle>
              <div className="text-2xl font-bold text-[#277677]">
                <div>R${plan.priceNormal}/mês</div>
                <div className="text-sm text-[#FBF9F7]">
                  R${plan.priceWithCopay}/mês (com coparticipação)
                </div>
              </div>
              <p className="text-sm text-[#302e2b]/70">{plan.description}</p>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#277677] mt-2 flex-shrink-0"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(plan)}
                  className="w-full"
                  data-testid={`button-edit-plan-${plan.id}`}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar Plano
                </Button>
              </div>
            </CardContent>
          </Card>
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