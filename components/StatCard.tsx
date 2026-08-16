import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  borderColor?: "green" | "yellow" | "red" | "blue" | "purple";
  valueColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  borderColor = "green",
  valueColor = "gray",
}: StatCardProps) {
  const borderColorMap = {
    green: "border-green-600",
    yellow: "border-yellow-600",
    red: "border-red-600",
    blue: "border-blue-600",
    purple: "border-purple-600",
  };

  const textColorMap = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${borderColorMap[borderColor]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className={`text-2xl font-bold ${valueColor === "gray" ? "text-gray-900" : textColorMap[borderColor as keyof typeof textColorMap]} mt-2`}>
            {value}
          </p>
          {subtitle && <p className="text-gray-500 text-xs mt-2">{subtitle}</p>}
        </div>
        {icon && <div className={`${textColorMap[borderColor as keyof typeof textColorMap]} opacity-80`}>{icon}</div>}
      </div>
    </div>
  );
}
