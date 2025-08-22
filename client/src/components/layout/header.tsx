import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Planos", href: "/planos" },
    { name: "Rede Credenciada", href: "/rede-credenciada" },
    { name: "Sobre", href: "/sobre" },
    { name: "FAQ", href: "/faq" },
    { name: "Área do Cliente", href: "/area-cliente" },
    { name: "Contato", href: "/contato" },
  ];

  const AnimatedMenuIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    return (
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <motion.span
          className="block w-6 h-0.5 bg-[#FBF9F7] mb-1"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className="block w-6 h-0.5 bg-[#FBF9F7] mb-1"
          animate={{
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className="block w-6 h-0.5 bg-[#FBF9F7]"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 border-b border-border z-50 bg-[#277677]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/unipet-logo.png" alt="Unipet Plan" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div className="relative flex flex-col items-center">
                <Button
                  key={item.name}
                  variant="ghost"
                  className={`text-lg px-4 py-2 rounded-lg transition-all duration-200 text-[#FBF9F7] hover:text-[#E1AC33] hover:bg-transparent focus:bg-transparent active:bg-transparent ${
                    location === item.href ? "font-medium" : ""
                  }`}
                  onClick={() => {
                    // Navegar para a rota usando wouter
                    setLocation(item.href);
                  }}
                >
                  {item.name}
                </Button>
                {location === item.href && (
                  <div className="h-0.5 bg-[#E1AC33] mt-1" style={{ width: `${item.name.length * 0.6}em` }}>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden relative">
            {/* Menu Toggle Button */}
                                      <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative z-50 p-3 focus:outline-none"
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
              <AnimatedMenuIcon isOpen={isMobileMenuOpen} />
            </motion.button>

            {/* Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
            </AnimatePresence>

                         {/* Menu Panel */}
             <AnimatePresence>
               {isMobileMenuOpen && (
                 <motion.div
                   initial={{ x: '100%' }}
                   animate={{ x: 0 }}
                   exit={{ x: '100%' }}
                   transition={{ 
                     type: 'spring', 
                     stiffness: 300, 
                     damping: 30
                   }}
                   className="fixed top-0 right-0 h-full w-80 bg-gradient-to-t from-[#d4d0c8] to-[#FBF9F7] z-40 shadow-lg"
                 >
                   <div className="flex flex-col h-full">
                     {/* Header */}
                     <div className="flex justify-start items-center px-6 py-6 border-b border-[#277677]/10 bg-[#277677]">
                       <h2 className="text-xl font-semibold text-[#FBF9F7]">
                         Menu
                       </h2>
                     </div>

                    {/* Menu Items */}
                    <nav className="flex-1 py-6">
                      <ul className="space-y-2 px-6">
                        {navigation.map((item, index) => (
                          <motion.li
                            key={item.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              delay: index * 0.05,
                              duration: 0.2
                            }}
                          >
                            <motion.button
                              onClick={() => {
                                setLocation(item.href);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-lg text-[#277677] font-medium transition-all duration-200 ${
                                location === item.href 
                                  ? 'bg-[#277677] text-[#FBF9F7] shadow-sm' 
                                  : 'hover:bg-[#277677]/5 hover:text-[#277677]'
                              }`}
                              whileTap={{ scale: 0.98 }}
                            >
                              {item.name}
                            </motion.button>
                          </motion.li>
                        ))}
                      </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-[#277677]/10">
                      <p className="text-[#277677] text-sm text-center">
                        © {new Date().getFullYear()} UNIPET PLAN
                      </p>
                    </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
