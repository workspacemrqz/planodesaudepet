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
import { Phone, Mail, Clock, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
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

export default function Contact() {
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
      await apiRequest('POST', '/api/contact', data);
      
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contato em breve.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="pt-32 pb-20" style={{backgroundColor: '#277677'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="font-bold mb-4 text-[#FBF9F7] text-[28px] md:text-[36px]">
            Entre em <span className="text-[#E1AC33]">contato</span>
          </h1>
          <p className="text-base sm:text-[18px] md:text-[18px] lg:text-[18px] text-[#FBF9F7] font-normal px-4 pl-[0px] pr-[0px]">
            <span className="block sm:hidden">Tire suas dúvidas ou solicite<br />numa cotação personalizada</span>
            <span className="hidden sm:block">Tire suas dúvidas ou solicite uma cotação personalizada</span>
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-4 items-start max-w-6xl w-full p-0 m-0">
            {/* Contact Form */}
            <div className="pr-0 lg:pr-2">
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
                                <Input 
                                  placeholder="Seu nome completo" 
                                  className="mobile-form-input"
                                  {...field} 
                                />
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
                                <Input 
                                  placeholder="seu@email.com" 
                                  className="mobile-form-input"
                                  {...field} 
                                />
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
                                <Input 
                                  placeholder="(11) 99999-9999" 
                                  className="mobile-form-input"
                                  {...field} 
                                />
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
                                <Input 
                                  placeholder="Sua cidade" 
                                  className="mobile-form-input"
                                  {...field} 
                                />
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
                              <Input 
                                placeholder="Nome do seu pet" 
                                className="mobile-form-input"
                                {...field} 
                              />
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
            </div>

            {/* Contact Information */}
            <div className="pl-0 lg:pl-2 space-y-4 mt-5 lg:mt-0">
              <Card className="bg-card/95 backdrop-blur-sm shadow-xl rounded-xl w-full">
                <CardContent className="p-3 sm:p-6 sm:pt-6 bg-[#2776776e] pt-[12px] pb-[12px] pl-[12px] pr-[12px] text-left rounded-xl">
                  <div className="mb-4">
                    <div className="text-lg sm:text-xl font-bold text-[#fbf9f7]">
                      Outras Formas de Contato
                    </div>
                  </div>
                  <div className="space-y-4 text-muted-foreground text-xs sm:text-sm">
                    {shouldShow.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-[#fbf9f7] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[#fbf9f7]">Telefone</div>
                          <div className="text-muted-foreground">{settings.phone}</div>
                        </div>
                      </div>
                    )}

                    {shouldShow.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-[#fbf9f7] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[#fbf9f7]">E-mail</div>
                          <div className="text-muted-foreground">{settings.email}</div>
                        </div>
                      </div>
                    )}

                    {shouldShow.whatsapp && (
                      <div className="flex items-start gap-3">
                        <FaWhatsapp className="h-4 w-4 text-[#fbf9f7] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[#fbf9f7]">WhatsApp</div>
                          <div className="text-muted-foreground">{settings.whatsapp}</div>
                        </div>
                      </div>
                    )}

                    {shouldShow.address && (
                      <div className="flex items-start gap-3">
                        <svg className="h-4 w-4 text-[#fbf9f7] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <div className="font-semibold text-[#fbf9f7]">Endereço</div>
                          <div className="text-muted-foreground">{settings.address}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Hours */}
              {shouldShow.businessHours && (
                <Card className="bg-card/95 backdrop-blur-sm shadow-xl rounded-xl w-full">
                  <CardContent className="p-3 sm:p-6 sm:pt-6 bg-[#2776776e] pt-[12px] pb-[12px] pl-[12px] pr-[12px] text-left rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <Clock className="h-5 w-5 text-[#fbf9f7] flex-shrink-0 mt-0.5" />
                      <div className="text-lg sm:text-xl font-bold text-[#fbf9f7]">
                        Horário de Atendimento
                      </div>
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm whitespace-pre-line">
                      {settings.businessHours}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Media */}
              {(shouldShow.facebookUrl || shouldShow.instagramUrl || shouldShow.linkedinUrl || shouldShow.youtubeUrl) && (
                <div>
                  <h4 className="text-xl font-bold mb-4 text-[#FBF9F7]">Siga-nos</h4>
                  <div className="flex space-x-4">
                    {shouldShow.facebookUrl && (
                      <a href={settings.facebookUrl || undefined} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FBF9F7] text-[#277677]">
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {shouldShow.instagramUrl && (
                      <a href={settings.instagramUrl || undefined} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FBF9F7] text-[#277677]">
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {shouldShow.linkedinUrl && (
                      <a href={settings.linkedinUrl || undefined} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FBF9F7] text-[#277677]">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {shouldShow.youtubeUrl && (
                      <a href={settings.youtubeUrl || undefined} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FBF9F7] text-[#277677]">
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
