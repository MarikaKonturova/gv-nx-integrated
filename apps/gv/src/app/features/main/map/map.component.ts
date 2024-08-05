import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { difference } from '@turf/difference';
import { featureCollection, polygon } from '@turf/helpers';
import { Map, MapBrowserEvent, Overlay, View } from 'ol';
import DrawHole from 'ol-ext/interaction/DrawHole';
import Transform from 'ol-ext/interaction/Transform';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import Feature, { FeatureLike } from 'ol/Feature';
import formatGeoJSON from 'ol/format/GeoJSON';
import MVT from 'ol/format/MVT';
import { Circle, Polygon } from 'ol/geom';
import { Type } from 'ol/geom/Geometry';
import { fromCircle } from 'ol/geom/Polygon';
import Draw from 'ol/interaction/Draw';
import Link from 'ol/interaction/Link';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import Snap from 'ol/interaction/Snap';
import LayerGroup from 'ol/layer/Group.js';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import { fromLonLat } from 'ol/proj';
import Source from 'ol/source/Source';
import VectorSource from 'ol/source/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import { Fill, Stroke, Style } from 'ol/style.js';
import CircleStyle from 'ol/style/Circle';

import { Data } from '../../../shared/components/emoji-radio-input/data.interface';
import { EmojiRadioInputComponent } from '../../../shared/components/emoji-radio-input/emoji-radio-input.component';
import { MapService } from '../services/map.service';
import { PopupData } from './interfaces/popup-data.interface';
type interactionMap = Draw | Link | Modify | Select | Transform;
const highlightStyle = new Style({
  fill: new Fill({
    color: '#EEE',
  }),
  stroke: new Stroke({
    color: '#3399CC',
    width: 2,
  }),
});
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, EmojiRadioInputComponent, FormsModule],
  providers: [MapService],
  selector: 'app-map',
  standalone: true,
  styleUrl: './map.component.scss',
  templateUrl: './map.component.html',
})
export class MapComponent implements OnInit {
  private mapService = inject(MapService);
  differenceCollection: Feature[] = [];
  drawHole?: DrawHole;
  geometryData: Data[] = [
    {
      name: '',
      options: [
        { name: 'Polygon', value: 'Polygon' },
        { name: 'LineString', value: 'LineString' },
        { name: 'Circle', value: 'Circle' },
      ],
      value: 'draw',
    },
  ];
  geometryType: Type = 'Polygon';
  infoLayer!: VectorTileLayer;
  interactionData: Data[] = [
    {
      name: '🎨',
      options: [
        { name: 'transform', value: 'transform' },
        { name: 'draw', value: 'draw' },
        { name: 'modify', value: 'modify' },
        { name: 'drawHole', value: 'drawHole' },
        { name: 'difference', value: 'difference' },
      ],
      value: 'edit',
    },
    {
      name: '🖼️',
      options: null,
      value: 'info',
    },
  ];
  interactionMap: interactionMap[] = [];
  interactionType = 'info';
  interactiveLayer!: VectorLayer;
  mainLayer!: MapboxVectorLayer;
  map!: Map;
  overlay!: Overlay;
  @ViewChild('popup', { static: true }) popup!: ElementRef;
  public popupData?: PopupData;
  snap?: Snap;
  source!: VectorSource;

  transform?: Transform;

  clickInfo(event: MouseEvent) {
    const evt = new MapBrowserEvent('click', this.map, event);
    const feature = this.map.forEachFeatureAtPixel(
      evt.pixel,
      (feature: FeatureLike, layer: Layer<Source>) => {
        if (layer == this.infoLayer || layer == this.interactiveLayer) {
          return feature;
        }
        return null;
      }
    );
    if (feature) {
      const geometry = feature.getGeometry();

      if (geometry) {
        const formattedArea = this.mapService.formatArea(geometry.getExtent());
        this.popupData = {
          area: formattedArea,
          name: feature.get('name'),
        };

        const coordinate = evt.coordinate;
        this.overlay.setPosition(coordinate);
      }
    }
  }

  closePopup() {
    this.overlay.setPosition(undefined);
  }
  difference() {
    const turfPolygons = this.differenceCollection.map((feature) => {
      this.interactiveLayer.getSource()?.removeFeature(feature);
      const geometry = feature.getGeometry();

      if (geometry?.getType() === 'LineString') {
        // const polygonGeom = lineToPolygon(
        // (geometry as LineString).getCoordinates()
        // );
        //return polygon(polygonGeom.getCoordinates());
      }
      if (geometry?.getType() === 'Circle') {
        const polygonGeom = fromCircle(geometry as Circle);
        return polygon(polygonGeom.getCoordinates());
      }

      return polygon((geometry as Polygon)?.getCoordinates());
    });

    const differenceads = difference(featureCollection(turfPolygons));
    const feature = new formatGeoJSON().readFeature(differenceads);
    this.differenceCollection = [];
    this.interactiveLayer.getSource()?.addFeature(feature);
  }

