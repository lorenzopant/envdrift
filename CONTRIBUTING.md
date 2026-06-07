# Contributing to envdrift

Thanks for considering a contribution. This is a small CLI — keep changes
focused and the bar for "is this needed" high.

## Setup

```bash
git clone https://github.com/lorenzopant/envdrift.git
cd envdrift
pnpm install
```

Package manager is **pnpm** — please don't commit `package-lock.json` or
`yarn.lock`.

## Development

```bash
pnpm dev [dir]      # run the CLI against a directory without building
pnpm run build      # build with tsup -> dist/
pnpm start [dir]    # run the built CLI
npx tsc --noEmit    # type-check
```

Try your changes against a real (or fixture) directory of `.env*` files before
opening a PR — there's no test suite yet, so manual verification matters.

## Code style

- TypeScript, ESM (`"type": "module"`), no transpilation tricks.
- No comments explaining *what* code does — only *why*, when the reasoning
  isn't obvious from the code itself.
- Compare env files by **key only, never value** — this is a hard rule (see
  `CLAUDE.md`). Don't add anything that reads, logs, or writes secret values.
- Keep the dependency list small. Justify any new dependency in your PR
  description.

## Adding or changing CLI flags

If you add, remove, or change a flag, output format, or exit-code behavior,
**update `README.md`** (options table, example output, "How it works" section)
in the same PR. Stale docs are worse than no docs.

## Commit messages & PRs

- Keep commits focused; one logical change per commit.
- PR description should explain *why*, not just *what* — link to an issue if
  one exists.
- Be ready to discuss trade-offs; this is a young project and design isn't
  fully settled.

## Reporting bugs / proposing features

Open a GitHub issue. Include:
- What you expected vs. what happened
- Repro steps (a minimal `.env*` fixture helps a lot)
- envdrift version (`envdrift --version`) and Node version

## Code of Conduct

By participating, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
