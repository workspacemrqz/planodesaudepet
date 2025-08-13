import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Phone, Mail, MessageSquare, Clock, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export default function FAQ() {
  const faqData = [
    {
      question: "O que é um seguro para pets?",
      answer: "O seguro para pets é um plano de proteção que cobre despesas veterinárias do seu animal de estimação, incluindo consultas, exames, cirurgias e tratamentos. Ele funciona como um plano de saúde, garantindo que seu pet receba os melhores cuidados sem comprometer seu orçamento."
    },
    {
      question: "Quais animais podem ser segurados?",
      answer: "Aceitamos cães e gatos de todas as raças e portes. O animal deve ter entre 2 meses e 8 anos para contratação inicial do seguro. Animais já segurados continuam cobertos mesmo após os 8 anos."
    },
    {
      question: "Como funciona o reembolso?",
      answer: "Após o atendimento veterinário, você envia os documentos através do nosso app ou site. Analisamos em até 48 horas e fazemos o reembolso direto na sua conta bancária, respeitando o percentual de cobertura do seu plano."
    },
    {
      question: "Existe carência para usar o seguro?",
      answer: "Sim, temos carência de 30 dias para doenças e 90 dias para cirurgias eletivas. Para acidentes, a cobertura é imediata após a contratação. Emergências têm carência reduzida de 15 dias."
    },
    {
      question: "Posso escolher qualquer veterinário?",
      answer: "Sim! Você tem total liberdade para escolher o veterinário ou clínica de sua preferência. Nossa rede credenciada oferece desconto adicional, mas você pode ser atendido em qualquer lugar e solicitar reembolso."
    },
    {
      question: "O que não está coberto pelo seguro?",
      answer: "Não cobrimos doenças pré-existentes, procedimentos estéticos, reprodução, vacinas de rotina e vermifugação. Também não cobrimos acidentes causados por maus-tratos ou negligência do proprietário."
    },
    {
      question: "Como cancelar o seguro?",
      answer: "Você pode cancelar a qualquer momento através do nosso app, site ou central de atendimento. O cancelamento é efetivado no próximo vencimento, e você continua coberto até essa data."
    },
    {
      question: "Posso ter mais de um pet no mesmo plano?",
      answer: "Cada pet precisa de um plano individual, mas oferecemos desconto progressivo: 5% para o segundo pet, 10% para o terceiro e 15% a partir do quarto pet da mesma família."
    },
    {
      question: "Como funciona a idade limite?",
      answer: "Pets podem ser segurados até os 8 anos de idade. Após essa idade, não aceitamos novos segurados, mas pets já segurados continuam com cobertura vitalícia, com reajuste anual conforme tabela."
    },
    {
      question: "Preciso fazer check-up antes de contratar?",
      answer: "Para pets até 5 anos, não é necessário check-up prévio. Para pets entre 5 e 8 anos, solicitamos um exame veterinário básico para avaliar o estado geral de saúde antes da contratação."
    }
  ];

  return (
    <main className="min-h-screen bg-[#FBF9F7]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-[#fbf9f7] bg-[#277677]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="h-12 w-12 text-[#277677] mr-3" />
            <h1 className="text-[48px] font-bold text-[#e1ac33]">
              Perguntas Frequentes
            </h1>
          </div>
          <p className="text-[24px] font-medium max-w-2xl mx-auto text-[#fbf9f7]">
            Encontre respostas para as principais dúvidas sobre nossos planos de seguro para pets
          </p>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 px-4 bg-[#ded8ce]">
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
              <Accordion type="single" collapsible className="space-y-4">
                {faqData.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-[#277677]/20 rounded-lg px-4 bg-white"
                  >
                    <AccordionTrigger 
                      className="text-left py-4 hover:no-underline text-[#277677] font-semibold"
                      data-testid={`faq-question-${index}`}
                    >
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent 
                      className="text-[#302e2b] pb-4 leading-relaxed"
                      data-testid={`faq-answer-${index}`}
                    >
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}