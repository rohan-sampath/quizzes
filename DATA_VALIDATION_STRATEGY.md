# Data Validation Strategy

## Two Independent Data Sources

### 1. CompaniesMarketCap.com (Primary)
- **URL:** https://companiesmarketcap.com/
- **Method:** Web scraping (BeautifulSoup/Playwright - NOT an API)
- **Data provided:** Rank, Company Name, Ticker, Market Cap, Country, Logo
- **Data point:** Closing market cap (page shows latest closing prices)
- **Role:** Primary source for rankings and all company data
- **Note:** Need to inspect page structure to build scraper

### 2. Yahoo Finance (Validation)
- **Method:** yfinance Python library or Yahoo Finance API
- **Data provided:** Company Name, Ticker, Market Cap (closing), Country (via ticker lookup)
- **Data point:** Previous trading day's closing market cap
- **Role:** Validation source to cross-check market cap accuracy
- **Pros:** Reliable, widely used, free access, good historical data

**Note on Google Finance:** Google Finance API was discontinued years ago. Not used.

## Data Validation Logic

### Market Cap Validation (Primary Numeric Field)

**Critical Requirements:**
- **Data Point:** Use CLOSING market cap from previous trading day (not live/after-hours)
- **Timing:** Both sources must be queried within seconds of each other (parallel requests)
- **Tolerance:** ±0.1% variance between sources considered acceptable
- **Rationale:** Since we're comparing the same closing price from the same day, sources should be nearly identical. Larger discrepancies indicate data quality issues.

**Validation Rules (2 sources):**
1. If both sources within 0.1% variance → ✅ Validation passed, use CompaniesMarketCap.com value
2. If sources differ by >0.1% but <1% → ⚠️ Warning logged, use CompaniesMarketCap.com value, flag for review
3. If sources differ by >1% → 🚨 Validation failed, log error, use CompaniesMarketCap.com value, alert sent

### Non-Numeric Fields Validation

**Company Name:**
- Allow minor variations (e.g., "Apple Inc." vs "Apple Inc" vs "Apple")
- Normalize by removing common suffixes (Inc., Corp., Ltd., etc.)
- If normalized names don't match → Use CompaniesMarketCap.com value, log warning

**Stock Ticker:**
- Use ticker from CompaniesMarketCap.com to query Yahoo Finance
- Validate that ticker exists in Yahoo Finance
- If ticker not found in Yahoo Finance → Log error, cannot validate market cap for this company

**Country:**
- Primary source: CompaniesMarketCap.com
- Optionally validate against Yahoo Finance exchange info

**Rank:**
- Source: CompaniesMarketCap.com (1-100)
- Validate that market caps are in descending order
- If not in order → Flag inconsistency warning

**Logo:**
- Source: CompaniesMarketCap.com (scrape image URL)
- No validation needed from Yahoo Finance

## Retry Logic

### Parallel Data Fetching

**Critical Requirement:**
- Both sources MUST be queried simultaneously
- Time window: All requests must complete within 10 seconds of first request
- Purpose: Ensure we're comparing identical closing prices, not prices from different time periods

**Implementation:**
- Scrape CompaniesMarketCap.com and query Yahoo Finance in parallel
- Use Promise.all() or equivalent for parallel execution
- If either source takes >10 seconds, treat as timeout failure

### API/Scraping Failures

**Retry Strategy:**
- Max retries: 3 attempts per source
- Backoff: Exponential (1s, 2s, 4s)
- Timeout: 10 seconds per request
- Retries executed in parallel where possible

**Failure Handling:**
1. **CompaniesMarketCap.com fails completely:**
   - Abort update process (this is our primary source)
   - Send critical alert
   - Log error: "Primary source (CompaniesMarketCap.com) unavailable"
   - Retain previous quiz data

2. **Yahoo Finance fails completely:**
   - Proceed with update using CompaniesMarketCap.com data only
   - Log warning: "Yahoo Finance unavailable, proceeding without validation"
   - Send alert notification about missing validation
   - Mark all companies as "unvalidated"

3. **Both sources fail:**
   - Abort update process
   - Send critical alert
   - Log error: "All data sources unavailable"
   - Retain previous quiz data

### Data Quality Issues

**Missing Companies:**
- If company in Top 100 per CompaniesMarketCap.com but ticker not found in Yahoo Finance:
  - Try alternate ticker symbols (e.g., different exchange suffixes)
  - If still not found: Include with warning flag, mark as "unvalidated"
  - Log: "Company X - ticker not found in Yahoo Finance, cannot validate market cap"

**Ticker Lookup Issues:**
- Some international companies may have different ticker formats
- Handle exchange-specific suffixes (e.g., .HK for Hong Kong, .L for London)
- Log all ticker resolution issues for review

## Update Decision Logic

```
For each company in Top 100:
  1. Scrape data from CompaniesMarketCap.com (rank, name, ticker, market cap, country, logo)
  2. Query Yahoo Finance in parallel using ticker from step 1
  3. Compare market caps (0.1% tolerance for closing prices)
  4. Validation outcomes:
     - Within 0.1%: ✅ Validated, include in quiz
     - 0.1% - 1%: ⚠️ Warning, include in quiz with flag
     - >1%: 🚨 Error, include in quiz with error flag
     - Ticker not found: Include with "unvalidated" flag
  5. Always use CompaniesMarketCap.com data for final quiz

If >10 companies have validation errors (>1% difference):
  - Abort update (too many validation issues indicate systemic problem)
  - Alert for manual investigation

If ≤10 companies have errors:
  - Proceed with update
  - Log all warnings and errors for review
  - Send summary report with validation statistics
```

## Logging and Monitoring

**Log every update with:**
- Timestamp
- Number of companies fully validated (within 0.1% variance)
- Number of companies with warnings (0.1% - 1% variance)
- Number of companies with errors (>1% variance)
- Number of companies unvalidated (ticker not found in Yahoo Finance)
- Source availability status (CompaniesMarketCap.com and Yahoo Finance)
- Total update duration
- Sample of validation results (first 5 companies with their variance %)

**Alert conditions:**
- CompaniesMarketCap.com unavailable (abort update)
- Yahoo Finance unavailable (warning - proceed without validation)
- 10+ companies with validation errors (>1% variance)
- 20+ companies unvalidated (tickers not found)
- Market cap data differs by >1% for >10% of companies
- Update process takes >15 minutes (indicates scraping/API issues)
- CompaniesMarketCap.com structure changed (scraper broke)
