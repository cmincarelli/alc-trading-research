# Trading Reports Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro site that reads trading analysis reports from `~/.tradingagents/logs/` and presents them as a New Yorker-style editorial publication, deployed to Netlify on push to main.

**Architecture:** Astro 5 static site with Content Collections backed by synced markdown files. A shell sync script copies `~/.tradingagents/logs/` into `src/content/reports/` (committed to git) before pushing. Three page routes cover the ticker index, date index, and individual report views. A small helper parses Content Collection entry IDs and humanizes report names.

**Tech Stack:** Astro 5 (static output), TypeScript (strict), Vitest, Playfair Display via Google Fonts, Netlify (no adapter required for static).

---

## File Map

| File | Role |
|---|---|
| `scripts/sync-reports.sh` | Rsyncs `~/.tradingagents/logs/` → `src/content/reports/` |
| `src/content/config.ts` | Registers the `reports` Content Collection |
| `src/lib/reports.ts` | `parseEntry(id)` + `humanize(name)` helpers |
| `src/lib/reports.test.ts` | Vitest unit tests for the helpers |
| `src/styles/global.css` | New Yorker typography, layout, and prose styles |
| `src/layouts/Base.astro` | HTML shell — Google Fonts, global CSS import, `<slot />` |
| `src/pages/index.astro` | Main index — ticker cards with date links |
| `src/pages/[ticker]/[date]/index.astro` | Date index — numbered TOC for one analysis run |
| `src/pages/[ticker]/[date]/[report].astro` | Report page — headline + styled markdown body |
| `astro.config.mjs` | Static output, trailing slash always |
| `netlify.toml` | Build command, publish dir, Node version |
| `.gitignore` | Standard Astro excludes; `src/content/reports/` is NOT excluded |

---

## Task 1: Scaffold Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `src/pages/index.astro`

- [ ] **Step 1: Scaffold in the current directory**

From `/Users/chrism/Desktop/reports/`:

```bash
npm create astro@latest . -- --template minimal --yes --no-git --install
```

If prompted that the directory is not empty, answer yes to continue. This installs Astro with the minimal template, TypeScript strict mode, and all npm dependencies.

- [ ] **Step 2: Verify the dev server starts**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:4321`. Visit it and see the default Astro page. Stop with Ctrl+C.

- [ ] **Step 3: Initialize git**

```bash
git init
git add .
git commit -m "chore: scaffold Astro project"
```

---

## Task 2: Create sync script and populate content

**Files:**
- Create: `scripts/sync-reports.sh`
- Populate: `src/content/reports/` (via script)

- [ ] **Step 1: Create the sync script**

Create `scripts/sync-reports.sh`:

```bash
#!/bin/bash
set -e

SOURCE="$HOME/.tradingagents/logs/"
DEST="$(cd "$(dirname "$0")/.." && pwd)/src/content/reports/"

mkdir -p "$DEST"

echo "Syncing reports from $SOURCE to $DEST..."
rsync -av --delete --exclude="*.log" "$SOURCE" "$DEST"
echo "Sync complete."
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x scripts/sync-reports.sh
```

- [ ] **Step 3: Run the sync**

```bash
./scripts/sync-reports.sh
```

Expected: rsync output listing the copied files. Verify:

```bash
ls src/content/reports/
```

Expected: `B/` and `PG/` directories (or whatever tickers are present).

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-reports.sh src/content/reports/
git commit -m "feat: add sync script and initial report content"
```

---

## Task 3: Configure Content Collection

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Create the collection config**

Create `src/content/config.ts`:

```ts
import { defineCollection } from 'astro:content';

const reports = defineCollection({ type: 'content' });

export const collections = { reports };
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npx astro check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: configure reports content collection"
```

---

## Task 4: Create reports helper with tests

