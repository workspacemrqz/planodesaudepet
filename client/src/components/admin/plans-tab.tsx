import React, { useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plan, InsertPlan } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Stepper, { Step } from "@/components/ui/Stepper";

// Dados estáticos dos planos para teste
const STATIC_PLANS = [
  {
    id: 'basic',
    name: 'BASIC',
    price: 4900, // R$ 49,00 em centavos
    description: 'Plano essencial para cuidados básicos',
    features: ['Consultas veterinárias', 'Vacinas básicas', 'Emergências simples'],
    buttonText: 'Contratar Plano',
    redirectUrl: '/contact',
    planType: 'with_waiting_period'
  },
  {
    id: 'infinity',
    name: 'INFINITY', 
    price: 7900, // R$ 79,00 em centavos
    description: 'Plano completo sem limitações',
    features: ['Consultas ilimitadas', 'Todas as vacinas', 'Cirurgias inclusas', 'Emergências 24h'],
    buttonText: 'Contratar Plano',
    redirectUrl: '/contact',
    planType: 'with_waiting_period'
  },
  {
    id: 'comfort',
    name: 'COMFORT',
    price: 9900, // R$ 99,00 em centavos
    description: 'Plano premium com conforto total',
    features: ['Atendimento domiciliar', 'Spa pet', 'Nutrição especializada', 'Monitoramento 24h'],
    buttonText: 'Contratar Plano',
    redirectUrl: '/contact',
    planType: 'without_waiting_period'
  },
  {
    id: 'platinum',
    name: 'PLATINUM',
    price: 14900, // R$ 149,00 em centavos
    description: 'Plano exclusivo VIP',
    features: ['Tudo do Comfort', 'Veterinário exclusivo', 'Transporte premium', 'Concierge pet'],
    buttonText: 'Contratar Plano',
    redirectUrl: '/contact',
    planType: 'without_waiting_period'
  }
];

const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2).replace('.', ',');
};

