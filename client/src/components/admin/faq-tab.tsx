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
import { Plus, Edit, Trash2, HelpCircle, GripVertical } from "lucide-react";
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
      className="border rounded-lg px-4 mt-[10px] mb-[10px] bg-[#145759]"
    >
      <div className="flex items-center justify-between pr-2">
        <div className="flex items-center gap-2 flex-1">
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
        
        <div className="flex items-center gap-1 ml-4">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="h-8 w-8 p-0 text-[#FBF9F7] !bg-[#2F8585] hover:!bg-[#2F8585] focus:!bg-[#2F8585] active:!bg-[#2F8585]"
            data-testid={`button-edit-faq-${item.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="h-8 w-8 p-0 bg-[#FBF9F7] text-[#2F8585] hover:bg-[#FBF9F7] focus:bg-[#FBF9F7] active:bg-[#FBF9F7] hover:text-[#2F8585] focus:text-[#2F8585] active:text-[#2F8585]"
            data-testid={`button-delete-faq-${item.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AccordionContent className="text-[#302e2b] pb-4">
        <div className="pl-9 text-[#ebebeb]">
          {item.answer}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function FaqTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: faqItems = [], isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
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
      // Determinar nova ordem baseado no número atual de itens
      const maxOrder = Math.max(...(faqItems?.map(i => i.displayOrder) || [0]), 0);
      const itemData = { ...data, displayOrder: maxOrder + 1 };
      
      const response = await apiRequest("POST", "/api/admin/faq", itemData);
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

  // Mutation para reordenar itens
  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; displayOrder: number }[]) => {
      const promises = updates.map(update => 
        apiRequest("PUT", `/api/admin/faq/${update.id}`, { displayOrder: update.displayOrder })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ title: "Ordem atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
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
    if (confirm(`Tem certeza que deseja remover esta pergunta?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const onSubmit = (data: FaqItemFormData) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      const maxOrder = Math.max(...(faqItems?.map(i => i.displayOrder) || [0]), 0);
      createItemMutation.mutate({ ...data, displayOrder: maxOrder + 1, isActive: true });
    }
  };

  const sortedFaqItems = [...faqItems].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div>
      <div className={`${isMobile ? 'block space-y-4' : 'flex items-center justify-between'} mb-6`}>
        <div>
          <h3 className="text-lg font-semibold mb-1 text-[#fbf9f7]">
            Gerenciar FAQ
          </h3>
          <p className="text-sm text-[#fbf9f7]">
            Arraste e solte para reordenar as perguntas
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingItem(null);
                form.reset();
              }}
              className="text-[#fbf9f7] bg-[#E1AC33] w-full sm:w-auto"
              data-testid="button-add-faq"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full sm:max-w-2xl admin-dialog-content p-0">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-[#ffffff]">
                  {editingItem ? "Editar Pergunta" : "Nova Pergunta"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 admin-no-focus">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#FBF9F7]">Pergunta</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite a pergunta..." 
                          {...field}
                          data-testid="input-faq-question"
                          className="bg-[#195d5e] text-white placeholder:text-gray-300 border-gray-300 focus:border-gray-300 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                        />
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
                      <FormLabel className="text-[#FBF9F7]">Resposta</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite a resposta..." 
                          rows={4}
                          {...field}
                          data-testid="textarea-faq-answer"
                          className="bg-[#195d5e] text-white placeholder:text-gray-300 border-gray-300 focus:border-gray-300 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel-faq"
                    className="bg-[#2C8587] text-[#F7F5F3] border-[#2C8587] hover:bg-[#2C8587] hover:text-[#F7F5F3] focus:bg-[#2C8587] focus:text-[#F7F5F3] active:bg-[#2C8587] active:text-[#F7F5F3]"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createItemMutation.isPending || updateItemMutation.isPending}
                    data-testid="button-save-faq"
                    className="text-[#ffffff]"
                  >
                    {editingItem ? "Atualizar" : "Criar"} Pergunta
                  </Button>
                </div>
              </form>
            </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-[#277677]">Carregando perguntas...</div>
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
              items={sortedFaqItems.map(item => item.id)} 
              strategy={verticalListSortingStrategy}
            >
              <Accordion type="single" collapsible className="w-full">
                {sortedFaqItems.map((item) => (
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
            <HelpCircle className="h-12 w-12 text-[#277677] mx-auto mb-4" />
            <p className="text-[#302e2b]">Nenhuma pergunta cadastrada ainda.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}