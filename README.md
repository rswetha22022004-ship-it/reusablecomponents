# Dynamic Admin and User dashboards: architecture and code

Verified with React 19, Recharts 3.10, Tailwind 4, TypeScript and Vite: `tsc --noEmit` and `vite build` both pass.
I did not open the result in a browser, so check the visuals when you run it.

## 1. Architecture

```
types/dashboard.ts      shapes of every prop and config (the contract)
components/*            generic building blocks: no data, no colours, no sizes of their own
config/adminConfig.ts   ALL Admin look and layout (heights, colours, spans, columns)
config/userConfig.ts    ALL User look and layout
data/adminData.ts       Admin data only
data/userData.ts        User data only
pages/*                 thin glue: data + config -> shared components
App.tsx                 switches between the two pages
```

Data flows one way: `config + data  ->  page  ->  props  ->  shared component`.
A component never imports a config or a data file, so it cannot "know" which dashboard it is in.

## 2. How independence is guaranteed

- Two separate config objects, in two separate files, with zero shared references (`npm run check:independence` proves it).
- `deepFreeze` makes each config read-only at runtime, so nothing can mutate one by accident.
- Components have only neutral fallback defaults. Dashboards always pass their own values.
- No dashboard-specific CSS selectors: styling is passed as props and applied inline. Tailwind is used only for structure.

## 3. Props in action

Admin (`adminConfig.ts`):  `bar.chart = { height: 320, colors: ["#6366F1", "#22C55E", "#F59E0B"], ... }`
User  (`userConfig.ts`):   `bar.chart = { height: 220, colors: ["#8B5CF6", "#F97316"], ... }`

Both pages render the same line, only with different props:

```tsx
<BarChart data={data.revenue} {...config.bar.chart} />
```

## 4. Proof that changes stay isolated

Change `height: 320` to `height: 450` in `adminConfig.ts`: only the Admin bar chart grows.
The User page reads `userConfig.ts`, which is a different object, so it is untouched.
To see the same thing without a browser, run `npm run check:independence`.

## 5. Adding a new chart or table without duplicating components

1. Add the data to `adminData.ts` (or `userData.ts`).
2. Add a widget entry to that dashboard's config: title, `span`, and a `chart` or `table` block. Add its type to `DashboardConfig` in `types/dashboard.ts`.
3. In the page, add one `GridItem` containing a `ChartCard` (or `TableCard`) that uses an existing component.

The same `BarChart` can be used ten times with ten configs. A genuinely new kind of chart (say a radar chart) is one new component plus one new config interface, shared by every dashboard.

## 6. Beginner-friendly file guide

| File | What it does |
|---|---|
| `types/dashboard.ts` | Describes the shape of every prop and config. TypeScript uses it to catch typos. |
| `utils/deepFreeze.ts` | Locks a config object so it can't be changed while the app runs. |
| `components/Card.tsx` | A box with an optional title. Colours, border, padding and height come from props. |
| `components/StatsCard.tsx` | One number with a title, icon and up/down trend. `higherIsBetter: false` flips the trend colour for things like "open tickets". |
| `components/Icon.tsx` | A few small SVG icons, picked by name. |
| `components/BarChart.tsx` | Recharts bars. You pass `data`, `xAxisKey` and a `series` list (one bar per series). |
| `components/Graph.tsx` | Recharts lines. Several entries in `series` draw several lines. |
| `components/PieChart.tsx` | Recharts pie/donut. Slice colours come from `colors`. Uses a per-row `fill` instead of the older `<Cell>` pattern. |
| `components/DataTable.tsx` | A generic table. `columns` say what to show, `rows` is the data. It scrolls past `height`. `badgeColors` turns a cell into a coloured pill (use 6-digit hex colours). |
| `components/ChartCard.tsx` | A `Card` that holds any chart you pass in as `chart`. |
| `components/TableCard.tsx` | A `Card` plus `DataTable`, with separate `card` and `table` styles. |
| `components/DashboardLayout.tsx` | Page background, width, header and a responsive grid. `GridItem` sets how many columns a widget spans per screen size. |
| `config/*.ts` | Everything dashboard-specific: colours, heights, columns, grid, spans. |
| `data/*.ts` | Sample data. Swap for API data later (see below). |
| `pages/*.tsx` | Connects data + config to the components. |

## 7. Swapping in real API data

Each page takes an optional `data` prop with the same shape as the sample data:

```tsx
<AdminDashboard data={dataFromApi} />
```

Fetch it in `App.tsx` (or a route) and pass it down. No component changes are needed.

## 8. Setup (only if starting from scratch)

```bash
npm install react react-dom recharts
npm install -D tailwindcss @tailwindcss/vite
```

Tailwind 4: put `@import "tailwindcss";` in `src/index.css` and add the `@tailwindcss/vite` plugin (see `vite.config.ts`).
On Tailwind 3, use the usual `@tailwind` directives instead. No component code changes either way.

---
## 9. Changing settings from the website (runtime settings panel)

Config files are the **starting values**. The settings panel lets a person change heights and colours in the browser:

```
adminConfig.ts  -> settingsFromConfig() -> DEFAULT_SETTINGS  (starting point)
                                              |
useDashboardSettings("dashboard-settings:admin", DEFAULT_SETTINGS)
   keeps the live values in React state and saves them to localStorage
                                              |
applySettings(baseConfig, settings) -> NEW config object -> same shared components
```

Why Admin and User stay independent here too:
- Each page has its own `localStorage` key (`dashboard-settings:admin` and `dashboard-settings:user`).
- Each page has its own React state, so moving an Admin slider re-renders only the Admin page.
- `applySettings` returns a new object and never edits the frozen config files.
- `sanitizeSettings` checks whatever comes back from localStorage (numbers in range, valid 6-digit hex colours) before using it.

Settings are saved per browser. To share them across users or devices, replace the `localStorage` calls in `hooks/useDashboardSettings.ts` with API calls.

To make another value editable (say the line stroke width): add it to `DashboardSettings`, to `settingsFromConfig`, `applySettings` and `sanitizeSettings` in `utils/settings.ts`, then add one input to `SettingsPanel.tsx`.

New files: `hooks/useDashboardSettings.ts`, `utils/settings.ts`, `components/SettingsPanel.tsx`. Changed: both pages and `types/dashboard.ts`.

---
## 10. Adding rows to the table from the website

The Admin table has an **+ Add employee** button. It opens a small form; **Save** adds the employee to the top of the table, and the row is kept in `localStorage`, so it is still there after a refresh.

```
adminFormFields.ts  (which inputs exist)  ->  AddRowForm  (generic form)
                                                  | onSubmit(values)
AdminDashboard: makes id (EMP-009...), checks it with isEmployeeRow()
                                                  |
useSavedRows("dashboard-rows:admin")  ->  rows  ->  TableCard -> DataTable
```

- `AddRowForm` is generic: it only knows the `fields` it is given, never employees. Reuse it for the User tasks table by writing a `userTaskFields` list.
- `useSavedRows` is generic too, and each dashboard passes its own storage key, so the Admin and User tables never mix.
- The id is generated automatically, and `isEmployeeRow` makes sure only valid rows are added or loaded.
- **Restore sample data** puts the original rows back.
- To save on a server later, replace the `localStorage` code in `hooks/useSavedRows.ts` with API calls.

