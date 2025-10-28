import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (toast: { message: string; type: ToastType }) => void;
}

const ToasterContext = createContext<ToastContextType | null>(null);

const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(message.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center text-white animate-fade-in-right';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[message.type]}`}>
      <span className="flex-grow">{message.message}</span>
      <button onClick={() => onDismiss(message.id)} className="ml-4 font-bold opacity-70 hover:opacity-100">✕</button>
    </div>
  );
};

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: { message: string; type: ToastType }) => {
    setToasts((currentToasts) => [
      ...currentToasts,
      { id: Date.now(), ...toast },
    ]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToasterContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToasterContext.Provider>
  );
};

export const useToaster = () => {
    const context = useContext(ToasterContext);
    if (!context) {
        throw new Error('useToaster must be used within a ToasterProvider');
    }
    return context;
};
