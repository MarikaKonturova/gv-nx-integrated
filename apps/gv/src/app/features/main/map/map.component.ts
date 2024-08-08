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
import { ToastService } from '@app/core/services/toast.service';
import { environment } from '@app/environments/environment';
import { Data } from '@app/shared/components/emoji-radio-input/data.interface';
import { EmojiRadioInputComponent } from '@app/shared/components/emoji-radio-input/emoji-radio-input.component';
import { Map, MapBrowserEvent, Overlay, View } from 'ol';
import Transform from 'ol-ext/interaction/Transform';
import { MapboxVectorLayer } from 'ol-mapbox-style';
import Feature, { FeatureLike } from 'ol/Feature';
import MVT from 'ol/format/MVT';
import { Type } from 'ol/geom/Geometry';
import Draw from 'ol/interaction/Draw';
import Link from 'ol/interaction/Link';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import { fromLonLat } from 'ol/proj';
import Source from 'ol/source/Source';
import VectorSource from 'ol/source/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import { Fill, Stroke, Style } from 'ol/style.js';
import CircleStyle from 'ol/style/Circle';

import { MapService } from '../services/map.service';
import { PopupData } from './interfaces/popup-data.interface';

export type InteractionsForMap = Draw | Link | Modify | Select | Transform;
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
  private differenceCollection: Feature[] = [];
  private infoLayer!: VectorTileLayer;
  private interactionsForMap: InteractionsForMap[] = [];
  private interactiveLayer!: VectorLayer;
  private mainLayer!: MapboxVectorLayer;
  private map!: Map;
  private mapService = inject(MapService);
  private overlay!: Overlay;
  private source!: VectorSource;
  private toast = inject(ToastService);
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
  interactionData: Data[] = [
    {
      name: '🎨',
      options: [
        { name: 'transform', value: 'transform' },
        { name: 'draw', value: 'draw' },
        { name: 'modify', value: 'modify' },
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
  interactionType = 'info';
  @ViewChild('popup', { static: true }) popup!: ElementRef;
  public popupData?: PopupData;

  clearDifferenceCollection() {
    this.differenceCollection.forEach(feature => {
      feature.setStyle(undefined);
    });

    this.differenceCollection = [];
  }

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
    if (this.mapService.isCollectionHasFeature(this.differenceCollection, 'LineString')) {
      this.toast.initiate({
        content: 'you cannot difference selected drawings, try others',
        title: 'Error',
      });

      this.clearDifferenceCollection();

      return;
    }

    this.mapService.makeDifference(
      this.differenceCollection,
      this.interactiveLayer,
      this.clearDifferenceCollection.bind(this)
    );
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

          return modifyGeometry ? modifyGeometry.geometry : feature.getGeometry();
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
      accessToken: `${environment.mapBoxAccessToken}`,
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
      layers: [this.mainLayer, this.infoLayer, this.interactiveLayer],
      overlays: [this.overlay],
      target: 'map-container',
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    this.map.addInteraction(new Link());

    this.map.once('loadstart', () => {
      this.map.getTargetElement().classList.add('spinner');
    });

    this.map.once('loadend', () => {
      this.map.getTargetElement().classList.remove('spinner');
    });

    this.setInteraction();
  }
  setGeometryType(geometryType: Type) {
    this.geometryType = geometryType;

    this.setInteraction();
  }
  setInteraction(interactionType?: string) {
    if (this.interactionsForMap.length > 0) {
      this.interactionsForMap.forEach(interaction => {
        this.map.removeInteraction(interaction);
      });

      this.interactionsForMap = [];
    }

    if (interactionType) {
      this.interactionType = interactionType;
    }

    if (this.interactionType !== 'info') {
      this.closePopup();
    }

    const interaction = this.mapService.getInteraction(
      this.interactiveLayer,
      this.source,
      this.geometryType,
      this.interactionType
    );

    if (this.interactionType === 'difference') {
      (interaction as Select).getFeatures().on('add', e => {
        const feature = e.element as Feature;

        const selIndex = this.differenceCollection.indexOf(feature);

        if (selIndex < 0) {
          this.differenceCollection.push(feature);

          feature.setStyle(highlightStyle);
        } else {
          this.differenceCollection.splice(selIndex, 1);

          feature.setStyle(undefined);
        }

        if (this.differenceCollection.length > 2) {
          this.clearDifferenceCollection();
        }
      });
    }

    if (interaction) {
      this.interactionsForMap.push(interaction);

      this.map.addInteraction(interaction);
    }
  }
}
