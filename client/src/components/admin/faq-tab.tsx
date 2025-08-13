import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaqItem, InsertFaqItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Edit, Trash2, HelpCircle, ArrowUp, ArrowDown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const faqItemFormSchema = z.object({
  question: z.string().min(1, "Pergunta é obrigatória"),
  answer: z.string().min(1, "Resposta é obrigatória"),
  displayOrder: z.number().min(1, "Ordem deve ser maior que 0"),
});

type FaqItemFormData = z.infer<typeof faqItemFormSchema>;

export default function FaqTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const { toast } = useToast();

  const { data: faqItems, isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
  });

  const form = useForm<FaqItemFormData>({
    resolver: zodResolver(faqItemFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      displayOrder: 1,
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertFaqItem) => {
      const response = await apiRequest("POST", "/api/admin/faq", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ title: "Pergunta adicionada com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao adicionar pergunta", variant: "destructive" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertFaqItem> }) => {
      const response = await apiRequest("PUT", `/api/admin/faq/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ title: "Pergunta atualizada com sucesso!" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar pergunta", variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/faq/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ title: "Pergunta removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover pergunta", variant: "destructive" });
    },
  });

  const handleEdit = (item: FaqItem) => {
    setEditingItem(item);
    form.reset({
      question: item.question,
      answer: item.answer,
      displayOrder: item.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: FaqItem) => {
    if (confirm(`Tem certeza que deseja remover esta pergunta?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleMoveUp = (item: FaqItem) => {
    const newOrder = Math.max(1, item.displayOrder - 1);
    updateItemMutation.mutate({ 
      id: item.id, 
      data: { displayOrder: newOrder } 
    });
  };

  const handleMoveDown = (item: FaqItem) => {
    const maxOrder = Math.max(...(faqItems?.map(i => i.displayOrder) || [1]));
    const newOrder = Math.min(maxOrder + 1, item.displayOrder + 1);
    updateItemMutation.mutate({ 
      id: item.id, 
      data: { displayOrder: newOrder } 
    });
  };

  const onSubmit = (data: FaqItemFormData) => {
    const itemData: InsertFaqItem = {
      ...data,
      isActive: true,
    };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: itemData });
    } else {
      createItemMutation.mutate(itemData);
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingItem(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#FBF9F7]">Gerenciar FAQ</h3>
          <p className="text-sm text-[#FBF9F7]/70">
            Adicione, edite ou remova perguntas frequentes
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="hover:bg-[#277677]/90 bg-[#145759] text-[#fbf9f7]" data-testid="button-add-faq">
              <Plus className="h-4 w-4 mr-2" />
              Nova Pergunta
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#277677]">
                {editingItem ? "Editar Pergunta" : "Nova Pergunta"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pergunta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: O que é um seguro para pets?" {...field} data-testid="input-faq-question" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resposta</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explique detalhadamente a resposta..." 
                          rows={6}
                          {...field} 
                          data-testid="textarea-faq-answer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordem de Exibição</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-faq-order"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-[#e0e0e0]">Números menores aparecem primeiro</p>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel-faq"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createItemMutation.isPending || updateItemMutation.isPending}
                    data-testid="button-save-faq"
                  >
                    {editingItem ? "Atualizar" : "Criar"} Pergunta
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {faqItems && faqItems.length > 0 ? (
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4 bg-white">
                <div className="flex items-center justify-between pr-2">
                  <AccordionTrigger className="text-left text-[#277677] font-medium hover:no-underline flex-1">
                    <span className="flex items-center gap-3">
                      <span className="bg-[#E1AC33] text-[#277677] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {item.displayOrder}
                      </span>
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(item);
                      }}
                      className="h-8 w-8 p-0"
                      data-testid={`button-move-up-${item.id}`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(item);
                      }}
                      className="h-8 w-8 p-0"
                      data-testid={`button-move-down-${item.id}`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="h-8 w-8 p-0"
                      data-testid={`button-edit-faq-${item.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`button-delete-faq-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <AccordionContent className="text-[#302e2b] pb-4">
                  <div className="pl-9">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-12 w-12 text-[#145759] mx-auto mb-4" />
            <p className="text-[#FBF9F7]">Nenhuma pergunta cadastrada ainda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}