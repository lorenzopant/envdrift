import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDriftReport } from "./diff.js";
import type { EnvFile } from "./parser.js";

const file = (label: string, keys: string[]): EnvFile => ({
  label,
  path: `/fake/${label}`,
  keys: new Set(keys),
});

test("no drift when all files share the same keys", () => {
  const report = buildDriftReport([file(".env", ["A", "B"]), file(".env.local", ["A", "B"])]);
  assert.equal(report.driftRows.length, 0);
  assert.equal(report.rows.length, 2);
});

test("flags keys missing from at least one file", () => {
  const report = buildDriftReport([
    file(".env", ["A", "B", "C"]),
    file(".env.local", ["A", "D"]),
  ]);

  const drifted = report.driftRows.map((r) => r.key).sort();
  assert.deepEqual(drifted, ["B", "C", "D"]);

  const rowB = report.driftRows.find((r) => r.key === "B")!;
  assert.equal(rowB.presence[".env"], true);
  assert.equal(rowB.presence[".env.local"], false);
});

test("rows are sorted alphabetically by key", () => {
  const report = buildDriftReport([file(".env", ["Z", "A", "M"])]);
  assert.deepEqual(
    report.rows.map((r) => r.key),
    ["A", "M", "Z"],
  );
});

test("handles a single file (nothing to drift against)", () => {
  const report = buildDriftReport([file(".env", ["A", "B"])]);
  assert.equal(report.driftRows.length, 0);
});
