import chalk from "chalk";
import type { DriftReport } from "./diff.js";

/**
 * Renders drift as a compact matrix: one row per drifted key, one column per file.
 * Files are referenced by index (F1, F2, ...) in the grid — a legend above maps
 * index to full path, keeping columns narrow regardless of how long file labels are.
 */
export function renderMatrix(report: DriftReport): string {
  const { files, driftRows } = report;
  if (driftRows.length === 0) return "";

  const keyWidth = Math.max(...driftRows.map((r) => r.key.length), "KEY".length);
  const columns = files.map((_, i) => `F${i + 1}`);
  const colWidth = Math.max(...columns.map((c) => c.length), 1);

  const lines: string[] = [];

  lines.push(chalk.bold("Legend:"));
  files.forEach((f, i) => lines.push(chalk.dim(`  F${i + 1} = ${f.label}`)));
  lines.push("");

  const header = [" ".repeat(keyWidth), ...columns.map((c) => c.padEnd(colWidth))].join("  ");
  lines.push(chalk.bold(`  ${header}`));
  lines.push(`  ${"-".repeat(keyWidth)}  ${columns.map(() => "-".repeat(colWidth)).join("  ")}`);

  for (const row of driftRows) {
    const cells = files.map((f) => {
      const symbol = (row.presence[f.label] ? "✓" : "✗").padEnd(colWidth);
      return row.presence[f.label] ? chalk.green(symbol) : chalk.red(symbol);
    });
    lines.push(`  ${chalk.bold(row.key.padEnd(keyWidth))}  ${cells.join("  ")}`);
  }

  return lines.join("\n");
}

/**
 * Renders the full report (summary + drift matrix) as a Markdown document,
 * suitable for committing as an artifact or pasting into a PR description.
 */
export function renderMarkdown(report: DriftReport): string {
  const { files, driftRows } = report;
  const timestamp = new Date().toISOString();

  const lines: string[] = [];
  lines.push("# envdrift report");
  lines.push("");
  lines.push(`Generated: ${timestamp}`);
  lines.push("");
  lines.push("## Files scanned");
  lines.push("");
  for (const f of files) lines.push(`- \`${f.label}\` (${f.keys.size} keys)`);
  lines.push("");

  if (driftRows.length === 0) {
    lines.push(`✅ No drift detected — all ${files.length} env files share the same keys.`);
    lines.push("");
    return lines.join("\n");
  }

  lines.push(`## Drift (${driftRows.length} key${driftRows.length === 1 ? "" : "s"})`);
  lines.push("");
  lines.push(`| Key | ${files.map((f) => `\`${f.label}\``).join(" | ")} |`);
  lines.push(`| --- | ${files.map(() => "---").join(" | ")} |`);
  for (const row of driftRows) {
    const cells = files.map((f) => (row.presence[f.label] ? "✅" : "❌"));
    lines.push(`| \`${row.key}\` | ${cells.join(" | ")} |`);
  }
  lines.push("");

  return lines.join("\n");
}
