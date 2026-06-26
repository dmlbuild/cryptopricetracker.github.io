# CryptoPulse | Cryptocurrency Price Tracker Dashboard

An interactive, responsive real-time digital asset market dashboard engineered with a sleek, premium dark-mode interface. The application pulls dynamic live market values and historical trends directly from the **CoinGecko Public API** without requiring complex localized developer environments or api compilation keys.

## 🌟 Architectural Features

- **Real-Time Market Synchronizer**: Connects directly to the CoinGecko markets pipeline to fetch up-to-the-minute updates for top cryptocurrencies sorted by market capitalization.
- **Dynamic 7-Day Trend Visualizer**: Features embedded historical tracking charts powered by **Chart.js**. Clicking on any top feature card or market row instantly re-targets and re-renders that asset's trailing 7-day closing interval breakdown.
- **Adaptive Precision Price Formatter**: Includes custom numeric formatting logic that automatically switches scale parameters depending on asset value (e.g., formatting high-cap assets down to 2 decimal places, while handling sub-dollar altcoins up to 6 decimal positions).
- **Instant Search Subsystem**: A reactive localized input string filtering system that handles searches by asset name or ticker symbols instantly without sending redundant API queries to remote servers.

## 🛠️ Implementation Stack

- **Structure Layout**: Native HTML5 DOM semantics.
- **Presentation Engine**: Tailwind CSS Framework CDN (Utilizing slate/indigo micro-styling rules).
- **Logic Substrate**: Modern Vanilla JavaScript (`async/await` fetch promise pipelines).
- **Data Dependency Engine**: Chart.js library integration via CDN.

## 📁 File Structure

Ensure both application assets share a common directory layout to resolve connection hooks properly:

```text
📂 cryptopulse-dashboard/
├── 📄 index.html
└── 📄 app.js