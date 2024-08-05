import { Injectable } from '@angular/core';
import { Extent, getArea, getCenter, getHeight, getWidth } from 'ol/extent';
import { Geometry, LineString, Point, Polygon } from 'ol/geom';

@Injectable()
export class MapService {
  calculateCenter(origGeometry: Geometry) {
    let center, coordinates, minRadius;
    const type = origGeometry.getType();
    if (type === 'Polygon') {
      const geometry = origGeometry as Polygon;
      let x = 0;
      let y = 0;
      let i = 0;
      coordinates = geometry.getCoordinates()[0].slice(1);
      coordinates.forEach(function (coordinate) {
        x += coordinate[0];
        y += coordinate[1];
        i++;
      });
      center = [x / i, y / i];
    } else if (type === 'LineString') {
      const geometry = origGeometry as LineString;

      center = geometry.getCoordinateAt(0.5);
      coordinates = geometry.getCoordinates();
    } else {
      const geometry = origGeometry as Point;
      center = getCenter(geometry.getExtent());
    }
    let sqDistances;
    if (coordinates) {
      sqDistances = coordinates.map(function (coordinate) {
        const dx = coordinate[0] - center[0];
        const dy = coordinate[1] - center[1];
        return dx * dx + dy * dy;
      });
      //?? minRadius = Math.sqrt(Math.max.apply(Math, sqDistances)) / 3;
      minRadius = Math.sqrt(Math.max(...sqDistances)) / 3;
    } else {
      minRadius =
        Math.max(
          getWidth(origGeometry.getExtent()),
          getHeight(origGeometry.getExtent())
        ) / 3;
    }
    return {
      center: center,
      coordinates: coordinates,
      minRadius: minRadius,
      sqDistances: sqDistances,
    };
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
}
