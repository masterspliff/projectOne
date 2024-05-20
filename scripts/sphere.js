// Set up dimensions
const width = window.innerWidth,
    height = window.innerHeight;

// Projection and path generator
const projection = d3.geoOrthographic()
    .scale(420)
    .translate([width / 2, height / 2])
    .rotate([0, -30]);

const path = d3.geoPath().projection(projection);

// Create SVG
const svg = d3.select("#globe")
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

// Sensitivity for dragging
const sensitivity = 0.10;

// Create graticule
const graticule = d3.geoGraticule();

// Draw graticule with initial opacity set to 0
const graticulePath = svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path)
    .style("opacity", 0); // Set initial opacity to 0

// Transition the graticule to ease it in
graticulePath.transition()
    .duration(4000)
    .ease(d3.easeCubicInOut)
    .style("opacity", 1);

// Access levels and corresponding colors
const accessLevels = {
    "full": "#00FF00", // Green
    "medium": "#FFD700", // Yellow
    "none": "#FF4500" // OrangeRed
};

function getAccessColor(value) {
    if (value >= 95) return accessLevels["full"];
    else if (value >= 50) return accessLevels["medium"];
    else return accessLevels["none"];
}

// Load and draw world map
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json").then(world => {
    const countries = topojson.feature(world, world.objects.countries).features;

    // Load electricity access data
    d3.json("./data/EG_ACS_ELEC_standardized.json").then(data => {
        const tableFormat = data.TableFormat;
        const accessData = {};

        // Extract relevant data (for "ALLAREA") Kan vælge
        tableFormat.forEach(row => {
            if (row.Location === "ALLAREA") {
                accessData[row.GeoAreaName] = row["2022"];
            }
        });

        // Create sphere
        svg.append("path")
            .datum({ type: "Sphere" })
            .attr("class", "sphere")
            .attr("d", path)
            .style("opacity", 0) // Set initial opacity to 0
            .transition() // Apply transition
            .duration(4000) // Duration of transition in milliseconds (4 seconds)
            .ease(d3.easeCubicInOut) // Easing function for smooth transition
            .style("opacity", 1); // Set opacity to fully visible

        // Draw countries with specific colors based on electricity access
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
                    return "#1E90FF"; // Default color (Blue)
                }
            })
            .style("opacity", 0) // Set initial opacity to 0
            .transition() // Apply transition
            .duration(4000) // Duration of transition in milliseconds (4 seconds)
            .ease(d3.easeCubicInOut) // Easing function for smooth transition
            .style("opacity", 1); // Set opacity to fully visible




        // Rotate Globe
        d3.timer((elapsed) => {
            const rotate = projection.rotate();
            const rotationSpeed = -0.2; // Reduced rotation speed
            projection.rotate([rotate[0] + rotationSpeed, rotate[1]]);
            svg.selectAll("path").attr("d", path);
        });
    });
});


// sphere.js

export default function createGlobe() {
    // Your code to create the globe goes here
    // For example:
    console.log("Creating globe...");
}
