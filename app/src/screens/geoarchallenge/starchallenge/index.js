import React, {useCallback, useEffect, useRef, useState} from "react";
import {Platform} from "react-native";

import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {requestMultiple, PERMISSIONS} from "react-native-permissions";
import RNFetchBlob from "rn-fetch-blob";
import {useSelector} from "react-redux";
import RNFS from "react-native-fs";
import Sound from "react-native-sound";
// import {unzip} from "react-native-zip-archive";
import Geolocation from "react-native-geolocation-service";

import {CHALLENGES_TYPE} from "../../../constants";
import useStyles from "./styles";

import UnityARCamera from "components/UnityArView";
import ChallengeScreen from "components/ChallengeScreen";
import ARModeModal from "components/ARModeModal/index.tsx";
import {handleUnzipProcess, showMessage} from "../../../util/helpers";

import NotificationModal from "components/ARModeModal/NotificationModal";

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
  const [notificationMode, setNotificationMode] = useState("scan");
  const [loading, setLoading] = useState(false);

  const challengeObj = selectedChallengeOverride;
  const modelFile = challengeObj?.model_file;

  // Check and request permissions
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

  const dataGpsChallegen = (selectedSSNN, challengeData) => {
    setSelectedChallengeOverride(challengeData); // Guarda challengeData para usarlo como nuevo "pin_challenge"
  };

  // Download and unzip model files for each star
  // const downloadAndPrepareModels = () => {
  //   // setLoading(true);
  //   const challengeObj = selectedChallengeOverride;
  //   const modelFile = challengeObj?.model_file;
  //   if (challengeObj?.challenge_requirement === "PHOTO" && modelFile) {
  //     const filename = modelFile.split("/").pop().split("?")[0];
  //     const withoutExtFilename = filename.split(".")[0];
  //     const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
  //     const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;
  //     const downloadModelFile = (sourcePath, targetPath, modelFile) => {
  //       RNFetchBlob.config({
  //         fileCache: true,
  //         path: sourcePath,
  //       })
  //         .fetch("GET", modelFile)
  //         .progress((received, total) => {
  //           const progress = Math.trunc((received / total) * 100);
  //         })
  //         .then(res => {
  //           unzipModelFile(res.path(), targetPath);
  //         });
  //     };
  //     const unzipModelFile = (sourcePath, targetPath) => {
  //       unzip(sourcePath, targetPath, "UTF-8")
  //         .then(path => {
  //           RNFS.readDir(path)
  //             .then(result => {
  //               if (!result || !Array.isArray(result)) {
  //                 return;
  //               }
  //               const sourcesArray = [];
  //               let objFile = null;
  //               let mtlFile = null;
  //               let baseTexture = null;
  //               let emissionTexture = null;
  //               result.forEach(file => {
  //                 if (!file.name || !file.path) {
  //                   console.warn("Archivo inválido encontrado:", file);
  //                   return;
  //                 }
  //                 const filePath = Platform.OS === "android" ? `file://${file.path}` : file.path;
  //                 // Procesar cada tipo de archivo
  //                 if (file.name.includes(".obj")) {
  //                   objFile = filePath;
  //                 } else if (file.name.includes(".mtl")) {
  //                   mtlFile = filePath;
  //                 } else if (file.name.toLowerCase().includes("diffuse")) {
  //                   baseTexture = filePath;
  //                 } else if (file.name.toLowerCase().includes("emission")) {
  //                   emissionTexture = filePath;
  //                 } else {
  //                   sourcesArray.push({uri: filePath});
  //                 }
  //                 setStarModels(objFile || ""); // Manejar valores nulos
  //                 setModelResource(mtlFile);
  //                 setTextureBase(baseTexture);
  //                 setTextureEmission(emissionTexture);
  //               });
  //             })
  //             .catch(error => {
  //               console.error("Error leyendo el directorio descomprimido:", error);
  //             });
  //         })
  //         .catch(error => {
  //           console.error("Error durante la descompresión:", error);
  //         });
  //     };

  //     RNFS.exists(sourcePath)
  //       .then(exists => {
  //         if (exists) {
  //           unzipModelFile(sourcePath, targetPath);
  //         } else {
  //           downloadModelFile(sourcePath, targetPath, modelFile);
  //         }
  //       })
  //       .catch(error => {
  //         console.error("Error verificando existencia del archivo:", error);
  //       });
  //   }
  // };
  useEffect(() => {
    if (challengeObj && modelFile) {
      checkIfModelExist();
    }
  }, [challengeObj]);
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
      // setSourcesFiles(extractedData.sourcesFiles);
      // setFoldefile(extractedData.foldefile);
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

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setUserLocation(newLocation); // ✅ Estado local
        updateUnityLocation(newLocation); // Enviás a Unity
      },
      error => {
        console.error("Error obteniendo ubicación:", error);
      },
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

  const updateUnityLocation = location => {
    if (unityRef?.current) {
      if (location.latitude && location.longitude && starModels) {
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

  useEffect(() => {
    if (challengeObjParameters) {
      setThreshold(parseFloat(challengeObjParameters?.bloom_threshold) || 0.1);
      setIntensity(parseFloat(challengeObjParameters?.bloom_intensity) || 2);
    }
  }, [challengeObjParameters]);
  useEffect(() => {
    checkPermission();
  }, [selectedChallengeOverride]);

  const sendBloomValuesToUnity = () => {
    const bloomData = {threshold, intensity};
    if (unityRef.current) {
      unityRef.current.postMessage("PosProcessing", "UpdateBloomValues", JSON.stringify(bloomData));
    }

  };
  const sendModelDataToUnity = () => {
    if (unityRef.current && textureBase && starModels && userLocation) {
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
        // isVisible: notificationMode === 'scan',
        isVisible: true,
        position: {
          x: parseFloat(selectedChallengeOverride.parameters?.positionX) || 0, // No optional chaining here, already checked above
          y: parseFloat(selectedChallengeOverride.parameters?.positionY) || 0,
          z: 2 || 0.4,
        },
        distanceCamera: 2,
        isHuntMode: false,
        allowScale: true,
          // useGPS: false,
          // gpsLatitude:  -25.296689,
          // gpsLongitude: -57.589390,
      };
      setTimeout(() => {
        unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));
      }, 500);
      setSendModelData(true)
    }

  };
  const sendSpawnData= () => {
    if (!unityRef?.current ) return;
    const spawnData = {
      objects: [
        {
          id: "1",
          latitude: -25.29674605035726,
          longitude: -57.58958597325399,
          scale: 1.0,
          height: 1,
          isVisible : true,
          updateRadius: 14.0,
        },
      ]
    }
    unityRef.current.postMessage("ObjectSpawner", "SpawnObjectsFromReact", JSON.stringify(spawnData));
  };
  const PointsCount = async () => {
    if (unityRef.current && selectedChallengeOverride?.points) {
      console.log("selectedDestination?.points", selectedChallengeOverride?.points)
      const pointData = {
        points: selectedChallengeOverride?.points,
        isPointView: true,
      };
      unityRef.current.postMessage("Scriptposition", "SetVisiblePoint", JSON.stringify(pointData));
    }
  };
  useEffect(() => {
    if (!unityRef.current || !starModels || !textureBase) return;
    sendModelDataToUnity();
    console.log("SendModel1 - ")

    if (sendModelData && userLocation) {
      setTimeout(() => {
        PointsCount();
        console.log("send data model 2 ---------------- bbbbbbbbbbbbbb")
        setTimeout(sendSpawnData, 1000);
      }, 500);
    }
  }, [isUnityLoaded, starModels, textureBase, sendModelData, userLocation]);

  const closeModalARMode = () => {
    setOpenModalARMode(false);
    setIsUnityLoaded(true);
  };

  const handleUnityMessage = result => {
    const data = JSON.parse(result.nativeEvent.message);
    console.log("DATA UNITY",data);
    // const buttonInfo = data.enableButton;
    const buttonBack = data.backPress;
    const buttonARMode = data?.ARMode;
    //
    if (buttonBack) {
      navigation?.goBack();
      if (Platform.OS === "android") {
        unityRef.current?.unloadUnity?.();
        unityRef.current.postMessage("CloseAndReset", "ReiniciarEscena");
      }
    }
    if (buttonARMode) {
      setOpenModalARMode(true);
    }
    // if (
    //     data?.objectDetect &&
    //     Array.isArray(data.objectDetect) &&
    //     data.objectDetect.length > 0 &&
    //     data.objectDetect[0]?.ObjectDetecte === true
    // ) {
    //   console.log("Objeto detectado:", data.objectDetect[0].Name);
    //   setOpenModalARMode(true);
    // }
    // else {
    //   // setOpenModalARMode(false)
    //   console.log("hihi")
    // }
    if (data?.touchEvent?.objectTouched === true) {
      console.log("Objeto fue tocado por el usuario:", data.touchEvent.name);
      // podés abrir modal, dar puntos, animar, lo que necesites
      setOpenModalARMode(true);
    }
    //
    // if (data.photoVideoButton?.isPhoto) {
    //   setCapturedImage(data.photoVideoButton?.filepath);
    //   setIsUnityLoaded(false);
    //   eraseFile();
    // }
    // if (data.photoVideoButton?.isPhoto == false) {
    //   setCapturedVideo(data.photoVideoButton?.filepath);
    //   setIsUnityLoaded(false);
    // }
    // if (data.infoButton?.isButton) {
    //   setChallengeInformationView(data.infoButton?.isButton);
    //   setIsUnityLoaded(true);
    // }
  };
  const notificationUnity = () => {
    if (unityRef.current) {
      const data = {
        isNotification: true,
        textNotification: "Presionar sobre la estrella.",
        titleNotification: "Estrella encontrada"
      }
      unityRef.current.postMessage("Scriptposition", "SetVisibleNotification", JSON.stringify(data));
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        unityRef.current?.resumeUnity?.();
        unityRef.current?.windowFocusChanged?.(true);
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
        isDetectionEnabled : true,
        detectionDistance : 80
      }

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
    console.log("Esto se ejecuta una vez Detector de objeto y Loading");
  }, []);

  return (
    <ChallengeScreen
      title="AR Star Hunt "
      appHeader={false}
      style={{
        paddingHorizontal: 0,
        paddingTop: "11%",
        height: "100%",
        backgroundColor: "#000",
        // ...screenPadding,
      }}
    >
      <UnityARCamera
        width={"100%"}
        height={"100%"}
        unityRef={unityRef}
        isProcessingMedia={processingMedia}
        // onUnityLayout={handleUnityViewLayout}
        onUnityMessage={handleUnityMessage}
        isUnityLoaded={isUnityLoaded}
        capturedImage={capturedImage}
        capturedVideo={capturedVideo}
      />
      <ARModeModal
        selectedDestination={destinationData}
        isVisible={openModalARMode}
        onPointsGranted={dataGpsChallegen}
        onClose={closeModalARMode}
        setShowNotification={setShowNotification}
        setNotificationMode={setNotificationMode}
      />

      <NotificationModal
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        // selectedDestination={destinationData}
        // sponsor={selectedDestination?.geo_ar_star?.geo_site?.pin_challenge?.sponsored}
        // onPointsGranted={dataGpsChallegen}
        selectedMode={notificationMode}
      />
    </ChallengeScreen>
  );
};

export default StarChallenge;
