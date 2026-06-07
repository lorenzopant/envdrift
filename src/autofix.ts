import { appendFileSync, readFileSync } from "node:fs";
import type { DriftReport } from "./diff.js";

const MARKER = "# --- added by envdrift --autofix ---";

export interface AutofixResult {
  /** File label -> keys appended to it. Files with nothing to add are omitted. */
  patched: Record<string, string[]>;
}

/**
 * For every drifted key, appends it (empty value) to each file that's missing it,
 * so every env file ends up declaring the same set of keys. Values are intentionally
 * left blank — envdrift only tracks key presence, never secret values.
 */
export function applyAutofix(report: DriftReport): AutofixResult {
  const patched: Record<string, string[]> = {};

  for (const file of report.files) {
    const missing = report.driftRows
      .filter((row) => !row.presence[file.label])
      .map((row) => row.key);

    if (missing.length === 0) continue;

    const existing = readFileSync(file.path, "utf-8");
    const needsLeadingNewline = existing.length > 0 && !existing.endsWith("\n");
    const block = [
      needsLeadingNewline ? "\n" : "",
      `\n${MARKER}\n`,
      ...missing.map((key) => `${key}=\n`),
    ].join("");

    appendFileSync(file.path, block);
    patched[file.label] = missing;
  }

  return { patched };
}
