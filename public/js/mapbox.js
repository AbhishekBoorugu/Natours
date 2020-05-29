export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWJoaXNoZWstYiIsImEiOiJja2FsOGduNXIwczh1MzB0ZHg0MGYzMmNuIn0.II5m3K7eDwcOP8luea8glA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/abhishek-b/ckal8wg602c9i1iqmvde02z53',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 5,
    // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach( loc => {
    // Create Marker
    const el = document.createElement('div');
    el.className= 'marker';

    //Add Marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    // Add popup
    new mapboxgl.Popup({
        offset: 30
    }).setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extends map bounds to include current location
    bounds.extend(loc.coordinates);
});

// Fit the map
map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
    }  
});
}

