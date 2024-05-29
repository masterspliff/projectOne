async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function loadCSV(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return d3.csvParse(text);
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

async function fetchAndUpdateData(countryName) {
    try {
        const encodedCountryName = encodeURIComponent(countryName); // Properly encode the country name
        const electricityDataUrl = `http://localhost:4000/electricity-access-data/${encodedCountryName}`;
        const hdiDataUrl = '../data/HDI_DATA_Total.json';

        // Fetching both datasets concurrently using Promise.all
        const [electricityResponse, hdiResponse] = await Promise.all([
            fetch(electricityDataUrl),
            fetch(hdiDataUrl)
        ]);

        // Check if both responses are OK
        if (!electricityResponse.ok) {
            throw new Error(`HTTP error! status: ${electricityResponse.status}`);
        }
        if (!hdiResponse.ok) {
            console.warn(`HTTP warning! Unable to fetch HDI data. Status: ${hdiResponse.status}`);
        }

        const electricityData = await electricityResponse.json();
        const allCountriesHDI = hdiResponse.ok ? await hdiResponse.json() : null;

        console.log("Fetched electricity data:", electricityData);
        if (allCountriesHDI) {
            console.log("Fetched all HDI data:", allCountriesHDI);
        } else {
            console.log("HDI data not available for:", countryName);
        }

        // Process electricity data
        const categories = ['ALLAREA', 'RURAL', 'URBAN'];
        const formattedElectricityData = categories.map(category => ({
            GeoAreaName: countryName,
            category: category,
            data: electricityData.filter(item => item.Location === category).map(item =>
                Object.keys(item).filter(key => !isNaN(key) && key.length === 4).map(year => ({
                    year: parseInt(year, 10),
                    value: parseFloat(item[year])
                })).sort((a, b) => a.year - b.year)
            ).flat()
        }));

        // Initialize the array for chart data with electricity data
        const chartData = formattedElectricityData;

        // Add HDI data if available
        if (allCountriesHDI) {
            const countryHDI = allCountriesHDI.HDIData.find(country => country.Country === countryName);
            if (countryHDI) {
                const formattedHDI = {
                    GeoAreaName: countryName,
                    category: 'HDI',
                    data: Object.keys(countryHDI)
                        .filter(key => !isNaN(key) && key.length === 4)
                        .map(year => ({
                            year: parseInt(year, 10),
                            value: parseFloat(countryHDI[year]) * 100
                        }))
                        .sort((a, b) => a.year - b.year)
                };
                chartData.push(formattedHDI); // Only add HDI data if found
                console.log("Formatted HDI data for chart:", formattedHDI);
            } else {
                console.warn('Country not found in HDI data:', countryName);
            }
        }

        console.log("Formatted electricity data for chart:", formattedElectricityData);
        console.log("Final chart data being passed to drawChart:", chartData);
        drawChart(chartData);
    } catch (error) {
        console.error('Failed to fetch or process data:', error);
    }
}

async function loadCountryInfo() {
    try {
        const url = './data/countryInfo.json'; 
        const response = await fetch(url);
        return response.json(); 
    } catch (error) {
        console.error('Failed to load country information:', error);
        return {};
    }
}

// TEST
async function fetchAndUpdateRenewableData(countryName) {
    try {
        const csvUrl = './csv/renewableEnergyShare.csv';
        const renewableData = await loadCSV(csvUrl);

        const countryData = renewableData.filter(row => row.GeoAreaName === countryName);
        if (countryData.length === 0) {
            console.warn('No renewable energy data available for:', countryName);
            return;
        }

        const categories = ["ALL", "BIOENERGY", "GEOTHERMAL", "HYDROPOWER", "MARINE", "SOLAR", "WIND"];

        const years = Object.keys(countryData[0]).filter(key => !isNaN(key) && key.length === 4);

        const data = years.map(year => {
            const yearData = { year: parseInt(year, 10) };
            categories.forEach(category => {
                const categoryData = countryData.find(row => row['Type of renewable technology'] === category);
                yearData[category] = categoryData ? parseFloat(categoryData[year]) : 0;
            });
            return yearData;
        });

        console.log("Formatted renewable energy data for chart:", data);

        drawRenewableChart(countryName, data, categories);
    } catch (error) {
        console.error('Failed to fetch or process renewable data:', error);
    }
}

function drawRenewableChart(countryName, data, categories) {
    const svgWidth = 800;
    const svgHeight = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Clear previous SVG chart if any
    d3.select("#infoBox svg.renewable-chart").remove();
    d3.select("#infoBox .tooltip").remove(); // Remove any existing tooltip

    const svg = d3.select("#infoBox")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("class", "renewable-chart") // Add a class for easier selection
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a tooltip div
    const tooltip = d3.select("#infoBox").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("padding", "8px")
        .style("border", "1px solid #d9d9d9")
        .style("border-radius", "4px")
        .style("display", "none")
        .style("z-index", "2000");

    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.sum(categories, key => d[key]))])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(categories)
        .range(d3.schemeCategory10);

    // Stack the data
    const stackedData = d3.stack()
        .keys(categories)(data);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Highlight function
    const highlight = function(event, d) {
        const category = d3.select(this.parentNode).datum().key;
        d3.selectAll(".bar").style("opacity", 0.2);
        d3.selectAll(`.bar.${category}`).style("opacity", 1);
    };

    // Unhighlight function
    const unhighlight = function(event, d) {
        d3.selectAll(".bar").style("opacity", 1);
    };

    // Show the bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", d => `bar ${d.key}`)
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => x(d.data.year))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
            highlight.call(this, event, d);
            const category = d3.select(this.parentNode).datum().key;
            tooltip
                .html(`Category: ${category}<br>Value: ${d[1] - d[0]}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("display", "block");
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseleave", function(event, d) {
            unhighlight.call(this, event, d);
            tooltip.style("display", "none");
        });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Renewable Energy Capacity in ${countryName}`);
}





