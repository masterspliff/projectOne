const data = [
    { country: "Mali", values: [34.2, 53.0], color: "rgba(255, 99, 132, 0.4)" },
    { country: "Niger", values: [15.7, 20.0], color: "rgba(54, 162, 235, 0.4)" },
    { country: "Senegal", values: [61.0, 71.0], color: "rgba(255, 206, 86, 0.4)" },
    { country: "Guinea", values: [44.6, 53.0], color: "rgba(75, 192, 192, 0.4)" },
    { country: "Burkina Faso", values: [58.4, 70.0], color: "rgba(153, 102, 255, 0.4)" },
    { country: "Sierra Leone", values: [18.8, 29.0], color: "rgba(255, 159, 64, 0.4)" },
    { country: "Benin", values: [34.1, 57.0], color: "rgba(255, 0, 0, 0.4)" },
    { country: "Equatorial Guinea", values: [66.0, 67.0], color: "rgba(0, 255, 0, 0.4)" },
    { country: "Gabon", values: [87.1, 93.0], color: "rgba(0, 0, 255, 0.4)" },
    { country: "Republic of Congo", values: [42.0, 45.0], color: "rgba(255, 255, 0, 0.4)" },
    { country: "Namibia", values: [73.8, 75.0], color: "rgba(255, 0, 255, 0.4)" },
    { country: "Madagascar", values: [63.2, 72.0], color: "rgba(0, 255, 255, 0.4)" },
    { country: "Kenya", values: [68.4, 98.0], color: "rgba(128, 128, 128, 0.4)" },
    { country: "Nigeria", values: [84.7, 89.0], color: "rgba(255, 192, 203, 0.4)" }
];

data.sort((a, b) => d3.ascending(a.values[1], b.values[1]));

const marginTwo = { top: 30, right: 30, bottom: 70, left: 150 };
const widthTwo = 800 - marginTwo.left - marginTwo.right;
const heightTwo = 500 - marginTwo.top - marginTwo.bottom;

const svg = d3.select("#barchart")
    .attr("width", widthTwo + marginTwo.left + marginTwo.right)
    .attr("height", heightTwo + marginTwo.top + marginTwo.bottom)
    .append("g")
    .attr("transform", "translate(" + marginTwo.left + "," + marginTwo.top + ")");

const xScaleTwo = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.max(d.values))])
    .range([0, widthTwo]);

const yScaleTwo = d3.scaleBand()
    .domain(data.map(d => d.country))
    .range([0, heightTwo])
    .padding(0.1);

const colorScaleTwo = d3.scaleOrdinal()
    .domain(data.map(d => d.country))
    .range(data.map(d => d.color));

const tooltip = d3.select("body").append("div")
    .attr("class", "sectionTwoTooltip")
    .style("opacity", 0);

data.forEach((d, i) => {
    svg.selectAll(".bar" + i)
        .data([d])
        .enter().append("rect")
        .attr("class", "bar" + i)
        .attr("x", 0)
        .attr("y", yScaleTwo(d.country))
        .attr("width", xScaleTwo(d.values[0]))
        .attr("height", yScaleTwo.bandwidth() / 2)
        .attr("fill", d.color)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill-opacity", 1);
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html("Country: " + d.country + "<br/>2014: " + d.values[0] + "%")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill-opacity", 0.7);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.selectAll(".bar" + i + "b")
        .data([d])
        .enter().append("rect")
        .attr("class", "bar" + i + "b")
        .attr("x", 0)
        .attr("y", yScaleTwo(d.country) + yScaleTwo.bandwidth() / 2)
        .attr("width", xScaleTwo(d.values[1]))
        .attr("height", yScaleTwo.bandwidth() / 2)
        .attr("fill", d3.rgb(d.color).darker(1))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill-opacity", 1);
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html("Country: " + d.country + "<br/>2022: " + d.values[1] + "%")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill-opacity", 0.7);
            tooltip.transition().duration(500).style("opacity", 0);
        });
});

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + heightTwo + ")")
    .call(d3.axisBottom(xScaleTwo));

svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScaleTwo));
