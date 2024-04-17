    // ----------- Karte erstellen allgemein -------------
// HTML div Element (auch direkt da möglich)
const map_container = document.createElement("div");
map_container.id = 'map-container';
document.body.appendChild(map_container);

// create map map_div container (selection of container via id -> 'map')
const map = L.map('map-container', { zoomControl: false }).setView([51.04, 13.72], 13);

// add custom zoom control to the bottom right
L.control.zoom({ position: 'bottomright' }).addTo(map);

// add the basemap (background map)
const tile_layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Create a marker cluster group
const markersLayer = L.layerGroup().addTo(map);

let jsonData; // Declare jsonData as a global variable
const searchInput = document.getElementById('searchInput');

document.addEventListener('DOMContentLoaded', function () {
    // Fetch the JSON data dynamically
    fetch('data_gastro.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;

            // Loop through your JSON data and add markers to the map
            jsonData.forEach((location) => {
                const marker = createMarker(location);
                if (marker) {
                    markersLayer.addLayer(marker);
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));

    // ----------- Suchleiste -------------
    searchInput.addEventListener('input', handleSearch);

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
    
        // Clear previous filters
        markersLayer.clearLayers();
    
        // Filter individual markers based on the search term
        jsonData.forEach(location => {
            const name = location.Name.toLowerCase();
            const plz = location.PLZ.toLowerCase();
            const address = location.Straße.toLowerCase();
    
            // Check if any of the properties contains the search term
            if (name.includes(searchTerm) || plz.includes(searchTerm) || address.includes(searchTerm)) {
                // Add the marker back to the markers layer
                markersLayer.addLayer(createMarker(location));
            }
        });
    }
});

    // --------- Menü --------------
document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.querySelector('.menu');
    const overlay = document.querySelector('.sidenav');

    if (menuButton && overlay) {
        menuButton.addEventListener('click', function () {
            overlay.classList.toggle('open');
        });
    }
});
// Loop through all dropdown buttons to toggle between hiding and showing its dropdown content 
//This allows the user to have multiple dropdowns without any conflict
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}
// Keep track of active categories
var activeCategories = [];

// Function to filter markers based on active categories
function filterMarkers() {
    markersLayer.clearLayers(); // Remove all markers from the map

    jsonData.forEach((location) => {
        const marker = createMarker(location); // Create marker for this location
        if (marker) {
            markersLayer.addLayer(marker); // Add marker to the map

            // Check if location's category is in the active categories
            if (activeCategories.length === 0 || activeCategories.includes(location.Rechtsform)) {
                marker.addTo(map); // Show the marker if its category is active
            } else {
                marker.removeFrom(map); // Hide the marker if its category is not active
            }
        }
    });
}

// Event listener for category links
var categoryLinks = document.querySelectorAll('.dropdown-container a');
categoryLinks.forEach(function(link) {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior
        var category = this.textContent.trim(); // Get the category from the link text

        // Toggle active class for clicked category link
        this.classList.toggle('active');

        // Check if the clicked category is already active
        if (this.classList.contains('active')) {
            activeCategories.push(category); // Add the category to active categories
        } else {
            activeCategories = activeCategories.filter(cat => cat !== category); // Remove the category from active categories
        }

        filterMarkers(); // Filter markers based on active categories
    });
});


// Function to create a marker based on a location
function createMarker(location) {
    if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        // Valid coordinates
        const marker = L.marker([location.latitude, location.longitude]);

        // Store information in a custom property
        marker.customInfo = {
            name: location.Name.toLowerCase(),
            // Add other properties as needed
        };

        let popupContent = `<h2>${location.Name}</h2><br>`;

        // Loop through the attributes and add them to the popup
        for (const key in location) {
            if (key !== 'latitude' && key !== 'longitude' && key !== 'Name' && key !== 'Bilder') {
                // Exclude coordinates, the name, and Bilder from the popup
                popupContent += `<strong>${key}:</strong> ${location[key]}<br>`;
            }
        }

        // Check if location has Bilder property and it's an array
        if (location.Bilder && Array.isArray(location.Bilder)) {
            // Loop through the array of image links and create image elements
            location.Bilder.forEach((Bilder) => {
                // Create an image element in the popup for each image link
                console.log('Bilder:', location.Bilder);
                popupContent += `
                    <figure>
                        <img src="${Bilder.url}" alt="${Bilder.alt}" style="width: 300px;">
                        <figcaption>${Bilder.bildunterschrift}</figcaption>
                    </figure>`;
                    
            });
        }

// Bind the popup with the custom content to the marker
marker.bindPopup(popupContent, { maxHeight: 300, maxWidth: 320});

        return marker;
    } else {
        console.error('Invalid coordinates for:', location.Name);
        return null;
    }
}
