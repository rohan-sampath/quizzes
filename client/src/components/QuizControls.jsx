import { Table2, Grid3x3, Flag } from 'lucide-react';

const QuizControls = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onGiveUp
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 h-full">
      <div className="flex flex-col lg:flex-row gap-4 h-full items-center">
        {/* Guess Input */}
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Type a company name or ticker (3+ letters)..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 font-medium"
          />
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table2 className="w-5 h-5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => onViewModeChange('tiles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                viewMode === 'tiles'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              <span className="hidden sm:inline">Tiles</span>
            </button>
          </div>
        </div>

        {/* Give Up Button */}
        <button
          onClick={onGiveUp}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Flag className="w-5 h-5" />
          <span>Give Up</span>
        </button>
      </div>
    </div>
  );
};

export default QuizControls;
