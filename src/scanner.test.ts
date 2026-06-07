import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { findEnvFiles } from "./scanner.js";

function withFixture(fn: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "envdrift-scanner-"));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("finds .env* files and ignores non-matching files", () => {
  withFixture((dir) => {
    writeFileSync(join(dir, ".env"), "");
    writeFileSync(join(dir, ".env.local"), "");
    writeFileSync(join(dir, ".env.production"), "");
    writeFileSync(join(dir, "README.md"), "");
    writeFileSync(join(dir, "envdrift.config.js"), "");

    const found = findEnvFiles(dir).map((p) => relative(dir, p)).sort();
    assert.deepEqual(found, [".env", ".env.local", ".env.production"]);
  });
});

test("recurses into subdirectories but skips ignored ones", () => {
  withFixture((dir) => {
    mkdirSync(join(dir, "packages", "api"), { recursive: true });
    mkdirSync(join(dir, "node_modules", "some-dep"), { recursive: true });
    mkdirSync(join(dir, ".git"), { recursive: true });

    writeFileSync(join(dir, ".env"), "");
    writeFileSync(join(dir, "packages", "api", ".env"), "");
    writeFileSync(join(dir, "node_modules", "some-dep", ".env"), "");
    writeFileSync(join(dir, ".git", ".env"), "");

    const found = findEnvFiles(dir).map((p) => relative(dir, p)).sort();
    assert.deepEqual(found, [".env", join("packages", "api", ".env")]);
  });
});

test("respects the depth limit", () => {
  withFixture((dir) => {
    const deep = join(dir, "a", "b", "c", "d");
    mkdirSync(deep, { recursive: true });
    writeFileSync(join(deep, ".env"), "");

    assert.deepEqual(findEnvFiles(dir, 1), []);
    assert.equal(findEnvFiles(dir, 10).length, 1);
  });
});
