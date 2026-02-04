import { Trophy, CheckCircle2, Clock } from 'lucide-react';

const QuizHeader = ({ title, subtitle, lastUpdated, correct, total, timedMode, timeRemaining }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
          <Trophy className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/90 text-lg font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Stats in Header */}
        {(correct !== undefined || (timedMode && timeRemaining !== undefined)) && (
          <div className="flex items-center gap-6">
            {/* Correct Count */}
            {correct !== undefined && (
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                <div className="text-right">
                  <div className="text-white/80 text-xs font-semibold uppercase tracking-wide">Correct</div>
                  <div className="text-white text-2xl font-bold">
                    {correct}<span className="text-white/70 text-lg"> / {total}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Time Remaining */}
            {timedMode && timeRemaining !== undefined && (
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl">
                <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                <div className="text-right">
                  <div className="text-white/80 text-xs font-semibold uppercase tracking-wide">Time Left</div>
                  <div className="text-white text-2xl font-bold">{formatTime(timeRemaining)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {lastUpdated && (
        <div className="flex items-center justify-end">
          <span className="text-white/80 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
            Data current as of: {new Date(lastUpdated).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'America/Los_Angeles',
              timeZoneName: 'short'
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default QuizHeader;
