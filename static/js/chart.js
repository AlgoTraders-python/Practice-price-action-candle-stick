document.addEventListener('DOMContentLoaded', function () {
    const chartContainer = document.getElementById('tradingview-chart');
    const chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        layout: {
            backgroundColor: '#2962FF',
            textColor: '#000000',
        },
        grid: {
            vertLines: {
                color: '#e1e1e1',
            },
            horzLines: {
                color: '#e1e1e1',
            },
        },
        priceScale: {
            borderColor: '#cccccc',
        },
        timeScale: {
            borderColor: '#cccccc',
            timeVisible: true,
            secondsVisible: false,
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        handleScale: {
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true,
        },
        handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true,
        },
    });
    function findDoubleBottoms(data) {
        const MIN_DISTANCE = 5;    // Minimum candles between bottoms
        const THRESHOLD = 0.01;    // 1% price difference tolerance
        const indices = new Set();
    
        for (let i = 0; i < data.length - MIN_DISTANCE - 1; i++) {
            const low1 = data[i].low;
            for (let j = i + MIN_DISTANCE + 1; j < data.length; j++) {
                const low2 = data[j].low;
                if (Math.abs(low1 - low2) / low1 < THRESHOLD) {
                    const betweenCandles = data.slice(i + 1, j);
                    const maxHigh = Math.max(...betweenCandles.map(c => c.high));
                    if (maxHigh > data[i].high && maxHigh > data[j].high) {
                        indices.add(i);  // First bottom
                        indices.add(j);  // Second bottom
                    }
                }
            }
        }
        return indices;
    }
    function findDoubleTops(data) {
        const MIN_DISTANCE = 5;
        const THRESHOLD = 0.01;
        const indices = new Set();
    
        for (let i = 0; i < data.length - MIN_DISTANCE - 1; i++) {
            const high1 = data[i].high;
            for (let j = i + MIN_DISTANCE + 1; j < data.length; j++) {
                const high2 = data[j].high;
                if (Math.abs(high1 - high2) / high1 < THRESHOLD) {
                    const betweenCandles = data.slice(i + 1, j);
                    const minLow = Math.min(...betweenCandles.map(c => c.low));
                    if (minLow < data[i].low && minLow < data[j].low) {
                        indices.add(i);  // First top
                        indices.add(j);  // Second top
                    }
                }
            }
        }
        return indices;
    }
    const candleSeries = chart.addCandlestickSeries({
        upColor: 'rgba(0, 200, 0, 0)', // Transparent upColor
        downColor: 'rgba(0, 0, 0,1)',
        borderUpColor: 'rgba(0, 0, 0,1)',  // Green border for up candles
        borderDownColor: 'rgba(0, 0, 0,1)', // Red border for down candles
        wickUpColor: 'rgba(0, 0, 0,1)',    // Green wick for up candles
        wickDownColor: 'rgba(0, 0, 0,1)',   // Red wick for down candles
        borderVisible: true,
        wickVisible: true
    });
    let currentInterval = 'M5'; // Default interval
    let chartData = []; // Store the chart data
    let currentIndex = 0; // Current index of the data
    let tickByTickMode = false; // Track if tick by tick mode is enabled

    const loadingLabel = document.getElementById('loadingLabel');

    function showLoading() {
        loadingLabel.textContent = 'Loading data...';
        loadingLabel.style.color = 'red';
        loadingLabel.style.animation = 'blink 1s infinite';
    }

    function hideLoading() {
        loadingLabel.textContent = '';
        loadingLabel.style.color = '';
        loadingLabel.style.animation = '';
    }

    // Function to set time interval
    window.setInterval = function(interval) {
        currentInterval = interval;
        window.updateChartData();
    };

    // Function to set date range
    window.setRange = function(range) {
        const endDate = new Date();
        let startDate;

        switch (range) {
            case '1W':
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '1M':
                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate());
                break;
            case '3M':
                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, endDate.getDate());
                break;
            case '6M':
                startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, endDate.getDate());
                break;
            case '1Y':
                startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
                break;
            case 'YTD':
                startDate = new Date(endDate.getFullYear(), 0, 1);
                break;
            case 'ALL':
                startDate = new Date('2021-01-01');  // Set to the earliest date in your dataset
                break;
            default:
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        document.getElementById('startDate').valueAsDate = startDate;
        document.getElementById('endDate').valueAsDate = endDate;
        window.updateChartData();
    };

     // Function to load tick data
     window.loadTickData = function() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        fetch(`/api/tick_data?startDate=${startDate}&endDate=${endDate}`)
            .then(response => response.json())
            .then(data => {
                // Process tick data and add it to the chart
                console.log('Tick Data:', data);
                // You can add logic here to display the tick data as needed
            })
            .catch(error => console.error('Error fetching tick data:', error));
    };

   

    // Function to render the next candle
    window.renderNextCandle = function() {
        if (chartData.length > 0 && currentIndex < chartData.length) {
            const nextCandle = chartData[currentIndex];
            candleSeries.update(nextCandle);
            
            currentIndex++;
        } else {
            console.log('No more candles to render.');
        }
    };

    // Function to toggle tick by tick mode
    window.toggleTickByTick = function() {
        tickByTickMode = document.getElementById('tickByTick').checked;
        const nextButton = document.getElementById('nextButton');
        nextButton.style.display = tickByTickMode ? 'inline' : 'none';
        updateChartData(); // Reload data based on the mode
    };

    // Make updateChartData accessible globally
    window.updateChartData = function() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const symbol = document.getElementById('symbol').value; // Get selected symbol

        showLoading();

        fetch(`/api/candles?startDate=${startDate}&endDate=${endDate}&interval=${currentInterval}&symbol=${symbol}`)
            .then(response => response.json())
            .then(data => {
                chartData = data; // Store the fetched chart data
                currentIndex = 0; // Reset the current index
                
                // Detect double bottoms
               
                if (data.length > 0) {
                    if (tickByTickMode) {
                        // If tick by tick mode is enabled, clear existing data
                        candleSeries.setData([]);
                    } else {
                        // Load all candles if tick by tick mode is disabled
                        
                        candleSeries.setData(data);

                       

                        // Auto adjust the visible range
                        chart.timeScale().fitContent();
                        // Auto adjust the price scale
                        chart.priceScale('right').applyOptions({ autoScale: true });
                    }
                }
                hideLoading();
            })
            .catch(error => {
                console.error('Error fetching candle data:', error);
                hideLoading();
            });
    };

    let minDate, maxDate;

    // Function to fetch and set the min/max dates
    function setDateRange() {
        showLoading();
        const symbol = document.getElementById('symbol').value; // Get selected symbol
        fetch(`/api/date_range?symbol=${symbol}`) // Pass symbol as a query parameter
            .then(response => response.json())
            .then(data => {
                minDate = data.min_date;
                maxDate = data.max_date;
                document.getElementById('startDate').value = minDate;
                document.getElementById('endDate').value = maxDate;
                document.getElementById('dateRangeLabel').textContent = `Date Range: ${minDate} to ${maxDate}`;
                // Load chart data for max date only
                document.getElementById('startDate').value = maxDate;
                updateChartData(); // Load chart data after setting dates
                hideLoading();
            })
            .catch(error => {
                console.error('Error fetching date range:', error);
                hideLoading();
            });
    }

        // Function to generate a random date between minDate and maxDate
    window.setRandomDate = function() {
        if (!minDate || !maxDate) {
            console.warn('Min or Max date not loaded yet.');
            return;
        }

        const minDateObj = new Date(minDate);
        const maxDateObj = new Date(maxDate);

        let startDate, endDate;
        let isValidWeek = false;

        // Try to find a valid week within a reasonable number of attempts
        for (let attempts = 0; attempts < 100; attempts++) {
            // Calculate the maximum possible start date to ensure the whole week fits
            const maxPossibleStartDate = new Date(maxDateObj.getTime() - 5 * 24 * 60 * 60 * 1000); // Subtract 5 days to ensure the week fits

            const timeDiff = maxPossibleStartDate.getTime() - minDateObj.getTime();
            const randomTime = Math.random() * timeDiff;
            const randomDate = new Date(minDateObj.getTime() + randomTime);

            // Get the Monday of the week containing the random date
            const dayOfWeek = randomDate.getDay(); // 0 (Sunday) to 6 (Saturday)
            const diff = randomDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
            startDate = new Date(randomDate.setDate(diff));
            endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000); // Calculate Saturday

            // Check if the generated week is within the min/max date range
            if (startDate >= minDateObj && endDate <= maxDateObj) {
                isValidWeek = true;
                break; // Valid week found, exit the loop
            }
        }

        if (!isValidWeek) {
            console.warn('Could not find a valid week within the date range.');
            return;
        }

        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        document.getElementById('startDate').value = formattedStartDate;
        document.getElementById('endDate').value = formattedEndDate;
        updateChartData();
    };

    // Function to copy chart to clipboard
    window.copyChartToClipboard = function() {
        const chartContainer = document.getElementById('tradingview-chart');
        const canvas = chartContainer.querySelector('canvas');

        if (!canvas) {
            console.error('No canvas found in chart container.');
            return;
        }

        canvas.toBlob(blob => {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]).then(() => {
                alert('Chart copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy chart to clipboard:', err);
                alert('Failed to copy chart to clipboard.');
            });
        });
    };

    // Initial chart data load
    setDateRange();

    // Attach resize event listener
    window.addEventListener('resize', () => {
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
        });
    });

     // Add keyboard event listener
     document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowRight') {
            window.renderNextCandle();
        }
    });
});