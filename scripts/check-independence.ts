import { adminConfig } from "../src/config/adminConfig";
import { userConfig } from "../src/config/userConfig";

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

if (shared.length > 0) {
  throw new Error(`Expected independent configs, found ${shared.length} shared object references.`);
}

/* ---- runtime settings: applying Admin settings must not touch any config ---- */
import { applySettings, settingsFromConfig } from "../src/utils/settings";

const adminSettings = { ...settingsFromConfig(adminConfig), barHeight: 500, barColors: ["#ff0000", "#00ff00", "#0000ff"] };
const changedAdmin = applySettings(adminConfig, adminSettings);

console.log("\nAdmin bar height with settings applied:", changedAdmin.bar.chart.height);
console.log("Admin base config still:", adminConfig.bar.chart.height);
console.log("User  config still:", userConfig.bar.chart.height);

if (adminConfig.bar.chart.height !== 320 || userConfig.bar.chart.height !== 220 || changedAdmin.bar.chart.height !== 500) {
  throw new Error("Applying Admin settings changed a config unexpectedly.");
}
