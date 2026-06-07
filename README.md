# envdrift

CLI that detects drift between `.env*` files in a project — catches the case
where a variable is set in `.env.local` but missing from `.env.production`
(or vice versa) before it causes a runtime surprise.

It compares **keys only**, never values — no secrets are read into memory or
printed.

## Install / run

```bash
pnpm install
pnpm run build
node dist/index.js [dir]
```

Or during development, skip the build step:

```bash
pnpm dev [dir]
```

`[dir]` defaults to the current directory.

## Usage

```bash
envdrift [dir] [options]
```

| Option | Description |
| --- | --- |
| `--depth <n>` | max directory depth to scan (default: `5`) |
| `--autofix` | append missing keys (empty value) to files where they're absent, marked with a `# --- added by envdrift --autofix ---` comment |
| `--md [path]` | write a Markdown drift report to `<path>` (default: `envdrift-report.md`) |
| `--fail-on-drift` | exit with code `1` when drift is found (CI/CD gate) |

### Example

```
$ envdrift .

Scanned 3 env file(s):
  - .env (4 keys)
  - .env.local (4 keys)
  - .env.production (7 keys)

Drift found in 3 key(s):

Legend:
  F1 = .env
  F2 = .env.local
  F3 = .env.production

                F1  F2  F3
  ------------  --  --  --
  GITHUB_TOKEN  ✗   ✓   ✗
  RATE_LIMIT_MAX ✗  ✗   ✓
  SENTRY_DSN    ✗   ✗   ✓
```

By default, exit code is always `0` — envdrift reports drift without failing
your build. Pass `--fail-on-drift` to exit with code `1` when drift is found,
turning it into a CI/CD gate:

```bash
envdrift . --fail-on-drift
```

Use `--md` to produce a file you can attach to CI artifacts or PRs if you want
drift to be visible in review regardless of whether the build fails.

## How it works

1. **Scan** — recursively find `.env*` files (skips `node_modules`, `.git`,
   build output dirs).
2. **Parse** — read each file's keys via `dotenv` (values discarded).
3. **Diff** — build a presence matrix across all files; any key not present
   in every file counts as drift.
4. **Report** — render as a terminal matrix, optionally a Markdown file, and
   optionally autofix by appending missing keys with empty values.

## Project layout

```
src/
  scanner.ts   find .env* files on disk
  parser.ts    parse a file into its set of keys
  diff.ts      build the drift report (presence matrix)
  report.ts    render the report (terminal matrix, Markdown)
  autofix.ts   append missing keys to files
  index.ts     CLI entry point (commander)
```
