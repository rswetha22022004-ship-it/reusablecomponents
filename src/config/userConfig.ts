import type { DashboardConfig } from "../types/dashboard";
import type { TaskRow } from "../data/userData";
import { deepFreeze } from "../utils/deepFreeze";


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
