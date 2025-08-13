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
    <main>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center bg-[#FBF9F7]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#277677]">
              Entre em <span className="text-[#E1AC33]">contato</span>
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-[#302e2b] font-normal max-w-2xl mx-auto">
              Tire suas dúvidas ou solicite uma cotação personalizada para seu melhor amigo
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="rounded-2xl p-8 shadow-xl bg-[#FBF9F7] border-0">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-[32px] font-bold text-[#277677]">Solicitar Cotação</CardTitle>
              <p className="text-[18px] text-[#302e2b] mt-2">Preencha os dados para receber uma proposta personalizada</p>
            </CardHeader>
            <CardContent className="p-0">
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
                    className="w-full h-12 text-[18px] font-semibold rounded-lg bg-[#277677] hover:bg-[#277677]/90 text-[#FBF9F7]"
                    disabled={isSubmitting}
                    data-testid="button-submit-quote"
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
              <h2 className="text-[32px] font-bold text-[#277677] mb-6">Outras Formas de Contato</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#277677] w-12 h-12 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#FBF9F7]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#277677] text-[18px]">Telefone</div>
                    <div className="text-[#302e2b] text-[16px]">0800 123 4567</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-[#277677] w-12 h-12 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#FBF9F7]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#277677] text-[18px]">E-mail</div>
                    <div className="text-[#302e2b] text-[16px]">contato@unipetplan.com.br</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-[#277677] w-12 h-12 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-[#FBF9F7]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#277677] text-[18px]">WhatsApp</div>
                    <div className="text-[#302e2b] text-[16px]">(11) 99999-9999</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Hours */}
            <Card className="rounded-2xl p-8 shadow-xl bg-[#FBF9F7] border-0">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-[24px] text-[#277677] font-bold flex items-center">
                  <Clock className="h-6 w-6 mr-3" />
                  Horário de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4 text-[#302e2b]">
                  <div className="flex justify-between text-[16px]">
                    <span className="font-medium">Segunda a Sexta:</span>
                    <span>8h às 18h</span>
                  </div>
                  <div className="flex justify-between text-[16px]">
                    <span className="font-medium">Sábado:</span>
                    <span>8h às 14h</span>
                  </div>
                  <div className="flex justify-between text-[16px]">
                    <span className="font-medium">Emergências:</span>
                    <span className="text-[#E1AC33] font-semibold">24h todos os dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <div>
              <h3 className="text-[24px] font-bold text-[#277677] mb-4">Siga-nos</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-[#277677] w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#E1AC33] transition-colors duration-200" data-testid="link-facebook">
                  <Facebook className="h-5 w-5 text-[#FBF9F7]" />
                </a>
                <a href="#" className="bg-[#277677] w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#E1AC33] transition-colors duration-200" data-testid="link-instagram">
                  <Instagram className="h-5 w-5 text-[#FBF9F7]" />
                </a>
                <a href="#" className="bg-[#277677] w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#E1AC33] transition-colors duration-200" data-testid="link-linkedin">
                  <Linkedin className="h-5 w-5 text-[#FBF9F7]" />
                </a>
                <a href="#" className="bg-[#277677] w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#E1AC33] transition-colors duration-200" data-testid="link-youtube">
                  <Youtube className="h-5 w-5 text-[#FBF9F7]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>
    </main>
  );
}
