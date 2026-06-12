import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10',
  error: 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10',
  info: 'text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10',
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 border backdrop-blur-sm min-w-[280px] max-w-sm animate-in fade-in slide-in-from-bottom-4 ${colors[toast.type]}`}
            style={{ animationDuration: '0.3s' }}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-sm text-[#f3f2f2] flex-1">{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} className="text-[#5A6680] hover:text-[#f3f2f2] shrink-0">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
