import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Phone, Mail, MessageSquare, Clock, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const contactFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  city: z.string().min(2, "Cidade é obrigatória"),
  petName: z.string().min(1, "Nome do pet é obrigatório"),
  animalType: z.string().min(1, "Tipo de animal é obrigatório"),
  petAge: z.string().min(1, "Idade do pet é obrigatória"),
  planInterest: z.string().min(1, "Selecione um plano"),
  message: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      petName: "",
      animalType: "",
      petAge: "",
      planInterest: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contact", data);
      toast({
        title: "Cotação enviada com sucesso!",
        description: "Entraremos em contato em breve.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar cotação",
        description: "Tente novamente ou entre em contato por telefone.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 bg-white py-12 rounded-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#060606]">
            Entre em <span className="text-primary">contato</span>
          </h1>
          <p className="text-xl text-[#101010]">
            Tire suas dúvidas ou solicite uma cotação personalizada
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="unipet-card">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Solicitar Cotação</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="petName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Pet</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do seu pet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="animalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Animal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cao">Cão</SelectItem>
                              <SelectItem value="gato">Gato</SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade do Pet</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-1">0-1 ano</SelectItem>
                              <SelectItem value="1-3">1-3 anos</SelectItem>
                              <SelectItem value="3-7">3-7 anos</SelectItem>
                              <SelectItem value="7+">7+ anos</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="planInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano de Interesse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um plano..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="basico">Básico - R$20/mês</SelectItem>
                            <SelectItem value="padrao">Padrão - R$45/mês</SelectItem>
                            <SelectItem value="premium">Premium - R$80/mês</SelectItem>
                            <SelectItem value="local">Plano Local</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conte-nos mais sobre suas necessidades..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full unipet-button-primary text-lg py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Solicitar Cotação Gratuita"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Outras Formas de Contato</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Telefone</div>
                    <div className="text-muted-foreground">0800 123 4567</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">E-mail</div>
                    <div className="text-muted-foreground">contato@unipetplan.com.br</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-muted-foreground">(11) 99999-9999</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Hours */}
            <Card className="unipet-card">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Horário de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta:</span>
                    <span>8h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado:</span>
                    <span>8h às 14h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergências:</span>
                    <span className="text-primary font-semibold">24h todos os dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Siga-nos</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
