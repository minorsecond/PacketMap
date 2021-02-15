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
    url: 'https://geo.spatstats.com/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Operators',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
});

var digiSource = new TileWMS({
    url: 'https://geo.spatstats.com/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Digipeaters',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
})

var nodeSource = new TileWMS({
    url: 'https://geo.spatstats.com/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Nodes',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
});

var OPMap = new TileLayer({
    title: 'Local Operators',
    source: OPSource,
});

var DigiMap = new TileLayer({
    title: 'Local Digipeaters',
    visible: true,
    source: digiSource,
});

var NodeMap = new TileLayer({
    title: 'Remote Nodes',
    visible: true,
    source: nodeSource,
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
  layers: [OSMLayer, WCMap, NodeMap, DigiMap, OPMap],
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
    var nodeInfo = nodeSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        {'INFO_FORMAT': 'application/json'}
    )
    if (opInfo && OPMap.getVisible() === true) {
        console.log(fetch(opInfo));
        fetch(opInfo)
            .then(function (response) { return response.text(); })
            .then(function (json) {
                var inf = JSON.parse(json).features;

                if (inf.length > 0) {
                    inf = inf[0].properties;
                    var call = inf.call;
                    var grid = inf.grid;
                    var last_heard = inf.lastheard;

                    var formatted_lh = new Date(last_heard).toLocaleString();

                    document.getElementById('info').innerHTML =
                        "<table class=\"styled-table\">\n" +
                        "    <thead>\n" +
                        "      <tr><th colspan='3' class='table-title'>Operator Data</th></tr>" +
                        "        <tr>\n" +
                        "            <th>Call</th>\n" +
                        "            <th>Grid</th>\n" +
                        "            <th>Last Heard</th>\n" +
                        "        </tr>\n" +
                        "    </thead>\n" +
                        "    <tbody>\n" +
                        "        <tr class=\"active-row\">\n" +
                        "            <td>call</td>\n".replace("call", call) +
                        "            <td>grid</td>\n".replace("grid", grid) +
                        "            <td>last_heard</td>\n".replace("last_heard", formatted_lh) +
                        "        </tr>\n" +
                        "        <!-- and so on... -->\n" +
                        "    </tbody>\n" +
                        "</table>";
                }
            });
    }
    if (digiInfo && DigiMap.getVisible() === true) {
        fetch(digiInfo)
            .then(function (response) { return response.text(); })
            .then(function (json) {
                var inf = JSON.parse(json).features;

                if (inf.length > 0) {
                    inf = inf[0].properties;
                    var call = inf.call;
                    var grid = inf.grid;
                    var heard = inf.heard;
                    var last_heard = inf.lastheard;
                    var formatted_lh = new Date(last_heard).toLocaleString();
                    var ssid = inf.ssid;

                    if (heard === true) {
                        heard = "Yes";
                    } else if (heard === false) {
                        heard = "No";
                    };

                    if (ssid === null) {
                        ssid = "None";
                    };

                    document.getElementById('info').innerHTML =
                        "<table class=\"styled-table\">\n" +
                        "    <thead>\n" +
                        "      <tr><th colspan='5' class='table-title'>Digipeater Data</th></tr>" +
                        "        <tr>\n" +
                        "            <th>Call</th>\n" +
                        "            <th>SSID</th>\n" +
                        "            <th>Grid</th>\n" +
                        "            <th>Heard Directly</th>\n" +
                        "            <th>Last Heard</th>\n" +
                        "        </tr>\n" +
                        "    </thead>\n" +
                        "    <tbody>\n" +
                        "        <tr class=\"active-row\">\n" +
                        "            <td>call</td>\n".replace("call", call) +
                        "            <td>ssid</td>\n".replace("ssid", ssid) +
                        "            <td>grid</td>\n".replace("grid", grid) +
                        "            <td>heard_directly</td>\n".replace("heard_directly", heard) +
                        "            <td>last_heard</td>\n".replace("last_heard", formatted_lh) +
                        "        </tr>\n" +
                        "        <!-- and so on... -->\n" +
                        "    </tbody>\n" +
                        "</table>"
                };
            });
    }
    if (nodeInfo && NodeMap.getVisible() === true) {
        fetch(nodeInfo)
            .then(function (response) { return response.text(); })
            .then(function (json) {
                var inf = JSON.parse(json).features;

                if (inf.length > 0) {
                    inf = inf[0].properties;
                    console.log(inf)
                    var call = inf.call;
                    var grid = inf.grid;
                    var last_checked = inf.last_check;
                    var formatted_last_check = new Date(last_checked).toLocaleString();

                    document.getElementById('info').innerHTML =
                        "<table class=\"styled-table\">\n" +
                        "    <thead>\n" +
                        "      <tr><th colspan='3' class='table-title'>Node Data</th></tr>" +
                        "        <tr>\n" +
                        "            <th>Call</th>\n" +
                        "            <th>Grid</th>\n" +
                        "            <th>Last Check</th>\n" +
                        "        </tr>\n" +
                        "    </thead>\n" +
                        "    <tbody>\n" +
                        "        <tr class=\"active-row\">\n" +
                        "            <td>call</td>\n".replace("call", call) +
                        "            <td>grid</td>\n".replace("grid", grid) +
                        "            <td>last_check</td>\n".replace("last_check", formatted_last_check) +
                        "        </tr>\n" +
                        "        <!-- and so on... -->\n" +
                        "    </tbody>\n" +
                        "</table>"
                };
            });
    }
});
