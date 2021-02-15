import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import TileWMS from 'ol/source/TileWMS';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import SourceStamen from 'ol/source/Stamen';
import View from 'ol/View';
import {Tile as TileLayer} from 'ol/layer';

import LayerSwitcher from 'ol-layerswitcher';

const OSMLayer = new TileLayer({
    title: 'OSM',
    type: 'base',
    visible: true,
    source: new OSM(),
});

const WCMap = new TileLayer({
    title: 'Watercolor',
    type: 'base',
    visible: false,
    source: new SourceStamen({
        layer: 'watercolor'
    })
});

const OPSource = new TileWMS({
    url: 'https://geo.spatstats.com/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Operators',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
});

const digiSource = new TileWMS({
    url: 'https://geo.spatstats.com/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Digipeaters',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
})

const nodeSource = new TileWMS({
    url: 'https://geo.spatstats.com/geoserver/PacketMap/wms',
    params: {'LAYERS': 'PacketMap:Nodes',
        'TILED': true,
        'VERSION': '1.1.1'},
    ratio: 1,
    serverType: 'geoserver',
});

const OPMap = new TileLayer({
    title: 'Local Operators',
    source: OPSource,
});

const DigiMap = new TileLayer({
    title: 'Local Digipeaters',
    visible: true,
    source: digiSource,
});

const NodeMap = new TileLayer({
    title: 'Remote Nodes',
    visible: true,
    source: nodeSource,
});

const layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group'
})

const view = new View({
    center: [-11686454,4832146],
    zoom: 4,
});

const map = new Map({
  layers: [OSMLayer, WCMap, NodeMap, DigiMap, OPMap],
  target: 'map',
  view: view,
});

map.addControl(layerSwitcher);

map.on('singleclick', function (evt) {
    document.getElementById('info').innerHTML = '';
    const viewResolution = /** @type {number} */ (view.getResolution());
    const opInfo = OPSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        {'INFO_FORMAT': 'application/json'}
    );
    const digiInfo = digiSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        {'INFO_FORMAT': 'application/json'}
    )
    const nodeInfo = nodeSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        {'INFO_FORMAT': 'application/json'}
    )
    if (opInfo && OPMap.getVisible() === true) {
        fetch(opInfo)
            .then(function (response) { return response.text(); })
            .then(function (json) {
                let inf = JSON.parse(json).features;

                if (inf.length > 0) {
                    inf = inf[0].properties;
                    const call = inf.call;
                    const grid = inf.grid;

                    /**
                     * @param inf.lastheard
                     */
                    const last_heard = inf.lastheard;

                    const formatted_lh = new Date(last_heard).toLocaleString();

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
                let inf = JSON.parse(json).features;

                if (inf.length > 0) {
                    inf = inf[0].properties;
                    const call = inf.call;
                    const grid = inf.grid;

                    /**
                     * @param inf.heard
                     */
                    let heard = inf.heard;
                    const last_heard = inf.lastheard;
                    const formatted_lh = new Date(last_heard).toLocaleString();

                    /**
                     * @param inf.ssid
                     */
                    let ssid = inf.ssid;

                    if (heard === true) {
                        heard = "Yes";
                    } else if (heard === false) {
                        heard = "No";
                    }

                    if (ssid === null) {
                        ssid = "None";
                    }

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
                }
            });
    }
    if (nodeInfo && NodeMap.getVisible() === true) {
        fetch(nodeInfo)
            .then(function (response) { return response.text(); })
            .then(function (json) {
                let inf = JSON.parse(json).features;

                if (inf.length > 0) {
                    inf = inf[0].properties;
                    console.log(inf)
                    const call = inf.call;
                    const grid = inf.grid;

                    /**
                     * @param inf.last_check
                     */
                    const last_checked = inf.last_check;
                    const formatted_last_check = new Date(last_checked).toLocaleString();

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
                }
            });
    }
});
