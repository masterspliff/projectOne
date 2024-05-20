document.getElementById("startButton").addEventListener("click", function() {
    // Fade out the current quote
    document.getElementById("quoteOne").style.opacity = "0";
    // Fade out the start button
    document.getElementById("startButton").style.opacity = "0";

    // After a delay, update the quote text and fade it in
    setTimeout(function() {
        document.getElementById("quoteOne").style.display = "none";
        document.getElementById("quoteTwo").style.display = "block";
        document.getElementById("quoteTwo").style.opacity = "1";

        // Import the JavaScript file after quoteTwo fades in
        import('./sphere.js').then(module => {
            // Once imported, execute the function
            module.default(); // Call the default export function
            // Show the sphere
            document.getElementById("globe").style.display = "block";
        });
    }, 1000); // 1 second delay
});
