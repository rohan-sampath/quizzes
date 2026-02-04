const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes Top 100 companies data from CompaniesMarketCap.com
 * Returns: Array of company objects with rank, name, ticker, marketCap, country, logo
 */
async function scrapeCompaniesMarketCap() {
  try {
    console.log('Fetching data from CompaniesMarketCap.com...');
    const response = await axios.get('https://companiesmarketcap.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const companies = [];

    // Find all table rows (excluding ad rows)
    $('tbody tr').each((index, element) => {
      // Only get top 100
      if (companies.length >= 100) {
        return;
      }

      const row = $(element);

      // Extract rank (td:nth-child(2))
      const rankText = row.find('td.rank-td').text().trim();
      const rank = parseInt(rankText);

      // Extract name cell (td:nth-child(3))
      const nameCell = row.find('td.name-td');
      const name = nameCell.find('.company-name').text().trim();

      // Extract ticker
      const tickerElement = nameCell.find('.company-code');
      const ticker = tickerElement.text().trim();

      // Extract logo
      const logoImg = nameCell.find('.company-logo');
      const logoSrc = logoImg.attr('src');

      // Extract market cap (td:nth-child(4))
      // Use data-sort attribute for precise numeric value
      const marketCapCell = row.find('td').eq(3); // 4th td (index 3)
      const marketCapValue = parseFloat(marketCapCell.attr('data-sort')) || 0;
      const marketCapText = marketCapCell.text().trim();

      // Extract country (td:nth-child(8))
      const countryText = row.find('td').last().text().trim();

      // Clean country text (remove emoji if present)
      const country = countryText.replace(/[\u{1F1E0}-\u{1F1FF}]{2}/gu, '').trim();

      // Determine stock exchange based on ticker suffix and country
      const exchange = determineExchange(ticker, country);

      // Only add if we have essential data
      if (rank && name && marketCapValue) {
        companies.push({
          rank: rank,
          name: name,
          ticker: ticker || 'N/A',
          marketCap: marketCapValue,
          marketCapFormatted: marketCapText,
          country: country || 'Unknown',
          exchange: exchange,
          logo: logoSrc ? (logoSrc.startsWith('http') ? logoSrc : `https://companiesmarketcap.com${logoSrc}`) : null,
          source: 'CompaniesMarketCap.com',
          lastUpdated: new Date().toISOString()
        });
      }
    });

    console.log(`✓ Scraped ${companies.length} companies from CompaniesMarketCap.com`);
    return companies;

  } catch (error) {
    console.error('Error scraping CompaniesMarketCap.com:', error.message);
    throw new Error(`CompaniesMarketCap scraping failed: ${error.message}`);
  }
}

/**
 * Determine stock exchange based on ticker and country
 */
function determineExchange(ticker, country) {
  if (!ticker) return 'Unknown';

  // Check for explicit exchange suffixes
  if (ticker.includes('.HK')) return 'HKEX';
  if (ticker.includes('.L')) return 'LSE';
  if (ticker.includes('.SS')) return 'SSE';
  if (ticker.includes('.SZ')) return 'SZSE';
  if (ticker.includes('.T')) return 'TSE';
  if (ticker.includes('.KS')) return 'KRX';
  if (ticker.includes('.PA')) return 'Euronext Paris';
  if (ticker.includes('.DE')) return 'XETRA';
  if (ticker.includes('.SW')) return 'SIX';
  if (ticker.includes('.AS')) return 'Euronext Amsterdam';

  // Infer from country for common cases
  switch(country) {
    case 'USA':
      return 'NYSE/NASDAQ';
    case 'China':
      return 'SSE/SZSE';
    case 'Japan':
      return 'TSE';
    case 'Hong Kong':
      return 'HKEX';
    case 'UK':
    case 'United Kingdom':
      return 'LSE';
    case 'South Korea':
      return 'KRX';
    case 'India':
      return 'NSE/BSE';
    case 'Germany':
      return 'XETRA';
    case 'France':
      return 'Euronext Paris';
    case 'Switzerland':
      return 'SIX';
    case 'Canada':
      return 'TSX';
    case 'Australia':
      return 'ASX';
    default:
      return country;
  }
}

/**
 * Parse market cap text to numeric value
 * Examples: "$3.456 T" -> 3456000000000, "$123.45 B" -> 123450000000
 */
function parseMarketCap(text) {
  if (!text) return 0;

  // Remove $ and spaces
  text = text.replace(/\$/g, '').trim();

  // Extract number and unit
  const match = text.match(/([\d.,]+)\s*([TMB]?)/i);
  if (!match) return 0;

  const number = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2].toUpperCase();

  // Convert to actual value
  switch (unit) {
    case 'T':
      return number * 1e12;
    case 'B':
      return number * 1e9;
    case 'M':
      return number * 1e6;
    default:
      return number;
  }
}

module.exports = {
  scrapeCompaniesMarketCap,
  parseMarketCap
};
