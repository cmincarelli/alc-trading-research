The request to retrieve stock data for ABBV encountered an error due to the API endpoint being premium-tier only. This indicates either:

1. **Free-tier limitations**: The Alpha Vantage API used here requires a premium subscription for historical data beyond certain date ranges or granularities.
2. **Subscription verification**: Ensure your account has an active premium plan for the `TIME_SERIES_DAILY` or `TIME_SERIES_INTRADAY` endpoints.

To proceed, you would need to:
- Verify your subscription status with Alpha Vantage.
- Upgrade to a premium plan if necessary.
- Retry the request with valid credentials.

Without access to the OHLCV data, we cannot compute technical indicators. Let me know if you'd like to explore alternative strategies or check other tickers with available data.