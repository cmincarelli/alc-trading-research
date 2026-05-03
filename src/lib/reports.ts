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
    ticker: parts[0].toUpperCase(), // glob loader lowercases ids in Astro 6
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
