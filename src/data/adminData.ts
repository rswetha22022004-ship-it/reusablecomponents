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


export const adminData: AdminData = {
  stats: [
    { id: "users", title: "Total users", value: "12,480", icon: "users", trend: { value: 8.2, label: "vs last month" } },
    { id: "revenue", title: "Revenue", value: "₹84,300", icon: "money", trend: { value: 12.5, label: "vs last month" } },
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
