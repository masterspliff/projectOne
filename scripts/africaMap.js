async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function getAfricanCountriesData() {
    try {
        const response = await fetch('http://localhost:4000/african-countries-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const countries = await response.json();
        return countries; // This should be an array of country names
    } catch (error) {
        console.error('Failed to fetch African countries data:', error);
        return []; // Return an empty array on error to avoid further issues
    }
}

async function fetchCountryData(countryName) {
    try {
        const response = await fetch(`http://localhost:4000/country-data/${countryName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const formattedData = formatDataForChart(data, countryName);
        drawChart([formattedData]); // Pass formatted data to the chart drawing function
    } catch (error) {
        console.error('Failed to fetch country data:', error);
    }
}

// Formatting data from selected country to the chart
function formatDataForChart(data, countryName) {
    return {
        GeoAreaName: countryName,
        data: Object.keys(data).filter(key => !isNaN(key)).map(year => ({
            year: parseInt(year, 10),
            value: parseFloat(data[year])
        })).sort((a, b) => a.year - b.year)
    };
}

const margin = { top: 10, right: 10, bottom: 10, left: 10 }, // defining standard margins for later use
      width = 700 - margin.left - margin.right, 
      height = 700 - margin.top - margin.bottom;

const svgMap = d3.select("#mapContainer") // using map-container to contain the map
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(0)");

const tooltipMap = d3.select("body") // css styling for the tooltip
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "8px")
    .style("border", "1px solid #d9d9d9")
    .style("border-radius", "4px")
    .style("display", "none");

async function renderMap() {

    const africanCountries = await getAfricanCountriesData(); // creating new variable and storing the data from the db. await till its loaded
    console.log(africanCountries); // checks if the countries is loaded correctly.


    const geoData = await loadJSON("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"); // world map json with svg propertiers etc. 
    const africaGeoData = geoData.features.filter(d => africanCountries.includes(d.properties.name)); // filter out all uneccesarry countires unrelated to africa. 
    
    // setting up the map projection and geographic paths
    const projection = d3.geoMercator().scale(400).translate([width / 2, height / 1.5]); // size of the map (africa) and method to moving the center of the map
    const path = d3.geoPath().projection(projection); // setting up the svg data using geoprahic features. essentially using the mercator projecter, so d3 can use the path generator to draw the map. 

    svgMap.selectAll("path")
        .data(africaGeoData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#cce5ff")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)

        .on("mouseover", function (event, d) { // hover effects starts here
            d3.select(this).attr("fill", "#6699ff");  // added color when hovering over a country.
            tooltipMap.style("display", "block") // displaying the country name when hovering
                .html(d.properties.name) // what text should be displaying in the tooltip (in this case the name of the country)
                .style("left", (event.pageX + 10) + "px") // position of the box/tooltip
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function (event, d) {  // when the cursor leaves and then "resetting" the hover effects. 
            d3.select(this).attr("fill", "#cce5ff"); // resetting the color back to normal
            tooltipMap.style("display", "none"); // removes the tooltip when not any longer hovered over the country
        })
        .on("click", async function (event, d) { // click function
            fetchCountryData(d.properties.name); // fetching the data from the selected country (name of the country -> which is being used to generate data from)
        });
}

renderMap();
