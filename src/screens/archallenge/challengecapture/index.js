import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import { useSelector } from "react-redux";
import Share from "react-native-share";

import UnityARCamera from "components/UnityArView";
import CameraControls from "components/CameraControls";
import CaptureInfoView from "components/CaptureInfoView";
import ChallengeScreen from "components/ChallengeScreen";
import ViewInfoButton from "components/ViewInfoButton";
import ViewInfoModal from "components/ViewInfoModal";

import { CHALLENGES_TYPE } from "constants";
import ChallengeFoundCaptureHeader from "components/ChallengeFoundCaptureHeader";

const RNFS = require("react-native-fs");
const Sound = require("react-native-sound");

const VIDEO_RECORD_TIME = 10;

const ArChallengeCapture = ({}) => {
  const [unityViewDimensions, setUnityViewDimensions] = useState({ width: 0, height: 0 });
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
  const [detailsShow, setDetailsShow] = useState(true);
  const [recordingStart, setRecordingStart] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [recordTimeInMillis, setRecordTimeInMillis] = useState(0);
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [capturedImage, setCapturedImage] = useState(fileFound);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [processingMedia, setProcessingMedia] = useState(false);
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);

  const settings = useSelector(state => state.ar?.arSettings);

  const unityRef = useRef(null);
  const viewShotRef = useRef();

  const route = useRoute();
  const navigation = useNavigation();

  const challengeObj = route?.params?.challengeObj;
  const challengeObjParameters = route?.params?.challengeObj?.parameters;
  const modelFile = route?.params?.challengeObj?.model_file;

  const videoDirectory = "/storage/emulated/0/Movies/MisGrabaciones/";
  const videoFileName = "grabacion_video.mp4";
  const fullVideoPath = `${videoDirectory}${videoFileName}`;

  const challengeHasFilters = challengeObj?.ar_filters?.length > 0;
  const isPhotoChallenge = challengeObj?.challenge_requirement === "PHOTO";
  const viewInfoModalContent = challengeObj?.info;

  // useFocusEffect(
  //   useCallback(() => {
  //     if (!isUnityLoaded) {
  //       // Montar UnityView si no está cargado
  //       setIsUnityLoaded(true);
  //     }
  //
  //     return () => {
  //       if (isUnityLoaded) {
  //         // Desmontar UnityView cuando se pierda el enfoque
  //         setIsUnityLoaded(false);
  //       }
  //     };
  //   }, [isUnityLoaded])
  // );

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
    // setProcessingMedia(true);

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
      })
      .finally(() => {
        // setProcessingMedia(false);
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
      setThreshold(parseFloat(challengeObjParameters?.bloom_threshold) || 0.1);
      setIntensity(parseFloat(challengeObjParameters?.bloom_intensity) || 2);
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

  useEffect(() => {
    if (unityRef.current && challengeHasFilters) {
      loadingFalse();
    }
  }, [isUnityLoaded]);

  // useFocusEffect(
  //   useCallback(() => {
  //     // Montar UnityView cuando la pantalla está enfocada
  //     setIsUnityLoaded(true);
  //
  //     // Espera a que UnityView esté cargado antes de enviar cualquier comando
  //     if (unityRef.current && isUnityLoaded) {
  //       enviarComandoAUnity('restart'); // Reiniciar la escena
  //     }
  //
  //     return () => {
  //       // Desmontar UnityView cuando la pantalla pierde el enfoque
  //       setIsUnityLoaded(false);
  //
  //       if (unityRef.current) {
  //         enviarComandoAUnity('close'); // Detener Unity
  //       }
  //     };
  //   }, [isUnityLoaded])
  // );

  const sendModelDataToUnitySpawn = () => {
    console.log("Validando referencias antes de enviar...");

    if (unityRef.current && modelOBJ && textureBase) {
      console.log("Entró al bloque IF: Enviando datos a Unity...");

      // Datos del modelo 3D
      const modelData = {
        objFile: modelOBJ.replace("file://", ""),
        mtlFile: modelResource ? modelResource.replace("file://", "") : null,
        textureBase: textureBase ? textureBase.replace("file://", "") : "",
        textureEmission: textureEmission ? textureEmission.replace("file://", "") : "",
        scale,
        rotation,
        position,
        isRotationEnabled: true,
        emissionIntensity: emissionValue,
        rotationSpeed: Number(challengeObjParameters?.loop_delay) || 1,
        scaleSpeed: Number(challengeObjParameters?.scale_sensitivity) || 0.01,
        minScale: Number(challengeObjParameters?.min_pinch_scale) || 1,
        maxScale: Number(challengeObjParameters?.max_pinch_scale) || 1,
      };

      console.log("Datos del modelo a enviar:", modelData);

      // Enviar datos del modelo a Unity
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
  };
  console.log(
    "-----------MODELOS----------",
    modelOBJ,
    modelResource,
    textureBase,
    textureEmission
  );
  function enviarComandoAUnity(comando) {
    const commandData = JSON.stringify({ command: comando });

    if (unityRef.current) {
      // Enviar comando si UnityView está listo
      unityRef.current.postMessage("CloseAndReset", "HandleUnityControlCommand", commandData);
    } else {
      console.log("UnityView no está disponible. No se puede enviar el comando.");
    }
  }

  // Ejemplos de uso:
  //   EnviarComandoAUnity('pause');  // Para pausar el juego
  //   EnviarComandoAUnity('resume'); // Para reanudar el juego
  //   EnviarComandoAUnity('restart'); // Para reiniciar la escena
  //   EnviarComandoAUnity('close');  // Para cerrar Unity

  const sendBloomValuesToUnity = () => {
    const bloomData = { threshold, intensity };
    if (unityRef.current) {
      unityRef.current.postMessage("PosProcessing", "UpdateBloomValues", JSON.stringify(bloomData));
    }
  };

  // Captura de pantalla
  const captureScreenshot = async () => {
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
            // console.log("Archivos encontrados en el directorio:", files);

            if (Array.isArray(files) && files.length > 0) {
              // Busca un archivo con el prefijo 'screenshot' y la extensión '.png'
              const foundFile = files.find(
                file =>
                  file.isFile() && file.name.includes("screenshot") && file.name.endsWith(".png")
              );

              if (foundFile) {
                // console.log("CAPTURA DE PANTALLA ENCONTRADA:", foundFile);
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
  };

  // Compartir captura
  const shareScreenshot = async () => {
    if (!fileFound) {
      console.info("Primero captura una imagen antes de compartir.");
      return;
    }
    try {
      await Share.open({
        title: "Compartir captura",
        url: `file://${fileFound}`,
        type: "image/png",
      });
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  const eliminarVideoAnterior = async () => {
    try {
      const exists = await RNFS.exists(fullVideoPath);
      if (exists) {
        await RNFS.unlink(fullVideoPath); // Elimina el archivo si existe
        // console.log("Video anterior eliminado:", fullVideoPath);
      }
    } catch (error) {
      console.error("Error al eliminar el video anterior:", error);
    }
  };

  // Grabar Video
  function enviarParametrosAGrabacion() {
    const parametros = {
      nombreDelVideo: "grabacion_video",
      nombreDeLaCarpeta: "MisGrabaciones",
      grabarAudio: true, // true para grabar audio, false para deshabilitar el audio
      contenedorAncho: unityViewDimensions.width,
      contenedorAlto: unityViewDimensions.height,
    };

    if (unityRef.current) {
      unityRef.current.postMessage(
        "Screen Recorder",
        "RecibirParametros",
        JSON.stringify(parametros)
      );
    } else {
      console.error("UnityView no está disponible.");
    }
  }

  // Función para iniciar la grabación
  //   const iniciarGrabacion = async () => {
  //     try {
  //       // Elimina el archivo de video anterior si existe
  //       await eliminarVideoAnterior();
  //       enviarParametrosAGrabacion()
  //       // Enviar mensaje a Unity para iniciar la grabación
  //       if (unityRef.current) {
  //         unityRef.current.postMessage('Screen Recorder', 'IniciarGrabacion', '');
  //         console.log('Grabación iniciada');
  //       } else {
  //         console.error('UnityView no está disponible.');
  //       }
  //     } catch (error) {
  //       console.error('Error al iniciar la grabación:', error);
  //     }
  //   };

  // Función para detener la grabación
  //   const detenerGrabacion = async () => {
  //     if (unityRef.current) {
  //       unityRef.current.postMessage('Screen Recorder', 'DetenerGrabacion', '');
  //
  //       // Asegurarse de que la grabación se detuvo
  //       console.log('Grabación detenida. Verificando archivo de video...');
  //
  //       // Verificar si el archivo de video existe
  //       try {
  //         const exists = await RNFS.exists(fullVideoPath); // fullVideoPath: '/storage/emulated/0/Movies/MisGrabaciones/grabacion_video.mp4'
  //
  //         if (exists) {
  //           // Si el archivo de video existe, actualiza el estado
  //           setCapturedVideo(fullVideoPath);
  //           console.log('Video guardado en:', fullVideoPath);
  //         } else {
  //           console.error('El archivo de video no se encontró:', fullVideoPath);
  //         }
  //       } catch (error) {
  //         console.error('Error verificando el archivo de video:', error);
  //       }
  //     } else {
  //       console.error('UnityView no está disponible.');
  //     }
  //   };

  const iniciarGrabacion = async () => {
    if (unityRef.current) {
      // Enviar mensaje a Unity para iniciar la grabación
      unityRef.current.postMessage("Video Recorder", "IniciarGrabacion", "iniciar");
    }
  };

  const detenerGrabacion = () => {
    if (unityRef.current) {
      // Enviar mensaje a Unity para detener la grabación
      unityRef.current.postMessage("Video Recorder", "DetenerGrabacion", "detener");

      // Definir las rutas dependiendo de la plataforma (Android e iOS)
      const basePath =
        Platform.OS === "android"
          ? "/storage/emulated/0/Android/data/com.roam_reality/files/video" // Ruta en Android
          : RNFS.DocumentDirectoryPath + "/video"; // Ruta en iOS
      // console.log("aaaaaaafiles");
      console.log("detenerGrabacion, basepath", basePath);
      // Esperar un pequeño retraso para asegurarse de que la grabación se haya detenido completamente

      const saveVideo = async () => {
        try {
          // Leer el directorio de la carpeta 'videos'
          const exists = await RNFS.exists(basePath);
          console.log("Videos directory exists:", exists);
          if (!exists) {
            console.error("Videos directory does not exist.");
          }

          let files = "";
          try {
            files = await RNFS.readDir(basePath);
          } catch (error) {
            console.error(error);
          }

          // Filtrar archivos .mp4
          const videoFiles = files.filter(file => file.isFile() && file.name.endsWith(".mp4"));

          if (videoFiles.length > 0) {
            // Ordenar los archivos por fecha de modificación (más reciente primero)
            videoFiles.sort((a, b) => b.mtime - a.mtime); // Ordena de más reciente a más antiguo

            // Seleccionar el archivo más reciente
            const latestFile = videoFiles[0];
            const latestFilePath = latestFile.path;

            // Actualizar el estado con la ruta del archivo más reciente
            setCapturedVideo(latestFilePath);
            // console.log("Video guardado en:", latestFilePath);

            // Desmontar UnityView después de la grabación
            setIsUnityLoaded(false); // Desmontar UnityView
          } else {
            console.error("No se encontraron archivos .mp4 en la carpeta de videos:", basePath);
          }
        } catch (error) {
          console.error("Error verificando los archivos de video:", error);
        }
      };

      setTimeout(() => {
        saveVideo();
      }, 1000); // Espera 1 segundo para asegurarse de que el archivo esté guardado antes de verificar
    } else {
      console.error("UnityView no está disponible.");
    }
  };

  // Función para eliminar el video grabado manualmente (si lo necesitas)
  const eliminarVideoGrabado = async () => {
    try {
      const exists = await RNFS.exists(capturedVideo);
      if (exists) {
        await RNFS.unlink(capturedVideo); // Elimina el video grabado
        setVideoPath(null); // Limpia el estado
        // console.log("Video eliminado:", capturedVideo);
      } else {
        Alert.alert("El video no existe", "No se encontró el video a eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar el video grabado:", error);
    }
  };

  const startRecordVideo = () => {
    if (challengeObj?.ar_filters.length > 0) return;
    // enviarParametrosAGrabacion()
    setRecordingStart(true);
    iniciarGrabacion();
    playRecordSound();
    startTimer();
  };

  const stopRecordVideo = async () => {
    detenerGrabacion();
    clearTimer();
    playRecordSound();
  };

  const _takeScreenshot = () => {
    playCameraSound();
    captureScreenshot();
    // unityRef.current.postMessage('takeScreenshot', { id: uuid.v4() });
  };

  const playCameraSound = () => {
    Sound.setCategory("Playback");
    let cameraSound = new Sound("camera-sound.mp3", Sound.MAIN_BUNDLE, error => {
      if (!error) cameraSound.play();
    });
  };

  const playRecordSound = () => {
    Sound.setCategory("Playback");
    let recordSound = new Sound("record.mp3", Sound.MAIN_BUNDLE, error => {
      if (!error) recordSound.play();
    });
  };

  const acceptWaiverButtonHandler = () => {
    setDetailsShow(false);
    setIsUnityLoaded(true);
  };

  const startTimer = () => {
    setTimer("00:00");
    setRecordTimeInMillis(0);

    const interval = setInterval(() => {
      setRecordTimeInMillis(prevTime => {
        const newTimeInMillis = prevTime + 1;
        const seconds = `0${newTimeInMillis % 60}`.slice(-2);
        const minutes = `0${Math.floor(newTimeInMillis / 60)}`.slice(-2);
        setTimer(`${minutes}:${seconds}`);

        // Si se alcanza el tiempo máximo, detener el video.
        if (newTimeInMillis >= VIDEO_RECORD_TIME * 60) {
          stopRecordVideo();
        }

        return newTimeInMillis; // Actualiza el tiempo total en milisegundos
      });
    }, 1000);

    // this.intervalId = interval;
  };
  const clearTimer = () => {
    clearInterval(this.intervalId);
  };
  const loadingFalse = () => {
    if (challengeHasFilters) {
      unityRef.current.postMessage(
        "OBJImport",
        "SetLoadingVisibility",
        JSON.stringify({ isVisible: false })
      );
    }
  };
  const doneButtonHandler = async () => {
    const hasFilters = capturedImage && challengeObj?.ar_filters.length > 0;
    let updatedData = capturedImage ? capturedImage : capturedVideo;

    if (hasFilters) {
      try {
        // Capturar la vista dentro de ViewShot
        const capturedUri = await viewShotRef.current.capture();
        // console.log("Imagen capturada con filtro:", capturedUri);
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
    ]);
    // .then(console.log);
  }, []);

  const retakeButtonHandler = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsUnityLoaded(true);
    // enviarComandoAUnity('restart'); TODO VERIFICAR SI ES NECESARIO
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

  const cameraPressHandler = () => {
    if (capturedImage || capturedVideo) {
      return;
    }
    if (recordingStart) {
      stopRecordVideo();
    } else {
      _takeScreenshot();
      setIsUnityLoaded(false);
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
    <ChallengeScreen title="AR Photo Challenges" modals={modals}>
      <ChallengeFoundCaptureHeader
        leftTitle="AR Challenges"
        challengeFound
        points={challengeObj?.points}
      />

      <UnityARCamera
        unityRef={unityRef}
        isProcessingMedia={processingMedia}
        isUnityLoaded={isUnityLoaded}
        onUnityLayout={handleUnityViewLayout}
        capturedImage={capturedImage}
        imageFilter={{ challengeObj: challengeObj, viewShotRef: viewShotRef }}
        capturedVideo={capturedVideo}
      />

      <CameraControls
        hasCapturedContent={!!capturedImage || !!capturedVideo}
        onRetake={retakeButtonHandler}
        onDone={doneButtonHandler}
        onCameraPress={cameraPressHandler}
        startRecordVideo={startRecordVideoHandler}
        stopRecordVideo={stopRecordVideoHandler}
        isRecording={!!recordingStart}
        timer={timer}
        isVideo={!isPhotoChallenge}
        challengeHasFilters={challengeHasFilters}
      />

      <ViewInfoButton onPress={viewInfoButtonHandler} />
    </ChallengeScreen>
  );
};

export default ArChallengeCapture;
