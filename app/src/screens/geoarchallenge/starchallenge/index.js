import React, {useEffect, useRef, useState, useCallback, useLayoutEffect} from "react"; // Keep useCallback if you're using it elsewhere
import {Platform} from "react-native";

import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {requestMultiple, PERMISSIONS} from "react-native-permissions";
import RNFetchBlob from "rn-fetch-blob";
import {useSelector} from "react-redux";
import RNFS from "react-native-fs";
import Sound from "react-native-sound";
import Geolocation from "react-native-geolocation-service";

import {CAPTURE_CHALLENGE_TYPE, CHALLENGES_TYPE} from "../../../constants";
import useStyles from "./styles";

import UnityARCamera from "components/UnityArView";
import ChallengeScreen from "components/ChallengeScreen";
import ARModeModal from "components/ARModeModal/index.tsx";
import {
  copyFileForDisplay,
  eraseFile,
  handleUnzipProcess,
  showMessage,
} from "../../../util/helpers";

import NotificationModal from "components/ARModeModal/NotificationModal";
import {AR_MODES} from "constants";
import CameraControls from "components/CameraControls";

const StarChallenge = () => {
  const destinationData = useSelector(state => state.ar.destinationData);
  const selectedDestination = useSelector(state => state.ar);
  const [isUnityLoaded, setIsUnityLoaded] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [starModels, setStarModels] = useState();
  const [processingMedia, setProcessingMedia] = useState(false);
  const [textureBase, setTextureBase] = useState();
  const [textureEmission, setTextureEmission] = useState();
  const [modelResource, setModelResource] = useState();
  const [threshold, setThreshold] = useState(0);
  const [intensity, setIntensity] = useState(1);
  const _styles = useStyles();
  const navigation = useNavigation();
  const [openModalARMode, setOpenModalARMode] = useState(false);
  const [selectedChallengeOverride, setSelectedChallengeOverride] = useState(null);
  const unityRef = useRef(null); // Unity reference
  const [userLocation, setUserLocation] = useState(null);
  const starChallengeObj = selectedDestination.starChallenge;
  const challengeObjParameters = selectedDestination.geo_ar_star?.geo_site?.pin_challenge;
  const isStarChallenge = !!starChallengeObj?.id;
  const [sendModelData, setSendModelData] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMode, setNotificationMode] = useState("scan"); // Puede ser "scan", "hunt", u otros
  const [loading, setLoading] = useState(false);
  // const [sendLocation, setSendLocation] = useState(false);
  const [hasSentModelDataOnce, setHasSentModelDataOnce] = useState(false);
  const [locationObtainedForHunt, setLocationObtainedForHunt] = useState(false); // New state to track if location is obtained for hunt mode

  const lastSentLocationRef = useRef(null);
  const viewShotRef = useRef();

  const challengeObj = selectedChallengeOverride;
  const modelFile = challengeObj?.model_file;
  const [initialDataSent, setInitialDataSent] = useState(false);

  const [selectedSite, setSelectedSite] = useState(null);

  const isHuntMode = selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE;
  const isGeoTagMode = selectedSite?.selectedMode?.mode === AR_MODES.GEO_TAG_MODE;
  const isScanMode = selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE;

  const challengeHasFilters = selectedSite?.ar_filters?.length > 0;

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

  // const dataGpsChallegen = (selectedSSNN, challengeData) => {
  //   setSelectedChallengeOverride(challengeData);
  // };

  const downloadModelFile = (sourcePath, targetPath) => {
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
    setLoading(true);

    const extractedData = await handleUnzipProcess(sourcePath, targetPath);

    if (extractedData.success) {
      setStarModels(extractedData.objFile);
      setModelResource(extractedData.mtlFile);
      setTextureBase(extractedData.baseTexture);
      setTextureEmission(extractedData.emissionTexture);
      console.log("Model file unzipped and state updated successfully.");
    } else {
      console.error("Failed to unzip model file:", extractedData.error);

      setModelResource(null);
      setTextureBase(null);
      setTextureEmission(null);
    }
    setLoading(false);
  };

  const checkIfModelExist = () => {
    if (challengeObj && modelFile) {
      const filename = modelFile.split("/").pop().split("?")[0];
      const withoutExtFilename = filename.split(".")[0];
      const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;

      RNFS.exists(sourcePath)
        .then(exists => {
          console.log("exists", exists);
          if (exists) {
            unzipModelFile(sourcePath, targetPath);
          } else {
            downloadModelFile(sourcePath, targetPath);
          }
        })
        .catch(console.error);
    }
  };

  const retakeButtonHandler = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsUnityLoaded(true);
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
                setIsUnityLoaded(false);
              } else {
                console.error("No se encontró ningún archivo .png en el directorio.");
              }
            } else {
              console.error("El directorio está vacío o 'files' no es un array válido.");
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
        console.log("Enviando posicion del usuario");
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

  const sendBloomValuesToUnity = () => {
    const bloomData = {threshold, intensity};
    if (unityRef.current) {
      unityRef.current.postMessage("PosProcessing", "UpdateBloomValues", JSON.stringify(bloomData));
    }
  };

  const sendModelDataToUnity = () => {
    if (
      unityRef.current &&
      textureBase &&
      starModels &&
      userLocation &&
      !hasSentModelDataOnce &&
      (isGeoTagMode || isHuntMode)
    ) {
      const modelData = {
        objFile: starModels.replace("file://", ""),
        mtlFile: modelResource ? modelResource.replace("file://", "") : "",
        textureBase: textureBase ? textureBase.replace("file://", "") : "",
        textureEmission: textureEmission ? textureEmission.replace("file://", "") : "",
        scale: {
          x: 1,
          y: 1,
          z: 1,
        },
        emissionIntensity: parseFloat(selectedChallengeOverride.parameters?.emission_value) || 1,
        rotationSpeed: Number(selectedChallengeOverride.parameters?.loop_delay) || 1,
        scaleSpeed: Number(selectedChallengeOverride.parameters?.scale_sensitivity) || 0.01,
        minScale: Number(selectedChallengeOverride.parameters?.min_pinch_scale) || 1,
        maxScale: Number(selectedChallengeOverride.parameters?.max_pinch_scale) || 1,
        isVisible: !isHuntMode,
        position: {
          x: parseFloat(selectedChallengeOverride.parameters?.positionX) || 0,
          y: parseFloat(selectedChallengeOverride.parameters?.positionY) || 0,
          z: 2 || 0.4,
        },
        distanceCamera: 2,
        isHuntMode: isHuntMode,
        allowScale: isHuntMode,
      };
      setTimeout(() => {
        unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));
      }, 500);
      setSendModelData(true);
      setHasSentModelDataOnce(true);
    }
  };

  const sendSpawnData = () => {
    if (!unityRef?.current || !isHuntMode) return;
    const spawnData = {
      objects: [
        {
          id: "1",
          latitude: -25.29674605035726,
          longitude: -57.58958597325399,
          scale: 1.0,
          height: 1,
          isVisible: true,
          updateRadius: 14.0,
        },
      ],
    };
    unityRef.current.postMessage(
      "ObjectSpawner",
      "SpawnObjectsFromReact",
      JSON.stringify(spawnData)
    );
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

  const closeModalARMode = () => {
    setOpenModalARMode(false);
    setIsUnityLoaded(true);
  };

  const resetUnityScene = () => {
    if (unityRef.current) {
      unityRef.current.postMessage("CloseAndReset", "ReiniciarEscena");
    }
  };

  const handleUnityMessage = result => {
    const data = JSON.parse(result.nativeEvent.message);
    console.log("DATA UNIT", data);
    const buttonBack = data.backPress;
    const buttonARMode = data?.ARMode;

    if (buttonBack) {
      navigation?.goBack();
      if (Platform.OS === "android") {
        unityRef.current?.unloadUnity?.();
        resetUnityScene();
      }
    }
    if (buttonARMode) {
      setOpenModalARMode(true);
    }
    // if (data?.touchEvent?.objectTouched === true) {
    //   setNotificationMode("hunt");
    //   setOpenModalARMode(true);
    // }
    // if (data?.notificationMode) {
    //   setNotificationMode(data.notificationMode);
    // }

    switch (selectedSite?.selectedMode?.mode) {
      case AR_MODES.GEO_TAG_MODE:
        // Todavia no implementado
        break;
      case AR_MODES.SCAN_MODE:
        if (data.photoVideoButton?.isPhoto) {
          setCapturedImage(data.photoVideoButton?.filepath);
          setIsUnityLoaded(false);
          eraseFile();
        }
        if (data.photoVideoButton?.isPhoto == false) {
          setCapturedVideo(data.photoVideoButton?.filepath);
          setIsUnityLoaded(false);
        }
        break;
      case AR_MODES.HUNT_MODE:
        // Todavia no implementado
        break;
      default:
        break;
    }
  };

  const doneButtonHandler = async () => {
    const hasFilters = capturedImage && selectedSite?.ar_filters.length > 0;
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

    // Navegar y pasar la captura actualizada
    navigation.navigate({
      name: "ArChallengeShare",
      params: {
        challengeObj: selectedSite,
        captureData: updatedData,
        challengeType: CHALLENGES_TYPE.PHOTO_VIDEO,
      },
    });
  };

  const notificationUnity = () => {
    if (unityRef.current) {
      const data = {
        isNotification: true,
        textNotification: "Presionar sobre la estrella.",
        titleNotification: "Estrella encontrada",
      };
      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleNotification",
        JSON.stringify(data)
      );
    }
  };

  const startChallengeHandler = site => {
    // // Primero reiniciar la escena de unity
    // resetUnityScene();

    console.log("site", site);

    let challengeData = {};
    switch (site?.selectedMode?.mode) {
      case AR_MODES.GEO_TAG_MODE:
        challengeData = {
          lat_long: site.lat_long,
          challenge_requirement: site.pin_challenge?.challenge_requirement,
          challenge_id: site.pin_challenge?.id,
          model_file: site.pin_challenge?.model_file,
          parameters: site.pin_challenge?.parameters,
          points: site.pin_challenge?.points,
        };
        break;
      case AR_MODES.SCAN_MODE:
        challengeData = {
          challenge_requirement: site?.challenge_requirement,
          challenge_id: site?.id,
          points: site?.points,
          setVisibleButtonPosition: false,
          arChallenge: true,
          isLocation: false,
        };
        break;
      case AR_MODES.HUNT_MODE:
        challengeData = {
          lat_long: site.lat_long,
          challenge_requirement: site.pin_challenge?.challenge_requirement,
          challenge_id: site.pin_challenge?.id,
          model_file: site.pin_challenge?.model_file,
          parameters: site.pin_challenge?.parameters,
          points: site.pin_challenge?.points,
          setVisibleButtonPosition: false,
          arChallenge: false,
          isLocation: true,
        };
        break;
      default:
        break;
    }

    // actualizar el challenge
    // console.log("site", site);
    setSelectedSite(site);
    setSelectedChallengeOverride(challengeData);

    // setSelectedChallengeData(challengeData);

    // Cerrar primero el modal actual
    closeModalARMode();

    // Mostrar la notificación luego de un pequeño delay
    setTimeout(() => {
      // setNotificationMode("scan");
      setShowNotification(true);
    }, 1000); // 300ms funciona bien visualmente
  };

  // Detectar cambio de escena
  useEffect(() => {
    if (unityRef.current) {
      console.log("cambio de scena");
      unityRef.current.postMessage("SceneLoader", "LoadSpecificScene", "ARReactNative 1");
    }
  }, [unityRef.current]);

  // Verificar si el modelo existe
  useEffect(() => {
    console.log("useEffect: [challengeObj]");
    if (challengeObj && modelFile) {
      checkIfModelExist();
    }
  }, [challengeObj, modelFile]);

  // Activar posicion GPS
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
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
        };
        setUserLocation(newLocation);

        const LOCATION_THRESHOLD = 0.00001;

        // if (
        //     notificationMode === "hunt" && // Only execute updateUnityLocation if notificationMode is "hunt"
        //     (!lastSentLocationRef.current ||
        //         Math.abs(newLocation.latitude - lastSentLocationRef.current.latitude) > LOCATION_THRESHOLD ||
        //         Math.abs(newLocation.longitude - lastSentLocationRef.current.longitude) > LOCATION_THRESHOLD)
        // ) {
        //   console.log('ejecutando envio de posicion');
        updateUnityLocation(newLocation);
        lastSentLocationRef.current = newLocation;
        // }
        // if (notificationMode === "scan") { // For scan mode, still update location but don't set `locationObtainedForHunt`
        //   updateUnityLocation(newLocation);
        //   lastSentLocationRef.current = newLocation;
        // }
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
  }, [unityRef]);

  // Activar efecto Bloom
  useEffect(() => {
    if (challengeObjParameters) {
      setThreshold(parseFloat(challengeObjParameters?.bloom_threshold) || 0.1);
      setIntensity(parseFloat(challengeObjParameters?.bloom_intensity) || 2);
    }
  }, [challengeObjParameters]);

  // Verificar que el usuario tenga todos los permisos
  useEffect(() => {
    checkPermission();
  }, [selectedChallengeOverride]);

  // Levantar el challenge de Scan Mode enviando los datos a Unity
  useEffect(() => {
    // Only run these operations if unityRef.current is available
    if (unityRef.current && isScanMode) {
      // Use a setTimeout to give Unity a moment to fully initialize
      const timer = setTimeout(() => {
        PointsCount();
        // isLoadingUnity();

        unityRef.current.postMessage(
          "Scriptposition",
          "SetVisibleButton",
          JSON.stringify({
            setVisibleButtonPosition: selectedChallengeOverride?.setVisibleButtonPosition,
          })
        );

        if (!!CAPTURE_CHALLENGE_TYPE[selectedChallengeOverride?.challenge_requirement]) {
          unityRef.current.postMessage(
            "screen",
            "SetTypeChallenge",
            JSON.stringify({
              typeChallenge: selectedChallengeOverride?.challenge_requirement,
              arChallenge: selectedChallengeOverride?.arChallenge,
              isLocation: selectedChallengeOverride?.isLocation,
            })
          );
        }
      }, 500); // 500ms delay

      // Clean up the timer when the component unmounts or loses focus
      return () => clearTimeout(timer);
    }
  }, [unityRef, isScanMode, selectedChallengeOverride]);

  useEffect(() => {
    if (
      unityRef.current &&
      starModels &&
      textureBase &&
      userLocation &&
      !hasSentModelDataOnce &&
      (isGeoTagMode || isHuntMode)
    ) {
      sendModelDataToUnity();
    }
  }, [
    unityRef,
    starModels,
    textureBase,
    userLocation,
    isGeoTagMode,
    isHuntMode,
    hasSentModelDataOnce,
    selectedChallengeOverride,
    modelResource,
  ]); // Added dependencies for sendModelDataToUnity logic

  useEffect(() => {
    if (isHuntMode || isGeoTagMode) {
      console.log("se envio sendSpawnData");
      setTimeout(() => {
        sendSpawnData();
        PointsCount();
      }, 1500);
    }
  }, [isGeoTagMode, isHuntMode, locationObtainedForHunt, unityRef, selectedChallengeOverride]); // Added dependencies for sendSpawnData and PointsCount logic

  useFocusEffect(
    useCallback(() => {
      console.log("useFocusEffect: [unityRef, isUnitLoaded]");

      if (Platform.OS === "android") {
        unityRef.current?.resumeUnity();
        unityRef.current?.windowFocusChanged(true);
      }
    }, [unityRef, isUnityLoaded])
  );

  useEffect(() => {
    if (unityRef.current) {
      const spawnData = {
        isDetectionEnabled: true,
        detectionDistance: 80,
      };
      unityRef.current.postMessage(
        "OBJImport",
        "SetLoadingVisibility",
        JSON.stringify({isVisible: false})
      );

      const distanceDetect = {
        isDetectionEnabled: true,
        detectionDistance: 80,
      };
      unityRef.current.postMessage(
        "Main Camera",
        "SetDetectObjectState",
        JSON.stringify(distanceDetect)
      );
      unityRef.current.postMessage(
        "OBJImport",
        "SetLoadingVisibility",
        JSON.stringify({isVisible: false})
      );
    }
  }, []);

  return (
    <ChallengeScreen
      title="AR Star Hunt "
      appHeader={false}
      style={{
        paddingHorizontal: 0,
        paddingBottom: 0,
        flex: 1,
        backgroundColor: "#000",
      }}
    >
      <UnityARCamera
        width={"100%"}
        height={"100%"}
        unityRef={unityRef}
        isProcessingMedia={processingMedia}
        onUnityMessage={handleUnityMessage}
        isUnityLoaded={isUnityLoaded}
        capturedImage={capturedImage}
        capturedVideo={capturedVideo}
        imageFilter={{challengeObj: selectedSite, viewShotRef: viewShotRef}}
      />

      {!isUnityLoaded && (
        <CameraControls
          hasCapturedContent={!!capturedImage || !!capturedVideo}
          onRetake={retakeButtonHandler}
          onDone={doneButtonHandler}
          isVideo={!!capturedVideo}
          challengeHasFilters={challengeHasFilters}
        />
      )}

      <ARModeModal
        isVisible={openModalARMode}
        onClose={closeModalARMode}
        selectedDestination={destinationData}
        onStartChallenge={startChallengeHandler}
      />

      <NotificationModal
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        selectedMode={selectedSite?.selectedMode}
      />
    </ChallengeScreen>
  );
};

export default StarChallenge;
