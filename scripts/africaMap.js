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

async function updateData(dataset, countryName) {
    try {
        const url = `http://localhost:4000/${dataset}/${countryName}`;  // Sørg for at landets navn er korrekt kodet, hvis det indeholder specialtegn eller mellemrum
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", data); // Log data lige efter det er modtaget

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
        
        console.log("Formatted data for chart:", formattedData); // Log efter data er formateret
        drawChart(formattedData);
    } catch (error) {
        console.error('Failed to update data:', error);
    }
}


const akonCountries = ["Mali","Niger", "Senegal", "Guinea", "Burkina Faso", "Sierra Leone", "Benin"," Equatorial Guinea", "Gabon",
        "Republic of Congo","Namibia","Madagascar","Kenya","Nigeria"];

const margin = { top: 10, right: 10, bottom: 10, left: 10 }, // defining standard margins for later use
      width = 700 - margin.left - margin.right, 
      height = 700 - margin.top - margin.bottom;

const svgMap = d3.select("#mapContainer")
      .append("svg")
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
    console.log('egen liste', africanCountries); // checks if the countries is loaded correctly.

    const geoData = await loadJSON("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"); // world map json with svg propertiers etc. 
    const africaGeoData = geoData.features.filter(d => africanCountries.includes(d.properties.name)); // filter out all uneccesarry countires unrelated to africa. 
    
    console.log('filteret liste', africaGeoData)
    let missingCountries = africanCountries.filter(country => !africaGeoData.some(geoCountry => geoCountry.properties.name === country));

    console.log('Missing countries:', missingCountries);
    // setting up the map projection and geographic paths
    const projection = d3.geoMercator().scale(400).translate([width / 2, height / 1.5]); // size of the map (africa) and method to moving the center of the map
    const path = d3.geoPath().projection(projection); // setting up the svg data using geoprahic features. essentially using the mercator projecter, so d3 can use the path generator to draw the map. 

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
            const activeButton = document.querySelector('#buttonContainer .active');
            const dataset = activeButton ? activeButton.dataset.dataset : 'african-countries-data';
            updateData(dataset, d.properties.name); // fetching the data from the selected country and dataset
        });
}

renderMap();

document.addEventListener('DOMContentLoaded', function() {
    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.addEventListener('click', function(event) {
        const target = event.target;
        if (target.tagName === 'BUTTON' && target.dataset.dataset) {
            // Remove active class from all buttons
            document.querySelectorAll('#buttonContainer button').forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            target.classList.add('active');

            // Get selected country name from map selection, if any
            const selectedCountry = document.querySelector('path.selected');
            if (selectedCountry) {
                const countryName = selectedCountry.datum().properties.name;
                updateData(target.dataset.dataset, countryName);
            }
        }
    });
});
