const express = require('express');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { runUpdate } = require('./src/update');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve React app (production build)
app.use(express.static(path.join(__dirname, 'public/dist')));

// Serve admin panel (legacy)
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// API endpoint to get quiz data
app.get('/api/quiz-data', (req, res) => {
    const dataPath = path.join(__dirname, 'data', 'quiz-data.json');

    if (!fs.existsSync(dataPath)) {
        return res.status(404).json({
            error: 'Quiz data not found. Please run an update first.'
        });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
});

// API endpoint to manually trigger update
app.post('/api/trigger-update', async (req, res) => {
    try {
        console.log('\n🔄 Manual update triggered via API');
        res.json({
            status: 'started',
            message: 'Update started. Check server logs for progress.'
        });

        // Run update asynchronously
        runUpdate().catch(error => {
            console.error('❌ Update failed:', error);
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// API endpoint to get update status/logs
app.get('/api/update-status', (req, res) => {
    const logPath = path.join(__dirname, 'logs', 'update.log');

    if (!fs.existsSync(logPath)) {
        return res.json({
            status: 'no_logs',
            message: 'No update logs found'
        });
    }

    const logs = fs.readFileSync(logPath, 'utf8');
    const lines = logs.split('\n').slice(-50); // Last 50 lines

    res.json({
        status: 'success',
        logs: lines.join('\n')
    });
});

// SPA fallback - serve React app for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dist/index.html'));
});

// Schedule daily updates at 6 PM ET (22:00 UTC in winter, 23:00 UTC in summer)
// For simplicity, using 22:00 UTC (adjust based on DST if needed)
cron.schedule('0 22 * * *', () => {
    console.log('\n⏰ Scheduled update triggered at 6 PM ET');
    runUpdate().catch(error => {
        console.error('❌ Scheduled update failed:', error);
    });
}, {
    timezone: 'America/New_York'
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Quiz available at http://localhost:${PORT}`);
    console.log(`🎛️  Admin panel at http://localhost:${PORT}/admin`);
    console.log(`⏰ Daily updates scheduled for 6 PM ET`);
    console.log(`\n💡 Run an initial update with: npm run update\n`);
});
