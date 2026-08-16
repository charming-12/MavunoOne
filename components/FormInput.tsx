import { ReactNode } from "react";

interface FormInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  multiline?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
}

export function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon,
  multiline = false,
  rows = 3,
  options,
}: FormInputProps) {
  const baseClasses =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const errorClasses = error ? "border-red-600 focus:ring-red-600" : "";

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}

        {options ? (
          <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses} ${icon ? "pl-10" : ""}`}
          >
            <option value="">Chagua...</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            className={`${baseClasses} ${errorClasses} ${icon ? "pl-10" : ""} resize-none`}
          ></textarea>
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`${baseClasses} ${errorClasses} ${icon ? "pl-10" : ""}`}
          />
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
