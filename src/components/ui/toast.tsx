'use client';

import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastIdCounter = 0;
const toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = (++toastIdCounter).toString();
  const newToast = { ...toast, id };
  toasts = [...toasts, newToast];
  toastListeners.forEach(listener => listener(toasts));
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(toasts));
  }, 5000);
};

export const toast = {
  success: (title: string, description?: string) => 
    addToast({ title, description, variant: 'default' }),
  error: (title: string, description?: string) => 
    addToast({ title, description, variant: 'destructive' }),
};

export function Toaster() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToastList(newToasts);
    toastListeners.push(listener);
    
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  if (toastList.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={`
            rounded-lg px-4 py-3 shadow-lg animate-slide-up
            ${toast.variant === 'destructive' 
              ? 'bg-red-500 text-white' 
              : 'bg-white dark:bg-gray-800 border'
            }
          `}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-80">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );
} 