import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerGroup from 'ol/layer/Group'
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS'
import View from 'ol/View';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {bbox as bboxStrategy} from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {Style, Circle, Fill, Stroke} from 'ol/style';
import {Attribution, defaults as defaultControls} from 'ol/control'
import XYZ from "ol/source/XYZ";
import {Sidebar} from 'ol/control.js';
import LayerSwitcher from 'ol-layerswitcher';
import RenderOptions from 'ol-layerswitcher'

const geoserver_url = "https://geo.packetradiomap.com/geoserver/";
const geoserver_wms = geoserver_url + "PacketMap/wms";
const geoserver_wfs = geoserver_url + "ows?service=WFS&";

const OSMLayer = new TileLayer({
    type: 'base',
    visible: true,
    displayInLayerSwitcher: false,
    source: new XYZ({
        url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    })
})

const VUHFNetworkSource = new TileWMS({
    url: geoserver_wms,
    params: {'LAYERS': 'PacketMap:VUHF_Network',
        'TILED': true,
        'VERSION': '1.1.1',
    },
    serverType: 'geoserver',
    ratio: 1
})

const VUHFNetworkMap = new TileLayer({
        title: 'V/UHF Node Network',
        visible: false,
        source: VUHFNetworkSource,
    });

const RemoteOPSource = new VectorSource({
    format: new GeoJSON(),
    attributions: "R.R. Wardrup | www.rwardrup.com",
    url: function (extent) {
        return (
            geoserver_wfs +
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
    attributions: "R.R. Wardrup | www.rwardrup.com",
    url: function (extent) {
        return (
            geoserver_wfs +
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
    attributions: "R.R. Wardrup | www.rwardrup.com",
    url: function (extent) {
        return (
            geoserver_wfs +
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
    attributions: "R.R. Wardrup | www.rwardrup.com",
    url: function (extent) {
        return (
            geoserver_wfs +
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
    attributions: "R.R. Wardrup | www.rwardrup.com",
    url: function (extent) {
        return (
            geoserver_wfs +
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
    title: 'Operators via RF',
    visible: true,
    source: DirectHeardOPSource,
    style: DirectHeardOPStyle,
});

var DigiMap = new VectorLayer({
    title: 'Digipeaters via RF',
    visible: true,
    source: DirectHeardDigiSource,
    style: DirectHeardDigiStyle,
});

var NodeMap = new VectorLayer({
    title: 'NET/ROM Nodes',
    visible: true,
    source: nodeSource,
    style: NodeStyle,
});

const vectorLayers = new LayerGroup({
    title: "Packet Stations",
    layers: [RemoteOPMap, RemoteDigiMap, NodeMap, DigiMap, OPMap]
})

let layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group'
})

layerSwitcher.useLegendGraphics = true;

const view = new View({
    center: [0,0],
    zoom: 0,
});

function get_frequency (ports) {
    // Try to get frequency from port name
    let freqs = "Unknown";
    if (ports !== null) {
        const port_split = ports.split(",");
        for (let i=0; i < port_split.length; i++) {
            const s = port_split[i].split(' ');
            for (let i=0; i < s.length; i++) {
                const port_name_part = s[i];
                if (/^7\.\d*$/.test(port_name_part) ||
                    /^14\.\d*$/.test(port_name_part) ||
                    /^22\.\d*$/.test(port_name_part) ||
                    /^14.\.\d*$/.test(port_name_part) ||
                    /^44.\.\d*$/.test(port_name_part)) {
                    const frequency = parseFloat(port_name_part).toString() + " Mhz<BR/>"
                    if (!freqs.includes(frequency)) {
                        if (freqs === "Unknown") {
                            freqs = frequency;
                        } else {
                            freqs = freqs + frequency;
                        }
                    }
                }
            }
        }
    }
    return freqs;
}

let highlight;

function replace_band_order (stringList) {
    let res_list = "";
    let split_list = stringList.split(',');

    if (stringList.includes('70CM')) {
        res_list += "70CM" + ', ';
    }
    if (stringList.includes('2M')) {
        res_list += "2M" + ', ';
    }
    if (stringList.includes('20M')) {
        res_list += "20M" + ', ';
    }
    if (stringList.includes('40M')) {
        res_list += "40M" + ', ';
    }
    if (stringList.includes('80M')) {
        res_list += "80M" + ', ';
    }

    return res_list.replace(/,\s*$/, "");
}

const map = new Map({
    layers: [OSMLayer, vectorLayers],
    target: 'map',
    view: view,
    controls: defaultControls({
        attributionOptions: {
            collapsible: false
        }
    })
});

const render_options = new RenderOptions({
    activationMode: 'mouseover',
    startActive: false,
    collapseLabel: '\u00BB',
    label: '\u00AB',
    reverse: false,
    groupSelectStyle: "children"
});

map.on('singleclick', function (evt) {
    document.getElementById('info').innerHTML = '';
    let feature_type = undefined;
    let features = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    },
        {
            hitTolerance: 15
        });

    const viewResolution = /** @type {number} */ (view.getResolution());
    const VUHFPathInfo = VUHFNetworkSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        {'INFO_FORMAT': 'application/json'}
    )

    if (VUHFPathInfo && VUHFNetworkMap.getVisible() === true) {
        fetch(VUHFPathInfo)
            .then(function (response) { return response.text(); })
            .then(function (json) {
                let inf = JSON.parse(json).features;
                console.log(inf)
                if (inf.length > 0) {
                    inf = inf[0].properties
                    const call_a = inf.call_a;
                    const call_b = inf.call_b;
                    const parent_node = inf.parent_call;

                    document.getElementById('info').innerHTML =
                        "<table class=\"styled-table\">\n" +
                        "    <thead>\n" +
                        "      <tr><th colspan='3' class='table-title'>Path Members</th></tr>" +
                        "        <tr>\n" +
                        "            <th>Call A</th>\n" +
                        "            <th>Call B</th>\n" +
                        "            <th>Via</th>\n" +
                        "        </tr>\n" +
                        "    </thead>\n" +
                        "    <tbody>\n" +
                        "        <tr class=\"active-row\">\n" +
                        "            <td>call</td>\n".replace("call", call_a) +
                        "            <td>call</td>\n".replace("call", call_b) +
                        "            <td>via</td>\n".replace("via", parent_node) +
                        "        </tr>\n" +
                        "        <!-- and so on... -->\n" +
                        "    </tbody>\n" +
                        "</table>";

                }
            })
    }

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
            const digi_formatted_lh = new Date(digi_last_heard).toLocaleString('en-US',
                {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});

            const port_name = features.get('port').split(" ");

            let bands = features.get("bands")
            console.log(bands);
            if (bands !== undefined && bands !== null) {
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
                "            <th>Heard On\n</th>" +
                "            <th>Last Seen</th>\n" +
                "            <th></th>\n" +
                "        </tr>\n" +
                "    </thead>\n" +
                "    <tbody>\n" +
                "        <tr class=\"active-row\">\n" +
                "            <td><a href=\https://www.qrz.com/db/call target='_blank' \>call</a></td>\n".replaceAll("call", call) +
                "            <td>grid</td>\n".replace("grid", grid) +
                "            <td>bands</td>\n".replace("bands", bands) +
                "            <td>last_heard</td>\n".replace("last_heard", digi_formatted_lh) +
                "            <td></td>" +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>"

        } else if (feature_id.includes("Operators")) {
            feature_type = "Operators";
            const op_last_heard = features.get("lastheard");
            const op_formatted_lh = new Date(op_last_heard).toLocaleString('en-US',
                {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
            const op_grid = features.get("grid");

            document.getElementById('info').innerHTML =
                "<table class=\"styled-table\">\n" +
                "    <thead>\n" +
                "      <tr><th colspan='4' class='table-title'>Operator (via RF)</th></tr>" +
                "        <tr>\n" +
                "            <th>Call</th>\n" +
                "            <th>Grid</th>\n" +
                "            <th>Heard On</th>\n" +
                "            <th>Last Heard</th>\n" +
                "        </tr>\n" +
                "    </thead>\n" +
                "    <tbody>\n" +
                "        <tr class=\"active-row\">\n" +
                "            <td><a href=\https://www.qrz.com/db/call target='_blank' \>call</a></td>\n".replaceAll("call", call) +
                "            <td>grid</td>\n".replace("grid", grid) +
                "            <td>2M</td>\n" +
                "            <td>last_heard</td>\n".replace("last_heard", op_formatted_lh) +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>";

        } else if (feature_id.includes("Nodes")) {
            feature_type = "Nodes";
            const node_p_call = features.get("parent_call");
            const node_last_check = features.get("last_check");
            let bpq = features.get("bpq");
            const node_formatted_last_check = new Date(node_last_check).toLocaleString('en-US',
                {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});

            if (bpq === true) {
                bpq = 'Yes';
            } else if (bpq === false) {
                bpq = "No";
            } else {
                bpq = "Unknown";
            }


            document.getElementById('info').innerHTML =
                "<table class=\"styled-table\">\n" +
                "    <thead>\n" +
                "      <tr><th colspan='3' class='table-title'>Node</th></tr>" +
                "        <tr>\n" +
                "            <th>Call</th>\n" +
                "            <th>Grid</th>\n" +
//                "            <th>BPQ</th>\n" +
                "            <th>Last Check</th>\n" +
                "        </tr>\n" +
                "    </thead>\n" +
                "    <tbody>\n" +
                "        <tr class=\"active-row\">\n" +
                "            <td><a href=\https://www.qrz.com/db/call target='_blank' \>call</a></td>\n".replaceAll("call", call) +
                "            <td>grid</td>\n".replace("grid", grid) +
//                "            <td>bpq</td>\n".replace("bpq", bpq) +
                "            <td>last_check</td>\n".replace("last_check", node_formatted_last_check) +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>"

        } else if (feature_id.includes("Remote_Digipeaters")) {
            feature_type = "Digipeaters";
            const digi_last_heard = features.get("lastheard");
            const digi_formatted_lh = new Date(digi_last_heard).toLocaleString('en-US',
                {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
            let digi_direct_heard = features.get("heard");
            let digi_ssid = features.get("ssid");
            const ports = features.get('ports');

            // Try to get digi frequency from port name
            const digi_port = features.get('last_port').split(" ");
            console.log(ports);
            const digi_frequency = get_frequency(ports);

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
                "      <tr><th colspan='6' class='table-title'>Digipeater</th></tr>" +
                "        <tr>\n" +
                "            <th>Call</th>\n" +
                "            <th>SSID</th>\n" +
                "            <th>Grid</th>\n" +
                "            <th>Freq.</th>\n" +
                "            <th>Last RX</th>\n" +
                "            <th></th>\n" +
                "        </tr>\n" +
                "    </thead>\n" +
                "    <tbody>\n" +
                "        <tr class=\"active-row\">\n" +
                "            <td><a href=\https://www.qrz.com/db/call target='_blank' \>call</a></td>\n".replaceAll("call", call) +
                "            <td>ssid</td>\n".replace("ssid", digi_ssid) +
                "            <td>grid</td>\n".replace("grid", grid) +
                "            <td>freq</td>\n".replace("freq", digi_frequency) +
                "            <td>last_heard</td>\n".replace("last_heard", digi_formatted_lh) +
                "            <td></td>" +
                "        </tr>\n" +
                "        <!-- and so on... -->\n" +
                "    </tbody>\n" +
                "</table>"

        } else if (feature_id.includes("Digipeaters")) {
            feature_type = "Digipeaters";
            const digi_last_heard = features.get("lastheard");
            const digi_formatted_lh = new Date(digi_last_heard).toLocaleString('en-US',
                {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
            let digi_direct_heard = features.get("heard");
            let digi_ssid = features.get("ssid");

            if (digi_direct_heard === true) {
                digi_direct_heard = "Yes";
            } else if (digi_direct_heard === false) {
                digi_direct_heard = "No";
            }

            if (digi_ssid === null || digi_ssid === undefined) {
                digi_ssid = "None"
            }

            document.getElementById('info').innerHTML =
                "<table class=\"styled-table\">\n" +
                "    <thead>\n" +
                "      <tr><th colspan='6' class='table-title'>Digipeater (via RF)</th></tr>" +
                "        <tr>\n" +
                "            <th>Call</th>\n" +
                "            <th>SSID</th>\n" +
                "            <th>Grid</th>\n" +
                "            <th>Freq.</th>\n" +
                "            <th>Heard Directly</th>\n" +
                "            <th>Last RX</th>\n" +
                "        </tr>\n" +
                "    </thead>\n" +
                "    <tbody>\n" +
                "        <tr class=\"active-row\">\n" +
                "            <td><a href=\https://www.qrz.com/db/call target='_blank' \>call</a></td>\n".replaceAll("call", call) +
                "            <td>ssid</td>\n".replace("ssid", digi_ssid) +
                "            <td>grid</td>\n".replace("grid", grid) +
                "            <td>145.05</td>\n" +
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

const attribution = new Attribution({
    collapsible: false
})

// Build legend
window.onload = function () {
    const sidebar = new Sidebar({ element: 'sidebar', position: 'left' });
    map.addControl(layerSwitcher);
    map.addControl(sidebar);
    document.getElementById('map-legend').innerHTML =
        "<table class=\"styled-legend\">\n" +
        "    <thead>\n" +
        "      <tr><th colspan='3' class='table-title'>Legend</th></tr>" +
        "        <tr>\n" +
        "            <th></th>\n" +
        "            <th></th>\n" +
        "            <th></th>\n" +
        "        </tr>" +
        "    </thead>\n" +
        "    <tbody>\n" +
        "        <tr class=\"active-row\">\n" +
        "            <td><span class=\"local-op-dot\"></span></td>\n" +
        "            <td>Local Operator</td>" +
        "            <td></td>" +
        "        </tr>\n" +
        "        <tr class=\"active-row\">\n" +
        "            <td><span class=\"local-digi-dot\"></span></td>\n" +
        "            <td>Local Digipeater</td>\n" +
        "            <td></td>" +
        "        </tr>" +
        "        <tr class=\"active-row\">\n" +
        "            <td><span class=\"node-dot\"></span></td>\n" +
        "            <td>NET/ROM Node</td>\n" +
        "            <td></td>" +
        "        </tr>" +
        "        <tr class=\"active-row\">\n" +
        "            <td><span class=\"remote-digi-dot\"></span></td>\n" +
        "            <td>Digipeater</td>\n" +
        "            <td></td>" +
        "        </tr>" +
        "        <tr class=\"active-row\">\n" +
        "            <td><span class=\"remote-op-dot\"></span></td>\n" +
        "            <td>Operator</td>\n" +
        "            <td></td>" +
        "        </tr>" +
        "        </tr>\n" +
        "    </tbody>\n" +
        "</table>"
}