import { Building2 } from 'lucide-react';

const TableView = ({ companies, revealedCompanies }) => {
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
    if (value >= 1e12) return `$${(value / 1e12).toFixed(3)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const isRevealed = (companyId) => revealedCompanies?.has(companyId);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Logo
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Ticker
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Market Cap (USD)
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Country
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company, index) => {
              const revealed = isRevealed(company.rank);
              return (
                <tr
                  key={company.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Rank */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-md">
                      {index + 1}
                    </span>
                  </td>

                  {/* Logo */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {revealed ? (
                      company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-1 border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                      )
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 backdrop-blur-sm animate-pulse" />
                    )}
                  </td>

                  {/* Company Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {revealed ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-base">
                          {company.name}
                        </span>
                        {company.verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-6 w-48 bg-gray-200 rounded backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                      </div>
                    )}
                  </td>

                  {/* Ticker */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {revealed ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-sm border border-indigo-200">
                        {company.ticker}
                      </span>
                    ) : (
                      <div className="h-6 w-16 bg-gray-200 rounded backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                      </div>
                    )}
                  </td>

                  {/* Market Cap - Always Visible */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-bold text-gray-900 text-base">
                      {formatMarketCap(company.marketCap)}
                    </span>
                  </td>

                  {/* Country - Always Visible */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {company.flag || getCountryFlag(company.country)}
                      </span>
                      <span className="text-gray-700 font-medium">
                        {expandCountryName(company.country)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No companies found</p>
        </div>
      )}
    </div>
  );
};

export default TableView;
