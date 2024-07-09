// Initialize the map(s)
const map = L.map('map', {
    center: [45.519292, 11.338594],
    zoom: 6,
    maxBounds: L.latLngBounds([-90, -180], [90, 180]),
    maxBoundsViscosity: 1.0
});
const defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 2,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})
var Esri_WorldTerrain = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
	maxZoom: 9,
    minZoom: 2
});
var CartoDB_DarkMatterNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20,
    minZoom: 2
});
defaultMap.addTo(map);
map.removeLayer(defaultMap);
Esri_WorldTerrain.addTo(map);
map.removeLayer(Esri_WorldTerrain);
CartoDB_DarkMatterNoLabels.addTo(map);
map.removeLayer(CartoDB_DarkMatterNoLabels);
defaultMap.addTo(map);

// Add custom classes to tile layers
defaultMap.on('load', function() {
    document.querySelectorAll('.leaflet-tile-container').forEach(container => {
        container.classList.add('default-map');
    });
});

Esri_WorldTerrain.on('load', function() {
    document.querySelectorAll('.leaflet-tile-container').forEach(container => {
        container.classList.add('esri-map');
    });
});

CartoDB_DarkMatterNoLabels.on('load', function() {
    document.querySelectorAll('.leaflet-tile-container').forEach(container => {
        container.classList.add('dark-map');
    });
});

// Initialize variables
let circleExists = false;
let circle, circlee;
let cannonsSet = false;
let circleLayers = [];
let videoExists = false;
let spotlightExists = false;
let maskLayer;
let spotlight;
let captionBoolean = false;
var currentBasemap = 'default';
let torchOn = false;
let modalShow = false;

// Additional layers
L.control.rainviewer({
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Hour:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.7
}).addTo(map);
const apiKey = 'c528ed198eb83ac4758b1411dca69e44';
const layer = 'precipitation_new';
var precipitation = new L.tileLayer.wms(`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`, {
    layers: layer,
    format: 'image/png',
    transparent: true,
});
var USAmap = new L.tileLayer.wms(`https://mesonet.agron.iastate.edu/cgi-bin/wms/us/mrms_nn.cgi?`, {
    layers: 'mrms_p24h',
    format: 'image/png',
    transparent: true,
});
var overlayMaps = {
    "Precipitation": precipitation,
    "USAmap": USAmap
};
L.control.layers(null, overlayMaps, { position: 'bottomright' }).addTo(map);
var toggleButton = L.control({position: 'bottomleft'});
toggleButton.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'toggle-button');
    div.innerHTML = '<button id="basemapToggle" class="default-button"><i class="fa fa-map"></i></button>';
    return div;
};
toggleButton.addTo(map);
var qButton = L.control({position: 'bottomright'});
qButton.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'q-button');
    div.innerHTML = '<button id="qButton"><i class="fa fa-question"></i></button>';
    return div;
};
qButton.addTo(map);

// Modal
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('qButton').addEventListener('click', function() {
        if (modalShow) {
            document.getElementById('modal').style.display = 'none';
            modalShow = false;
        } else {
            document.getElementById('modal').style.display = 'block';
            modalShow = true;
        }
    });
    document.getElementById('close').addEventListener('click', function() {
        document.getElementById('modal').style.display = 'none';
        modalShow = false;
    });
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 27) { // esc
            if (modalShow) {
                document.getElementById('modal').style.display = 'none';
                modalShow = false;
            }
        }
    });
});

// Basemap switching
function mapSwitch() {
    if (currentBasemap === 'default') {
        map.removeLayer(defaultMap);
        Esri_WorldTerrain.addTo(map);
        currentBasemap = 'esri';
        document.getElementById('basemapToggle').classList.remove('default-button');
        document.getElementById('basemapToggle').classList.add('esri-button');
    } else if (currentBasemap === 'esri') {
        map.removeLayer(Esri_WorldTerrain);
        CartoDB_DarkMatterNoLabels.addTo(map);
        currentBasemap = 'dark';
        document.getElementById('basemapToggle').classList.remove('esri-button');
        document.getElementById('basemapToggle').classList.add('dark-button');
    } else {
        map.removeLayer(CartoDB_DarkMatterNoLabels);
        defaultMap.addTo(map);
        currentBasemap = 'default';
        document.getElementById('basemapToggle').classList.remove('dark-button');
        document.getElementById('basemapToggle').classList.add('default-button');
    }
}
document.getElementById('basemapToggle').addEventListener('click', mapSwitch);
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 77) { // M key
            mapSwitch();
        }
    });
});

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
    if (captionBoolean) {
        map.attributionControl.removeAttribution('hello');
        captionBoolean = false;
    }
}

