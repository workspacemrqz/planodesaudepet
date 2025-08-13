import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Phone, Mail, MessageSquare, Clock, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type FaqItem } from "@shared/schema";

export default function FAQ() {
  const { data: faqItems = [], isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/faq"],
  });

  return (
    <main className="min-h-screen bg-[#FBF9F7]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 text-[#fbf9f7] bg-[#277677] pl-[20px] pr-[20px]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="h-12 w-12 text-[#277677] mr-3" />
            <h1 className="font-bold text-[#e1ac33] text-[30px]">
              Perguntas Frequentes
            </h1>
          </div>
          <p className="font-normal max-w-2xl mx-auto text-[#fbf9f7] text-[18px]">
            Encontre respostas para as principais dúvidas sobre nossos planos de seguro para pets
          </p>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 px-4 bg-[#ded8ce] pl-[20px] pr-[20px]">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#FBF9F7] border-none shadow-lg rounded-xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-[#277677]">
                Tire suas dúvidas
              </CardTitle>
              <p className="text-[#302e2b] mt-2">
                Selecionamos as perguntas mais comuns de nossos clientes
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-[#277677] text-lg">Carregando perguntas...</div>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <AccordionItem 
                      key={faq.id} 
                      value={`item-${faq.id}`}
                      className="border border-[#277677]/20 rounded-lg px-4 bg-white"
                    >
                      <AccordionTrigger 
                        className="text-left py-4 hover:no-underline text-[#277677] font-semibold"
                        data-testid={`faq-question-${faq.id}`}
                      >
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent 
                        className="text-[#302e2b] pb-4 leading-relaxed"
                        data-testid={`faq-answer-${faq.id}`}
                      >
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}