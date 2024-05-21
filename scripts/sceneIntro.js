document.getElementById("startButton").addEventListener("click", function() {
    // Get elements
    var quoteOne = document.getElementById("quoteOne");
    var startButton = document.getElementById("startButton");
    var quoteTwo = document.getElementById("quoteTwo");
    var quoteThree = document.getElementById("quoteThree");
    var globe = document.getElementById("globe");
    var quoteRef = document.getElementById("quoteRef");

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

                    // Fade out globe over 6 seconds
                    globe.classList.add("fade");
                    setTimeout(function() {
                        globe.style.display = "none";
                    }, 7000); // 7 seconds - globe Fadeout
                }, 6500); // 6.5 seconds - quoteThree Fadeout
            }, 3000); // 3 seconds to allow fade out of quoteTwo
        }, 4000); // 4 seconds - quoteTwo Fadeout
    }, 1500); // 1.5 second delay between fades. 
});
