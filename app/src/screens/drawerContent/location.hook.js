import {useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import Geolocation from "react-native-geolocation-service";
import {hasLocationPermission} from "../../util/LocationLib";
import {updateUserLocationData} from "../../redux/Login";
import {updateARSiteLocation, updateUserLocation} from "../../network";
import {USER_TYPES} from "../../constants";

const GET_LOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

const WATCH_POSITION_CONFIG = {
  ...GET_LOCATION_CONFIG,
  maximumAge: 5000,
  distanceFilter: 5,
  interval: 10000,
};

const userLocationHook = () => {
  const [loading, setLoading] = useState(false);
  const [initialUserLocation, setInitialUserLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const userData = useSelector(state => state?.login?.data);
  const userType = userData?.user?.type || 0;
  const siteId = userData?.user?.geo_site || 0;

  const dispatch = useDispatch();

  const userLocation = userData?.user?.user_ar_profile?.current_location?.coordinates;
  const locationIsEnabled = !!userLocation?.length;

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      return;
    }
    setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const coords = {
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
        };
        setInitialUserLocation(coords);
        setLoading(false);
      },
      error => {
        console.error(
          `[${new Date().toLocaleTimeString()}] [location.hook] Geolocation.getCurrentPosition error callback (getLocation) - Loading state before set to FALSE: ${loading}`,
          error
        );
        setLoading(false);
        clearLocation();
      },
      GET_LOCATION_CONFIG
    );
  };

  const watchLocation = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      return;
    }
    setLoading(true);

    Geolocation.watchPosition(
      position => {
        const coords = {
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
        };
        updateUserLocationAPI(coords);
        setLoading(false);
      },
      error => {
        console.error(
          `[${new Date().toLocaleTimeString()}] [location.hook] Geolocation.watchPosition error callback (WATCH_POSITION_CONFIG) - Loading state before set to FALSE: ${loading}`,
          error
        );
        setLoading(false);
        clearLocation();
      },
      WATCH_POSITION_CONFIG
    );
  };

  const toggleUserLocation = () => {
    if (locationIsEnabled) {
      clearLocation();
    } else {
      watchLocation();
    }
  };

  const updatePlayerUserLocationAPI = (latitude, longitude) => {
    updateUserLocation({latitude, longitude});
    dispatch(updateUserLocationData({latitude, longitude}));
  };

  const clearPlayerUserLocation = () => {
    updateUserLocation({latitude: null, longitude: null});
    dispatch(updateUserLocationData());
  };

  const updateBandUserLocationAPI = (latitude, longitude) => {
    updateARSiteLocation(siteId, latitude, longitude);
    dispatch(updateUserLocationData({latitude, longitude}));
  };

  const clearBandUserLocation = () => {
    updateARSiteLocation(siteId);
    dispatch(updateUserLocationData());
  };

  const updateUserLocationAPI = async ({latitude, longitude}) => {
    if (!isNaN(latitude) && !isNaN(longitude)) {
      try {
        switch (userType) {
          case USER_TYPES.BAND:
            updateBandUserLocationAPI(latitude, longitude);
            break;

          default:
            updatePlayerUserLocationAPI(latitude, longitude);
            break;
        }
      } catch (error) {
        clearLocation();
        console.error("[location.hook] updateUserLocationAPI error", error);
      }
    } else {
      clearLocation();
      console.error("[location.hook] location is not a number", {latitude, longitude});
    }
  };

  const clearLocation = () => {
    switch (userType) {
      case USER_TYPES.BAND:
        clearBandUserLocation();
        break;

      default:
        clearPlayerUserLocation();
        break;
    }
    Geolocation.stopObserving();
  };

  return {
    initialUserLocation,
    loading,
    userLocation,
    locationIsEnabled,
    toggleUserLocation,
    getLocation,
  };
};

export default userLocationHook;
