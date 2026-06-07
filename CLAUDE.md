# envdrift — notes for Claude

CLI tool that diffs `.env*` files across a project to surface key drift
(present in one env, missing in another). Key-based comparison only — never
read or print values, this avoids handling secrets.

## Architecture

- `src/scanner.ts` — finds `.env*` files on disk
- `src/parser.ts` — parses a file into a `Set<string>` of keys (via `dotenv`)
- `src/diff.ts` — builds the `DriftReport` (presence matrix across files)
- `src/report.ts` — renders the report (terminal matrix via `renderMatrix`,
  Markdown via `renderMarkdown`)
- `src/autofix.ts` — appends missing keys (empty value) to files lacking them
- `src/index.ts` — CLI entry point (`commander`)

Package manager: **pnpm** (not npm/yarn). Build via `tsup`, dev via `tsx`.

## Keep README.md in sync

**Whenever you add, remove, or change CLI flags, options, output format, or
exit-code behavior, update `README.md` to match** — specifically the options
table, the example output block, and the "How it works" section if the
pipeline steps change. Don't let the README drift from the CLI it documents
(that would be a bit on-the-nose for this project).

## Conventions

- Never compare or surface env *values* — only key presence. This keeps the
  tool safe to run against files containing real secrets.
- `process.exitCode` stays `0` by default regardless of drift found — this is
  a reporting tool, not a CI gate, unless the user opts in via
  `--fail-on-drift` (per user feedback: default to non-failing, let CI users
  choose to gate on it explicitly).
