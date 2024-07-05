// Initialize the map
const map = L.map('map', {
    center: [45.519292, 11.338594],
    zoom: 8,
    maxBounds: L.latLngBounds([-90, -180], [90, 180]),
    maxBoundsViscosity: 1.0
});
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 2,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Initialize variables
let circleExists = false;
let circle, circlee;
let cannonsSet = false;
let circleLayers = [];
let videoExists = false;
let spotlightExists = false;
let maskLayer;
let spotlight;

// Function to update inner HTML content
function updateContent(html) {
    document.getElementById('text').innerHTML = html;
}

// Function to fly to location and remove layers
function flyToAndClear(coords, zoom) {
    map.flyTo(coords, zoom);
    if (circleExists) {
        map.removeLayer(circle);
        circleExists = false;
    }
    if (cannonsSet) {
        circleLayers.forEach(layer => map.removeLayer(layer));
        circleLayers = [];
        cannonsSet = false;
    }
    if (videoExists) {
        map.removeLayer(videoOverlay);
        videoExists = false;
    }
    if (spotlightExists) {
        map.removeLayer(maskLayer);
        map.removeLayer(spotlight);
        spotlightExists = false;
    }
}

// Event delegation for sub-headings
document.getElementById('text').addEventListener('click', function(event) {
    if (event.target && event.target.id.startsWith('sub-heading')) {
        const targetId = event.target.id;
        if (targetId === 'sub-heading-1') {
            flyToAndClear([45.519292, 11.338594], 6);
        } else if (targetId === 'sub-heading-2') {
            flyToAndClear([35.519292, 11.338594], 6);
            if (!circleExists) {
                circle = L.circle([35.519292, 11.338594], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 50000
                }).addTo(map);
                circleExists = true;
            }
        }
    }
    if (event.target.id === 'unique') {
        flyToAndClear([45.519292, 11.338594], 4);
    }
});

// Generic function to handle simple button clicks
function handleButtonClick(id, coords, zoom, htmlContent) {
    document.getElementById(id).addEventListener('click', function() {
        updateContent(htmlContent);
        flyToAndClear(coords, zoom);
        document.getElementById('progress-bar').style.width = '0%';
    });
}

// Setup event listeners for buttons
handleButtonClick('00', [45.519292, 11.338594], 8, '<h1 id="heading" class="montserrat-h1">Climate Mapping</h1><a href="#" id="link-1"><h2 id="sub-heading-1" class="montserrat-h2">Intro</h2></a><p class="montserrat-p" id="para-1">Lorem ipsum dolor sit amet, <a id="unique">consectetur</a> adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Libero enim sed faucibus turpis in eu mi. Neque laoreet suspendisse interdum consectetur libero id. Mattis molestie a iaculis at erat pellentesque adipiscing. Diam maecenas sed enim ut sem. Commodo odio aenean sed adipiscing diam donec adipiscing. Amet tellus cras adipiscing enim eu turpis egestas. Nec dui nunc mattis enim ut tellus. Magna fermentum iaculis eu non diam phasellus vestibulum. Ac orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Enim nunc faucibus a pellentesque sit amet. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.</p><a href="#" id="link-2"><h2 id="sub-heading-2" class="montserrat-h2">Mid</h2></a><p class="montserrat-p" id="para-2">Aliquam sem et tortor consequat id porta nibh venenatis. Mauris cursus mattis molestie a iaculis at erat pellentesque. Non enim praesent elementum facilisis leo. Leo vel orci porta non pulvinar neque. Netus et malesuada fames ac turpis egestas integer eget. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Vulputate dignissim suspendisse in est. Nec ullamcorper sit amet risus. Condimentum id venenatis a condimentum vitae sapien. Neque aliquam vestibulum morbi blandit cursus. Ut tellus elementum sagittis vitae et leo. Pulvinar sapien et ligula ullamcorper malesuada. Mauris pellentesque pulvinar pellentesque habitant.</p><a href="#" id="link-3"><h2 id="sub-heading-3" class="montserrat-h2">End</h2></a><p class="montserrat-p" id="para-3">Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.</p>');
handleButtonClick('01', [45.519292, 11.338594], 15, '<h1 class="montserrat-h1">01</h1><p class="montserrat-p">Aliquam sem et tortor consequat.</p>');
handleButtonClick('02', [45.4709699, 11.6014322], 15, '<h1 class="montserrat-h1">02</h1><p class="montserrat-p">Nisi vitae suscipit tellus mauris.</p>');
handleButtonClick('03', [45.442492, 11.584501], 15, '<h1 class="montserrat-h1">03</h1><p class="montserrat-p">Lobortis elementum nibh tellus molestie.</p>');
handleButtonClick('04', [46, 12], 9, '<h1 class="montserrat-h1">04</h1><p class="montserrat-p">layering</p>');
handleButtonClick('05', [41.315, -1.911], 4, '<h1 class="montserrat-h1">05</h1><p class="montserrat-p">Video overlay</p>');
handleButtonClick('06', [41, -1], 5, '<h1 class="montserrat-h1">06</h1><a href="#" id="link-one"><h2 id="one" class="montserrat-h2">one</h2></a><a href="#" id="link-two"><h2 id="two" class="montserrat-h2">two</h2></a><a href="#" id="link-three"><h2 id="three" class="montserrat-h2">three</h2></a>');
handleButtonClick('07', [45.519292, 11.338594], 15, '<p class="montserrat-p">end</p>')

