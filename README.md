# Market Data Analyzer

A web-based application for analyzing financial market data with interactive visualizations and statistical analysis.

## Features

- **Interactive Data Visualization**
  - Dot plot showing relationship between open price and volatility
  - Histogram of close prices with standard deviation indicators
  - Mean and standard deviation reference lines

- **Statistical Analysis**
  - Volatility statistics (mean, ±1 SD)
  - Price statistics (mean, median, mode, ±1/2/3 SD)

- **Flexible Time Period Selection**
  - Quick preset periods (1D, 1W, 1M, 3M, 6M, 1Y)
  - Custom date range selection
  - Support for CSV data input

## Getting Started

### Prerequisites

- Modern web browser with JavaScript enabled
- CSV file with market data in the following format:
  ```
  Date,Close,Open,High,Low,Volatility(%)
  ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/market-data-analyzer.git
   ```

2. Open `index.html` in a web browser or serve it using a local web server.

### Usage

1. Click "Choose File" to upload your CSV data file
2. Select a time period using the preset buttons or custom date inputs
3. Click "Analyze" to generate visualizations and statistics
4. View the dot plot, histogram, and statistical report

## Data Format

Your CSV file should contain the following columns:
- Date: Trading date (MM/DD/YYYY)
- Close: Closing price
- Open: Opening price
- High: Highest price
- Low: Lowest price
- Volatility(%): Volatility percentage

Example:
```csv
Date,Close,Open,High,Low,Volatility(%)
01/04/2000,5.375,5.42,5.42,5.32,1.85
```

## Technologies Used

- HTML5
- CSS3
- JavaScript
- [Plotly.js](https://plotly.com/javascript/) for data visualization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.