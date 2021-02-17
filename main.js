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
import {Stroke, Style, Circle, Fill, Text} from 'ol/style';

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

const RemoteOPSource = new VectorSource({
    format: new GeoJSON(),
    attributions: "| Robert Ross Wardrup | www.rwardrup.com",
    url: function (extent) {
        return (
            'https://geo.spatstats.com/geoserver/ows?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=PacketMap:Remote_Operators&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
        );
    },
    strategy: bboxStrategy,
});

const RemoteDigiSource = new VectorSource({
    format: new GeoJSON(),
    attributions: "| Robert Ross Wardrup | www.rwardrup.com",
    url: function (extent) {
        return (
            'https://geo.spatstats.com/geoserver/ows?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=PacketMap:Remote_Digipeaters&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
        );
    },
    strategy: bboxStrategy,
});

const DirectHeardOPSource = new VectorSource({
    format: new GeoJSON(),
    attributions: "| Robert Ross Wardrup | www.rwardrup.com",
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

const DirectHeardDigiSource = new VectorSource({
    format: new GeoJSON(),
    attributions: "| Robert Ross Wardrup | www.rwardrup.com",
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
    attributions: "| Robert Ross Wardrup | www.rwardrup.com",
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

const highlightStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(228, 26, 28, 1.0)'
        }),
    })
});

const RemoteHeardOpStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(55, 126, 184, 1.0)'
        }),
    })
});

const RemoteDigiStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(166, 86, 40, 1.0)'
        }),
    })
});

const DirectHeardOPStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(77, 175, 74, 1.0)'
        }),
    })
});

const DirectHeardDigiStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(152, 78, 163, 1.0)'
        }),
    })
});

const NodeStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(255, 127, 0, 1.0)'
        }),
    })
});

var RemoteOPMap = new VectorLayer({
    title: 'Operators',
    visible: true,
    source: RemoteOPSource,
    style: RemoteHeardOpStyle,
});

var RemoteDigiMap = new VectorLayer({
    title: 'Digipeaters',
    visible: true,
    source: RemoteDigiSource,
    style: RemoteDigiStyle,
});

var OPMap = new VectorLayer({
    title: 'Local Operators',
    visible: true,
    source: DirectHeardOPSource,
    style: DirectHeardOPStyle,
});

var DigiMap = new VectorLayer({
    title: 'Local Digipeaters',
    visible: true,
    source: DirectHeardDigiSource,
    style: DirectHeardDigiStyle,
});

var NodeMap = new VectorLayer({
    title: 'Nodes',
    visible: true,
    source: nodeSource,
    style: NodeStyle,
});

let layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group'
})

layerSwitcher.useLegendGraphics = true;

const view = new View({
    center: [-11686454,4832146],
    zoom: 4,
});

const map = new Map({
  layers: [OSMLayer, WCMap, RemoteOPMap, RemoteDigiMap, NodeMap, DigiMap, OPMap],
  target: 'map',
  view: view,
});

var featureOverlay = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: function (feature) {
        highlightStyle.getGeometry.setGeometry();
        //highlightStyle.getText().setText(feature.get('call'));
        return highlightStyle;
    },
});

let highlight;

function replace_band_order (stringList) {
    let res_list = "";
    console.log(res_list);
    let split_list = stringList.split(',');
    for (let i = 0; i < split_list.length; i++) {
        let band = split_list[i]
        if (band === "70CM") {
            res_list += band += ', ';
        } else if (band === "2M") {
            res_list += band += ', ';
        } else if (band === "20M") {
            res_list += band += ', ';
        } else if (band === "40M") {
            res_list += band += ', ';
        }
    }

    return res_list.replace(/,\s*$/, "");
}

map.addControl(layerSwitcher);

