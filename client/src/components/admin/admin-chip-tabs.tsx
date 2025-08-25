import { motion } from "framer-motion";
import { MessageSquare, CreditCard, MapPin, HelpCircle, Settings } from "lucide-react";

interface AdminChipTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const tabs = [
  { value: "contact", label: "Formulários", icon: MessageSquare },
  { value: "plans", label: "Planos", icon: CreditCard },
  { value: "network", label: "Rede", icon: MapPin },
  { value: "faq", label: "FAQ", icon: HelpCircle },

  { value: "settings", label: "Configurações", icon: Settings },
];

const AdminChipTabs = ({ activeTab, onTabChange }: AdminChipTabsProps) => {
  return (
    <div className="px-4 py-6 bg-[#277677] flex items-center flex-wrap gap-2">
      {tabs.map((tab) => (
        <Chip
          key={tab.value}
          tab={tab}
          selected={activeTab === tab.value}
          onSelect={() => onTabChange(tab.value)}
        />
      ))}
    </div>
  );
};

const Chip = ({ tab, selected, onSelect }: { 
  tab: { value: string; label: string; icon: React.ComponentType<any> }; 
  selected: boolean; 
  onSelect: () => void; 
}) => {
  const IconComponent = tab.icon;
  
  return (
    <button
      onClick={onSelect}
      className={`${
        selected
          ? "text-white"
          : "text-[#e5e5e5] hover:text-[#e5e5e5] hover:bg-[#277677]/20"
      } text-sm transition-colors px-3 py-2 rounded-md relative flex items-center gap-2 font-medium`}
    >
      <IconComponent className="h-4 w-4 relative z-10" />
      <span className="relative z-10">{tab.label}</span>
      {selected && (
        <motion.span
          layoutId="pill-tab"
          transition={{ type: "spring", duration: 0.5 }}
          className="absolute inset-0 z-0 bg-gradient-to-r from-[#277677] to-[#145759] rounded-md"
        ></motion.span>
      )}
    </button>
  );
};

export default AdminChipTabs;
