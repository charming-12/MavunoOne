import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Karibu...", size = "md" }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "size-6",
    md: "size-8",
    lg: "size-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={`${sizeMap[size]} animate-spin text-green-600`} />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
}
