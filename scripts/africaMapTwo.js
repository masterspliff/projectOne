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
        console.log('Fetched African countries data:', countries);
        return countries; // This should be an array of country names
    } catch (error) {
        console.error('Failed to fetch African countries data:', error);
        return []; // Return an empty array on error to avoid further issues
    }
}

async function updateData(countryName) {
    try {
        const url = `http://localhost:4000/electricity-access-data/${countryName}`;  // Ensure the country's name is properly encoded if it contains special characters or spaces
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", data); // Log data immediately after receiving

        // Format data for ALLAREA, RURAL, and URBAN
        const categories = ['ALLAREA', 'RURAL', 'URBAN'];
        const formattedData = categories.map(category => ({
            GeoAreaName: countryName,
            category: category,
            data: data.filter(item => item.Location === category).map(item => 
                Object.keys(item).filter(key => !isNaN(key) && key.length === 4).map(year => ({
                    year: parseInt(year, 10),
                    value: parseFloat(item[year])
                })).sort((a, b) => a.year - b.year)
            ).flat()  // Flatten the array if necessary
        }));
        
        console.log("Formatted data for chart:", formattedData); // Log after data is formatted
        drawChart(formattedData);  // Call the drawChart function from drawChartTwo.js
    } catch (error) {
        console.error('Failed to update data:', error);
    }
}

const akonCountries = ["Mali","Niger", "Senegal", "Guinea", "Burkina Faso", "Sierra Leone", "Benin"," Equatorial Guinea", "Gabon",
        "Republic of Congo","Namibia","Madagascar","Kenya","Nigeria"];

const margin = { top: 10, right: 10, bottom: 10, left: 10 };

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    renderMap();
    window.addEventListener('resize', renderMap); // Re-render map on window resize
});

async function renderMap() {
    // Clear existing SVG
    d3.select("#mapContainer").selectAll("*").remove();

    const containerWidth = document.querySelector("#mapContainer").clientWidth;
    const containerHeight = document.querySelector("#mapContainer").clientHeight;

    const svgMap = d3.select("#mapContainer")
          .append("svg")
          .attr("width", containerWidth)
          .attr("height", containerHeight)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const tooltipMap = d3.select("body") // css styling for the tooltip
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("padding", "8px")
        .style("border", "1px solid #d9d9d9")
        .style("border-radius", "4px")
        .style("display", "none")
        .style("z-index", "1001");

    const africanCountries = await getAfricanCountriesData(); // creating new variable and storing the data from the db. await till its loaded
    console.log('Own list of African countries:', africanCountries); // checks if the countries are loaded correctly.

    const geoData = await loadJSON("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"); // world map json with svg properties etc. 
    const africaGeoData = geoData.features.filter(d => africanCountries.includes(d.properties.name)); // filter out all unnecessary countries unrelated to Africa. 
    
    console.log('Filtered list of African countries:', africaGeoData);
    let missingCountries = africanCountries.filter(country => !africaGeoData.some(geoCountry => geoCountry.properties.name === country));

    console.log('Missing countries:', missingCountries);
    // setting up the map projection and geographic paths
    const projection = d3.geoMercator()
                         .scale(containerWidth / 2)
                         .translate([containerWidth / 2, containerHeight / 2]); // center the map in the container

    const path = d3.geoPath().projection(projection); // setting up the svg data using geographic features. essentially using the mercator projector, so d3 can use the path generator to draw the map. 

    svgMap.selectAll("path")
        .data(africaGeoData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            if (akonCountries.includes(d.properties.name)) {
                return "blue"; // color for countries in akonCountries list
            } else {
                return "grey"; // color for other countries
            }
        })
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
            var originalColor = akonCountries.includes(d.properties.name) ? "blue" : "grey"; // Check if the country is in akonCountries
            d3.select(this).attr("fill", originalColor); // resetting the color back to its original state based on condition
            tooltipMap.style("display", "none"); // removes the tooltip when not any longer hovered over the country
        })
        .on("click", async function (event, d) { // click function
            updateData(d.properties.name); // fetching the data from the selected country
        });
}