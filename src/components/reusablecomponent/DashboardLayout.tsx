import type { ReactNode } from "react";
import type { GridCount, LayoutConfig, ResponsiveValue } from "../../types/dashboard";


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


export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  layout: LayoutConfig;
  children: ReactNode;
}

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


export interface GridItemProps {
  span: ResponsiveValue<GridCount>;
  children: ReactNode;
}

export function GridItem({ span, children }: GridItemProps) {
  return <div className={`min-w-0 ${toClasses(span, SPANS)}`}>{children}</div>;
}
