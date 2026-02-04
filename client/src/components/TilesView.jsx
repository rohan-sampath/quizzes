import { Building2, MapPin } from 'lucide-react';

const TilesView = ({ companies, revealedCompanies }) => {
  const expandCountryName = (countryName) => {
    const expansions = {
      'S. Arabia': 'Saudi Arabia',
      'S. Korea': 'South Korea',
    };
    return expansions[countryName] || countryName;
  };

  const getCountryFlag = (countryName) => {
    const flags = {
      'USA': '🇺🇸',
      'China': '🇨🇳',
      'Japan': '🇯🇵',
      'UK': '🇬🇧',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'India': '🇮🇳',
      'Canada': '🇨🇦',
      'South Korea': '🇰🇷',
      'S. Korea': '🇰🇷',
      'Australia': '🇦🇺',
      'Brazil': '🇧🇷',
      'Netherlands': '🇳🇱',
      'Switzerland': '🇨🇭',
      'Saudi Arabia': '🇸🇦',
      'S. Arabia': '🇸🇦',
      'Taiwan': '🇹🇼',
      'Hong Kong': '🇭🇰',
      'Sweden': '🇸🇪',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Denmark': '🇩🇰',
      'Ireland': '🇮🇪',
      'Singapore': '🇸🇬',
      'Belgium': '🇧🇪',
      'Mexico': '🇲🇽',
      'Norway': '🇳🇴',
      'Israel': '🇮🇱',
      'UAE': '🇦🇪',
    };
    return flags[countryName] || '🌐';
  };

  const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(3)}T (USD)`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B (USD)`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M (USD)`;
    return `$${value.toLocaleString()} (USD)`;
  };

  const isRevealed = (companyRank) => revealedCompanies?.has(companyRank);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {companies.map((company, index) => {
        const revealed = isRevealed(company.rank);
        return (
          <div
            key={company.id}
            className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
          >
            {/* Rank Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg">
                {index + 1}
              </span>
            </div>

            {/* Logo Section */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center h-40">
              {revealed ? (
                company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gray-200 backdrop-blur-sm animate-pulse" />
              )}
            </div>

            {/* Content Section */}
            <div className="p-6">
              {/* Company Name */}
              <div className="mb-4">
                {revealed ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                      {company.name}
                    </h3>
                    {company.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-6 w-full bg-gray-200 rounded backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                    </div>
                  </div>
                )}
              </div>

              {/* Ticker */}
              <div className="mb-4">
                {revealed ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-sm border-2 border-indigo-200">
                    {company.ticker}
                  </span>
                ) : (
                  <div className="h-7 w-20 bg-gray-200 rounded-lg backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                  </div>
                )}
              </div>

              {/* Market Cap - Always Visible (Hint) */}
              <div className="mb-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                <div className="mb-1">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Market Cap
                  </span>
                </div>
                <span className="text-2xl font-bold text-emerald-700">
                  {formatMarketCap(company.marketCap)}
                </span>
              </div>

              {/* Location Info - Always Visible (Hints) */}
              <div className="pt-4 border-t-2 border-gray-100">
                {/* Country */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {company.flag || getCountryFlag(company.country)}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {expandCountryName(company.country)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {companies.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No companies found</p>
        </div>
      )}
    </div>
  );
};

export default TilesView;
