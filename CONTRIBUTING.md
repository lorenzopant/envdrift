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
pnpm dev [dir]        # run the CLI against a directory without building
pnpm run build        # build with tsup -> dist/
pnpm start [dir]      # run the built CLI
pnpm run typecheck    # tsc --noEmit
pnpm test             # run the test suite (node:test, via tsx)
```

CI runs `typecheck`, `test`, and `build` on every push/PR
(`.github/workflows/ci.yml`) — make sure they pass locally first. Also try
your changes against a real (or fixture) directory of `.env*` files; tests
cover the core logic but not the CLI's terminal output.

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

## Releasing

Publishing to npm is automated via `.github/workflows/publish.yml`, triggered
by publishing a GitHub Release. It uses npm's **OIDC trusted publishing** —
no `NPM_TOKEN` secret is stored in the repo.

Published as the scoped package `@lorenzopant/envdrift` (the unscoped
`envdrift` name is already taken by an unrelated publisher).

One-time setup (maintainers only, done on npmjs.com):
1. Publish version `1.0.0` manually once first (`npm publish --access public`
   from a logged-in shell) — trusted publishers can only be linked to a
   package that already exists.
2. Go to the `@lorenzopant/envdrift` package -> **Settings -> Trusted Publisher**.
3. Add a GitHub Actions publisher: repo `lorenzopant/envdrift`, workflow
   `publish.yml`, environment left blank (or set one and mirror it in the
   workflow's `environment:` key).

**The only sanctioned way to cut a release is `pnpm release <patch|minor|major>`**
(`scripts/release.mjs`). Don't hand-edit `version` in `package.json` or tag
manually — the script is the gate that keeps releases consistent. It:

1. Refuses on a dirty working tree or any branch other than `main`.
2. Runs `typecheck`, `test`, and `build` — aborts on the first failure.
3. Bumps the version with `npm version <bump>` (creates the commit + tag).
4. Pushes the commit and tag.

After that, draft a GitHub Release from the new tag and publish it —
`publish.yml` takes it from there (build + `npm publish --provenance`).

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
