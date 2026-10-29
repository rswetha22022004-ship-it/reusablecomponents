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
