import { lazy, Suspense } from "react";
import Hero from "@/components/sections/hero";
import PlansSection from "@/components/sections/plans-section";
import Features from "@/components/sections/features";
import FaqSection from "@/components/sections/faq-section";

// Lazy load componentes não críticos para melhor performance inicial
const Testimonials = lazy(() => import("@/components/sections/testimonials"));
const AboutSection = lazy(() => import("@/components/sections/about-section"));
const ContactSection = lazy(() => import("@/components/sections/contact-section"));

export default function Home() {
  return (
    <main className="pt-16">
      <Hero />
      <PlansSection />
      <Features />
      <FaqSection 
        showTitle={true} 
        customColors={{
          backgroundColor: '#277677',
          titleColor: '#FBF9F7',
          subtitleColor: '#FBF9F7'
        }}
      />
      <Suspense fallback={
        <div className="py-20 bg-[#FBF9F7] flex items-center justify-center">
          <div className="text-[#277677] text-lg">Carregando depoimentos...</div>
        </div>
      }>
        <Testimonials />
      </Suspense>
      <Suspense fallback={
        <div className="py-20 bg-[#277677] flex items-center justify-center">
          <div className="text-[#FBF9F7] text-lg">Carregando sobre nós...</div>
        </div>
      }>
        <AboutSection />
      </Suspense>
      <Suspense fallback={
        <div className="py-20 bg-[#FBF9F7] flex items-center justify-center">
          <div className="text-[#277677] text-lg">Carregando contato...</div>
        </div>
      }>
        <ContactSection />
      </Suspense>
    </main>
  );
}