// Event delegation for hyperlinks
document.getElementById('text').addEventListener('click', function(event) {
    if (event.target.id === 'link-1') {
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
        if (!captionBoolean) {
            map.attributionControl.addAttribution('hello');
            captionBoolean = true;
        }
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
handleButtonClick('00', [45.519292, 11.338594], 6, '<h1 class="montserrat-h1 heading">Climate Mapping</h1><h2 class="montserrat-h2 sub-heading">Intro</h2><p id="section-1" class="montserrat-p paragraph">Lorem ipsum dolor sit amet, <a class="link" id="link-1">consectetur</a> adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Libero enim sed faucibus turpis in eu mi. Neque laoreet suspendisse interdum consectetur libero id. Mattis molestie a iaculis at erat pellentesque adipiscing. Diam maecenas sed enim ut sem.<br><br>Commodo odio aenean sed adipiscing diam donec adipiscing. Amet tellus cras adipiscing enim eu turpis egestas. Nec dui nunc mattis enim ut tellus. Magna fermentum iaculis eu non diam phasellus vestibulum. Ac orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Enim nunc faucibus a pellentesque sit amet.<br><br>Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.</p><h2 class="montserrat-h2 sub-heading">Mid</h2><p id="section-2" class="montserrat-p paragraph">Aliquam sem et tortor consequat id porta nibh venenatis. Mauris cursus mattis molestie a iaculis at erat pellentesque. Non enim praesent elementum facilisis leo. Leo vel orci porta non pulvinar neque. Netus et malesuada fames ac turpis egestas integer eget. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Vulputate dignissim suspendisse in est. Nec ullamcorper sit amet risus. Condimentum id venenatis a condimentum vitae sapien. Neque aliquam vestibulum morbi blandit cursus. Ut tellus elementum sagittis vitae et leo. Pulvinar sapien et ligula ullamcorper malesuada.<br><br>Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.<br><br>Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.<br><br>Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Mauris pellentesque pulvinar pellentesque habitant.</p><h2 class="montserrat-h2 sub-heading">End</h2><p id="section-3" class="montserrat-p paragraph">Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.<br><br>Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.<br><br>Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.</p>');
handleButtonClick('01', [45.519292, 11.338594], 15, '<h1 class="montserrat-h1">01</h1><p class="montserrat-p">Aliquam sem et tortor consequat.</p>');
handleButtonClick('02', [45.4709699, 11.6014322], 15, '<h1 class="montserrat-h1">02</h1><p class="montserrat-p">Nisi vitae suscipit tellus mauris.</p>');
handleButtonClick('03', [45.442492, 11.584501], 15, '<h1 class="montserrat-h1">03</h1><p class="montserrat-p">Lobortis elementum nibh tellus molestie.</p>');
handleButtonClick('04', [46, 12], 9, '<h1 class="montserrat-h1">04</h1><p class="montserrat-p">layering</p>');
handleButtonClick('05', [41.315, -1.911], 4, '<h1 class="montserrat-h1">05</h1><p class="montserrat-p">Video overlay</p>');
handleButtonClick('06', [41, -1], 5, '<h1 class="montserrat-h1">06</h1><h2 class="montserrat-h2">one</h2><h2 class="montserrat-h2">two</h2><h2 class="montserrat-h2">three</h2>');
handleButtonClick('07', [45.519292, 11.338594], 3, '<p class="montserrat-p">end</p>')

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

// Torch feature
function torchToggle() {
    var torch = document.getElementById('torch');
    if (!torchOn) {
        torch.style.zIndex = '10000';
        torch.style.opacity = '1';
        torchOn = true;
        map.on('mousemove', function(e) {
            var point = map.latLngToContainerPoint(e.latlng);
            torch.style.left = point.x - (torch.offsetWidth / 2) + 'px';
            torch.style.top = point.y - (torch.offsetHeight / 2) + 'px';
        });
    }
    else {
        torch.style.zIndex = '-10000';
        torch.style.opacity = '0';
        torchOn = false;
    }
}
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 83) {
            torchToggle();
        }
    });
});

// Scroll updates
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('00').addEventListener('click', function() {
        const sections = document.querySelectorAll('.text-container .paragraph');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.9
        };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    updateMap(sectionId);
                }
            });
        }, options);
        sections.forEach(section => {
            observer.observe(section);
        });
    });
    if (document.getElementById('00')) {
        document.getElementById('00').click();
    }
});
function updateMap(sectionId) {
    switch (sectionId) {
        case 'section-1':
            flyToAndClear([45.519292, 11.338594], 6);
            break;
        case 'section-2':
            flyToAndClear([35.519292, 11.338594], 6);
            break;
        case 'section-3':
            flyToAndClear([35.519292, 11.338594], 5);
            break;
        default:
            break;
    }
}