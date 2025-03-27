let marketData = [];

document.getElementById('csvFile').addEventListener('change', handleFileSelect);
document.getElementById('analyzeBtn').addEventListener('click', analyzeData);

// Add event listeners for time scale buttons
document.querySelectorAll('.time-scale-buttons button').forEach(button => {
    button.addEventListener('click', handleTimeScaleClick);
});

function handleTimeScaleClick(event) {
    // Remove active class from all buttons
    document.querySelectorAll('.time-scale-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Calculate new date range
    const period = event.target.dataset.period;
    const endDate = new Date();
    let startDate = new Date();
    
    switch(period) {
        case '1D':
            startDate.setDate(endDate.getDate() - 1);
            break;
        case '1W':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case '1M':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        case '3M':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
        case '6M':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
        case '1Y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        case 'ALL':
            startDate = new Date(Math.min(...marketData.map(d => d.date)));
            break;
    }
    
    // Update date inputs
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    // Trigger analysis
    analyzeData();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const loadingIndicator = document.getElementById('loading');
    
    loadingIndicator.classList.remove('hidden');
    
    reader.onload = function(e) {
        const text = e.target.result;
        marketData = parseCSV(text);
        updateDateInputs();
        loadingIndicator.classList.add('hidden');
        // Trigger initial analysis with all data
        document.querySelector('[data-period="ALL"]').click();
    };
    
    reader.readAsText(file);
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    return lines.slice(1).map(line => {
        const [date, close, open, high, low, volatility] = line.split(',');
        return {
            date: new Date(date),
            close: parseFloat(close),
            open: parseFloat(open),
            volatility: parseFloat(volatility)
        };
    }).filter(item => !isNaN(item.close));
}

function updateDateInputs() {
    if (marketData.length > 0) {
        const dates = marketData.map(d => d.date);
        const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
        const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
        
        document.getElementById('startDate').value = minDate;
        document.getElementById('endDate').value = maxDate;
    }
}

function analyzeData() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    const filteredData = marketData.filter(d => 
        d.date >= startDate && d.date <= endDate
    );

    if (filteredData.length === 0) {
        alert('No data available for selected date range');
        return;
    }

    createDotPlot(filteredData);
    createHistogram(filteredData);
    displayStatistics(filteredData);
}

function calculateStatistics(data) {
    const volatilities = data.map(d => d.volatility);
    const prices = data.map(d => d.close);
    
    return {
        volatility: {
            mean: mean(volatilities),
            sd: standardDeviation(volatilities)
        },
        price: {
            mean: mean(prices),
            median: median(prices),
            mode: mode(prices),
            sd: standardDeviation(prices)
        }
    };
}

function createDotPlot(data) {
    const stats = calculateStatistics(data);
    
    const trace = {
        x: data.map(d => d.open),
        y: data.map(d => d.volatility),
        mode: 'markers',
        type: 'scatter',
        name: 'Data Points',
        marker: {
            size: 8,
            color: 'rgba(0, 123, 255, 0.6)',
            line: {
                color: 'rgba(0, 123, 255, 1)',
                width: 1
            }
        }
    };

    const meanLine = {
        x: [Math.min(...data.map(d => d.open)), Math.max(...data.map(d => d.open))],
        y: [stats.volatility.mean, stats.volatility.mean],
        mode: 'lines',
        name: 'Mean Volatility',
        line: {
            color: 'rgba(255, 0, 0, 0.8)',
            width: 2,
            dash: 'solid'
        }
    };

    const upperSD = {
        x: [Math.min(...data.map(d => d.open)), Math.max(...data.map(d => d.open))],
        y: [stats.volatility.mean + stats.volatility.sd, stats.volatility.mean + stats.volatility.sd],
        mode: 'lines',
        name: '+1 SD',
        line: {
            color: 'rgba(255, 165, 0, 0.6)',
            width: 2,
            dash: 'dash'
        }
    };

    const lowerSD = {
        x: [Math.min(...data.map(d => d.open)), Math.max(...data.map(d => d.open))],
        y: [stats.volatility.mean - stats.volatility.sd, stats.volatility.mean - stats.volatility.sd],
        mode: 'lines',
        name: '-1 SD',
        line: {
            color: 'rgba(255, 165, 0, 0.6)',
            width: 2,
            dash: 'dash'
        }
    };

    const layout = {
        title: {
            text: 'Open Price vs Volatility',
            font: { size: 24 }
        },
        xaxis: { 
            title: 'Open Price',
            gridcolor: 'rgba(0,0,0,0.1)',
            zerolinecolor: 'rgba(0,0,0,0.2)'
        },
        yaxis: { 
            title: 'Volatility (%)',
            gridcolor: 'rgba(0,0,0,0.1)',
            zerolinecolor: 'rgba(0,0,0,0.2)'
        },
        plot_bgcolor: 'rgba(255,255,255,0)',
        paper_bgcolor: 'rgba(255,255,255,0)',
        hovermode: 'closest',
        showlegend: true
    };

    Plotly.newPlot('dotPlot', [trace, meanLine, upperSD, lowerSD], layout);
}