document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM fully loaded and parsed');
    countryInfo = await loadCountryInfo(); // Load the country information once and use it later
    renderMap(countryInfo);
    window.addEventListener('resize', () => renderMap(countryInfo)); // Re-render map on window resize
});

const akonCountries = ["Mali","Niger", "Senegal", "Guinea", "Burkina Faso", "Sierra Leone", "Benin"," Equatorial Guinea", "Gabon",
        "Republic of Congo","Namibia","Madagascar","Kenya","Nigeria"];

const margin = { top: 10, right: 10, bottom: 10, left: 10 };

async function renderMap(countryInfo) {
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

    const tooltipMap = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("padding", "8px")
        .style("border", "1px solid #d9d9d9")
        .style("border-radius", "4px")
        .style("display", "none")
        .style("z-index", "1001");

    const africanCountries = await getAfricanCountriesData();
    console.log('Own list of African countries:', africanCountries);

    const geoData = await loadJSON("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
    const africaGeoData = geoData.features.filter(d => africanCountries.includes(d.properties.name));
    console.log('Filtered list of African countries:', africaGeoData);

    let missingCountries = africanCountries.filter(country => !africaGeoData.some(geoCountry => geoCountry.properties.name === country));
    console.log('Missing countries:', missingCountries);

    const projection = d3.geoMercator()
                         .scale(containerWidth / 2)
                         .translate([containerWidth / 2, containerHeight / 2]);

    const path = d3.geoPath().projection(projection);

    svgMap.selectAll("path")
        .data(africaGeoData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function(d) { return akonCountries.includes(d.properties.name) ? "blue" : "grey"; })
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#6699ff");
            tooltipMap.style("display", "block")
                .html(d.properties.name)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", akonCountries.includes(d.properties.name) ? "blue" : "grey");
            tooltipMap.style("display", "none");
        })
        .on("click", async function(event, d) {
            await fetchAndUpdateData(d.properties.name);
            await fetchAndUpdateRenewableData(d.properties.name); // Fetch and update renewable data
            const currentCountryData = countryInfo[d.properties.name];
            const infoText = currentCountryData ? currentCountryData.info : 'No information available';
            updateInfoBox(d.properties.name, infoText);
        });
        
        
}

function updateInfoBox(countryName, infoText) {
    document.getElementById('infoBoxTitle').textContent = countryName;
    document.getElementById('infoBoxText').textContent = infoText || 'No information available';

    const infoHtml = `
        <h2>${countryName}</h2>
        <div class="infoText">${infoText || 'No detailed facts available'}</div>
        <br><br>
    `;
    document.getElementById('infoFact').innerHTML = infoHtml;
}