New files: `components/AddRowForm.tsx`, `hooks/useSavedRows.ts`, `config/adminFormFields.ts`.
Changed: `components/TableCard.tsx` (new optional `toolbar` prop), `data/adminData.ts`, `pages/AdminDashboard.tsx`, `types/dashboard.ts`.

---

# 11. Complete source code

### `src/types/dashboard.ts`

```ts
import type { CSSProperties } from "react";

/* ------------------------------------------------------------------ */
/* Generic data shapes                                                 */
/* ------------------------------------------------------------------ */

/** One row of chart data, e.g. { month: "Jan", revenue: 4200 }. */
export type DataRow = Record<string, string | number>;

export type IconName =
  | "users"
  | "money"
  | "orders"
  | "tickets"
  | "tasks"
  | "clock"
  | "calendar";

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

/** Visual options of the Card. Every field is optional. */
export interface CardStyle {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  /** Any CSS box-shadow value. */
  shadow?: string;
  titleColor?: string;
  descriptionColor?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Stats card                                                          */
/* ------------------------------------------------------------------ */

export interface Trend {
  /** Percentage change. Positive = up, negative = down. */
  value: number;
  label?: string;
  /** Set to false when a decrease is good news (e.g. "open tickets"). */
  higherIsBetter?: boolean;
}

export type StatsCardSize = "sm" | "md" | "lg";

export interface StatsCardStyle {
  size?: StatsCardSize;
  background?: string;
  borderColor?: string;
  borderRadius?: number;
  titleColor?: string;
  valueColor?: string;
  iconColor?: string;
  iconBackground?: string;
  positiveColor?: string;
  negativeColor?: string;
  className?: string;
}

/** Plain data for one stats card (no JSX, so it can live in a .ts data file). */
export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  icon: IconName;
  trend?: Trend;
}

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

export interface ChartBaseConfig {
  height: number;
  /** Defaults to "100%" (fills the card). */
  width?: number | `${number}%`;
  colors: readonly string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  /** Inline style for the tooltip bubble (useful for dark / light themes). */
  tooltipStyle?: CSSProperties;
  /** Text shown when `data` is empty. */
  emptyMessage?: string;
}

export interface SeriesDef {
  /** Key inside each data row, e.g. "revenue". */
  dataKey: string;
  /** Human-friendly legend label. Falls back to dataKey. */
  name?: string;
  /** Optional per-series colour. Falls back to `colors[index]`. */
  color?: string;
}

export interface CartesianChartConfig extends ChartBaseConfig {
  xAxisKey: string;
  series: readonly SeriesDef[];
  showGrid?: boolean;
  gridColor?: string;
  axisColor?: string;
}

export interface BarChartConfig extends CartesianChartConfig {
  barRadius?: number;
  barSize?: number;
  stacked?: boolean;
}

export type LineCurve = "linear" | "monotone" | "step";

export interface LineChartConfig extends CartesianChartConfig {
  strokeWidth?: number;
  showDots?: boolean;
  curve?: LineCurve;
}

export interface PieChartConfig extends ChartBaseConfig {
  dataKey: string;
  nameKey: string;
  innerRadius?: number | `${number}%`;
  outerRadius?: number | `${number}%`;
  paddingAngle?: number;
  legendColor?: string;
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

export interface ColumnDef<T extends object> {
  /** Property of the row object to display. */
  key: keyof T & string;
  header: string;
  align?: "left" | "center" | "right";
  width?: number | string;
  /** Turn the cell into a coloured pill: map cell value -> colour. */
  badgeColors?: Readonly<Record<string, string>>;
  /** Format the raw value, e.g. (v) => `$${v}`. */
  format?: (value: T[keyof T], row: T) => string;
}

export interface TableStyle {
  /** Height of the scrolling area. Rows beyond this height scroll. */
  height: number;
  headerBackground?: string;
  headerColor?: string;
  rowBackground?: string;
  stripedRowBackground?: string;
  hoverRowBackground?: string;
  textColor?: string;
  borderColor?: string;
  cellPaddingX?: number;
  cellPaddingY?: number;
  fontSize?: number;
  className?: string;
  emptyMessage?: string;
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export type GridCount = 1 | 2 | 3 | 4 | 5 | 6;

/** A value that can differ per screen size (mobile-first). */
export interface ResponsiveValue<T> {
  base?: T;
  md?: T;
  xl?: T;
}

export interface LayoutConfig {
  pageBackground: string;
  pageTextColor: string;
  titleColor: string;
  subtitleColor: string;
  /** Any CSS width, e.g. "1280px" or "100%". */
  maxWidth: string;
  pagePadding: number;
  /** Gap between grid items, in px. */
  gap: number;
  headerGap?: number;
  /** Number of grid columns at each breakpoint. */
  columns: ResponsiveValue<GridCount>;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Dashboard-level configuration                                       */
/* ------------------------------------------------------------------ */

export interface WidgetBase {
  title: string;
  description?: string;
  /** How many grid columns this widget spans at each breakpoint. */
  span: ResponsiveValue<GridCount>;
  /** Overrides the dashboard's default card style for this one widget. */
  card?: CardStyle;
}

export interface BarWidgetConfig extends WidgetBase {
  chart: BarChartConfig;
}

export interface LineWidgetConfig extends WidgetBase {
  chart: LineChartConfig;
}

export interface PieWidgetConfig extends WidgetBase {
  chart: PieChartConfig;
}

export interface TableWidgetConfig<T extends object> extends WidgetBase {
  columns: readonly ColumnDef<T>[];
  table: TableStyle;
}

/** Everything one dashboard needs, in one typed object. */
export interface DashboardConfig<TRow extends object> {
  title: string;
  subtitle?: string;
  layout: LayoutConfig;
  /** Default card look for the whole dashboard. */
  card: CardStyle;
  statsCard: StatsCardStyle;
  /** How many grid columns each stats card spans. */
  statsSpan: ResponsiveValue<GridCount>;
  bar: BarWidgetConfig;
  line: LineWidgetConfig;
  pie: PieWidgetConfig;
  table: TableWidgetConfig<TRow>;
}

/* ------------------------------------------------------------------ */
/* Runtime settings (changed from the website, saved per dashboard)     */
/* ------------------------------------------------------------------ */

/** The values a person can change live from the settings panel. */
export interface DashboardSettings {
  barHeight: number;
  lineHeight: number;
  pieHeight: number;
  tableHeight: number;
  barColors: string[];
  lineColors: string[];
  pieColors: string[];
  /** 6-digit hex colour, e.g. "#162239". */
  tableHeaderBackground: string;
}

/* ------------------------------------------------------------------ */
/* Add-row form                                                        */
/* ------------------------------------------------------------------ */

/** Describes one input of the "add a row" form. */
export interface FormField<T extends object> {
  /** Property of the row this input fills in. */
  key: keyof T & string;
  label: string;
  type: "text" | "number" | "select";
  /** Required for type "select". */
  options?: readonly string[];
  placeholder?: string;
  /** Defaults to true. */
  required?: boolean;
}
```

### `src/utils/deepFreeze.ts`

```ts
/**
 * Recursively freezes plain objects and arrays so a configuration can never be
 * mutated by accident at runtime. Functions are left alone.
 * The return type is unchanged so TypeScript inference keeps working.
 */
export function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
  }
  return value;
}
```

### `src/utils/settings.ts`

