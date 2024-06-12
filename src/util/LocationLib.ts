import * as geolib from 'geolib';

interface LocationPoint {
  latitude: number;
  longitude: number;
}

export const isLocationPointInPolygon = (point: LocationPoint, points: LocationPoint[]) => {
  geolib.isPointInPolygon(point, points);
}

export const getLocationDistance = (start: LocationPoint, end: LocationPoint) => {
  geolib.getPreciseDistance(start, end, 1);
}

export const isLocationPointWithinRadius = (start: LocationPoint, centerPoint: LocationPoint, radius: number) => {
  geolib.isPointWithinRadius(start, centerPoint, radius);
}