export default function PlansTab() {
  console.log("🔍 PlansTab: Renderizando com integração API");
  
  const { toast } = useToast();
  
  // Estado para o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    features: '',
    buttonText: '',
    redirectUrl: ''
  });
  
  // Tentar carregar dados da API, mas usar fallback estático se falhar
  const { data: apiPlans, isLoading, error } = useQuery<Plan[]>({
    queryKey: ["/api/admin/plans"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/plans", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Falha ao carregar planos: ${response.status}`);
        }
        const data = await response.json();
        console.log("🔍 PlansTab: Dados da API carregados:", data);
        return data;
      } catch (error) {
        console.log("🔍 PlansTab: Erro na API, usando dados estáticos:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Usar dados da API se disponíveis, senão usar dados estáticos
  const plans = apiPlans && apiPlans.length > 0 ? apiPlans : STATIC_PLANS;
  
  // Mutation para criar plano
  const createPlanMutation = useMutation({
    mutationFn: async (data: InsertPlan) => {
      const response = await apiRequest("POST", "/api/admin/plans", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      handleCloseModal();
      toast({ title: "Plano criado com sucesso!", variant: "default" });
    },
    onError: (error) => {
      console.error("Erro ao criar plano:", error);
      toast({ title: "Erro ao criar plano", variant: "destructive" });
    },
  });

  // Mutation para atualizar plano
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPlan> }) => {
      const response = await apiRequest("PUT", `/api/admin/plans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      handleCloseModal();
      toast({ title: "Plano atualizado com sucesso!", variant: "default" });
    },
    onError: (error) => {
      console.error("Erro ao atualizar plano:", error);
      toast({ title: "Erro ao atualizar plano", variant: "destructive" });
    },
  });
  
  // Função para abrir modal de edição
  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      price: (plan.price / 100).toFixed(2).replace('.', ','),
      features: plan.features.join('\n'),
      buttonText: plan.buttonText || 'Contratar Plano',
      redirectUrl: plan.redirectUrl || '/contact'
    });
    setIsEditModalOpen(true);
  };
  
  // Função para fechar modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingPlan(null);
    setEditForm({
      name: '',
      price: '',
      features: '',
      buttonText: '',
      redirectUrl: ''
    });
  };
  
  // Função para converter preço para centavos
  const parsePrice = (priceString: string): number => {
    const cleanPrice = priceString.replace(/\s/g, '').replace(',', '.');
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? 0 : Math.round(price * 100);
  };

  // Função para salvar alterações
  const handleSavePlan = () => {
    if (!editingPlan) return;
    
    const features = editForm.features.split('\n').filter(f => f.trim()).map(f => f.trim());
    const planData: Partial<InsertPlan> = {
      name: editForm.name,
      price: parsePrice(editForm.price),
      features,
      buttonText: editForm.buttonText,
      redirectUrl: editForm.redirectUrl,
      isActive: true,
    };

    console.log("🔍 PlansTab: Salvando plano:", { id: editingPlan.id, data: planData });

    if (editingPlan.id.startsWith('default-')) {
      // Criar novo plano
      createPlanMutation.mutate(planData as InsertPlan);
    } else {
      // Atualizar plano existente
      updatePlanMutation.mutate({ id: editingPlan.id, data: planData });
    }
  };
  
      return (
      <div>
            {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-[#145759] shadow-lg border border-[#277677]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Nome do Plano */}
                <h3 className="text-lg font-semibold text-[#FBF9F7]">
                  {plan.name}
                </h3>
                
                {/* Botão de Editar */}
                <Button
                  onClick={() => handleEditPlan(plan)}
                  size="sm"
                  className="text-[#FBF9F7]"
                  style={{
                    background: 'linear-gradient(to top, #1c6363, #277677)'
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
                 ))}
       </div>
       
       {/* Modal de Edição */}
       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto mx-auto rounded-lg md:rounded-xl">
           <DialogHeader className="px-2 md:px-0">
             <DialogTitle className="text-[#ffffff] text-lg md:text-xl text-center md:text-left">
               Editar Plano: {editingPlan?.name}
             </DialogTitle>
           </DialogHeader>
           
           <div className="mt-2 md:mt-4 px-2 md:px-0">
             <Stepper
               initialStep={1}
               onStepChange={(step) => {
                 console.log(`Plans dialog: Step changed to ${step}`);
               }}
               onFinalStepCompleted={() => {
                 console.log("Plans dialog: Todos os steps completados!");
                 handleSavePlan();
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
                   
                   {/* Nome do Plano */}
                   <div>
                     <label className="block text-sm font-medium text-[#FBF9F7] mb-2">
                       Nome do Plano
                     </label>
                     <Input
                       value={editForm.name}
                       onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                       className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                       placeholder="Nome do plano"
                     />
                   </div>
                   
                   {/* Preço */}
                   <div>
                     <label className="block text-sm font-medium text-[#FBF9F7] mb-2">
                       Preço (R$)
                     </label>
                     <Input
                       value={editForm.price}
                       onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                       className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                       placeholder="0,00"
                     />
                   </div>
                 </div>
               </Step>
               
               <Step>
                 <div className="space-y-3 md:space-y-4">
                   <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Configurações do Botão</h3>
                   
                   {/* Link do Botão */}
                   <div>
                     <label className="block text-sm font-medium text-[#FBF9F7] mb-2">
                       Link do Botão "Contratar Plano"
                     </label>
                     <Input
                       value={editForm.redirectUrl}
                       onChange={(e) => setEditForm({...editForm, redirectUrl: e.target.value})}
                       className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                       placeholder="https://exemplo.com/contratar ou /contact"
                     />
                     <p className="text-xs text-[#FBF9F7]/70 mt-1">
                       URL para onde o usuário será redirecionado ao clicar no botão
                     </p>
                   </div>
                   
                   {/* Texto do Botão */}
                   <div>
                     <label className="block text-sm font-medium text-[#FBF9F7] mb-2">
                       Texto do Botão
                     </label>
                     <Input
                       value={editForm.buttonText}
                       onChange={(e) => setEditForm({...editForm, buttonText: e.target.value})}
                       className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                       placeholder="Contratar Plano"
                     />
                   </div>
                 </div>
               </Step>
               
               <Step>
                 <div className="space-y-3 md:space-y-4">
                   <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Funcionalidades do Plano</h3>
                   
                   {/* Funcionalidades */}
                   <div>
                     <label className="block text-sm font-medium text-[#FBF9F7] mb-2">
                       Funcionalidades (uma por linha)
                     </label>
                     <Textarea
                       value={editForm.features}
                       onChange={(e) => setEditForm({...editForm, features: e.target.value})}
                       rows={8}
                       className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] resize-none w-full placeholder:text-[#FBF9F7]/60"
                       placeholder="Consultas veterinárias&#10;Vacinas anuais&#10;Emergências básicas&#10;Atendimento 24h&#10;Exames laboratoriais"
                     />
                     <p className="text-xs text-[#FBF9F7]/70 mt-1">
                       Digite cada funcionalidade em uma linha separada
                     </p>
                   </div>
                 </div>
               </Step>
               
               <Step>
                 <div className="space-y-3 md:space-y-4">
                   <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Revisão e Confirmação</h3>
                   
                   <div className="bg-[#145759] p-3 md:p-4 rounded-lg border border-[#277677]/20">
                     <h4 className="font-medium text-[#FBF9F7] mb-2 md:mb-3 text-left">Resumo do Plano:</h4>
                     
                     <div className="text-sm leading-tight">
                       <div className="text-[#FBF9F7] font-medium mb-1 text-left">{editForm.name}</div>
                       <div className="text-[#FBF9F7] font-medium mb-1 text-left">R$ {editForm.price}</div>
                       <div className="text-[#FBF9F7] font-medium mb-1 text-left">{editForm.redirectUrl}</div>
                       <div className="text-[#FBF9F7] font-medium mb-1 text-left">{editForm.buttonText}</div>
                     </div>
                     
                     <div className="mt-3 md:mt-4">
                       <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Funcionalidades:</h5>
                       <ul className="text-sm text-[#FBF9F7]/80 space-y-1">
                         {editForm.features.split('\n').filter(f => f.trim()).map((feature, index) => (
                           <li key={index} className="flex items-center">
                             <span className="text-[#277677] mr-2">•</span>
                             {feature.trim()}
                           </li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 </div>
               </Step>
             </Stepper>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 }
