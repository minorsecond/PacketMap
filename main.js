import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import TileWMS from 'ol/source/TileWMS';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import SourceStamen from 'ol/source/Stamen';
import View from 'ol/View';
import {Tile as TileLayer} from 'ol/layer';

import LayerSwitcher from 'ol-layerswitcher';

var OSMLayer = new TileLayer({
    title: 'OSM',
    type: 'base',
    visible: true,
    source: new OSM(),
});

var WCMap = new TileLayer({
    title: 'Watercolor',
    type: 'base',
    visible: false,
    source: new SourceStamen({
        layer: 'watercolor'
    })
});

var OPSource = new TileWMS({
    url: 'http://192.168.3.56:8080/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Operators',
        'CRS': 'EPSG:4326',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
});

var digiSource = new TileWMS({
    url: 'http://192.168.3.56:8080/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Digipeaters',
        'CRS': 'EPSG:4326',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
})

var OPMap = new TileLayer({
    extent: [-180, -90, 180, 90],
    title: 'Operators',
    source: OPSource,
});

var DigiMap = new TileLayer({
    extent: [-180, -90, 180, 90],
    title: 'Digipeaters',
    visible: false,
    source: digiSource,
});

var layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group'
})

var view = new View({
    projection: 'EPSG:4326',
    center: [-104.9903, 39.7392],
    zoom: 8,
});

var map = new Map({
  layers: [OSMLayer, WCMap, OPMap, DigiMap],
  target: 'map',
  view: view,
});

map.addControl(layerSwitcher);

map.on('singleclick', function (evt) {
    document.getElementById('info').innerHTML = '';
    var viewResolution = /** @type {number} */ (view.getResolution());
    var opInfo = OPSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:4326',
        {'INFO_FORMAT': 'text/html'}
    );
    var digiInfo = digiSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:4326',
        {'INFO_FORMAT': 'text/html'}
    )
    if (opInfo && OPMap.getVisible() === true) {
        fetch(opInfo)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                document.getElementById('info').innerHTML = html;
            });
    }
    if (digiInfo && DigiMap.getVisible() === true) {
        fetch(digiInfo)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                document.getElementById('info').innerHTML = html;
            });
    }
});
