let introSekvens = document.getElementById("startButton").addEventListener("click", function() {
    // Get elements
    var quoteOne = document.getElementById("quoteOne");
    var startButton = document.getElementById("startButton");
    var quoteTwo = document.getElementById("quoteTwo");
    var quoteThree = document.getElementById("quoteThree");
    var globe = document.getElementById("globe");
    var globeContainer = document.getElementById("globeContainer");
    var globeContainerLeft = document.getElementById("globeContainerLeft");
    var globeLeft = document.getElementById("globeLeft");  
    var quoteRef = document.getElementById("quoteRef");
    var globeLegend = document.querySelector(".globeLegend");
    var continueButton = document.querySelector(".continueButton");
    // Fade out the current quote and the start button
    quoteOne.classList.add("fade");
    startButton.classList.add("fade");
    quoteRef.classList.add("fade");
    
    setTimeout(function() {
        quoteOne.style.display = "none";
        quoteTwo.style.display = "block";
        quoteTwo.classList.add("fade");
        
        setTimeout(function() {
            quoteTwo.classList.add("fade-in");
        }, 10); // Small delay to ensure display change is applied

        // Import the JavaScript file after quoteTwo fades in
        import('./sphere.js').then(module => {
            // Once imported, execute the function
            module.default(); // Call the default export function
            // Show the sphere
            globe.style.display = "block";
        });

        // Fade out quoteTwo after 3 seconds, then fade in quoteThree
        setTimeout(function() {
            quoteTwo.classList.remove("fade-in");
            
            setTimeout(function() {
                quoteTwo.style.display = "none";
                quoteThree.style.display = "block";
                quoteThree.classList.add("fade");
                
                setTimeout(function() {
                    quoteThree.classList.add("fade-in");
                }, 10); // Small delay to ensure display change is applied

                // Fade out quoteThree after X seconds
                setTimeout(function() {
                    quoteThree.classList.remove("fade-in");

                    // Globe fader - fade in and left-fade
                    globe.classList.add("fade");
                    setTimeout(function() {
                        globe.style.display = "none";
                        // Switch from globeContainer to globeContainerLeft
                        globeContainer.style.display = "none";
                        globeContainerLeft.style.display = "block";
                        // Fade in globe from the left side after it fades out
                        globeLeft.classList.add("fade-in-left");
                        globeLeft.style.display = "block";
                            setTimeout(function() {
                                // globeLegend fade in after globeLeft
                                globeLegend.classList.add('fade-in');
                                setTimeout(function() {
                                    // Continue button fade in after globeLegend
                                    continueButton.classList.add("fade-in");
                                    continueButton.style.display = "block";
                                    continueButton.style.opacity = 1;
                                }, 4000); // 4 seconds delay / fade-in continueButton
                            }, 1500); // 1.5 seconds delay globeLegend
                    }, 2000); // 2 seconds - globe Fadeout
                }, 8000); // 8 seconds - quoteThree Fadeout
            }, 4000); // 4 second to allow fade out of quoteTwo
        }, 5000); // 5 second - quoteTwo Fadeout
    }, 1200); // 1.2 second delay between Fades. 
}); 

document.getElementsByClassName("continueButton").addEventListener("click", function() { 
    introSekvens
});