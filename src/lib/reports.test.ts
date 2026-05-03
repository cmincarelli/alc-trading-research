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
