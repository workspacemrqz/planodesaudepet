import Hero from "@/components/sections/hero";
import PlansSection from "@/components/sections/plans-section";
import Features from "@/components/sections/features";
import Testimonials from "@/components/sections/testimonials";
import AboutSection from "@/components/sections/about-section";
import ContactSection from "@/components/sections/contact-section";

export default function Home() {
  return (
    <main className="pt-16">
      <Hero />
      <PlansSection />
      <Features />
      <Testimonials />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
