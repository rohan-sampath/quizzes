# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL MISTAKES TO AVOID

**Learn from these errors made during initial development:**

### React + Tailwind CSS Setup Issues

1. **DO NOT use Tailwind CSS v4** - It has breaking changes and different syntax
   - v4 uses `@import "tailwindcss"` instead of `@tailwind` directives
   - v4 requires `@tailwindcss/postcss` package, not just `tailwindcss`
   - v4 has different configuration and is NOT backward compatible
   - **SOLUTION:** Use Tailwind CSS v3 (latest 3.x version) for stability

2. **ALWAYS test the full stack before presenting to user**
   - Build the app (`npm run build`)
   - Start the dev server (`npm run dev`)
   - Open in browser and verify all features work
   - Check browser console for JavaScript errors
   - Verify all Tailwind classes are rendering correctly

3. **Component prop mismatches will cause runtime errors**
   - When creating components, document expected props clearly
   - When using components, pass ALL required props
   - Example failures:
     - `QuizHeader` expects `title` and `subtitle` props - must pass them
     - `QuizStats` expects `correct`, `total`, `percentage` - not a `stats` object
     - Check prop types before rendering

4. **JavaScript type mismatches**
   - `Set.has()` not `Set.includes()` - caused crash in TableView/TilesView
   - Always verify data structure types (Set vs Array vs Object)
   - Test with actual data, not just type assumptions

5. **PostCSS configuration is REQUIRED for Tailwind**
   - Create `postcss.config.js` in client directory
   - Include both `tailwindcss` and `autoprefixer` plugins
   - Dev server must restart after config changes

6. **Vite proxy configuration**
   - Configure API proxy in `vite.config.js` to forward `/api` requests to backend
   - Build output directory must match server's static file serving path
   - Example: `build.outDir: '../public/dist'`

### General Development Mistakes

7. **Directory structure confusion**
   - Be aware of nested directories (e.g., `client/client` was created accidentally)
   - Always use absolute paths or verify `pwd` before running commands
   - Check file locations with `ls` before assuming structure

8. **Don't present incomplete work**
   - User said UI was "disgusting" because Tailwind wasn't loading
   - User saw "nothing" because of JavaScript errors
   - Always verify the output before claiming success

9. **Simplify when possible**
   - Started with vanilla JS, then rebuilt with React
   - Should have asked user preference before choosing tech stack
   - More complex !== better if it doesn't work

### Correct Tech Stack for This Project

**Backend:**
- Node.js + Express ✓
- Data stored in JSON files ✓
- node-cron for scheduling ✓

**Frontend (if React is needed):**
- React with Vite
- **Tailwind CSS v3.x** (NOT v4)
- Simple component structure
- Proper prop management

**Alternative (simpler):**
- Vanilla HTML/CSS/JS might be sufficient
- Less setup, fewer dependencies
- Easier to debug and maintain

## Project Overview

This project creates and maintains automatically-updated quiz applications with current data. The initial quiz tracks the Top 100 Public Companies by Market Cap, updated daily at 6 PM ET.

### Two-Phase Architecture

**V1: Self-Hosted Quiz Application (Current Priority)**
- Quiz hosted on owned domain (test on localhost first)
- Static frontend with dynamic JSON data backend
- Programmatic updates via data fetching and validation scripts
- HTML control panel with "Update Now" button for immediate updates
- Independent of JetPunk infrastructure

**V2: JetPunk Integration (Future)**
- Automated updates to JetPunk quizzes using browser automation (Playwright)
- Updates use JetPunk's "Edit HTML" feature with comma-delimited data
- Reuses data pipeline from V1

## V1 Architecture (Self-Hosted)

**Recommended Stack:**
- Frontend: HTML/CSS/JavaScript (reads from JSON data file)
- Backend: Node.js/Express (lightweight server + API for updates)
- Data Storage: JSON file (quiz-data.json) separate from application code
- Update Script: Fetches, validates, and writes to JSON file
- Scheduler: node-cron for scheduled updates
- Control Panel: HTML page with button that triggers API endpoint

**Key Design Principles:**
- Keep data separate from code (JSON file approach)
- Easy deployment to any hosting provider
- Update mechanism works identically for scheduled and manual triggers
- Single source of truth for quiz data

## Data Sources and Validation

**Primary Data: Top 100 Companies by Market Cap**
Required fields per company:
- Rank
- Logo (image/URL)
- Name
- Stock Ticker
- Market Cap (as of last check)
- Country

**Data Validation Requirements:**
- Must cross-reference at least THREE independent sources
- One source MUST be https://companiesmarketcap.com/
- Data should tally/match across sources before updating quiz

## Update Mechanisms

**Scheduled Updates:**
- Daily automatic update at 6 PM ET (when most world markets are closed)
- Implemented via cron job or task scheduler

**Manual Updates:**
- HTML-based trigger interface
- Button press executes the same update pipeline as scheduled updates
- Provides immediate "live" updates when needed

## Control Panel & Update Triggers

**HTML Control Interface:**
- Simple HTML page with "Update Now" button
- Clicking button sends POST request to backend API endpoint (e.g., `/api/trigger-update`)
- Backend executes the same update pipeline as scheduled updates
- Provides real-time feedback on update status

**Update Pipeline (both scheduled and manual):**
1. Fetch data from multiple sources
2. Validate and cross-reference data
3. Transform into required format
4. Write to quiz-data.json
5. Frontend automatically reflects new data on next load/refresh

## V2: Browser Automation (Future)

When implementing JetPunk integration:
- Use Playwright to navigate to JetPunk edit quiz page
- Use "Edit HTML" feature to bulk update quiz data
- Data format: comma-delimited for JetPunk table
- Reuse validated data from V1 pipeline

## Development Workflow

**Localhost Testing:**
- Run backend server locally (e.g., `npm start` or `node server.js`)
- Access quiz at http://localhost:PORT
- Access control panel at http://localhost:PORT/admin or similar
- Test manual updates via control panel
- Test scheduled updates via shortened cron intervals

**Deployment:**
- Frontend and backend can be deployed to any hosting provider
- Ensure JSON data file is writable by update scripts
- Configure cron jobs or equivalent for 6 PM ET daily updates
- Deploy to owned domain (not necessarily rohansampath.com/quizzes initially)

## Future Expansion

Project designed to support additional quizzes beyond the initial Top 100 Companies quiz. Architecture should be extensible for new quiz types with different data sources and update schedules.
