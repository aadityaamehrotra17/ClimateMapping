var map = L.map('map').setView([45.519292, 11.338594], 8);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 3,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

document.getElementById('00').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>Climate Mapping</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Libero enim sed faucibus turpis in eu mi. Neque laoreet suspendisse interdum consectetur libero id. Mattis molestie a iaculis at erat pellentesque adipiscing. Diam maecenas sed enim ut sem. Commodo odio aenean sed adipiscing diam donec adipiscing. Amet tellus cras adipiscing enim eu turpis egestas. Nec dui nunc mattis enim ut tellus. Magna fermentum iaculis eu non diam phasellus vestibulum. Ac orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Enim nunc faucibus a pellentesque sit amet. Faucibus in ornare quam viverra orci sagittis eu. Aliquet risus feugiat in ante metus dictum at tempor commodo. Aliquam sem et tortor consequat id porta nibh venenatis. Mauris cursus mattis molestie a iaculis at erat pellentesque. Non enim praesent elementum facilisis leo. Leo vel orci porta non pulvinar neque. Netus et malesuada fames ac turpis egestas integer eget. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Vulputate dignissim suspendisse in est. Nec ullamcorper sit amet risus. Condimentum id venenatis a condimentum vitae sapien. Neque aliquam vestibulum morbi blandit cursus. Ut tellus elementum sagittis vitae et leo. Pulvinar sapien et ligula ullamcorper malesuada. Mauris pellentesque pulvinar pellentesque habitant. Lobortis elementum nibh tellus molestie nunc non blandit. Arcu dui vivamus arcu felis. A diam sollicitudin tempor id. Dignissim suspendisse in est ante in. Eu tincidunt tortor aliquam nulla facilisi cras. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis nisl. Consequat ac felis donec et odio. Malesuada nunc vel risus commodo viverra maecenas accumsan lacus. Feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Nisi vitae suscipit tellus mauris a diam maecenas sed enim. Pulvinar sapien et ligula ullamcorper malesuada. Convallis a cras semper auctor neque. Sollicitudin nibh sit amet commodo nulla facilisi nullam vehicula ipsum. Morbi non arcu risus quis varius quam. Auctor urna nunc id cursus. Morbi tristique senectus et netus et malesuada fames. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet commodo. Aenean vel elit scelerisque mauris pellentesque. Risus nullam eget felis eget nunc. Integer malesuada nunc vel risus commodo viverra maecenas. Integer eget aliquet nibh praesent tristique magna sit. Diam quis enim lobortis scelerisque fermentum dui faucibus in. Aliquam eleifend mi in nulla posuere sollicitudin. Est pellentesque elit ullamcorper dignissim. Est sit amet facilisis magna etiam tempor. Lobortis mattis aliquam faucibus purus in massa. Nec nam aliquam sem et tortor. Eu volutpat odio facilisis mauris sit amet massa vitae tortor. Semper feugiat nibh sed pulvinar proin gravida hendrerit. Commodo ullamcorper a lacus vestibulum sed. Urna nec tincidunt praesent semper feugiat. Risus at ultrices mi tempus imperdiet nulla malesuada pellentesque. Viverra tellus in hac habitasse platea dictumst. Eleifend donec pretium vulputate sapien. Eget nunc scelerisque viverra mauris. Turpis egestas integer eget aliquet nibh praesent tristique magna. Consectetur lorem donec massa sapien faucibus et molestie ac feugiat. Eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis. Ipsum suspendisse ultrices gravida dictum. Sed viverra ipsum nunc aliquet bibendum enim facilisis. Dui accumsan sit amet nulla facilisi morbi tempus iaculis urna. Amet consectetur adipiscing elit pellentesque habitant morbi. Pulvinar neque laoreet suspendisse interdum consectetur libero id faucibus nisl. Netus et malesuada fames ac turpis egestas. Nisl tincidunt eget nullam non nisi est. Varius vel pharetra vel turpis. Elementum nisi quis eleifend quam. Integer enim neque volutpat ac tincidunt vitae semper quis.</p>';
    map.flyTo([45.519292, 11.338594], 8);
});

document.getElementById('01').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>01</h1><p>Aliquam sem et tortor consequat.</p>';
    map.flyTo([45.519292, 11.338594], 15);
});

document.getElementById('02').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>02</h1><p>Nisi vitae suscipit tellus mauris.</p>';
    map.flyTo([45.4709699, 11.6014322], 15);
});

document.getElementById('03').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>03</h1><p>Lobortis elementum nibh tellus molestie.</p>';
    map.flyTo([45.442492, 11.584501], 15);
});

document.getElementById('04').addEventListener('click', function() {
    document.getElementById('text').innerHTML = '<h1>04</h1><p>layering</p>';
    map.flyTo([45.7116809922888692, 11.7875405432388973], 15);
});

document.getElementById('05').addEventListener('click', function() {
    map.flyTo([32, -130], 4);
});

var videoUrls = 'https://user.eumetsat.int/s3/eup-strapi-media/vid_il_19_07_07_3_76b9938111.mp4';
var latLngBounds = L.latLngBounds([[32, -130], [13, -100]]);

var videoOverlay = L.videoOverlay(videoUrls, latLngBounds, {
    opacity: 0.6,
    interactive: true,
    autoplay: true,
    muted: true,
    playsInline: true
}).addTo(map);