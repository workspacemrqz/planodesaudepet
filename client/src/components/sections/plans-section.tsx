import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { type Plan } from "@shared/schema";
import { Link } from "wouter";
import { useWhatsAppRedirect } from "@/hooks/use-whatsapp-redirect";
import { useHomePageData } from "@/hooks/use-parallel-data";
import { PlansGridSkeleton } from "@/components/loading/plan-skeleton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedList } from "@/components/ui/animated-list";
import { createRedirectHandler } from "@/lib/redirect-utils";
import { smoothScrollToSection } from "@/lib/scroll-utils";
import React from "react"; // Added missing import for React

const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toFixed(2).replace('.', ',');
};

export default function PlansSection() {
  const { redirectToWhatsApp } = useWhatsAppRedirect();
  const [activeTab, setActiveTab] = useState("with_waiting_period");

  // Função para scroll suave para detalhes do plano
  const scrollToPlanDetails = (planName: string) => {
    // Verificar se estamos na página de planos ou na home
    const isPlansPage = window.location.pathname === '/plans';
    
    if (isPlansPage) {
      // Se já estamos na página de planos, fazer scroll suave
      const sectionId = `plan-${planName.toLowerCase()}-details`;
      smoothScrollToSection(sectionId);
    } else {
      // Se estamos na home, redirecionar para a página de planos com anchor
      const targetUrl = `/plans#plan-${planName.toLowerCase()}-details`;
      
      // Redirecionar diretamente
      window.location.href = targetUrl;
    }
  };



  // Usar hook otimizado para carregamento paralelo de dados da home
  const { data, isLoading, hasError } = useHomePageData();
  const plansData = data.plans || [];
  const error = hasError;

  // Separar planos por tipo
  const plansWithWaitingPeriod = plansData.filter(plan => plan.planType === "with_waiting_period");
  const plansWithoutWaitingPeriod = plansData.filter(plan => plan.planType === "without_waiting_period");

  // Ordenar planos por displayOrder
  const sortPlans = (plans: Plan[]) => [...plans].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const currentPlans = activeTab === "with_waiting_period" 
    ? sortPlans(plansWithWaitingPeriod)
    : sortPlans(plansWithoutWaitingPeriod);

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#2C8587] to-[#1a5a5c]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[28px] md:text-[36px] mb-4 text-[#fbf9f7] font-bold leading-tight">
              Escolha o <span className="text-primary">plano ideal</span> para seu pet
            </h2>
            <p className="max-w-2xl mx-auto text-[#fbf9f7] text-base sm:text-lg md:text-xl lg:text-2xl font-medium px-4 mb-4">
              Encontre o plano ideal para seu pet
            </p>
          </div>
          <PlansGridSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#2C8587] to-[#1a5a5c]">
        <div className="container mx-auto px-4">
          <div className="text-center text-white max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">Erro ao carregar planos</h3>
            <p className="mb-4">Tente atualizar a página</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#E1AC33] text-[#2C8587] px-4 py-2 rounded-lg font-semibold hover:bg-[#d4a02b] transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
      </section>
    );
  }
  
  // If no plans available, show a friendly message
  if (!isLoading && (!plansData || plansData.length === 0)) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#2C8587] to-[#1a5a5c]">
        <div className="container mx-auto px-4">
          <div className="text-center text-white max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">Planos em Breve!</h3>
            <p className="mb-4">Estamos preparando os melhores planos para seu pet</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#E1AC33] text-[#2C8587] px-4 py-2 rounded-lg font-semibold hover:bg-[#d4a02b] transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 text-[#fbf9f7] bg-[#2c8587]" style={{backgroundColor: '#277677'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px] text-center">
        <div className="text-center mb-12 sm:mb-16">
          <AnimatedSection animation="slideUp" delay={100}>
            <h2 className="text-[30px] mb-4 text-[#fbf9f7] font-bold leading-tight">
              Escolha o <span className="text-primary">plano ideal</span> para seu pet
            </h2>
          </AnimatedSection>
          <AnimatedSection animation="slideUp" delay={200}>
            <p className="max-w-2xl mx-auto text-[#fbf9f7] text-[18px] font-normal px-4">
              Oferecemos opções com e sem coparticipação, além de planos locais com menos burocracia
            </p>
          </AnimatedSection>
        </div>

        {/* Plan Tabs */}
        <AnimatedSection animation="scale" delay={300}>
          <div className="mb-8 sm:mb-12">
            <div className="p-1 rounded-lg bg-[#e1ac33] text-[#fbf9f7] mx-auto max-w-2xl">
              <Button
                onClick={() => setActiveTab("with_waiting_period")}
                className={`w-1/2 py-5 sm:py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target leading-tight ${activeTab === "with_waiting_period" ? 'bg-[#2C8587]' : 'bg-[#E1AC33]'}`}
                style={{ transition: 'none' }}
                onMouseEnter={(e) => { e.preventDefault(); }}
                onMouseLeave={(e) => { e.preventDefault(); }}
              >
                Com carência e<span className="hidden sm:inline" style={{letterSpacing: '-0.05em'}}> </span><br className="sm:hidden" />sem coparticipação
              </Button>
              <Button
                onClick={() => setActiveTab("without_waiting_period")}
                className={`w-1/2 py-5 sm:py-3 text-[#FBF9F7] font-medium rounded-md text-sm sm:text-base mobile-touch-target leading-tight ${activeTab === "without_waiting_period" ? 'bg-[#2C8587]' : 'bg-[#E1AC33]'}`}
                style={{ transition: 'none' }}
                onMouseEnter={(e) => { e.preventDefault(); }}
                onMouseLeave={(e) => { e.preventDefault(); }}
              >
                Sem carência e<span className="hidden sm:inline" style={{letterSpacing: '-0.05em'}}> </span><br className="sm:hidden" />com coparticipação
              </Button>
            </div>
          </div>
        </AnimatedSection>

        {/* Plans Grid */}
        <AnimatedList 
          animation="slideUp" 
          delay={400} 
          staggerDelay={100}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-4xl mx-auto px-4 sm:px-0 pl-[0px] pr-[0px]"
        >
          {currentPlans.map((plan, index) => (
            <Card key={plan.id || index} className="relative transition-all duration-300 hover:shadow-2xl flex flex-col h-[520px] sm:h-[600px] w-full bg-[#FBF9F7] border-[#277677]/30">

              
              <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6 flex-shrink-0">
                <div className="flex flex-col items-center gap-2 mb-2">
                  {plan.name === 'BASIC' && (
                    <img src="/BASICicon.svg" alt="Ícone BASIC" className="w-12 h-12" />
                  )}
                  {plan.name === 'INFINITY' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5.0 -10.0 110.0 135.0" className="w-12 h-12" fill="#277677">
                      <path d="M88.13,17.28c-6.14-5.5-14.37-6-22.06-1.32-2.58,2-5.43,2-9,.15l-.94-.39C35,7.41,22.07,19.63,9.54,31.44L8.93,32h0A4.1,4.1,0,0,0,7.4,35c-.32,3,1.48,7.2,4.71,11C5.7,64.47,0,84.79,12.52,93a.5,5.0,0,0,0,.27.08H91a.49,49,0,0,0,.4-.2.5,5.0,0,0,0,.08-.43L85,68.46A5.68,5.68,0,0,0,86,69a2.13,2.13,0,0,0,.81.16,2.19,2.19,0,0,0,1.37-.49,2.16,2.16,0,0,0,.76-2.09C86.8,54.91,84.48,49,81.11,46.66a13.42,13.42,0,0,0,7.4-5.32l3.13,3a.51,51,0,0,0,.44.13.47,47,0,0,0,.36-.28C97.69,33,94.06,22.58,88.13,17.28ZM81.18,64.84a21.84,21.84,0,0,0,2.49,2.65l6.71,24.58h-9.2ZM56.63,17l7.21,4.5a3.87,3.87,0,0,0,4.66-.39l2.55-2.24a4,4,0,0,1,3.2-1.09c.62.08,2.45.33,2.51,4.36L62.35,25.26a9.79,9.79,0,0,0-4.41,2.17c-2.46,2.16-4.79,6.48-5.6,10.29l0,0-.3-.15-.09,0h0c-3.29-10.21,0-16,4.16-20.71ZM11.38,31.08C23.69,19.5,35.6,9.07,55.09,16.41,51.15,21,47.8,27,50.71,36.92A13,13,0,0,0,47,35.76a2.78,2.78,0,0,0-3.07,2.39,9.25,9.25,0,0,0,.27,3.46v0a0,0,0,0,0,0,0A18.4,18.4,0,0,0,48.59,49c.1,1,.14,2,.19,3.1.14,3.42.29,7.28,2.4,11.18-5,6.46-16.56,15-30.67,19l16-35.45s0,0,0,0l8.11-18a.51,51,0,0,0-.92-.42L35.9,45.77C31.52,41.32,26,37.86,20.14,34.21L17.56,32.6A9.83,9.83,0,0,0,12.17,31,6.63,6.63,0,0,0,11.38,31.08ZM51.07,38.2c-1.17,1.91-3.13,2.82-6,2.79a8.08,8.08,0,0,1-.15-2.72,1.77,1.77,0,0,1,2-1.51A13.32,13.32,0,0,1,51.07,38.2ZM12.94,92.07c-11.82-7.9-6.1-27.88.2-46v0a.14,14,0,0,0,0-.06c1-3,2.13-6,3.22-9l1.16-3.22,2.06,1.29c5.92,3.69,11.51,7.18,15.85,11.68L19.16,82.86a.51,51,0,0,0,.46.71l.13,0c15-4,27.32-13.14,32.43-19.92a.5,5.0,0,0,0,0-.55c-2.14-3.78-2.29-7.45-2.43-11,0-.64-.06-1.26-.09-1.87l7.41,8a4.32,4.32,0,0,1,1,4.33c-1.18,3.39-5.31,7.73-9.67,12.31-5.09,5.35-10.84,11.4-13.09,17.23Zm67.24,0H36.44c2.28-5.54,7.81-11.37,12.73-16.54,4.44-4.67,8.64-9.08,9.89-12.68a5.29,5.29,0,0,0-1.22-5.33l-8.39-9A18.81,18.81,0,0,1,45.35,42c3.09,0,5.3-1.16,6.61-3.35l.5.27c1.4.76,2.87,1.66,4.26,2.53a52,52,0,0,0,9.21,3.92l.33.12c1.95.68,3.86,1.36,5.88,2.18a12.9,12.9,0,0,1,7.11,7.06,12.53,12.53,0,0,1,.93,4.76ZM79.82,46c-2-.77-4.36-.55-7.49.7-1.77-.71-3.47-1.32-5.17-1.92C70.44,39,67.39,34.57,64,31.28a83.9,83.9,0,0,1,11.71-4.16,7.34,7.34,0,0,0,3.36-2l.41-.42a4.75,4.75,0,0,1,3.18-1.22,2,2,0,0,1,1.64.73,2,2,0,0,1,.42,1.69l-1.1,5.23a7.58,7.58,0,0,0,1.93,7.37l2.2,2.11A12.51,12.51,0,0,1,79.82,46ZM63.68,48.25a2.83,2.83,0,1,0,2.82,2.83A2.83,2.83,0,0,0,63.68,48.25ZM78,58.62c-1.43.32-1.79,2.16-2.2,4.28-.64,3.29-1.44,7.37-6,8.49a1.26,1.26,0,0,1-1.48-.92c-1.53-5.11-1-11.22,1.59-19.24a.5,5.0,0,0,0-1-.3c-2.67,8.21-3.18,14.51-1.59,19.82a2.31,2.31,0,0,0,2.18,1.68,2.2,2.2,0,0,0,.5-.06c5.2-1.28,6.1-5.9,6.76-9.27.35-1.79.65-3.32,1.44-3.5a.5,5.0,0,0,0-.22-1ZM76.53,34.71a.5,5.0,0,0,0,0-1,1.44,1.44,0,1,1,0-2.87.5,5.0,0,0,0,0-1,2.44,2.44,0,1,0,0,4.87Zm.85,5.92a.5,5.0,0,0,0,0-1,2.44,2.44,0,0,0,0,4.87.5,5.0,0,0,0,0-1,1.44,1.44,0,0,1,0-2.87Zm4.33-9.07a.51,51,0,0,0-.45-.55.52,52,0,0,0-.55.45l-.36,3.6a1.81,1.81,0,0,1-1.44,1.61l-7.58,1.67a.5,5.0,0,0,0,.11,1h.11l7.57-1.67a2.83,2.83,0,0,0,2.23-2.49Zm0,7.72A.51,51,0,0,0,81,39a.5,5.0,0,0,0-.29.65l1.44,3.74a.51,51,0,0,0,.47.32l.18,0a.5,5.0,0,0,0,.29-.65Z"/>
                    </svg>
                  )}
                  {plan.name === 'COMFORT' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 640" className="w-12 h-12" fill="#277677">
                      <path d="M491.63,340.81,475.24,214.62A30.636,30.636,0,0,0,444.94,188c-.15,0-.29.03-.43.04-.14-.01-.28-.04-.43-.04H396l.01-31.01A13.864,13.864,0,0,0,404,144.44V118.88a28.708,28.708,0,0,0-36.82-27.56,27.991,27.991,0,0,0-7.45,3.41l-5.33,3.42H328a4,4,0,0,0-4,4v12.39a21.955,21.955,0,0,0,16,21.16v23.45a23.035,23.035,0,0,0,16,21.91V188H295.43a38.387,38.387,0,0,0-34.36,21.56l-47.11,97.46L148,283.47V272.94l2.68-5.35a53.829,53.829,0,0,0-3.35-53.81,4.008,4.008,0,0,0-6.16-.61l-6.27,6.27a53.788,53.788,0,0,0-14.12,24.95L116.88,260H59.3a11.995,11.995,0,1,0-14.99,15.41,36.5,36.5,0,0,0,27.07,30.56l-9.32,37.28a84.137,84.137,0,0,0,.4,42.18L44.77,468h-.08a24.406,24.406,0,0,0-21.95,13.56l-2.24,4.5a4.187,4.187,0,0,0-.25,3.34A4.01,4.01,0,0,0,24,492h8.58l5.53-11.06a37.6,37.6,0,0,1,23.85-19.61l.07-.07,17.89-83.51a4,4,0,1,1,7.83,1.67L69.33,465.38a4.128,4.128,0,0,1-3.19,3.19,29.586,29.586,0,0,0-20.87,15.95l-.85,1.69A4,4,0,0,0,48,492H88a4,4,0,0,0,3.81-2.79l.19-.6,5.31-16.98,7.44-23.82,10.64,12.57A28.026,28.026,0,0,1,120,460h.19a63.23,63.23,0,0,1,16.72-52.3,4,4,0,1,1,5.81,5.5,55.211,55.211,0,0,0-13.83,49.93,4.011,4.011,0,0,1-3.91,4.87H120a19.932,19.932,0,0,0-14.13,5.86,20.473,20.473,0,0,0-2.97,3.77q-.255.42-.48.84a17.436,17.436,0,0,0-.84,1.74A19.857,19.857,0,0,0,100,488a4.018,4.018,0,0,0,4,4h59.973a70.141,70.141,0,0,0,38.907-11.78l1.32-.88A71.405,71.405,0,0,0,236,419.92a93.141,93.141,0,0,0-1.027-14.219,47.442,47.442,0,0,0-8.492-20.49L215.09,369.43l-1.22-1.22A43.314,43.314,0,0,0,226,369.94a44.235,44.235,0,0,0,40.49-26.43L292,284.83v80.51L237.48,388.3A79.284,79.284,0,0,1,244,419.92V420h39.85a4.105,4.105,0,0,1,4.07,3.18A4,4,0,0,1,284,428H243.58a79.4,79.4,0,0,1-34.95,58l-1.31.87a78.363,78.363,0,0,1-8.91,5.13H252v-4a24.8,24.8,0,0,1,13.79-22.31L285.16,456,300,366.97V224.15a4.105,4.105,0,0,0-3.18-4.07A4,4,0,0,0,292,224v40.77l-4.56,10.48-39.65-19.83,20.48-42.38A30.352,30.352,0,0,1,295.43,196h61a20.062,20.062,0,0,0,3.69,8.17,20,20,0,0,0,34.82-5.74,20.192,20.192,0,0,0,.64-2.43h48.5c.15,0,.29-.03.43-.04.14.01.28.04.43.04a22.607,22.607,0,0,1,22.36,19.65L474.1,268H429.3l-6.68-46.22a22.416,22.416,0,0,1,1.18-11.11,4,4,0,0,0-7.49-2.81,30.507,30.507,0,0,0-1.61,15.07l17.33,119.73L426.99,348H406.03l-9.61-29.15-7.78-26.09a35.581,35.581,0,0,0-68.99,4.96L311.28,348h-.01L292.4,461.27l-23.03,11.57A16.858,16.858,0,0,0,260,488v4H408.17A43.83,43.83,0,0,0,452,448.17V406.68l28.17-30.18A43.868,43.868,0,0,0,491.63,340.81ZM46.04,267.46a3.862,3.862,0,0,1-1.5-1.5,3.971,3.971,0,0,1,5.42-5.42,3.862,3.862,0,0,1,1.5,1.5A3.971,3.971,0,0,1,46.04,267.46ZM204,402.39l-16,6.75v-3.33c0-2.04-.09-4.11-.25-6.14s-.43-4.08-.76-6.07l-1.16-6.97a74.237,74.237,0,0,0-14.58-33.25L204,364.839ZM284.25,282.6l-25.1,57.72a36.142,36.142,0,0,1-44.91,19.62l-55.88-19.55A74.413,74.413,0,0,0,148,333.57v-41.6l66.65,23.8a4.014,4.014,0,0,0,4.95-2.03l24.71-51.11ZM391.23,150.19a3.985,3.985,0,0,0-3.22,3.92L388,192a12,12,0,0,1-21.52,7.31A12.1,12.1,0,0,1,364,192v-9.87a33.061,33.061,0,0,0,11.34-2.36,4.109,4.109,0,0,0,2.58-4.53,4.009,4.009,0,0,0-5.45-2.94,24.844,24.844,0,0,1-9.7,1.85,14.964,14.964,0,0,1-14.77-15V136.44a21.964,21.964,0,0,0,6.01-1.4l18.58-7.27a24.365,24.365,0,0,0,7.56,13.06,4,4,0,0,0,5.64-.3,5.789,5.789,0,0,1,4.36-1.95,5.861,5.861,0,0,1,5.85,5.68v.18A5.876,5.876,0,0,1,391.23,150.19ZM375.5,395.29l7.66-45.97a4,4,0,0,1,7.9,1.31l-7.67,45.98a4,4,0,0,1-3.94,3.34,4.887,4.887,0,0,1-.66-.05A4.013,4.013,0,0,1,375.5,395.29ZM356,484H268.94a8.9,8.9,0,0,1,4-4l24-12H356ZM474.32,371.04,380.23,471.85a4.035,4.035,0,0,1-5.43.4L347.37,450.3a4,4,0,0,1-.41-5.87L365,425.32a3.995,3.995,0,0,0-1.39-6.44l-8.6-3.54c-.02-.01-.03-.01-.05-.02a1.739,1.739,0,0,1,.73-3.32h21.98l61.5-65.25a3.981,3.981,0,0,0,1.05-3.32L430.46,276h44.68l8.56,65.84A35.885,35.885,0,0,1,474.32,371.04Z"/>
                    </svg>
                  )}
                  {plan.name === 'PLATINUM' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 640" className="w-12 h-12" fill="#277677">
                      <path d="M270.968,130.278l-2.287.728a4,4,0,1,0,2.424,7.623l2.287-.727a26.517,26.517,0,0,0,16.99-16.617,4,4,0,1,0-7.568-2.592A18.489,18.489,0,0,1,270.968,130.278Z"/>
                      <path d="M259.72,119.013a4,4,0,0,0,5.024,2.6l12.968-4.122a4,4,0,1,0-2.423-7.625l-9.156,2.911L259.1,90.651a4,4,0,1,0-7.624,2.424Z"/>
                      <path d="M502.038,376.665l-35.424-22.542L471.356,308a45.915,45.915,0,0,0,14.334-71.142,73.873,73.873,0,0,1-6.168-8.274l2.687-26.134a40.115,40.115,0,0,0-27.521-42.26,80.809,80.809,0,0,0-20.067-20.577l-3.508-2.5a80.557,80.557,0,0,1-23.143-25.684l-1.96-3.461A88.567,88.567,0,0,0,364.8,70.778a80.268,80.268,0,0,1-15.715-9.152,80.133,80.133,0,0,1-13.239-12.458l-17.23-20.381A65.278,65.278,0,0,0,205.259,86.046l6.772,28.462A74.59,74.59,0,0,0,116.46,98.521L77.5,121.93H47.682a22.141,22.141,0,1,0-32.939,25.058,21.825,21.825,0,0,0,7.082,12.862l5.412,4.772a42.644,42.644,0,0,0,34.709,10.172l49.882-7.653a2.158,2.158,0,0,1,.332-.021,2.294,2.294,0,0,1,.788,4.446L66.493,188.678a19.744,19.744,0,0,0-10.815,27.353l1.22,2.42a4,4,0,0,0,4.04,2.172l47.587-5.6c.988-.115,1.976-.169,2.964-.194l-59.12,95.506a71.742,71.742,0,0,0,102.155,96.553L167.5,397.8l1.8.486V496a4,4,0,0,0,4,4H499.89a4,4,0,0,0,4-4V380.04A4,4,0,0,0,502.038,376.665ZM26.448,142.347A14.144,14.144,0,1,1,40.592,128.2,14.159,14.159,0,0,1,26.448,142.347ZM245.787,70.79A44.006,44.006,0,0,0,283.313,86.1a4,4,0,0,0,3.475-2.89,14.138,14.138,0,1,1,20.617,16.1a4,4,0,0,0-2.025,3.478v59.43a4,4,0,0,0,4,4h15.383a32.263,32.263,0,0,1-48.257,23.905l1.886-.094a4,4,0,0,0,2.551-6.9L263.076,166.22H273.09a4,4,0,0,0,4-4v-8.486c.257,0,.512.03.77.03q1.2,0,2.414-.083a36.039,36.039,0,0,0,8.426-1.609,4,4,0,0,0-2.419-7.625,28.029,28.029,0,0,1-6.553,1.253,26.694,26.694,0,0,1-6.008-.261H273.7l-.012,0a27.6,27.6,0,0,1-22.27-19.027L239.063,87.5a14.1,14.1,0,0,1,6.724-16.711ZM226.139,227.11a13.58,13.58,0,0,0-4.88-.823,452.435,452.435,0,0,0,34.7-35.469c1.064.043,2.13.068,3.2.068h0q6.877,8.444,14.012,16.659a448.44,448.44,0,0,1-40.024,40.447l1.182-4.011A13.779,13.779,0,0,0,226.139,227.11ZM180.794,117.258a4,4,0,0,1,5.253,2.1l6.179,14.418a73.072,73.072,0,0,0,70.5,44.022,4,4,0,0,1,.4,7.99q-1.986.1-3.961.1a81.139,81.139,0,0,1-74.29-48.959l-6.179-14.417A4,4,0,0,1,180.794,117.258ZM164.222,270.525a451.126,451.126,0,0,0,43.563-32.39l-12.232,41.679-23.989,16.794-8.475-25.34Zm.506,30.868-21.273,14.892L160.5,288.75ZM121.143,114.034a4,4,0,0,1,5.657,5.656,5.248,5.248,0,0,0,1.363,8.4l.708.353a5.237,5.237,0,0,0,6.056-.981l4.359-4.36a4,4,0,1,1,5.657,5.657l-4.359,4.359a13.228,13.228,0,0,1-15.292,2.481l-.707-.353a13.248,13.248,0,0,1-3.442-21.216Zm-.85,101.771a32.454,32.454,0,0,1,22.914,21.233L157.2,278.883l-14.272,23.055-56.47-31.474Zm29.643,184.527a63.753,63.753,0,0,1-90.765-85.787l23.071-37.271,56.47,31.474L126.419,328.6a4,4,0,0,0,5.7,5.383l69.177-48.424a3.993,3.993,0,0,0,1.543-2.15l13.251-45.154a5.562,5.562,0,0,1,7.278-3.646,5.761,5.761,0,0,1,3.3,7.107l-6.454,21.9a4,4,0,0,0,6.127,4.411L271.4,236.573a5.072,5.072,0,1,1,5.8,8.32l-29.952,20.883a4,4,0,0,0,4.576,6.563L281.6,251.582a5.072,5.072,0,0,1,5.8,8.322l-29.766,20.755a4,4,0,0,0,4.575,6.563l29.766-20.755a5.072,5.072,0,1,1,5.8,8.32L268.01,295.543a4,4,0,1,0,4.576,6.562l28.886-20.142a6.144,6.144,0,0,1,8.554,1.525,4,4,0,0,1-1,5.572l-59.087,41.311c-.078.046-.162.077-.239.129-.1.068-.182.154-.274.229ZM177.3,492V400.451l17.737,4.919,11.3,86.63Zm88.7,0,2.032-34.533q3.707,3.039,7.488,5.933L279.1,492Zm186.009-74.069a41.365,41.365,0,0,1-52.148,35.642L177.3,392.164v-1.221l73.637-51.506,4.244,6.251a4,4,0,0,0,2.246,1.609l128.639,35.479a4,4,0,0,0,5.042-3.441l6.03-57.764,63.917,8.4Zm-54.042-104.32,9.079-86.976a4,4,0,1,0-7.957-.83l-8.209,78.64A665.476,665.476,0,0,1,276.436,199.059,40.271,40.271,0,0,0,332.82,166.22H442.29a32.13,32.13,0,0,1,31.961,35.411L461.874,322.008Z"/>
                    </svg>
                  )}
                </div>
                <CardTitle className="tracking-tight sm:text-2xl lg:text-3xl font-bold text-[#277677] sm:mb-4 text-[26px] mt-[0px] mb-[0px] pt-[4px] pb-[4px]">{plan.name}</CardTitle>
                <div className="mb-3 sm:mb-4">
                  <span className="sm:text-3xl lg:text-4xl font-bold text-[#277677] text-[28px]">R${formatPrice(plan.price)}</span>
                  <span className="text-sm sm:text-base lg:text-lg font-medium text-[#302e2b]">/mês</span>
                </div>

              </CardHeader>
              
              <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8 flex flex-col flex-grow">
                <ul className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 text-left">
                  {plan.features.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-start space-x-3 text-left">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#277677]" />
                      <span className="text-sm sm:text-base lg:text-[17px] font-normal text-[#302e2b] leading-relaxed text-left">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex-shrink-0 space-y-2">
                  <Button 
                    className="w-full h-10 sm:h-12 text-sm sm:text-base lg:text-lg font-semibold rounded-lg transition-all duration-200 mobile-touch-target bg-[#277677] hover:bg-[#277677]/90 text-[#FBF9F7]"
                    onClick={createRedirectHandler(plan.redirectUrl)}
                  >
                    {plan.buttonText || `Contratar Plano ${plan.name}`}
                  </Button>
                  
                  <div className="flex justify-end">
                    <button 
                      className="flex items-center gap-1 text-[#E1AC33] text-sm font-medium cursor-pointer hover:text-[#E1AC33] transition-all duration-300 mobile-touch-target p-1 group hover:scale-105"
                      onClick={() => scrollToPlanDetails(plan.name)}
                    >
                      Ver detalhes
                      <ArrowRight className="h-3 w-3 text-[#E1AC33] transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </AnimatedList>


      </div>
    </section>
  );
}
