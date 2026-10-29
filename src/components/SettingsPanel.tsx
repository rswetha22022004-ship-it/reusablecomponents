import { useState } from "react";
import Card from "./Card";
import type { CardStyle, DashboardSettings } from "../types/dashboard";

export interface SettingsPanelProps {
  settings: DashboardSettings;
  onChange: <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => void;
  onReset: () => void;
  /** Same card style the dashboard uses, so the panel matches its theme. */
  card?: CardStyle;
  labelColor?: string;
  accentColor?: string;
  borderColor?: string;
}

interface HeightFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  labelColor: string;
  accentColor: string;
}

function HeightField({ label, value, min, max, onChange, labelColor, accentColor }: HeightFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm" style={{ color: labelColor }}>
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums">{value}px</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor }}
      />
    </label>
  );
}

interface ColorFieldsProps {
  label: string;
  colors: string[];
  onChange: (colors: string[]) => void;
  labelColor: string;
  borderColor: string;
}

function ColorFields({ label, colors, onChange, labelColor, borderColor }: ColorFieldsProps) {
  return (
    <div className="flex flex-col gap-1 text-sm" style={{ color: labelColor }}>
      <span>{label}</span>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <input
            key={index}
            type="color"
            value={color}
            aria-label={`${label} ${index + 1}`}
            onChange={(e) => onChange(colors.map((c, i) => (i === index ? e.target.value : c)))}
            className="h-8 w-8 cursor-pointer rounded bg-transparent p-0"
            style={{ border: `1px solid ${borderColor}` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function SettingsPanel({
  settings,
  onChange,
  onReset,
  card,
  labelColor = "#374151",
  accentColor = "#4f46e5",
  borderColor = "#d1d5db",
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);

  const buttonStyle = { color: labelColor, border: `1px solid ${borderColor}` };

  return (
    <Card {...card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold" style={{ color: card?.titleColor }}>
          Customize this dashboard
        </h2>
        <div className="flex gap-2">
          {open && (
            <button type="button" onClick={onReset} className="rounded-md px-3 py-1.5 text-sm" style={buttonStyle}>
              Reset to defaults
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="rounded-md px-3 py-1.5 text-sm"
            style={buttonStyle}
          >
            {open ? "Hide settings" : "Show settings"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col gap-3">
            <HeightField label="Bar chart height" value={settings.barHeight} min={150} max={600}
              onChange={(v) => onChange("barHeight", v)} labelColor={labelColor} accentColor={accentColor} />
            <ColorFields label="Bar colors" colors={settings.barColors}
              onChange={(c) => onChange("barColors", c)} labelColor={labelColor} borderColor={borderColor} />
          </div>

          <div className="flex flex-col gap-3">
            <HeightField label="Line graph height" value={settings.lineHeight} min={150} max={600}
              onChange={(v) => onChange("lineHeight", v)} labelColor={labelColor} accentColor={accentColor} />
            <ColorFields label="Line colors" colors={settings.lineColors}
              onChange={(c) => onChange("lineColors", c)} labelColor={labelColor} borderColor={borderColor} />
          </div>

          <div className="flex flex-col gap-3">
            <HeightField label="Pie chart height" value={settings.pieHeight} min={150} max={600}
              onChange={(v) => onChange("pieHeight", v)} labelColor={labelColor} accentColor={accentColor} />
            <ColorFields label="Pie colors" colors={settings.pieColors}
              onChange={(c) => onChange("pieColors", c)} labelColor={labelColor} borderColor={borderColor} />
          </div>

          <div className="flex flex-col gap-3">
            <HeightField label="Table height" value={settings.tableHeight} min={120} max={600}
              onChange={(v) => onChange("tableHeight", v)} labelColor={labelColor} accentColor={accentColor} />
            <ColorFields label="Table header color" colors={[settings.tableHeaderBackground]}
              onChange={(c) => onChange("tableHeaderBackground", c[0])} labelColor={labelColor} borderColor={borderColor} />
          </div>
        </div>
      )}
    </Card>
  );
}
