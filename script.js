let restaurantData = [];

async function fetchData() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/JFTHIBAUT/Xki/main/xdatax.csv");
        const csvData = await response.text();

        restaurantData = csvData.split('\n').slice(1).map(row => {
            const cols = row.split(',');
            return {
                Timestamp: parseTimestamp(cols[0]),
                Customers: parseInt(cols[1]),
                CustomersOUT: parseInt(cols[2]),
                Men: parseInt(cols[3]),
                MenOUT: parseInt(cols[4]),
                Women: parseInt(cols[5]),
                WomenOUT: parseInt(cols[6]),
                Group: parseInt(cols[7]),
                GroupOUT: parseInt(cols[8]),
                Passersby: parseInt(cols[9]),
                ACustomers: parseInt(cols[10]),
                ACustomersOUT: parseInt(cols[11]),
                CustomersLIVE: parseInt(cols[12]),
                Dwelltime: parseTime(cols[13])
            };
        }).filter(item => Object.values(item).every(val => !isNaN(val))); // Filter out NaN values

        console.log("Parsed Restaurant Data:", restaurantData);

        // Create the charts *after* fetching and parsing the data
        createCharts();
        showSection('daily-overview');
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
    }
}

function parseTimestamp(timestampStr) {
    const [datePart, timePart] = timestampStr.split(' ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    return new Date(year, month - 1, day, hour, minute);
}

function parseTime(timeStr) {
    if (!timeStr || timeStr === "") return 0;
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
}

function createCharts() {
    loadDailyOverviewChart();
    loadDayAnalysisChart();
    loadDayAveragesChart();
}

// --- Chart.js Chart Loading Functions ---

function loadDailyOverviewChart() {
    const labels = restaurantData.map(item => item.Timestamp.toLocaleDateString() + ' ' + item.Timestamp.toLocaleTimeString());
    const data = {
        labels: labels,
        datasets: [{
            label: 'Customers In',
            data: restaurantData.map(item => item.Customers),
            backgroundColor: '#2f7622',
            borderColor: '#2f7622'
        }, {
            label: 'Customers Out',
            data: restaurantData.map(item => item.CustomersOUT),
            backgroundColor: '#f39700',
            borderColor: '#f39700'
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: { responsive: true }
    };

    if (window.dailyOverviewChart) window.dailyOverviewChart.destroy();
    window.dailyOverviewChart = new Chart(document.getElementById('daily-overview-chart'), config);
}

function loadDailyOverviewChart() {
    const labels = restaurantData.map(item => item.Timestamp); // Date objects for x-axis
    const data = {
        labels: labels,
        datasets: [{
            label: 'Customers In',
            data: restaurantData.map(item => item.Customers),
            backgroundColor: 'rgba(47, 118, 34, 0.5)',  // #2f7622 with alpha
            borderColor: '#2f7622',
            borderWidth: 1,
            tension: 0.4 // Smooth curves
        }, {
            label: 'Customers Out',
            data: restaurantData.map(item => item.CustomersOUT),
            backgroundColor: 'rgba(243, 151, 0, 0.5)', // #f39700 with alpha
            borderColor: '#f39700',
            borderWidth: 1,
            tension: 0.4
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',  // Time scale for x-axis
                    time: { unit: 'hour' }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Customers'
                    }
                }
            }
        }
    };

    const ctx = document.getElementById('daily-overview-chart').getContext('2d');
    new Chart(ctx, config);
}

function loadDayAnalysisChart() {
    // ... (Fetch data for selected date as before) ...

    const data = {
        // ... (labels and dataset configuration as before) ...
        datasets: [
            // ... datasets
            {
                backgroundColor: '#2f7622',  // Use your color
                borderColor: '#2f7622',      // For bar charts, border color is important
                borderWidth: 1
            },
            {
                backgroundColor: '#f39700',
                borderColor: '#f39700',
                borderWidth: 1
            },
            {
                backgroundColor: '#c5d469',
                borderColor: '#c5d469',
                borderWidth: 1
            }
        ]

    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time' // Add a title to the x-axis
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Customers'
                    },
                    stacked: true // Set stacked to true
                }
            }
        }
    };

    // ... (Create Chart.js chart as before)
}

function loadDayAveragesChart() {
    // ... (Calculate averages as before) ...

    const data = {
        // ... (labels and datasets as before) ...
        datasets: [{
            label: 'Average Customers',
            data: avgData,
            backgroundColor: 'rgba(197, 212, 105, 0.5)', // #c5d469 with alpha
            borderColor: '#c5d469',
            pointBackgroundColor: '#c5d469',  // Color of the points on the radar chart
            pointBorderColor: '#000000'
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            scales: {
                r: { // 'r' for radar chart scale
                    beginAtZero: true,
                    pointLabels: {
                        font: { size: 12 }
                    }

                }
            }
        }
    };

    if (window.dayAveragesChart) window.dayAveragesChart.destroy();
    window.dayAveragesChart = new Chart(document.getElementById('day-averages-chart'), config);
}

// Initially show the Daily Overview section
showSection('daily-overview');

document.getElementById('analysis-date').addEventListener('change', loadDayAnalysisChart);
window.onload = fetchData;