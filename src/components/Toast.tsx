import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = {
  id: number;
  message: string;
  type: ToastType;
  timestamp: number;
};

const ToastContext = createContext<{
  showToast: (message: string, type: ToastType) => void;
} | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const newToast = {
      id: nextId++,
      message,
      type,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  // Clean up old toasts
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((toast) => now - toast.timestamp < 5000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`px-4 py-2 rounded shadow-lg text-sm font-medium ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : toast.type === "warning"
                  ? "bg-yellow-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
