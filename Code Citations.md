# Code Citations

This project uses the following third-party libraries:

## Plotly.js
- **Version**: Latest
- **Source**: https://plotly.com/javascript/
- **License**: MIT
- **Usage**: Data visualization library used for creating interactive dot plots and histograms

## Usage in Project
- `src/index.html`: Includes Plotly.js CDN
- `src/script/pyscript.js`: Uses Plotly.js for creating visualizations
  - `createDotPlot()`: Creates scatter plot with statistical reference lines
  - `createHistogram()`: Creates histogram with standard deviation indicators