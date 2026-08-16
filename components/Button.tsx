import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  type = "button",
}: ButtonProps) {
  const variantMap = {
    primary: "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:bg-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400",
    success: "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400",
  };

  const sizeMap = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantMap[variant]}
        ${sizeMap[size]}
        ${fullWidth ? "w-full" : ""}
        rounded-lg font-semibold transition flex items-center justify-center gap-2
        disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
