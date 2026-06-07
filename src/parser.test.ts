import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvFile } from "./parser.js";

test("loadEnvFile extracts keys but never exposes values", () => {
  const dir = mkdtempSync(join(tmpdir(), "envdrift-parser-"));
  try {
    const path = join(dir, ".env");
    writeFileSync(path, "API_KEY=super-secret-value\nPORT=3000\n# comment\n\nDEBUG=true\n");

    const file = loadEnvFile(path, ".env");

    assert.deepEqual([...file.keys].sort(), ["API_KEY", "DEBUG", "PORT"]);
    assert.equal(file.label, ".env");
    assert.equal(file.path, path);

    // The whole point: this object must never carry parsed values around.
    assert.equal((file as unknown as Record<string, unknown>).values, undefined);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("loadEnvFile handles an empty file", () => {
  const dir = mkdtempSync(join(tmpdir(), "envdrift-parser-"));
  try {
    const path = join(dir, ".env");
    writeFileSync(path, "");
    const file = loadEnvFile(path, ".env");
    assert.equal(file.keys.size, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
