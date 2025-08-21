declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = ComponentType<LucideProps>;
  
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Mail: LucideIcon;
  export const Phone: LucideIcon;
  export const MapPin: LucideIcon;
  export const Calendar: LucideIcon;
  export const Plus: LucideIcon;
  export const Edit: LucideIcon;
  export const Trash2: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const GripVertical: LucideIcon;
  export const Star: LucideIcon;
  export const Search: LucideIcon;
  export const Filter: LucideIcon;
  export const X: LucideIcon;
  export const CreditCard: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Settings: LucideIcon;
  export const Loader2: LucideIcon;
  export const MoreHorizontal: LucideIcon;
}