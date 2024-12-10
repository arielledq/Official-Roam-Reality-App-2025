import React, { useEffect, useRef, useState, useCallback } from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { showMessage } from "../../../util/helpers";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
import {
  convertMetersToFeets,
  findNearestLocationPoint,
  getLocationDistance,
  hasLocationPermission,
  isLocationPointInPolygon,
} from "../../../util/LocationLib";

import Sound from "react-native-sound";

import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import RNFS from "react-native-fs";
import CameraControls from "../../../components/CameraControls";
import UnityARCamera from "components/UnityArView";
import CaptureInfoView from "components/CaptureInfoView";
import ChallengeScreen from "components/ChallengeScreen";
import PinFoundCaptureHeader from "components/PinFoundCaptureHeader";
import PinInfoCaptureFooter from "components/PinInfoCaptureFooter";
import { CHALLENGES_TYPE } from "constants";

const PinChallenge = () => {
  const navigation = useNavigation();
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const challengeObj = selectedGeoSite.pin_challenge;
  const challengeObjParameters = challengeObj?.parameters;
  const modelFile = challengeObj.model_file;
  const settings = useSelector(state => state.ar?.arSettings);
  const watchIdRef = useRef(null);

  let siteLatitude = 0;
  let siteLongitude = 0;
  if (selectedGeoSite?.lat_long?.coordinates?.length === 2) {
    siteLatitude = selectedGeoSite.lat_long.coordinates[1];
    siteLongitude = selectedGeoSite.lat_long.coordinates[0];
  }

  const unityRef = useRef(null); // Unity reference
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [distanceInFeet, setDistanceInFeet] = useState(0);
  const [isMeInsideInSite, setIsMeInsideInSite] = useState(false);
  const [detailsShow, setDetailsShow] = useState(true);

  const [fileFound, setFileFound] = useState(null);
  const [captureData, setCaptureData] = useState("");
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
  const [recordingStart, setRecordingStart] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [recordTimeInMillis, setRecordTimeInMillis] = useState(0);
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [processingMedia, setProcessingMedia] = useState(false);
  const [unityViewDimensions, setUnityViewDimensions] = useState({ width: 0, height: 0 });

  const handleUnityViewLayout = event => {
    const { width, height } = event.nativeEvent.layout;
    setUnityViewDimensions({ width, height });
    console.log(`UnityView dimensiones: ${width} x ${height}`);
  };

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
    if (unityRef.current && modelOBJ && textureBase) {
      console.log(siteLatitude, siteLongitude);
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
        // useGPS: true, // Activar GPS
        // gpsLatitude: siteLatitude || 0, // Latitud del GPS
        // gpsLongitude: siteLongitude || 0, // Longitud del GPS
        position: {
          x: parseFloat(challengeObjParameters?.positionX) || 0,
          y: parseFloat(challengeObjParameters?.positionY) || 0,
          z: parseFloat(challengeObjParameters?.positionZ) || 1,
        },
      };
      // console.log("AAAAAASITEEEEEEEEE", selectedGeoSite);
      console.log("Enviando datos del modelo a Unity:", modelData);
      unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));
      const visibilityConfig = {
        isVisible: true,
      };

      unityRef.current.postMessage(
        "OBJImport", // Nombre del script en Unity
        "SetVisibilityFromReact", // Método que se llamará
        JSON.stringify(visibilityConfig)
      );
      console.log("Todos los datos fueron enviados a Unity.");
    } else {
      console.log("No pasó la validación: Unity no está listo o faltan datos.");
    }
    // if (modelData.useGPS) {
    //   const gpsConfig = {
    //     smoothingFactor: 0.1, // Factor de suavizado del GPS
    //     minGPSAccuracy: 5.0, // Precisión mínima aceptable del GPS
    //     scaleFactor: 1.0, // Factor de escala para las coordenadas GPS
    //     maxWait: 20, // Tiempo máximo de espera para inicializar el GPS
    //     isVisibleObject: true, // Controlar visibilidad inicial
    //   };
    //   console.log("Enviando configuración de GPS a Unity:", gpsConfig);
    //   unityRef.current.postMessage(
    //     "OBJImport", // GameObject que contiene el script
    //     "ConfigureGPSFromReact", // Método del script
    //     JSON.stringify(gpsConfig)
    //   );
    // }
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
    // if (true) {
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
                  setFileFound(foundFile.path);
                  setCaptureData(foundFile.path);
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

  const onDonePress = () => {
    navigation.replace("ArChallengeShare", {
      challengeObj: challengeObj,
      captureData: capturedImage,
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
      if (unityRef.current && modelOBJ) {
        sendModelDataToUnitySpawn();
        sendBloomValuesToUnity();
      }
    }, [modelOBJ, textureBase, isUnityLoaded])
  );

  const acceptWaiverButtonHandler = () => {
    setDetailsShow(false);
    setIsUnityLoaded(true);
  };

  const modals = (
    <>
      <CaptureInfoView
        isVisible={detailsShow}
        content={settings?.waiver_details}
        onAccept={acceptWaiverButtonHandler}
      />
    </>
  );

  return (
    <ChallengeScreen title={`Location Check In\n${selectedGeoSite.name}`} modals={modals}>
      <PinFoundCaptureHeader pinFound={!!isMeInsideInSite} points={challengeObj?.points} />

      <UnityARCamera
        unityRef={unityRef}
        isProcessingMedia={processingMedia}
        isUnityLoaded={isUnityLoaded}
        onUnityLayout={handleUnityViewLayout}
        capturedImage={capturedImage}
        capturedVideo={capturedVideo}
      />

      <CameraControls
        onRetake={retakeButtonHandler}
        onDone={onDonePress}
        onCameraPress={_takeScreenshot}
        hasCapturedContent={!!capturedImage}
        // customInstructions="Stand in frame next to the pin, resize and shift as needed, snap your photo"
        customInstructions="Stand next to the pin, resize as needed, snap your photo"
      />

      <PinInfoCaptureFooter pinFound={!!isMeInsideInSite} distance={distanceInFeet} />
    </ChallengeScreen>
  );
};

export default PinChallenge;
