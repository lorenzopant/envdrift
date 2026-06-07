import { readFileSync } from "node:fs";
import { parse as parseDotenv } from "dotenv";

export interface EnvFile {
  /** Path relative to scan root, used as the display label. */
  label: string;
  /** Absolute path on disk. */
  path: string;
  /** Keys present in the file (values intentionally discarded — drift is key-based, not value-based). */
  keys: Set<string>;
}

export function loadEnvFile(path: string, label: string): EnvFile {
  const raw = readFileSync(path, "utf-8");
  const parsed = parseDotenv(raw);
  return { label, path, keys: new Set(Object.keys(parsed)) };
}
