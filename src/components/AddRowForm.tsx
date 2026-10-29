import { useId, useState, type FormEvent } from "react";
import type { DataRow, FormField } from "../types/dashboard";

export interface AddRowFormProps<T extends object> {
  fields: readonly FormField<T>[];
  /** Called with the cleaned values: numbers are real numbers, text is trimmed. */
  onSubmit: (values: DataRow) => void;
  /** If given, shows a "Restore sample data" button. */
  onReset?: () => void;
  buttonLabel?: string;
  labelColor?: string;
  inputBackground?: string;
  inputBorderColor?: string;
  inputTextColor?: string;
  accentColor?: string;
  accentTextColor?: string;
}

function emptyValues<T extends object>(fields: readonly FormField<T>[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    values[field.key] = field.type === "select" ? (field.options?.[0] ?? "") : "";
  }
  return values;
}

/** Generic "add a row" form. It only knows about `fields`, never about employees. */
export default function AddRowForm<T extends object>({
  fields,
  onSubmit,
  onReset,
  buttonLabel = "Add row",
  labelColor = "#374151",
  inputBackground = "#ffffff",
  inputBorderColor = "#d1d5db",
  inputTextColor = "#111827",
  accentColor = "#4f46e5",
  accentTextColor = "#ffffff",
}: AddRowFormProps<T>) {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => emptyValues(fields));
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const cleaned: DataRow = {};

    for (const field of fields) {
      const raw = (values[field.key] ?? "").trim();
      if (field.required !== false && raw === "") {
        setError(`${field.label} is required.`);
        return;
      }
      if (field.type === "number") {
        const number = Number(raw);
        if (!Number.isFinite(number) || number < 0) {
          setError(`${field.label} must be a valid number.`);
          return;
        }
        cleaned[field.key] = number;
      } else {
        cleaned[field.key] = raw;
      }
    }

    setError("");
    onSubmit(cleaned);
    setValues(emptyValues(fields));
  };

  const outlineButton = { color: labelColor, border: `1px solid ${inputBorderColor}` };

  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded-md px-3 py-1.5 text-sm font-medium"
          style={{ background: accentColor, color: accentTextColor }}
        >
          {open ? "Close form" : `+ ${buttonLabel}`}
        </button>
        {onReset && (
          <button type="button" onClick={onReset} className="rounded-md px-3 py-1.5 text-sm" style={outlineButton}>
            Restore sample data
          </button>
        )}
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
          noValidate
        >
          {fields.map((field) => {
            const inputId = `${formId}-${field.key}`;
            const common = {
              id: inputId,
              value: values[field.key] ?? "",
              className: "rounded-md px-2.5 py-1.5 text-sm",
              style: { background: inputBackground, color: inputTextColor, border: `1px solid ${inputBorderColor}` },
            };
            return (
              <div key={field.key} className="flex flex-col gap-1">
                <label htmlFor={inputId} className="text-sm" style={{ color: labelColor }}>
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select {...common} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...common}
                    type={field.type}
                    min={field.type === "number" ? 0 : undefined}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  />
                )}
              </div>
            );
          })}

          <div className="flex items-end gap-3 sm:col-span-2 xl:col-span-3">
            <button
              type="submit"
              className="rounded-md px-4 py-1.5 text-sm font-medium"
              style={{ background: accentColor, color: accentTextColor }}
            >
              Save
            </button>
            {error && (
              <p role="alert" className="text-sm" style={{ color: "#e11d48" }}>
                {error}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
