# Visual Regression Snapshots — Reveal States

Lightweight guardrail for the scroll/reveal animations in
`src/components/reveal.tsx`. Captures homepage sections that use
`<Reveal>` / `<StaggerGrid>` at three breakpoints (mobile 390, tablet
834, desktop 1280) with `prefers-reduced-motion: reduce` forced on, so
elements render in their final settled state — no timing flake.

## Run

```bash
# Dev server must be running (bun dev). Then:
node tests/visual/snapshot.mjs             # compare against baselines
node tests/visual/snapshot.mjs --update    # write / refresh baselines
```

- Baselines commit to `tests/visual/baselines/`.
- Latest run in `tests/visual/current/`.
- Pixel diffs (only when a check fails) in `tests/visual/diff/`.

Tunables via env: `BASE_URL`, `THRESHOLD` (per-pixel color, default 0.1),
`MAX_DIFF` (allowed differing-pixel %, default 0.5).

Regenerate baselines whenever a visual change is intentional.
