import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { ReactNode } from "react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string | ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
}

export function Alert({
  type,
  title,
  message,
  onClose,
  dismissible = true,
}: AlertProps) {
  const typeMap = {
    success: {
      bg: "bg-green-50",
      border: "border-green-300",
      icon: <CheckCircle className="text-green-600" size={20} />,
      textTitle: "text-green-900",
      textMessage: "text-green-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-300",
      icon: <AlertCircle className="text-red-600" size={20} />,
      textTitle: "text-red-900",
      textMessage: "text-red-800",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      icon: <AlertTriangle className="text-yellow-600" size={20} />,
      textTitle: "text-yellow-900",
      textMessage: "text-yellow-800",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      icon: <Info className="text-blue-600" size={20} />,
      textTitle: "text-blue-900",
      textMessage: "text-blue-800",
    },
  };

  const styles = typeMap[type];

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex gap-3`}>
      <div className="flex-shrink-0">{styles.icon}</div>
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${styles.textTitle}`}>{title}</h3>}
        <p className={`text-sm ${styles.textMessage}`}>{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${styles.textMessage} hover:opacity-70 transition`}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