```ts
import type { DashboardConfig, DashboardSettings } from "../types/dashboard";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Starting settings, read from a dashboard's config file. */
export function settingsFromConfig<T extends object>(config: DashboardConfig<T>): DashboardSettings {
  return {
    barHeight: config.bar.chart.height,
    lineHeight: config.line.chart.height,
    pieHeight: config.pie.chart.height,
    tableHeight: config.table.table.height,
    barColors: [...config.bar.chart.colors],
    lineColors: [...config.line.chart.colors],
    pieColors: [...config.pie.chart.colors],
    tableHeaderBackground: config.table.table.headerBackground ?? "#f9fafb",
  };
}

/**
 * Returns a NEW config with the settings applied. The original (frozen)
 * config is never touched, so the other dashboard can never be affected.
 */
export function applySettings<T extends object>(
  config: DashboardConfig<T>,
  s: DashboardSettings,
): DashboardConfig<T> {
  return {
    ...config,
    bar: { ...config.bar, chart: { ...config.bar.chart, height: s.barHeight, colors: s.barColors } },
    line: { ...config.line, chart: { ...config.line.chart, height: s.lineHeight, colors: s.lineColors } },
    pie: { ...config.pie, chart: { ...config.pie.chart, height: s.pieHeight, colors: s.pieColors } },
    table: {
      ...config.table,
      table: { ...config.table.table, height: s.tableHeight, headerBackground: s.tableHeaderBackground },
    },
  };
}

function cleanNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, 100), 800) : fallback;
}

function cleanColor(value: unknown, fallback: string): string {
  return typeof value === "string" && HEX.test(value) ? value : fallback;
}

function cleanColors(value: unknown, fallback: string[]): string[] {
  return fallback.map((fb, i) => cleanColor(Array.isArray(value) ? value[i] : undefined, fb));
}

/** Makes sure whatever came out of localStorage is safe to use. */
export function sanitizeSettings(raw: unknown, defaults: DashboardSettings): DashboardSettings {
  const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    barHeight: cleanNumber(r.barHeight, defaults.barHeight),
    lineHeight: cleanNumber(r.lineHeight, defaults.lineHeight),
    pieHeight: cleanNumber(r.pieHeight, defaults.pieHeight),
    tableHeight: cleanNumber(r.tableHeight, defaults.tableHeight),
    barColors: cleanColors(r.barColors, defaults.barColors),
    lineColors: cleanColors(r.lineColors, defaults.lineColors),
    pieColors: cleanColors(r.pieColors, defaults.pieColors),
    tableHeaderBackground: cleanColor(r.tableHeaderBackground, defaults.tableHeaderBackground),
  };
}
```

### `src/hooks/useDashboardSettings.ts`

```ts
import { useCallback, useEffect, useState } from "react";
import type { DashboardSettings } from "../types/dashboard";
import { sanitizeSettings } from "../utils/settings";

function load(storageKey: string, defaults: DashboardSettings): DashboardSettings {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? sanitizeSettings(JSON.parse(saved), defaults) : defaults;
  } catch {
    return defaults; // storage blocked or corrupt JSON: use the config values
  }
}

/**
 * Live, saved settings for ONE dashboard.
 * Each dashboard passes its own `storageKey`, so Admin and User keep
 * separate state and separate saved values.
 */
export function useDashboardSettings(storageKey: string, defaults: DashboardSettings) {
  const [settings, setSettings] = useState<DashboardSettings>(() => load(storageKey, defaults));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch {
      /* ignore: settings still work for this session */
    }
  }, [storageKey, settings]);

  const update = useCallback(
    <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) =>
      setSettings((current) => ({ ...current, [key]: value })),
    [],
  );

  const reset = useCallback(() => setSettings(defaults), [defaults]);

  return { settings, update, reset };
}
```

### `src/hooks/useSavedRows.ts`

```ts
import { useCallback, useEffect, useState } from "react";

function load<T>(storageKey: string, initialRows: readonly T[], isRow: (value: unknown) => value is T): readonly T[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return initialRows;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every(isRow) ? parsed : initialRows;
  } catch {
    return initialRows;
  }
}

/**
 * Table rows that people can add to from the website, saved in localStorage.
 * Each dashboard passes its own `storageKey`, so tables never mix.
 *
 * Later, swap the localStorage calls for API calls (POST the new row)
 * and nothing else in the app has to change.
 */
export function useSavedRows<T>(
  storageKey: string,
  initialRows: readonly T[],
  isRow: (value: unknown) => value is T,
) {
  const [rows, setRows] = useState<readonly T[]>(() => load(storageKey, initialRows, isRow));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch {
      /* ignore: rows still work for this session */
    }
  }, [storageKey, rows]);

  /** New rows go to the TOP so they are visible straight away. */
  const addRow = useCallback((row: T) => setRows((current) => [row, ...current]), []);

  /** Back to the original sample / API rows. */
  const resetRows = useCallback(() => setRows(initialRows), [initialRows]);

  return { rows, addRow, resetRows };
}
```

### `src/components/Card.tsx`

```tsx
import type { CSSProperties, ReactNode } from "react";
import type { CardStyle } from "../types/dashboard";

export interface CardProps extends CardStyle {
  title?: string;
  description?: string;
  children: ReactNode;
  /** Fixed card height. Leave undefined to size to the content. */
  height?: number | string;
}

/**
 * Generic card container. It has neutral fallbacks only; each dashboard
 * supplies its own look through props (usually spread from its config).
 */
export default function Card({
  title,
  description,
  children,
  height,
  background = "#ffffff",
  borderColor = "#e5e7eb",
  borderWidth = 1,
  borderRadius = 12,
  padding = 16,
  shadow = "none",
  titleColor = "#111827",
  descriptionColor = "#6b7280",
  className = "",
}: CardProps) {
  const style: CSSProperties = {
    background,
    borderColor,
    borderWidth,
    borderStyle: "solid",
    borderRadius,
    padding,
    boxShadow: shadow,
    height,
  };

  return (
    <section
      className={`flex min-w-0 flex-col ${className}`}
      style={style}
    >
      {(title || description) && (
        <header className="mb-3">
          {title && (
            <h2 className="text-base font-semibold" style={{ color: titleColor }}>
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-0.5 text-sm" style={{ color: descriptionColor }}>
              {description}
            </p>
          )}
        </header>
      )}
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </section>
  );
}
```

### `src/components/StatsCard.tsx`

```tsx
import type { ReactNode } from "react";
import type { StatsCardSize, StatsCardStyle, Trend } from "../types/dashboard";

export interface StatsCardProps extends StatsCardStyle {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: Trend;
}

/** Size presets: Tailwind classes are written out in full so Tailwind can see them. */
const SIZE_CLASSES: Record<StatsCardSize, { box: string; value: string; icon: string }> = {
  sm: { box: "p-3 gap-1", value: "text-xl", icon: "h-8 w-8" },
  md: { box: "p-4 gap-1.5", value: "text-2xl", icon: "h-10 w-10" },
  lg: { box: "p-6 gap-2", value: "text-4xl", icon: "h-12 w-12" },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  size = "md",
  background = "#ffffff",
  borderColor = "#e5e7eb",
  borderRadius = 12,
  titleColor = "#6b7280",
  valueColor = "#111827",
  iconColor = "#4f46e5",
  iconBackground = "#eef2ff",
  positiveColor = "#16a34a",
  negativeColor = "#dc2626",
  className = "",
}: StatsCardProps) {
  const sizeClasses = SIZE_CLASSES[size];

  let trendColor = positiveColor;
  let trendText = "";
  if (trend) {
    const isUp = trend.value >= 0;
    const isGood = isUp === (trend.higherIsBetter ?? true);
    trendColor = isGood ? positiveColor : negativeColor;
    trendText = `${isUp ? "▲" : "▼"} ${Math.abs(trend.value)}%`;
  }

  return (
    <div
      className={`flex min-w-0 items-start justify-between ${sizeClasses.box} ${className}`}
      style={{
        background,
        borderColor,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius,
      }}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-sm font-medium" style={{ color: titleColor }}>
          {title}
        </p>
        <p className={`font-semibold tracking-tight ${sizeClasses.value}`} style={{ color: valueColor }}>
          {value}
        </p>
        {trend && (
          <p className="text-xs font-medium" style={{ color: trendColor }}>
            {trendText}
            {trend.label && <span className="ml-1 font-normal opacity-80">{trend.label}</span>}
          </p>
        )}
      </div>
      {icon && (
        <div
          className={`flex shrink-0 items-center justify-center rounded-lg ${sizeClasses.icon}`}
          style={{ color: iconColor, background: iconBackground }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
```