map.on('singleclick', function (evt) {
    document.getElementById('info').innerHTML = '';
    let feature_type = undefined;
    let features = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    });

    if (features !== highlight) {
        if (highlight) {
            if (highlight.id_.includes("Node")) {
                highlight.setStyle(NodeStyle);
            } else if (highlight.id_.includes("Remote_Operators")) {
                highlight.setStyle(RemoteHeardOpStyle);
            } else if (highlight.id_.includes("Operator")) {
                highlight.setStyle(DirectHeardOPStyle);
            } else if (highlight.id_.includes("Remote_Digipeater")) {
                highlight.setStyle(RemoteDigiStyle);
            } else if (highlight.id_.includes("Digipeater")) {
                highlight.setStyle(DirectHeardDigiStyle);
            }
        }
        if (features) {
            console.log("Hightlighting feature");
            features.setStyle(highlightStyle);
        }
        highlight = features;
    }
    if (features !== undefined) {
        const call = features.get("call");
        const grid = features.get("grid");
        const feature_id = features.id_;

        if (feature_id.includes("Remote_Operators")) {
            feature_type = "Remote Operator";
            const call = features.get("remote_call");
            const digi_last_heard = features.get("lastheard");
            const digi_formatted_lh = new Date(digi_last_heard).toLocaleString();

            let bands = features.get("bands")
            if (bands !== undefined && bands !== null) {
                console.log(bands);
                bands = bands.replace(/(^,)|(,$)/g, "");
                bands = replace_band_order(bands).replace(/,/g, ', ');  // 40CM, 2M, 20M, then 40M
            } else {
                bands = "Unknown";
            }

            document.getElementById('info').innerHTML =
                "<table class=\"styled-table\">\n" +
                "    <thead>\n" +
                "      <tr><th colspan='5' class='table-title'>Operator</th></tr>" +
                "        <tr>\n" +
                "            <th>Call</th>\n" +
                "            <th>Grid</th>\n" +
                "            <th>Bands\n</th>" +
                "            <th>Last Heard</th>\n" +
                "        </tr>\n" +
                "    </thead>\n" +
                "    <tbody>\n" +
                "        <tr class=\"active-row\">\n" +
                "            <td>call</td>\n".replace("call", call) +
                "            <td>grid</td>\n".replace("grid", grid) +
                "            <td>bands</td>\n".replace("bands", bands) +
                "            <td>last_heard</td>\n".replace("last_heard", digi_formatted_lh) +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>"

        } else if (feature_id.includes("Operators")) {
            feature_type = "Operators";
            const op_last_heard = features.get("lastheard");
            const op_formatted_lh = new Date(op_last_heard).toLocaleString();
            const op_grid = features.get("grid");

            document.getElementById('info').innerHTML =
                "<table class=\"styled-table\">\n" +
                "    <thead>\n" +
                "      <tr><th colspan='3' class='table-title'>Operator Heard Locally</th></tr>" +
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
                "            <td>last_heard</td>\n".replace("last_heard", op_formatted_lh) +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>";

        } else if (feature_id.includes("Nodes")) {
            feature_type = "Nodes";
            const node_p_call = features.get("parent_call");
            const node_last_check = features.get("last_check");
            const node_formatted_last_check = new Date(node_last_check).toLocaleString();
            const node_ssid = features.get("ssid");
            const node_path = features.get("path");
            const node_level = features.get("level");

            document.getElementById('info').innerHTML =
                "<table class=\"styled-table\">\n" +
                "    <thead>\n" +
                "      <tr><th colspan='3' class='table-title'>Node</th></tr>" +
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
                "            <td>last_check</td>\n".replace("last_check", node_formatted_last_check) +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>"

        } else if (feature_id.includes("Remote_Digipeaters")) {
            feature_type = "Digipeaters";
            const digi_last_heard = features.get("lastheard");
            const digi_formatted_lh = new Date(digi_last_heard).toLocaleString();
            let digi_direct_heard = features.get("heard");
            let digi_ssid = features.get("ssid");

            if (digi_ssid === null || digi_ssid === undefined) {
                digi_ssid = "None";
            }

            if (digi_direct_heard === true) {
                digi_direct_heard = "Yes";
            } else if (digi_direct_heard === false) {
                digi_direct_heard = "No";
            }

            document.getElementById('info').innerHTML =
                "<table class=\"styled-table\">\n" +
                "    <thead>\n" +
                "      <tr><th colspan='5' class='table-title'>Digipeater</th></tr>" +
                "        <tr>\n" +
                "            <th>Call</th>\n" +
                "            <th>SSID</th>\n" +
                "            <th>Grid</th>\n" +
                "            <th>Last Heard</th>\n" +
                "        </tr>\n" +
                "    </thead>\n" +
                "    <tbody>\n" +
                "        <tr class=\"active-row\">\n" +
                "            <td>call</td>\n".replace("call", call) +
                "            <td>ssid</td>\n".replace("ssid", digi_ssid) +
                "            <td>grid</td>\n".replace("grid", grid) +
                "            <td>last_heard</td>\n".replace("last_heard", digi_formatted_lh) +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>"

        } else if (feature_id.includes("Digipeaters")) {
            feature_type = "Digipeaters";
            const digi_last_heard = features.get("lastheard");
            const digi_formatted_lh = new Date(digi_last_heard).toLocaleString();
            let digi_direct_heard = features.get("heard");
            let digi_ssid = features.get("ssid");

            if (digi_direct_heard === true) {
                digi_direct_heard = "Yes";
            } else if (digi_direct_heard === false) {
                digi_direct_heard = "No";
            }

            if (digi_direct_heard === true) {
                digi_direct_heard = "Yes";
            } else if (digi_direct_heard === false) {
                digi_direct_heard = "No";
            }

            document.getElementById('info').innerHTML =
                "<table class=\"styled-table\">\n" +
                "    <thead>\n" +
                "      <tr><th colspan='5' class='table-title'>Digipeater</th></tr>" +
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
                "            <td>ssid</td>\n".replace("ssid", digi_ssid) +
                "            <td>grid</td>\n".replace("grid", grid) +
                "            <td>heard_directly</td>\n".replace("heard_directly", digi_direct_heard) +
                "            <td>last_heard</td>\n".replace("last_heard", digi_formatted_lh) +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>"

        }
        console.log(feature_type);
        //displayFeatureInfo(evt.pixel);
    } else {
        console.log("Clicked on undefined feature");
    }
});
