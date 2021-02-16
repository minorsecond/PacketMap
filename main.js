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

const OPSource = new VectorSource({
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

const digiSource = new VectorSource({
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

var highlightStyle = new Style({
    stroke: new Stroke({
        color: '#f00',
        width: 1,
    }),
    fill: new Fill({
        color: 'rgba(255,0,0,0.1)',
    }),
});

const OPSTyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(55, 126, 184, 1.0)'
        }),
    })
});

var OPMap = new VectorLayer({
    title: 'Local Operators',
    visible: true,
    source: OPSource,
    style: OPSTyle,
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
let selection = undefined;

const displayFeatureInfo = function (pixel) {
    var feature = get_features;

    NodeMap.getFeatures(pixel).then(function (features) {
        feature = features.length ? features[0] : undefined;
        const info = document.getElementById('info');
        if (features.length) {
            info.innerHTML = feature.getId() + ': ' + feature.get('call');
        } else {
            info.innerHTML = '&nbsp;';
        }

        if (feature !== highlight) {
            if (highlight) {
                feature.style = OPSTyle;
            }
            if (feature) {
                feature.style = highlightStyle;
            }
            highlight = feature;
        }
    });
    if (feature === undefined) {
        OPMap.getFeatures(pixel).then(function (features) {
              feature = features.length ? features[0] : undefined;
            const info = document.getElementById('info');
            if (features.length) {
                info.innerHTML = feature.getId() + ': ' + feature.get('call');
            } else {
                info.innerHTML = '&nbsp;';
            }

            if (feature !== highlight) {
                if (highlight) {
                    feature.style = OPSTyle;
                }
                if (feature) {
                    feature.style = highlightStyle;
                }
                highlight = feature;
            }
        })
    }
    if (feature === undefined) {
        DigiMap.getFeatures(pixel).then(function (features) {
            feature = features.length ? features[0] : undefined;
            const info = document.getElementById('info');
            if (features.length) {
                info.innerHTML = feature.getId() + ': ' + feature.get('call');
            } else {
                info.innerHTML = '&nbsp;';
            }

            if (feature !== highlight) {
                if (highlight) {
                    feature.style = OPSTyle;
                }
                if (feature) {
                    feature.style = highlightStyle;
                }
                highlight = feature;
            }
        })
    }
    console.log(feature)
};

map.addControl(layerSwitcher);

map.on('singleclick', function (evt) {
    let feature_type = undefined;
    let features = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    });

    const feature_id = features.id_;
    if (feature_id.includes("Operators")) {
        feature_type = "Operators";
    } else if (feature_id.includes("Nodes")) {
        feature_type = "Nodes";
    } else if (feature_id.includes("Digipeaters")) {
        feature_type = "Digipeaters";
    }
    console.log(feature_type);
    //displayFeatureInfo(evt.pixel);
});
