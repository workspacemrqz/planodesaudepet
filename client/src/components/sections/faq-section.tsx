import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type FaqItem } from "@shared/schema";
import { useFaqPageData } from "@/hooks/use-parallel-data";
import { FaqSkeleton } from "@/components/loading/faq-skeleton";

interface FaqSectionProps {
  showTitle?: boolean;
  maxItems?: number;
  className?: string;
  customColors?: {
    backgroundColor?: string;
    titleColor?: string;
    subtitleColor?: string;
  };
}

export default function FaqSection({ showTitle = true, maxItems, className = "", customColors }: FaqSectionProps) {
  const { data, isLoading } = useFaqPageData();
  const faqItems = data.faq || [];
  const displayItems = maxItems ? faqItems.slice(0, maxItems) : faqItems;

  const bgColor = customColors?.backgroundColor || "#FBF9F7";
  const titleColor = customColors?.titleColor || "#277677";
  const subtitleColor = customColors?.subtitleColor || "#302e2b";

  return (
    <section className={`py-20 ${className}`} style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        {showTitle && (
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-[28px] md:text-[36px] font-bold mb-4" style={{ color: titleColor }}>
              Tire suas <span className="text-[#E1AC33]">dúvidas</span>
            </h2>
            <p className="text-[18px] font-normal" style={{ color: subtitleColor }}>
              Selecionamos as perguntas mais comuns de nossos clientes
            </p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <FaqSkeleton />
          ) : (
            <Card className="bg-[#FBF9F7] border-none shadow-lg rounded-xl">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="space-y-4">
                  {displayItems.map((faq, index) => (
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}