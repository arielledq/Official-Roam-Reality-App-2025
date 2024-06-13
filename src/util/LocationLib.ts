import * as geolib from 'geolib';

interface LocationPoint {
  latitude: number;
  longitude: number;
}

export const isLocationPointInPolygon = (point: LocationPoint, coords: LocationPoint[]) => {
  return geolib.isPointInPolygon(point, coords);
}

export const getLocationDistance = (start: LocationPoint, end: LocationPoint) => {
  return geolib.getPreciseDistance(start, end, 1);
}

export const getCloseLocationDistance = (start: LocationPoint, end: LocationPoint) => {
  return geolib.getDistance(start, end, 1);
}

export const isLocationPointWithinRadius = (start: LocationPoint, centerPoint: LocationPoint, radius: number) => {
  return geolib.isPointWithinRadius(start, centerPoint, radius);
}

export const findNearestLocationPoint = (point: LocationPoint, coords: LocationPoint[]) => {
  return geolib.findNearest(point, coords);
}

export const orderByDistanceLocationPoint = (point: LocationPoint, coords: LocationPoint[]) => {
  return geolib.orderByDistance(point, coords);
}

export const convertMetersToFeets = (meters: number) => {
  return Math.round(meters * 3.28084);
}