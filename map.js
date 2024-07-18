// Initialize the map(s)
var map = L.map('map', {
    center: [45.519292, 11.338594],
    zoom: 6,
    maxBounds: L.latLngBounds([-90, -180], [90, 180]),
    maxBoundsViscosity: 1.0
});
var defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 2,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})
var stadiaMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}@2x.png', {
    maxZoom: 18,
    minZoom: 2,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> contributors'
}).addTo(map);
var esriMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
	maxZoom: 9,
    minZoom: 2
});
defaultMap.addTo(map);
map.removeLayer(defaultMap);
stadiaMap.addTo(map);
map.removeLayer(stadiaMap);
esriMap.addTo(map);
map.removeLayer(esriMap);
defaultMap.addTo(map);

// Add custom classes to tile layers
defaultMap.on('load', function() {
    document.querySelectorAll('.leaflet-tile-container').forEach(container => {
        container.classList.add('default-map');
    });
});

stadiaMap.on('load', function() {
    document.querySelectorAll('.leaflet-tile-container').forEach(container => {
        container.classList.add('stadia-map');
    });
});

esriMap.on('load', function() {
    document.querySelectorAll('.leaflet-tile-container').forEach(container => {
        container.classList.add('esri-map');
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
let currentBasemap = 'default';
let torchOn = false;
let modalShow = false;
let homeModalShow = false;

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

// james code
var mostRecentTime;
// finds the most recent time from the WMS eumetsat h60b satalite
function updateLayerWithMostRecentTime() {
    var capabilitiesUrl = `https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetCapabilities`;

    fetch(capabilitiesUrl)
        .then(response => response.text())
        .then(text => {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(text, "text/xml");

            var targetLayer = Array.from(xmlDoc.querySelectorAll('Layer')).find(layer =>
                layer.querySelector('Name')?.textContent === "msg_fes:h60b"
            );

            var dimension = targetLayer?.querySelector('Dimension[name="time"]');
            var layerTimes = dimension?.textContent;
            if (layerTimes) {
                var times = layerTimes.split('/');
                mostRecentTime = times[times.length - 2].slice(0,16);
                console.log("Most recent time:", mostRecentTime);
                eumetsatRGBNaturalColour.setParams({ time: mostRecentTime + ':00.000Z' });
            }
        })
        .catch(() => {});
}

updateLayerWithMostRecentTime();

mostRecentTime = new Date(new Date().getTime() - 3600000).toISOString().slice(0, 16);
console.log("Most recent time:", mostRecentTime);
// for some reason the above function above that is meant to find 'mostRecentTime' is not working so I have to manually input the value, Aadi plz fix this if you can
// It does fetch the correct time, I have checked this on the console, but it does not update the global variable
// for now, just manually update it here and it will work.

var lasttime = '2022-12-09T00:45';

// The time control part of the Eumestat widget
var TimeControl = L.Control.extend({
    onAdd: function(map) {
        var input = L.DomUtil.create('input');
        input.type = 'datetime-local';
        input.style = 'width: 250px;';
        input.max = mostRecentTime; 
        input.min = lasttime;
        input.value = mostRecentTime;
        input.onchange = function(e) {
            var newTime = e.target.value + ':00.000Z';
            mostRecentTime = e.target.value; // Update the global variable
            eumetsatRGBNaturalColour.setParams({time: newTime}, false);
            thunder.setParams({time: newTime}, false);
        };
        return input;
    }
});

// add satalites to the map here
var eumetsatRGBNaturalColour = new L.tileLayer.wms(`https://view.eumetsat.int/geoserver/wms`, {
    layers: 'msg_fes:h60b',
    format: 'image/png',
    transparent: true,
    time: TimeControl.value + ':00.000Z'
});

var thunder = new L.tileLayer.wms(`https://view.eumetsat.int/geoserver/wms`, {
    layers: 'msg_fes:rdt',
    format: 'image/png',
    transparent: true,
    time: TimeControl.value + ':00.000Z'
});

var overlayMaps = {
    "Precipitation - Eumetsat": eumetsatRGBNaturalColour,
    "Rapidly Developing Thunderstorms - Eumetsat": thunder
};


// CustomControl for the Eumetsat layers
var CustomControl = L.Control.extend({
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar');
        L.DomEvent.disableClickPropagation(container);

        // Toggle Button
        var toggleBtn = L.DomUtil.create('a', 'leaflet-bar', container);
        toggleBtn.href = '#';
        toggleBtn.innerHTML = '☰';
        L.DomEvent.on(toggleBtn, 'click', L.DomEvent.stop).on(toggleBtn, 'click', function() {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        });

        // Control Panel
        var panel = L.DomUtil.create('div', 'control-panel', container);
        panel.style.display = 'none'; // Ensure it starts hidden

        // Panel Title
        var panelTitle = L.DomUtil.create('div', 'panel-title', panel);
        panelTitle.innerHTML = 'Eumetsat Satellite Layers';
        
        // Close Button
        var closeButton = L.DomUtil.create('a', 'close-button', panel);
        closeButton.innerHTML = '&times';
        closeButton.href = '#';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px'; // Adjusted for better vertical alignment
        closeButton.style.right = '10px'; // Adjusted for better horizontal alignment
        closeButton.style.fontSize = '16px'; // Smaller font size for a more subtle button
        closeButton.style.lineHeight = '16px'; // Adjust line height to match font size for better alignment
        closeButton.style.width = '16px'; // Define a specific width
        closeButton.style.height = '16px'; // Define a specific height
        closeButton.style.textAlign = 'center'; // Ensure the '×' is centered
        closeButton.style.padding = '0'; // Remove padding to prevent increasing the widget size
        closeButton.style.margin = '0'; // Ensure no additional space is added around the button
        closeButton.style.border = '#fff';
        L.DomEvent.on(closeButton, 'click', L.DomEvent.stop).on(closeButton, 'click', function() {
            panel.style.display = 'none';
        });

        // Date-Time Picker - Now using TimeControl with the global mostRecentTime
        var timeControl = new TimeControl();
        panel.appendChild(timeControl.onAdd(map));

        // Overlay Layer Selection - Changed to Dropdown
        var overlaySelect = L.DomUtil.create('select', 'overlay-map-select', panel);
        overlaySelect.style.width = '250px'; // Set consistent width
        var defaultOption = L.DomUtil.create('option', '', overlaySelect);
        defaultOption.innerHTML = "Select a layer";
        defaultOption.selected = true;
        
        Object.keys(overlayMaps).forEach(function(key) {
            var option = L.DomUtil.create('option', '', overlaySelect);
            option.value = key;
            option.innerHTML = key;
        });
        overlaySelect.onchange = this._onOverlayChange.bind(this, map);
        return container;
    },
    _onOverlayChange: function(map, e) {
        var selectedOverlays = Array.from(e.target.options).filter(option => option.selected).map(option => option.value);
        Object.keys(overlayMaps).forEach(function(key) {
            if (selectedOverlays.includes(key)) {
                map.addLayer(overlayMaps[key]);
                overlayMaps[key].bringToFront();
            } else {
                map.removeLayer(overlayMaps[key]);
            }
        });
    }
});
map.addControl(new CustomControl({position: 'bottomleft'}));

// Modal
document.addEventListener('DOMContentLoaded', function() {
    if (!homeModalShow) {
        document.getElementById('home-modal').classList.add('modal-show');
        homeModalShow = true;
    }
    document.getElementById('qButton').addEventListener('click', function() {
        if (modalShow) {
            document.getElementById('modal').classList.remove('modal-show');
            modalShow = false;
        } else {
            document.getElementById('modal').classList.add('modal-show');
            modalShow = true;
        }
    });
    document.getElementById('close').addEventListener('click', function() {
        document.getElementById('modal').classList.remove('modal-show');
        modalShow = false;
    });
    document.getElementById('home-close').addEventListener('click', function() {
        document.getElementById('home-modal').classList.remove('modal-show');
        modalShow = false;
    });
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 27) {
            if (modalShow) {
                document.getElementById('modal').classList.remove('modal-show');
                modalShow = false;
            }
        }
    });
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 72) {
            if (!modalShow) {
                document.getElementById('modal').classList.add('modal-show');
                modalShow = true;
            }
        }
    });
});

