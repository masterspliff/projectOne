let svgChart, x, y, xAxis, yAxis, colorScale;

function initializeChart() {
    const margin = { top: 80, right: 20, bottom: 30, left: 50 },
          width = 700 - margin.left - margin.right,
          height = 800 - margin.top - margin.bottom;

    svgChart = d3.select("#chartContainer").append("svg")
        .attr("width", width )
        .attr("height", height )
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    xAxis = svgChart.append("g")
          .attr("transform", `translate(0,${height})`);
    yAxis = svgChart.append("g");

    colorScale = d3.scaleOrdinal()
        .domain(['ALLAREA', 'RURAL', 'URBAN'])
        .range(d3.schemeCategory10);  // or any other suitable color scheme
}

function drawLegend() {
    const legend = svgChart.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width}, 30)`);  // Adjust position based on layout

    legend.selectAll('rect')
      .data(colorScale.domain())
      .enter()
      .append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 24)  // Spacing between legend entries
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', colorScale);

    legend.selectAll('text')
      .data(colorScale.domain())
      .enter()
      .append('text')
        .attr('x', 24)
        .attr('y', (d, i) => i * 24 + 14) // Align text slightly lower than rect
        .text(d => d);
}

function drawChart(selectedCountriesData) {
    svgChart.selectAll(".line").remove();
    svgChart.selectAll("circle").remove();
    svgChart.selectAll(".end-label").remove();
    svgChart.selectAll(".countryTitle").remove(); // Remove existing title if any
    
    drawLegend();  // Call this after setting up the chart


    const allData = selectedCountriesData.flatMap(country => country.data);
    x.domain(d3.extent(allData, d => d.year));
    y.domain([0, d3.max(allData, d => d.value) + 10]);

    xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
    yAxis.call(d3.axisLeft(y));

    // Add a title for the selected country (assuming only one country is selected for simplicity)
    if (selectedCountriesData.length === 1) {
        console.log("Appending title for:", selectedCountriesData[0].GeoAreaName);  // Debugging line
        svgChart.append("text")
            .attr("class", "countryTitle")
            .attr("x", x.range()[1] / 2)
            .attr("y", 20) // This positions it 20 pixels down from the top margin.
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(selectedCountriesData[0].GeoAreaName);
    }

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("display", "none")
        .style("padding", "10px")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("pointer-events", "none");

    selectedCountriesData.forEach((countryData, index) => {
        const lineFunction = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value));

        const path = svgChart.append("path")
            .datum(countryData.data)
            .attr("class", "line")
            .attr("d", lineFunction)
            .attr("stroke", colorScale(countryData.category))
            .attr("fill", "none")
            .attr("stroke-width", 2);

        let totalLength = 0;
        if (path.node()) {
            totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(3000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
        }

        // Correctly handle the enter selection for circles
        const circles = svgChart.selectAll(`circle.${countryData.GeoAreaName}.${countryData.category}`)
            .data(countryData.data)
            .enter()
            .append("circle")
            .attr("class", `${countryData.GeoAreaName} ${countryData.category}`)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.value))
            .attr("r", 0); // Start with no radius

        // Animate circles to appear as the line is drawn
        circles.transition()
            .delay((d, i) => i * (3000 / countryData.data.length)) // Delay to synchronize with line drawing
            .duration(500)
            .attr("r", 4)
            .attr("fill", colorScale(countryData.category));

        // Adding tooltip interaction
        circles.on("mouseover", function(event, d) {
            d3.select(this).transition().attr("r", 6);
            tooltip.style("display", "block")
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 10) + "px")
                   .html(`Year: ${d.year}<br>Value: ${d.value}%<br>Category: ${countryData.category}`);
        })
        .on("mouseout", function() {
            d3.select(this).transition().attr("r", 4);
            tooltip.style("display", "none");
        });
    });
}

document.addEventListener("DOMContentLoaded", initializeChart);
