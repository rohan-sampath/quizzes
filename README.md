# JetPunk Quizzes

An interactive quiz application featuring live market data for the top 100 companies by market capitalization.

## Features

- **Live Market Data**: Automatically scrapes and updates company data daily from CompaniesMarketCap.com
- **Two Game Modes**:
  - Timed mode (10 minutes)
  - Untimed mode (play at your own pace)
- **Smart Matching**: Type company names or ticker symbols to guess
- **Multiple Views**: Switch between table and tile layouts
- **Real-time Stats**: Track your progress with live correct count and timer
- **Responsive Design**: Beautiful UI built with React and Tailwind CSS

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS 4
- Lucide React (icons)

**Backend:**
- Node.js
- Express.js
- Axios + Cheerio (web scraping)
- node-cron (scheduled updates)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rohan-sampath/quizzes.git
cd quizzes
```

2. Install dependencies:
```bash
npm install
cd client && npm install
```

3. Run initial data scrape:
```bash
node src/update.js
```

4. Build the frontend:
```bash
cd client
npm run build
```

5. Start the server:
```bash
cd ..
npm start
```

6. Open your browser to `http://localhost:3000`

## Development

Run the frontend in development mode:
```bash
cd client
npm run dev
```

Run the backend:
```bash
npm start
```

## Data Updates

The app automatically updates company data daily at 6 PM ET. You can also trigger a manual update:

```bash
node src/update.js
```

Or via the API:
```bash
curl -X POST http://localhost:3000/api/trigger-update
```

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── App.jsx     # Main quiz logic
│   │   └── components/ # UI components
├── src/
│   ├── scrapers/       # Web scraping logic
│   ├── validators/     # Data validation
│   └── update.js       # Update orchestration
├── server.js           # Express backend
├── data/               # Quiz data (gitignored)
└── logs/               # Update logs (gitignored)
```

## API Endpoints

- `GET /api/quiz-data` - Fetch current quiz data
- `POST /api/trigger-update` - Manually trigger data update
- `GET /api/update-status` - Check update logs

## License

MIT

## Author

Rohan Sampath