function createHistogram(data) {
    const stats = calculateStatistics(data);
    const prices = data.map(d => d.close);

    const trace = {
        x: prices,
        type: 'histogram',
        name: 'Price Distribution',
        opacity: 0.7,
        marker: {
            color: 'rgba(0, 123, 255, 0.6)',
            line: {
                color: 'rgba(0, 123, 255, 1)',
                width: 1
            }
        }
    };

    const layout = {
        title: {
            text: 'Close Price Distribution',
            font: { size: 24 }
        },
        xaxis: { 
            title: 'Close Price',
            gridcolor: 'rgba(0,0,0,0.1)',
            zerolinecolor: 'rgba(0,0,0,0.2)'
        },
        yaxis: { 
            title: 'Frequency',
            gridcolor: 'rgba(0,0,0,0.1)',
            zerolinecolor: 'rgba(0,0,0,0.2)'
        },
        plot_bgcolor: 'rgba(255,255,255,0)',
        paper_bgcolor: 'rgba(255,255,255,0)',
        shapes: [
            // Mean line
            {
                type: 'line',
                x0: stats.price.mean,
                x1: stats.price.mean,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                    color: 'rgba(255, 0, 0, 0.8)',
                    width: 2,
                    dash: 'solid'
                },
                name: 'Mean'
            },
            // ±1 SD
            ...createSDLines(stats.price.mean, stats.price.sd, 1, 'rgba(255, 165, 0, 0.6)'),
            // ±2 SD
            ...createSDLines(stats.price.mean, stats.price.sd, 2, 'rgba(255, 165, 0, 0.4)'),
            // ±3 SD
            ...createSDLines(stats.price.mean, stats.price.sd, 3, 'rgba(255, 165, 0, 0.2)')
        ],
        showlegend: true
    };

    Plotly.newPlot('histogram', [trace], layout);
}

function createSDLines(mean, sd, multiplier, color) {
    return [
        {
            type: 'line',
            x0: mean + multiplier * sd,
            x1: mean + multiplier * sd,
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: {
                color: color,
                width: 2,
                dash: 'dash'
            }
        },
        {
            type: 'line',
            x0: mean - multiplier * sd,
            x1: mean - multiplier * sd,
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: {
                color: color,
                width: 2,
                dash: 'dash'
            }
        }
    ];
}

function displayStatistics(data) {
    const stats = calculateStatistics(data);
    const report = `
        <h3>Volatility Statistics</h3>
        <p>Average Volatility: ${stats.volatility.mean.toFixed(2)}%</p>
        <p>+1 SD Volatility: ${(stats.volatility.mean + stats.volatility.sd).toFixed(2)}%</p>
        <p>-1 SD Volatility: ${(stats.volatility.mean - stats.volatility.sd).toFixed(2)}%</p>

        <h3>Price Statistics</h3>
        <p>Average Price: ${stats.price.mean.toFixed(2)}</p>
        <p>Median Price: ${stats.price.median.toFixed(2)}</p>
        <p>Mode Price: ${stats.price.mode.toFixed(2)}</p>
        <p>±1 SD Price: ${(stats.price.mean - stats.price.sd).toFixed(2)} to ${(stats.price.mean + stats.price.sd).toFixed(2)}</p>
        <p>±2 SD Price: ${(stats.price.mean - 2*stats.price.sd).toFixed(2)} to ${(stats.price.mean + 2*stats.price.sd).toFixed(2)}</p>
        <p>±3 SD Price: ${(stats.price.mean - 3*stats.price.sd).toFixed(2)} to ${(stats.price.mean + 3*stats.price.sd).toFixed(2)}</p>
    `;
    
    document.getElementById('statsReport').innerHTML = report;
}

// Statistical helper functions
function mean(arr) {
    return arr.reduce((a, b) => a + b) / arr.length;
}

function standardDeviation(arr) {
    const m = mean(arr);
    const variance = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

function median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mode(arr) {
    const counts = {};
    let maxCount = 0;
    let modeValue = arr[0];
    
    arr.forEach(value => {
        counts[value] = (counts[value] || 0) + 1;
        if (counts[value] > maxCount) {
            maxCount = counts[value];
            modeValue = value;
        }
    });
    
    return modeValue;
}