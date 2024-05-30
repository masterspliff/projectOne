document.getElementById("startButton").addEventListener("click", function() {
    // Get elements
    const quoteOne = document.getElementById("quoteOne");
    const startButton = document.getElementById("startButton");
    const quoteTwo = document.getElementById("quoteTwo");
    const quoteThree = document.getElementById("quoteThree");
    const globe = document.getElementById("globe");
    const globeContainer = document.getElementById("globeContainer");
    const globeContainerLeft = document.getElementById("globeContainerLeft");
    const globeLeft = document.getElementById("globeLeft");  
    const quoteRef = document.getElementById("quoteRef");
    const globeLegend = document.querySelector(".globeLegend");
    const continueButton = document.querySelector(".continueButton");

    // Fade out the current quote and the start button
    [quoteOne, startButton, quoteRef].forEach(element => element.classList.add("fade"));

    setTimeout(() => {
        quoteOne.style.display = "none";
        quoteTwo.style.display = "block";
        quoteTwo.classList.add("fade");

        setTimeout(() => {
            quoteTwo.classList.add("fade-in");
        }, 10); // Small delay to ensure display change is applied

        // Import the JavaScript file after quoteTwo fades in
        import('./sphere.js').then(module => {
            module.default(); // Call the default export function
            globe.style.display = "block"; // Show the globe
        });

        // Fade out quoteTwo after 3 seconds, then fade in quoteThree
        setTimeout(() => {
            quoteTwo.classList.remove("fade-in");

            setTimeout(() => {
                quoteTwo.style.display = "none";
                quoteThree.style.display = "block";
                quoteThree.classList.add("fade");

                setTimeout(() => {
                    quoteThree.classList.add("fade-in");
                }, 10); // Small delay to ensure display change is applied

                // Fade out quoteThree after X seconds
                setTimeout(() => {
                    quoteThree.classList.remove("fade-in");

                    // Globe fader - fade in and left-fade
                    globe.classList.add("fade");
                    setTimeout(() => {
                        globe.style.display = "none";
                        globeContainer.style.display = "none";
                        globeContainerLeft.style.display = "block";
                        globeLeft.classList.add("fade-in-left");
                        globeLeft.style.display = "block";

                        setTimeout(() => {
                            // globeLegend fade in after globeLeft
                            globeLegend.classList.add('fade-in');

                            setTimeout(() => {
                                // Continue button fade in after globeLegend
                                continueButton.classList.add("fade-in");
                                continueButton.style.display = "block";
                                continueButton.style.opacity = 1;
                            }, 4000); // 4 seconds delay for continueButton fade-in
                        }, 1500); // 1.5 seconds delay for globeLegend fade-in
                    }, 2000); // 2 seconds delay for globe fade
                }, 8000); // 8 seconds delay for quoteThree fade
            }, 4000); // 4 seconds delay for quoteTwo fade
        }, 5000); // 5 seconds delay for quoteTwo fade-in
    }, 1200); // 1.2 seconds delay between initial fades
});

// Add event listener to the continue button to initiate the fade of the intro sequence
document.querySelector(".continueButton").addEventListener("click", function() {
    // Get all visible elements with the fade-in, fade-in-left, and fade classes
    const visibleElements = document.querySelectorAll(".fade-in, .fade-in-left, .fade");

    // Add fade class to each visible element and set opacity to 0
    visibleElements.forEach(element => {
        element.classList.add("fade");
        element.style.opacity = 0;
    });

    // Remove elements from the DOM after fade
    setTimeout(() => {
        visibleElements.forEach(element => {
            element.style.display = "none";
        });

        // Redirect to indexTwo.html
        window.location.href = "about";
    }, 2000); // Extended to 2000ms to match the fade-out duration of 2s
});
