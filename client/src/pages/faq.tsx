import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Phone, Mail, Clock, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { type FaqItem } from "@shared/schema";
import { useFaqPageData } from "@/hooks/use-parallel-data";
import { FaqSkeleton } from "@/components/loading/faq-skeleton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";

export default function FAQ() {
  // Usar hook otimizado para carregamento paralelo de FAQ e configurações
  const { data, isLoading } = useFaqPageData();
  const faqItems = data.faq || [];

  return (
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedSection animation="slideUp" delay={400}>
            <h1 className="font-bold mb-4 text-[#e1ac33] text-[28px] md:text-[36px]">
              Perguntas Frequentes
            </h1>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={600}>
            <p className="font-normal max-w-2xl mx-auto text-[#fbf9f7] text-[18px]">
              <span className="block sm:hidden">Tudo que você precisa saber<br />sobre nossos planos</span>
              <span className="hidden sm:block">Tudo que você precisa saber sobre nossos planos</span>
            </p>
          </AnimatedSection>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          {isLoading ? (
            <FaqSkeleton />
          ) : (
            <AnimatedSection animation="slideUp" delay={800}>
              <Card className="bg-[#FBF9F7] border-none shadow-lg rounded-xl">
                <CardHeader className="text-center pb-8">
                  <AnimatedSection animation="slideUp" delay={1000}>
                    <CardTitle className="text-[28px] md:text-[36px] font-bold text-[#277677]">
                      Tire suas dúvidas
                    </CardTitle>
                  </AnimatedSection>
                  <AnimatedSection animation="slideUp" delay={1200}>
                    <p className="text-[18px] text-[#302e2b] mt-2 font-normal">
                      Selecionamos as perguntas mais comuns de nossos clientes
                    </p>
                  </AnimatedSection>
                </CardHeader>
              <CardContent className="px-6 pb-8">
                <AnimatedList animation="slideUp" delay={1400} staggerDelay={150}>
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
                </AnimatedList>
              </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </div>
      </div>
    </main>
  );
}