### `src/components/Icon.tsx`

```tsx
import type { IconName } from "../types/dashboard";

const PATHS: Record<IconName, string> = {
  users:
    "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 19v-1a4 4 0 0 0-3-3.87M16 3.13a3.5 3.5 0 0 1 0 6.74",
  money: "M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.6 7 6.5 9.2 9.5 12 10s5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3",
  orders:
    "M6 6h15l-1.5 9h-12zM6 6 5 2H2M9 20.5a1 1 0 1 0 0-.01M18 20.5a1 1 0 1 0 0-.01",
  tickets:
    "M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z",
  tasks: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
};

interface IconProps {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
```

### `src/components/BarChart.tsx`

```tsx
import { useMemo } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BarChartConfig, DataRow } from "../types/dashboard";

export interface BarChartProps extends BarChartConfig {
  data: readonly DataRow[];
}

export default function BarChart({
  data,
  height,
  width = "100%",
  colors,
  xAxisKey,
  series,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  gridColor = "#e5e7eb",
  axisColor = "#6b7280",
  barRadius = 4,
  barSize,
  stacked = false,
  tooltipStyle,
  emptyMessage = "No data to display.",
}: BarChartProps) {
  // Recharts expects a mutable array, so we copy once per data change.
  const chartData = useMemo(() => [...data], [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height, color: axisColor }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsBarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        {showTooltip && <Tooltip contentStyle={tooltipStyle} cursor={{ fill: gridColor, opacity: 0.3 }} />}
        {showLegend && <Legend wrapperStyle={{ color: axisColor, fontSize: 12 }} />}
        {series.map((s, index) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name ?? s.dataKey}
            fill={s.color ?? colors[index % colors.length]}
            stackId={stacked ? "stack" : undefined}
            barSize={barSize}
            radius={stacked ? 0 : [barRadius, barRadius, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

### `src/components/Graph.tsx`

```tsx
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DataRow, LineChartConfig } from "../types/dashboard";

export interface GraphProps extends LineChartConfig {
  data: readonly DataRow[];
}

