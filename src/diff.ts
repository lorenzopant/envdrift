import type { EnvFile } from "./parser.js";

export interface DriftRow {
  key: string;
  /** Map of file label -> whether the key is present in that file. */
  presence: Record<string, boolean>;
  /** True if at least one file is missing this key (i.e. drift exists for this key). */
  hasDrift: boolean;
}

export interface DriftReport {
  files: EnvFile[];
  rows: DriftRow[];
  /** Rows where hasDrift is true, sorted by key. */
  driftRows: DriftRow[];
}

/**
 * Builds a presence matrix across all given env files.
 * A key "drifts" when it isn't present in every file.
 */
export function buildDriftReport(files: EnvFile[]): DriftReport {
  const allKeys = new Set<string>();
  for (const file of files) {
    for (const key of file.keys) allKeys.add(key);
  }

  const rows: DriftRow[] = [...allKeys].sort().map((key) => {
    const presence: Record<string, boolean> = {};
    for (const file of files) presence[file.label] = file.keys.has(key);
    const hasDrift = files.some((f) => !f.keys.has(key));
    return { key, presence, hasDrift };
  });

  return { files, rows, driftRows: rows.filter((r) => r.hasDrift) };
}
