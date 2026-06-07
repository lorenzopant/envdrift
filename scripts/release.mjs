#!/usr/bin/env node
// Gatekeeper for cutting a release: pnpm release <patch|minor|major>
//
// Runs typecheck + tests + build, refuses on a dirty tree, bumps the version
// (npm version creates the commit + tag), and pushes both — the publish.yml
// workflow then ships to npm via OIDC trusted publishing on GitHub Release.
import { execFileSync } from "node:child_process";

const bump = process.argv[2];
if (!["patch", "minor", "major"].includes(bump ?? "")) {
  console.error("Usage: pnpm release <patch|minor|major>");
  process.exit(1);
}

const run = (cmd, args) =>
  execFileSync(cmd, args, { stdio: "inherit" });

const status = execFileSync("git", ["status", "--porcelain"], { encoding: "utf-8" });
if (status.trim() !== "") {
  console.error("Working tree is dirty — commit or stash changes before releasing.");
  process.exit(1);
}

const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf-8" }).trim();
if (branch !== "main") {
  console.error(`Releases are cut from "main", not "${branch}".`);
  process.exit(1);
}

console.log(`\n>> typecheck`);
run("pnpm", ["run", "typecheck"]);

console.log(`\n>> test`);
run("pnpm", ["test"]);

console.log(`\n>> build`);
run("pnpm", ["run", "build"]);

console.log(`\n>> bumping version (${bump})`);
run("npm", ["version", bump, "-m", "release: v%s"]);

console.log(`\n>> pushing commit + tag`);
run("git", ["push"]);
run("git", ["push", "--tags"]);

console.log(`
Tag pushed. To finish: draft a GitHub Release from the new tag and publish
it — .github/workflows/publish.yml takes it from there.
`);