// Basemap switching
function mapSwitch() {
    if (currentBasemap === 'default') {
        map.removeLayer(defaultMap);
        stadiaMap.addTo(map);
        currentBasemap = 'esri';
        document.getElementById('basemapToggle').classList.remove('default-button');
        document.getElementById('basemapToggle').classList.add('stadia-button');
    } else if (currentBasemap === 'esri') {
        map.removeLayer(stadiaMap);
        esriMap.addTo(map);
        currentBasemap = 'dark';
        document.getElementById('basemapToggle').classList.remove('stadia-button');
        document.getElementById('basemapToggle').classList.add('esri-button');
    } else {
        map.removeLayer(esriMap);
        defaultMap.addTo(map);
        currentBasemap = 'default';
        document.getElementById('basemapToggle').classList.remove('esri-button');
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
    if (event.target.id === 'link-00-1') {
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
handleButtonClick('00', [45.519292, 11.338594], 6, '<h1 class="montserrat-h1">Climate Mapping</h1><h2 class="montserrat-h2">Intro</h2><p id="section-00-1" class="montserrat-p">Lorem ipsum dolor sit amet, <a class="link" id="link-00-1">consectetur</a> adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Libero enim sed faucibus turpis in eu mi. Neque laoreet suspendisse interdum consectetur libero id. Mattis molestie a iaculis at erat pellentesque adipiscing. Diam maecenas sed enim ut sem.<br><br>Commodo odio aenean sed adipiscing diam donec adipiscing. Amet tellus cras adipiscing enim eu turpis egestas. Nec dui nunc mattis enim ut tellus. Magna fermentum iaculis eu non diam phasellus vestibulum. Ac orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Enim nunc faucibus a pellentesque sit amet.<br><br>Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.</p><h2 class="montserrat-h2">Mid</h2><p id="section-00-2" class="montserrat-p">Aliquam sem et tortor consequat id porta nibh venenatis. Mauris cursus mattis molestie a iaculis at erat pellentesque. Non enim praesent elementum facilisis leo. Leo vel orci porta non pulvinar neque. Netus et malesuada fames ac turpis egestas integer eget. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Vulputate dignissim suspendisse in est. Nec ullamcorper sit amet risus. Condimentum id venenatis a condimentum vitae sapien. Neque aliquam vestibulum morbi blandit cursus. Ut tellus elementum sagittis vitae et leo. Pulvinar sapien et ligula ullamcorper malesuada.<br><br>Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.<br><br>Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.<br><br>Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Mauris pellentesque pulvinar pellentesque habitant.</p><h2 class="montserrat-h2">End</h2><p id="section-00-3" class="montserrat-p">Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.<br><br>Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.<br><br>Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.</p>');
handleButtonClick('01', [45.519292, 11.338594], 15, '<h1 class="montserrat-h1">01</h1><h2 class="montserrat-h2">A</h2><p id="section-01-1" class="montserrat-p">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ac tincidunt vitae semper quis lectus. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor elit. Lorem ipsum dolor sit amet. Magnis dis parturient montes nascetur ridiculus mus mauris. Id velit ut tortor pretium. Rutrum quisque non tellus orci ac auctor augue mauris augue. Enim sit amet venenatis urna cursus eget nunc scelerisque. Ultricies mi quis hendrerit dolor magna eget est lorem. Tincidunt lobortis feugiat vivamus at augue eget arcu dictum varius. Neque gravida in fermentum et sollicitudin. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Nulla facilisi nullam vehicula ipsum. Tellus id interdum velit laoreet id donec. Ut aliquam purus sit amet luctus venenatis lectus magna. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et. Leo vel fringilla est ullamcorper eget. At lectus urna duis convallis convallis. Facilisi etiam dignissim diam quis enim. Lacus suspendisse faucibus interdum posuere. Sit amet cursus sit amet dictum sit amet justo. Aliquam etiam erat velit scelerisque in dictum non. Ac felis donec et odio pellentesque diam. Nisl purus in mollis nunc sed id semper risus. Sapien faucibus et molestie ac feugiat sed lectus. Blandit massa enim nec dui nunc. Eu ultrices vitae auctor eu augue ut lectus arcu. Aliquet nibh praesent tristique magna sit. Aenean vel elit scelerisque mauris pellentesque pulvinar. Vel facilisis volutpat est velit egestas dui. Facilisis sed odio morbi quis commodo odio. Tortor at auctor urna nunc id cursus metus. Massa tincidunt nunc pulvinar sapien. Elementum facilisis leo vel fringilla est ullamcorper. Dolor sit amet consectetur adipiscing elit duis tristique sollicitudin. Consectetur adipiscing elit duis tristique sollicitudin. Tellus pellentesque eu tincidunt tortor. Arcu dui vivamus arcu felis bibendum ut. Netus et malesuada fames ac turpis. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu vitae. Aliquet nibh praesent tristique magna sit amet purus. Neque aliquam vestibulum morbi blandit cursus risus at ultrices mi. Pharetra magna ac placerat vestibulum lectus mauris ultrices eros in. Scelerisque in dictum non consectetur a erat nam. Arcu dui vivamus arcu felis. Arcu dictum varius duis at. Id ornare arcu odio ut sem. Semper eget duis at tellus at urna condimentum mattis pellentesque. Nisi scelerisque eu ultrices vitae. Faucibus in ornare quam viverra orci. Eget mauris pharetra et ultrices neque ornare aenean. Turpis massa sed elementum tempus egestas sed sed risus pretium. Eu volutpat odio facilisis mauris sit amet. Quisque egestas diam in arcu cursus. Vitae aliquet nec ullamcorper sit amet risus nullam eget. Mattis pellentesque id nibh tortor id aliquet lectus proin nibh. Aenean et tortor at risus viverra adipiscing. Et magnis dis parturient montes nascetur ridiculus mus mauris. Congue eu consequat ac felis donec. Ut lectus arcu bibendum at varius vel pharetra. Et leo duis ut diam. Nec nam aliquam sem et tortor consequat. Morbi tempus iaculis urna id volutpat lacus laoreet. Lacus laoreet non curabitur gravida arcu ac tortor dignissim. Lectus proin nibh nisl condimentum id venenatis a condimentum vitae. Lobortis scelerisque fermentum dui faucibus in ornare quam viverra. Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Faucibus turpis in eu mi bibendum. Purus in mollis nunc sed id. Consectetur a erat nam at lectus urna duis convallis convallis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Ante in nibh mauris cursus. Eget dolor morbi non arcu. Risus in hendrerit gravida rutrum. Pellentesque dignissim enim sit amet. Ac auctor augue mauris augue neque gravida. Consectetur purus ut faucibus pulvinar elementum integer enim. Fermentum iaculis eu non diam phasellus vestibulum lorem. Varius duis at consectetur lorem donec massa sapien faucibus. Nec dui nunc mattis enim. Sodales neque sodales ut etiam sit amet. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi. Velit laoreet id donec ultrices tincidunt. Aliquam id diam maecenas ultricies mi eget mauris. Risus viverra adipiscing at in. Turpis tincidunt id aliquet risus feugiat in ante metus. Blandit turpis cursus in hac habitasse. Egestas congue quisque egestas diam in arcu. Tristique senectus et netus et malesuada fames ac turpis. Sodales ut eu sem integer vitae justo. Fermentum leo vel orci porta non pulvinar neque laoreet. Sed odio morbi quis commodo odio. Massa tempor nec feugiat nisl pretium fusce. Libero nunc consequat interdum varius sit amet mattis vulputate enim. Nisi scelerisque eu ultrices vitae auctor eu augue ut.</p><h2 class="montserrat-h2">B</h2><p id="section-01-2" class="montserrat-p">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ac tincidunt vitae semper quis lectus. Nisl suscipit adipiscing bibendum est ultricies integer quis auctor elit. Lorem ipsum dolor sit amet. Magnis dis parturient montes nascetur ridiculus mus mauris. Id velit ut tortor pretium. Rutrum quisque non tellus orci ac auctor augue mauris augue. Enim sit amet venenatis urna cursus eget nunc scelerisque. Ultricies mi quis hendrerit dolor magna eget est lorem. Tincidunt lobortis feugiat vivamus at augue eget arcu dictum varius. Neque gravida in fermentum et sollicitudin. Curabitur gravida arcu ac tortor dignissim convallis aenean et tortor. Nulla facilisi nullam vehicula ipsum. Tellus id interdum velit laoreet id donec. Ut aliquam purus sit amet luctus venenatis lectus magna. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et. Leo vel fringilla est ullamcorper eget. At lectus urna duis convallis convallis. Facilisi etiam dignissim diam quis enim. Lacus suspendisse faucibus interdum posuere. Sit amet cursus sit amet dictum sit amet justo. Aliquam etiam erat velit scelerisque in dictum non. Ac felis donec et odio pellentesque diam. Nisl purus in mollis nunc sed id semper risus. Sapien faucibus et molestie ac feugiat sed lectus. Blandit massa enim nec dui nunc. Eu ultrices vitae auctor eu augue ut lectus arcu. Aliquet nibh praesent tristique magna sit. Aenean vel elit scelerisque mauris pellentesque pulvinar. Vel facilisis volutpat est velit egestas dui. Facilisis sed odio morbi quis commodo odio. Tortor at auctor urna nunc id cursus metus. Massa tincidunt nunc pulvinar sapien. Elementum facilisis leo vel fringilla est ullamcorper. Dolor sit amet consectetur adipiscing elit duis tristique sollicitudin. Consectetur adipiscing elit duis tristique sollicitudin. Tellus pellentesque eu tincidunt tortor. Arcu dui vivamus arcu felis bibendum ut. Netus et malesuada fames ac turpis. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu vitae. Aliquet nibh praesent tristique magna sit amet purus. Neque aliquam vestibulum morbi blandit cursus risus at ultrices mi. Pharetra magna ac placerat vestibulum lectus mauris ultrices eros in. Scelerisque in dictum non consectetur a erat nam. Arcu dui vivamus arcu felis. Arcu dictum varius duis at. Id ornare arcu odio ut sem. Semper eget duis at tellus at urna condimentum mattis pellentesque. Nisi scelerisque eu ultrices vitae. Faucibus in ornare quam viverra orci. Eget mauris pharetra et ultrices neque ornare aenean. Turpis massa sed elementum tempus egestas sed sed risus pretium. Eu volutpat odio facilisis mauris sit amet. Quisque egestas diam in arcu cursus. Vitae aliquet nec ullamcorper sit amet risus nullam eget. Mattis pellentesque id nibh tortor id aliquet lectus proin nibh. Aenean et tortor at risus viverra adipiscing. Et magnis dis parturient montes nascetur ridiculus mus mauris. Congue eu consequat ac felis donec. Ut lectus arcu bibendum at varius vel pharetra. Et leo duis ut diam. Nec nam aliquam sem et tortor consequat. Morbi tempus iaculis urna id volutpat lacus laoreet. Lacus laoreet non curabitur gravida arcu ac tortor dignissim. Lectus proin nibh nisl condimentum id venenatis a condimentum vitae. Lobortis scelerisque fermentum dui faucibus in ornare quam viverra. Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Faucibus turpis in eu mi bibendum. Purus in mollis nunc sed id. Consectetur a erat nam at lectus urna duis convallis convallis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Ante in nibh mauris cursus. Eget dolor morbi non arcu. Risus in hendrerit gravida rutrum. Pellentesque dignissim enim sit amet. Ac auctor augue mauris augue neque gravida. Consectetur purus ut faucibus pulvinar elementum integer enim. Fermentum iaculis eu non diam phasellus vestibulum lorem. Varius duis at consectetur lorem donec massa sapien faucibus. Nec dui nunc mattis enim. Sodales neque sodales ut etiam sit amet. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi. Velit laoreet id donec ultrices tincidunt. Aliquam id diam maecenas ultricies mi eget mauris. Risus viverra adipiscing at in. Turpis tincidunt id aliquet risus feugiat in ante metus. Blandit turpis cursus in hac habitasse. Egestas congue quisque egestas diam in arcu. Tristique senectus et netus et malesuada fames ac turpis. Sodales ut eu sem integer vitae justo. Fermentum leo vel orci porta non pulvinar neque laoreet. Sed odio morbi quis commodo odio. Massa tempor nec feugiat nisl pretium fusce. Libero nunc consequat interdum varius sit amet mattis vulputate enim. Nisi scelerisque eu ultrices vitae auctor eu augue ut.</p>');
handleButtonClick('02', [45.4709699, 11.6014322], 15, '<h1 class="montserrat-h1">02</h1><p class="montserrat-p">Nisi vitae suscipit tellus mauris.</p>');
handleButtonClick('03', [45.442492, 11.584501], 15, '<h1 class="montserrat-h1">03</h1><p class="montserrat-p">Lobortis elementum nibh tellus molestie.</p>');
handleButtonClick('04', [46, 12], 9, '<h1 class="montserrat-h1">04</h1><p class="montserrat-p">layering</p>');
handleButtonClick('05', [41.315, -1.911], 4, '<h1 class="montserrat-h1">05</h1><p class="montserrat-p">Video overlay</p>');
handleButtonClick('06', [41, -1], 5, '<h1 class="montserrat-h1">06</h1><h2 class="montserrat-h2">one</h2><h2 class="montserrat-h2">two</h2><h2 class="montserrat-h2">three</h2>');
handleButtonClick('07', [45.519292, 11.338594], 2, "<h1 class='montserrat-h1'>Conclusion</h1><h2 class='montserrat-h2'>About</h2><p class='montserrat-p'>This is a companion website to Cameron Blevins, Paper Trails: The US Post and the Making of the American West (Oxford University Press, 2021). Yan Wu built and designed the visualization, Cameron Blevins wrote the content, and Steven Braun provided consultation on its layout. It was completed over 2018-2019 with support from the NULab for Texts, Maps and Networks, Northeastern University's Digital Scholarship Group, and the Northeastern University History Department. Many thanks to Benjamin Hoy and Alessandra Link for providing feedback on earlier drafts.<br><br>We relied on several sources of data. The main dataset is US Post Offices, a dataset made by Cameron Blevins and based on historical research by Richard W. Helbock. Historical boundaries of US states and territories came from the Newberry Library's Atlas of Historical County Boundaries. Claudio Saunt generously provided spatial data for unceded Native land and government reservations, from the Invasion of America. Other sources of data are documented in the references for that section.</p><h2 class='montserrat-h2'>Credits</h2><div class='image-container'><div class='image-column'><img src='https://images.ctfassets.net/1wryd5vd9xez/4DxzhQY7WFsbtTkoYntq23/a4a04701649e92a929010a6a860b66bf/https___cdn-images-1.medium.com_max_2000_1_Y6l_FDhxOI1AhjL56dHh8g.jpeg' alt='image' class='image'></div><div class='description-column'><p class='montserrat-p'>Lorem ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum.</p></div></div><br><div class='image-container'><div class='image-column'><img src='https://images.ctfassets.net/1wryd5vd9xez/4DxzhQY7WFsbtTkoYntq23/a4a04701649e92a929010a6a860b66bf/https___cdn-images-1.medium.com_max_2000_1_Y6l_FDhxOI1AhjL56dHh8g.jpeg' alt='image' class='image'></div><div class='description-column'><p class='montserrat-p'>Lorem ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum.</p></div></div><br><div class='image-container'><div class='image-column'><img src='https://images.ctfassets.net/1wryd5vd9xez/4DxzhQY7WFsbtTkoYntq23/a4a04701649e92a929010a6a860b66bf/https___cdn-images-1.medium.com_max_2000_1_Y6l_FDhxOI1AhjL56dHh8g.jpeg' alt='image' class='image'></div><div class='description-column'><p class='montserrat-p'>Lorem ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum ipsum.</p></div></div>")

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
        maskLayer = L.rectangle([[-120, -240], [120, 240]], {
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
        if (event.keyCode === 84) {
            torchToggle();
        }
    });
});

// Scroll updates
document.addEventListener('DOMContentLoaded', () => {
    const menuOptions = ['00', '01', '02', '03', '04', '05', '06', '07'];
    menuOptions.forEach(optionId => {
        setupMenuOption(optionId);
    });
    if (document.getElementById(menuOptions[0])) {
        document.getElementById(menuOptions[0]).click();
    }
});
function setupMenuOption(optionId) {
    const menuOption = document.getElementById(optionId);
    if (menuOption) {
        menuOption.addEventListener('click', function() {
            const sections = document.querySelectorAll('.text-container .montserrat-p');
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.5 // parameter value
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
    }
}
function updateMap(sectionId) {
    switch (sectionId) {
        case 'section-00-1':
            flyToAndClear([45.519292, 11.338594], 6);
            break;
        case 'section-00-2':
            flyToAndClear([35.519292, 11.338594], 6);
            break;
        case 'section-00-3':
            flyToAndClear([35.519292, 11.338594], 5);
            break;
        case 'section-01-1':
            flyToAndClear([45.519292, 11.338594], 15);
            break;
        case 'section-01-2':
            flyToAndClear([45.519292, 11.338594], 18);
            break;
        default:
            break;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const menuLinks = document.querySelectorAll('.menu-link');
    const textContainer = document.querySelector('.text-container');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            textContainer.scrollTop = 0;
        });
    });
});
