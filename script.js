let restaurantData = [];

async function fetchData() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/JFTHIBAUT/Xki/main/xdatax.csv");
        const csvData = await response.text();
        const rows = csvData.split('\n').slice(1);
        restaurantData = rows.map(row => {
            const [Timestamp, Customers, CustomersOUT, Men, MenOUT, Women, WomenOUT, Group, GroupOUT, Passersby, ACustomers, ACustomersOUT, CustomersLIVE, Dwelltime] = row.split(',');
            return {
                Timestamp: parseTimestamp(Timestamp),
                Customers: parseInt(Customers),
                CustomersOUT: parseInt(CustomersOUT),
                // ... other data fields ...
                Dwelltime: parseTime(Dwelltime)
            };
        }).filter(item => Object.values(item).every(val => val !== undefined && !isNaN(val)));

        // Create charts *after* data is fetched:
        loadDailyOverviewChart();
        loadDayAnalysisChart();
        loadDayAveragesChart();
        showSection('daily-overview'); // Show initial section

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function parseTimestamp(timestampStr) {
    const [datePart, timePart] = timestampStr.split(' ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    return new Date(year, month - 1, day, hour, minute);  // Correct month indexing
}

// Helper function to parse time format (h:mm) to minutes
function parseTime(timeStr) {
    if (!timeStr) return 0; // Handle empty or invalid time strings
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
}

// Function to show the selected section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');

    // Trigger chart updates based on the section
    if (sectionId === 'daily-overview' && window.dailyOverviewChart) {
        loadDailyOverviewChart();
    } else if (sectionId === 'day-analysis' && window.dayAnalysisChart) {
        loadDayAnalysisChart();
    } else if (sectionId === 'day-averages' && window.dayAveragesChart) {
        loadDayAveragesChart();
    }
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

// Add event listener to the date input for automatic Day Analysis chart update
document.getElementById('analysis-date').addEventListener('change', loadDayAnalysisChart);

// Call fetchData when the page loads
window.onload = fetchData;