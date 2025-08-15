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
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";

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

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { settings, shouldShow } = useSiteSettingsWithDefaults();

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
    <section className="py-20" style={{backgroundColor: '#277677'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-bold mb-4 text-[#FBF9F7] sm:text-3xl md:text-4xl lg:text-[36px] text-[30px]">
            Entre em <span className="text-[#E1AC33]">contato</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#FBF9F7] font-semibold px-4 pl-[0px] pr-[0px]">Tire suas dúvidas ou solicite uma cotação personalizada</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 px-4 sm:px-0 pl-[0px] pr-[0px]">
          {/* Contact Form */}
          <Card className="unipet-card shadow-lg rounded-xl border-none">
            <CardHeader className="flex flex-col space-y-1.5 p-4 sm:p-6 bg-[#FBF9F7] text-[#ffffff] rounded-t-xl">
              <CardTitle className="tracking-tight text-[#277677] text-xl sm:text-2xl lg:text-[26px] font-semibold">Solicitar Cotação</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 text-[#302e2b] bg-[#FBF9F7] rounded-b-xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="contact-form-field">
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" className="mobile-form-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="contact-form-field">
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" className="mobile-form-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="contact-form-field">
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" className="mobile-form-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="contact-form-field">
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua cidade" className="mobile-form-input" {...field} />
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
                      <FormItem className="contact-form-field">
                        <FormLabel>Nome do Pet</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do seu pet" className="mobile-form-input" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="animalType"
                      render={({ field }) => (
                        <FormItem className="contact-form-field">
                          <FormLabel>Tipo de Animal</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="mobile-form-input">
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
                        <FormItem className="contact-form-field">
                          <FormLabel>Idade do Pet</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="mobile-form-input">
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
                      <FormItem className="contact-form-field">
                        <FormLabel>Plano de Interesse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="mobile-form-input">
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
                      <FormItem className="contact-form-field">
                        <FormLabel>Mensagem (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conte-nos mais sobre suas necessidades..."
                            rows={4}
                            className="mobile-form-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full unipet-button-primary text-base sm:text-lg py-3 sm:py-4 text-[#ffffff] mobile-touch-target"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Solicitar Cotação Gratuita"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#fbf9f7]">Outras Formas de Contato</h3>
              
              <div className="space-y-6">
                {shouldShow.phone && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#FBF9F7]">Telefone</div>
                      <div className="text-[#FBF9F7]">{settings.phone}</div>
                    </div>
                  </div>
                )}

                {shouldShow.email && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#FBF9F7]">E-mail</div>
                      <div className="text-[#FBF9F7]">{settings.email}</div>
                    </div>
                  </div>
                )}

                {shouldShow.whatsapp && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#FBF9F7]">WhatsApp</div>
                      <div className="text-[#FBF9F7]">{settings.whatsapp}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Hours */}
            {shouldShow.businessHours && (
              <Card className="unipet-card shadow-lg rounded-xl border-none">
                <CardHeader className="flex flex-col space-y-1.5 p-6 bg-[#FBF9F7] text-[#ffffff] rounded-t-xl">
                  <CardTitle className="text-xl flex items-center tracking-tight text-[#277677] text-[20px] font-semibold pt-[10px] pb-[10px]">
                    <Clock className="h-5 w-5 mr-2" />
                    Horário de Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 text-[#302e2b] bg-[#FBF9F7] rounded-b-xl">
                  <div className="text-[#302e2b] mt-[0px] mb-[0px] pt-[10px] pb-[10px] whitespace-pre-line">
                    {settings.businessHours}
                  </div>
                </CardContent>
              </Card>
            )}

            
          </div>
        </div>
      </div>
    </section>
  );
}