**Files:**
- Create: `src/lib/reports.ts`
- Create: `src/lib/reports.test.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

Add a `"test"` script to `package.json`:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run"
}
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/reports.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseEntry, humanize } from './reports';

describe('parseEntry', () => {
  it('parses a standard entry id with .md extension', () => {
    expect(parseEntry('PG/2026-05-03/reports/investment_plan.md')).toEqual({
      ticker: 'PG',
      date: '2026-05-03',
      reportName: 'investment_plan',
    });
  });

  it('parses a single-char ticker', () => {
    expect(parseEntry('B/2026-05-02/reports/final_trade_decision.md')).toEqual({
      ticker: 'B',
      date: '2026-05-02',
      reportName: 'final_trade_decision',
    });
  });

  it('handles id without .md extension', () => {
    expect(parseEntry('AAPL/2026-01-01/reports/market_report')).toEqual({
      ticker: 'AAPL',
      date: '2026-01-01',
      reportName: 'market_report',
    });
  });
});

describe('humanize', () => {
  it('converts snake_case to Title Case', () => {
    expect(humanize('investment_plan')).toBe('Investment Plan');
    expect(humanize('final_trade_decision')).toBe('Final Trade Decision');
    expect(humanize('market_report')).toBe('Market Report');
    expect(humanize('news_report')).toBe('News Report');
    expect(humanize('sentiment_report')).toBe('Sentiment Report');
    expect(humanize('trader_investment_plan')).toBe('Trader Investment Plan');
    expect(humanize('fundamentals_report')).toBe('Fundamentals Report');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './reports'"

- [ ] **Step 4: Implement the helper**

Create `src/lib/reports.ts`:

```ts
export interface ReportEntry {
  ticker: string;
  date: string;
  reportName: string;
}

/** Parses an Astro Content Collection entry id into structured parts.
 *  Entry id format: "TICKER/DATE/reports/report_name.md"
 */
export function parseEntry(id: string): ReportEntry {
  const normalized = id.replace(/\.md$/, '');
  const parts = normalized.split('/');
  // parts: [ticker, date, "reports", reportName]
  return {
    ticker: parts[0],
    date: parts[1],
    reportName: parts[3],
  };
}

