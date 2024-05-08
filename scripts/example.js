// Constants
const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 1000,
    height = 700;

// SVG setup for the chart
const svgChart = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Axes
const xAxis = svgChart.append("g").attr("class", "axis").attr("transform", `translate(0,${height})`);
const yAxis = svgChart.append("g").attr("class", "axis");

// Line generator
const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value));

// Tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "8px")
    .style("border", "1px solid #d9d9d9")
    .style("border-radius", "4px")
    .style("display", "none")
    .style("pointer-events", "none");

// Colors for chart paths
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Store selected countries
const selectedCountries = new Set();

// Function to draw the chart
function drawChart(selectedCountriesData) {
    // Remove previous chart paths
    svgChart.selectAll(".line").remove();
    svgChart.selectAll("circle").remove();
    svgChart.selectAll(".end-label").remove();

    // Set domains for scales
    const allData = selectedCountriesData.flatMap(country => country.data);
    x.domain(d3.extent(allData, d => d.year));
    y.domain([0, d3.max(allData, d => d.value) + 10]);

    // Update axes
    xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
    yAxis.call(d3.axisLeft(y));

    // Draw each selected country's path
    selectedCountriesData.forEach((countryData, index) => {
        const path = svgChart.append("path")
            .datum(countryData.data)
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke", colorScale(index))
            .attr("fill", "none")
            .attr("stroke-width", 2);

        // Only animate if the path is valid
        if (path.node()) {
            const totalLength = path.node().getTotalLength();
            path
                .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(3000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
        }

        // Draw circles and add interaction
        svgChart.selectAll(`circle.${countryData.GeoAreaName}`)
            .data(countryData.data)
            .enter()
            .append("circle")
            .attr("class", `${countryData.GeoAreaName}`)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.value))
            .attr("r", 0)
            .attr("fill", colorScale(index))
            .on("mouseover", function (event, d) {
                tooltip
                    .style("display", "block")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px")
                    .html(`
                        <strong>${countryData.GeoAreaName}</strong><br>
                        Year: ${d.year}<br>
                        Value: ${d.value}
                    `);
                d3.select(this).attr("r", 6);
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
                d3.select(this).attr("r", 4);
            })
            .transition()
            .delay((d, i) => i * (3000 / countryData.data.length))
            .duration(900)
            .attr("r", 4);

        // Add final value label at the end of the graph
        const lastDataPoint = countryData.data[countryData.data.length - 1];
        svgChart.append("text")
            .attr("class", "end-label")
            .attr("x", x(lastDataPoint.year) + 5)
            .attr("y", y(lastDataPoint.value))
            .attr("fill", colorScale(index))
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text(`${lastDataPoint.value}%`)
            .style("opacity",0)
            .transition() // Start a transition.
            .delay(3100) // Delay in milliseconds.
            .style("opacity", 1); // Final state.
    });

    // Adding Labels
    svgChart.selectAll(".axis-label").remove();
    svgChart.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Year");

    svgChart.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Renewable Energy Share (%)");

    // Display selected countries
    displaySelectedCountries(selectedCountriesData);
}


// Function to display selected countries with color circles
function displaySelectedCountries(selectedCountriesData) {
    const selectionContainer = d3.select("#selected-countries");
    selectionContainer.html(""); // Clear previous selections

    selectedCountriesData.forEach((countryData, index) => {
        const countryEntry = selectionContainer.append("div").attr("class", "country-entry");
        countryEntry.append("svg")
            .attr("width", 20)
            .attr("height", 20)
            .append("circle")
            .attr("cx", 10)
            .attr("cy", 10)
            .attr("r", 8)
            .attr("fill", colorScale(index));

        countryEntry.append("span")
            .text(countryData.GeoAreaName)
            .attr("style");
    });
}

// Load world map data and JSON data
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.json("./data/renewable_energy_data.json")
]).then(([geoData, energyData]) => {
    // Initialize map
    const projection = d3.geoMercator().scale(200).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const svgMap = d3.select("#map-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a tooltip
    const tooltipMap = d3.select("#map-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Function to update map colors based on selection
    const updateMapColors = () => {
        svgMap.selectAll("path")
            .attr("fill", d => selectedCountries.has(d.properties.name) ? "#6699ff" : "#cce5ff");
    };

    // Draw map
    svgMap.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#cce5ff")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#6699ff");
            tooltipMap.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipMap.html(d.properties.name)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function (event, d) {
            if (!selectedCountries.has(d.properties.name)) {
                d3.select(this).attr("fill", "#cce5ff");
            }
            tooltipMap.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function (event, d) {
            const selectedCountry = d.properties.name;
            const countryData = energyData.find(e => e.GeoAreaName === selectedCountry);

            if (countryData) {
                if (selectedCountries.has(selectedCountry)) {
                    selectedCountries.delete(selectedCountry);
                } else {
                    selectedCountries.add(selectedCountry);
                }
                updateMapColors();

                const selectedCountriesData = [...selectedCountries].map(name =>
                    energyData.find(e => e.GeoAreaName === name)
                );

                drawChart(selectedCountriesData);
            } else {
                alert(`No data found for ${selectedCountry}`);
            }
        });

    // Draw initial chart with no countries selected
    drawChart([]);

    // Deselect all countries
    d3.select("#deselect-all").on("click", function () {
        selectedCountries.clear();
        updateMapColors();
        drawChart([]);
    });

    // Search bar functionality
    d3.select("#country-search").on("input", function () {
        const searchTerm = this.value.toLowerCase();
        svgMap.selectAll("path")
            .style("opacity", d => d.properties.name.toLowerCase().includes(searchTerm) ? 1 : 0.1);
    });
});
