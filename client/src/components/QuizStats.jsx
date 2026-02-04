import { CheckCircle2, Clock } from 'lucide-react';

const QuizStats = ({ correct, total, timedMode, timeRemaining }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 h-full">
      <div className="flex items-center gap-6 h-full">
        {/* Correct stat */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
              Correct
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                {correct}
              </span>
              <span className="text-gray-400 text-sm font-medium">
                / {total}
              </span>
            </div>
          </div>
        </div>

        {/* Time Remaining stat (if timed mode) */}
        {timedMode && (
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
                Time Left
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizStats;
