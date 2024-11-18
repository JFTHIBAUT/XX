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

function loadDayAnalysisChart() {
    const selectedDate = document.getElementById('analysis-date').value;
    if (!selectedDate) return;

    const selectedDayData = restaurantData.filter(item => item.Timestamp.toISOString().slice(0, 10) === selectedDate);

    const labels = selectedDayData.map(item => item.Timestamp.toLocaleTimeString());
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Customers In',
                data: selectedDayData.map(item => item.Customers),
                backgroundColor: '#2f7622'
            },
            {
                label: 'Customers Out',
                data: selectedDayData.map(item => item.CustomersOUT),
                backgroundColor: '#f39700'
            },
            {
                label: 'Customers Live', // Added to show live customers
                data: selectedDayData.map(item => item.CustomersLIVE),
                backgroundColor: '#c5d469'
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: { responsive: true }
    };

    if (window.dayAnalysisChart) window.dayAnalysisChart.destroy();
    window.dayAnalysisChart = new Chart(document.getElementById('day-analysis-chart'), config);
}

function loadDayAveragesChart() {
    // Calculate averages for each day of the week
    const averages = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }; // 0-Sunday, 1-Monday, ..., 6-Saturday
    restaurantData.forEach(item => {
        const day = item.Timestamp.getDay(); // Get day of the week (0-6)
        averages[day].push(item.Customers);
    });

    const avgData = Object.values(averages).map(dayData => {
        return dayData.length > 0 ? dayData.reduce((sum, val) => sum + val, 0) / dayData.length : 0;
    });

    const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const data = {
        labels: labels,
        datasets: [{
            label: 'Average Customers',
            data: avgData,
            backgroundColor: '#c5d469',
            borderColor: '#c5d469'
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        options: { responsive: true }
    };

    if (window.dayAveragesChart) window.dayAveragesChart.destroy();
    window.dayAveragesChart = new Chart(document.getElementById('day-averages-chart'), config);
}

// Initially show the Daily Overview section
showSection('daily-overview');

document.getElementById('analysis-date').addEventListener('change', loadDayAnalysisChart);
window.onload = fetchData;