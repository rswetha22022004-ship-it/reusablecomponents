import type { DataRow, StatItem } from "../types/dashboard";

export const TASK_STATUSES = ["Not started", "In progress", "Blocked", "Done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface TaskRow {
  id: string;
  task: string;
  project: string;
  due: string;
  status: TaskStatus;
}

export interface UserData {
  stats: readonly StatItem[];
  tasksByDay: readonly DataRow[];
  timeByProject: readonly DataRow[];
  hoursByWeek: readonly DataRow[];
  tasks: readonly TaskRow[];
}

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

export function isTaskRow(value: unknown): value is TaskRow {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.task === "string" &&
    typeof r.project === "string" &&
    typeof r.due === "string" &&
    typeof r.status === "string" &&
    (TASK_STATUSES as readonly string[]).includes(r.status)
  );
}
export function nextTaskId(rows: readonly TaskRow[]): string {
  const highest = rows.reduce((max, row) => {
    const match = /^T-(\d+)$/.exec(row.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `T-${highest + 1}`;
}
