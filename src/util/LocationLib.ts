import * as geolib from 'geolib';
import { Alert, Linking, PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
var merc = require('mercator-projection');

interface LocationPoint {
  latitude: number;
  longitude: number;
}

export const getCenterOfBounds = (coords: LocationPoint[]) => {
  return geolib.getCenterOfBounds(coords);
}

export const getBounds = (coords: LocationPoint[]) => {
  return geolib.getBounds(coords);
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

export const converLatLongToXZ = (point: LocationPoint) => {
  var xy = merc.fromLatLngToPoint({ lat: point.latitude, lng: point.longitude });
  return xy
}

export const converXZToLatLong = (x: Number, y: Number) => {
  var ll = merc.fromPointToLatLng({ x: x, y: y })
  return ll
}

const latLongToMerc = (latDeg: any,  longDeg: any) => {
  // From: https://gist.github.com/scaraveos/5409402 
  const longRad = (longDeg / 180.0) * Math.PI;
  const latRad = (latDeg / 180.0) * Math.PI;
  const smA = 6378137.0;
  const xmeters = smA * longRad;
  const ymeters = smA * Math.log((Math.sin(latRad) + 1) / Math.cos(latRad));
  return { x: xmeters, y: ymeters };
}

export const transformGpsToAR = (devicePoint: LocationPoint, objPoint: LocationPoint, compassHeading  : any ) => {
  const isAndroid = Platform.OS === 'android';
  const latObj    = objPoint.latitude;
  const longObj   = objPoint.longitude;
  const latMobile = devicePoint.latitude;
  const longMobile = devicePoint.longitude;

  const deviceObjPoint = latLongToMerc(latObj, longObj);
  const mobilePoint = latLongToMerc(latMobile, longMobile);
  const objDeltaY = deviceObjPoint.y - mobilePoint.y;
  const objDeltaX = deviceObjPoint.x - mobilePoint.x;

  if (isAndroid) {
    let degree      = compassHeading;
    let angleRadian = (degree * Math.PI) / 180;
    let newObjX     = objDeltaX * Math.cos(angleRadian) - objDeltaY * Math.sin(angleRadian);
    let newObjY     = objDeltaX * Math.sin(angleRadian) + objDeltaY * Math.cos(angleRadian);
    return { x: newObjX, z: -newObjY };
  }

  return { x: objDeltaX, z: -objDeltaY };
};


const hasPermissionIOS = async () => {
  const openSetting = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Unable to open settings');
    });
  };
  const status = await Geolocation.requestAuthorization('whenInUse');

  if (status === 'granted') {
    return true;
  }

  if (status === 'denied') {
    Alert.alert('Location permission denied');
  }

  if (status === 'disabled') {
    Alert.alert(
      `Turn on Location Services to allow to determine your location.`,
      '',
      [
        { text: 'Go to Settings', onPress: openSetting },
        { text: "Don't Use Location", onPress: () => { } },
      ],
    );
  }

  return false;
};

export const hasLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    const hasPermission = await hasPermissionIOS();
    return hasPermission;
  }

  if (Platform.OS === 'android' && Platform.Version < 23) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
    ToastAndroid.show(
      'Location permission denied by user.',
      ToastAndroid.LONG,
    );
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    ToastAndroid.show(
      'Location permission revoked by user.',
      ToastAndroid.LONG,
    );
  }
  return false;
};