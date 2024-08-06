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

@Injectable()
export class MapService {
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
      case 'difference':
        return new Select({
          layers: [layer],
        });
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

  isCollectionHasFeature(differenceCollection: Feature[], featureType: string) {
    return differenceCollection.some((feature) => {
      return feature.getGeometry()?.getType() === featureType;
    });
  }
  makeDifference(
    differenceCollection: Feature[],
    layer: VectorLayer,
    cleanFuntionForCollection: () => void
  ) {
    const turfPolygons = this.makeTurfPolygons(differenceCollection, layer);
    this.makeDifferenceBetweenTurfPolygons(
      turfPolygons,
      layer,
      cleanFuntionForCollection
    );
  }
  makeDifferenceBetweenTurfPolygons(
    turfPolygons: ReturnType<typeof polygon>[],
    layer: VectorLayer,
    cleanFuntionForCollection: () => void
  ) {
    const differenceads = difference(featureCollection(turfPolygons));
    const feature = new formatGeoJSON().readFeature(differenceads);
    cleanFuntionForCollection();
    layer.getSource()?.addFeature(feature);
  }
  makeTurfPolygons(differenceCollection: Feature[], layer: VectorLayer) {
    return differenceCollection.map((feature) => {
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
