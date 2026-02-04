const axios = require('axios');

/**
 * Validates market cap data by comparing with Yahoo Finance
 * @param {Array} companies - Array of company objects from scraper
 * @returns {Promise<Object>} Validation results with statistics
 */
async function validateWithYahooFinance(companies) {
  console.log(`\nValidating ${companies.length} companies with Yahoo Finance...`);

  const results = {
    validated: [], // Within 0.1% tolerance
    warnings: [],  // 0.1% - 1% variance
    errors: [],    // >1% variance
    notFound: [],  // Ticker not found in Yahoo Finance
    failed: [],    // API call failed
    timestamp: new Date().toISOString()
  };

  // Fetch all companies in parallel (with some rate limiting)
  const batchSize = 10; // Process 10 at a time to avoid overwhelming API

  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    const promises = batch.map(company => validateCompany(company));

    const batchResults = await Promise.all(promises);

    // Categorize results
    batchResults.forEach((result, idx) => {
      if (result.status === 'validated') {
        results.validated.push(result);
      } else if (result.status === 'warning') {
        results.warnings.push(result);
      } else if (result.status === 'error') {
        results.errors.push(result);
      } else if (result.status === 'not_found') {
        results.notFound.push(result);
      } else if (result.status === 'failed') {
        results.failed.push(result);
      }
    });

    // Show progress
    console.log(`  Processed ${Math.min(i + batchSize, companies.length)}/${companies.length} companies`);

    // Small delay between batches to be nice to the API
    if (i + batchSize < companies.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Print summary
  console.log('\n=== VALIDATION SUMMARY ===');
  console.log(`✅ Validated (≤0.1%): ${results.validated.length}`);
  console.log(`⚠️  Warnings (0.1%-1%): ${results.warnings.length}`);
  console.log(`🚨 Errors (>1%): ${results.errors.length}`);
  console.log(`❓ Not Found: ${results.notFound.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  return results;
}

/**
 * Validates a single company against Yahoo Finance using direct API call
 * @param {Object} company - Company object with ticker and marketCap
 * @returns {Promise<Object>} Validation result
 */
async function validateCompany(company) {
  try {
    // Use Yahoo Finance Query API
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${company.ticker}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000,
      validateStatus: () => true // Don't throw on any status
    });

    if (response.status !== 200 || !response.data || !response.data.chart || !response.data.chart.result) {
      return {
        status: 'not_found',
        company: company.name,
        ticker: company.ticker,
        message: 'Ticker not found or no data available'
      };
    }

    const result = response.data.chart.result[0];
    const meta = result?.meta;

    if (!meta || !meta.regularMarketPrice) {
      return {
        status: 'not_found',
        company: company.name,
        ticker: company.ticker,
        message: 'No market data available'
      };
    }

    // Calculate market cap from price and shares outstanding
    // Note: Yahoo Finance API doesn't always provide direct market cap in this endpoint
    // We'll need to use a different approach - get quote summary
    const quoteUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${company.ticker}?modules=price`;
    const quoteResponse = await axios.get(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000,
      validateStatus: () => true
    });

    if (quoteResponse.status !== 200 || !quoteResponse.data?.quoteSummary?.result) {
      return {
        status: 'not_found',
        company: company.name,
        ticker: company.ticker,
        message: 'Quote data not available'
      };
    }

    const priceData = quoteResponse.data.quoteSummary.result[0]?.price;
    const yahooMarketCap = priceData?.marketCap?.raw;

    if (!yahooMarketCap) {
      return {
        status: 'not_found',
        company: company.name,
        ticker: company.ticker,
        message: 'Market cap not available in Yahoo Finance'
      };
    }

    const scraperMarketCap = company.marketCap;

    // Calculate percentage difference
    const variance = Math.abs((yahooMarketCap - scraperMarketCap) / scraperMarketCap) * 100;

    // Determine status based on variance
    let status;
    if (variance <= 0.1) {
      status = 'validated';
    } else if (variance <= 1.0) {
      status = 'warning';
    } else {
      status = 'error';
    }

    return {
      status,
      company: company.name,
      ticker: company.ticker,
      rank: company.rank,
      scraperMarketCap,
      yahooMarketCap,
      variance: variance.toFixed(4),
      variancePercent: `${variance.toFixed(4)}%`,
      message: `Variance: ${variance.toFixed(4)}%`
    };

  } catch (error) {
    return {
      status: 'failed',
      company: company.name,
      ticker: company.ticker,
      message: `API call failed: ${error.message}`
    };
  }
}

/**
 * Check if validation results are acceptable for update
 * @param {Object} results - Validation results from validateWithYahooFinance
 * @returns {Object} Decision object with shouldUpdate flag and reason
 */
function shouldProceedWithUpdate(results) {
  const totalCompanies = results.validated.length +
                        results.warnings.length +
                        results.errors.length +
                        results.notFound.length +
                        results.failed.length;

  // Abort conditions
  if (results.errors.length > 10) {
    return {
      shouldUpdate: false,
      reason: `Too many validation errors: ${results.errors.length} companies with >1% variance`
    };
  }

  if (results.notFound.length > 20) {
    return {
      shouldUpdate: false,
      reason: `Too many tickers not found: ${results.notFound.length} companies`
    };
  }

  if (results.failed.length > 20) {
    return {
      shouldUpdate: false,
      reason: `Too many API failures: ${results.failed.length} companies`
    };
  }

  // Proceed with update
  return {
    shouldUpdate: true,
    reason: 'Validation passed quality checks',
    stats: {
      total: totalCompanies,
      validated: results.validated.length,
      warnings: results.warnings.length,
      errors: results.errors.length,
      notFound: results.notFound.length,
      failed: results.failed.length
    }
  };
}

module.exports = {
  validateWithYahooFinance,
  validateCompany,
  shouldProceedWithUpdate
};
