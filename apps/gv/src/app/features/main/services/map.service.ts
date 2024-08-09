import { Injectable } from '@angular/core';
import { difference, featureCollection, polygon } from '@turf/turf';
import { Feature } from 'ol';
import Transform from 'ol-ext/interaction/Transform';
import { Extent, getArea } from 'ol/extent';
import formatGeoJSON from 'ol/format/GeoJSON';
import { Circle, Polygon } from 'ol/geom';
import { Type } from 'ol/geom/Geometry';
import { fromCircle } from 'ol/geom/Polygon';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
const highlightStyle = new Style({
  fill: new Fill({
    color: '#EEE',
  }),
  stroke: new Stroke({
    color: '#3399CC',
    width: 2,
  }),
});

@Injectable()
export class MapService {
  differenceCollection: Feature[] = [];
  clearDifferenceCollection() {
    this.differenceCollection.forEach(feature => {
      feature.setStyle(undefined);
    });

    this.differenceCollection = [];
  }
  formatArea(polygon: Extent) {
    const area = getArea(polygon);
    let output;

    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km\u00B2';
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm\u00B2';
    }

    return output;
  }
  getInteraction(
    layer: VectorLayer,
    source: VectorSource,
    geometryType: Type,
    interactionType: string
  ) {
    switch (interactionType) {
      case 'difference': {
        const select = new Select({
          layers: [layer],
        });

        select.getFeatures().on('add', e => {
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

        return select;
      }

      case 'draw':
        return new Draw({
          source: source,
          type: geometryType,
        });
      case 'modify':
        return new Modify({
          source: source,
        });
      case 'trasform':
        return new Transform({
          enableRotatedTransform: false,
          features: source.getFeaturesCollection() || undefined,
          layers: [layer],
          rotate: true,
          scale: true,
          stretch: true,
          translate: true,
          translateFeature: false,
        });
      default:
        return null;
    }
  }

  isCollectionHasFeature(featureType: string) {
    return this.differenceCollection.some(feature => {
      return feature.getGeometry()?.getType() === featureType;
    });
  }
  makeDifference(layer: VectorLayer) {
    const turfPolygons = this.makeTurfPolygons(layer);

    this.makeDifferenceBetweenTurfPolygons(turfPolygons, layer);
  }
  makeDifferenceBetweenTurfPolygons(
    turfPolygons: ReturnType<typeof polygon>[],
    layer: VectorLayer
  ) {
    const differenceads = difference(featureCollection(turfPolygons));
    const feature = new formatGeoJSON().readFeature(differenceads);

    this.clearDifferenceCollection();

    layer.getSource()?.addFeature(feature);
  }
  makeTurfPolygons(layer: VectorLayer) {
    return this.differenceCollection.map(feature => {
      layer.getSource()?.removeFeature(feature);
      const geometry = feature.getGeometry();

      if (geometry?.getType() === 'Circle') {
        const polygonGeom = fromCircle(geometry as Circle);

        return polygon(polygonGeom.getCoordinates());
      }

      return polygon((geometry as Polygon)?.getCoordinates());
    });
  }
}