// Visualize cannons
import { cannons } from './cannons.js';
document.getElementById('04').addEventListener('click', function() {
    function createCircleMarker(feature, latlng) {
        if (feature.properties && feature.properties.cannons) {
            circlee = L.circle(latlng, {
                radius: feature.properties.cannons * 30,
                fillColor: '#f03',
                color: 'red',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            });
            circleLayers.push(circlee);
            return circlee;
        }
    }
    function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.name && feature.properties.cannons) {
            const popupContent = `${feature.properties.name} has ${feature.properties.cannons} cannons`;
            layer.bindPopup(popupContent);
        }
    }
    if (!cannonsSet) {
        L.geoJson(cannons, {
            pointToLayer: (feature, latlng) => createCircleMarker(feature, latlng),
            onEachFeature: onEachFeature
        }).addTo(map);
        cannonsSet = true;
    }
});

// Video overlay handling
const videoUrl = 'https://dl.dropboxusercontent.com/s/vm3l4pv6fyo8ygm7qujq9/Unsaved_session_2023-07-11_02_30-2023-07-13_11_00.mp4?rlkey=a6x3u76myfes98qwkg67wqkpg&st=cmyb6ret';
const latLngBounds = L.latLngBounds([[41.315, -1.911], [51.907, 31.289]]);
let videoOverlay;
document.getElementById('05').addEventListener('click', function() {
    if (!videoExists) {
        videoOverlay = L.videoOverlay(videoUrl, latLngBounds, {
            opacity: 0.7,
            interactive: true,
            autoplay: true,
            muted: true,
            playsInline: true
        }).addTo(map);
        videoExists = true;
    }
});

// Spotlight effect
document.getElementById('06').addEventListener('click', function() {
    if (!spotlightExists) {
        map.createPane('maskPane');
        map.getPane('maskPane').style.zIndex = 450;
        maskLayer = L.rectangle([[-90, -180], [90, 180]], {
            color: "transparent",
            weight: 1,
            fillColor: "#000",
            fillOpacity: 0.3,
            interactive: false,
            pane: 'maskPane'
        }).addTo(map);
        map.createPane('spotlightPane');
        map.getPane('spotlightPane').style.zIndex = 460;
        spotlight = L.circle([41, -1], {
            radius: 1000000,
            color: "transparent",
            fillColor: "#fff",
            fillOpacity: 0.2,
            interactive: false,
            pane: 'spotlightPane'
        }).addTo(map);
        spotlight.bringToFront();
        spotlightExists = true;
    }
});
