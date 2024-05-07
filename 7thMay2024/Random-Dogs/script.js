document.addEventListener("DOMContentLoaded", function() {
    const getDogoButton = document.getElementById("get-dog");
    const dogContainer = document.getElementById("dog-container");
    const thumbnailContainer = document.getElementById("thumbnail-container");

    getDogoButton.addEventListener("click", async function() {
        try {
            const response = await fetch("https://random.dog/woof.json");
            const data = await response.json();

            if (data.url.endsWith(".mp4")) {
                dogContainer.innerHTML = `<video src="${data.url}" autoplay loop controls></video>`;
            } else {
                dogContainer.innerHTML = `<img src="${data.url}" alt="Random Dog Image">`;
            }

            thumbnailContainer.innerHTML += `<div class="thumbnail">${dogContainer.innerHTML}</div>`;
        } catch (error) {
            console.error("Error fetching dog image:", error);
        }
    });
});