  ngOnInit() {
    this.infoLayer = new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        maxZoom: 14,
        url:
          'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
          'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
      }),
    });
    this.source = new VectorSource();
    this.interactiveLayer = new VectorLayer({
      source: this.source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(245, 39, 195, 0.37)',
        }),
        geometry: function (feature) {
          const modifyGeometry = feature.get('modifyGeometry');
          return modifyGeometry
            ? modifyGeometry.geometry
            : feature.getGeometry();
        },
        image: new CircleStyle({
          fill: new Fill({
            color: '#ffcc33',
          }),
          radius: 7,
        }),
        stroke: new Stroke({
          color: 'black',
          width: 2,
        }),
      }),
    });
    this.mainLayer = new MapboxVectorLayer({
      accessToken:
        'pk.eyJ1IjoibWFyaWtha29udHVyb3ZhIiwiYSI6ImNsNHZmcmJxdDE4bGozanMzaTVjYjl0aGoifQ.XthjCSuRlsATknE03ADZTw',
      styleUrl: 'mapbox://styles/mapbox/bright-v9',
    });
    this.overlay = new Overlay({
      autoPan: {
        animation: {
          duration: 250,
        },
      },
      element: this.popup.nativeElement,
    });
    this.map = new Map({
      overlays: [this.overlay],
      target: 'map-container',
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    const baseLayerGroup = new LayerGroup({
      layers: [this.mainLayer, this.infoLayer, this.interactiveLayer],
    });
    this.map.addLayer(baseLayerGroup);
    this.map.addInteraction(new Link());
    this.map.once('loadstart', () => {
      this.map.getTargetElement().classList.add('spinner');
    });
    this.map.once('loadend', () => {
      this.map.getTargetElement().classList.remove('spinner');
    });
    this.setInteraction();
  }
  setGeometryType(type?: Type) {
    if (type) {
      this.geometryType = type;
    }
    this.setInteraction();
  }
  setInteraction(type?: string) {
    if (this.interactionMap.length > 0) {
      this.interactionMap.forEach((interaction) => {
        this.map.removeInteraction(interaction);
      });
    }
    if (type) {
      this.interactionType = type;
    }
    if (this.interactionType !== 'info') {
      this.closePopup();
    }
    if (this.interactionType === 'draw') {
      const drawInteraction = new Draw({
        source: this.source,
        type: this.geometryType,
      });
      this.interactionMap.push(drawInteraction);
      this.map.addInteraction(drawInteraction);
    }
    if (this.interactionType === 'transform') {
      this.transform = new Transform({
        enableRotatedTransform: false,
        features: this.source.getFeaturesCollection() || undefined,
        layers: [this.interactiveLayer],
        rotate: true,
        scale: true,
        stretch: true,
        translate: true,
        translateFeature: false,
      });
      this.interactionMap.push(this.transform);
      this.map.addInteraction(this.transform);
    }
    if (this.interactionType === 'modify') {
      const modify = new Modify({
        source: this.source,
      });

      this.interactionMap.push(modify);
      this.map.addInteraction(modify);
    }
    if (this.interactionType === 'drawHole') {
      const drawHole = new DrawHole({
        layers: [this.interactiveLayer],
        type: 'Polygon',
      });

      this.interactionMap.push(drawHole);
      this.map.addInteraction(drawHole);
    }
    if (this.interactionType === 'difference') {
      const selectClick = new Select({
        layers: [this.interactiveLayer],
      });
      selectClick.getFeatures().on('add', (e) => {
        const feature = e.element as Feature;
        if (this.differenceCollection.length === 2) {
          this.differenceCollection.forEach((feature) => {
            feature.setStyle(undefined);
          });
          this.differenceCollection = [];
        }
        const selIndex = this.differenceCollection.indexOf(feature);
        if (selIndex < 0) {
          this.differenceCollection.push(feature);
          feature.setStyle(highlightStyle);
        } else {
          this.differenceCollection.splice(selIndex, 1);
          feature.setStyle(undefined);
        }
        console.log(this.differenceCollection);
      });
      this.interactionMap.push(selectClick);
      this.map.addInteraction(selectClick);
    }
  }
}
