document.addEventListener('DOMContentLoaded', function () {
    let chart1, chart2;
    let candleSeries1, candleSeries2;
    let minDate, maxDate;
    const symbolSelect = document.getElementById('symbol');
    const chartContainer1 = document.getElementById('chart1');
    const chartContainer2 = document.getElementById('chart2');
    const intervalSelect1 = document.getElementById('interval1');
    const intervalSelect2 = document.getElementById('interval2');

    // Function to create a chart
    function createChart(chartContainer) {
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
        return chart;
    }

   
    // Function to create a candle series
    function createCandleSeries(chart) {
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
        return candleSeries;
    }

    // Function to fetch candle data
    function fetchCandleData(symbol, interval) {
        const startDate = minDate;
        const endDate = maxDate;
        return fetch(`/api/candles?symbol=${symbol}&interval=${interval}&startDate=${startDate}&endDate=${endDate}`)
            .then(response => response.json());
    }

    // Function to update chart data
    function updateChart(chart, candleSeries, symbol, interval) {
        fetchCandleData(symbol, interval)
            .then(data => {
                const formattedData = data.map(item => ({
                    time: item.time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close
                }));
                candleSeries.setData(formattedData);
            })
            .catch(error => console.error(`Error fetching ${interval} data:`, error));
    }

    // Function to set the min/max dates
    function setDateRange(symbol) {
        fetch(`/api/date_range?symbol=${symbol}`)
            .then(response => response.json())
            .then(data => {
                minDate = data.min_date;
                maxDate = data.max_date;
                updateCharts();
            })
            .catch(error => console.error('Error fetching date range:', error));
    }

    // Function to update both charts
    window.updateCharts = function () {
        const symbol = symbolSelect.value;
        const interval1 = intervalSelect1.value;
        const interval2 = intervalSelect2.value;

        updateChart(chart1, candleSeries1, symbol, interval1); // Chart 1: Selected timeframe
        updateChart(chart2, candleSeries2, symbol, interval2); // Chart 2: Selected timeframe
    };

    // Initialize charts
    chart1 = createChart(chartContainer1);
    chart2 = createChart(chartContainer2);
    candleSeries1 = createCandleSeries(chart1);
    candleSeries2 = createCandleSeries(chart2);

    // Set initial date range and load data
    setDateRange(symbolSelect.value);

    // Handle symbol change
    symbolSelect.addEventListener('change', () => {
        setDateRange(symbolSelect.value);
    });

    // Handle interval changes
    intervalSelect1.addEventListener('change', () => {
        updateCharts();
    });

    intervalSelect2.addEventListener('change', () => {
        updateCharts();
    });

    // Resize charts on window resize
    window.addEventListener('resize', () => {
        chart1.applyOptions({ width: chartContainer1.clientWidth, height: chartContainer1.clientHeight });
        chart2.applyOptions({ width: chartContainer2.clientWidth, height: chartContainer2.clientHeight });
    });
});