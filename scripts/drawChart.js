let svgChart, x, y, xAxis, yAxis, colorScale;

function initializeChart() {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 },
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    svgChart = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    xAxis = svgChart.append("g")
          .attr("transform", `translate(0,${height})`);
    yAxis = svgChart.append("g");

    colorScale = d3.scaleOrdinal(d3.schemeCategory10);
}

function drawChart(selectedCountriesData) {
    svgChart.selectAll(".line").remove();
    svgChart.selectAll("circle").remove();
    svgChart.selectAll(".end-label").remove();

    const allData = selectedCountriesData.flatMap(country => country.data);
    x.domain(d3.extent(allData, d => d.year));
    y.domain([0, d3.max(allData, d => d.value) + 10]);

    xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
    yAxis.call(d3.axisLeft(y));

    selectedCountriesData.forEach((countryData, index) => {
        const path = svgChart.append("path")
            .datum(countryData.data)
            .attr("class", "line")
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d.value)))
            .attr("stroke", colorScale(index))
            .attr("fill", "none")
            .attr("stroke-width", 2);

        if (path.node()) {
            const totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", `${totalLength} ${totalLength}`)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(3000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
        }

        svgChart.selectAll(`circle.${countryData.GeoAreaName}`)
            .data(countryData.data)
            .enter()
            .append("circle")
            .attr("class", `${countryData.GeoAreaName}`)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.value))
            .attr("r", 4)
            .attr("fill", colorScale(index))
            .on("mouseover", function (event, d) {
                d3.select(this).attr("r", 6);
            })
            .on("mouseout", function () {
                d3.select(this).attr("r", 4);
            });
    });
}

document.addEventListener("DOMContentLoaded", initializeChart);
