var map = L.map('map').setView([45.519292, 11.338594], 8);
var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 3,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

document.getElementById('00').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1 id="heading">Climate Mapping</h1><a href="#" id="link-1"><h2 id="sub-heading-1">Intro</h2></a><p id="para-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Libero enim sed faucibus turpis in eu mi. Neque laoreet suspendisse interdum consectetur libero id. Mattis molestie a iaculis at erat pellentesque adipiscing. Diam maecenas sed enim ut sem. Commodo odio aenean sed adipiscing diam donec adipiscing. Amet tellus cras adipiscing enim eu turpis egestas. Nec dui nunc mattis enim ut tellus. Magna fermentum iaculis eu non diam phasellus vestibulum. Ac orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Enim nunc faucibus a pellentesque sit amet. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.</p><a href="#" id="link-2"><h2 id="sub-heading-2">Mid</h2></a><p id="para-2">Aliquam sem et tortor consequat id porta nibh venenatis. Mauris cursus mattis molestie a iaculis at erat pellentesque. Non enim praesent elementum facilisis leo. Leo vel orci porta non pulvinar neque. Netus et malesuada fames ac turpis egestas integer eget. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Vulputate dignissim suspendisse in est. Nec ullamcorper sit amet risus. Condimentum id venenatis a condimentum vitae sapien. Neque aliquam vestibulum morbi blandit cursus. Ut tellus elementum sagittis vitae et leo. Pulvinar sapien et ligula ullamcorper malesuada. Mauris pellentesque pulvinar pellentesque habitant.</p><a href="#" id="link-3"><h2 id="sub-heading-3">End</h2></a><p id="para-3">Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.</p>';
    map.flyTo([45.519292, 11.338594], 8);
    document.getElementById('progress-bar').style.width = '0%';
});

var circle;
var circleExists = false;

document.getElementById('text').addEventListener('click', function(event) {
    if (event.target && event.target.id === 'sub-heading-1') {
        document.getElementById('text').innerHTML = '<h1 id="heading">Climate Mapping</h1><a href="#" id="link-1"><h2 id="sub-heading-1">Intro</h2></a><p id="para-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Libero enim sed faucibus turpis in eu mi. Neque laoreet suspendisse interdum consectetur libero id. Mattis molestie a iaculis at erat pellentesque adipiscing. Diam maecenas sed enim ut sem. Commodo odio aenean sed adipiscing diam donec adipiscing. Amet tellus cras adipiscing enim eu turpis egestas. Nec dui nunc mattis enim ut tellus. Magna fermentum iaculis eu non diam phasellus vestibulum. Ac orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Enim nunc faucibus a pellentesque sit amet. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo.</p><a href="#" id="link-2"><h2 id="sub-heading-2">Mid</h2></a><p id="para-2">Aliquam sem et tortor consequat id porta nibh venenatis. Mauris cursus mattis molestie a iaculis at erat pellentesque. Non enim praesent elementum facilisis leo. Leo vel orci porta non pulvinar neque. Netus et malesuada fames ac turpis egestas integer eget. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Vulputate dignissim suspendisse in est. Nec ullamcorper sit amet risus. Condimentum id venenatis a condimentum vitae sapien. Neque aliquam vestibulum morbi blandit cursus. Ut tellus elementum sagittis vitae et leo. Pulvinar sapien et ligula ullamcorper malesuada. Mauris pellentesque pulvinar pellentesque habitant.</p><a href="#" id="link-3"><h2 id="sub-heading-3">End</h2></a><p id="para-3">Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper.</p>';
        map.flyTo([45.519292, 11.338594], 6);
    }
    if (event.target && event.target.id === 'sub-heading-2') {
        map.flyTo([35.519292, 11.338594]);
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
});

document.getElementById('01').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>01</h1><p>Aliquam sem et tortor consequat.</p>';
    map.flyTo([45.519292, 11.338594], 15);
    document.getElementById('progress-bar').style.width = '0%';
});

document.getElementById('02').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>02</h1><p>Nisi vitae suscipit tellus mauris.</p>';
    map.flyTo([45.4709699, 11.6014322], 15);
    document.getElementById('progress-bar').style.width = '0%';
});

document.getElementById('03').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>03</h1><p>Lobortis elementum nibh tellus molestie.</p>';
    map.flyTo([45.442492, 11.584501], 15);
    document.getElementById('progress-bar').style.width = '0%';
});

import { cannons } from './cannons.js';
var cannonsSet = false;
document.getElementById('04').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>04</h1><p>layering</p>';
    map.flyTo([46, 12], 9);
    document.getElementById('progress-bar').style.width = '0%';
    function createCircleMarker(feature, latlng) {
        if (feature.properties && feature.properties.cannons) {
            return L.circle(latlng, {
                radius: feature.properties.cannons * 30,
                fillColor: '#f03',
                color: 'red',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            });
        }
    }

    function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.name && feature.properties.cannons) {
            var popupContent = `${feature.properties.name} has ${feature.properties.cannons} cannons`;
            layer.bindPopup(popupContent);
        } else {
            console.log("Feature with invalid properties:", feature);
        }
    }

    if (!cannonsSet) {
        L.geoJson(cannons, {
            pointToLayer: function (feature, latlng) {
                return createCircleMarker(feature, latlng);
            },
            onEachFeature: onEachFeature
        }).addTo(map);
    }
    cannonsSet = true;
});

var videoUrls = 'https://user.eumetsat.int/s3/eup-strapi-media/vid_il_19_07_07_3_76b9938111.mp4';
var latLngBounds = L.latLngBounds([[32, -130], [13, -100]]);
var videoOverlay;
document.getElementById('05').addEventListener('click', function() {
    map.flyTo([32, -130], 4);
    document.getElementById('progress-bar').style.width = '0%';
    videoOverlay = L.videoOverlay(videoUrls, latLngBounds, {
        opacity: 0.6,
        interactive: true,
        autoplay: true,
        muted: true,
        playsInline: true
    }).addTo(map);
});

var storm1 = 'https://www.youtube.com/watch?v=668nUCeBHyY&pp=ygULc21hbGwgdmlkZW8%3D';
var points1 = L.latLngBounds([[41.315, -1.911], [51.907, 31.289]]);
var storm2 = 'https://www.dropbox.com/scl/fi/iermje3f1ek6p2jnydo4q/Unsaved_session_2023-07-24_00_00-2023-07-25_15_45.mp4?rlkey=4owys51idp2dj8y9646dullnt&st=8f1c0p8b&dl=0';
var points2 = L.latLngBounds([[41.300, -8.155], [51.895, 25.046]]);
var storm3 = 'https://www.dropbox.com/scl/fi/vm3l4pv6fyo8ygm7qujq9/Unsaved_session_2023-07-11_02_30-2023-07-13_11_00.mp4?rlkey=a6x3u76myfes98qwkg67wqkpg&st=cpzgezze&dl=0';
var points3 = L.latLngBounds([[41.104, -6.695], [51.734, 26.506]]);
var vid1, vid2, vid3;
document.getElementById('06').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>06</h1><a href="#" id="link-one"><h2 id="one">one</h2></a><a href="#" id="link-one"><h2 id="two">two</h2></a><a href="#" id="link-one"><h2 id="three">three</h2></a>';
    map.flyTo([51, 31], 8);
    document.getElementById('progress-bar').style.width = '0%';
    vid1 = L.videoOverlay(storm1, points1, {
        opacity: 0.6,
        interactive: true,
        autoplay: true,
        muted: true,
        playsInline: true
    }).addTo(map);
});