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
  /** Colour of the per-row Remove button (6-digit hex). */
  removeColor?: string;
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
