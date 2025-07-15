import React, {useEffect, useRef, useState, useCallback} from "react";
import {Platform, View, ActivityIndicator, Text} from "react-native";

import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {requestMultiple, PERMISSIONS} from "react-native-permissions";
import RNFetchBlob from "rn-fetch-blob";
import {useSelector} from "react-redux";
import RNFS from "react-native-fs";
import Sound from "react-native-sound";
import Geolocation from "react-native-geolocation-service";

import {CAPTURE_CHALLENGE_TYPE, CHALLENGES_TYPE} from "../../constants";

import UnityARCamera from "components/UnityArView";
import ChallengeScreen from "components/ChallengeScreen";
import ARModeModal from "components/ARModeModal/index.tsx";
import {copyFileForDisplay, eraseFile, handleUnzipProcess} from "../../util/helpers";

import NotificationModal from "components/ARModeModal/NotificationModal";
import {AR_MODES} from "constants";
import CameraControls from "components/CameraControls";

const ARScreen = ({route}) => {
  const destinationData = useSelector(state => state.ar.destinationData);
  const selectedDestination = useSelector(state => state.ar);

  const [openModalARMode, setOpenModalARMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const starChallengeObj = selectedDestination.starChallenge;
  const challengeObjParameters = selectedDestination.geo_ar_star?.geo_site?.pin_challenge;
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMode, setNotificationMode] = useState("scan");
  const [selectedSite, setSelectedSite] = useState(null);

  const navigation = useNavigation();

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
  const [sendModelData, setSendModelData] = useState(false);
  const [unityLoading, setUnityLoading] = useState(true); // Nuevo estado para el loading de Unity al volver
  const [hasSentModelDataOnce, setHasSentModelDataOnce] = useState(false);
  const [locationObtainedForHunt, setLocationObtainedForHunt] = useState(false);
  const [unitySceneLoaded, setUnitySceneLoaded] = useState(false);

  const unityRef = useRef(null);

  // Challenge derived states
  const challengeObj = selectedChallengeOverride;
  const isHuntMode = selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE;
  const isGeoTagMode = selectedSite?.selectedMode?.mode === AR_MODES.GEO_TAG_MODE;
  const isScanMode = selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE;
  const modelFile =
    challengeObj?.model_file ||
    selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.pin_challenge?.model_file;
  const challengeHasFilters = selectedSite?.ar_filters?.length > 0;

  const huntChallenge = route.params?.huntChallenge
  const isContinuingHuntChallenge = !!huntChallenge

  console.log("huntChallenge", huntChallenge)

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
    const extractedData = await handleUnzipProcess(sourcePath, targetPath);

    if (extractedData.success) {
      setStarModels(extractedData.objFile);
      setModelResource(extractedData.mtlFile);
      setTextureBase(extractedData.baseTexture);
      setTextureEmission(extractedData.emissionTexture);
    } else {
      console.error("Failed to unzip model file:", extractedData.error);

      setModelResource(null);
      setTextureBase(null);
      setTextureEmission(null);
    }
  };

  const checkIfModelExist = () => {
    if (challengeObj && modelFile) {
      const filename = modelFile.split("/").pop().split("?")[0];
      const withoutExtFilename = filename.split(".")[0];
      const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;

      RNFS.exists(sourcePath)
        .then(exists => {
          // console.log("exists", exists);
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
    setShouldRenderUnity(true);
    setUnityLoading(true);
    setUnitySceneLoaded(true);
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
        // console.log("Enviando posicion del usuario");
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
          latitude: selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.lat_long?.coordinates[1],
          longitude: selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.lat_long?.coordinates[0],
          // latitude: -25.29670612626421,
          // longitude: -57.58969884415989,
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
    console.log("[StarChallengeScreen] spawnData", spawnData);
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

  useEffect(() => {
    if (
      unityRef.current &&
      starModels &&
      textureBase &&
      userLocation &&
      !hasSentModelDataOnce &&
      (notificationMode === "scan" || notificationMode === "hunt")
    ) {
      sendModelDataToUnity();
    }
  }, [
    isUnityLoaded,
    starModels,
    textureBase,
    userLocation,
    notificationMode,
    hasSentModelDataOnce,
    selectedChallengeOverride,
    modelResource,
  ]);

  useEffect(() => {
    if (notificationMode === "hunt") {
      // console.log("se envio sendSpawnData");
      setTimeout(() => {
        sendSpawnData();
        PointsCount();
      }, 1500);
    }
  }, [notificationMode, locationObtainedForHunt, isUnityLoaded, selectedChallengeOverride]);

  const closeModalARMode = () => {
    setOpenModalARMode(false);
    setIsUnityLoaded(true);
    setShouldRenderUnity(true);
    setUnityLoading(true);
  };

  const resetUnityScene = () => {
    if (unityRef.current) {
      unityRef.current.postMessage("CloseAndReset", "ReiniciarEscena");
    }
  };

  const handleUnityMessage = result => {
    const data = JSON.parse(result.nativeEvent.message);
    // console.log("DATA UNIT", data);
    const buttonBack = data.backPress;
    const buttonARMode = data?.ARMode;

    if (buttonBack) {
      navigation?.goBack();
      if (Platform.OS === "android") {
        setShouldRenderUnity(false);
        // unityRef.current.postMessage("CloseAndReset", "ReiniciarEscena");
      }
    }
    if (buttonARMode) {
      setOpenModalARMode(true);
    }
    if (data?.sceneLoaded && data.sceneName === "ARReactNative 1") {
      // console.log("✅ Escena ARReactNative 1 cargada correctamente desde Unity");
      setUnitySceneLoaded(false);
    }
    if (data?.touchEvent?.objectTouched === true) {
      notificationUnity("Se Presiono sobre la estrella", "Auxiliooooooooooooooo");
      // console.log("Estrella encontrada");
      navigation.navigate({
        name: "FunFactsScreen",
        params: {
          challengeObj: selectedSite,
          // captureData: capturedImage,
          // challengeType: CHALLENGES_TYPE.STAR,
          // isMemory: false,
        },
      });
    }
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
          setShouldRenderUnity(true);
          setUnitySceneLoaded(false);
          eraseFile();
        }
        if (data.photoVideoButton?.isPhoto == false) {
          setCapturedVideo(data.photoVideoButton?.filepath);
          setIsUnityLoaded(false);
          setShouldRenderUnity(true);
          setUnitySceneLoaded(false);
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
    // // Primero reiniciar la escena de unity
    // resetUnityScene();
    // if (site?.selectedMode?.mode === AR_MODES.HUNT_MODE && userLocation && site?.id) {
    //   try {
    //     const response = await getNextStarApi({
    //       geo_site_id: site.id,
    //       lat: userLocation.latitude,
    //       lon: userLocation.longitude,
    //     });

    //     if (response?.id) {
    //       console.log("⭐ Star data recibida desde startChallengeHandler:", response);
    //       site = {
    //         ...site,
    //         starData: response.location,
    //       };
    //     }
    //   } catch (error) {
    //     console.error("❌ Error al obtener la estrella en startChallengeHandler", error);
    //   }
    // }

    // console.log("site", site);

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
        console.log("[StarChallengeScreen] huntChallenge site", site);
        challengeData = {
          lat_long: site?.geo_ar_star?.geo_site?.lat_long,
          challenge_requirement: site?.geo_ar_star?.geo_site?.pin_challenge?.challenge_requirement,
          challenge_id: site?.geo_ar_star?.geo_site?.pin_challenge?.id,
          model_file: site?.geo_ar_star?.geo_site?.pin_challenge?.model_file,
          parameters: site?.geo_ar_star?.geo_site?.pin_challenge?.parameters,
          points: site?.geo_ar_star?.geo_site?.pin_challenge?.points,
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
  // useEffect(() => {
  //   if (unityRef.current) {
  //     console.log("cambio de scena");
  //     unityRef.current.postMessage("SceneLoader", "LoadSpecificScene", "ARReactNative 1");
  //   }
  // }, [unityRef.current]);
  useEffect(() => {
    if (!unityRef.current) return;

    const timeout = setTimeout(() => {
      // console.log("Solicitando carga de escena ARReactNative 1");
      unityRef.current.postMessage("SceneLoader", "LoadSpecificScene", "ARReactNative 1");
    }, 500); // menor delay, Unity ya está listo

    return () => clearTimeout(timeout);
  }, [unityLoading, isUnityLoaded]); // cambia cuando Unity termina de cargar

  // Verificar si el modelo existe
  useEffect(() => {
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
  }, [isUnityLoaded, isScanMode, selectedChallengeOverride]);

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
    isUnityLoaded,
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
      // console.log("se envio sendSpawnData");
      setTimeout(() => {
        sendSpawnData();
        PointsCount();
      }, 1500);
    }
  }, [isGeoTagMode, isHuntMode, locationObtainedForHunt, isUnityLoaded, selectedChallengeOverride]); // Added dependencies for sendSpawnData and PointsCount logic

  useFocusEffect(
    useCallback(() => {
      // console.log("useFocusEffect: [unityRef, isUnitLoaded]");

      if (Platform.OS === "android") {
        unityRef.current?.resumeUnity();
        unityRef.current?.windowFocusChanged(true);
      }
    }, [isUnityLoaded])
  );

  useEffect(() => {
    if (unityRef.current && !unityLoading && shouldRenderUnity) {
      const spawnData = {
        isDetectionEnabled: true,
        detectionDistance: 80,
      };

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
  }, [isUnityLoaded, unityLoading, shouldRenderUnity]);

  useFocusEffect(
    useCallback(() => {
      if (isFocusedRef.current) {
        // console.log("⚠️ Ya montado, ignorando");
        return;
      }

      isFocusedRef.current = true;
      // console.log("✅ MONTANDO UNITY");
      setShouldRenderUnity(true);
      setUnityLoading(true);
      setUnitySceneLoaded(true);
      return () => {
        // console.log("❌ DESMONTANDO UNITY");
        isFocusedRef.current = false;
        setUnitySceneLoaded(false);
        setShouldRenderUnity(false);
        setUnityLoading(false);
      };
    }, [])
  );

  // useEffect(() => {
  //   const fetchNextStarData = async () => {
  //     if (
  //         selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE &&
  //         userLocation &&
  //         selectedSite?.id
  //     ) {
  //       console.log("entro para estrella")
  //       try {
  //         const response = await getNextStarApi({
  //           geo_site_id: selectedSite.id,
  //           lat: userLocation.latitude,
  //           lon: userLocation.longitude,
  //         });
  //
  //         if (response?.id) {
  //           console.log("⭐ Star data recibida:", response);
  //           // Puedes guardar esto en otro estado si lo necesitas:
  //           setSelectedSite(prev => ({
  //             ...prev,
  //             starData: response,
  //           }));
  //         }
  //       } catch (error) {
  //         console.error("❌ Error en getNextStarApi", error);
  //       }
  //     }
  //   };
  //
  //   fetchNextStarData();
  // }, [selectedSite, userLocation]);
  //

  // useEffect(() => {
  //   const fetchNextStarData = async () => {
  //     if (
  //         selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE &&
  //         userLocation &&
  //         selectedSite?.id
  //     ) {
  //       console.log("entro para estrella")
  //       try {
  //         const response = await getNextStarApi({
  //           geo_site_id: selectedSite.id,
  //           lat: userLocation.latitude,
  //           lon: userLocation.longitude,
  //         });
  //
  //         if (response?.id) {
  //           console.log("⭐ Star data recibida:", response);
  //           // Puedes guardar esto en otro estado si lo necesitas:
  //           setSelectedSite(prev => ({
  //             ...prev,
  //             starData: response,
  //           }));
  //         }
  //       } catch (error) {
  //         console.error("❌ Error en getNextStarApi", error);
  //       }
  //     }
  //   };
  //
  //   fetchNextStarData();
  // }, [selectedSite, userLocation]);
  //

  // console.log(
  //   "shouldRenderUnity, unitySceneLoaded",
  //   shouldRenderUnity,
  //   unitySceneLoaded,
  //   isUnityLoaded
  // );
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
      {shouldRenderUnity && (
        <>
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
          {unitySceneLoaded === true && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.70)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
            >
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{color: "#fff", marginTop: 10}}>Cargando experiencia AR...</Text>
            </View>
          )}
        </>
      )}
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

export default ARScreen;
