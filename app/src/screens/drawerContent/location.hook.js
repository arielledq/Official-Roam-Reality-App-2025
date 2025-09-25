import {useEffect, useRef, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import Geolocation from "react-native-geolocation-service";
import {hasLocationPermission} from "../../util/LocationLib";
import {updateUserLocationData} from "../../redux/Login";
import {updateARSiteLocation, updateUserLocation} from "../../network";
import {USER_TYPES} from "../../constants";

const GET_LOCATION_CONFIG = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 15000,
};

const WATCH_POSITION_CONFIG = {
    ...GET_LOCATION_CONFIG,
    distanceFilter: 1,
    interval: 10000,
};

const userLocationHook = () => {
    const [loading, setLoading] = useState(false);
    const [initialUserLocation, setInitialUserLocation] = useState({
        latitude: null,
        longitude: null,
    });
    const [locationIsEnabled, setLocationIsEnabled] = useState(false);
    const watchIdRef = useRef(null);
    const lastCoordsRef = useRef(null);
    const userData = useSelector(state => state?.login?.data);
    const userType = userData?.user?.type || 0;
    const siteId = userData?.user?.geo_site || 0;
    const dispatch = useDispatch();
    const lastCallRef = useRef(0);
    const THROTTLE_DELAY = 7000; // 15 seconds in milliseconds
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

    const watchPositionPromise = () => {
        return new Promise((resolve, reject) => {
            Geolocation.watchPosition(
                position => {
                    const coords = {
                        latitude: position?.coords?.latitude,
                        longitude: position?.coords?.longitude,
                    };
                    resolve(coords)
                },
                error => {
                    reject(error);
                },
                WATCH_POSITION_CONFIG
            );
        })
    }
    const watchLocation = async () => {
        const hasPermission = await hasLocationPermission();
        if (!hasPermission) {
            return;
        }
        setLoading(true);
        try {
            const coords = await watchPositionPromise()
            updateUserLocationAPI(coords);
        } catch (error) {
            console.log(error)
            clearLocation();
        } finally {
            setLoading(false)
        }
    };

    const toggleUserLocation = () => {
        const now = new Date().getTime();
        if (now - lastCallRef.current < THROTTLE_DELAY) {
            return;
        }
        lastCallRef.current = now;
        if (locationIsEnabled) {
            clearLocation();
        } else {
            watchLocation();
        }
    };

    const updatePlayerUserLocationAPI = (latitude, longitude) => {
        try{
            const rsp = updateUserLocation({latitude, longitude});
            setLocationIsEnabled(true)
        } catch (error) {
            setLocationIsEnabled(false)
        }
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
                console.error("[location.hook] updateUserLocationAPI error", error);
                clearLocation();
            }
        } else {
            console.error("[location.hook] location is not a number", {latitude, longitude});
            clearLocation();
        }
    };

    const clearLocation = () => {
        setLocationIsEnabled(false)
        Geolocation.stopObserving();
        switch (userType) {
            case USER_TYPES.BAND:
                clearBandUserLocation();
                break;

            default:
                clearPlayerUserLocation();
                break;
        }
    };

    return {
        initialUserLocation,
        loading,
        locationIsEnabled,
        toggleUserLocation,
        getLocation,
    };
};

export default userLocationHook;
