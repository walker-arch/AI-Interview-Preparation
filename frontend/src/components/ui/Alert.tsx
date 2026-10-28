'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const alertStyles = {
  success: {
    container: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    title: 'text-emerald-800 dark:text-emerald-200',
    message: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-800 dark:text-amber-200',
    message: 'text-amber-700 dark:text-amber-300',
  },
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-800 dark:text-red-200',
    message: 'text-red-700 dark:text-red-300',
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300',
  },
};

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

export default function Alert({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const styles = alertStyles[type];
  const Icon = icons[type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border animate-fade-in',
        styles.container,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('text-sm font-semibold mb-0.5', styles.title)}>{title}</p>}
        <p className={cn('text-sm', styles.message)}>{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className={cn('flex-shrink-0 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5', styles.icon)}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Toast notification system
interface Toast {
  id: string;
  type: AlertType;
  message: string;
  title?: string;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function showToast(type: AlertType, message: string, title?: string) {
  const id = Math.random().toString(36).substr(2, 9);
  toasts.push({ id, type, message, title });
  notifyListeners();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, 5000);
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setCurrentToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {currentToasts.map((toast) => (
        <div key={toast.id} className="toast-enter shadow-lg rounded-xl">
          <Alert
            type={toast.type}
            message={toast.message}
            title={toast.title}
            dismissible
            onDismiss={() => {
              toasts = toasts.filter((t) => t.id !== toast.id);
              notifyListeners();
            }}
          />
        </div>
      ))}
    </div>
  );
}
