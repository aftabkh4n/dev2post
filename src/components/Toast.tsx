import React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm shadow-lg transition-all duration-150 backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900 dark:bg-[#0e1614]/95 dark:border-emerald-500/40 dark:text-emerald-100'
              : toast.type === 'error'
              ? 'bg-rose-50/95 border-rose-300 text-rose-900 dark:bg-[#180e12]/95 dark:border-rose-500/40 dark:text-rose-100'
              : 'bg-sky-50/95 border-sky-300 text-sky-900 dark:bg-[#0e141c]/95 dark:border-sky-500/40 dark:text-sky-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />}
            <span className="font-medium text-xs">{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
