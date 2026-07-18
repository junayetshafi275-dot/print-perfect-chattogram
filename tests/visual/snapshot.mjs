#!/usr/bin/env node
/**
 * Lightweight visual regression snapshot for reveal states.
 *
 * Captures homepage sections (which use <Reveal>/<StaggerGrid> from
 * src/components/reveal.tsx) at three breakpoints with prefers-reduced-motion
 * forced ON — that short-circuits the Framer transitions so animations settle
 * into their final state deterministically, letting us detect layout/style
 * drift without flaky timing.
 *
 * Usage:
 *   node tests/visual/snapshot.mjs           # compare against baseline
 *   node tests/visual/snapshot.mjs --update  # write / overwrite baseline
 *
 * Env:
 *   BASE_URL   default http://localhost:8080
 *   THRESHOLD  per-pixel color threshold  (default 0.1)
 *   MAX_DIFF   allowed % of differing pixels (default 0.5)
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_DIR = path.join(__dirname, "baselines");
const CURRENT_DIR = path.join(__dirname, "current");
const DIFF_DIR = path.join(__dirname, "diff");

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const THRESHOLD = Number(process.env.THRESHOLD ?? 0.1);
const MAX_DIFF_PCT = Number(process.env.MAX_DIFF ?? 0.5);
const UPDATE = process.argv.includes("--update");

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1180 },
  { name: "desktop", width: 1280, height: 900 },
];

// Reveal-driven sections we want to lock down. Each entry is a stable
// selector that resolves on the homepage.
const TARGETS = [
  { name: "hero", selector: "section:has(h1)" },
  { name: "trust-strip", selector: "section.border-y.bg-paper" },
  { name: "stats", selector: "section.bg-paper-grain:has(.tabular-nums)" },
  { name: "reviews", selector: "section.bg-paper-grain:has(h2)" },
];

async function ensureDirs() {
  for (const d of [BASELINE_DIR, CURRENT_DIR, DIFF_DIR]) await mkdir(d, { recursive: true });
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function captureAll() {
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  );
  const results = [];
  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion: "reduce",
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      // Freeze any residual CSS animations/transitions for pixel stability.
      await page.addStyleTag({
        content: `*,*::before,*::after{animation:none!important;transition:none!important}`,
      });
      await page.waitForLoadState("networkidle");

      for (const t of TARGETS) {
        const el = page.locator(t.selector).first();
        if (!(await el.count())) {
          results.push({ vp: vp.name, target: t.name, status: "missing" });
          continue;
        }
        await el.scrollIntoViewIfNeeded();
        const buf = await el.screenshot({ animations: "disabled", caret: "hide" });
        const key = `${t.name}__${vp.name}.png`;
        await writeFile(path.join(CURRENT_DIR, key), buf);
        results.push({ vp: vp.name, target: t.name, key, buf });
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return results;
}

async function compareOne({ key, buf }) {
  const basePath = path.join(BASELINE_DIR, key);
  if (UPDATE || !existsSync(basePath)) {
    await writeFile(basePath, buf);
    return { key, status: UPDATE ? "updated" : "new-baseline", diffPct: 0 };
  }
  const baseline = PNG.sync.read(await readFile(basePath));
  const current = PNG.sync.read(buf);
  if (baseline.width !== current.width || baseline.height !== current.height) {
    await writeFile(path.join(DIFF_DIR, key), buf);
    return {
      key,
      status: "size-mismatch",
      diffPct: 100,
      note: `${baseline.width}x${baseline.height} vs ${current.width}x${current.height}`,
    };
  }
  const { width, height } = baseline;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(baseline.data, current.data, diff.data, width, height, {
    threshold: THRESHOLD,
  });
  const diffPct = (mismatched / (width * height)) * 100;
  if (diffPct > MAX_DIFF_PCT) {
    await writeFile(path.join(DIFF_DIR, key), PNG.sync.write(diff));
    return { key, status: "fail", diffPct };
  }
  return { key, status: "pass", diffPct };
}

async function main() {
  await ensureDirs();
  const shots = await captureAll();
  const compared = [];
  for (const s of shots) {
    if (s.status === "missing") {
      compared.push({ key: `${s.target}__${s.vp}.png`, status: "missing", diffPct: 0 });
    } else {
      compared.push(await compareOne(s));
    }
  }
  let fail = 0;
  for (const r of compared) {
    const pct = r.diffPct.toFixed(3);
    const line = `[${r.status.padEnd(14)}] ${r.key}  Δ${pct}%${r.note ? "  " + r.note : ""}`;
    console.log(line);
    if (r.status === "fail" || r.status === "size-mismatch" || r.status === "missing") fail++;
  }
  console.log(
    `\n${compared.length} shots · ${compared.filter((r) => r.status === "pass").length} pass · ${fail} fail`,
  );
  if (fail && !UPDATE) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
