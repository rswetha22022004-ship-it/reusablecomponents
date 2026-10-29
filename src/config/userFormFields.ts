import type { FormField } from "../types/dashboard";
import { TASK_STATUSES, type TaskRow } from "../data/userData";
import { deepFreeze } from "../utils/deepFreeze";

/**
 * Inputs of the User "Add task" form.
 * The id is NOT here: it is generated automatically (T-108, T-109 ...).
 */
export const userTaskFields: readonly FormField<TaskRow>[] = deepFreeze([
  { key: "task", label: "Task", type: "text", placeholder: "What needs doing?" },
  {
    key: "project",
    label: "Project",
    type: "select",
    options: ["Website refresh", "Mobile app", "Research", "Admin"],
  },
  { key: "due", label: "Due date", type: "text", placeholder: "e.g. Nov 05" },
  { key: "status", label: "Status", type: "select", options: TASK_STATUSES },
]);
