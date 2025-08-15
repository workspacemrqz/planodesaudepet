import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, MessageSquare, Clock, Building } from "lucide-react";
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";

export default function Footer() {
  const { settings, shouldShow } = useSiteSettingsWithDefaults();
  
  const quickLinks = [
    { name: "Início", href: "/" },
    { name: "Planos", href: "/planos" },
    { name: "Sobre", href: "/sobre" },
    { name: "Contato", href: "/contato" },
    { name: "FAQ", href: "/faq" },
  ];

  const services = [
    "Consultas Veterinárias",
    "Cirurgias",
    "Exames Laboratoriais", 
    "Emergências 24h",
    "Telemedicina",
  ];

  return (
    <footer className="bg-[#FBF9F7] border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pl-[20px] pr-[20px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-start justify-start mb-4 sm:mb-6">
              <img src="/unipet-logo.png" alt="Unipet Plan" className="h-8 sm:h-10 w-auto" />
            </div>
            <p className="text-[#302e2b] mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
              Cuidando da saúde do seu pet com carinho, qualidade e preços acessíveis.
            </p>
            <div className="flex space-x-3">
              {shouldShow.facebookUrl && (
                <a href={settings.facebookUrl || undefined} target="_blank" rel="noopener noreferrer" className="bg-[#277677] p-2 rounded-full text-white hover:bg-[#277677]/80 transition-colors mobile-touch-target">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {shouldShow.instagramUrl && (
                <a href={settings.instagramUrl || undefined} target="_blank" rel="noopener noreferrer" className="bg-[#277677] p-2 rounded-full text-white hover:bg-[#277677]/80 transition-colors mobile-touch-target">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {shouldShow.linkedinUrl && (
                <a href={settings.linkedinUrl || undefined} target="_blank" rel="noopener noreferrer" className="bg-[#277677] p-2 rounded-full text-white hover:bg-[#277677]/80 transition-colors mobile-touch-target">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {shouldShow.youtubeUrl && (
                <a href={settings.youtubeUrl || undefined} target="_blank" rel="noopener noreferrer" className="bg-[#277677] p-2 rounded-full text-white hover:bg-[#277677]/80 transition-colors mobile-touch-target">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-[#277677] mb-4 sm:mb-6">Links Rápidos</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[#302e2b] hover:text-[#277677] transition-colors text-sm sm:text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-[#277677] mb-4 sm:mb-6">Serviços</h4>
            <ul className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-[#302e2b] hover:text-[#277677] transition-colors cursor-default text-sm sm:text-base">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold text-[#277677] mb-4 sm:mb-6">Contato</h4>
            <div className="space-y-3 sm:space-y-4">
              {shouldShow.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-[#277677] flex-shrink-0" />
                  <div>
                    <div className="text-[#302e2b] font-semibold text-sm sm:text-base">Telefone</div>
                    <div className="text-[#302e2b] text-sm sm:text-base">{settings.phone}</div>
                  </div>
                </div>
              )}
              {shouldShow.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-[#277677] flex-shrink-0" />
                  <div>
                    <div className="text-[#302e2b] font-semibold text-sm sm:text-base">E-mail</div>
                    <div className="text-[#302e2b] text-sm sm:text-base break-all md:break-normal">{settings.email}</div>
                  </div>
                </div>
              )}
              {shouldShow.whatsapp && (
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-4 w-4 text-[#277677] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[#302e2b] font-semibold text-sm sm:text-base">WhatsApp</div>
                    <div className="text-[#302e2b] text-sm sm:text-base">{settings.whatsapp}</div>
                  </div>
                </div>
              )}
              {shouldShow.businessHours && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 text-[#277677] mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[#302e2b] font-semibold text-sm sm:text-base">Horário</div>
                    <div className="text-[#302e2b] text-sm sm:text-base leading-relaxed whitespace-pre-line">{settings.businessHours}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[#302e2b] text-xs sm:text-sm text-center md:text-left">
              <div>© 2024 UNIPET PLAN - Todos os direitos reservados.</div>
              {shouldShow.cnpj && (
                <div className="mt-1">CNPJ: {settings.cnpj}</div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-center">
              <Link href="/politica-privacidade" className="text-[#302e2b] hover:text-[#277677] transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos-uso" className="text-[#302e2b] hover:text-[#277677] transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
