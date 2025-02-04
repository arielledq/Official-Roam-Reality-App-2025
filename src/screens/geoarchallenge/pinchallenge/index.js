import React, { useEffect, useRef, useState, useCallback } from "react";
import { Platform } from "react-native";

import { useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
import Sound from "react-native-sound";
import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import RNFS from "react-native-fs";
import theme from "assets/theme";

import CameraControls from "../../../components/CameraControls";
import UnityARCamera from "components/UnityArView";
import CaptureInfoView from "components/CaptureInfoView";
import ChallengeScreen from "components/ChallengeScreen";

import { showMessage } from "../../../util/helpers";
import {
  convertMetersToFeets,
  findNearestLocationPoint,
  getLocationDistance,
  hasLocationPermission,
  isLocationPointInPolygon,
} from "../../../util/LocationLib";
import { CHALLENGES_TYPE } from "constants";
import ViewInfoModal from "components/ViewInfoModal";
import ViewInfoButton from "components/ViewInfoButton";
import { PIN_CHALLENGE_CONFIG } from "constants";

const PinChallenge = () => {
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [distanceInFeet, setDistanceInFeet] = useState(0);
  const [isMeInsideInSite, setIsMeInsideInSite] = useState(false);
  const [detailsShow, setDetailsShow] = useState(true);
  const [modelOBJ, setModelOBJ] = useState(null);
  const [modelResource, setModelResource] = useState(null);
  const [textureBase, setTextureBase] = useState(null);
  const [textureEmission, setTextureEmission] = useState(null);
  const [foldefile, setFoldefile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourcesFiles, setSourcesFiles] = useState([]);
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [threshold, setThreshold] = useState(0);
  const [intensity, setIntensity] = useState(1);
  const [emissionValue, setEmissionValue] = useState(1);
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [processingMedia, setProcessingMedia] = useState(false);

  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const settings = useSelector(state => state.ar?.arSettings);

  const unityRef = useRef(null); // Unity reference
  const watchIdRef = useRef(null);
  const viewShotRef = useRef();

  const navigation = useNavigation();

  const challengeObj = selectedGeoSite.pin_challenge;
  const challengeObjParameters = challengeObj?.parameters;
  const modelFile = challengeObj.model_file;
  const viewInfoModalContent = challengeObj?.info;

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

  const unzipModelFile = (sourcePath, targetPath) => {
    const charset = "UTF-8";
    unzip(sourcePath, targetPath, charset)
      .then(path => {
        RNFS.readDir(path).then(result => {
          const sourcesArray = [];
          let objFile = null;
          let mtlFile = null;
          let baseTexture = null;
          let emissionTexture = null;

          result.forEach(file => {
            const filePath = Platform.OS === "android" ? `file://${file.path}` : file.path;
            if (file.name.includes(".obj")) {
              objFile = filePath;
            } else if (file.name.includes(".mtl")) {
              mtlFile = filePath;
            } else if (file.name.toLowerCase().includes("diffuse")) {
              baseTexture = filePath;
            } else if (file.name.toLowerCase().includes("emission")) {
              emissionTexture = filePath;
            } else {
              sourcesArray.push({ uri: filePath });
            }
          });

          setModelOBJ(objFile);
          setModelResource(mtlFile);
          setTextureBase(baseTexture);
          setTextureEmission(emissionTexture);
          setSourcesFiles(sourcesArray);
          setFoldefile(result);
          setLoading(false);
        });
      })
      .catch(err => {
        console.error("Error descomprimiendo el archivo:", err);
      });
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
    if (unityRef.current && modelOBJ && textureBase && emissionValue && textureEmission) {
      const modelData = {
        objFile: modelOBJ.replace("file://", ""), // Ruta del archivo OBJ
        mtlFile: modelResource ? modelResource.replace("file://", "") : null, // Ruta del archivo MTL
        textureBase: textureBase ? textureBase.replace("file://", "") : "", // Ruta de la textura base
        textureEmission: textureEmission ? textureEmission.replace("file://", "") : "", // Ruta de la textura de emisión
        scale, // Escala del modelo
        rotation, // Rotación del modelo
        emissionIntensity: emissionValue, // Intensidad de la emisión (float)
        rotationSpeed: Number(challengeObjParameters?.loop_delay) || 1, // Velocidad de rotación
        scaleSpeed: Number(challengeObjParameters?.scale_sensitivity) || 0.01, // Velocidad de escalado
        minScale: Number(challengeObjParameters?.min_pinch_scale) || 1,
        maxScale: Number(challengeObjParameters?.max_pinch_scale) || 1,
        isRotationEnabled: true,
        // ### DISTANCIA DONDE SE REPOSICIONARA NUEVAMENTE LA ESTRELLA ## //
        distanceCamera: 2, // AGREGAR PARA RECIBIR DESDE EL BACK

        //VISIBLE OBJECT//
        isVisible: true,

        /* ###POSICIONAMIENTO MEDIANTE GPS### 
        useGPS: true, // Activar GPS
        gpsLatitude: siteLatitude || 0, // Latitud del GPS
        gpsLongitude: siteLongitude || 0, // Longitud del GPS
         */
        position: {
          x: parseFloat(challengeObjParameters?.positionX) || 0,
          y: parseFloat(challengeObjParameters?.positionY) || 0,
          z: 2 || 0.4,
        },
      };
      unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));
    } else {
      console.log("No pasó la validación: Unity no está listo o faltan datos.");
    }
    /* ###SUAVIZAR LA NUEVA REPOSICION DEL OBJETO###
    if (modelData.useGPS) {
      const gpsConfig = {
        smoothingFactor: 0.1, // Factor de suavizado del GPS
        minGPSAccuracy: 5.0, // Precisión mínima aceptable del GPS
        scaleFactor: 1.0, // Factor de escala para las coordenadas GPS
        maxWait: 20, // Tiempo máximo de espera para inicializar el GPS
        isVisibleObject: true, // Controlar visibilidad inicial
      };
      console.log("Enviando configuración de GPS a Unity:", gpsConfig);
      unityRef.current.postMessage(
        "OBJImport", // GameObject que contiene el script
        "ConfigureGPSFromReact", // Método del script
        JSON.stringify(gpsConfig)
      );
    }*/
  };
  const isLoadingUnity = () => {
    unityRef.current.postMessage(
      "OBJImport",
      "SetLoadingVisibility",
      JSON.stringify({ isVisible: false })
    );
  };
  const sendBloomValuesToUnity = () => {
    const bloomData = { threshold, intensity };
    if (unityRef.current) {
      unityRef.current.postMessage("PosProcessing", "UpdateBloomValues", JSON.stringify(bloomData));
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
      ]).then(response => {});
    } else if (Platform.OS === "ios") {
      requestMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MICROPHONE,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
      ]).then(response => {});
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
        accuracy: { android: "high", ios: "best" },
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
        accuracy: { android: "high", ios: "best" },
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
      let arrayPoints = points.map(point => ({ latitude: point[1], longitude: point[0] }));
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
                  // setFileFound(foundFile.path);
                  // setCaptureData(foundFile.path);
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

    navigation.replace("ArChallengeShare", {
      challengeObj: { ...challengeObj, geo_site: { ...selectedGeoSite, pin_challenge: undefined } },
      captureData: updatedData,
      challengeType: CHALLENGES_TYPE.PIN_CHECK_IN,
    });
  };

  const retakeButtonHandler = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsUnityLoaded(true);
  };

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
      setIntensity(parseFloat(challengeObjParameters?.bloom_intensity) || 5);
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

  useFocusEffect(
    useCallback(() => {
      if (unityRef.current && modelOBJ && textureBase && emissionValue && textureEmission) {
        sendBloomValuesToUnity();
        PointsCount();
        notificationView();
        if (!isMeInsideInSite) {
          isLoadingUnity();
          unityRef.current.postMessage(
            "Scriptposition",
            "SetVisibleButton",
            JSON.stringify({
              setVisibleButtonPosition: false,
            })
          );
        }
        if (isMeInsideInSite) {
          unityRef.current.postMessage(
            "Scriptposition",
            "SetVisibleButton",
            JSON.stringify({
              setVisibleButtonPosition: true,
            })
          );
        }
      }
    }, [modelOBJ, textureBase, emissionValue, textureEmission, isUnityLoaded, isMeInsideInSite])
  );
  useEffect(() => {
    if (unityRef.current) {
      notificationView();
    }
  }, [isMeInsideInSite]);
  const eraseFile = async () => {
    try {
      const basePath = RNFS.ExternalStorageDirectoryPath || RNFS.DocumentDirectoryPath;
      const androidFilePath = `${basePath}/Android/data/com.roam_reality/files`;

      await keepFileMostRecent(androidFilePath, ".png");
    } catch (error) {
      console.error(error);
    }
  };
  const notificationView = async () => {
    if (unityRef.current) {
      // Enviar mensaje a Unity para iniciar la grabación
      const data = {
        isNotification: !isMeInsideInSite,
        textNotification: "You need to be on the location to capture the event photo.",
      };

      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleNotification",
        JSON.stringify(data)
      );
      if (isMeInsideInSite == false) {
        sendModelDataToUnitySpawn();
        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: "PHOTO",
            arChallenge: false,
            isLocation: false,
          })
        );
      }
      if (isMeInsideInSite) {
        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: "PHOTO",
            arChallenge: false,
            isLocation: true,
          })
        );
        unityRef.current.postMessage(
          "Scriptposition",
          "SetVisibleButton",
          JSON.stringify({
            setVisibleButtonPosition: true,
          })
        );
        sendModelDataToUnitySpawn();
      }
    }
  };
  const PointsCount = async () => {
    if (unityRef.current) {
      // Enviar mensaje a Unity para iniciar la grabación
      const pointData = {
        points: "4",
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

  const acceptWaiverButtonHandler = () => {
    setDetailsShow(false);
    setIsUnityLoaded(true);
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
    buttonInfo = data?.enableButton;
    buttonBack = data?.backPress;

    if (buttonBack) {
      navigation?.goBack();
    }

    if (data.photoVideoButton?.isPhoto) {
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
      setIsUnityLoaded(true);
    }
  };
  const modals = (
    <>
      <CaptureInfoView
        isVisible={detailsShow}
        content={settings?.waiver_details}
        onAccept={acceptWaiverButtonHandler}
      />
      <ViewInfoModal
        isVisible={challengeInformationView}
        onClose={closeViewInfoButtonHandler}
        content={viewInfoModalContent}
      />
    </>
  );

  return (
    <ChallengeScreen
      title={`Location Check In\n${selectedGeoSite.name}`}
      appHeader={false}
      style={{
        paddingHorizontal: 0,
        // paddingTop: 20,
        height: "100%",
        backgroundColor: isUnityLoaded ? "#000" : theme.darkColors?.inputBG,
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
          challengeObj: { ...challengeObj, challenge_type: CHALLENGES_TYPE.PIN_CHECK_IN },
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
