#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { findEnvFiles } from "./scanner.js";
import { loadEnvFile } from "./parser.js";
import { buildDriftReport } from "./diff.js";
import { renderMatrix, renderMarkdown } from "./report.js";
import { applyAutofix } from "./autofix.js";

const DEFAULT_MD_REPORT = "envdrift-report.md";

const program = new Command();

program
  .name("envdrift")
  .description("Detect drift between .env files in a project (missing/extra keys across environments)")
  .argument("[dir]", "directory to scan", ".")
  .option("--depth <n>", "max directory depth to scan", "5")
  .option("--autofix", "append missing keys (empty value) to files where they're absent")
  .option("--md [path]", `write a Markdown drift report to <path> (default: ${DEFAULT_MD_REPORT})`)
  .option("--fail-on-drift", "exit with code 1 when drift is found (useful for CI/CD gates)")
  .action((dir: string, opts: { depth: string; autofix?: boolean; md?: string | boolean; failOnDrift?: boolean }) => {
    const root = resolve(dir);
    const paths = findEnvFiles(root, Number(opts.depth));

    if (paths.length === 0) {
      console.log(chalk.yellow(`No .env* files found under ${root}`));
      return;
    }

    const files = paths
      .sort()
      .map((p) => loadEnvFile(p, relative(root, p)));

    const report = buildDriftReport(files);

    console.log(chalk.bold(`\nScanned ${files.length} env file(s):`));
    for (const f of files) console.log(chalk.dim(`  - ${f.label} (${f.keys.size} keys)`));

    if (opts.md) {
      const mdPath = resolve(typeof opts.md === "string" ? opts.md : DEFAULT_MD_REPORT);
      writeFileSync(mdPath, renderMarkdown(report));
      console.log(chalk.dim(`\nMarkdown report written to ${relative(process.cwd(), mdPath)}`));
    }

    if (report.driftRows.length === 0) {
      console.log(chalk.green(`\n  ✓  No drift detected — all ${files.length} env files share the same keys.\n`));
      return;
    }

    console.log(chalk.bold(`\nDrift found in ${report.driftRows.length} key(s):\n`));
    console.log(renderMatrix(report));
    console.log("");

    if (opts.failOnDrift) {
      process.exitCode = 1;
    }

    if (opts.autofix) {
      const { patched } = applyAutofix(report);
      const labels = Object.keys(patched);
      if (labels.length === 0) {
        console.log(chalk.dim("Autofix: nothing to patch.\n"));
      } else {
        console.log(chalk.bold("Autofix applied — appended missing keys (empty values):"));
        for (const label of labels) {
          console.log(chalk.dim(`  - ${label}: ${patched[label].join(", ")}`));
        }
        console.log(chalk.yellow("\nReview the changes — fill in real values before committing.\n"));
      }
    }
  });

program.parse();
