# Gates Index — ForgeDX

All pre-commit and session-close gates. Run `pre-commit.sh` to execute all.

| # | Gate | Script | Trigger | Escape Hatch |
|---|------|--------|---------|--------------|
| 1 | Debt markers linked | `pre-commit-debt-markers.sh` | Any TS/TSX staged | none |
| 2 | TDD phase ordering | `commit-msg.sh` check 2 | `feat(scope):` commit | `[SKIP-TDD-GATE reason]` |
| 3 | Hurl probe for new route | `pre-commit-hurl-coverage.sh` | New `routes/*.ts` | `[SKIP-HURL: reason]` |
| 4 | Regression fixture on DELTA close | `commit-msg.sh` check 3 | DELTA-LOG.md moves row to Resolved | `[no-fixture: reason]` |
| 5 | EDR declares Affected UCs | `pre-commit-edr-affected-ucs.sh` | New `docs/edrs/EDR-*.md` | none |
| 6 | findMany has orderBy | `pre-commit-findmany-orderby.sh` | `*.repository.ts` staged | `// orderBy-exempt: reason` |
| 7 | Depcruise (4 arch rules) | `pre-commit-depcruise.sh` | Any TS/TSX staged in apps/api | none |
| 8 | No dead files (knip) | `pre-commit-knip.sh` | Any TS/TSX staged | `knip.json ignore` + DELTA ref |
| 9 | apps/api duplication ≤ 4% | `pre-commit-jscpd.sh` | Any TS staged in apps/api | none |
| 10 | apps/web duplication ≤ 1% | `pre-commit-jscpd-web.sh` | Any TSX staged in apps/web | none |
| 11a | ESLint zero warnings (api) | `pre-commit-eslint.sh` | Any TS staged in apps/api | none |
| 11b | ESLint zero warnings (web) | `pre-commit-eslint-web.sh` | Any TSX staged in apps/web | none |
| 12 | TypeScript zero errors (web) | `pre-commit-tsc-web.sh` | Any TSX staged | none |
| 13 | E2E coverage for new testids | `pre-commit-e2e-control-coverage.sh` | `data-testid="*-btn"` added | `// e2e-coverage-exempt: reason` |
| DH | Dead handler (buttons need onClick) | `pre-commit-dead-handler.sh` | `data-testid="*-btn"` added | `disabled` attribute |
| B | Web layer boundaries | `pre-commit-boundaries.sh` | Any TSX staged in apps/web | none |
| CC1 | Session loop protocol | `cc-gate-session-protocol.py` | UserPromptSubmit | none |
| CC2 | Debt audit on close | `cc-gate-debt-audit.py` | Stop hook | none |
