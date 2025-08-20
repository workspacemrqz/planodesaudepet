import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, Clock, Building } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSiteSettingsWithDefaults } from "@/hooks/use-site-settings";
import { useWhatsAppRedirect } from "@/hooks/use-whatsapp-redirect";

export default function Footer() {
  const { settings, shouldShow } = useSiteSettingsWithDefaults();
  const { getWhatsAppLink } = useWhatsAppRedirect();
  
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
            <div className="flex space-x-4">
              {shouldShow.facebookUrl && (
                <a href={settings.facebookUrl || undefined} target="_blank" rel="noopener noreferrer" className="text-[#277677]">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {shouldShow.instagramUrl && (
                <a href={settings.instagramUrl || undefined} target="_blank" rel="noopener noreferrer" className="text-[#277677]">
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {shouldShow.linkedinUrl && (
                <a href={settings.linkedinUrl || undefined} target="_blank" rel="noopener noreferrer" className="text-[#277677]">
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {shouldShow.youtubeUrl && (
                <a href={settings.youtubeUrl || undefined} target="_blank" rel="noopener noreferrer" className="text-[#277677]">
                  <Youtube className="h-6 w-6" />
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
                  <span className="text-[#302E2B] cursor-default text-sm sm:text-base">
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
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-[#277677] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#302e2b] font-semibold text-sm sm:text-base">Telefone</div>
                    <div className="text-[#302e2b] text-sm sm:text-base">{settings.phone}</div>
                  </div>
                </div>
              )}
              {shouldShow.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-[#277677] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#302e2b] font-semibold text-sm sm:text-base">E-mail</div>
                    <div className="text-[#302e2b] text-sm sm:text-base break-all md:break-normal">{settings.email}</div>
                  </div>
                </div>
              )}
              {shouldShow.whatsapp && (
                <div className="flex items-start gap-3">
                  <FaWhatsapp className="h-4 w-4 text-[#277677] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#302e2b] font-semibold text-sm sm:text-base">WhatsApp</div>
                    <a 
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#302e2b] text-sm sm:text-base hover:text-[#277677] transition-colors cursor-pointer"
                    >
                      {settings.whatsapp}
                    </a>
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
              <div>© {new Date().getFullYear()} UNIPET PLAN - Todos os direitos reservados.</div>
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
