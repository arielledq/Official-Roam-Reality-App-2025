import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import UnityARCamera from "components/UnityArView";
import CameraControls from "components/CameraControls";
import ChallengeScreen from "components/ChallengeScreen";
import ViewInfoModal from "components/ViewInfoModal";
import { launchImageLibrary } from "react-native-image-picker";

import { CHALLENGES_TYPE, CAPTURE_CHALLENGE_TYPE } from "../../../constants";
import { CAMERA_NOTIFICATION } from "constants";

const RNFS = require("react-native-fs");
const Sound = require("react-native-sound");

const ArChallengeCapture = ({ route, navigation }) => {
  const [unityViewDimensions, setUnityViewDimensions] = useState({ width: 0, height: 0 });
  const [modelOBJ, setModelOBJ] = useState(null);
  const [modelResource, setModelResource] = useState(null);
  const [textureBase, setTextureBase] = useState(null);
  const [textureEmission, setTextureEmission] = useState(null);
  const [foldefile, setFoldefile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourcesFiles, setSourcesFiles] = useState([]);
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [threshold, setThreshold] = useState(0);
  const [intensity, setIntensity] = useState(1);
  const [emissionValue, setEmissionValue] = useState(1);
  const [recordingStart, setRecordingStart] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [processingMedia, setProcessingMedia] = useState(false);
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
  const [isVideo, setIsvideo] = useState(false);

  const unityRef = useRef(null);
  const viewShotRef = useRef();

  const challengeObj = route?.params?.challengeObj;
  const challengeObjParameters = route?.params?.challengeObj?.parameters;
  const modelFile = route?.params?.challengeObj?.model_file;
  const openGallery = route?.params?.openGallery;

  const challengeHasFilters = challengeObj?.ar_filters?.length > 0;
  const challengeType = challengeObj?.challenge_requirement;
  const viewInfoModalContent = challengeObj?.info;

  // FILTERS PENDING
  //  const ar_filters = challengeObj?.ar_filters;
  //  const imageUrls = ar_filters.map(filter => filter.image);
  //  const gradientColors = ar_filters[0]?.gradient_colors || ["#FF0000", "#00FF00"];
  //  const gradientDirection = ar_filters[0]?.gradient_direction === "TOP_TO_BOTTOM";

  const handleUnityViewLayout = event => {
    const { width, height } = event.nativeEvent.layout;
    setUnityViewDimensions({ width, height });
    // console.log(`UnityView dimensiones: ${width} x ${height}`);
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

  useEffect(() => {
    if (challengeObj && modelFile) {
      checkIfModelExist();
    }
  }, [challengeObj]);

  const checkIfModelExist = () => {
    if (challengeObj && modelFile) {
      const filename = modelFile.split("/").pop().split("?")[0];
      const withoutExtFilename = filename.split(".")[0];
      const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;

      RNFS.exists(sourcePath)
        .then(exists => {
          if (exists) {
            unzipModelFile(sourcePath, targetPath);
          } else {
            downloadModelFile(sourcePath, targetPath);
          }
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    if (challengeObjParameters) {
      setThreshold(challengeObjParameters?.bloom_threshold || 0.9);
      setIntensity(challengeObjParameters?.bloom_intensity || 5);
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

  const sendBloomValuesToUnity = useCallback(() => {
    const bloomData = { threshold: 1, intensity: 1 };

    if (unityRef.current) {
      unityRef.current.postMessage("PosProcessing", "UpdateBloomValues", JSON.stringify(bloomData));
    }
  }, [unityRef, threshold, intensity]);

  const viewNotification = isNotification => {
    if (unityRef.current) {
      const message = CAMERA_NOTIFICATION[challengeType] || "Default notification text";
      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleNotification",
        JSON.stringify({ textNotification: message, isNotification: isNotification })
      );
    }
  };

  useEffect(() => {
    viewNotification(true);
    setTimeout(() => {
      viewNotification(false);
    }, 5000);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!unityRef.current) return;

      sendBloomValuesToUnity();
      isLoadingUnity();
      PointsCount();
      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleButton",
        JSON.stringify({
          setVisibleButtonPosition: false,
        })
      );

      if (!!CAPTURE_CHALLENGE_TYPE[challengeType]) {
        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: challengeType,
            arChallenge: true,
            isLocation: false,
          })
        );
      }
    }, [unityRef.current, isLoadingUnity, PointsCount, isUnityLoaded])
  );

  const PointsCount = useCallback(async () => {
    if (unityRef.current) {
      console.log("useCall==== POINTSCOUNT");
      // Enviar mensaje a Unity para iniciar la grabación
      const pointData = {
        points: challengeObj?.points,
        isPointView: true,
      };
      unityRef.current.postMessage("Scriptposition", "SetVisiblePoint", JSON.stringify(pointData));
    }
  }, [unityRef.current]);

  const isLoadingUnity = useCallback(() => {
    if (!unityRef.current) return;
    console.log("useCall==== ISLOADING");
    unityRef.current.postMessage(
      "OBJImport",
      "SetLoadingVisibility",
      JSON.stringify({ isVisible: false })
    );
  }, [unityRef.current]);
  // useEffect(() => {
  //   if (unityRef.current && challengeHasFilters) {
  //     loadingFalse();
  //   }
  // }, [isUnityLoaded]);

  // Ejemplos de uso:
  //   EnviarComandoAUnity('pause');  // Para pausar el juego
  //   EnviarComandoAUnity('resume'); // Para reanudar el juego
  //   EnviarComandoAUnity('restart'); // Para reiniciar la escena
  //   EnviarComandoAUnity('close');  // Para cerrar Unity

  const playCameraSound = () => {
    Sound.setCategory("Playback");
    let cameraSound = new Sound("camerasound.mp3", Sound.MAIN_BUNDLE, error => {
      if (!error) cameraSound.play();
    });
  };

  const playRecordSound = () => {
    Sound.setCategory("Playback");
    let recordSound = new Sound("record.mp3", Sound.MAIN_BUNDLE, error => {
      if (!error) recordSound.play();
    });
  };

  const doneButtonHandler = async () => {
    const hasFilters = capturedImage && challengeObj?.ar_filters.length > 0;
    let updatedData = capturedImage ? capturedImage : capturedVideo;

    if (hasFilters) {
      try {
        // Capturar la vista dentro de ViewShot
        const capturedUri = await viewShotRef.current.capture();
        updatedData = capturedUri; // Actualizar con la imagen capturada con filtro
      } catch (error) {
        console.error("Error capturando la imagen con filtros:", error);
      }
    }

    // Navegar y pasar la captura actualizada
    navigation.replace("ArChallengeShare", {
      challengeObj: challengeObj,
      captureData: updatedData,
      challengeType: CHALLENGES_TYPE.PHOTO_VIDEO,
    });
  };

  useEffect(() => {
    requestMultiple([
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION,
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]).then(() => {
      if (openGallery) {
        pickFromGallery();
      }else{
        setIsUnityLoaded(true)
      }
    });
  }, []);

  const retakeButtonHandler = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    if (openGallery) {
      pickFromGallery();
    } else {
      setIsUnityLoaded(true);
    }
  };

  const startRecordVideoHandler = () => {
    if (capturedImage || capturedVideo) {
      return;
    }
    startRecordVideo();
  };

  const stopRecordVideoHandler = () => {
    if (recordingStart) {
      stopRecordVideo();
    }
  };

  const closeViewInfoButtonHandler = () => {
    setChallengeInformationView(false);
    setIsUnityLoaded(true);
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

  const modals = (
    <ViewInfoModal
      isVisible={challengeInformationView}
      onClose={closeViewInfoButtonHandler}
      content={viewInfoModalContent}
    />
  );

  //###Captura y Graba###//
  const handleUnityMessage = result => {
    const data = JSON.parse(result.nativeEvent.message);
    buttonInfo = data.enableButton;
    buttonBack = data.backPress;

    if (buttonBack) {
      navigation?.goBack();
    }

    if (data.photoVideoButton?.isPhoto) {
      setCapturedImage(data.photoVideoButton?.filepath);
      setIsUnityLoaded(false);
      playCameraSound();
      eraseFile();
    }
    if (data.photoVideoButton?.isPhoto == false) {
      playRecordSound();
      setCapturedVideo(data.photoVideoButton?.filepath);
      setIsUnityLoaded(false);
    }
    if (data.infoButton?.isButton) {
      setChallengeInformationView(data.infoButton?.isButton);
      setIsUnityLoaded(true);
    }
  };

  async function pickFromGallery() {
    setIsUnityLoaded(false);

    setTimeout(() => {
      let mediaType = "photo";
      switch (challengeType) {
        case CAPTURE_CHALLENGE_TYPE.VIDEO:
          mediaType = "video";

          break;
        case CAPTURE_CHALLENGE_TYPE.PHOTOVIDEO:
          mediaType = "mixed";

          break;

        default:
          mediaType = "photo";
          break;
      }

      const options = {
        mediaType: mediaType,
        includeBase64: false,
        quality: 1,
      };

      try {
        launchImageLibrary(options, response => {
          if (response?.assets) {
            const selectedImage = response?.assets?.[0];
            setCapturedImage(selectedImage.uri);
          }
          if (response?.didCancel) {
            navigation?.goBack();
          }
        });
      } catch (error) {
        console.error("error opening launchImageLibrary", error);
      }
    }, 250);
  }

  // Pending //

  // const sendImageUrlsToUnity = () => {
  //   // Datos que quieres enviar a Unity
  //   const data = {
  //     urls: imageUrls,
  //   };

  //   // Convertir el objeto a JSON
  //   const jsonData = JSON.stringify(data);

  //   // Enviar el JSON a Unity
  //   unityRef.current.postMessage(
  //     "Scroll View", // Nombre del GameObject en Unity
  //     "SetImageUrls",       // Método en el script de Unity
  //     jsonData              // Datos en formato JSON
  //   );
  // };
  // const Gradientes = () => {
  //   // Datos que quieres enviar a Unity
  //   const data = {
  //     gradientsColors: gradientColors, // Colores para el gradiente
  //     topBottom: gradientDirection, // Dirección del gradiente
  //     startAlpha: 1.0, // Opacidad inicial
  //     endAlpha: 0.0 // Opacidad final
  //   };

  //   // Convertir el objeto a JSON
  //   const jsonData = JSON.stringify(data);

  //   // Enviar el JSON a Unity
  //   unityRef.current.postMessage(
  //     "Image", // Nombre del GameObject en Unity
  //     "SetFilterData",       // Método en el script de Unity
  //     {urls: imageUrls  }            // Datos en formato JSON
  //   );
  // };
  // useEffect(() => {
  //   if (challengeObj && modelFile) {
  //     Gradientes();
  //     sendImageUrlsToUnity()
  //   }
  // }, []);

  let screenPadding = {};
  if (!isUnityLoaded) {
    screenPadding = { paddingBottom: 24 };
  }

  return (
    <ChallengeScreen
      title="AR Challenges"
      modals={modals}
      appHeader={false}
      style={{
        paddingHorizontal: 0,
        paddingTop: "11%",
        height: "100%",
        backgroundColor: "#000",
        ...screenPadding,
      }}
    >
      <UnityARCamera
        width="100%"
        height="100%"
        unityRef={unityRef}
        isProcessingMedia={processingMedia}
        isUnityLoaded={isUnityLoaded}
        onUnityLayout={handleUnityViewLayout}
        onUnityMessage={handleUnityMessage}
        capturedImage={capturedImage}
        imageFilter={{ challengeObj: challengeObj, viewShotRef: viewShotRef }}
        capturedVideo={capturedVideo}
        isVideo={isVideo}
      />
      {!isUnityLoaded && (
        <CameraControls
          hasCapturedContent={!!capturedImage || !!capturedVideo}
          onRetake={retakeButtonHandler}
          onDone={doneButtonHandler}
          startRecordVideo={startRecordVideoHandler}
          stopRecordVideo={stopRecordVideoHandler}
          isRecording={!!recordingStart}
          timer={timer}
          isVideo={!!capturedVideo}
          challengeHasFilters={challengeHasFilters}
        />
      )}
    </ChallengeScreen>
  );
};

export default ArChallengeCapture;
