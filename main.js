import 'ol/ol.css';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';

var layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new TileLayer({
    extent: [-180, -90, 180, 90],
    source: new TileWMS({
      url: 'http://192.168.3.56:8080/geoserver/PacketMap/wms',
      params: {'LAYERS': 'PacketMap:Operators',
		'CRS': 'EPSG:4326',
		'TILED': false,
		'VERSION': '1.1.1'},
      ratio: 1,
      serverType: 'geoserver',
    }),
  }) ];
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
