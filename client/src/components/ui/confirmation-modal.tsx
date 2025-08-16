import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  icon?: ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  icon
}: ConfirmationModalProps) {
  // Use the body scroll lock hook
  useBodyScrollLock(isOpen);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Modal */}
      <div className="relative bg-[#FBF9F7] rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#277677]/10">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 text-[#277677]">
                {icon}
              </div>
            )}
            <h2 className="text-lg font-semibold text-[#277677]">
              {title}
            </h2>
          </div>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-[#302e2b] hover:text-[#277677] transition-colors disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#302e2b] leading-relaxed">
            {message}
          </p>
          <p className="text-sm text-[#302e2b]/70 mt-2">
            Esta ação é irreversível.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            variant="outline"
            className="flex-1 bg-[#E1AC33] text-[#FBF9F7] border-[#E1AC33] hover:bg-[#E1AC33] hover:text-[#FBF9F7] focus:bg-[#E1AC33] focus:text-[#FBF9F7] active:bg-[#E1AC33] active:text-[#FBF9F7]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-[#277677] text-[#FBF9F7]"
          >
            {isLoading ? "Processando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}