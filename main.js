import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import SourceStamen from 'ol/source/Stamen';
import LayerGroup from 'ol/layer/Group';
import LayerTile from 'ol/layer/Tile';
import View from 'ol/View';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';

import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';

var layers = [
  new TileLayer({
    title: 'OSM',
    type: 'base',
    visible: true,
    source: new OSM(),
  }),
  new TileLayer({
      title: 'Watercolor',
      type: 'base',
      visible: false,
      source: new SourceStamen({
          layer: 'watercolor'
      })
  }),
  new TileLayer({
    extent: [-180, -90, 180, 90],
    title: 'Operators',
    source: new TileWMS({
      url: 'http://192.168.3.56:8080/geoserver/PacketMap/wms',
      params: {'LAYERS': 'PacketMap:Operators',
		'CRS': 'EPSG:4326',
		'TILED': false,
		'VERSION': '1.1.1'},
      ratio: 1,
      serverType: 'geoserver',
    }),
  }),
  new TileLayer({
    extent: [-180, -90, 180, 90],
    title: 'Digipeaters',
      visible: false,
    source: new TileWMS({
      url: 'http://192.168.3.56:8080/geoserver/PacketMap/wms',
      params: {'LAYERS': 'PacketMap:Digipeaters',
                'CRS': 'EPSG:4326',
                'TILED': false,
                'VERSION': '1.1.1'},
      ratio: 1,
      serverType: 'geoserver',
    }),
  })];

var layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group'
})

var map = new Map({
  layers: layers,
  target: 'map',
  //projection: 'EPSG:4326',
  view: new View({
    projection: 'EPSG:4326',
    center: [-104.9903, 39.7392],
    zoom: 8,
  }),
});

map.addControl(layerSwitcher);

//map.on("singleclick", function (evt) {
//	console.log("Clicked!");
//	var pixel = new ol.Pixel(mapMousePosition.lastXy.x, mapMousePosition.lastXy.y);
//	map.forEachFeatureAtPixel(pixel, function(feature, layer) {
//		return feature;
//	});
//	console.log(feature);
//});
