#!/usr/bin/env node
// Gatekeeper for cutting a release: pnpm release <patch|minor|major>
//
// Runs typecheck + tests + build, refuses on a dirty tree, bumps the version
// (npm version creates the commit + tag), pushes both, then creates a GitHub
// Release with auto-generated notes — which triggers publish.yml to ship the
// package to npm via OIDC trusted publishing.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const bump = process.argv[2];
if (!["patch", "minor", "major"].includes(bump ?? "")) {
  console.error("Usage: pnpm release <patch|minor|major>");
  process.exit(1);
}

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });
const capture = (cmd, args) => execFileSync(cmd, args, { encoding: "utf-8" }).trim();

const status = capture("git", ["status", "--porcelain"]);
if (status !== "") {
  console.error("Working tree is dirty — commit or stash changes before releasing.");
  process.exit(1);
}

const branch = capture("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
if (branch !== "main") {
  console.error(`Releases are cut from "main", not "${branch}".`);
  process.exit(1);
}

try {
  execFileSync("gh", ["--version"], { stdio: "ignore" });
} catch {
  console.error("GitHub CLI (`gh`) is required to create the release. Install it and `gh auth login` first.");
  process.exit(1);
}

console.log(`\n>> typecheck`);
run("pnpm", ["run", "typecheck"]);

console.log(`\n>> test`);
run("pnpm", ["test"]);

console.log(`\n>> build`);
run("pnpm", ["run", "build"]);

console.log(`\n>> bumping version (${bump})`);
run("npm", ["version", bump, "-m", "chore: release v%s 🚀"]);

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
const tag = `v${version}`;

console.log(`\n>> pushing commit + tag (${tag})`);
run("git", ["push"]);
run("git", ["push", "--tags"]);

console.log(`\n>> creating GitHub Release ${tag}`);
run("gh", [
  "release",
  "create",
  tag,
  "--title",
  `${tag} 🚀`,
  "--generate-notes",
]);

console.log(`
Release ${tag} published on GitHub — publish.yml is now shipping it to npm
via OIDC trusted publishing. Watch it with:

  gh run watch --workflow=publish.yml
`);
