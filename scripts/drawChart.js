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
            .style("opacity", 0)
            .transition()
            .delay(3100)
            .style("opacity", 1);
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