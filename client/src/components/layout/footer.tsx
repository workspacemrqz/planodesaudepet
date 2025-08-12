import { Link } from "wouter";
import { Heart, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, MessageSquare } from "lucide-react";

export default function Footer() {
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
    <footer className="bg-[#277677] border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">UNIPET PLAN</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Cuidando da saúde do seu pet com carinho, qualidade e preços acessíveis.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-[#277677] p-2 rounded-full text-white hover:bg-[#277677]/80 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-[#277677] p-2 rounded-full text-white hover:bg-[#277677]/80 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="bg-[#277677] p-2 rounded-full text-white hover:bg-[#277677]/80 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="bg-[#277677] p-2 rounded-full text-white hover:bg-[#277677]/80 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-primary mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-primary mb-6">Serviços</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-default">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-primary mb-6">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-white font-semibold">Telefone</div>
                  <div className="text-white">0800 123 4567</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-white font-semibold">E-mail</div>
                  <div className="text-white">contato@unipetplan.com.br</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="text-white font-semibold">WhatsApp</div>
                  <div className="text-white">(11) 99999-9999</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground text-sm mb-4 md:mb-0">
              © 2024 UNIPET PLAN. Todos os direitos reservados.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <span className="text-muted-foreground">
                CNPJ: 00.000.000/0001-00
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
