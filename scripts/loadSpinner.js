function loadSpinner() {
    const container = document.getElementById("chart-container");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "./components/spinner.html", true); // Adjusted path here
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                container.insertAdjacentHTML('beforeend', xhr.responseText);
            } else {
                console.error("Error loading spinner: ", xhr.statusText);
            }
        }
    };
    xhr.send();
}

loadSpinner();
