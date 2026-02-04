const fs = require('fs');
const path = require('path');
const { scrapeCompaniesMarketCap } = require('./scrapers/companiesMarketCap');

/**
 * Main update function - fetches and saves quiz data
 */
async function runUpdate() {
    const startTime = Date.now();
    console.log('\n=================================');
    console.log('🔄 STARTING QUIZ DATA UPDATE');
    console.log('=================================\n');

    try {
        // Step 1: Scrape CompaniesMarketCap.com
        console.log('📊 Step 1: Scraping CompaniesMarketCap.com...');
        const companies = await scrapeCompaniesMarketCap();

        if (companies.length === 0) {
            throw new Error('No companies scraped');
        }

        console.log(`✅ Successfully scraped ${companies.length} companies\n`);

        // Step 2: Validation (optional - Yahoo Finance currently has access issues)
        console.log('📊 Step 2: Validation');
        console.log('ℹ️  Yahoo Finance validation skipped (API access issues)');
        console.log('ℹ️  Using CompaniesMarketCap.com as single source of truth\n');

        // Step 3: Save data
        console.log('📊 Step 3: Saving data...');
        const dataPath = path.join(__dirname, '..', 'data', 'quiz-data.json');

        // Ensure data directory exists
        const dataDir = path.dirname(dataPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const quizData = {
            companies: companies,
            lastUpdated: new Date().toISOString(),
            totalCompanies: companies.length,
            source: 'CompaniesMarketCap.com',
            updateDuration: 0 // Will be set below
        };

        fs.writeFileSync(dataPath, JSON.stringify(quizData, null, 2));
        console.log(`✅ Data saved to ${dataPath}\n`);

        // Update duration
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        quizData.updateDuration = duration;
        fs.writeFileSync(dataPath, JSON.stringify(quizData, null, 2));

        // Log results
        console.log('=================================');
        console.log('✅ UPDATE COMPLETED SUCCESSFULLY');
        console.log('=================================');
        console.log(`⏱️  Duration: ${duration} seconds`);
        console.log(`📊 Companies: ${companies.length}`);
        console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
        console.log('=================================\n');

        // Save to log file
        saveToLog({
            success: true,
            timestamp: new Date().toISOString(),
            companies: companies.length,
            duration: duration
        });

        return quizData;

    } catch (error) {
        console.error('\n❌ UPDATE FAILED');
        console.error('Error:', error.message);
        console.error(error.stack);

        // Save error to log
        saveToLog({
            success: false,
            timestamp: new Date().toISOString(),
            error: error.message,
            duration: ((Date.now() - startTime) / 1000).toFixed(2)
        });

        throw error;
    }
}

/**
 * Save update log
 */
function saveToLog(logEntry) {
    const logPath = path.join(__dirname, '..', 'logs', 'update.log');
    const logDir = path.dirname(logPath);

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logLine = `[${logEntry.timestamp}] ${logEntry.success ? 'SUCCESS' : 'FAILED'} - ` +
                   `Companies: ${logEntry.companies || 'N/A'}, Duration: ${logEntry.duration}s` +
                   (logEntry.error ? `, Error: ${logEntry.error}` : '') + '\n';

    fs.appendFileSync(logPath, logLine);
}

// If run directly
if (require.main === module) {
    runUpdate()
        .then(() => {
            console.log('Update completed. You can now start the server with: npm start');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Update failed:', error);
            process.exit(1);
        });
}

module.exports = { runUpdate };
