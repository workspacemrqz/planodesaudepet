import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, CreditCard, MapPin, HelpCircle, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MenuOption {
  cname: string;
  code: string;
  icon: React.ForwardRefExoticComponent<any>;
}

interface AdminCascadeMenuProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const menuOptions = [
  { cname: 'Formulários', code: 'contact', icon: MessageSquare },
  { cname: 'FAQ', code: 'faq', icon: HelpCircle },
  { cname: 'Planos', code: 'plans', icon: CreditCard },
  { cname: 'Rede Credenciada', code: 'network', icon: MapPin },
  { cname: 'Configurações', code: 'settings', icon: Settings },
];

export default function AdminCascadeMenu({ activeTab, onTabChange }: AdminCascadeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Fechar dropdown ao clicar fora ou na sombra
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleOptionClick = (code: string) => {
    onTabChange(code);
    setIsOpen(false);
  };

  const selectedOption = menuOptions.find(option => option.code === activeTab) || menuOptions[0];
  const SelectedIcon = selectedOption.icon;

  return (
    <div className="w-full space-y-2">
      <div className="text-sm font-medium text-[#FBF9F7] mb-3">
        Menu de Navegação
      </div>
      
      <div className="relative" ref={dropdownRef}>
        {/* Botão do Dropdown */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-[#FBF9F7] transition-all duration-200 shadow-md"
          style={{
            background: 'linear-gradient(to top, #1c6363, #277677)'
          }}
        >
          <div className="flex items-center gap-3">
            <SelectedIcon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{selectedOption.cname}</span>
          </div>
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </button>

        {/* Lista Dropdown */}
        {isOpen && (
          <>
            {/* Sombra de fundo - apenas no mobile */}
            {isMobile && (
              <div 
                className="fixed inset-0 bg-[#060606] bg-opacity-50 z-40"
                style={{ 
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 25px 50px -12px rgba(6, 6, 6, 0.8)'
                }}
              />
            )}
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#145759] border border-[#277677] rounded-lg shadow-2xl z-50 overflow-hidden">
              {menuOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive = activeTab === option.code;
                
                return (
                  <button
                    key={option.code}
                    onClick={() => handleOptionClick(option.code)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-b border-[#277677]/20 last:border-b-0",
                      isActive 
                        ? "text-[#FBF9F7]"
                        : "text-[#FBF9F7]"
                    )}
                    style={{
                      background: isActive 
                        ? 'linear-gradient(to top, #1c6363, #277677)'
                        : 'linear-gradient(to top, #1c6363, #277677)'
                    }}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{option.cname}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}