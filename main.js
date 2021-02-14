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
            .then(function (json) {
                var inf = JSON.parse(json).features;
                inf = inf[0].properties;
                var call = inf.call;
                var grid = inf.grid;
                var last_heard = inf.lastheard;

                var formatted_lh = new Date(last_heard).toLocaleString();

                document.getElementById('info').innerHTML =
                    "<table class=\"styled-table\">\n" +
                    "    <thead>\n" +
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
            });
    }
    if (digiInfo && DigiMap.getVisible() === true) {
        fetch(digiInfo)
            .then(function (response) { return response.text(); })
            .then(function (json) {
                var inf = JSON.parse(json).features;
                console.log(inf);
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

                console.log(ssid);

                if (ssid === null) {
                    ssid = "None";
                };

                document.getElementById('info').innerHTML =
                    "<table class=\"styled-table\">\n" +
                    "    <thead>\n" +
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
            });
    }
});
