import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Platform } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import RNFS from "react-native-fs";
import Sound from "react-native-sound";

import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import UnityARCamera from "components/UnityArView";
import CameraControls from "components/CameraControls";
import ChallengeFoundCaptureHeader from "components/ChallengeFoundCaptureHeader";

import { CHALLENGES_TYPE } from "constants";
import useStyles from "./styles";

const StarChallenge = ({ route }) => {
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
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

  const unityRef = useRef(null); // Unity reference

  const starChallengeObj = route.params?.starChallenge;
  const challengeObjParameters = route.params?.starChallenge?.geo_ar_star?.geo_site?.pin_challenge;
  const isStarChallenge = !!starChallengeObj?.id;

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

  // Download and unzip model files for each star
  const downloadAndPrepareModels = () => {
    // setLoading(true);
    const challengeObj = starChallengeObj?.geo_ar_star?.geo_site?.pin_challenge;
    const modelFile = challengeObj?.model_file;
    if (challengeObj?.challenge_choice === "IMAGE" && modelFile) {
      const filename = modelFile.split("/").pop().split("?")[0];
      const withoutExtFilename = filename.split(".")[0];
      const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;
      const downloadModelFile = (sourcePath, targetPath, modelFile) => {
        RNFetchBlob.config({
          fileCache: true,
          path: sourcePath,
        })
          .fetch("GET", modelFile)
          .progress((received, total) => {
            const progress = Math.trunc((received / total) * 100);
            console.log("Progreso de descarga:", progress, "%");
          })
          .then(res => {
            unzipModelFile(res.path(), targetPath);
          });
      };
      const unzipModelFile = (sourcePath, targetPath) => {
        unzip(sourcePath, targetPath, "UTF-8")
          .then(path => {
            RNFS.readDir(path)
              .then(result => {
                if (!result || !Array.isArray(result)) {
                  return;
                }
                const sourcesArray = [];
                let objFile = null;
                let mtlFile = null;
                let baseTexture = null;
                let emissionTexture = null;

                result.forEach(file => {
                  if (!file.name || !file.path) {
                    console.warn("Archivo inválido encontrado:", file);
                    return;
                  }

                  const filePath = Platform.OS === "android" ? `file://${file.path}` : file.path;

                  // Procesar cada tipo de archivo
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
                  setStarModels(objFile || ""); // Manejar valores nulos
                  setModelResource(mtlFile);
                  setTextureBase(baseTexture);
                  setTextureEmission(emissionTexture);
                });
              })
              .catch(error => {
                console.error("Error leyendo el directorio descomprimido:", error);
              });
          })
          .catch(error => {
            console.error("Error durante la descompresión:", error);
          });
      };

      RNFS.exists(sourcePath)
        .then(exists => {
          console.log("Archivo existe:", exists);
          if (exists) {
            unzipModelFile(sourcePath, targetPath);
          } else {
            downloadModelFile(sourcePath, targetPath, modelFile);
          }
        })
        .catch(error => {
          console.error("Error verificando existencia del archivo:", error);
        });
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
    navigation.replace("ArChallengeShare", {
      challengeObj: starChallengeObj,
      captureData: capturedImage,
      challengeType: CHALLENGES_TYPE.STAR,
    });
  };

  const sendModelDataToUnity = () => {
    console.log("Entro en modeldata");
    if (unityRef.current && textureBase && starModels) {
      console.log("Datos Enviados:", modelData);
      // Datos del modelo 3D
      const modelData = {
        objFile: starModels.replace("file://", ""),
        mtlFile: modelResource ? modelResource.replace("file://", "") : null,
        textureBase: textureBase ? textureBase.replace("file://", "") : "",
        textureEmission: textureEmission ? textureEmission.replace("file://", "") : "",
        scale: {
          x: challengeObjParameters?.scale_object
            ? Number(challengeObjParameters?.scale_object)
            : 0.05,
          y: challengeObjParameters?.scale_object
            ? Number(challengeObjParameters?.scale_object)
            : 0.05,
          z: challengeObjParameters?.scale_object
            ? Number(challengeObjParameters?.scale_object)
            : 0.05,
        },
        emissionIntensity: parseFloat(challengeObjParameters?.emission_value) || 1,
        rotationSpeed: Number(challengeObjParameters?.loop_delay) || 1,
        scaleSpeed: Number(challengeObjParameters?.scale_sensitivity) || 0.01,
        minScale: Number(challengeObjParameters?.min_pinch_scale) || 1,
        maxScale: Number(challengeObjParameters?.max_pinch_scale) || 1,
      };
      // Enviar datos del modelo a Unity
      unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));

      // Parámetros adicionales para el GPSHandler en Unity
      const parameters = {
        smoothing: 0.5, // Factor de suavizado
        scale: 1, // Factor de escala
        autoUpdate: false, // Control de actualización automática
      };

      unityRef.current.postMessage(
        "ObjectSpawner",
        "ConfigureParameters",
        JSON.stringify(parameters)
      );

      // Datos de los objetos GPS
      const start_site = starChallengeObj.location.coordinates;
      console.log("----", start_site);
      const objects = {
        objects: start_site.map(coord => ({
          latitude: coord[1], // Índice 1 corresponde a la latitud
          longitude: coord[0], // Índice 0 corresponde a la longitud
          isVisible: true,
          scale: 1,
          height: 0,
          updateRadius: 30.0,
        })),
      };

      console.log("Datos de los objetos GPS a enviar:", objects);

      // Enviar datos de objetos a Unity
      unityRef.current.postMessage(
        "ObjectSpawner",
        "SpawnObjectsFromReact",
        JSON.stringify(objects)
      );
      const visibilityConfig = {
        isVisible: true,
      };

      unityRef.current.postMessage(
        "OBJImport", // Nombre del script en Unity
        "SetVisibilityFromReact", // Método que se llamará
        JSON.stringify(visibilityConfig)
      );
    }
  };

  const sendBloomValuesToUnity = () => {
    const bloomData = { threshold, intensity };
    if (unityRef.current) {
      unityRef.current.postMessage("PosProcessing", "UpdateBloomValues", JSON.stringify(bloomData));
    }
  };

  useEffect(() => {
    if (!unityRef.current) {
      return;
    }

    if (starModels && textureBase && unityRef.current) {
      sendModelDataToUnity();
      sendBloomValuesToUnity();
    }
  }, [isUnityLoaded]);

  useEffect(() => {
    if (challengeObjParameters) {
      setThreshold(parseFloat(challengeObjParameters?.bloom_threshold) || 0.1);
      setIntensity(parseFloat(challengeObjParameters?.bloom_intensity) || 2);
    }
  }, [challengeObjParameters]);

  useEffect(() => {
    checkPermission();
    downloadAndPrepareModels();
  }, []);

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "AR Star Hunt " + starChallengeObj?.geo_ar_star?.geo_site?.pin_challenge?.name,
          numberOfLines: 2,
          style: [_styles.heading],
        }}
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* First View (Stars Collected and Points) */}
        <ChallengeFoundCaptureHeader
          leftTitle="Stars Collected"
          leftValue={`${starChallengeObj?.captured_stars} / ${starChallengeObj?.total_stars}`}
          points={starChallengeObj?.geo_ar_star?.geo_site?.pin_challenge?.points}
          isStarChallenge
        />

        {/* Unity AR Camera */}
        <UnityARCamera
          unityRef={unityRef}
          isProcessingMedia={processingMedia}
          isUnityLoaded={isUnityLoaded}
          capturedImage={capturedImage}
          capturedVideo={capturedVideo}
        />

        {/* Footer Info Box */}
        <CameraControls
          onRetake={retakeButtonHandler}
          onDone={onDonePress}
          onCameraPress={takeScreenshot}
          hasCapturedContent={!!capturedImage}
          customInstructions="Stand next to the Star, resize as needed, snap your photo"
        />
      </ScrollView>
    </BackgroundWithImage>
  );
};

export default StarChallenge;
