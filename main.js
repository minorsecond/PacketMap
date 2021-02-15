import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import TileWMS from 'ol/source/TileWMS';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import SourceStamen from 'ol/source/Stamen';
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {bbox as bboxStrategy, all as allStrategy} from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {Stroke, Style, Circle, Fill} from 'ol/style';

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

const OPSource = new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
        return (
            'https://geo.spatstats.com/geoserver/ows?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=PacketMap:Operators&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
        );
    },
    strategy: bboxStrategy,
});

const digiSource = new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
        return (
            'https://geo.spatstats.com/geoserver/ows?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=PacketMap:Digipeaters&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
        );
    },
    strategy: bboxStrategy,
});

const nodeSource = new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
        return (
            'https://geo.spatstats.com/geoserver/ows?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=PacketMap:Nodes&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
        );
    },
    strategy: bboxStrategy,
});

var OPMap = new VectorLayer({
    title: 'Local Operators',
    visible: true,
    source: OPSource,
    style: new Style({
        image: new Circle({
            radius: 5,
            fill: new Fill({
                color: 'rgba(55, 126, 184, 1.0)'
            }),
        })
    }),
});

var DigiMap = new VectorLayer({
    title: 'Local Digipeaters',
    visible: true,
    source: digiSource,
    style: new Style({
        image: new Circle({
            radius: 5,
            fill: new Fill({
                color: 'rgba(77, 175, 74, 1.0)'
            }),
        })
    }),
});

var NodeMap = new VectorLayer({
    title: 'Remote Nodes',
    visible: true,
    source: nodeSource,
    style: new Style({
        image: new Circle({
            radius: 5,
            fill: new Fill({
                color: 'rgba(152, 78, 163, 1.0)'
            }),
        })
    }),
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

var highlightStyle = new Style({
    stroke: new Stroke({
        color: '#f00',
        width: 1,
    }),
    fill: new Fill({
        color: 'rgba(255,0,0,0.1)',
    }),
    text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({
            color: '#000',
        }),
        stroke: new Stroke({
            color: '#f00',
            width: 3,
        }),
    }),
});

var highlight;
var displayFeatureInfo = function (pixel) {
    NodeMap.getFeatures(pixel).then(function (features) {
        var feature = features.length ? features[0] : undefined;
        var info = document.getElementById('info');
        if (features.length) {
            info.innerHTML = feature.getId() + ': ' + feature.get('name');
        } else {
            info.innerHTML = '&nbsp;';
        }

        if (feature !== highlight) {
            if (highlight) {
                featureOverlay.getSource().removeFeature(highlight);
            }
            if (feature) {
                featureOverlay.getSource().addFeature(feature);
            }
            highlight = feature;
        }
    });
};

map.addControl(layerSwitcher);

map.on('singleclick', function (evt) {
    displayFeatureInfo(evt.pixel);
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
