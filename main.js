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
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
});

var digiSource = new TileWMS({
    url: 'http://192.168.3.56:8080/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Digipeaters',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
})

var OPMap = new TileLayer({
    title: 'Operators',
    source: OPSource,
});

var DigiMap = new TileLayer({
    title: 'Digipeaters',
    visible: false,
    source: digiSource,
});

var layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group'
})

var view = new View({
    center: [-11686454,4832146],
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
        'EPSG:3857',
        {'INFO_FORMAT': 'application/json'}
    );
    var digiInfo = digiSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        {'INFO_FORMAT': 'application/json'}
    )
    if (opInfo && OPMap.getVisible() === true) {
        console.log(fetch(opInfo));
        fetch(opInfo)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                document.getElementById('info').innerHTML = html;
            });
    }
    if (digiInfo && DigiMap.getVisible() === true) {
        fetch(digiInfo)
            .then(function (response) { return response.json(); })
            .then(function (html) {
                document.getElementById('info').innerHTML = html;
            });
    }
});
