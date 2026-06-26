// Configuration state

let cryptoData = [];
let trendChart = null;
const selectedCoinId = 'bitcoin'; // Default historical chart target

// DOM elements
const topCoinsGrid = document.getElementById('topCoinsGrid');
const cryptoTableBody = document.getElementById('cryptoTableBody');
const searchInput = document.getElementById('cryptoSearch');
const refreshBtn = document.getElementById('refreshBtn');
const chartTitle = document.getElementById('chartTitle');
const chartPrice = document.getElementById('chartPrice');

// Initialize Dashboard Applications
document.addEventListener('DOMContentLoaded', () => {
    fetchCryptoPrices();
    fetchHistoricalData(selectedCoinId, 'Bitcoin');
    
    // Event listeners
    refreshBtn.addEventListener('click', fetchCryptoPrices);
    searchInput.addEventListener('input', handleSearch);
});

// Fetch Top Market Cryptocurrencies from CoinGecko
async function fetchCryptoPrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
        if (!response.ok) throw new Error("API rate limits or response failure.");
        
        cryptoData = await response.json();
        renderDashboard(cryptoData);
    } catch (error) {
        console.error("Error fetching crypto prices:", error);
        topCoinsGrid.innerHTML = `<p class="text-red-400 col-span-full text-center py-4 bg-red-950/20 border border-red-900 rounded-xl">Failed to update. Free tier rate-limits exceeded. Please try again shortly.</p>`;
    }
}

// Render Top Cards and Table rows
function renderDashboard(data) {
    // 1. Populate top 4 highlighted Cards
    topCoinsGrid.innerHTML = '';
    const featured = data.slice(0, 4);
    
    featured.forEach(coin => {
        const isPositive = coin.price_change_percentage_24h >= 0;
        topCoinsGrid.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 hover:border-slate-700 transition p-5 rounded-xl flex justify-between items-center cursor-pointer" onclick="updateChartContext('${coin.id}', '${coin.name}', ${coin.current_price})">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <img src="${coin.image}" alt="${coin.name}" class="w-5 h-5">
                        <span class="text-xs text-slate-400 font-medium uppercase">${coin.symbol}</span>
                    </div>
                    <h3 class="text-sm font-semibold text-slate-200">${coin.name}</h3>
                    <p class="text-lg font-bold">${formatCurrency(coin.current_price)}</p>
                </div>
                <span class="text-xs font-semibold px-2 py-1 rounded ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">
                    ${isPositive ? '▲' : '▼'} ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
            </div>
        `;
    });

    // 2. Populate Sidebar Ranking Table
    updateTableView(data);
}

// Render dynamic rows to sidebar table
function updateTableView(data) {
    cryptoTableBody.innerHTML = '';
    if(data.length === 0) {
        cryptoTableBody.innerHTML = `<p class="text-slate-500 text-sm text-center py-4">No assets found</p>`;
        return;
    }

    data.forEach(coin => {
        const isPositive = coin.price_change_percentage_24h >= 0;
        cryptoTableBody.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800/50 border border-slate-800/60 rounded-lg transition text-sm cursor-pointer" onclick="updateChartContext('${coin.id}', '${coin.name}', ${coin.current_price})">
                <div class="flex items-center gap-3">
                    <span class="text-xs text-slate-500 font-mono w-4">#${coin.market_cap_rank}</span>
                    <img src="${coin.image}" alt="${coin.name}" class="w-6 h-6">
                    <div>
                        <p class="font-semibold text-slate-200 leading-tight">${coin.name}</p>
                        <p class="text-xs text-slate-400 uppercase">${coin.symbol}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-mono font-medium">${formatCurrency(coin.current_price)}</p>
                    <p class="text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}">${isPositive ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%</p>
                </div>
            </div>
        `;
    });
}

// Input Filter Event Handler
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = cryptoData.filter(coin => 
        coin.name.toLowerCase().includes(query) || 
        coin.symbol.toLowerCase().includes(query)
    );
    updateTableView(filtered);
}

// Fetch historical 7-day sparkline metrics for chart
async function fetchHistoricalData(coinId, coinName) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`);
        const data = await response.json();
        
        // Parse time labels and closing values
        const labels = data.prices.map(price => new Date(price[0]).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'}));
        const prices = data.prices.map(price => price[1]);
        
        // Update dashboard details values text
        if(prices.length > 0) {
            chartPrice.innerText = formatCurrency(prices[prices.length - 1]);
        }

        renderChart(labels, prices, coinName);
    } catch (error) {
        console.error("Could not construct asset chart profiles:", error);
    }
}

// Event hooks to re-target the trends chart interface
function updateChartContext(id, name, currentPrice) {
    chartTitle.innerText = `${name} Performance`;
    chartPrice.innerText = formatCurrency(currentPrice);
    fetchHistoricalData(id, name);
}

// Render standard visual chart elements using Chart.js dependency
function renderChart(labels, dataPoints, labelName) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (trendChart) {
        trendChart.destroy(); // Clear old memory footprints
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${labelName} (USD Breakdown)`,
                data: dataPoints,
                borderColor: '#4f46e5', // Tailwind indigo-600
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(51, 65, 85, 0.2)' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// Global Helper to format numbers cleanly
function formatCurrency(value) {
    if (value >= 1) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
    } else {
        // Handle low value tokens gracefully (e.g., Shiba Inu, Pepe)
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6 }).format(value);
    }
}