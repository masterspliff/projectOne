const ctx = document.getElementById('barchart').getContext('2d');
const barchart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Mali","Niger", "Senegal", "Guinea", "Burkina Faso", "Sierra Leone", "Benin"," Equatorial Guinea", "Gabon",
        "Republic of Congo","Namibia","Madagascar","Kenya","Nigeria"],
        datasets: [{
            label: 'Proportion of population with access to electricity, by urban/rural (%) - 2014',
            data: [34.2, 15.7, 61.0, 44.6, 58.4, 18.8, 34.1, 66.0, 87.1, 42.0, 73.8, 63.2, 68.4, 84.7 ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 0, 0, 0.2)',
                'rgba(0, 255, 0, 0.2)',
                'rgba(0, 0, 255, 0.2)',
                'rgba(255, 255, 0, 0.2)',
                'rgba(255, 0, 255, 0.2)',
                'rgba(0, 255, 255, 0.2)',
                'rgba(128, 128, 128, 0.2)',
                'rgba(255, 192, 203, 0.2)',
                'rgba(0, 128, 128, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 0, 0, 1)',
                'rgba(0, 255, 0, 1)',
                'rgba(0, 0, 255, 1)',
                'rgba(255, 255, 0, 1)',
                'rgba(255, 0, 255, 1)',
                'rgba(0, 255, 255, 1)',
                'rgba(128, 128, 128, 1)',
                'rgba(255, 192, 203, 1)',
                'rgba(0, 128, 128, 1)'
            ],
            borderWidth: 1
        },
        {
            label: 'Proportion of population with access to electricity, by urban/rural (%) - 2022',
            data: [53.0, 20.0, 71.0, 53.0, 70.0, 29.0, 57.0, 67.0, 93.0, 45.0, 75.0, 72.0, 98.0, 89.0],
            backgroundColor: [
                'rgba(255, 99, 132, 0.4)',
                'rgba(54, 162, 235, 0.4)',
                'rgba(255, 206, 86, 0.4)',
                'rgba(75, 192, 192, 0.4)',
                'rgba(153, 102, 255, 0.4)',
                'rgba(255, 159, 64, 0.4)',
                'rgba(255, 0, 0, 0.4)',
                'rgba(0, 255, 0, 0.4)',
                'rgba(0, 0, 255, 0.4)',
                'rgba(255, 255, 0, 0.4)',
                'rgba(255, 0, 255, 0.4)',
                'rgba(0, 255, 255, 0.4)',
                'rgba(128, 128, 128, 0.4)',
                'rgba(255, 192, 203, 0.4)',
                'rgba(0, 128, 128, 0.4)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 0, 0, 1)',
                'rgba(0, 255, 0, 1)',
                'rgba(0, 0, 255, 1)',
                'rgba(255, 255, 0, 1)',
                'rgba(255, 0, 255, 1)',
                'rgba(0, 255, 255, 1)',
                'rgba(128, 128, 128, 1)',
                'rgba(255, 192, 203, 1)',
                'rgba(0, 128, 128, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});