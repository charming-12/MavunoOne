import { ReactNode } from "react";

interface Column<T extends Record<string, unknown>> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: string | number | boolean | null | undefined) => ReactNode;
  align?: "left" | "center" | "right";
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  empty = "Hakuna data",
  onRowClick,
}: TableProps<T>) {
  const alignMap = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-6 py-3 text-sm font-semibold text-gray-900 ${alignMap[col.align || "left"]}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-600">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-600">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={String(idx)}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col) => {
                  const rawValue = row[col.key];
                  const cellValue = typeof rawValue === "string" || typeof rawValue === "number" || typeof rawValue === "boolean"
                    ? rawValue
                    : rawValue == null
                      ? undefined
                      : String(rawValue);

                  return (
                    <td
                      key={String(col.key)}
                      className={`px-6 py-4 text-sm text-gray-900 ${alignMap[col.align || "left"]}`}
                    >
                      {col.render ? col.render(cellValue) : cellValue}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
