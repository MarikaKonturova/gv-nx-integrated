import { Coordinate } from 'ol/coordinate';
import { Geometry } from 'ol/geom';

export interface ModifyGeometry {
  center: Coordinate;
  geometry: Geometry;
  geometry0: Geometry;
  minRadius: number;
  point: Coordinate[];
}
