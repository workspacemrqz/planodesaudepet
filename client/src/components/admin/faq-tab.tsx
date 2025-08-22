import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaqItem, InsertFaqItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdvancedTextarea } from "@/components/ui/advanced-textarea";
import { FormattedText } from "@/components/ui/formatted-text";
import { CharacterCounter } from "@/components/ui/character-counter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Edit, Trash2, HelpCircle, GripVertical } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import Stepper, { Step } from "@/components/ui/Stepper";
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

const faqItemFormSchema = z.object({
  question: z.string().min(1, "Pergunta é obrigatória"),
  answer: z.string().min(1, "Resposta é obrigatória"),
});

type FaqItemFormData = z.infer<typeof faqItemFormSchema>;

// Componente sortable para cada item FAQ
function SortableFaqItem({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: FaqItem; 
  onEdit: (item: FaqItem) => void; 
  onDelete: (item: FaqItem) => void; 
}) {
  const isMobile = useIsMobile();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <AccordionItem 
      ref={setNodeRef} 
      style={style}
      key={item.id} 
      value={item.id} 
      className="rounded-lg px-4 mt-[10px] mb-[10px] bg-[#145759]"
    >
      <div className={`${isMobile ? 'block' : 'flex items-center justify-between'} pr-2`}>
        <div className={`flex items-center gap-2 ${isMobile ? 'mb-3' : 'flex-1'}`}>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <AccordionTrigger className="text-left font-medium flex-1 text-[#fbf9f7]">
            {item.question}
          </AccordionTrigger>
        </div>
        
        <div className={`flex items-center gap-1 ${isMobile ? 'justify-start ml-0' : 'ml-4'}`}>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="text-[#fbf9f7]"
            style={{
              background: 'linear-gradient(to top, #1c6363, #277677)'
            }}
            data-testid={`button-edit-faq-${item.id}`}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="text-[#fbf9f7] faq-delete-button"
            style={{
              background: 'linear-gradient(to top, #c99524, #E1AC33)'
            }}
            data-testid={`button-delete-faq-${item.id}`}
          >
            <Trash2 className="h-4 w-4 mr-2 text-[#fbf9f7]" />
            Apagar
          </Button>
        </div>
      </div>
      <AccordionContent className="text-[#302e2b] pb-4">
        <div className="pl-9 text-[#9fb8b8]">
          <FormattedText 
            text={item.answer} 
            className="whitespace-pre-wrap leading-relaxed"
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function FaqTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FaqItem | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: faqItems, isLoading, error } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/faq", {
          credentials: "include",
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("FAQ API error:", response.status, errorData);
          throw new Error(`Falha ao carregar FAQ: ${response.status} ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log("FAQ data loaded successfully:", data.length, "items");
        return data;
      } catch (error) {
        console.error("FAQ fetch error:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
    onError: (error) => {
      console.error("FAQ query error:", error);
      toast({ 
        title: "Erro ao carregar FAQ", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<FaqItemFormData>({
    resolver: zodResolver(faqItemFormSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertFaqItem) => {
      try {
        // Determinar nova ordem baseado no número atual de itens
        const maxOrder = Math.max(...(faqItems?.map(i => i.displayOrder) || [0]), 0);
        const itemData = { ...data, displayOrder: maxOrder + 1, isActive: true };
        
        console.log("Creating FAQ item:", itemData);
        const response = await apiRequest("POST", "/api/admin/faq", itemData);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro ao criar FAQ: ${response.status} ${errorData.error || response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Create FAQ mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ 
        title: "Sucesso", 
        description: "Pergunta criada com sucesso!",
        variant: "default"
      });
      clearFormAndClose();
    },
    onError: (error) => {
      console.error("Create FAQ error:", error);
      toast({ 
        title: "Erro ao adicionar pergunta", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertFaqItem> }) => {
      try {
        console.log("Updating FAQ item:", id, data);
        const response = await apiRequest("PUT", `/api/admin/faq/${id}`, data);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro ao atualizar FAQ: ${response.status} ${errorData.error || response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Update FAQ mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ 
        title: "Sucesso", 
        description: "Pergunta atualizada com sucesso!",
        variant: "default"
      });
      clearFormAndClose();
    },
    onError: (error) => {
      console.error("Update FAQ error:", error);
      toast({ 
        title: "Erro ao atualizar pergunta", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Deleting FAQ item:", id);
        const response = await apiRequest("DELETE", `/api/admin/faq/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro ao deletar FAQ: ${response.status} ${errorData.error || response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Delete FAQ mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ 
        title: "Sucesso", 
        description: "Pergunta removida com sucesso!",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error("Delete FAQ error:", error);
      toast({ 
        title: "Erro ao remover pergunta", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Mutation para reordenar itens
  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; displayOrder: number }[]) => {
      try {
        console.log("Reordering FAQ items:", updates);
        const promises = updates.map(update => 
          apiRequest("PUT", `/api/admin/faq/${update.id}`, { displayOrder: update.displayOrder })
        );
        
        const responses = await Promise.all(promises);
        
        // Verificar se todas as respostas foram bem-sucedidas
        for (let i = 0; i < responses.length; i++) {
          if (!responses[i].ok) {
            const errorData = await responses[i].json().catch(() => ({}));
            throw new Error(`Erro ao reordenar item ${updates[i].id}: ${responses[i].status} ${errorData.error || responses[i].statusText}`);
          }
        }
      } catch (error) {
        console.error("Reorder FAQ mutation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ 
        title: "Sucesso", 
        description: "Ordem das perguntas atualizada!",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error("Reorder FAQ error:", error);
      toast({ 
        title: "Erro ao atualizar ordem", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && faqItems) {
      const oldIndex = faqItems.findIndex(item => item.id === active.id);
      const newIndex = faqItems.findIndex(item => item.id === over?.id);
      
      const reorderedItems = arrayMove(faqItems, oldIndex, newIndex);
      
      // Atualizar displayOrder baseado na nova ordem
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        displayOrder: index + 1,
      }));
      
      reorderMutation.mutate(updates);
    }
  };

  const handleEdit = (item: FaqItem) => {
    setEditingItem(item);
    form.reset({
      question: item.question,
      answer: item.answer,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: FaqItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
          toast({
            title: "Sucesso",
            description: "Pergunta removida com sucesso.",
          });
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Erro ao remover pergunta. Tente novamente.",
            variant: "destructive",
          });
        }
      });
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const openNewQuestionDialog = () => {
    setEditingItem(null);
    // Limpar formulário antes de abrir
    form.reset({
      question: "",
      answer: "",
    });
    setIsDialogOpen(true);
  };

  const clearFormAndClose = () => {
    setEditingItem(null);
    setIsDialogOpen(false);
    // Forçar reset do formulário
    setTimeout(() => {
      form.reset({
        question: "",
        answer: "",
      });
    }, 0);
  };

  // Garantir que o formulário esteja limpo quando necessário
  useEffect(() => {
    if (isDialogOpen && !editingItem) {
      // Garantir que o formulário esteja limpo para nova pergunta
      form.reset({
        question: "",
        answer: "",
      });
    }
  }, [isDialogOpen, editingItem]);

  // Garantir que o formulário esteja limpo quando o componente for montado
  useEffect(() => {
    form.reset({
      question: "",
      answer: "",
    });
  }, []);

  const onSubmit = (data: FaqItemFormData) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      const maxOrder = Math.max(...(faqItems?.map(i => i.displayOrder) || [0]), 0);
      createItemMutation.mutate({ ...data, displayOrder: maxOrder + 1, isActive: true });
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Erro ao carregar FAQ: {error.message}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  const sortedItems = faqItems ? [...faqItems].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) : [];

  return (
    <div>
      <div className={`${isMobile ? 'block space-y-4' : 'flex items-center justify-between'} mb-6`}>
        <div>
          <p className="text-sm text-[#fbf9f7]">
            Arraste e solte para reordenar as perguntas
          </p>
        </div>
        
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              clearFormAndClose();
            } else {
              setIsDialogOpen(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button 
              onClick={openNewQuestionDialog}
              className="text-[#fbf9f7] bg-[#E1AC33] w-full sm:w-auto"
              data-testid="button-add-faq"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto mx-auto rounded-lg md:rounded-xl">
            <DialogHeader className="px-2 md:px-0">
              <DialogTitle className="text-[#ffffff] text-lg md:text-xl text-center md:text-left">
                {editingItem ? "Editar Pergunta" : "Nova Pergunta"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-2 md:mt-4 px-2 md:px-0">
                             <Stepper
                 initialStep={1}
                 onStepChange={(step) => {
                   console.log(`FAQ dialog: Step changed to ${step}`);
                 }}
                 onFinalStepCompleted={() => {
                   console.log("FAQ dialog: Todos os steps completados!");
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
                     <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Pergunta</h3>
                     
                     <div>
                       <FormField
                         control={form.control}
                         name="question"
                         render={({ field }) => (
                           <FormItem>
                             <FormControl>
                               <AdvancedTextarea
                                 {...field}
                                 placeholder="Digite a pergunta..."
                                 className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                                 previewClassName="bg-[#195d5e] text-[#FBF9F7] border-[#277677] w-full"
                                 rows={3}
                                 maxLength={500}
                               />
                               <CharacterCounter 
                                 text={field.value || ''} 
                                 maxLength={500}
                                 className="mt-2 text-[#FBF9F7]/70"
                                 showDetails={true}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                     </div>
                   </div>
                 </Step>
                
                                 <Step>
                   <div className="space-y-3 md:space-y-4">
                     <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Resposta</h3>
                     
                     <div>
                       <FormField
                         control={form.control}
                         name="answer"
                         render={({ field }) => (
                           <FormItem>
                             <FormControl>
                               <AdvancedTextarea
                                 {...field}
                                 placeholder="Digite a resposta..."
                                 className="bg-[#195d5e] text-[#FBF9F7] border-[#277677] focus:ring-[#277677] w-full placeholder:text-[#FBF9F7]/60"
                                 previewClassName="bg-[#FBF9F7] text-[#FBF9F7] border-[#277677] w-full"
                                 rows={8}
                                 maxLength={2000}
                               />
                               <CharacterCounter 
                                 text={field.value || ''} 
                                 maxLength={2000}
                                 className="mt-2 text-[#FBF9F7]/70"
                                 showDetails={true}
                               />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                     </div>
                   </div>
                 </Step>
                 
                 <Step>
                   <div className="space-y-3 md:space-y-4">
                     <h3 className="text-base md:text-lg font-semibold text-[#FBF9F7] mb-3 md:mb-4 text-center md:text-left">Revisão e Confirmação</h3>
                     
                     <div className="bg-[#145759] p-3 md:p-4 rounded-lg border border-[#277677]/20">
                       <h4 className="font-medium text-[#FBF9F7] mb-2 md:mb-3 text-left">Resumo da Pergunta:</h4>
                       
                       <div className="text-sm leading-tight space-y-3">
                         <div className="text-[#FBF9F7] font-medium text-left">
                           <span className="text-[#277677] mr-2">•</span>
                           <span className="block mb-2">Pergunta:</span>
                           <div className="bg-[#277677]/20 p-3 rounded border-l-4 border-[#277677] ml-4">
                             <FormattedText 
                               text={form.watch("question") || ''} 
                               className="text-[#FBF9F7]"
                               emptyText="Nenhuma pergunta inserida"
                             />
                           </div>
                         </div>
                         <div className="text-[#FBF9F7] font-medium text-left">
                           <span className="text-[#277677] mr-2">•</span>
                           <span className="block mb-2">Resposta:</span>
                           <div className="bg-[#277677]/20 p-3 rounded border-l-4 border-[#277677] ml-4">
                             <FormattedText 
                               text={form.watch("answer") || ''} 
                               className="text-[#FBF9F7]"
                               emptyText="Nenhuma resposta inserida"
                             />
                           </div>
                         </div>
                       </div>
                       
                       <div className="mt-3 md:mt-4">
                         <h5 className="font-medium text-[#FBF9F7] mb-2 text-left">Detalhes:</h5>
                         <ul className="text-sm text-[#FBF9F7]/80 space-y-1">
                           <li className="flex items-center">
                             <span className="text-[#277677] mr-2">•</span>
                             {editingItem ? "Editando pergunta existente" : "Nova pergunta será criada"}
                           </li>
                           <li className="flex items-center">
                             <span className="text-[#277677] mr-2">•</span>
                             Ordem de exibição será ajustada automaticamente
                           </li>
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
      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-[#FBF9F7]">Carregando perguntas...</div>
          </CardContent>
        </Card>
      ) : faqItems && faqItems.length > 0 ? (
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={sortedItems.map(item => item.id)} 
              strategy={verticalListSortingStrategy}
            >
              <Accordion type="single" collapsible className="w-full">
                {sortedItems.map((item) => (
                  <SortableFaqItem
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-12 w-12 text-[#145759] mx-auto mb-4" />
            <p className="text-[#FBF9F7]">Nenhuma pergunta cadastrada ainda.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja remover a pergunta "${itemToDelete?.question}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={deleteItemMutation.isPending}
        icon={<Trash2 className="h-6 w-6" />}
      />
    </div>
  );
}