let companies = [];
let revealedCompanies = new Set();
let currentView = 'table';
let showLocation = false;

// Load quiz data
async function loadQuizData() {
    try {
        const response = await fetch('/api/quiz-data');
        const data = await response.json();
        companies = data.companies;
        updateLastUpdated(data.lastUpdated);
        renderView();
    } catch (error) {
        console.error('Failed to load quiz data:', error);
        document.getElementById('quizContainer').innerHTML =
            '<p style="padding: 40px; text-align: center; color: #e74c3c;">Failed to load quiz data. Please refresh the page.</p>';
    }
}

// Render current view (table or tiles)
function renderView() {
    const container = document.getElementById('quizContainer');
    container.className = `quiz-container ${currentView}-view ${showLocation ? 'show-location' : ''}`;

    if (currentView === 'table') {
        renderTableView();
    } else {
        renderTilesView();
    }
}

// Render table view
function renderTableView() {
    const container = document.getElementById('quizContainer');

    let html = `
        <table class="quiz-table">
            <thead>
                <tr>
                    <th class="text-center">Rank</th>
                    <th class="text-center">Logo</th>
                    <th>Name</th>
                    <th>Ticker</th>
                    <th class="text-right">Market Cap</th>
                    <th class="location-column">Country</th>
                    <th class="location-column">Exchange</th>
                </tr>
            </thead>
            <tbody>
    `;

    companies.forEach(company => {
        const isRevealed = revealedCompanies.has(company.rank);
        const rowClass = isRevealed ? 'revealed' : '';

        html += `
            <tr class="${rowClass}" id="company-${company.rank}">
                <td class="text-center"><div class="company-rank">#${company.rank}</div></td>
                <td class="text-center ${isRevealed ? '' : 'hidden-cell'}">
                    ${company.logo && isRevealed ? `<img src="${company.logo}" alt="${company.name}" class="company-logo">` : '●●●'}
                </td>
                <td class="${isRevealed ? '' : 'hidden-cell'}">
                    ${isRevealed ? `<div class="company-name">${company.name}</div>` : '●●●●●●●●'}
                </td>
                <td class="${isRevealed ? '' : 'hidden-cell'}">
                    ${isRevealed ? `<div class="company-ticker">${company.ticker}</div>` : '●●●●'}
                </td>
                <td class="text-right">
                    <div class="company-marketcap">${company.marketCapFormatted}</div>
                </td>
                <td class="location-column ${isRevealed ? '' : 'hidden-cell'}">
                    ${isRevealed ? company.country : '●●●●●'}
                </td>
                <td class="location-column ${isRevealed ? '' : 'hidden-cell'}">
                    ${isRevealed ? company.exchange : '●●●●●'}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Render tiles view
function renderTilesView() {
    const container = document.getElementById('quizContainer');

    let html = '<div class="companies-grid">';

    companies.forEach(company => {
        const isRevealed = revealedCompanies.has(company.rank);
        const cardClass = isRevealed ? 'revealed' : 'hidden';

        html += `
            <div class="company-card ${cardClass}" id="company-${company.rank}">
                <div class="company-rank">#${company.rank}</div>
                <div class="company-details">
                    <div class="company-logo-container">
                        ${company.logo && isRevealed ? `<img src="${company.logo}" alt="${company.name}" class="company-logo">` : ''}
                    </div>
                    <div class="company-name">${isRevealed ? company.name : '●●●●●●●●'}</div>
                    <div class="company-ticker">${isRevealed ? company.ticker : '●●●●'}</div>
                    <div class="company-marketcap">${company.marketCapFormatted}</div>
                    <div class="company-location">
                        ${isRevealed ? `${company.country} • ${company.exchange}` : '●●●●● • ●●●●●'}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Handle guessing
function handleGuess(guess) {
    if (!guess || guess.trim().length < 2) return;

    guess = guess.trim().toLowerCase();

    companies.forEach(company => {
        if (revealedCompanies.has(company.rank)) return;

        // Name matching
        const nameMatch = company.name.toLowerCase().includes(guess) ||
                         guess.includes(company.name.toLowerCase());

        // Ticker matching - require at least 3 characters
        const tickerMatch = guess.length >= 3 && company.ticker.toLowerCase() === guess;

        // Normalize company names for better matching
        const normalized = normalizeCompanyName(company.name.toLowerCase());
        const normalizedGuess = normalizeCompanyName(guess);

        if (nameMatch || tickerMatch || normalized.includes(normalizedGuess) || normalizedGuess.includes(normalized)) {
            revealCompany(company.rank);
        }
    });

    updateStats();
}

// Normalize company names (remove common suffixes)
function normalizeCompanyName(name) {
    return name
        .replace(/\s*(inc\.|incorporated|corp\.|corporation|ltd\.|limited|llc|plc|n\.v\.|ag|se|s\.a\.|sa|s\.p\.a\.)\.?$/i, '')
        .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
        .trim();
}

// Reveal a company
function revealCompany(rank) {
    if (revealedCompanies.has(rank)) return;

    revealedCompanies.add(rank);

    // Re-render the view to show the revealed company
    renderView();

    // Scroll to revealed company
    const element = document.getElementById(`company-${rank}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Update statistics
function updateStats() {
    const correct = revealedCompanies.size;
    const total = companies.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    document.getElementById('correctCount').textContent = correct;
    document.getElementById('totalCount').textContent = total;
    document.getElementById('percentComplete').textContent = `${percent}%`;
}

// Update last updated timestamp
function updateLastUpdated(timestamp) {
    const date = new Date(timestamp);
    const formatted = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = `Last updated: ${formatted}`;
}

// Give up and show all
function giveUp() {
    if (!confirm('Are you sure you want to reveal all companies?')) return;

    companies.forEach(company => {
        revealCompany(company.rank);
    });
    updateStats();
}

// Switch view
function switchView(view) {
    currentView = view;
    renderView();

    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
}

// Toggle location display
function toggleLocation(show) {
    showLocation = show;
    const container = document.getElementById('quizContainer');
    container.classList.toggle('show-location', show);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();

    // Input handler
    const input = document.getElementById('guessInput');
    input.addEventListener('input', (e) => {
        handleGuess(e.target.value);
    });

    // Give up button
    const giveUpBtn = document.getElementById('giveUpBtn');
    giveUpBtn.addEventListener('click', giveUp);

    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.dataset.view);
        });
    });

    // Location toggle checkbox
    const locationToggle = document.getElementById('showLocationToggle');
    locationToggle.addEventListener('change', (e) => {
        toggleLocation(e.target.checked);
    });
});
