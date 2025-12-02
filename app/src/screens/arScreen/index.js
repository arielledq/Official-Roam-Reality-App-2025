import React, {useEffect, useRef, useState, useCallback} from "react";
import {Platform, View, ActivityIndicator, Text, TouchableOpacity} from "react-native";

import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {requestMultiple, PERMISSIONS} from "react-native-permissions";
import RNFetchBlob from "rn-fetch-blob";
import {useSelector, useDispatch} from "react-redux";
import RNFS from "react-native-fs";
import Sound from "react-native-sound";
import Geolocation from "react-native-geolocation-service";

import {
  AR_MODE_MESSAGES,
  AR_MODES_MENU,
  CAPTURE_CHALLENGE_TYPE,
  CHALLENGES_TYPE,
} from "../../constants";

import UnityARCamera from "components/UnityArView";
import ChallengeScreen from "components/ChallengeScreen";
import ARModeModal from "components/ARModeModal/index.tsx";
import UnityHeader from "components/UnityHeader";
import UnityBottomBar from "components/UnityBottomBar";
import SideMenu from "components/SideMenu";
import ARMapView from "components/ARMapComponent/ARMapView";
import {copyFileForDisplay, eraseFile, handleUnzipProcess, showMessage} from "../../util/helpers";

import {
  getArHuntExamples,
  getArScanExamples,
  getAvailableARModes,
  getElevationAPI,
  starFoundAndSaveApi,
} from "../../network";

import NotificationModal from "components/ARModeModal/NotificationModal";
import {AR_MODES} from "constants";
import CameraControls from "components/CameraControls";
import {ELEMENTSUNITY} from "../../constants";
import Toast from "react-native-toast-message";
import text from "components/text";
import {Button} from "react-native-paper";
import ViewInfoModal from "components/ViewInfoModal";
import ViewInfoButton from "components/ViewInfoButton";
import {
  convertMetersToFeets,
  findNearestLocationPoint,
  getLocationDistance,
  isLocationPointInPolygon,
} from "util/LocationLib";
import useArScreenHook from "../../hooks/useArScreenHook";
import {title} from "process";
import {useIsFocused} from "@react-navigation/native";
import theme from "assets/theme";
import ARModeSiteList from "components/ARModeModal/ARModeSiteList";
import {FontSizes} from "util/FontUtils";
import {setHideBottomBar} from "../../redux/AR";

