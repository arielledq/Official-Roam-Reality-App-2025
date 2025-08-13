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
import {ELEMENTSUNITY} from "../../constants";
import Toast from "react-native-toast-message";
import text from "components/text";
import {Button} from "react-native-paper";
import ViewInfoModal from "components/ViewInfoModal";
import ViewInfoButton from "components/ViewInfoButton";

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

  // const huntChallenge = TEST_HUNT_CHALLENGE;
  const huntChallenge = route.params?.huntChallenge;
  const huntChallengeFinished = route.params?.huntChallengeFinished;
  const isContinuingHuntChallenge = !!huntChallenge;
  const [bundleFile, setBundleFile] = useState(null);
  const SCENE_NAME = "ARReactNative 1"; // tu escena
  const [sceneIsReady, setSceneIsReady] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const reloadLastModeRef = useRef(null);
  const bundleRequestedRef = useRef(false);

  const shouldRun3DFlow = mode => {
    if (!mode) return false;
    if (mode === AR_MODES.HUNT_MODE) return true;
    if (mode === AR_MODES.SCAN_MODE) return !!selectedSite?.scanChallenge?.file_3d; // solo si hay 3D
    return false; // GEO no entra acá (manejo aparte)
  };

  // espera breve tras sceneLoaded antes de enviar datos (ajustable)
  const AFTER_SCENE_COOLDOWN_MS = 400;

  const sendFlowTimerRef = useRef(null); // timer del orquestador
  const sceneCycleRef = useRef(0);
  const sendBundleTimerRef = useRef(null);
  const loadArContentSentRef = useRef(false);

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
      validUserLocation
      // &&
      // !hasSentModelDataOnce &&
      // (isGeoTagMode || isHuntMode ) //TODO Verificar
    ) {
      const huntLike = isHuntMode || (isScanMode && !!selectedSite?.scanChallenge?.file_3d);
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
        rotation: {x: 0, y: 0, z: 0},
        emissionIntensity: parseFloat(selectedChallengeOverride?.parameters?.emission_value) || 1,
        rotationSpeed: Number(selectedChallengeOverride?.parameters?.loop_delay) || 50,
        // rotationSpeed:1,
        scaleSpeed: Number(selectedChallengeOverride?.parameters?.scale_sensitivity) || 0.01,
        // scaleSpeed: 0.1,
        minScale: Number(selectedChallengeOverride?.parameters?.min_pinch_scale) || 1,
        maxScale: Number(selectedChallengeOverride?.parameters?.max_pinch_scale) || 1,
        // minScale: 0.1,
        // maxScale:  10,
        // isRotationEnabled: true,
        isVisible: isGeoTagMode, //true
        position: {
          x: parseFloat(selectedChallengeOverride?.parameters?.positionX) || 0,
          y: parseFloat(selectedChallengeOverride?.parameters?.positionY) || 0,
          z: 2 || 0.4,
        },
        distanceCamera: 2,
        isHuntMode: huntLike, //true
        allowScale: huntLike, //true
        // allowScale: true

      };
      setTimeout(() => {
        unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));
      }, 500);
      // setSendModelData(true);
      setHasSentModelDataOnce(true);
      console.log("HUNTLIKE", huntLike, "/n", modelData);
    }
  };

  const sendSpawnData = () => {
    if (!unityRef?.current) return;
    let config = {
      id: "1",
      latitude: -25.296442, // selectedSite?.scanChallenge?.coordinates[1] , // ||
      longitude: -57.58958, //selectedSite?.scanChallenge?.coordinates[0], //||
      scale: 1.0,
      height: 1,
      isVisible: true,
      updateRadius: 14.0,
      isHuntMode: false,
    };

    if (selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE) {
      config = {
        ...config,
        latitude: selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.lat_long?.coordinates[1], // ||  -25.296442,
        longitude: selectedSite?.huntChallenge?.geo_ar_star?.geo_site?.lat_long?.coordinates[0], //||  -57.589580,
        height: 1,
        isVisible: true,
        updateRadius: 14.0, // verificar
        isHuntMode: true,
      };
    }
    if (selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE) {
      config = {
        ...config,
        latitude: selectedSite?.scanChallenge?.coordinates?.coordinates[1], // ||  -25.296442,
        longitude: selectedSite?.scanChallenge?.coordinates?.coordinates[0], //||  -57.589580,
        height: 1,
        isVisible: true,
        updateRadius: 14.0, // verificar
        isHuntMode: true,
      };
    }
    const spawnData = {
      objects: [
        {
          ...config,
        },
      ],
    };
    console.log("Se Envio SpawnDAta", spawnData);
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
    if (unityRef.current && selectedSite?.huntChallenge) {

      unityRef.current.postMessage("Scriptposition", "SetVisibleStars", JSON.stringify({stars: `${selectedSite?.huntChallenge?.captured_stars}/${selectedSite?.huntChallenge?.total_stars}`, isStarsView:true}));
    }
  };

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

  const viewInfoButtonHandler = () => {
    setChallengeInformationView(true);
    setIsUnityLoaded(false);
  };

  const closeViewInfoButtonHandler = () => {
    setChallengeInformationView(false);
    setIsUnityLoaded(true);
  };

  const handleUnityMessage = result => {
    const data = JSON.parse(result.nativeEvent.message);
    console.log("dataUnity", data);

    const buttonBack = data.backPress;
    const buttonARMode = data?.ARMode;
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
        unityRef.current.postMessage("Main Camera", "ShowARObject");
      }
    }
    if (data.infoButton?.isButton) {
      setChallengeInformationView(data.infoButton?.isButton);
    }
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
    if (data?.["Reset-AR"] && selectedSite.selectedMode?.mode === AR_MODES.HUNT_MODE) {
      console.log("Reset AR");
      //TODO Pending Reset Stars
      startChallengeHandler();
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
      if (
        selectedSite?.selectedMode?.mode === AR_MODES.SCAN_MODE &&
        selectedSite?.scanChallenge?.file_3d
      ) {
        unityRef.current.postMessage("Main Camera", "ShowARObject");
      }
      if (selectedSite?.selectedMode?.mode === AR_MODES.HUNT_MODE) {
        // notificationUnity("Se Presiono sobre la estrella", "Auxiliooooooooooooooo");
        navigation.navigate({
          name: "FunFactsScreen",
          params: {
            challengeObj: selectedSite,
          },
        });
      }
    }

    switch (selectedSite?.selectedMode?.mode) {
      case AR_MODES.GEO_TAG_MODE:
        setSelectedChallengeOverride(null)
        unityRef.current.postMessage(
            "screen",
            "SetTypeChallenge",
            JSON.stringify({
              typeChallenge: "PHOTO",
              arChallenge: true,
              isLocation: false,
            })
        );

          if (data?.photoVideoButton?.isPhoto) {
              setCapturedImage(data.photoVideoButton?.filepath);
              setIsUnityLoaded(false);
              setShouldRenderUnity(true);
              setUnitySceneLoaded(false);
              eraseFile();
          }

        break;
      case AR_MODES.SCAN_MODE:
        setSelectedChallengeOverride(null);
        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: "PHOTO",
            arChallenge: true,
            isLocation: false,
          })
        );

        if (data?.photoVideoButton?.isPhoto) {
          setCapturedImage(data.photoVideoButton?.filepath);
          setIsUnityLoaded(false);
          setShouldRenderUnity(true);
          setUnitySceneLoaded(false);
          eraseFile();
        }
        // if (data?.photoVideoButton?.isPhoto == false) {
        //   setCapturedVideo(data.photoVideoButton?.filepath);
        //   setIsUnityLoaded(false);
        //   setShouldRenderUnity(true);
        //   setUnitySceneLoaded(false);
        //   eraseFile();
        // }

        break;
      case AR_MODES.HUNT_MODE:
        setSelectedChallengeOverride(null);
        break;
      default:
        break;
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
      />
  );

  const doneButtonHandler = async () => {
    try {
      const hasFilters = capturedImage && selectedSite?.ar_filters?.length > 0;
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
    console.log("[ARScreen] startChallengeHandler site", site);
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
          model_file: scanChallenge?.file_3d,
          lat_long: scanChallenge?.coordinates,
          challenge_requirement: site?.pin_challenge?.challenge_requirement,
          arChallenge: true, //vERIFICAR CODIGO DE UNITY
          isLocation: false, //vERIFICAR CODIGO DE UNITY
          challenge_id: scanChallenge?.id,
          parameters: null, // Verificar uso para objeto 3d -modificaciones- ---- Falta que venga del Backend
          points: scanChallenge?.points || 0, // Falta que venga del Backend
          selectedMode: "Scan",
          setVisibleButtonPosition: false,
        };

        break;
      case AR_MODES.HUNT_MODE:
        const huntChallenge = site?.huntChallenge?.geo_ar_star?.geo_site;
        challengeData = {
          lat_long: huntChallenge?.lat_long,
          challenge_requirement: huntChallenge?.pin_challenge?.challenge_requirement,
          challenge_id: huntChallenge?.pin_challenge?.id,
          model_file: huntChallenge?.pin_challenge?.model_file,
          parameters: huntChallenge?.pin_challenge?.parameters,
          points: huntChallenge?.pin_challenge?.points,
          setVisibleButtonPosition: false,
          arChallenge: false,
          isLocation: true,
        };

        break;
      default:
        break;
    }
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
    setTimeout(() => {
      setShowNotification(true);
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

    const bundleURL = selectedSite?.scanChallenge?.file_animation || "";
    if (!bundleURL) return;

    if (loadArContentSentRef.current) return;

    const cycleAtSchedule = sceneCycleRef.current;
    const t = setTimeout(() => {
      if (sceneCycleRef.current !== cycleAtSchedule) return;
      if (!sceneIsReady || !unityRef.current) return;

      const payload = {bundleURL};
      const has3D = !!selectedSite?.scanChallenge?.file_3d;

      if (has3D) {
        const file3d = selectedSite?.scanChallenge?.file_animation || "";
        if (file3d) payload.file3d = file3d; // Asumiendo que 'file3d' es el nombre de la propiedad esperada en Unity.
      } else {
        const img = selectedSite?.scanChallenge?.file_image || "";
        if (img) payload.localImagePath = img;
      }

      unityRef.current.postMessage("Main Camera", "LoadARContent", JSON.stringify(payload));
      loadArContentSentRef.current = true;
    }, AFTER_SCENE_COOLDOWN_MS);

    return () => clearTimeout(t);
  }, [
    sceneIsReady,
    pendingMode,
    selectedSite?.selectedMode?.mode,
    selectedSite?.scanChallenge?.file_animation,
    selectedSite?.scanChallenge?.file_3d,
    selectedSite?.scanChallenge?.file_image,
  ]);

  useEffect(() => {
    if (!unityRef.current) return;
    if (!sceneIsReady) return;

    if (sendFlowTimerRef.current) {
      clearTimeout(sendFlowTimerRef.current);
      sendFlowTimerRef.current = null;
    }

    const cycleAtSchedule = sceneCycleRef.current;

    sendFlowTimerRef.current = setTimeout(() => {
      if (sceneCycleRef.current !== cycleAtSchedule) return;
      if (!unityRef.current || !sceneIsReady) return;

      const distanceDetect = { isDetectionEnabled: true, detectionDistance: 10 };
      unityRef.current.postMessage("Main Camera", "SetDetectObjectState", JSON.stringify(distanceDetect));

      const mode = pendingMode ?? selectedSite?.selectedMode?.mode;
      const readyForModel = !!validUserLocation && !!starModels && !!textureBase;

      if (mode === AR_MODES.GEO_TAG_MODE) {
        if (!hasSentModelDataOnce && readyForModel) sendModelDataToUnity();
        return;
      }

      const has3DInScan = !!selectedSite?.scanChallenge?.file_3d;
      const run3D = mode === AR_MODES.HUNT_MODE || (mode === AR_MODES.SCAN_MODE && has3DInScan);

      if (run3D) {
        if (!hasSentModelDataOnce && readyForModel) {
          sendModelDataToUnity();
          return;
        }
        if (hasSentModelDataOnce && !sendSpawnModelData) {
          sendSpawnData();
          PointsCount();
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
  ]);

  useEffect(() => {
    if (!unityRef.current || !selectedSite?.selectedMode?.mode || !sceneIsReady) return;

    const mode = selectedSite.selectedMode.mode;

    let show = [];
    let hide = [];

    switch (mode) {
      case AR_MODES.GEO_TAG_MODE:
        unityRef.current.postMessage(
            "screen",
            "SetTypeChallenge",
            JSON.stringify({
              typeChallenge: "PHOTO",
              arChallenge: true,
              isLocation: false,
            })
        );
        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: "",
            arChallenge: true,
            isLocation: false,
          })
        );

        show = ["Back", "Details", "ArMode", "screen", "position", "points"];
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
        break;

      case AR_MODES.SCAN_MODE:
        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: "PHOTO",
            arChallenge: true,
            isLocation: false,
          })
        );
        const distanceDetect = {
          isDetectionEnabled: true,
          detectionDistance: 10,
        };
        unityRef.current.postMessage(
            "Main Camera",
            "SetDetectObjectState",
            JSON.stringify(distanceDetect)
        );

        const has3DModel = selectedSite?.scanChallenge?.file_3d;
        show = has3DModel
          ? ["Back", "Details", "ArMode", "screen", "points"]
          : ["Back", "Details", "ArMode", "screen"];
        hide = ELEMENTSUNITY.filter(name => !show.includes(name));

        unityRef.current.postMessage(
          "CanvasController",
          "ShowHideElements",
          JSON.stringify({show, hide})
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
            detectionDistance: 20,
          };
          unityRef.current.postMessage(
              "Main Camera",
              "SetDetectObjectState",
              JSON.stringify(distanceDetect)
          );
          unityStarsCount()
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

  useEffect(() => {
    if (challengeObjParameters) {
      setThreshold(parseFloat(challengeObjParameters?.bloom_threshold) || 0.1);
      setIntensity(parseFloat(challengeObjParameters?.bloom_intensity) || 2);
    }
  }, [challengeObjParameters]);

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

  useEffect(() => {
    if (huntChallengeFinished) {
      Toast.show({
        type: "info",
        text1: "Hunt Challenge Info",
        text2: "You have finished the hunt challenge",
      });
    }
  }, [huntChallengeFinished]);

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
      unityRef.current.postMessage(
        "OBJImport",
        "SetLoadingVisibility",
        JSON.stringify({isVisible: false})
      );
    }
  }, [isUnityLoaded, unityLoading, shouldRenderUnity]);

  useEffect(() => {
    if (selectedSite?.selectedMode?.mode !== AR_MODES.SCAN_MODE) {
      bundleRequestedRef.current = false;
    }
  }, [selectedSite?.selectedMode?.mode]);
  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        if (!unitySceneLoaded) {
          const mode = selectedSite?.selectedMode?.mode;

          // GEO: si todavía no se envió el modelo
          if (mode === AR_MODES.GEO_TAG_MODE && !hasSentModelDataOnce) {
            sendModelDataToUnity();
          }
        }
      }, 1500);

      if (isFocusedRef.current) return;

      isFocusedRef.current = true;
      setShouldRenderUnity(true);
      setUnityLoading(true);
      setUnitySceneLoaded(true);

        return () => {
          clearTimeout(timeout);
          setValidUserLocation(false);
          setSelectedChallengeOverride(null);
          setSelectedSite(null); //Se puede Activar, Testeo pendiente
          isFocusedRef.current = false;
          setUnitySceneLoaded(false);
          setShouldRenderUnity(false);
          setUnityLoading(false);
          setSendSpawnModelData(false);
          setHasSentModelDataOnce(false);
        };
      }, [])
  );

  useEffect(() => {
    if (!sceneIsReady || !unityRef.current) return;

    const mode = selectedSite?.selectedMode?.mode;
    if (mode !== AR_MODES.SCAN_MODE) return;

    const has3D = !!selectedSite?.scanChallenge?.file_3d;
    if (has3D) return; // si hay 3D, NO descargamos bundle aquí

    const animUrl = selectedSite?.scanChallenge?.file_animation;
    if (!animUrl) return; // nada que descargar

    if (bundleRequestedRef.current) return; // ya pedido
    bundleRequestedRef.current = true;

    // 🔽 tu función existente
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
      modals={modals}
      headerRightComponent={<ViewInfoButton onPress={viewInfoButtonHandler} showOnHeader />}
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
                backgroundColor: "rgba(0,0,0,0.99)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
            >
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{color: "#fff", marginTop: 10}}>Loading AR experience</Text>
            </View>
          )}
        </>
      )}
      {!isUnityLoaded && (
        <CameraControls
          hasCapturedContent={!!capturedImage || !!capturedVideo}
          // onRetake={retakeButtonHandler}
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
