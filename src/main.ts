import './style.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import geojsonvt from 'geojson-vt';
import seamlines from './seamlines.json';

mapboxgl.accessToken =
    'access_token';

const map = new mapboxgl.Map({
    container: 'map',
    projection: { name: 'globe' },
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [139.767, 35.681],
    zoom: 2,
});

const geoJSON = seamlines;

const options = {
    maxZoom: 14, // max zoom to preserve detail on; can't be higher than 24
    tolerance: 3, // simplification tolerance (higher means simpler)
    extent: 4096, // tile extent (both width and height)
    buffer: 64, // tile buffer on each side
    debug: 0, // logging level (0 to disable, 1 or 2)
    lineMetrics: false, // whether to enable line metrics tracking for LineString/MultiLineString features
    promoteId: null, // name of a feature property to promote to feature.id. Cannot be used with `generateId`
    generateId: false, // whether to generate feature ids. Cannot be used with `promoteId`
    indexMaxZoom: 5, // max zoom in the initial tile index
    indexMaxPoints: 100000, // max number of points per tile in the index
};

const tileIndex = geojsonvt(geoJSON, options);

map.addControl(
    new mapboxgl.NavigationControl({
        visualizePitch: true,
    })
);

map.on('load', () => {
    // render geoJSON on the map
    map.addSource('geojson', {
        type: 'geojson',
        data: geoJSON,
    });

    map.addLayer({
        id: 'geojson',
        type: 'fill',
        source: 'geojson',
        paint: {
            'fill-color': 'red',
            'fill-opacity': 0.5,
        },
    });

    map.addLayer({
        id: 'geojsonLines',
        type: 'line',
        source: 'geojson',
        paint: {
            'line-color': 'red',
            'line-opacity': 0.5,
        },
    });
});

// get features from tileIndex while navigating
map.on('moveend', () => {
    // generate tiles on the fly
    const x = Math.floor(((map.getCenter().lng + 180) / 360) * (1 << map.getZoom()));
    const y = Math.floor(
        ((1 -
            Math.log(
                Math.tan((map.getCenter().lat * Math.PI) / 180) +
                    1 / Math.cos((map.getCenter().lat * Math.PI) / 180)
            ) /
                Math.PI) /
            2) *
            (1 << map.getZoom())
    );
    const z = Math.floor(map.getZoom());
    const tile = tileIndex.getTile(z, x, y).features;
    console.log(tile)
});
