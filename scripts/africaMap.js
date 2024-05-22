async function loadJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function getAfricanCountriesData() {
  try {
      const response = await fetch('http://localhost:4000/african-countries-data'); // Corrected endpoint
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
  } catch (error) {
      console.error('Failed to fetch African countries data:', error);
      throw error; 
  }
}

// Constants
const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 1000,
    height = 700;

// SVG setup for the map
const svgMap = d3.select("#map-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip setup
const tooltipMap = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "8px")
    .style("border", "1px solid #d9d9d9")
    .style("border-radius", "4px")
    .style("display", "none");

// Store selected countries
const selectedCountries = new Set();

async function renderMap() {
  try {
    // Load African countries data
    const africanCountries = await getAfricanCountriesData();
    
    // Load world map data
    const geoData = await loadJSON("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
    
    const africaGeoData = geoData.features.filter(d => africanCountries.includes(d.properties.name));

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
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#6699ff");
            tooltipMap.style("display", "block")
                .html(d.properties.name)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function (event, d) {
            if (!selectedCountries.has(d.properties.name)) {
                d3.select(this).attr("fill", "#cce5ff");
            }
            tooltipMap.style("display", "none");
        })
        .on("click", function (event, d) {
            const selectedCountry = d.properties.name;
            if (selectedCountries.has(selectedCountry)) {
                selectedCountries.delete(selectedCountry);
            } else {
                selectedCountries.add(selectedCountry);
            }
            d3.select(this).attr("fill", selectedCountries.has(selectedCountry) ? "#6699ff" : "#cce5ff");
        });
  } catch (error) {
    console.error('Error rendering the map:', error);
  }
}

renderMap();
