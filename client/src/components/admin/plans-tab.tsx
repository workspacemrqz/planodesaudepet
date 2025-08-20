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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, CreditCard, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const planFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  features: z.array(z.string()).min(1, "Pelo menos uma funcionalidade é obrigatória"),
  buttonText: z.string().min(1, "Texto do botão é obrigatório"),
  redirectUrl: z.string().min(1, "URL de redirecionamento é obrigatória"),
  planType: z.enum(["with_waiting_period", "without_waiting_period"]).default("with_waiting_period"),
});

type PlanFormData = z.infer<typeof planFormSchema>;

const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2).replace('.', ',');
};

export default function PlansTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [featuresInput, setFeaturesInput] = useState("");
  const [priceInput, setPriceInput] = useState("0,00");
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
      planType: "with_waiting_period",
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPlan> }) => {
      const response = await apiRequest("PUT", `/api/admin/plans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setIsDialogOpen(false);
      setEditingPlan(null);
      form.reset();
      setFeaturesInput("");
      toast({ title: "Plano atualizado com sucesso!", variant: "default" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar plano", variant: "destructive" });
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
      planType: plan.planType || "with_waiting_period",
    });
    setFeaturesInput(plan.features.join('\n'));
    setPriceInput((plan.price / 100).toFixed(2).replace('.', ','));
    setIsDialogOpen(true);
  };

  const parsePrice = (priceString: string): number => {
    const cleanPrice = priceString.replace(/\s/g, '').replace(',', '.');
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? 0 : Math.round(price * 100);
  };

  const onSubmit = (data: PlanFormData) => {
    const features = featuresInput.split('\n').filter(f => f.trim()).map(f => f.trim());
    const planData = {
      ...data,
      price: parsePrice(priceInput),
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
    setPriceInput("0,00");
    setEditingPlan(null);
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
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

      {/* Dialog de Edição */}
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
                            placeholder="Ex: BASIC" 
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
                            placeholder="Ex: Plano essencial" 
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
                    <FormLabel className="text-[#FBF9F7]">Preço (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="0,00" 
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        data-testid="input-plan-price"
                        className="bg-[#195d5e] text-[#FBF9F7] placeholder:text-[#aaaaaa] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                      />
                    </FormControl>
                  </FormItem>
                  
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#FBF9F7]">Tipo de Plano</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="w-full p-2 bg-[#195d5e] text-[#FBF9F7] border border-[#277677] rounded-md focus:ring-0 focus:ring-offset-0 focus:outline-none"
                            data-testid="select-plan-type"
                          >
                            <option value="with_waiting_period">Com carência e sem coparticipação</option>
                            <option value="without_waiting_period">Sem carência e com coparticipação</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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

      {/* Listagem dos Planos */}
      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedPlans.map((plan) => (
            <Card key={plan.id} className="bg-[#145759] shadow-lg">
              <CardHeader className="text-center pb-4">
                {/* Ícone do Plano */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#277677]/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="#277677">
                      <path d="M88.13,17.28c-6.14-5.5-14.37-6-22.06-1.32-2.58,2-5.43,2-9,.15l-.94-.39C35,7.41,22.07,19.63,9.54,31.44L8.93,32h0A4.1,4.1,0,0,0,7.4,35c-.32,3,1.48,7.2,4.71,11C5.7,64.47,0,84.79,12.52,93a.5.5,0,0,0,.27.08H91a.49.49,0,0,0,.4-.2.5.5,0,0,0,.08-.43L85,68.46A5.68,5.68,0,0,0,86,69a2.13,2.13,0,0,0,.81.16,2.19,2.19,0,0,0,1.37-.49,2.16,2.16,0,0,0,.76-2.09C86.8,54.91,84.48,49,81.11,46.66a13.42,13.42,0,0,0,7.4-5.32l3.13,3a.51.51,0,0,0,.44.13.47.47,0,0,0,.36-.28C97.69,33,94.06,22.58,88.13,17.28Z"/>
                    </svg>
                  </div>
                </div>

                {/* Nome do Plano */}
                <CardTitle className="text-2xl font-bold text-[#FBF9F7] mb-2">
                  {plan.name}
                </CardTitle>

                {/* Preço */}
                <div className="mb-3">
                  <span className="text-3xl font-bold text-[#E1AC33]">R${formatPrice(plan.price)}</span>
                  <span className="text-sm font-medium text-[#FBF9F7]">/mês</span>
                </div>

                {/* Tipo do Plano */}
                <Badge 
                  variant="secondary" 
                  className="bg-[#277677]/30 text-[#FBF9F7] text-xs"
                >
                  {plan.planType === 'with_waiting_period' ? 'Com carência e sem coparticipação' : 'Sem carência e com coparticipação'}
                </Badge>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                {/* Descrição */}
                <p className="text-[#FBF9F7] text-center mb-4 opacity-90">
                  {plan.description}
                </p>

                {/* Funcionalidades */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#E1AC33]" />
                      <span className="text-sm text-[#FBF9F7] leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Texto do Botão */}
                <div className="mb-4">
                  <div className="text-center p-3 bg-[#277677]/20 rounded-lg">
                    <span className="text-sm font-medium text-[#FBF9F7]">Texto do Botão:</span>
                    <br />
                    <span className="text-[#E1AC33]">{plan.buttonText}</span>
                  </div>
                </div>

                {/* URL de Redirecionamento */}
                <div className="mb-6">
                  <div className="text-center p-3 bg-[#277677]/20 rounded-lg">
                    <span className="text-sm font-medium text-[#FBF9F7]">Redireciona para:</span>
                    <br />
                    <span className="text-[#E1AC33]">{plan.redirectUrl}</span>
                  </div>
                </div>

                {/* Botão de Editar */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => handleEdit(plan)}
                    className="bg-[#277677] hover:bg-[#2F8585] text-[#FBF9F7] px-6"
                    data-testid={`button-edit-plan-${plan.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Plano
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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