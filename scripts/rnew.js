// Constants
const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 1000; //- margin.left - margin.right,
    height = 700; //- margin.top - margin.bottom;

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
    .attr("class", "tooltip");

// Highlight line function
function highlightLine(year, value) {
    svgChart.selectAll(".highlighted-line").remove();

    svgChart.append("line")
        .attr("class", "highlighted-line")
        .attr("x1", x(year))
        .attr("y1", y(0))
        .attr("x2", x(year))
        .attr("y2", y(value))
        .attr("stroke", "orange")
        .attr("stroke-width", 2);

    tooltip
        .style("left", `${d3.event.pageX + 10}px`)
        .style("top", `${d3.event.pageY + 10}px`)
        .style("display", "inline-block")
        .html(`Year: ${year}<br>Value: ${value.toFixed(2)}%`);
}

// Function to draw the chart
function drawChart(countryData) {
    // Tilføj title for valgte land. 
    const chartContainer = document.getElementById('chart-container');

    const existingP = chartContainer.querySelector('p');
    if (existingP) {
        existingP.remove();
    }

    const h2 = document.createElement('p');
    h2.textContent = countryData.GeoAreaName;

    // Ændre i title navnet med class
    h2.className = 'country-title';
    h2.id = 'country-title-id';
    //Indtil her
    chartContainer.insertBefore(h2, chartContainer.firstChild);

    const dataset = countryData.data;

    const change = getChangeByPercentage(dataset);


    // Set domains for scales
    x.domain(d3.extent(dataset, d => d.year));
    y.domain([0, d3.max(dataset, d => d.value) + 10]);

    // Update axes
    xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
    yAxis.call(d3.axisLeft(y));

    // Line path
    svgChart.selectAll(".line").remove();
    const path = svgChart.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("d", line);

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

    // Circles and interaction
    svgChart.selectAll("circle").remove();
    svgChart.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.value))
        .attr("r", 0) // start with radius 0
        .attr("fill", "steelblue")
        .on("mouseover", d => highlightLine(d.year, d.value))
        .on("mouseout", () => {
            tooltip.style("display", "none");
            svgChart.selectAll(".highlighted-line").remove();
        })
        .transition() // start a transition
        .delay((d, i) => i * (3000 / dataset.length)) // delay based on position
        .duration(900) // for 2 seconds
        .attr("r", 4); // transition radius to 4

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

    // Text box
    svgChart.selectAll(".data-label").remove();
    svgChart.append("text")
        .attr("class", "data-label")
        .attr("x", x(dataset[0].year) + 10) // slightly offset from the circle
        .attr("y", y(dataset[0].value))
        .text(dataset[0].value) // display the value
        .style("opacity", 0) // start invisible
        .transition() // start a transition
        .duration(4000) // for 2 seconds
        .style("opacity", 1) // transition to visible
        .attrTween("x", function () {
            const xi = d3.interpolate(x(dataset[0].year) + 10, x(dataset[dataset.length - 1].year) + 10);
            return function (t) {
                return xi(t);
            };
        })
        .attrTween("y", function () {
            const yi = d3.interpolate(y(dataset[0].value), y(dataset[dataset.length - 1].value));
            return function (t) {
                return yi(t);
            };
        })
        .tween("text", function () {
            const valueInterpolator = d3.interpolate(dataset[0].value, dataset[dataset.length - 1].value);
            return function (t) {
                this.textContent = Math.round(valueInterpolator(t));
            };
        });

        
        if (change === "increased") {
            console.log("Values have increased by 50% or more compared to the starting value.");
            showSpinner(true);
        } else if (change === "decreased") {
            console.log("Values have decreased by 50% or more compared to the starting value.");
            showSpinner(false);
        } else {
            showSpinner(false);
        }
}

// Load world map data and JSON data
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.json("./data/renewable_energy_data.json")
]).then(([geoData, energyData]) => {
    // Initialize map

    console.log(geoData.features[0]); // log the first feature from the geoData
    console.log(energyData[0]); // log the first object from the energyData
    console.log(geoData.features[0].properties); // log the properties of the first feature from the geoData
    
    const projection = d3.geoMercator().scale(200).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    const svgMap = d3.select("#map-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a tooltip
    const tooltip = d3.select("#map-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

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
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.properties.name) // access the country name with d.properties.name
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", "#cce5ff");
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function (event, d) {
            const selectedCountry = d.properties.name;
            const countryData = energyData.find(e => e.GeoAreaName === selectedCountry);
            if (countryData) {
                drawChart(countryData);
            } else {
                alert(`No data found for ${selectedCountry}`);
            }
        });

    // Draw initial chart for "Afghanistan"
    const initialCountry = energyData.find(d => d.GeoAreaName === "Afghanistan");
    drawChart(initialCountry || { data: [] });
});


function getChangeByPercentage(dataset) {
    if (dataset.length === 0) {
        return "no-change";
    }

    const startingValue = dataset[0].value;
    const increasedValue = startingValue * 1.5;
    const decreasedValue = startingValue * 0.5;

    let hasIncreased = false;
    let hasDecreased = false;

    for (let i = 1; i < dataset.length; i++) {
        if (dataset[i].value >= increasedValue) {
            hasIncreased = true;
        } else if (dataset[i].value <= decreasedValue) {
            hasDecreased = true;
        }

        if (hasIncreased || hasDecreased) {
            break;
        }
    }

    if (hasIncreased) {
        return "increased";
    } else if (hasDecreased) {
        return "decreased";
    } else {
        return "no-change";
    }
}

let spinnerTimeout;

function showSpinner(show) {
    const spinner = document.getElementById("spinner-container");
    if (spinner) {
        clearTimeout(spinnerTimeout); // Clear any existing timeout

        if (show) {
            spinnerTimeout = setTimeout(() => {
                spinner.classList.remove("hidden");
                spinner.classList.add("visible");
            }, 5000);
        } else {
            spinner.classList.remove("visible");
            spinner.classList.add("hidden");
        }
    }
}


