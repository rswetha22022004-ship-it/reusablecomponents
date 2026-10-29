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
  { key: "salary", label: "Salary (₹)", type: "number", placeholder: "e.g. 60000" },
  { key: "status", label: "Status", type: "select", options: EMPLOYEE_STATUSES },
]);
