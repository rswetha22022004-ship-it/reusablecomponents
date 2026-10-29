import { useState } from "react";
import type { ColumnDef, TableStyle } from "../types/dashboard";

export interface DataTableProps<T extends object> extends TableStyle {
  columns: readonly ColumnDef<T>[];
  rows: readonly T[];
  /** Returns a stable unique key for a row (e.g. its id). */
  getRowKey: (row: T, index: number) => string | number;
  /** If given, every row gets a Remove button that calls this. */
  onRemoveRow?: (row: T, index: number) => void;
}

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * Generic table. `T` is the row type, so columns are checked against your
 * real data: `key` must be a property of the row.
 */
export default function DataTable<T extends object>({
  columns,
  rows,
  getRowKey,
  onRemoveRow,
  height,
  headerBackground = "#f9fafb",
  headerColor = "#374151",
  rowBackground = "transparent",
  stripedRowBackground,
  hoverRowBackground,
  textColor = "#111827",
  borderColor = "#e5e7eb",
  cellPaddingX = 12,
  cellPaddingY = 10,
  fontSize = 14,
  removeColor = "#e11d48",
  className = "",
  emptyMessage = "No rows to display.",
}: DataTableProps<T>) {
  const [hoveredKey, setHoveredKey] = useState<string | number | null>(null);

  const cellStyle = { padding: `${cellPaddingY}px ${cellPaddingX}px` };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ maxHeight: height, borderColor, borderWidth: 1, borderStyle: "solid", borderRadius: 8 }}
    >
      <table className="w-full border-collapse" style={{ fontSize, color: textColor }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`sticky top-0 whitespace-nowrap font-semibold ${ALIGN_CLASS[col.align ?? "left"]}`}
                style={{
                  ...cellStyle,
                  width: col.width,
                  background: headerBackground,
                  color: headerColor,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                {col.header}
              </th>
            ))}
            {onRemoveRow && (
              <th
                scope="col"
                className="sticky top-0"
                style={{ ...cellStyle, background: headerBackground, borderBottom: `1px solid ${borderColor}` }}
              >
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onRemoveRow ? 1 : 0)} className="text-center" style={{ ...cellStyle, opacity: 0.7 }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => {
              const key = getRowKey(row, rowIndex);
              const isStriped = stripedRowBackground !== undefined && rowIndex % 2 === 1;
              const isHovered = hoverRowBackground !== undefined && hoveredKey === key;
              const background = isHovered
                ? hoverRowBackground
                : isStriped
                  ? stripedRowBackground
                  : rowBackground;

              return (
                <tr
                  key={key}
                  style={{ background }}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  {columns.map((col) => {
                    const raw = row[col.key];
                    const text = col.format ? col.format(raw, row) : String(raw ?? "");
                    const badgeColor = col.badgeColors?.[String(raw)];

                    return (
                      <td
                        key={col.key}
                        className={`${ALIGN_CLASS[col.align ?? "left"]}`}
                        style={{ ...cellStyle, borderBottom: `1px solid ${borderColor}` }}
                      >
                        {badgeColor ? (
                          <span
                            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ color: badgeColor, background: `${badgeColor}26` }}
                          >
                            {text}
                          </span>
                        ) : (
                          text
                        )}
                      </td>
                    );
                  })}
                  {onRemoveRow && (
                    <td className="text-right" style={{ ...cellStyle, borderBottom: `1px solid ${borderColor}` }}>
                      <button
                        type="button"
                        onClick={() => onRemoveRow(row, rowIndex)}
                        aria-label={`Remove row ${key}`}
                        className="rounded px-2 py-0.5 text-xs font-medium hover:opacity-70"
                        style={{ color: removeColor, border: `1px solid ${removeColor}` }}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
