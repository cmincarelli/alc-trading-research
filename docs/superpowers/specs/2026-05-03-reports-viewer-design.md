# Trading Reports Viewer — Design Spec

**Date:** 2026-05-03  
**Status:** Approved

---

## Overview

A static Astro site that reads trading analysis reports from `~/.tradingagents/logs/` and presents them as a professional, editorial publication in the style of The New Yorker. The site is deployed to Netlify on push to main.

---

## Data Source & Structure

Reports are stored at `~/.tradingagents/logs/` with the following hierarchy:

```
logs/
  [TICKER]/
    [DATE]/           # ISO date, e.g. 2026-05-03
      reports/
        investment_plan.md
        fundamentals_report.md
        market_report.md
        news_report.md
        sentiment_report.md
        final_trade_decision.md       (optional)
        trader_investment_plan.md     (optional)
      message_tool.log                (ignored)
```

Reports are plain markdown files with rich prose content (analyst arguments, trade decisions, etc.). The `message_tool.log` file is not surfaced in the UI.

---

## Sync Script

**File:** `scripts/sync-reports.sh`

Copies reports from the local source into the Astro project before committing:

```sh
rsync -av ~/.tradingagents/logs/ src/content/reports/
```

`src/content/reports/` is committed to the repo so Netlify's build machine has access to the files. The workflow for publishing new reports is:

```sh
./scripts/sync-reports.sh
git add -A
git commit -m "update reports"
git push
```

---

## Architecture

**Framework:** Astro (static output)  
**Content:** Astro Content Collections — single collection `reports` backed by `src/content/reports/`  
**Deployment:** Netlify, build command `astro build`, publish dir `dist/`

A utility helper (`src/lib/reports.ts`) parses a Content Collection entry's slug into a structured object:

```ts
{ ticker: string, date: string, reportName: string }
```

It also provides a `humanize()` function that converts `final_trade_decision` → `"Final Trade Decision"`.

---

## Pages & Routing

### `src/pages/index.astro` — Main Index

- Masthead: "Trading Research" centered, large Playfair Display, thin rule below.
- One card per ticker, arranged in a clean grid.
- Each card: ticker symbol as large bold heading, report dates listed below as links to `/[ticker]/[date]/`.
- Cards bordered with a fine `1px` rule.

### `src/pages/[ticker]/[date]/index.astro` — Report Date Index

- Breadcrumb: `Home → [TICKER] → [DATE]`
- Ticker symbol as section title, date as subdued byline.
- Reports listed as a table-of-contents style index — humanized report name as a link to the individual page.

### `src/pages/[ticker]/[date]/[report].astro` — Individual Report

- Breadcrumb: `Home → [TICKER] → [DATE]`
- Humanized report name as large editorial headline.
- Thin rule separating header from body.
- Full markdown body rendered and styled.

All paths generated via `getStaticPaths()`.

---

## Visual Design

**Aesthetic:** New Yorker — upscale editorial typography, pure black/white/cream, no decoration beyond fine rules.

| Element | Value |
|---|---|
| Heading font | Playfair Display (Google Fonts) |
| Body font | Georgia, serif |
| Background | `#faf8f4` (cream) |
| Text | `#1a1a1a` (near-black) |
| Accent | `1px solid #1a1a1a` rules only |
| Max content width | `~70ch` for article body |
| Layout | Single centered column, generous whitespace |

No sidebars, no navigation bar, no hero images, no color beyond the palette above. Typography and whitespace carry the entire design.

**Markdown styling:** Headings, bold, lists, and blockquotes all inherit the serif aesthetic. Sufficient line-height and paragraph spacing to read comfortably as long-form prose.

---

## File Structure

```
reports/                          # project root
  scripts/
    sync-reports.sh
  src/
    content/
      reports/                    # synced from ~/.tradingagents/logs/
        config.ts                 # Content Collection definition
    lib/
      reports.ts                  # slug parser + humanize helper
    layouts/
      Base.astro                  # HTML shell, fonts, global styles
    pages/
      index.astro
      [ticker]/
        [date]/
          index.astro
          [report].astro
    styles/
      global.css                  # typography, prose, card styles
  docs/
    superpowers/
      specs/
        2026-05-03-reports-viewer-design.md
  astro.config.mjs
  package.json
  tsconfig.json
  netlify.toml
```

---

## Out of Scope

- Search or filtering
- Authentication
- `message_tool.log` display
- Dark mode
- RSS feed
