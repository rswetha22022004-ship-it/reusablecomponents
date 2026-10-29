import type { DashboardConfig } from "../types/dashboard";
import type { EmployeeRow } from "../data/adminData";
import { deepFreeze } from "../utils/deepFreeze";


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
{ key: "salary", header: "Salary", align: "right", format: (value) => `₹${Number(value).toLocaleString("en-IN")}` },      {
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