/** Converts snake_case to Title Case: "final_trade_decision" → "Final Trade Decision" */
export function humanize(name: string): string {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/reports.ts src/lib/reports.test.ts package.json package-lock.json
git commit -m "feat: add parseEntry and humanize helpers with tests"
```

---

## Task 5: Create Base layout and global CSS

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create global.css**

Create `src/styles/global.css`:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-bg: #faf8f4;
  --color-text: #1a1a1a;
  --color-muted: #666;
  --color-rule: #1a1a1a;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: Georgia, 'Times New Roman', serif;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.75;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ── Masthead ─────────────────────────────────────── */
.masthead {
  text-align: center;
  padding: 3rem 2rem 2rem;
  border-bottom: 1px solid var(--color-rule);
  margin-bottom: 3rem;
}

.masthead__title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.masthead__subtitle {
  font-size: 0.8125rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-top: 0.5rem;
}

/* ── Ticker grid ──────────────────────────────────── */
.ticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding-bottom: 4rem;
}

.ticker-card {
  border: 1px solid var(--color-rule);
  padding: 1.5rem;
}

.ticker-card__symbol {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  border-bottom: 1px solid var(--color-rule);
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
}

.ticker-card__dates {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ticker-card__dates a {
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9375rem;
}

.ticker-card__dates a:hover {
  text-decoration: underline;
}

/* ── Breadcrumb ───────────────────────────────────── */
.breadcrumb {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-rule);
}

.breadcrumb a {
  color: var(--color-text);
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb__sep {
  margin: 0 0.5rem;
}

/* ── Section header (date index) ─────────────────── */
.section-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-rule);
}

.section-header__ticker {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.1;
}

.section-header__date {
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-top: 0.5rem;
}

/* ── Report TOC ───────────────────────────────────── */
.report-toc {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 4rem;
}

.report-toc__item {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.report-toc__number {
  font-size: 0.75rem;
  color: var(--color-muted);
  min-width: 1.5rem;
  font-variant-numeric: tabular-nums;
}

.report-toc__link {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--color-text);
  text-decoration: none;
}

.report-toc__link:hover {
  text-decoration: underline;
}

/* ── Article ──────────────────────────────────────── */
.article {
  max-width: 70ch;
  margin: 0 auto;
  padding-bottom: 5rem;
}

.article__headline {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.75rem;
}

.article__meta {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-rule);
  margin-bottom: 2rem;
}

/* ── Prose (markdown body) ────────────────────────── */
.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  font-family: var(--font-heading);
  line-height: 1.25;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.prose h1 { font-size: 1.75rem; }
.prose h2 { font-size: 1.5rem; }
.prose h3 { font-size: 1.25rem; }
.prose h4 { font-size: 1.125rem; }

.prose p { margin-bottom: 1.25rem; }

.prose ul,
.prose ol {
  margin-bottom: 1.25rem;
  padding-left: 1.75rem;
}

.prose li { margin-bottom: 0.375rem; }

.prose strong { font-weight: 700; }
.prose em    { font-style: italic; }

.prose hr {
  border: none;
  border-top: 1px solid var(--color-rule);
  margin: 2rem 0;
}

.prose blockquote {
  border-left: 2px solid var(--color-rule);
  padding-left: 1rem;
  color: #444;
  font-style: italic;
  margin: 1.5rem 0;
}

.prose a {
  color: var(--color-text);
  text-decoration: underline;
}

/* ── Footer ───────────────────────────────────────── */
.site-footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid var(--color-rule);
  font-size: 0.6875rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-top: 4rem;
}
```

- [ ] **Step 2: Create Base.astro**

Create `src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
}

const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — Trading Research</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Verify layout renders**

```bash
npm run dev
```

Visit `http://localhost:4321`. Expected: cream (`#faf8f4`) background is visible; browser dev tools show Playfair Display loading from Google Fonts. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/Base.astro
git commit -m "feat: add Base layout and New Yorker global styles"
```

---

## Task 6: Build the main index page

**Files:**
- Modify: `src/pages/index.astro` (replace entire file)

- [ ] **Step 1: Replace index.astro**

Replace the entire contents of `src/pages/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import { parseEntry } from '../lib/reports';

const entries = await getCollection('reports');

// Group by ticker → collect unique dates
const tickerMap = new Map<string, Set<string>>();
for (const entry of entries) {
  const { ticker, date } = parseEntry(entry.id);
  if (!tickerMap.has(ticker)) tickerMap.set(ticker, new Set());
  tickerMap.get(ticker)!.add(date);
}

const tickers = [...tickerMap.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([ticker, dates]) => ({
    ticker,
    dates: [...dates].sort((a, b) => b.localeCompare(a)), // newest first
  }));
---

<Base title="Trading Research">
  <header class="masthead">
    <div class="container">
      <h1 class="masthead__title">Trading Research</h1>
      <p class="masthead__subtitle">Analysis &amp; Reports</p>
    </div>
  </header>

  <main class="container">
    <div class="ticker-grid">
      {tickers.map(({ ticker, dates }) => (
        <div class="ticker-card">
          <div class="ticker-card__symbol">{ticker}</div>
          <ul class="ticker-card__dates">
            {dates.map(date => (
              <li>
                <a href={`/${ticker}/${date}/`}>{date}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">Trading Research</div>
  </footer>
</Base>
```

- [ ] **Step 2: Verify with dev server**

```bash
npm run dev
```

Visit `http://localhost:4321`. Expected: cream background, "Trading Research" masthead in Playfair Display with thin rule below, one bordered card per ticker showing date links. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build main index page with ticker cards"
```

---

## Task 7: Build the report date index page

**Files:**
- Create: `src/pages/[ticker]/[date]/index.astro`

- [ ] **Step 1: Create the directory and page**

Create `src/pages/[ticker]/[date]/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import Base from '../../../layouts/Base.astro';
import { parseEntry, humanize } from '../../../lib/reports';

export async function getStaticPaths() {
  const entries = await getCollection('reports');

  // Group by "TICKER__DATE" (double underscore avoids splitting on ticker chars)
  const groups = new Map<string, CollectionEntry<'reports'>[]>();
  for (const entry of entries) {
    const { ticker, date } = parseEntry(entry.id);
    const key = `${ticker}__${date}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  return [...groups.entries()].map(([key, groupEntries]) => {
    const sep = key.indexOf('__');
    const ticker = key.slice(0, sep);
    const date = key.slice(sep + 2);
    return {
      params: { ticker, date },
      props: { entries: groupEntries },
    };
  });
}

interface Props {
  entries: CollectionEntry<'reports'>[];
}

const { ticker, date } = Astro.params;
const { entries } = Astro.props;

const reports = entries
  .map(e => ({ name: parseEntry(e.id).reportName }))
  .sort((a, b) => a.name.localeCompare(b.name));
---

<Base title={`${ticker} — ${date}`}>
  <main class="container" style="padding-top: 2.5rem;">
    <nav class="breadcrumb">
      <a href="/">Home</a>
      <span class="breadcrumb__sep">→</span>
      <span>{ticker} — {date}</span>
    </nav>

    <div class="section-header">
      <h1 class="section-header__ticker">{ticker}</h1>
      <p class="section-header__date">{date}</p>
    </div>

    <ol class="report-toc">
      {reports.map((r, i) => (
        <li class="report-toc__item">
          <span class="report-toc__number">{String(i + 1).padStart(2, '0')}</span>
          <a class="report-toc__link" href={`/${ticker}/${date}/${r.name}/`}>
            {humanize(r.name)}
          </a>
        </li>
      ))}
    </ol>
  </main>

  <footer class="site-footer">
    <div class="container">Trading Research</div>
  </footer>
</Base>
```

- [ ] **Step 2: Verify with dev server**

```bash
npm run dev
```

Click a date link from the index. Expected: breadcrumb at top, ticker symbol as large heading, date as small uppercase byline, numbered list of humanized report names as links. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/[ticker]/[date]/index.astro"
git commit -m "feat: build report date index page"
```

---

## Task 8: Build the individual report page

**Files:**
- Create: `src/pages/[ticker]/[date]/[report].astro`

- [ ] **Step 1: Create the report page**

Create `src/pages/[ticker]/[date]/[report].astro`:

```astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import Base from '../../../layouts/Base.astro';
import { parseEntry, humanize } from '../../../lib/reports';

export async function getStaticPaths() {
  const entries = await getCollection('reports');
  return entries.map(entry => {
    const { ticker, date, reportName } = parseEntry(entry.id);
    return {
      params: { ticker, date, report: reportName },
      props: { entry },
    };
  });
}

interface Props {
  entry: CollectionEntry<'reports'>;
}

const { ticker, date, report } = Astro.params;
const { entry } = Astro.props;
const { Content } = await entry.render();
---

<Base title={`${humanize(report)} — ${ticker}`}>
  <main class="container" style="padding-top: 2.5rem;">
    <nav class="breadcrumb">
      <a href="/">Home</a>
      <span class="breadcrumb__sep">→</span>
      <a href={`/${ticker}/${date}/`}>{ticker} — {date}</a>
      <span class="breadcrumb__sep">→</span>
      <span>{humanize(report)}</span>
    </nav>

    <article class="article">
      <h1 class="article__headline">{humanize(report)}</h1>
      <p class="article__meta">{ticker} · {date}</p>
      <div class="prose">
        <Content />
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <div class="container">Trading Research</div>
  </footer>
</Base>
```

- [ ] **Step 2: Verify with dev server**

```bash
npm run dev
```

Navigate from index → date index → a report. Expected: editorial headline in Playfair Display, `TICKER · DATE` meta line in small caps, full markdown content rendered with serif typography, correct heading hierarchy, no unstyled elements. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/[ticker]/[date]/[report].astro"
git commit -m "feat: build individual report page with styled markdown"
```

---

## Task 9: Configure Netlify and verify full build

**Files:**
- Modify: `astro.config.mjs`
- Create: `netlify.toml`
- Verify: `.gitignore`

- [ ] **Step 1: Update astro.config.mjs**

Replace the contents of `astro.config.mjs`:

```mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
});
```

- [ ] **Step 2: Create netlify.toml**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 3: Verify .gitignore**

Open `.gitignore` and confirm it contains (add any missing lines):

```
dist/
.astro/
node_modules/
.env
.env.*
!.env.example
```

`src/content/reports/` must NOT appear in `.gitignore`.

- [ ] **Step 4: Run a full production build**

```bash
npm run build
```

Expected: Build completes with no errors. `dist/` contains generated HTML for all routes — verify with:

```bash
find dist -name "*.html" | sort
```

Expected output includes entries like:
```
dist/index.html
dist/B/2026-05-02/index.html
dist/B/2026-05-02/final_trade_decision/index.html
dist/PG/2026-05-03/index.html
dist/PG/2026-05-03/investment_plan/index.html
```
(exact paths depend on your data)

- [ ] **Step 5: Preview the production build**

```bash
npm run preview
```

Navigate the full site from index to a report. Verify fonts, styles, breadcrumbs, and markdown all render correctly. Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs netlify.toml .gitignore
git commit -m "feat: configure static output and Netlify build"
```

---

## Task 10: Commit docs and push to Netlify

- [ ] **Step 1: Commit design and plan docs**

```bash
git add docs/
git commit -m "docs: add design spec and implementation plan"
```

- [ ] **Step 2: Push to GitHub**

Create a new GitHub repository (e.g., `reports`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/reports.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Connect Netlify**

In the Netlify dashboard → "Add new site" → "Import an existing project":
- Repository: the one pushed above
- Branch: `main`
- Build command: `npm run build`
- Publish directory: `dist`

Netlify auto-deploys on every push to `main`.

- [ ] **Step 4: Verify Netlify deploy succeeds**

Check the Netlify deploy log. Expected: build passes, site is live at the Netlify URL.

---

## Future workflow: publishing new reports

Each time new reports appear in `~/.tradingagents/logs/`:

```bash
./scripts/sync-reports.sh
git add src/content/reports/
git commit -m "update reports"
git push
```

Netlify deploys automatically on push.
