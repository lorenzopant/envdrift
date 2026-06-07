## What & why

## How tested
<!-- Manual run against fixture/real .env files? Output before/after? -->

## Checklist
- [ ] `npx tsc --noEmit` passes
- [ ] `pnpm run build` succeeds and `node dist/index.js` works as expected
- [ ] README updated if flags/output/exit-code behavior changed
- [ ] No env *values* are read, logged, or written — keys only
