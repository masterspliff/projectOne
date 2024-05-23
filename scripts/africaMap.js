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

const margin = { top: 10, right: 10, bottom: 10, left: 10 },
      width = 700 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

const svgMap = d3.select("#map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(0)");

const tooltipMap = d3.select("body")
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
    //
    const projection = d3.geoMercator().scale(400).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    svgMap.selectAll("path")
        .data(africaGeoData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#cce5ff")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        // Added color when hovering over a country.
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#6699ff");
            tooltipMap.style("display", "block") // displaying the country name when hovering
                .html(d.properties.name)
                .style("left", (event.pageX + 10) + "px") // position of the box/tooltip
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", "#cce5ff");
            tooltipMap.style("display", "none");
        })
        .on("click", async function (event, d) {
            fetchCountryData(d.properties.name); // Fetch data when country is clicked
        });
}

renderMap();
