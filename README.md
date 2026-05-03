# Trading Reports Viewer

A static site for browsing AI-generated trading analysis reports. Built with Astro 6, styled in a New Yorker editorial aesthetic. Deployed to Netlify on push to main.

## Overview

Reports are sourced from `~/.tradingagents/logs/` and organised as:

```
logs/
  [TICKER]/
    [DATE]/
      reports/
        investment_plan.md
        fundamentals_report.md
        market_report.md
        news_report.md
        sentiment_report.md
        final_trade_decision.md    (when present)
        trader_investment_plan.md  (when present)
```

The site generates three levels of pages:

- `/` — index of all tickers, each as a card with report dates linked
- `/[TICKER]/[DATE]/` — table of contents for one analysis run
- `/[TICKER]/[DATE]/[report]/` — full styled article for an individual report

## Commands

| Command           | Action                                                  |
| :---------------- | :------------------------------------------------------ |
| `npm run sync`    | Copy latest reports from `~/.tradingagents/logs/`       |
| `npm run dev`     | Start local dev server at `localhost:4321`              |
| `npm run build`   | Build static site to `./dist/`                          |
| `npm run preview` | Preview the production build locally                    |
| `npm test`        | Run unit tests (Vitest)                                 |

## Publishing new reports

```bash
npm run sync
git add src/content/reports/
git commit -m "update reports"
git push
```

Netlify deploys automatically on push to `main`.

## Project structure

```
reports/
  scripts/
    sync-reports.sh       # rsync from ~/.tradingagents/logs/
  src/
    content/
      reports/            # synced report markdown (committed to git)
    content.config.ts     # Astro Content Collection definition
    lib/
      reports.ts          # parseEntry() and humanize() helpers
      reports.test.ts     # Vitest unit tests
    layouts/
      Base.astro          # HTML shell with Google Fonts and global CSS
    pages/
      index.astro
      [ticker]/[date]/
        index.astro
        [report].astro
    styles/
      global.css          # New Yorker typography and layout
  netlify.toml
```

## Tech stack

- [Astro 6](https://astro.build) — static site generator
- [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) — editorial heading font
- [Vitest](https://vitest.dev) — unit testing
- [Netlify](https://netlify.com) — hosting