/** Line graph. Pass several entries in `series` to draw several lines. */
export default function Graph({
  data,
  height,
  width = "100%",
  colors,
  xAxisKey,
  series,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  gridColor = "#e5e7eb",
  axisColor = "#6b7280",
  strokeWidth = 2,
  showDots = true,
  curve = "monotone",
  tooltipStyle,
  emptyMessage = "No data to display.",
}: GraphProps) {
  const chartData = useMemo(() => [...data], [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height, color: axisColor }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsLineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: axisColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
        {showTooltip && <Tooltip contentStyle={tooltipStyle} />}
        {showLegend && <Legend wrapperStyle={{ color: axisColor, fontSize: 12 }} />}
        {series.map((s, index) => {
          const color = s.color ?? colors[index % colors.length];
          return (
            <Line
              key={s.dataKey}
              type={curve}
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              stroke={color}
              strokeWidth={strokeWidth}
              dot={showDots ? { r: 3, fill: color, strokeWidth: 0 } : false}
              activeDot={{ r: 5 }}
            />
          );
        })}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
```

### `src/components/PieChart.tsx`

```tsx
import { useMemo } from "react";
import {
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DataRow, PieChartConfig } from "../types/dashboard";

export interface PieChartProps extends PieChartConfig {
  data: readonly DataRow[];
}

export default function PieChart({
  data,
  height,
  width = "100%",
  colors,
  dataKey,
  nameKey,
  innerRadius = 0,
  outerRadius = "80%",
  paddingAngle = 0,
  showLegend = true,
  showTooltip = true,
  legendColor = "#6b7280",
  tooltipStyle,
  emptyMessage = "No data to display.",
}: PieChartProps) {
  // Give every slice its own colour through the `fill` field.
  // This replaces the older <Cell> pattern and keeps colours fully prop-driven.
  const slices = useMemo(
    () => data.map((row, index) => ({ ...row, fill: colors[index % colors.length] })),
    [data, colors],
  );

  if (slices.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height, color: legendColor }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsPieChart>
        <Pie
          data={slices}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          stroke="none"
        />
        {showTooltip && <Tooltip contentStyle={tooltipStyle} />}
        {showLegend && <Legend wrapperStyle={{ color: legendColor, fontSize: 12 }} />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
```

### `src/components/DataTable.tsx`

```tsx
import { useState } from "react";
import type { ColumnDef, TableStyle } from "../types/dashboard";

export interface DataTableProps<T extends object> extends TableStyle {
  columns: readonly ColumnDef<T>[];
  rows: readonly T[];
  /** Returns a stable unique key for a row (e.g. its id). */
  getRowKey: (row: T, index: number) => string | number;
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
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center" style={{ ...cellStyle, opacity: 0.7 }}>
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
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
```

### `src/components/ChartCard.tsx`

```tsx
import type { ReactNode } from "react";
import Card from "./Card";
import type { CardStyle } from "../types/dashboard";

export interface ChartCardProps extends CardStyle {
  title: string;
  description?: string;
  /** Optional fixed card height. Usually unnecessary: the chart sets its own height. */
  height?: number | string;
  /** Any chart element, e.g. <BarChart ... />, <Graph ... /> or <PieChart ... />. */
  chart: ReactNode;
}

/**
 * Thin wrapper: a Card whose content is a chart. Because the chart is passed in
 * as a prop, a new chart type never needs a new card component.
 */
export default function ChartCard({ chart, ...cardProps }: ChartCardProps) {
  return <Card {...cardProps}>{chart}</Card>;
}
```

### `src/components/TableCard.tsx`

```tsx
import type { ReactNode } from "react";
import Card from "./Card";
import DataTable from "./DataTable";
import type { CardStyle, ColumnDef, TableStyle } from "../types/dashboard";

export interface TableCardProps<T extends object> {
  title: string;
  description?: string;
  columns: readonly ColumnDef<T>[];
  rows: readonly T[];
  getRowKey: (row: T, index: number) => string | number;
  /** Look of the card around the table. */
  card?: CardStyle;
  /** Look of the table itself (height, header colours, row colours...). */
  table: TableStyle;
  /** Optional content shown between the title and the table, e.g. an add-row form. */
  toolbar?: ReactNode;
}

/** Card + DataTable. Card styling and table styling stay separate on purpose. */
export default function TableCard<T extends object>({
  title,
  description,
  columns,
  rows,
  getRowKey,
  card,
  table,
  toolbar,
}: TableCardProps<T>) {
  return (
    <Card title={title} description={description} {...card}>
      {toolbar}
      <DataTable columns={columns} rows={rows} getRowKey={getRowKey} {...table} />
    </Card>
  );
}
```

### `src/components/AddRowForm.tsx`

```tsx
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
```

### `src/components/SettingsPanel.tsx`

```tsx
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
```

### `src/components/DashboardLayout.tsx`

```tsx
import type { ReactNode } from "react";
import type { GridCount, LayoutConfig, ResponsiveValue } from "../types/dashboard";

/**
 * Tailwind only generates classes it can find as complete strings in the
 * source, so "grid-cols-" + n would NOT work. These lookup tables spell every
 * class out in full.
 */
const COLS = {
  base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" },
  md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6" },
  xl: { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6" },
} as const satisfies Record<keyof ResponsiveValue<GridCount>, Record<GridCount, string>>;

const SPANS = {
  base: { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4", 5: "col-span-5", 6: "col-span-6" },
  md: { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4", 5: "md:col-span-5", 6: "md:col-span-6" },
  xl: { 1: "xl:col-span-1", 2: "xl:col-span-2", 3: "xl:col-span-3", 4: "xl:col-span-4", 5: "xl:col-span-5", 6: "xl:col-span-6" },
} as const satisfies Record<keyof ResponsiveValue<GridCount>, Record<GridCount, string>>;

function toClasses(
  value: ResponsiveValue<GridCount>,
  table: typeof COLS | typeof SPANS,
): string {
  const classes: string[] = [];
  if (value.base) classes.push(table.base[value.base]);
  if (value.md) classes.push(table.md[value.md]);
  if (value.xl) classes.push(table.xl[value.xl]);
  return classes.join(" ");
}

/* ------------------------------------------------------------------ */

export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  layout: LayoutConfig;
  children: ReactNode;
}

/** Page shell: background, width, header and a responsive grid for the children. */
export default function DashboardLayout({ title, subtitle, layout, children }: DashboardLayoutProps) {
  return (
    <div
      className={`min-h-screen ${layout.className ?? ""}`}
      style={{ background: layout.pageBackground, color: layout.pageTextColor }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: layout.maxWidth, padding: layout.pagePadding }}
      >
        <header style={{ marginBottom: layout.headerGap ?? 24 }}>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: layout.titleColor }}>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm" style={{ color: layout.subtitleColor }}>
              {subtitle}
            </p>
          )}
        </header>

        <main className={`grid ${toClasses(layout.columns, COLS)}`} style={{ gap: layout.gap }}>
          {children}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export interface GridItemProps {
  span: ResponsiveValue<GridCount>;
  children: ReactNode;
}

/** Wrap any widget in this to control how many grid columns it spans. */
export function GridItem({ span, children }: GridItemProps) {
  return <div className={`min-w-0 ${toClasses(span, SPANS)}`}>{children}</div>;
}
```

### `src/config/adminConfig.ts`

```ts
import type { DashboardConfig } from "../types/dashboard";
import type { EmployeeRow } from "../data/adminData";
import { deepFreeze } from "../utils/deepFreeze";

/**
 * Admin dashboard configuration.
 *
 * - Lives only in this file: the User dashboard never imports it.
 * - The type annotation makes TypeScript check every field.
 * - `deepFreeze` makes the object read-only at runtime, so nothing can mutate it.
 *
 * Try it: change `height: 320` below to `height: 450`. Only the Admin bar chart
 * grows, because only the Admin page reads this object.
 */
export const adminConfig: DashboardConfig<EmployeeRow> = deepFreeze({
  title: "Admin dashboard",
  subtitle: "Company-wide performance at a glance",

  layout: {
    pageBackground: "#eff6ff",
    pageTextColor: "#0f2a5c",
    titleColor: "#1e3a8a",
    subtitleColor: "#2563eb",
    maxWidth: "1360px",
    pagePadding: 32,
    gap: 24,
    headerGap: 28,
    // 1 column on phones, 2 on tablets, 4 on large screens
    columns: { base: 1, md: 2, xl: 4 },
  },

  card: {
    background: "#ffffff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    shadow: "0 4px 14px rgba(37, 99, 235, 0.10)",
    titleColor: "#1e3a8a",
    descriptionColor: "#5b7db1",
  },

  statsCard: {
    size: "md",
    background: "#ffffff",
    borderColor: "#bfdbfe",
    borderRadius: 20,
    titleColor: "#5b7db1",
    valueColor: "#1e3a8a",
    iconColor: "#2563eb",
    iconBackground: "#dbeafe",
    positiveColor: "#059669",
    negativeColor: "#e11d48",
  },
  statsSpan: { base: 1, md: 1, xl: 1 },

  bar: {
    title: "Revenue vs expenses",
    description: "Last six months",
    span: { base: 1, md: 2, xl: 2 },
    chart: {
      height: 320,
      colors: ["#1D4ED8", "#60A5FA", "#93C5FD"],
      xAxisKey: "month",
      series: [
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "expenses", name: "Expenses" },
      ],
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      gridColor: "#dbeafe",
      axisColor: "#5b7db1",
      barRadius: 6,
      tooltipStyle: { background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#0f2a5c" },
    },
  },

  pie: {
    title: "Users by role",
    description: "Share of all accounts",
    span: { base: 1, md: 1, xl: 2 },
    chart: {
      height: 320,
      colors: ["#1E40AF", "#2563EB", "#60A5FA", "#BFDBFE"],
      dataKey: "total",
      nameKey: "role",
      innerRadius: "55%",
      outerRadius: "85%",
      paddingAngle: 3,
      showLegend: true,
      showTooltip: true,
      legendColor: "#5b7db1",
      tooltipStyle: { background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#0f2a5c" },
    },
  },

  line: {
    title: "Traffic and sign-ups",
    description: "Weekly visits and new accounts",
    span: { base: 1, md: 2, xl: 2 },
    chart: {
      height: 300,
      colors: ["#1D4ED8", "#38BDF8"],
      xAxisKey: "week",
      series: [
        { dataKey: "visits", name: "Visits" },
        { dataKey: "signups", name: "Sign-ups" },
      ],
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      gridColor: "#dbeafe",
      axisColor: "#5b7db1",
      strokeWidth: 3,
      showDots: true,
      curve: "monotone",
      tooltipStyle: { background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#0f2a5c" },
    },
  },

  table: {
    title: "Employees",
    description: "Scroll to see everyone",
    span: { base: 1, md: 2, xl: 2 },
    columns: [
      { key: "id", header: "ID", width: 100 },
      { key: "name", header: "Name" },
      { key: "department", header: "Department" },
      { key: "salary", header: "Salary", align: "right", format: (value) => `$${Number(value).toLocaleString("en-US")}` },
      {
        key: "status",
        header: "Status",
        badgeColors: { Active: "#1e40af", "On leave": "#0369a1", Remote: "#2563eb" },
      },
    ],
    table: {
      height: 260,
      headerBackground: "#dbeafe",
      headerColor: "#1e3a8a",
      rowBackground: "#ffffff",
      stripedRowBackground: "#f5f9ff",
      hoverRowBackground: "#eaf2ff",
      textColor: "#0f2a5c",
      borderColor: "#dbeafe",
      cellPaddingX: 14,
      cellPaddingY: 10,
      fontSize: 14,
    },
  },
});
```

### `src/config/adminFormFields.ts`

```ts
import type { FormField } from "../types/dashboard";
import { EMPLOYEE_STATUSES, type EmployeeRow } from "../data/adminData";
import { deepFreeze } from "../utils/deepFreeze";

/**
 * Inputs of the Admin "Add employee" form.
 * The id is NOT here: it is generated automatically (EMP-009, EMP-010 ...).
 */
export const adminEmployeeFields: readonly FormField<EmployeeRow>[] = deepFreeze([
  { key: "name", label: "Name", type: "text", placeholder: "Full name" },
  {
    key: "department",
    label: "Department",
    type: "select",
    options: ["Engineering", "Design", "Finance", "Support", "Marketing", "HR"],
  },
  { key: "role", label: "Role", type: "text", placeholder: "Job title" },
  { key: "salary", label: "Salary", type: "number", placeholder: "e.g. 60000" },
  { key: "status", label: "Status", type: "select", options: EMPLOYEE_STATUSES },
]);
```

### `src/config/userConfig.ts`

```ts
import type { DashboardConfig } from "../types/dashboard";
import type { TaskRow } from "../data/userData";
import { deepFreeze } from "../utils/deepFreeze";

/**
 * User dashboard configuration.
 *
 * Completely separate from adminConfig.ts: different object, different colours,
 * different heights, different grid. Editing this file can never change the
 * Admin dashboard, and the reverse is also true.
 */
export const userConfig: DashboardConfig<TaskRow> = deepFreeze({
  title: "My dashboard",
  subtitle: "Your tasks and time this week",

  layout: {
    pageBackground: "#f5f3ff",
    pageTextColor: "#1e1b4b",
    titleColor: "#2e1065",
    subtitleColor: "#6d28d9",
    maxWidth: "1100px",
    pagePadding: 20,
    gap: 16,
    headerGap: 20,
    // 1 column on phones, 2 on tablets, 3 on large screens
    columns: { base: 1, md: 2, xl: 3 },
  },

  card: {
    background: "#ffffff",
    borderColor: "#ddd6fe",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadow: "0 4px 14px rgba(109, 40, 217, 0.08)",
    titleColor: "#2e1065",
    descriptionColor: "#7c6fa8",
  },

  statsCard: {
    size: "lg",
    background: "#ffffff",
    borderColor: "#ddd6fe",
    borderRadius: 20,
    titleColor: "#7c6fa8",
    valueColor: "#2e1065",
    iconColor: "#7c3aed",
    iconBackground: "#ede9fe",
    positiveColor: "#059669",
    negativeColor: "#e11d48",
  },
  statsSpan: { base: 1, md: 1, xl: 1 },

  line: {
    title: "Hours logged",
    description: "Logged vs planned, by week",
    span: { base: 1, md: 2, xl: 2 },
    chart: {
      height: 220,
      colors: ["#8B5CF6", "#06B6D4"],
      xAxisKey: "week",
      series: [
        { dataKey: "logged", name: "Logged" },
        { dataKey: "planned", name: "Planned" },
      ],
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      gridColor: "#ede9fe",
      axisColor: "#7c6fa8",
      strokeWidth: 2,
      showDots: false,
      curve: "monotone",
    },
  },

  pie: {
    title: "Time by project",
    description: "Hours this week",
    span: { base: 1, md: 1, xl: 1 },
    chart: {
      height: 220,
      colors: ["#8B5CF6", "#06B6D4", "#F97316", "#10B981"],
      dataKey: "hours",
      nameKey: "project",
      innerRadius: 0,
      outerRadius: "80%",
      paddingAngle: 0,
      showLegend: false,
      showTooltip: true,
    },
  },

  bar: {
    title: "Tasks per day",
    description: "Completed and created",
    span: { base: 1, md: 1, xl: 1 },
    chart: {
      height: 220,
      colors: ["#8B5CF6", "#F97316"],
      xAxisKey: "day",
      series: [
        { dataKey: "completed", name: "Completed" },
        { dataKey: "created", name: "Created" },
      ],
      showGrid: false,
      showLegend: true,
      showTooltip: true,
      gridColor: "#ede9fe",
      axisColor: "#7c6fa8",
      barRadius: 10,
      barSize: 14,
    },
  },

  table: {
    title: "My tasks",
    description: "Sorted by what is coming up",
    span: { base: 1, md: 2, xl: 2 },
    columns: [
      { key: "task", header: "Task" },
      { key: "project", header: "Project" },
      { key: "due", header: "Due", align: "right", width: 90 },
      {
        key: "status",
        header: "Status",
        badgeColors: {
          Done: "#059669",
          "In progress": "#7c3aed",
          Blocked: "#e11d48",
          "Not started": "#64748b",
        },
      },
    ],
    table: {
      height: 220,
      headerBackground: "#ede9fe",
      headerColor: "#4c1d95",
      rowBackground: "#ffffff",
      stripedRowBackground: "#faf8ff",
      hoverRowBackground: "#f3efff",
      textColor: "#1e1b4b",
      borderColor: "#ede9fe",
      cellPaddingX: 12,
      cellPaddingY: 8,
      fontSize: 13,
    },
  },
});
```

### `src/data/adminData.ts`

```ts
import type { DataRow, StatItem } from "../types/dashboard";

export const EMPLOYEE_STATUSES = ["Active", "On leave", "Remote"] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export interface EmployeeRow {
  id: string;
  name: string;
  department: string;
  role: string;
  salary: number;
  status: EmployeeStatus;
}

export interface AdminData {
  stats: readonly StatItem[];
  revenue: readonly DataRow[];
  userRoles: readonly DataRow[];
  traffic: readonly DataRow[];
  employees: readonly EmployeeRow[];
}

/**
 * Plain sample data. Later you can replace this object with the result of an
 * API call (same shape) and nothing else needs to change.
 */
export const adminData: AdminData = {
  stats: [
    { id: "users", title: "Total users", value: "12,480", icon: "users", trend: { value: 8.2, label: "vs last month" } },
    { id: "revenue", title: "Revenue", value: "$84,300", icon: "money", trend: { value: 12.5, label: "vs last month" } },
    { id: "orders", title: "Orders", value: "1,932", icon: "orders", trend: { value: -2.1, label: "vs last month" } },
    { id: "tickets", title: "Open tickets", value: 47, icon: "tickets", trend: { value: -5, label: "vs last week", higherIsBetter: false } },
  ],
  revenue: [
    { month: "Jan", revenue: 42000, expenses: 31000 },
    { month: "Feb", revenue: 48500, expenses: 33000 },
    { month: "Mar", revenue: 51000, expenses: 36500 },
    { month: "Apr", revenue: 46000, expenses: 34000 },
    { month: "May", revenue: 58000, expenses: 38000 },
    { month: "Jun", revenue: 64500, expenses: 40500 },
  ],
  userRoles: [
    { role: "Customers", total: 9800 },
    { role: "Staff", total: 1450 },
    { role: "Managers", total: 780 },
    { role: "Admins", total: 450 },
  ],
  traffic: [
    { week: "W1", visits: 5200, signups: 310 },
    { week: "W2", visits: 6100, signups: 380 },
    { week: "W3", visits: 5800, signups: 350 },
    { week: "W4", visits: 7400, signups: 460 },
    { week: "W5", visits: 8100, signups: 520 },
    { week: "W6", visits: 7900, signups: 495 },
  ],
  employees: [
    { id: "EMP-001", name: "Priya Raman", department: "Engineering", role: "Tech lead", salary: 98000, status: "Active" },
    { id: "EMP-002", name: "Arjun Mehta", department: "Design", role: "Product designer", salary: 76000, status: "Remote" },
    { id: "EMP-003", name: "Sana Iqbal", department: "Finance", role: "Accountant", salary: 64000, status: "Active" },
    { id: "EMP-004", name: "Daniel Okafor", department: "Support", role: "Support lead", salary: 58000, status: "On leave" },
    { id: "EMP-005", name: "Meera Nair", department: "Engineering", role: "Backend engineer", salary: 88000, status: "Active" },
    { id: "EMP-006", name: "Lucas Weber", department: "Marketing", role: "Growth manager", salary: 72000, status: "Remote" },
    { id: "EMP-007", name: "Aisha Khan", department: "HR", role: "People partner", salary: 61000, status: "Active" },
    { id: "EMP-008", name: "Tomas Silva", department: "Engineering", role: "QA engineer", salary: 69000, status: "On leave" },
  ],
};

/** Runtime check used when reading saved rows back from localStorage. */
export function isEmployeeRow(value: unknown): value is EmployeeRow {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.department === "string" &&
    typeof r.role === "string" &&
    typeof r.salary === "number" &&
    typeof r.status === "string" &&
    (EMPLOYEE_STATUSES as readonly string[]).includes(r.status)
  );
}

/** EMP-009, EMP-010 ... one higher than the biggest existing number. */
export function nextEmployeeId(rows: readonly EmployeeRow[]): string {
  const highest = rows.reduce((max, row) => {
    const match = /^EMP-(\d+)$/.exec(row.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `EMP-${String(highest + 1).padStart(3, "0")}`;
}
```

### `src/data/userData.ts`

```ts
import type { DataRow, StatItem } from "../types/dashboard";

export interface TaskRow {
  id: string;
  task: string;
  project: string;
  due: string;
  status: "Done" | "In progress" | "Blocked" | "Not started";
}

export interface UserData {
  stats: readonly StatItem[];
  tasksByDay: readonly DataRow[];
  timeByProject: readonly DataRow[];
  hoursByWeek: readonly DataRow[];
  tasks: readonly TaskRow[];
}

/** Sample data for the signed-in user. Replace with an API response later. */
export const userData: UserData = {
  stats: [
    { id: "done", title: "Tasks done this week", value: 18, icon: "tasks", trend: { value: 12, label: "vs last week" } },
    { id: "hours", title: "Hours logged", value: "32.5 h", icon: "clock", trend: { value: -3.4, label: "vs last week" } },
    { id: "due", title: "Due in 3 days", value: 4, icon: "calendar" },
  ],
  tasksByDay: [
    { day: "Mon", completed: 4, created: 3 },
    { day: "Tue", completed: 3, created: 5 },
    { day: "Wed", completed: 6, created: 2 },
    { day: "Thu", completed: 2, created: 4 },
    { day: "Fri", completed: 3, created: 1 },
  ],
  timeByProject: [
    { project: "Website refresh", hours: 12 },
    { project: "Mobile app", hours: 9 },
    { project: "Research", hours: 6 },
    { project: "Admin", hours: 5.5 },
  ],
  hoursByWeek: [
    { week: "W1", logged: 28, planned: 32 },
    { week: "W2", logged: 34, planned: 32 },
    { week: "W3", logged: 30, planned: 32 },
    { week: "W4", logged: 36, planned: 32 },
    { week: "W5", logged: 33, planned: 32 },
    { week: "W6", logged: 32.5, planned: 32 },
  ],
  tasks: [
    { id: "T-101", task: "Write onboarding copy", project: "Website refresh", due: "Oct 31", status: "In progress" },
    { id: "T-102", task: "Fix login redirect", project: "Mobile app", due: "Oct 30", status: "Blocked" },
    { id: "T-103", task: "Interview notes summary", project: "Research", due: "Nov 02", status: "Not started" },
    { id: "T-104", task: "Submit expense report", project: "Admin", due: "Oct 29", status: "Done" },
    { id: "T-105", task: "Update pricing page", project: "Website refresh", due: "Nov 03", status: "In progress" },
    { id: "T-106", task: "Review pull requests", project: "Mobile app", due: "Oct 30", status: "Done" },
    { id: "T-107", task: "Plan next sprint", project: "Mobile app", due: "Nov 04", status: "Not started" },
  ],
};
```

### `src/pages/AdminDashboard.tsx`

```tsx
import { useMemo } from "react";
import type { DataRow } from "../types/dashboard";
import AddRowForm from "../components/AddRowForm";
import BarChart from "../components/BarChart";
import ChartCard from "../components/ChartCard";
import DashboardLayout, { GridItem } from "../components/DashboardLayout";
import Graph from "../components/Graph";
import Icon from "../components/Icon";
import PieChart from "../components/PieChart";
import SettingsPanel from "../components/SettingsPanel";
import StatsCard from "../components/StatsCard";
import TableCard from "../components/TableCard";
import { adminConfig as baseConfig } from "../config/adminConfig";
import { adminEmployeeFields } from "../config/adminFormFields";
import { adminData, isEmployeeRow, nextEmployeeId, type AdminData } from "../data/adminData";
import { useDashboardSettings } from "../hooks/useDashboardSettings";
import { useSavedRows } from "../hooks/useSavedRows";
import { applySettings, settingsFromConfig } from "../utils/settings";

// Each dashboard has its own defaults and its own localStorage key.
const DEFAULT_SETTINGS = settingsFromConfig(baseConfig);
const STORAGE_KEY = "dashboard-settings:admin";
const ROWS_KEY = "dashboard-rows:admin";

interface AdminDashboardProps {
  /** Defaults to the sample data. Pass real API data here later. */
  data?: AdminData;
}

export default function AdminDashboard({ data = adminData }: AdminDashboardProps) {
  const { settings, update, reset } = useDashboardSettings(STORAGE_KEY, DEFAULT_SETTINGS);
  // Config file values + whatever the person changed on the website.
  const config = useMemo(() => applySettings(baseConfig, settings), [settings]);

  // Employees: starts from `data.employees`, plus anything added on the website.
  const { rows: employees, addRow, resetRows } = useSavedRows(ROWS_KEY, data.employees, isEmployeeRow);

  const handleAddEmployee = (values: DataRow) => {
    const row = { id: nextEmployeeId(employees), ...values };
    if (isEmployeeRow(row)) addRow(row);
  };

  return (
    <DashboardLayout title={config.title} subtitle={config.subtitle} layout={config.layout}>
      <GridItem span={config.layout.columns}>
        <SettingsPanel
          settings={settings}
          onChange={update}
          onReset={reset}
          card={config.card}
          labelColor={config.layout.pageTextColor}
          accentColor={config.statsCard.iconColor}
          borderColor={config.card.borderColor}
        />
      </GridItem>

      {data.stats.map((stat) => (
        <GridItem key={stat.id} span={config.statsSpan}>
          <StatsCard
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={<Icon name={stat.icon} />}
            {...config.statsCard}
          />
        </GridItem>
      ))}

      <GridItem span={config.bar.span}>
        <ChartCard
          title={config.bar.title}
          description={config.bar.description}
          {...config.card}
          {...config.bar.card}
          chart={<BarChart data={data.revenue} {...config.bar.chart} />}
        />
      </GridItem>

      <GridItem span={config.pie.span}>
        <ChartCard
          title={config.pie.title}
          description={config.pie.description}
          {...config.card}
          {...config.pie.card}
          chart={<PieChart data={data.userRoles} {...config.pie.chart} />}
        />
      </GridItem>

      <GridItem span={config.line.span}>
        <ChartCard
          title={config.line.title}
          description={config.line.description}
          {...config.card}
          {...config.line.card}
          chart={<Graph data={data.traffic} {...config.line.chart} />}
        />
      </GridItem>

      <GridItem span={config.table.span}>
        <TableCard
          title={config.table.title}
          description={config.table.description}
          card={{ ...config.card, ...config.table.card }}
          table={config.table.table}
          columns={config.table.columns}
          rows={employees}
          toolbar={
            <AddRowForm
              fields={adminEmployeeFields}
              onSubmit={handleAddEmployee}
              onReset={resetRows}
              buttonLabel="Add employee"
              labelColor={config.card.descriptionColor}
              inputBackground={config.table.table.rowBackground}
              inputBorderColor={config.table.table.borderColor}
              inputTextColor={config.table.table.textColor}
              accentColor={config.statsCard.iconColor}
            />
          }
          getRowKey={(row) => row.id}
        />
      </GridItem>
    </DashboardLayout>
  );
}
```

### `src/pages/UserDashboard.tsx`

```tsx
import { useMemo } from "react";
import BarChart from "../components/BarChart";
import ChartCard from "../components/ChartCard";
import DashboardLayout, { GridItem } from "../components/DashboardLayout";
import Graph from "../components/Graph";
import Icon from "../components/Icon";
import PieChart from "../components/PieChart";
import SettingsPanel from "../components/SettingsPanel";
import StatsCard from "../components/StatsCard";
import TableCard from "../components/TableCard";
import { userConfig as baseConfig } from "../config/userConfig";
import { userData, type UserData } from "../data/userData";
import { useDashboardSettings } from "../hooks/useDashboardSettings";
import { applySettings, settingsFromConfig } from "../utils/settings";

// Each dashboard has its own defaults and its own localStorage key.
const DEFAULT_SETTINGS = settingsFromConfig(baseConfig);
const STORAGE_KEY = "dashboard-settings:user";

interface UserDashboardProps {
  /** Defaults to the sample data. Pass real API data here later. */
  data?: UserData;
}

export default function UserDashboard({ data = userData }: UserDashboardProps) {
  const { settings, update, reset } = useDashboardSettings(STORAGE_KEY, DEFAULT_SETTINGS);
  // Config file values + whatever the person changed on the website.
  const config = useMemo(() => applySettings(baseConfig, settings), [settings]);

  return (
    <DashboardLayout title={config.title} subtitle={config.subtitle} layout={config.layout}>
      <GridItem span={config.layout.columns}>
        <SettingsPanel
          settings={settings}
          onChange={update}
          onReset={reset}
          card={config.card}
          labelColor={config.layout.pageTextColor}
          accentColor={config.statsCard.iconColor}
          borderColor={config.card.borderColor}
        />
      </GridItem>

      {data.stats.map((stat) => (
        <GridItem key={stat.id} span={config.statsSpan}>
          <StatsCard
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={<Icon name={stat.icon} />}
            {...config.statsCard}
          />
        </GridItem>
      ))}

      {/* The User page orders its widgets differently: line chart first. */}
      <GridItem span={config.line.span}>
        <ChartCard
          title={config.line.title}
          description={config.line.description}
          {...config.card}
          {...config.line.card}
          chart={<Graph data={data.hoursByWeek} {...config.line.chart} />}
        />
      </GridItem>

      <GridItem span={config.pie.span}>
        <ChartCard
          title={config.pie.title}
          description={config.pie.description}
          {...config.card}
          {...config.pie.card}
          chart={<PieChart data={data.timeByProject} {...config.pie.chart} />}
        />
      </GridItem>

      <GridItem span={config.bar.span}>
        <ChartCard
          title={config.bar.title}
          description={config.bar.description}
          {...config.card}
          {...config.bar.card}
          chart={<BarChart data={data.tasksByDay} {...config.bar.chart} />}
        />
      </GridItem>

      <GridItem span={config.table.span}>
        <TableCard
          title={config.table.title}
          description={config.table.description}
          card={{ ...config.card, ...config.table.card }}
          table={config.table.table}
          columns={config.table.columns}
          rows={data.tasks}
          getRowKey={(row) => row.id}
        />
      </GridItem>
    </DashboardLayout>
  );
}
```

### `src/App.tsx`

```tsx
import { useState } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

type View = "admin" | "user";

/**
 * Tiny view switcher so you can compare both dashboards.
 * In a real app you would use a router (e.g. React Router) instead.
 */
export default function App() {
  const [view, setView] = useState<View>("admin");

  return (
    <>
      <nav
        className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-black/80 p-1 text-sm shadow-lg"
        aria-label="Switch dashboard"
      >
        {(["admin", "user"] as const).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setView(name)}
            aria-pressed={view === name}
            className={`rounded-full px-4 py-1.5 font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              view === name ? "bg-white text-black" : "text-white/80 hover:text-white"
            }`}
          >
            {name}
          </button>
        ))}
      </nav>

      {view === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
}
```

### `src/main.tsx`

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### `src/index.css`

```css
@import "tailwindcss";

/* Intentionally minimal: no dashboard-specific selectors live here.
   All Admin / User styling is passed through props. */
body {
  margin: 0;
}
```

### `scripts/check-independence.ts`

```ts
import { adminConfig } from "../src/config/adminConfig";
import { userConfig } from "../src/config/userConfig";

/** Collect every object/array reference inside a value. */
function collect(value: unknown, seen = new Set<object>()): Set<object> {
  if (value !== null && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    Object.values(value as Record<string, unknown>).forEach((v) => collect(v, seen));
  }
  return seen;
}

const adminRefs = collect(adminConfig);
const userRefs = collect(userConfig);
const shared = [...adminRefs].filter((ref) => userRefs.has(ref));

console.log("Admin bar height:", adminConfig.bar.chart.height);
console.log("User  bar height:", userConfig.bar.chart.height);
console.log("Shared object references between configs:", shared.length);
console.log("Admin config frozen:", Object.isFrozen(adminConfig.bar.chart));

try {
  (adminConfig.bar.chart as { height: number }).height = 999;
} catch {
  console.log("Mutation attempt rejected (strict mode).");
}
console.log("Admin bar height after attempted mutation:", adminConfig.bar.chart.height);
console.log("User  bar height after attempted mutation:", userConfig.bar.chart.height);

if (shared.length > 0) process.exit(1);

/* ---- runtime settings: applying Admin settings must not touch any config ---- */
import { applySettings, settingsFromConfig } from "../src/utils/settings";

const adminSettings = { ...settingsFromConfig(adminConfig), barHeight: 500, barColors: ["#ff0000", "#00ff00", "#0000ff"] };
const changedAdmin = applySettings(adminConfig, adminSettings);

console.log("\nAdmin bar height with settings applied:", changedAdmin.bar.chart.height);
console.log("Admin base config still:", adminConfig.bar.chart.height);
console.log("User  config still:", userConfig.bar.chart.height);

if (adminConfig.bar.chart.height !== 320 || userConfig.bar.chart.height !== 220 || changedAdmin.bar.chart.height !== 500) {
  process.exit(1);
}
```