const ARScreen = ({route}) => {
  const dispatch = useDispatch();
  const destinationData = useSelector(state => state.ar.destinationData);
  const [modeLabel, setModeLabel] = useState(null);
  const [screentitle, setSceenTitle] = useState(AR_MODE_MESSAGES.deafultView);
  const {getNextStar: getNextStarApi} = useArScreenHook();
  const selectedDestination = useSelector(state => state.ar);
  const [textLoading, setTextLoading] = useState("Loading AR Experience");
  const [openModalARMode, setOpenModalARMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const starChallengeObj = selectedDestination.starChallenge;
  const challengeObjParameters = selectedDestination.geo_ar_star?.geo_site?.pin_challenge;
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMode, setNotificationMode] = useState("scan");
  const [selectedSite, setSelectedSite] = useState(null);
  const navigation = useNavigation();
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentMode, setCurrentMode] = useState(null);
  const [challengeInformationView, setChallengeInformationView] = useState(false);

  const lastSentLocationRef = useRef(null);
  const viewShotRef = useRef();
  const isFocusedRef = useRef(false);

  // Unity states + Hooks
  const [isUnityLoaded, setIsUnityLoaded] = useState(true);
  const [shouldRenderUnity, setShouldRenderUnity] = useState(true); // Controla la visibilidad y carga de Unity
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [starModels, setStarModels] = useState();
  const [processingMedia, setProcessingMedia] = useState(false);
  const [textureBase, setTextureBase] = useState();
  const [textureEmission, setTextureEmission] = useState();
  const [modelResource, setModelResource] = useState();
  const [threshold, setThreshold] = useState(0);
  const [intensity, setIntensity] = useState(1);
  const [selectedChallengeOverride, setSelectedChallengeOverride] = useState(null);
  const [sendSpawnModelData, setSendSpawnModelData] = useState(false);
  const [unityLoading, setUnityLoading] = useState(true); // Nuevo estado para el loading de Unity al volver
  const [hasSentModelDataOnce, setHasSentModelDataOnce] = useState(false);
  const [locationObtainedForHunt, setLocationObtainedForHunt] = useState(false);
  const [unitySceneLoaded, setUnitySceneLoaded] = useState(true);
  const [validUserLocation, setValidUserLocation] = useState(null);
  const unityRef = useRef(null);
  const [infoText, setInfoText] = useState("");
  // Challenge derived states
  const challengeObj = selectedChallengeOverride;
  const isHuntMode = selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE;
  const isGeoTagMode = selectedSite?.selectedMode?.mode === AR_MODES.GEO_TAG_MODE;
  const isScanMode = selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE;
  const modelFile =
    challengeObj?.model_file ||
    selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.pin_challenge?.model_file;
  const challengeHasFilters = selectedSite?.ar_filters?.length > 0;

  const initialCheckDoneRef = useRef(false);
  const [modal, setModal] = useState(true);

  // const huntChallenge = TEST_HUNT_CHALLENGE;
  const [huntChallenge, setHuntChallenge] = useState(route?.params?.huntChallenge);
  // const huntChallenge = route.params?.huntChallenge;
  const huntChallengeFinished = route.params?.huntChallengeFinished;
  const isContinuingHuntChallenge = !!huntChallenge;

  const [continueHuntChallenge, setContinuingHuntChallenge] = useState(false);

  const [bundleFile, setBundleFile] = useState(null);
  const SCENE_NAME = "ARReactNative 1"; // tu escena
  const [sceneIsReady, setSceneIsReady] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const reloadLastModeRef = useRef(null);
  const bundleRequestedRef = useRef(false);
  const [distanceInFeet, setDistanceInFeet] = useState(0);
  const [isMeInsideInSite, setIsMeInsideInSite] = useState(false);
  const shouldRun3DFlow = mode => {
    if (!mode) return false;
    if (mode === AR_MODES.HUNT_MODE) return true;
    if (mode === AR_MODES.SCAN_MODE)
      return (
        !!selectedSite?.scanChallenge?.file_animation_android ||
        !!selectedSite?.scanChallenge?.file_animation_ios
      ); // solo si hay 3D
    return false; // GEO doesn't enter here (handled separately)
  };
  const [loading, setLoading] = useState(false);
  const [spawnHeight, setSpawnHeight] = useState(1);
  const [heightReady, setHeightReady] = useState(false);
  // espera breve tras sceneLoaded antes de enviar datos (ajustable)
  const AFTER_SCENE_COOLDOWN_MS = 400;
  const sendFlowTimerRef = useRef(null); // timer del orquestador
  const sceneCycleRef = useRef(0);
  const sendBundleTimerRef = useRef(null);
  const loadArContentSentRef = useRef(false);
  const isFocused = useIsFocused();
  const challenge_type_value =
    selectedSite?.selectedMode?.mode === AR_MODES.GEO_TAG_MODE
      ? CHALLENGES_TYPE.PIN_CHECK_IN
      : null;
  const huntParameters = isHuntMode
    ? selectedSite?.ar_star?.parameters
    : selectedSite?.huntChallenge?.geo_ar_star?.challenges?.parameters ||
      selectedSite?.pin_challenge?.parameters;
  const showNotificationTimerRef = useRef(null);

  // Unity Header states
  const [selectedHeaderMode, setSelectedHeaderMode] = useState("Live");
  const [showOverlay, setShowOverlay] = useState(false);

  // Side Menu states
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);

  // Hide tab bar when screen is focused

  useEffect(() => {
    if (isFocused && unityRef.current) {
      getAvailableModes();
      setSelectedMode(null);
      setSceenTitle(AR_MODE_MESSAGES.deafultView);
      setSelectedHeaderMode("Live");
      setShowOverlay(false);
      setIsSideMenuVisible(false);
    }
  }, [isFocused, unityRef.current]);

  useEffect(() => {
    if (selectedSite && isFocused && unityRef.current) {
      const currentMode = selectedSite.selectedMode.mode;

      if (currentMode == AR_MODES.HUNT_MODE) {
        const starHuntChallenge = selectedSite?.huntChallenge?.screen_title || "AR Hunt Challenge";
        // setSceenTitle(starHuntChallenge);
        setModeLabel("Hunt Mode");
        setSelectedMode(AR_MODES_MENU[2]);
      } else if (currentMode == AR_MODES.GEO_TAG_MODE) {
        setSelectedMode(AR_MODES_MENU[0]);
      } else if (currentMode == AR_MODES.SCAN_MODE) {
        setModeLabel("Scan Mode");
        // setSceenTitle(selectedSite.scanChallenge.screen_title || "AR Challenge");
        setSelectedMode(AR_MODES_MENU[1]);
      }
    } else {
      console.log("Resetting mode label to default");
      setModeLabel("Mode");
    }
  }, [selectedSite, isFocused, unityRef.current]);

  const getAvailableModes = async () => {
    try {
      let response = await getAvailableARModes();

      // Check if the response is successful
      if (response?.status === 1) {
      } else {
        console.error("API Error:", response?.message || response?.error);
        showMessage("Failed to fetch available AR modes.", "error");
      }
    } catch (error) {
      console.error("Network Error:", error);
      showMessage("Failed to fetch available AR modes.", "error");
    }
  };

  const checkPermission = () => {
    if (Platform.OS === "android") {
      requestMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ]);
    } else if (Platform.OS === "ios") {
      requestMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MICROPHONE,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
      ]);
    }
  };

  const downloadModelFile = (sourcePath, targetPath) => {
    setTextLoading("Downloading AR model...");
    RNFetchBlob.config({
      fileCache: true,
      path: sourcePath,
    })
      .fetch("GET", modelFile)
      .then(res => {
        unzipModelFile(res.path(), targetPath);
      })
      .catch(console.error);
  };

  const unzipModelFile = async (sourcePath, targetPath) => {
    setTextLoading("Unzipping AR model...");
    const extractedData = {
      success: true,
      objFile: "travelApp/models/star.obj",
      mtlFile: " travelApp/models/star.mtl",
      baseTexture: "travelApp/models/star_base.png",
      emissionTexture: "travelApp/models/star_emission.png",
    };

    if (extractedData.success) {
      setStarModels(extractedData.objFile);
      setModelResource(extractedData.mtlFile);
      setTextureBase(extractedData.baseTexture);
      setTextureEmission(extractedData.emissionTexture);
      setTextLoading("Loading AR Experience...");
      setUnitySceneLoaded(false);
    } else {
      console.error("Failed to unzip model file:", extractedData.error);
      setModelResource(null);
      setTextureBase(null);
      setTextureEmission(null);
    }
  };

  const checkIfModelExist = () => {
    if (!modelFile) return;

    const filename = modelFile.split("/").pop().split("?")[0];
    const withoutExtFilename = filename.split(".")[0];
    const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
    const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;

    RNFS.exists(targetPath)
      .then(async unzipped => {
        if (unzipped) {
          setTextLoading("Loading AR Experience...");
          setUnitySceneLoaded(false);
          await unzipModelFile(sourcePath, targetPath);
          return;
        }

        RNFS.exists(sourcePath).then(exists => {
          if (exists) {
            setTextLoading("Unzipping AR model...");
            unzipModelFile(sourcePath, targetPath);
          } else {
            setTextLoading("Downloading AR model...");
            downloadModelFile(sourcePath, targetPath);
          }
        });
      })
      .catch(console.error);
  };

  const playCameraSound = () => {
    Sound.setCategory("Playback");
    let cameraSound = new Sound(
      Platform.OS === "android" ? "camerasound.mp3" : "camera-sound.mp3",
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.error("failed to load the sound", error);
        } else {
          cameraSound.play();
        }
      }
    );
  };

  const takeScreenshot = async () => {
    playCameraSound();

    if (unityRef?.current) {
      unityRef.current.postMessage("ScreenCapture", "CaptureScreenshotFromReact", "");

      const basePath =
        Platform.OS === "android"
          ? "/storage/emulated/0/Android/data/com.roam_reality/files/"
          : RNFS.DocumentDirectoryPath;

      setProcessingMedia(true);

      setTimeout(() => {
        RNFS.readDir(basePath)
          .then(files => {
            console.info("Archivos encontrados en el directorio:", files);

            if (Array.isArray(files) && files.length > 0) {
              const foundFile = files.find(
                file =>
                  file.isFile() && file.name.includes("screenshot") && file.name.endsWith(".png")
              );

              if (foundFile) {
                console.info("CAPTURA DE PANTALLA ENCONTRADA:", foundFile);
                setCapturedImage(foundFile.path);
                setShouldRenderUnity(false);
              } else {
                console.error("No .png file found in the directory.");
              }
            } else {
              console.error("The directory is empty or 'files' is not a valid array.");
            }
          })
          .catch(err => {
            console.error("Error leyendo el directorio:", err);
          })
          .finally(() => {
            setProcessingMedia(false);
          });
      }, 2000);
    }
  };

  const onDonePress = () => {
    navigation.navigate({
      name: "ArChallengeShare",
      params: {
        challengeObj: starChallengeObj,
        captureData: capturedImage,
        challengeType: CHALLENGES_TYPE.STAR,
      },
    });
  };

  const updateUnityLocation = location => {
    if (unityRef?.current) {
      if (location.latitude && location.longitude) {
        const jsonData = JSON.stringify({
          latitude: location?.latitude,
          longitude: location?.longitude,
          accuracy: location?.accuracy,
          scaleFactor: 1,
          smoothingFactor: 5,
        });
        unityRef.current.postMessage("ObjectSpawner", "SetUserLocationFromReact", jsonData);
      }
    }
  };

  const getActiveBorderCoords = () => {
    const mode = selectedSite?.selectedMode?.mode;

    if (mode === AR_MODES.HUNT_MODE) {
      return (
        selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.geo_site_border?.coordinates || null
      );
    }

    if (mode === AR_MODES.GEO_TAG_MODE) {
      return selectedSite?.geo_site_border?.coordinates || null;
    }

    return null;
  };

  const toCoordsWrapper = loc => ({coords: {latitude: loc?.latitude, longitude: loc?.longitude}});
  const isCurrentLocationIsInArea = (lat, lon) => {
    const border = getActiveBorderCoords();
    if (!border || lat == null || lon == null) {
      setIsMeInsideInSite(false);
      return false;
    }
    const outer = border[0];
    if (!outer || !outer.length) {
      setIsMeInsideInSite(false);
      return false;
    }
    const ring = outer.map(p => ({latitude: p[1], longitude: p[0]}));
    const inside = isLocationPointInPolygon({latitude: lat, longitude: lon}, ring);
    setIsMeInsideInSite(inside);
    return inside;
  };

  const findNearPoint = (lat, lon) => {
    const border = getActiveBorderCoords();
    if (!border || lat == null || lon == null) {
      setDistanceInFeet(0);
      return;
    }
    const arrayPoints = border.flat().map(p => ({latitude: p[1], longitude: p[0]}));
    const nearestPoint = findNearestLocationPoint({latitude: lat, longitude: lon}, arrayPoints);
    const distance = getLocationDistance({latitude: lat, longitude: lon}, nearestPoint);
    setDistanceInFeet(convertMetersToFeets(distance));
  };

  const sendBloomValuesToUnity = () => {
    const bloomData = {threshold, intensity};
    if (unityRef.current) {
      unityRef.current.postMessage("PosProcessing", "UpdateBloomValues", JSON.stringify(bloomData));
    }
  };

  const sendModelDataToUnity = () => {
    if (hasSentModelDataOnce) return;
    if (!unityRef.current || !textureBase || !starModels || !validUserLocation) return;
    if (
      unityRef.current &&
      textureBase &&
      starModels &&
      validUserLocation
      // &&
      // !hasSentModelDataOnce &&
      // (isGeoTagMode || isHuntMode ) //TODO Verificar
    ) {
      const huntLike =
        isHuntMode ||
        (isScanMode && !!selectedSite?.scanChallenge?.file_animation_android) ||
        !!selectedSite?.scanChallenge?.file_animation_ios;
      const modelData = {
        objFile: starModels.replace("file://", ""),
        url: selectedChallengeOverride.model_file || "",
        url_android: selectedChallengeOverride?.animationAndroid,
        url_ios: selectedChallengeOverride?.animationIOS,
        title: selectedChallengeOverride.title || "",
        mtlFile: modelResource ? modelResource.replace("file://", "") : "",
        textureBase: textureBase ? textureBase.replace("file://", "") : "",
        textureEmission: textureEmission ? textureEmission.replace("file://", "") : "",
        scale: {
          x: 5,
          y: 5,
          z: 5,
        },
        // rotation: {x: 0, y: 0, z: 0},
        emissionIntensity: parseFloat(selectedChallengeOverride?.parameters?.emission_value) || 1,
        rotationSpeed: 50,
        // rotationSpeed:1,
        scaleSpeed: Number(selectedChallengeOverride?.parameters?.scale_sensitivity) || 0.01,
        // scaleSpeed: 0.1,
        minScale: Number(selectedChallengeOverride?.parameters?.min_pinch_scale) || 1,
        maxScale: Number(selectedChallengeOverride?.parameters?.max_pinch_scale) || 1,
        // minScale: 0.1,
        // maxScale:  10,
        isRotationEnabled: true,
        isVisible: !huntLike, //true
        position: {
          x: parseFloat(selectedChallengeOverride?.parameters?.positionX) || 0,
          y: parseFloat(selectedChallengeOverride?.parameters?.positionY) || 0,
          z: 2 || 0.4,
        },
        distanceCamera: 2,
        isHuntMode: huntLike, //true
        // isHuntMode: true, //true
        // allowScale: huntLike, //true
        allowScale: true, //true
        // allowScale: true
      };

      setTimeout(() => {
        unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));
        setSceenTitle(AR_MODE_MESSAGES.CALIBRATION);
      }, 500);

      // setSendModelData(true);
      unityRef.current.postMessage(
        "OBJImport",
        "SetLoadingVisibility",
        JSON.stringify({isVisible: false})
      );
      setHasSentModelDataOnce(true);
    }
  };

  const sendSpawnData = () => {
    if (!unityRef.current || !hasSentModelDataOnce || sendSpawnModelData) return;
    let config = {
      id: "1",
      latitude: -25.296442, // selectedSite?.scanChallenge?.coordinates[1] , // ||
      longitude: -57.58958, //selectedSite?.scanChallenge?.coordinates[0], //||
      scale: 20,
      // scale: 5,
      rotationSpeed: huntParameters?.rotation_speed,
      height: spawnHeight,
      isVisible: true,
      updateRadius: 14.0,
      isHuntMode: true,
      shouldRotate: true,
    };

    if (selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE) {
      config = {
        ...config,
        latitude: selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.lat_long?.coordinates[1], // ||  -25.296442,
        longitude: selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.lat_long?.coordinates[0], //||  -57.589580,
        height: spawnHeight,
        scale: 20,
        isVisible: true,
        updateRadius: 14.0,
        isHuntMode: true,
        shouldRotate: true,
      };
    }
    if (selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE) {
      config = {
        ...config,
        latitude: selectedSite?.scanChallenge?.coordinates?.coordinates[1], // ||  -25.296442,
        longitude: selectedSite?.scanChallenge?.coordinates?.coordinates[0], //||  -57.589580,
        height: spawnHeight,
        isVisible: true,
        updateRadius: 14.0, // verificar
        isHuntMode: true,
        scale: 20,
        shouldRotate: false,
      };
    }
    const spawnData = {
      objects: [
        {
          ...config,
        },
      ],
    };
    console.log("Spawn Data being sent to Unity:", spawnData);
    unityRef.current.postMessage(
      "ObjectSpawner",
      "SpawnObjectsFromReact",
      JSON.stringify(spawnData)
    );
    setSendSpawnModelData(true);
  };

  const PointsCount = async () => {
    if (unityRef.current && selectedChallengeOverride?.points) {
      const pointData = {
        points: selectedChallengeOverride?.points,
        isPointView: true,
      };
      unityRef.current.postMessage("Scriptposition", "SetVisiblePoint", JSON.stringify(pointData));
    }
  };

  //TODO Pending
  const unityStarsCount = () => {
    if (unityRef?.current && selectedSite?.huntChallenge) {
      const hunt = selectedSite.huntChallenge;

      const total = hunt?.total_stars || 4;
      const captured = hunt?.hunt_captured_stars || 0;

      let capturedThisAttempt = hunt.hunt_captured_stars % hunt.total_stars;
      if (capturedThisAttempt === 0 && hunt.hunt_captured_stars > 0) {
        capturedThisAttempt = hunt.total_stars;
      }

      const displayCaptured = capturedThisAttempt;

      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleStars",
        JSON.stringify({
          stars: `${displayCaptured}/${total}`,
          isStarsView: true,
        })
      );
    }
  };

  useEffect(() => {
    if (modal && !unitySceneLoaded && sceneIsReady && selectedSite === null) {
      setOpenModalARMode(true);
    }
  }, [sceneIsReady, selectedSite, modal]);

  const closeModalARMode = () => {
    setOpenModalARMode(false);
    setIsUnityLoaded(true);
    setShouldRenderUnity(true);
    setUnityLoading(true);
  };

  const resetUnityScene = () => {
    if (unityRef.current) {
      unityRef.current.postMessage("CloseAndReset", "RestartScene");
    }
  };

  const viewInfoButtonHandler = () => {
    setChallengeInformationView(true);
    setIsUnityLoaded(false);
  };

  useEffect(() => {
    if (selectedHeaderMode === "List") {
      setSceenTitle(AR_MODE_MESSAGES.LIST_VIEW);
    }
    if (selectedHeaderMode === "Map") {
      setSceenTitle(AR_MODE_MESSAGES.MAP_VIEW);
    }
    if (selectedHeaderMode === "Live") {
      if (selectedSite) {
        setSceenTitle(AR_MODE_MESSAGES.CALIBRATION);
      } else {
        setSceenTitle(AR_MODE_MESSAGES.deafultView);
      }
    }
  }, [selectedHeaderMode]);

  const closeViewInfoButtonHandler = () => {
    setChallengeInformationView(false);
    setIsUnityLoaded(true);
  };

  // Unity Header handlers
  const handleModeChange = mode => {
    setSelectedHeaderMode(mode);

    // Show overlay for Map and List modes, hide for Live mode
    if (mode === "Map" || mode === "List") {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSideMenuToggle = () => {
    setIsSideMenuVisible(!isSideMenuVisible);
  };

  // Bottom bar handlers
  const handleBottomBarModeSelect = option => {
    console.log("Bottom bar mode selected:", option);
    const label = option?.label || "Mode";

    const ButtonScanMode = label === "Scan Mode";
    const ButtonHuntMode = label === "Hunt Mode";
    const ButtonGeoTagMode = label === "GeoTag Mode";

    if ((ButtonScanMode || ButtonHuntMode || ButtonGeoTagMode) && selectedHeaderMode == "Live") {
      setSelectedHeaderMode("List");
      setShowOverlay(true);
    }

    if (ButtonGeoTagMode) {
      setCurrentMode(AR_MODES.GEO_TAG_MODE);
      setSelectedMode(AR_MODES_MENU[0]);
    }
    if (ButtonHuntMode) {
      setCurrentMode(AR_MODES.HUNT_MODE);
      setSelectedMode(AR_MODES_MENU[2]);
    }
    if (ButtonScanMode) {
      setCurrentMode(AR_MODES.SCAN_MODE);
      setSelectedMode(AR_MODES_MENU[1]);
    }

    // Add your logic here for mode change
    // For example, you might want to call APIs or update Unity state
  };

  const handleMoreInfoPress = () => {
    console.log("More Info pressed");
    // Add your logic here for showing more info
    setChallengeInformationView(true);
  };

  const handleResetARPress = () => {
    console.log("Reset AR pressed");
    // Add your logic here for resetting AR
    // For example, reset Unity state or reload the AR scene
  };

  const handleRefreshPress = () => {
    console.log("Refresh pressed");
    // Add your logic here for refreshing the map or list
  };

  const HIDE_ARROW_MS = 3000;
  const hideArrowTimerRef = useRef(null);

  const setArrowVisible = visible => {
    if (unityRef.current) {
      unityRef.current.postMessage("CompassTester", "SetArrowVisible", visible ? "false" : "true");
    }
  };

  const scheduleHideArrow = () => {
    if (hideArrowTimerRef.current) {
      clearTimeout(hideArrowTimerRef.current);
    }
    hideArrowTimerRef.current = setTimeout(() => {
      setArrowVisible(false);
      if (unityRef.current) {
        // unityRef.current.postMessage("Main Camera", "HideARObject", "");
      }
      hideArrowTimerRef.current = null;
    }, HIDE_ARROW_MS);
  };

  const onObjectDetected = () => {
    setArrowVisible(true);
    scheduleHideArrow();
  };

  useEffect(() => {
    return () => {
      if (hideArrowTimerRef.current) {
        clearTimeout(hideArrowTimerRef.current);
        hideArrowTimerRef.current = null;
      }
    };
  }, []);

  const handleUnityMessage = result => {
    const data = JSON.parse(result.nativeEvent.message);

    const buttonBack = data.backPress;
    const buttonARMode = data?.ARMode;
    const ButtonHuntMode = data?.HuntMode;
    const ButtonScanMode = data?.ScanMode;
    const ButtonGeoTagMode = data?.GeoTagMode;

    let show = [];
    let hide = [];
    if (data?.sceneLoading === true) {
      sceneCycleRef.current += 1;
      setSceneIsReady(false);
      setUnityLoading(true);
      setUnitySceneLoaded(true);
      bundleRequestedRef.current = false;
      loadArContentSentRef.current = false;
    }
    if (data?.objectDetect) {
      if (
        selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE &&
        selectedSite?.scanChallenge?.file_3d
      ) {
        // unityRef.current.postMessage("Main Camera", "ShowARObject", "");
        onObjectDetected();
      }
    }
    if (data.infoButton?.isButton) {
      setChallengeInformationView(data.infoButton?.isButton);
    }
    if (buttonBack) {
      navigation?.goBack();
      if (Platform.OS === "android") {
        setShouldRenderUnity(false);
      }
    }

    if (buttonARMode) {
      setOpenModalARMode(true);
    }
    if (ButtonScanMode || ButtonHuntMode || ButtonGeoTagMode) {
      setSelectedHeaderMode("List");
      setShowOverlay(true);
    }

    if (ButtonGeoTagMode) {
      setCurrentMode(AR_MODES.GEO_TAG_MODE);
      setSelectedMode(AR_MODES_MENU[0]);
    }
    if (ButtonHuntMode) {
      setCurrentMode(AR_MODES.HUNT_MODE);
      setSelectedMode(AR_MODES_MENU[2]);
    }
    if (ButtonScanMode) {
      setCurrentMode(AR_MODES.SCAN_MODE);
      setSelectedMode(AR_MODES_MENU[1]);
    }
    if (
      data?.["Reset-AR"] &&
      (selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE ||
        (selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE &&
          selectedSite?.scanChallenge?.file_3d))
    ) {
      startChallengeHandler(selectedSite);
    }
    if (data?.sceneLoaded && data.sceneName === "ARReactNative") {
      unityRef.current.postMessage("SceneLoader", "LoadSpecificScene", "ARReactNative 1");
    }
    if (data?.sceneLoaded && data.sceneName === "ARReactNative 1") {
      setSceneIsReady(true);
      setUnityLoading(false);
      setUnitySceneLoaded(false);
      if (!selectedSite?.selectedMode?.mode) {
        const show = ["Back", "ArMode"];
        const hide = ELEMENTSUNITY.filter(name => !show.includes(name));
        unityRef.current.postMessage(
          "CanvasController",
          "ShowHideElements",
          JSON.stringify({show, hide})
        );
        unityRef.current.postMessage(
          "ArMode",
          "SetTextArModal",
          JSON.stringify({
            titleARMode: "AR-MODE",
            textlabel: "",
            visibleLabel: false,
          })
        );
      }
    }

    if (data?.touchEvent?.objectTouched === true) {
      // if (
      //   selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE &&
      //   selectedSite?.scanChallenge?.file_3d
      // ) {
      //   let hide = ["Arrow"];
      //   unityRef.current.postMessage(
      //       "CanvasController",
      //       "ShowHideElements",
      //       JSON.stringify({hide})
      //     );
      //   unityRef.current.postMessage("Main Camera", "ShowARObject", "");

      // }
      if (selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE) {
        unityRef.current.postMessage("OBJImport", "SpawnCollectionEffect", "");
        // navigation.navigate({
        //   name: "FunFactsScreen",
        //   params: {
        //     challengeObj: selectedSite,
        //   },
        // });
        handleNextHunt();
      }
    }

    switch (selectedSite?.selectedMode?.mode) {
      case AR_MODES.GEO_TAG_MODE:
        if (!isMeInsideInSite && data?.ispressed) {
          Toast.show({
            type: "info",
            text1: "Geo Challenge Info",
            text2: "You are outside the site area",
          });
        }

        if (data?.photoVideoButton?.isPhoto) {
          setHasSentModelDataOnce(false);
          setCapturedImage(data.photoVideoButton?.filepath);
          setIsUnityLoaded(false);
          setShouldRenderUnity(true);
          setUnitySceneLoaded(false);
          eraseFile();
        }

        if (data?.photoVideoButton?.isPhoto == false) {
          setHasSentModelDataOnce(false);
          setCapturedVideo(data.photoVideoButton?.filepath);
          setIsUnityLoaded(false);
          setShouldRenderUnity(true);
          setUnitySceneLoaded(false);
          eraseFile();
        }
        break;
      case AR_MODES.SCAN_MODE:
        // setSelectedChallengeOverride(null);
        if (data?.photoVideoButton?.isPhoto) {
          setCapturedImage(data.photoVideoButton?.filepath);
          setIsUnityLoaded(false);
          setShouldRenderUnity(true);
          setUnitySceneLoaded(false);
          setSendSpawnModelData(false);
          setHasSentModelDataOnce(false);
          eraseFile();
        }
        if (data?.photoVideoButton?.isPhoto == false) {
          setCapturedVideo(data.photoVideoButton?.filepath);
          setIsUnityLoaded(false);
          setShouldRenderUnity(true);
          setUnitySceneLoaded(false);
          setSendSpawnModelData(false);
          setHasSentModelDataOnce(false);
          eraseFile();
        }
        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: "PHOTOVIDEO",
            arChallenge: true,
            isLocation: false,
          })
        );
        break;
      case AR_MODES.HUNT_MODE:
        // setSelectedChallengeOverride(null);
        break;
      default:
        break;
    }
  };

  const handleNextHunt = async () => {
    const geoSiteId = selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.id;
    const challengeId = selectedSite?.huntChallenge?.geo_ar_star?.id;
    const starPointId = selectedSite?.huntChallenge?.id;
    const lat = selectedSite?.lat_long?.coordinates[1];
    const lon = selectedSite?.lat_long?.coordinates[0];

    try {
      await starFoundAndSaveApi({
        geo_site: geoSiteId,
        geo_ar_star: challengeId,
        geo_ar_star_point: starPointId,
        latitude: lat,
        longitude: lon,
      });

      const nextHunt = await getNextStarApi(geoSiteId, lat, lon);

      if (!nextHunt) {
        return;
      } else {
        const Challenge = {
          ...selectedSite,
          selectedMode: AR_MODES_MENU[2],
          huntChallenge: nextHunt,
          userAttempt: nextHunt.attempt_number,
        };

        setHuntChallenge(Challenge);
        startChallengeHandler(Challenge);
      }
    } catch (error) {
      console.error("Error saving star found:", error);
    }
  };

  const retakeButtonHandler = () => {
    setHasSentModelDataOnce(false);
    setSendSpawnModelData(false);
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsUnityLoaded(true);
    setUnitySceneLoaded(true);
    setSceneIsReady(true);

    // setUnityLoading(false);
    // setShouldRenderUnity(true);

    // sendModelDataToUnity();
  };
  const doneButtonHandler = async () => {
    try {
      const hasFilters = capturedImage && isGeoTagMode;
      let updatedData = capturedImage ? capturedImage : capturedVideo;

      if (hasFilters) {
        try {
          const capturedUri = await viewShotRef.current.capture();
          updatedData = capturedUri;
        } catch (error) {
          console.error("Error capturando la imagen con filtros:", error);
        }
      }

      updatedData = await copyFileForDisplay(updatedData);

      navigation.navigate({
        name: "ArChallengeShare",
        params: {
          challengeObj: selectedSite,
          captureData: updatedData,
          challengeType: selectedSite?.selectedMode?.mode,
        },
      });
    } catch (error) {
      console.error("Error capturando la imagen con filtros:", error);
    }
  };

  const viewInfoModalContent = () => {
    const mode = selectedSite?.selectedMode?.mode;
    if (mode === AR_MODES.SCAN_MODE) {
      return selectedSite?.scanChallenge?.info;
    } else if (mode === AR_MODES.GEO_TAG_MODE) {
      return selectedSite?.pin_challenge?.info;
    } else if (mode === AR_MODES.HUNT_MODE) {
      return selectedSite?.huntChallenge?.geo_ar_star?.info;
    } else {
      return null;
    }
  };

  const modals = (
    <ViewInfoModal
      isVisible={challengeInformationView}
      onClose={closeViewInfoButtonHandler}
      content={viewInfoModalContent()}
      onPressExample={() => {
        setChallengeInformationView(false);
        setIsUnityLoaded(true);
        openExample();
      }}
    />
  );
  const notificationUnity = (title, text) => {
    if (unityRef.current) {
      const data = {
        isNotification: true,
        titleNotification: title,
        textNotification: text,
      };
      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleNotification",
        JSON.stringify(data)
      );
    }
  };

  const startChallengeHandler = async site => {
    let mode = site?.selectedMode?.mode;
    let challengeData = {};
    switch (site?.selectedMode?.mode) {
      case AR_MODES.GEO_TAG_MODE:
        const geoTagChallenge = site?.pin_challenge;
        challengeData = {
          lat_long: site.lat_long,
          challenge_requirement: geoTagChallenge?.challenge_requirement,
          challenge_id: geoTagChallenge?.id,
          model_file: geoTagChallenge?.model_file,
          parameters: geoTagChallenge?.parameters,
          points: geoTagChallenge?.points,
        };
        break;
      case AR_MODES.SCAN_MODE:
        const scanChallenge = site?.scanChallenge;
        challengeData = {
          model_file: scanChallenge?.file_animation_ios || scanChallenge?.file_animation_android,
          animationAndroid: scanChallenge?.file_animation_android,
          animationIOS: scanChallenge?.file_animation_ios,
          lat_long: scanChallenge?.coordinates,
          title: scanChallenge?.screen_title,
          challenge_requirement: site?.pin_challenge?.challenge_requirement,
          arChallenge: true,
          isLocation: false,
          challenge_id: scanChallenge?.id,
          parameters: null,
          points: scanChallenge?.points || 0,
          selectedMode: "Scan",
          setVisibleButtonPosition: false,
        };
        break;
      case AR_MODES.HUNT_MODE:
        const huntChallenge = site?.huntChallenge?.geo_ar_star?.geo_site;
        const starHuntChallenge = site?.huntChallenge;

        challengeData = {
          lat_long: huntChallenge?.lat_long,
          challenge_requirement: huntChallenge?.pin_challenge?.challenge_requirement,
          challenge_id: huntChallenge?.pin_challenge?.id,
          model_file: starHuntChallenge?.model_file,
          animationAndroid: starHuntChallenge?.file_animation_android,
          animationIOS: starHuntChallenge?.file_animation_ios,
          title: starHuntChallenge?.screen_title,
          parameters: huntChallenge?.pin_challenge?.parameters,
          points: huntChallenge?.pin_challenge?.points || 10,
          setVisibleButtonPosition: false,
          arChallenge: false,
          isLocation: true,
        };
        break;
      default:
        break;
    }

    setSelectedHeaderMode("Live");
    setShowOverlay(false);
    // setSceenTitle(challengeData.title || "AR Challenge");

    setStarModels(null);
    setModelResource(null);
    setTextureBase(null);
    setTextureEmission(null);
    setPendingMode(mode);
    setSelectedSite(site);
    setSelectedChallengeOverride(challengeData);
    setHasSentModelDataOnce(false);
    setSendSpawnModelData(false);
    setSceneIsReady(false);
    setUnityLoading(true);
    setUnitySceneLoaded(true);
    closeModalARMode();
    if (unityRef.current) {
      unityRef.current?.postMessage("SceneLoader", "LoadSpecificSceneForce", SCENE_NAME);
    }

    if (showNotificationTimerRef.current) {
      clearTimeout(showNotificationTimerRef.current);
    }

    if (!mode) return;

    showNotificationTimerRef.current = setTimeout(() => {
      if (!isFocusedRef.current) return;
      setShowNotification(true);
      showNotificationTimerRef.current = null;
    }, 1000);
  };

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        if (unityRef.current) {
          unityRef.current.postMessage("SceneLoader", "LoadSpecificScene", "ARReactNative 1");
        }
      }, 500);

      return () => clearTimeout(timeout);
    }, [])
  );

  useEffect(() => {
    if (!sceneIsReady || !unityRef.current) return;

    const mode = pendingMode ?? selectedSite?.selectedMode?.mode;
    if (mode !== AR_MODES.SCAN_MODE) return;

    let bundleURL = "";
    if (Platform.OS === "ios") {
      bundleURL = selectedSite?.scanChallenge?.file_animation_ios || "";
    } else {
      bundleURL = selectedSite?.scanChallenge?.file_animation_android || "";
    }
    if (!bundleURL) return;

    if (loadArContentSentRef.current) return;

    const cycleAtSchedule = sceneCycleRef.current;
    const t = setTimeout(() => {
      if (sceneCycleRef.current !== cycleAtSchedule) return;
      if (!sceneIsReady || !unityRef.current) return;

      const payload = {bundleURL};
      const has3D =
        !!selectedSite?.scanChallenge?.file_animation_android ||
        !!selectedSite?.scanChallenge?.file_animation_ios;

      if (!has3D) {
        const img = selectedSite?.scanChallenge?.file_image || "";
        if (img) payload.localImagePath = img;
      }
      // unityRef.current.postMessage("Main Camera", "LoadARContent", JSON.stringify(payload));
      loadArContentSentRef.current = true;
    }, AFTER_SCENE_COOLDOWN_MS);

    return () => clearTimeout(t);
  }, [
    sceneIsReady,
    pendingMode,
    selectedSite?.selectedMode?.mode,
    selectedSite?.scanChallenge?.file_animation_android,
    selectedSite?.scanChallenge?.file_animation_ios, //TODO Cuando exista
    selectedSite?.scanChallenge?.file_animation_android,
    selectedSite?.scanChallenge?.file_animation_ios,
    selectedSite?.scanChallenge?.file_image,
  ]);

  useEffect(() => {
    if (!unityRef.current || !sceneIsReady) return;

    if (sendFlowTimerRef.current) {
      clearTimeout(sendFlowTimerRef.current);
      sendFlowTimerRef.current = null;
    }

    const cycleAtSchedule = sceneCycleRef.current;

    sendFlowTimerRef.current = setTimeout(() => {
      if (sceneCycleRef.current !== cycleAtSchedule) return;
      if (!unityRef.current || !sceneIsReady) return;

      // unityRef.current.postMessage(
      //   "Main Camera",
      //   "SetDetectObjectState",
      //   JSON.stringify({isDetectionEnabled: true, detectionDistance: 50})
      // );

      const mode = pendingMode ?? selectedSite?.selectedMode?.mode;
      const has3DInScan =
        !!selectedSite?.scanChallenge?.file_animation_android ||
        !!selectedSite?.scanChallenge?.file_animation_ios;

      const run3D = mode === AR_MODES.HUNT_MODE || (mode === AR_MODES.SCAN_MODE && has3DInScan);

      const readyForModel = !!validUserLocation && !!starModels && !!textureBase;

      if (mode === AR_MODES.GEO_TAG_MODE) {
        if (!hasSentModelDataOnce && readyForModel) {
          sendModelDataToUnity();
          sendBloomValuesToUnity();
          unityRef.current.postMessage(
            "screen",
            "SetTypeChallenge",
            JSON.stringify({
              typeChallenge: "PHOTOVIDEO",
              arChallenge: false,
              isLocation: !!isMeInsideInSite,
            })
          );
        }
        return;
      }

      if (run3D) {
        if (!hasSentModelDataOnce && readyForModel) {
          sendModelDataToUnity();
          return;
        }
        if (hasSentModelDataOnce && !sendSpawnModelData && heightReady) {
          sendBloomValuesToUnity();
          unityStarsCount();
          PointsCount();
          sendSpawnData();
          return;
        }
      }
    }, AFTER_SCENE_COOLDOWN_MS);

    return () => {
      if (sendFlowTimerRef.current) {
        clearTimeout(sendFlowTimerRef.current);
        sendFlowTimerRef.current = null;
      }
    };
  }, [
    sceneIsReady,
    pendingMode,
    selectedSite?.selectedMode?.mode,
    validUserLocation,
    starModels,
    textureBase,
    hasSentModelDataOnce,
    sendSpawnModelData,
    heightReady,
  ]);

  // useEffect(() => {
  //   if (!unityRef.current) return;
  //   if (!sceneIsReady) return;
  //   if (selectedSite?.selectedMode?.mode !== AR_MODES.GEO_TAG_MODE) return;
  //   console.log("isMeInsideInSite", isMeInsideInSite)
  //   const messageData = {
  //     typeChallenge: "PHOTO",
  //     arChallenge: false,
  //     isLocation: !!isMeInsideInSite,
  //   };
  //   unityRef.current.postMessage("screen", "SetTypeChallenge", JSON.stringify(messageData));
  //   console.log("messageData", messageData);
  //   if (!isMeInsideInSite) {
  //     const dataNotificationUnity = {
  //       isNotification: true,
  //       textNotification: "Move inside the site area to take a photo",
  //     };
  //     unityRef.current.postMessage(
  //         "Scriptposition",
  //         "SetVisibleNotification",
  //         JSON.stringify(dataNotificationUnity)
  //     );
  //     setTimeout(() => {
  //       if (unityRef.current) {
  //         unityRef.current.postMessage(
  //             "Scriptposition",
  //             "SetVisibleNotification",
  //             JSON.stringify({ ...dataNotificationUnity, isNotification: false })
  //         );
  //       }
  //     }, 3000);
  //   }
  // }, [isMeInsideInSite, sceneIsReady, selectedSite?.selectedMode?.mode]);

  useEffect(() => {
    if (!unityRef.current || !selectedSite?.selectedMode?.mode || !sceneIsReady) return;

    const mode = selectedSite.selectedMode.mode;

    let show = [];
    let hide = [];

    switch (mode) {
      case AR_MODES.GEO_TAG_MODE:
        show = ["Back", "Details", "ArMode", "screen", "position", "points", "loading"];
        hide = ELEMENTSUNITY.filter(name => !show.includes(name));

        unityRef.current.postMessage(
          "CanvasController",
          "ShowHideElements",
          JSON.stringify({show, hide})
        );
        unityRef.current.postMessage(
          "Scriptposition",
          "SetTextReAnchor",
          JSON.stringify({
            titleARMode: "RESET AR",
            textlabel: "",
            visibleLabel: false,
          })
        );

        unityRef.current.postMessage(
          "ArMode",
          "SetTextArModal",
          JSON.stringify({
            titleARMode: "Geo-Tag",
            textlabel: "",
            visibleLabel: false,
          })
        );
        PointsCount();
        break;

      case AR_MODES.SCAN_MODE:
        const distanceDetect = {
          isDetectionEnabled: true,
          detectionDistance: 50,
        };
        // unityRef.current.postMessage(
        //   "Main Camera",
        //   "SetDetectObjectState",
        //   JSON.stringify(distanceDetect)
        // );
        setTimeout(() => {
          // const has3DModel = selectedSite?.scanChallenge?.file_3d;
          show = ["Back", "Details", "ArMode", "screen", "points", "position"];
          hide = ELEMENTSUNITY.filter(name => !show.includes(name));

          unityRef.current.postMessage(
            "CanvasController",
            "ShowHideElements",
            JSON.stringify({show, hide})
          );

          unityRef.current.postMessage(
            "Scriptposition",
            "SetTextReAnchor",
            JSON.stringify({
              titleARMode: "RESET AR",
              textlabel: "",
              visibleLabel: false,
            })
          );

          unityRef.current.postMessage(
            "ArMode",
            "SetTextArModal",
            JSON.stringify({
              titleARMode: "Scan Mode",
              textlabel: "",
              visibleLabel: false,
            })
          );
          PointsCount();
          unityRef.current.postMessage(
            "screen",
            "SetTypeChallenge",
            JSON.stringify({
              typeChallenge: "PHOTOVIDEO",
              arChallenge: true,
              isLocation: false,
            })
          );
        }, 300);

        break;

      case AR_MODES.HUNT_MODE:
        setTimeout(() => {
          show = ["Back", "Details", "ArMode", "Stars", "points", "position"];
          hide = ELEMENTSUNITY.filter(name => !show.includes(name));

          unityRef.current.postMessage(
            "CanvasController",
            "ShowHideElements",
            JSON.stringify({show, hide})
          );
          unityRef.current.postMessage(
            "Scriptposition",
            "SetTextReAnchor",
            JSON.stringify({
              titleARMode: "RESET AR",
              textlabel: "",
              visibleLabel: false,
            })
          );
          unityRef.current.postMessage(
            "ArMode",
            "SetTextArModal",
            JSON.stringify({
              titleARMode: "Hunt Mode",
              textlabel: "",
              visibleLabel: false,
            })
          );
          const distanceDetect = {
            isDetectionEnabled: true,
            detectionDistance: 50,
          };
          // unityRef.current.postMessage(
          //   "Main Camera",
          //   "SetDetectObjectState",
          //   JSON.stringify(distanceDetect)
          // );
          PointsCount();
        }, 1000);
        break;

      default:
        break;
    }
  }, [sceneIsReady, selectedSite?.selectedMode?.mode]);

  //
  // useEffect(() => {
  //   if (!unityRef.current) return;
  //
  //   const timeout = setTimeout(() => {
  //     unityRef.current.postMessage("SceneLoader", "LoadSpecificScene", "ARReactNative 1");
  //   }, 500);
  //
  //   return () => clearTimeout(timeout);
  // }, [unityLoading, isUnityLoaded]);

  useEffect(() => {
    if (challengeObj && modelFile) {
      checkIfModelExist();
    }
  }, [challengeObj, modelFile]);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, heading} = position.coords;

        if (
          position.coords.latitude === 0 ||
          position.coords.longitude === 0 ||
          position.coords.latitude === undefined ||
          position.coords.longitude === undefined
        ) {
          return;
        }
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: heading || 0,
        };
        setUserLocation(newLocation);
        if (
          !validUserLocation &&
          newLocation.latitude &&
          newLocation.longitude &&
          newLocation.latitude !== 0 &&
          newLocation.longitude !== 0
        ) {
          setValidUserLocation(newLocation);
        }

        updateUnityLocation(newLocation);
        lastSentLocationRef.current = newLocation;
        if (selectedSite?.selectedMode?.mode === AR_MODES.GEO_TAG_MODE) {
          const inside = isCurrentLocationIsInArea(latitude, longitude);
          if (!inside) findNearPoint(latitude, longitude);
        }
      },
      error => {},
      {
        accuracy: {
          android: "high",
          ios: "best",
        },
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
      }
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [unityRef, selectedSite]);

  useEffect(() => {
    if (selectedSite) {
      setThreshold(parseFloat(huntParameters?.bloom_threshold) || 0.9);
      setIntensity(parseFloat(huntParameters?.bloom_intensity) || 1);
    }
  }, [selectedSite]);

  useEffect(() => {
    checkPermission();
  }, [selectedChallengeOverride]);

  useEffect(() => {
    if (unityRef.current && isScanMode) {
      const timer = setTimeout(() => {
        PointsCount();

        unityRef.current.postMessage(
          "Scriptposition",
          "SetVisibleButton",
          JSON.stringify({
            setVisibleButtonPosition: selectedChallengeOverride?.setVisibleButtonPosition,
          })
        );

        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: "PHOTOVIDEO",
            arChallenge: selectedChallengeOverride?.arChallenge,
            isLocation: selectedChallengeOverride?.isLocation,
          })
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isUnityLoaded, isScanMode, selectedChallengeOverride]);

  //TODO Check
  useEffect(() => {
    if (isContinuingHuntChallenge && !selectedSite && !unitySceneLoaded) {
      startChallengeHandler(huntChallenge);
    }
  }, [isContinuingHuntChallenge, selectedSite, unitySceneLoaded]);

  // useEffect(() => {
  //   if (huntChallengeFinished) {
  //     Toast.show({
  //       type: "info",
  //       text1: "Hunt Challenge Info",
  //       text2: "You have finished the hunt challenge",
  //     });
  //   }
  // }, [huntChallengeFinished]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        unityRef.current?.resumeUnity();
        unityRef.current?.windowFocusChanged(true);
      }
    }, [isUnityLoaded])
  );

  useEffect(() => {
    if (unityRef.current && !unityLoading && shouldRenderUnity) {
      // const distanceDetect = {
      //   isDetectionEnabled: true,
      //   detectionDistance: 80,
      // };
      // unityRef.current.postMessage(
      //   "Main Camera",
      //   "SetDetectObjectState",
      //   JSON.stringify(distanceDetect)
      // );
      // unityRef.current.postMessage(
      //   "OBJImport",
      //   "SetLoadingVisibility",
      //   JSON.stringify({isVisible: false})
      // );
    }
  }, [isUnityLoaded, unityLoading, shouldRenderUnity]);

  useEffect(() => {
    if (selectedSite?.selectedMode?.mode !== AR_MODES.SCAN_MODE) {
      bundleRequestedRef.current = false;
    }
  }, [selectedSite?.selectedMode?.mode]);

  useFocusEffect(
    useCallback(() => {
      // Hide bottom tab bar when screen is focused
      dispatch(setHideBottomBar(true));

      const timeout = setTimeout(() => {
        if (!unitySceneLoaded) {
          const mode = selectedSite?.selectedMode?.mode;
          setModal(true);
          if (mode === AR_MODES.GEO_TAG_MODE && !hasSentModelDataOnce) {
            sendModelDataToUnity();
            const messageData = {
              typeChallenge: "PHOTOVIDEO",
              arChallenge: false,
              isLocation: !!isMeInsideInSite,
            };
            unityRef.current.postMessage("screen", "SetTypeChallenge", JSON.stringify(messageData));
          }
        }
      }, 1500);
      setModal(true);

      if (isFocusedRef.current) return;

      isFocusedRef.current = true;
      setShouldRenderUnity(true);
      setUnityLoading(true);
      setUnitySceneLoaded(true);

      return () => {
        // Show bottom tab bar when screen is unfocused
        dispatch(setHideBottomBar(false));

        clearTimeout(timeout);
        const mode = selectedSite?.selectedMode?.mode;

        if (mode !== AR_MODES.HUNT_MODE) {
          setValidUserLocation(false);
          setSendSpawnModelData(false);
          setHasSentModelDataOnce(false);
          setTextureBase(false);
          setStarModels(false);
          setCapturedImage(null);
          setCapturedVideo(null);
          setIsUnityLoaded(true);
          setSelectedSite(null);
          setHuntChallenge(null);
          setModal(false);
        }
        if (showNotificationTimerRef.current) {
          clearTimeout(showNotificationTimerRef.current);
          showNotificationTimerRef.current = null;
        }
        setTextureBase(false);
        setStarModels(false);
        setCapturedImage(null);
        setCapturedVideo(null);
        setIsUnityLoaded(true);
        isFocusedRef.current = false;
        setUnitySceneLoaded(false);
        setShouldRenderUnity(false);
        setUnityLoading(false);
        // initialCheckDoneRef.current = false;
        setModal(false);
      };
    }, [])
  );

  useEffect(() => {
    if (!sceneIsReady) return;

    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude, accuracy, heading} = pos.coords || {};

        if (latitude && longitude) {
          const firstLoc = {latitude, longitude, accuracy, heading};
          setUserLocation(firstLoc);
          setValidUserLocation(firstLoc);
          updateUnityLocation(firstLoc);
          lastSentLocationRef.current = firstLoc;
        }
      },
      err => {
        // opcional: log
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [sceneIsReady]);

  useEffect(() => {
    if (loading === true && unityRef.current) {
      unityRef.current.postMessage(
        "OBJImport",
        "SetLoadingVisibility",
        JSON.stringify({isVisible: true})
      );
    }
  }, [loading, unityRef.current]);

  useEffect(() => {
    if (!sceneIsReady || !unityRef.current) return;

    const mode = selectedSite?.selectedMode?.mode;
    if (mode !== AR_MODES.SCAN_MODE) return;

    const has3D =
      !!selectedSite?.scanChallenge?.file_animation_android ||
      !!selectedSite?.scanChallenge?.file_animation_ios;
    if (has3D) return;

    const animUrl = selectedSite?.scanChallenge?.file_animation;
    if (!animUrl) return;

    if (bundleRequestedRef.current) return;
    bundleRequestedRef.current = true;

    // 🔽 your existing function
  }, [sceneIsReady, selectedSite?.selectedMode?.mode, selectedSite?.scanChallenge?.file_animation]);

  // const resetArTest = () => {
  //   let show = ["Back", "Details", "ArMode",];
  //   let hide = ELEMENTSUNITY.filter(name => !show.includes(name));
  //
  //   unityRef.current.postMessage(
  //       "CanvasController",
  //       "ShowHideElements",
  //       JSON.stringify({show, hide})
  //   );
  //   unityRef.current.postMessage(
  //       "ArMode",
  //       "SetTextArModal",
  //       JSON.stringify({titleARMode: "AR MODE", textlabel: " ", visibleLabel: true})
  //   );

  // unityRef.current.postMessage("ARResetController", "ResetARState","");
  //   setSelectedSite(null)
  //   setSelectedChallengeOverride(null)
  //   console.log("se presiono ARTestReset")
  // };

  useEffect(() => {
    const mode = selectedSite?.selectedMode?.mode;

    const has3DInScan =
      !!selectedSite?.scanChallenge?.file_animation_android ||
      !!selectedSite?.scanChallenge?.file_animation_ios;
    const modeSupported =
      mode === AR_MODES.HUNT_MODE || (mode === AR_MODES.SCAN_MODE && has3DInScan);

    if (!modeSupported) {
      setSpawnHeight(1);
      setHeightReady(true);
      return;
    }

    const siteElevation =
      (mode === AR_MODES.HUNT_MODE
        ? selectedSite?.huntChallenge?.elevation ??
          selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.elevation
        : selectedSite?.scanChallenge?.elevation) ?? 0;

    if (!siteElevation || Number(siteElevation) === 0) {
      setSpawnHeight(1);
      setHeightReady(true);
      return;
    }

    if (!userLocation?.latitude || !userLocation?.longitude) {
      setHeightReady(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const {latitude, longitude} = userLocation;

        const res = await getElevationAPI({lat: latitude, lng: longitude});

        const myElevation = typeof res?.elevation === "number" ? res.elevation : null;
        if (cancelled) return;

        if (myElevation == null) {
          setSpawnHeight(1);
          setHeightReady(true);
          return;
        }

        let delta = Math.round(Number(siteElevation - myElevation));

        setSpawnHeight(delta);
        setHeightReady(true);
      } catch (e) {
        setSpawnHeight(1);
        setHeightReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    selectedSite?.selectedMode?.mode,
    selectedSite?.huntChallenge?.elevation,
    selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.elevation,
    selectedSite?.scanChallenge?.elevation,
    selectedSite?.scanChallenge?.file_animation_android,
    selectedSite?.scanChallenge?.file_animation_ios,
    userLocation?.latitude,
    userLocation?.longitude,
  ]);

  useEffect(() => {
    return () => {
      if (showNotificationTimerRef.current) {
        clearTimeout(showNotificationTimerRef.current);
        showNotificationTimerRef.current = null;
      }
    };
  }, []);

  const openExample = async () => {
    if (selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE) {
      try {
        const result = await getArHuntExamples(selectedSite?.ar_star?.id);
        const examples = result?.data;
        const examplesList = examples?.length ? examples[0] : null;
        if (examplesList) {
          navigation.navigate("ChallengeExamples", {examples: examplesList});
        } else {
          showMessage("We are working on adding examples to this challenge.", "info");
        }
      } catch (error) {
        showMessage("Error fetching examples. Please try again later.", "danger");
      }
    }
    if (selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE) {
      try {
        const result = await getArScanExamples(selectedSite?.scanChallenge?.id);
        const examples = result?.data;
        const examplesList = examples?.length ? examples[0] : null;
        if (examplesList) {
          navigation.navigate("ChallengeExamples", {examples: examplesList});
        } else {
          showMessage("We are working on adding examples to this challenge.", "info");
        }
      } catch (error) {
        showMessage("Error fetching examples. Please try again later.", "danger");
      }
    }
  };

  return (
    <View style={{flex: 1}}>
      <ChallengeScreen
        title="AR Star Hunt "
        appHeader={false}
        style={{
          paddingHorizontal: 0,
          paddingBottom: 0,
          flex: 1,
          backgroundColor: "#000",
        }}
        modals={modals}
        // headerRightComponent={<ViewInfoButton onPress={viewInfoButtonHandler} showOnHeader />}
        scrollable={false}
      >
        {shouldRenderUnity && (
          <>
            {/*/TODO TEST BUTTON*/}
            {/*<View style={{position:'absolute', left: 100, top: 250, zIndex:9999 }}>*/}
            {/*<Button*/}
            {/*    mode="contained"*/}
            {/* onPress={resetArTest}*/}
            {/* children={'resetArTest'}>*/}
            {/*</Button>*/}
            {/*</View>*/}

            {/* Unity Header Component */}
            {isUnityLoaded && (
              <UnityHeader
                title={screentitle}
                selectedMode={selectedHeaderMode}
                onModeChange={handleModeChange}
                onBackPress={handleBackPress}
              />
            )}

            {/* Side Menu Component */}
            {isUnityLoaded && selectedSite?.id && selectedHeaderMode != "List" && (
              <SideMenu
                isVisible={isSideMenuVisible}
                onToggle={handleSideMenuToggle}
                selectedSite={selectedMode}
                onPressInfo={() => {
                  setIsSideMenuVisible(false);
                  setChallengeInformationView(true);
                }}
              />
            )}

            <UnityARCamera
              width={"100%"}
              height={"100%"}
              unityRef={unityRef}
              isProcessingMedia={processingMedia}
              onUnityMessage={handleUnityMessage}
              isUnityLoaded={isUnityLoaded}
              capturedImage={capturedImage}
              capturedVideo={capturedVideo}
              // imageFilter={{challengeObj: selectedSite, viewShotRef: viewShotRef}}
              imageFilter={{
                challengeObj: {
                  ...selectedSite,
                  challenge_type: challenge_type_value,
                },
                viewShotRef: viewShotRef,
              }}
            />

            {/* Overlay for Map and List modes */}
            {showOverlay && (
              <>
                {selectedHeaderMode === "Map" && (
                  <>
                    {userLocation || validUserLocation ? (
                      <ARMapView
                        userLocation={userLocation}
                        validUserLocation={validUserLocation}
                        selectedMode={selectedMode}
                        selectedSite={currentMode}
                        onSwitchToLiveView={() => setSelectedHeaderMode("Live")}
                      />
                    ) : (
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: theme.lightColors?.inputBG,
                          zIndex: 500,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: theme.lightColors?.white,
                              fontSize: FontSizes.S20,
                              width: "80%",
                              textAlign: "center",
                            }}
                          >
                            Please enable location services to view the map.
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                )}

                {selectedHeaderMode === "List" && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: theme.lightColors?.Bg,
                      zIndex: 500,
                    }}
                  >
                    {selectedMode?.id ? (
                      <ARModeSiteList
                        selectedMode={selectedMode}
                        onStartChallenge={startChallengeHandler}
                      />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: theme.lightColors?.white,
                            fontSize: FontSizes.S20,
                            width: "80%",
                            textAlign: "center",
                          }}
                        >
                          Please select an AR Mode to see available sites.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            {/* <TouchableOpacity
            style={{
              position: "absolute",
              top: 40,
              left: 20,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 10,
              borderRadius: 5,
              zIndex: 1000,
            }}
            onPress={handleNextHunt}
          >
            <Text style={{color: "#fff", fontSize: 16}}>Examples</Text>
          </TouchableOpacity> */}

            {unitySceneLoaded === true && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.99)",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 999,
                }}
              >
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{color: "#fff", marginTop: 10}}>Loading AR Experience</Text>
              </View>
            )}
          </>
        )}

        <View style={{position: "absolute", bottom: 20, width: "100%"}}>
          {!isUnityLoaded && (
            <CameraControls
              hasCapturedContent={!!capturedImage || !!capturedVideo}
              onRetake={retakeButtonHandler}
              onDone={doneButtonHandler}
              isVideo={!!capturedVideo}
              challengeHasFilters={challengeHasFilters}
            />
          )}
        </View>

        {/* Unity Bottom Bar - placed at bottom without absolute positioning */}

        {/* <ARModeModal
        isVisible={openModalARMode}
        onClose={closeModalARMode}
        selectedDestination={destinationData}
        onStartChallenge={startChallengeHandler}
      /> */}

        {/* {selectedSite?.selectedMode?.mode && (
        <NotificationModal
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
          selectedMode={selectedSite.selectedMode}
        />
      )} */}
      </ChallengeScreen>
      {isUnityLoaded && (
        <UnityBottomBar
          selectedMode={selectedHeaderMode}
          onModeSelect={handleBottomBarModeSelect}
          onMoreInfoPress={handleMoreInfoPress}
          onResetARPress={handleResetARPress}
          onRefreshPress={handleRefreshPress}
          modeLabel={modeLabel}
        />
      )}
    </View>
  );
};

export default ARScreen;
