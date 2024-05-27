async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function ElectricityAccessData() {
    try {
        const response = await fetch('http://localhost:4000/get-sphere-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Failed to fetch electricity access data:', error);
        throw error;
    }
}

function processAccessData(rawData, nameMap) {
    let accessData = {};
    rawData.forEach(entry => {
        let originalName = entry.GeoAreaName.trim(); // Trim to avoid whitespace issues
        let mappedName = nameMap[originalName] || originalName;
        accessData[mappedName] = parseFloat(entry['2022']); // Use the latest year or adjust as needed
    });
    return accessData;
}

export default async function createGlobe() {
    const countryNameMap = {
        // Existing mappings
        "United Republic of Tanzania": "Tanzania",
        "Western Sahara": "W. Sahara",
        "Democratic Republic of the Congo": "Dem. Rep. Congo",
        "Dominican Republic": "Dominican Rep.",
        "Russian Federation": "Russia",
        "Falkland Islands": "Falkland Is.",
        "French Southern and Antarctic Lands": "Fr. S. Antarctic Lands",
        "Bolivia (Plurinational State of)": "Bolivia",
        "Venezuela (Bolivarian Republic of)": "Venezuela",
        "Central African Republic": "Central African Rep.",
        "Equatorial Guinea": "Eq. Guinea",
        "Swaziland": "eSwatini", 
        "State of Palestine": "Palestine",
        "Lao People's Democratic Republic": "Laos",
        "Viet Nam": "Vietnam",
        "Democratic People's Republic of Korea": "North Korea",
        "Republic of Korea": "South Korea",
        "Iran (Islamic Republic of)": "Iran",
        "Syrian Arab Republic": "Syria",
        "Republic of Moldova": "Moldova",
        "Turkey": "Türkiye", 
        "Netherlands (Kingdom of the)": "Netherlands", 
        "Solomon Islands": "Solomon Is.",
        "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
        "Brunei Darussalam": "Brunei",
        "Antarctica": "Antarctica", 
        "Northern Cyprus": "N. Cyprus",
        "Somaliland": "Somaliland", 
        "Bosnia and Herzegovina": "Bosnia and Herz.",
        "North Macedonia": "Macedonia", 
        "Kosovo": "Kosovo", 
        "South Sudan": "S. Sudan",
        "Eswatini": "eSwatini", 
        "Nederland": "Netherlands", 

    };
    

    const width = window.innerWidth, height = window.innerHeight;
    const sensitivity = 0.10;

    const projection = d3.geoOrthographic()
        .scale(420)
        .translate([width / 2, height / 2])
        .rotate([0, -30]);
    const path = d3.geoPath().projection(projection);

    const svg = d3.selectAll("#globe, #globeLeft")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.drag()
            .subject(() => {
                const r = projection.rotate();
                return { x: r[0] / sensitivity, y: -r[1] / sensitivity };
            })
            .on("drag", (event) => {
                const rotate = projection.rotate();
                projection.rotate([event.x * sensitivity, -event.y * sensitivity, rotate[2]]);
                svg.selectAll("path").attr("d", path);
            }));

    const accessLevels = {
        "full": "#90D26D",
        "upperMedium": "#FFA500",
        "medium": "#FFD700",
        "loverMedium": "FF4500",
        "none": "#FF0000"
    };

    function getAccessColor(value) {
        if (value >= 95) return accessLevels["full"];
        else if (value >= 70) return accessLevels["upperMedium"];
        else if (value >= 50) return accessLevels["medium"];
        else if (value <= 50) return accessLevels["lowerMedium"];
        else return accessLevels["none"];
    }

    try {
        const [world, rawAccessData] = await Promise.all([
            loadJSON("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json"),
            ElectricityAccessData()
        ]);

        const accessData = processAccessData(rawAccessData, countryNameMap);
        const countries = topojson.feature(world, world.objects.countries).features;

        console.log("Access data:", accessData);

        svg.append("path")
            .datum({ type: "Sphere" })
            .attr("class", "sphere")
            .attr("d", path)
            .style("opacity", 0)
            .transition()
            .duration(4000)
            .ease(d3.easeCubicInOut)
            .style("opacity", 1);

        svg.selectAll(".country")
            .data(countries)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .style("fill", d => {
                const countryName = d.properties.name;
                const accessValue = accessData[countryName];
                if (accessValue !== undefined) {
                    return getAccessColor(accessValue);
                } else {
                    console.error("Missing data for:", countryName);
                    return "#808080";
                }
            })
            .style("opacity", 0)
            .transition()
            .duration(4000)
            .ease(d3.easeCubicInOut)
            .style("opacity", 1);

        d3.timer((elapsed) => {
            const rotate = projection.rotate();
            const rotationSpeed = -0.2;
            projection.rotate([rotate[0] + rotationSpeed, rotate[1]]);
            svg.selectAll("path").attr("d", path);
        });

    } catch (err) {
        console.error('Error loading data or creating globe:', err.message);
    }
}
