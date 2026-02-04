import { useState, useEffect } from 'react';
import { Play, Clock } from 'lucide-react';
import QuizHeader from './components/QuizHeader';
import QuizStats from './components/QuizStats';
import QuizControls from './components/QuizControls';
import TableView from './components/TableView';
import TilesView from './components/TilesView';

function App() {
  const [companies, setCompanies] = useState([]);
  const [revealedCompanies, setRevealedCompanies] = useState(new Set());
  const [view, setView] = useState('table');
  const [guess, setGuess] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timer state
  const [gameStarted, setGameStarted] = useState(false);
  const [timedMode, setTimedMode] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  // Load quiz data
  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      const response = await fetch('/api/quiz-data');
      const data = await response.json();
      setCompanies(data.companies);
      setLastUpdated(data.lastUpdated);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
      setLoading(false);
    }
  };

  const normalizeCompanyName = (name) => {
    return name
      .toLowerCase()
      .replace(/\s*(inc\.|incorporated|corp\.|corporation|ltd\.|limited|llc|plc|n\.v\.|ag|se|s\.a\.|sa|s\.p\.a\.)\.?$/i, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters (spaces, special chars)
      .trim();
  };

  // Timer countdown
  useEffect(() => {
    if (gameStarted && timedMode && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameStarted(false);
            alert('Time\'s up! The quiz has ended.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, timedMode, timeRemaining]);

  // Handle guessing
  useEffect(() => {
    if (!gameStarted || !guess || guess.trim().length < 3) return;

    const normalizedGuess = guess.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    // Require minimum 3 characters for any match
    if (normalizedGuess.length < 3) return;

    console.log('Checking guess:', normalizedGuess);
    let foundMatch = false;

    companies.forEach(company => {
      if (revealedCompanies.has(company.rank)) return;

      const normalizedCompany = normalizeCompanyName(company.name);
      const normalizedTicker = company.ticker.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Exact ticker match
      const tickerMatch = normalizedTicker === normalizedGuess;

      // Exact full company name match (normalized: no spaces, no special chars, case insensitive)
      const nameMatch = normalizedCompany === normalizedGuess;

      if (tickerMatch || nameMatch) {
        console.log('MATCH FOUND!', company.name, 'ticker:', normalizedTicker, 'normalized:', normalizedCompany);
        revealCompany(company.rank);
        foundMatch = true;
      }
    });

    // Clear input after successful match
    if (foundMatch) {
      console.log('Clearing input');
      setGuess('');
    } else {
      console.log('No match found for:', normalizedGuess);
    }
  }, [guess, companies, revealedCompanies, gameStarted]);

  const revealCompany = (rank) => {
    setRevealedCompanies(prev => new Set([...prev, rank]));
  };

  const giveUp = () => {
    if (window.confirm('Are you sure you want to reveal all companies?')) {
      setRevealedCompanies(new Set(companies.map(c => c.rank)));
      if (timedMode) {
        setTimeRemaining(0);
      }
    }
  };

  const startGame = (timed) => {
    setTimedMode(timed);
    setGameStarted(true);
    setRevealedCompanies(new Set());
    setGuess('');
    if (timed) {
      setTimeRemaining(600); // Reset to 10 minutes
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = {
    correct: revealedCompanies.size,
    total: companies.length,
    percent: companies.length > 0
      ? Math.round((revealedCompanies.size / companies.length) * 100)
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <QuizHeader
            title="Top 100 Companies by Market Cap (LIVE)"
            subtitle="Can you name them all?"
            lastUpdated={lastUpdated}
          />

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Start?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Choose your game mode
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => startGame(true)}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div>Start Timed</div>
                  <div className="text-sm font-normal opacity-90">10 minutes</div>
                </div>
              </button>

              <button
                onClick={() => startGame(false)}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Clock className="w-6 h-6" />
                <div className="text-left">
                  <div>Play Untimed</div>
                  <div className="text-sm font-normal opacity-90">No time limit</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-[1600px] mx-auto">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <QuizHeader
            title="Top 100 Companies by Market Cap"
            subtitle="Can you name them all?"
            lastUpdated={lastUpdated}
          />
        </div>

        {/* Sticky Stats and Controls */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="lg:w-auto">
              <QuizStats
                correct={stats.correct}
                total={stats.total}
                timedMode={timedMode}
                timeRemaining={timeRemaining}
              />
            </div>

            <div className="flex-1">
              <QuizControls
                searchTerm={guess}
                onSearchChange={setGuess}
                viewMode={view}
                onViewModeChange={setView}
                onGiveUp={giveUp}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {view === 'table' ? (
              <TableView
                companies={companies}
                revealedCompanies={revealedCompanies}
              />
            ) : (
              <TilesView
                companies={companies}
                revealedCompanies={revealedCompanies}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
