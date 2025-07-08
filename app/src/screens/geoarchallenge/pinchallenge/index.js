import React, {useEffect, useRef, useState, useCallback} from "react";
import {Platform} from "react-native";

import {useSelector} from "react-redux";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {requestMultiple, PERMISSIONS} from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
import Sound from "react-native-sound";
import RNFetchBlob from "rn-fetch-blob";
import RNFS from "react-native-fs";
import theme from "assets/theme";

import CameraControls from "../../../components/CameraControls";
import UnityARCamera from "components/UnityArView";
import ChallengeScreen from "components/ChallengeScreen";

import {handleUnzipProcess, showMessage} from "../../../util/helpers";
import {
  convertMetersToFeets,
  findNearestLocationPoint,
  getLocationDistance,
  hasLocationPermission,
  isLocationPointInPolygon,
} from "../../../util/LocationLib";
import {CHALLENGES_TYPE} from "../../../constants";
import ViewInfoModal from "components/ViewInfoModal";
import ViewInfoButton from "components/ViewInfoButton";
import {PIN_CHALLENGE_CONFIG} from "../../../constants";

const PinChallenge = () => {
  const [isUnityLoaded, setIsUnityLoaded] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [distanceInFeet, setDistanceInFeet] = useState(0);
  const [isMeInsideInSite, setIsMeInsideInSite] = useState(false);
  const [modelOBJ, setModelOBJ] = useState(null);
  const [modelResource, setModelResource] = useState(null);
  const [textureBase, setTextureBase] = useState(null);
  const [textureEmission, setTextureEmission] = useState(null);
  const [foldefile, setFoldefile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourcesFiles, setSourcesFiles] = useState([]);
  const [scale, setScale] = useState({x: 1, y: 1, z: 1});
  const [rotation, setRotation] = useState({x: 0, y: 0, z: 0});
  const [position, setPosition] = useState({x: 0, y: 0, z: 0});
  const [threshold, setThreshold] = useState(0);
  const [intensity, setIntensity] = useState(1);
  const [emissionValue, setEmissionValue] = useState(1);
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [processingMedia, setProcessingMedia] = useState(false);

  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);

  const unityRef = useRef(null); // Unity reference
  const watchIdRef = useRef(null);
  const viewShotRef = useRef();

  const navigation = useNavigation();

  const challengeObj = selectedGeoSite.pin_challenge;
  const challengeObjParameters = challengeObj?.parameters;
  const modelFile = challengeObj.model_file;
  const viewInfoModalContent = challengeObj?.info;

  const dataNotificationUnity = {
    isNotification: false,
    textNotification: PIN_CHALLENGE_CONFIG.CUSTOM_INSTRUCTIONS,
  };

  let siteLatitude = 0;
  let siteLongitude = 0;
  if (selectedGeoSite?.lat_long?.coordinates?.length === 2) {
    siteLatitude = selectedGeoSite.lat_long.coordinates[1];
    siteLongitude = selectedGeoSite.lat_long.coordinates[0];
  }

  // Descargar modelo y gestionar archivos
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
      setModelOBJ(extractedData.objFile);
      setModelResource(extractedData.mtlFile);
      setTextureBase(extractedData.baseTexture);
      setTextureEmission(extractedData.emissionTexture);
      setSourcesFiles(extractedData.sourcesFiles);
      setFoldefile(extractedData.foldefile);
      console.log("Model file unzipped and state updated successfully.");
    } else {
      console.error("Failed to unzip model file:", extractedData.error);

      setModelOBJ(null);
      setModelResource(null);
      setTextureBase(null);
      setTextureEmission(null);
      setSourcesFiles([]);
      setFoldefile([]);
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

  const sendModelDataToUnitySpawn = () => {
    if (
      unityRef.current &&
      modelOBJ &&
      textureBase &&
      emissionValue &&
      textureEmission &&
      challengeObjParameters
    ) {
      // Add challengeObjParameters
      const modelData = {
        objFile: modelOBJ.replace("file://", ""),
        mtlFile: modelResource ? modelResource.replace("file://", "") : null,
        textureBase: textureBase ? textureBase.replace("file://", "") : "",
        textureEmission: textureEmission ? textureEmission.replace("file://", "") : "",
        // arTexture: arTexture ? arTexture.replace("file://", "") : "",
        scale,
        rotation,
        emissionIntensity: emissionValue,
        rotationSpeed: 10,
        scaleSpeed: Number(challengeObjParameters?.scale_sensitivity) || 0.01,
        minScale: Number(challengeObjParameters?.min_pinch_scale) || 1,
        maxScale: Number(challengeObjParameters?.max_pinch_scale) || 1,
        isRotationEnabled: true,
        distanceCamera: 2,
        isVisible: true,
        position: {
          x: parseFloat(challengeObjParameters.positionX) || 0, // No optional chaining here, already checked above
          y: parseFloat(challengeObjParameters.positionY) || 0,
          z: 2 || 0.4,
        },
      };
      setTimeout(() => {
        unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));
      }, 500);
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

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) return;
    Geolocation.getCurrentPosition(
      position => {
        isCurrentLocationIsInArea(position);
        if (!isMeInsideInSite) {
          findNearPoint(position);
        }
      },
      error => {
        console.error(error);
      },
      {
        accuracy: {android: "high", ios: "best"},
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: true,
        showLocationDialog: true,
      }
    );
  };

  const getLocationUpdates = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) return;

    watchIdRef.current = Geolocation.watchPosition(
      position => {
        isCurrentLocationIsInArea(position);
        if (!isMeInsideInSite) findNearPoint(position);
      },
      error => {
        console.error(error);
      },
      {
        accuracy: {android: "high", ios: "best"},
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: true,
        showLocationDialog: true,
        interval: 1500,
      }
    );
  };

  const stopLocationUpdates = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      Geolocation.stopObserving();
    }
  };

  const isCurrentLocationIsInArea = position => {
    let isInsideSiteArea = false;
    for (let i = 0; i < selectedGeoSite.geo_site_border.coordinates.length; i++) {
      const points = selectedGeoSite.geo_site_border.coordinates[i];
      let arrayPoints = points.map(point => ({latitude: point[1], longitude: point[0]}));
      isInsideSiteArea = isLocationPointInPolygon(position.coords, arrayPoints);
      if (isInsideSiteArea) break;
    }
    setIsMeInsideInSite(isInsideSiteArea);
  };

  const findNearPoint = position => {
    let arrayPoints = selectedGeoSite.geo_site_border.coordinates.flat().map(point => ({
      latitude: point[1],
      longitude: point[0],
    }));

    const nearestPoint = findNearestLocationPoint(position.coords, arrayPoints);
    const distance = getLocationDistance(position.coords, nearestPoint);
    setDistanceInFeet(convertMetersToFeets(distance));
  };

  // const playCameraSound = () => {
  //   Sound.setCategory("Playback");
  //   let cameraSound = new Sound(
  //     Platform.OS === "android" ? "camerasound.mp3" : "camera-sound.mp3",
  //     Sound.MAIN_BUNDLE,
  //     error => {
  //       if (error) {
  //         console.error("failed to load the sound", error);
  //       } else {
  //         cameraSound.play();
  //       }
  //     }
  //   );
  // };

  const _takeScreenshot = async () => {
    if (isMeInsideInSite) {
      playCameraSound();

      if (unityRef.current) {
        unityRef.current.postMessage("ScreenCapture", "CaptureScreenshotFromReact", "");

        // Obtén la ruta base según la plataforma
        const basePath =
          Platform.OS === "android"
            ? "/storage/emulated/0/Android/data/com.roam_reality/files/"
            : RNFS.DocumentDirectoryPath; // Ruta de Documentos en iOS

        setProcessingMedia(true);

        // Agregar un retraso para asegurarse de que la captura se ha guardado
        setTimeout(() => {
          RNFS.readDir(basePath)
            .then(files => {
              console.info("Archivos encontrados en el directorio:", files);

              if (Array.isArray(files) && files.length > 0) {
                // Busca un archivo con el prefijo 'screenshot' y la extensión '.png'
                const foundFile = files.find(
                  file =>
                    file.isFile() && file.name.includes("screenshot") && file.name.endsWith(".png")
                );

                if (foundFile) {
                  console.info("CAPTURA DE PANTALLA ENCONTRADA:", foundFile);
                  setCapturedImage(foundFile.path); // Actualiza capturedImage
                  setIsUnityLoaded(false); // Desmonta UnityView al capturar la imagen
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
        }, 2000); // Asegúrate de que el archivo esté listo
      }
    } else {
      showMessage("Pin Not Found.", "error");
    }
  };

  const onDonePress = async () => {
    let updatedData = capturedImage;
    try {
      // Capturar la vista dentro de ViewShot
      const capturedUri = await viewShotRef.current.capture();
      updatedData = capturedUri; // Actualizar con la imagen capturada con filtro
    } catch (error) {
      console.error("Error capturando la imagen con filtros:", error);
    }

    navigation.navigate({
      name: "ArChallengeShare",
      params: {
        challengeObj: {
          ...challengeObj,
          geo_site: {...selectedGeoSite, pin_challenge: undefined},
        },
        captureData: updatedData,
        challengeType: CHALLENGES_TYPE.PIN_CHECK_IN,
      },
    });
  };

  const retakeButtonHandler = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsUnityLoaded(true);
  };

  const sendBloomValuesToUnity = () => {
    const bloomData = {threshold, intensity};

    if (unityRef.current) {
      unityRef.current.postMessage("PosProcessing", "UpdateBloomValues", JSON.stringify(bloomData));
    }
  };

  const eraseFile = async () => {
    try {
      const basePath = RNFS.ExternalStorageDirectoryPath || RNFS.DocumentDirectoryPath;
      const androidFilePath = `${basePath}/Android/data/com.roam_reality/files`;

      await keepFileMostRecent(androidFilePath, ".png");
    } catch (error) {
      console.error(error);
    }
  };

  const viewNotification = () => {
    if (!isMeInsideInSite) {
      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleNotification",
        JSON.stringify({...dataNotificationUnity, isNotification: true})
      );

      setTimeout(() => {
        if (unityRef.current) {
          unityRef.current.postMessage(
            "Scriptposition",
            "SetVisibleNotification",
            JSON.stringify({...dataNotificationUnity, isNotification: false})
          );
        }
      }, 5000);
    }
  };

  const enableButtonPhoto = async () => {
    if (unityRef.current) {
      const messageData = {
        typeChallenge: "PHOTO",
        arChallenge: false,
      };

      if (isMeInsideInSite) {
        unityRef.current.postMessage(
          "Scriptposition",
          "SetVisibleNotification",
          JSON.stringify({...dataNotificationUnity, isNotification: false})
        );
        messageData.isLocation = true;
      } else {
        messageData.isLocation = false;
      }

      unityRef.current.postMessage("screen", "SetTypeChallenge", JSON.stringify(messageData));
    }
  };

  const PointsCount = async () => {
    if (unityRef.current && challengeObj?.points) {
      const pointData = {
        points: challengeObj.points,
        isPointView: true,
      };
      unityRef.current.postMessage("Scriptposition", "SetVisiblePoint", JSON.stringify(pointData));
    }
  };

  const keepFileMostRecent = async (ruta, extension = "") => {
    try {
      const files = await RNFS.readDir(ruta);
      const filteredFiles = files.filter(
        file => file.isFile() && (extension === "" || file.name.endsWith(extension))
      );

      if (filteredFiles.length <= 0) {
        return;
      }
      filteredFiles.sort((a, b) => b.mtime - a.mtime);

      const archivosParaEliminar = filteredFiles.slice(1);

      for (const file of archivosParaEliminar) {
        await RNFS.unlink(file.path);
      }
    } catch (error) {
      console.error(error);
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
    const buttonInfo = data?.enableButton;
    const buttonBack = data?.backPress;
    const buttonPhotoIsPressed = data?.ispressed;

    if (buttonBack) {
      navigation?.goBack();
    }

    if (buttonPhotoIsPressed && !isMeInsideInSite) {
      viewNotification();
    }

    if (data.photoVideoButton?.isPhoto && isMeInsideInSite) {
      setCapturedImage(data.photoVideoButton?.filepath);
      setIsUnityLoaded(false);
      eraseFile();
    }
    if (data.photoVideoButton?.isPhoto == false) {
      setCapturedVideo(data.photoVideoButton?.filepath);
      setIsUnityLoaded(false);
    }
    if (data.infoButton?.isButton) {
      setChallengeInformationView(data.infoButton?.isButton);
    }
  };
  const modals = (
    <ViewInfoModal
      isVisible={challengeInformationView}
      onClose={closeViewInfoButtonHandler}
      content={viewInfoModalContent}
    />
  );

  let screenPadding = {};
  if (!isUnityLoaded) {
    screenPadding = {paddingBottom: 24};
  }

  useEffect(() => {
    if (unityRef.current) {
      console.log("cambio de scena");
      unityRef.current.postMessage("SceneLoader", "LoadSpecificScene", "ARReactNative");
    }
  }, [unityRef.current]);

  useEffect(() => {
    checkPermission();
    getLocation();
    getLocationUpdates();
    return () => stopLocationUpdates();
  }, []);

  useEffect(() => {
    if (challengeObj && modelFile) {
      checkIfModelExist();
    }
  }, [challengeObj]);

  useEffect(() => {
    if (challengeObjParameters) {
      setThreshold(parseFloat(challengeObjParameters?.bloom_threshold) || 0.9);
      setIntensity(parseFloat(challengeObjParameters?.bloom_intensity) || 3);
      setPosition({
        x: parseFloat(challengeObjParameters?.positionX) || 0,
        y: parseFloat(challengeObjParameters?.positionY) || 0,
        z: parseFloat(challengeObjParameters?.positionZ) || 0,
      });
      setScale({
        x: parseFloat(challengeObjParameters?.scale_object) || 1,
        y: parseFloat(challengeObjParameters?.scale_object) || 1,
        z: parseFloat(challengeObjParameters?.scale_object) || 1,
      });
      setEmissionValue(parseFloat(challengeObjParameters?.emission_value) || 1);
    }
  }, [challengeObjParameters]);

  useFocusEffect(() => {
    const timer = setTimeout(() => {
      if (unityRef.current) {
        PointsCount();
        unityRef.current.postMessage(
          "Scriptposition",
          "SetVisibleButton",
          JSON.stringify({
            setVisibleButtonPosition: true,
          })
        );
        if (modelOBJ && textureBase && emissionValue && textureEmission && isUnityLoaded) {
          sendModelDataToUnitySpawn();
          sendBloomValuesToUnity();
        }
        if (isUnityLoaded && isMeInsideInSite) {
          enableButtonPhoto();
        }
      }
    }, 700);
    return () => clearTimeout(timer);
  });
  return (
    <ChallengeScreen
      title={`Location Check In\n${selectedGeoSite.name}`}
      appHeader={false}
      style={{
        paddingHorizontal: 0,
        paddingTop: "11%",
        height: "100%",
        backgroundColor: "#000",
        ...screenPadding,
      }}
      modals={modals}
      headerRightComponent={<ViewInfoButton onPress={viewInfoButtonHandler} showOnHeader />}
      scrollable={false}
    >
      <UnityARCamera
        width="100%"
        height="100%"
        unityRef={unityRef}
        isProcessingMedia={processingMedia}
        isUnityLoaded={isUnityLoaded}
        capturedImage={capturedImage}
        capturedVideo={capturedVideo}
        onUnityMessage={handleUnityMessage}
        imageFilter={{
          challengeObj: {...challengeObj, challenge_type: CHALLENGES_TYPE.PIN_CHECK_IN},
          viewShotRef: viewShotRef,
        }}
      />
      {!isUnityLoaded && (
        <CameraControls
          onRetake={retakeButtonHandler}
          onDone={onDonePress}
          onCameraPress={_takeScreenshot}
          hasCapturedContent={!!capturedImage}
          customInstructions={PIN_CHALLENGE_CONFIG.CUSTOM_INSTRUCTIONS}
        />
      )}
    </ChallengeScreen>
  );
};

export default PinChallenge;
