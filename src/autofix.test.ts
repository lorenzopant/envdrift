import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvFile } from "./parser.js";
import { buildDriftReport } from "./diff.js";
import { applyAutofix } from "./autofix.js";

test("appends missing keys with empty values to files lacking them", () => {
  const dir = mkdtempSync(join(tmpdir(), "envdrift-autofix-"));
  try {
    const aPath = join(dir, ".env");
    const bPath = join(dir, ".env.local");
    writeFileSync(aPath, "A=1\nB=2\n");
    writeFileSync(bPath, "A=1\nC=3\n");

    const report = buildDriftReport([loadEnvFile(aPath, ".env"), loadEnvFile(bPath, ".env.local")]);
    const { patched } = applyAutofix(report);

    assert.deepEqual(patched, { ".env": ["C"], ".env.local": ["B"] });

    const aContents = readFileSync(aPath, "utf-8");
    const bContents = readFileSync(bPath, "utf-8");

    assert.match(aContents, /^A=1\nB=2\n/);
    assert.match(aContents, /\nC=\n?$/);
    assert.match(bContents, /\nB=\n?$/);

    // Re-running the diff should now show no drift.
    const after = buildDriftReport([loadEnvFile(aPath, ".env"), loadEnvFile(bPath, ".env.local")]);
    assert.equal(after.driftRows.length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("leaves files untouched when they already have every key", () => {
  const dir = mkdtempSync(join(tmpdir(), "envdrift-autofix-"));
  try {
    const aPath = join(dir, ".env");
    const bPath = join(dir, ".env.local");
    writeFileSync(aPath, "A=1\n");
    writeFileSync(bPath, "A=1\n");

    const report = buildDriftReport([loadEnvFile(aPath, ".env"), loadEnvFile(bPath, ".env.local")]);
    const { patched } = applyAutofix(report);

    assert.deepEqual(patched, {});
    assert.equal(readFileSync(aPath, "utf-8"), "A=1\n");
    assert.equal(readFileSync(bPath, "utf-8"), "A=1\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
