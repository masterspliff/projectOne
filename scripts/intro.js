// Load and visualize data
d3.json('./data/africa_electricity_access_v2.json').then(function (data) {
    // Set up dimensions
    const width = 960;
    const height = 500;

    // Create SVG element
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create projection
    const projection = d3.geoMercator()
        .scale(400)
        .center([15, 0]) // Center Africa
        .translate([width / 2, height / 2]);

    // Create path generator
    const path = d3.geoPath()
        .projection(projection);

    // Load world map data
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (world) {
        // Filter to only include African countries
        const africa = world.features.filter(function (d) {
            return [
                "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
                "Central African Republic", "Chad", "Comoros", "Congo", "Congo, Democratic Republic of the",
                "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia",
                "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya",
                "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia",
                "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone",
                "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda",
                "Zambia", "Zimbabwe"
            ].includes(d.properties.name);
        });

        // Draw Africa map
        svg.selectAll("path")
            .data(africa)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function (d) {
                const countryData = data.find(country => country.country === d.properties.name);
                if (countryData) {
                    const access = countryData.access_to_electricity;
                    if (access === "No data") {
                        return "#d3d3d3"; // Grey for "No data"
                    } else if (access < 50) {
                        return "#ff4d4d";
                    } else if (access < 75) {
                        return "#ffd633";
                    } else {
                        return "#33cc33";
                    }
                } else {
                    return "#d3d3d3"; // Default color for countries without data
                }
            })
            .attr("stroke", "#ffffff");

        // Add tooltips
        svg.selectAll("path")
            .append("title")
            .text(function (d) {
                const countryData = data.find(country => country.country === d.properties.name);
                const access = countryData ? `${countryData.access_to_electricity}%` : "No data";
                return `${d.properties.name}: ${access}`;
            });
    });
});
