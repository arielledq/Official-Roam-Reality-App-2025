import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import AppHeader from "../../../components/header";
import Video from "react-native-video";
import uuid from "react-native-uuid";
import { FontSizes } from "../../../util/FontUtils";
import RNFetchBlob from "rn-fetch-blob";
import useStyles from "./styles";
import CaptureImage from "../../../assets/ar/camera.png";
import Shareds from "../../../assets/ar/bg-ar-share.png";
import LineIcon from "../../../assets/ar/line.png";
import { unzip } from "react-native-zip-archive";
import { AppButton } from "../../../components";
import RenderHTML from "react-native-render-html";
const RNFS = require("react-native-fs");
const Sound = require("react-native-sound");
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import { useSelector } from "react-redux";
import ARFilter from "../FilterView";
import BackgroundWithImage from "../../../components/background";
import UnityView from "@azesmway/react-native-unity/src";
import Share from "react-native-share";
const { width } = Dimensions.get("window");

const VIDEO_RECORD_TIME = 10;

const ArChallengeCapture = ({}) => {
  const styles = useStyles();
  const unityRef = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();

  const [unityViewDimensions, setUnityViewDimensions] = useState({ width: 0, height: 0 });

  const challengeObj = route?.params?.challengeObj;
  const challengeObjParameters = route?.params?.challengeObj?.parameters;
  const settings = useSelector(state => state.ar?.arSettings);
  const modelFile = route?.params?.challengeObj?.model_file;
  const viewShotRef = useRef();
  const challengeIsPhoto = challengeObj?.challenge_requirement === "PHOTO";

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

  const videoDirectory = "/storage/emulated/0/Movies/MisGrabaciones/";
  const videoFileName = "grabacion_video.mp4";
  const fullVideoPath = `${videoDirectory}${videoFileName}`;

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
      setThreshold(challengeObjParameters?.bloom_threshold || 1);
      setIntensity(challengeObjParameters?.image_opacity_value || 1);
      setPosition({
        x: challengeObjParameters?.positionX || 0,
        y: challengeObjParameters?.positionY || 0,
        z: challengeObjParameters?.positionZ || 0,
      });
      setScale({
        x: challengeObjParameters?.scale_object || 1,
        y: challengeObjParameters?.scale_object || 1,
        z: challengeObjParameters?.scale_object || 1,
      });
      setEmissionValue(challengeObjParameters?.diffuse_intensity || 1);
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
    if (unityRef.current && modelOBJ && textureBase) {
      const modelData = {
        objFile: modelOBJ.replace("file://", ""),
        mtlFile: modelResource ? modelResource.replace("file://", "") : null,
        textureBase: textureBase ? textureBase.replace("file://", "") : "",
        textureEmission: textureEmission ? textureEmission.replace("file://", "") : "",
        position,
        scale,
        rotation,
        emissionIntensity: emissionValue,
        rotationSpeed: challengeObjParameters?.loop_delay || 1,
        scaleSpeed: challengeObjParameters?.scale_sensitivity || 0.0015,
      };

      unityRef.current.postMessage("OBJImport", "LoadModelFromReact", JSON.stringify(modelData));
    } else {
      console.log("UnityView o modelOBJ no están disponibles.");
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
            console.log("Archivos encontrados en el directorio:", files);

            if (Array.isArray(files) && files.length > 0) {
              // Busca un archivo con el prefijo 'screenshot' y la extensión '.png'
              const foundFile = files.find(
                file =>
                  file.isFile() && file.name.includes("screenshot") && file.name.endsWith(".png")
              );

              if (foundFile) {
                console.log("CAPTURA DE PANTALLA ENCONTRADA:", foundFile);
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
      console.log("Primero captura una imagen antes de compartir.");
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
        console.log("Video anterior eliminado:", fullVideoPath);
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

  const detenerGrabacion = async () => {
    if (unityRef.current) {
      // Enviar mensaje a Unity para detener la grabación
      unityRef.current.postMessage("Video Recorder", "DetenerGrabacion", "detener");

      // Definir las rutas dependiendo de la plataforma (Android e iOS)
      const basePath =
        Platform.OS === "android"
          ? "/storage/emulated/0/Android/data/com.roam_reality/files/video" // Ruta en Android
          : RNFS.DocumentDirectoryPath + "/videos"; // Ruta en iOS
      console.log("aaaaaaafiles");
      // Esperar un pequeño retraso para asegurarse de que la grabación se haya detenido completamente
      setTimeout(async () => {
        try {
          // Leer el directorio de la carpeta 'videos'
          const files = await RNFS.readDir(basePath);

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
            console.log("Video guardado en:", latestFilePath);

            // Desmontar UnityView después de la grabación
            setIsUnityLoaded(false); // Desmontar UnityView
          } else {
            console.error("No se encontraron archivos .mp4 en la carpeta de videos:", basePath);
          }
        } catch (error) {
          console.error("Error verificando los archivos de video:", error);
        }
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
        console.log("Video eliminado:", capturedVideo);
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

  // console.log(" challengeObjParameters ", challengeObj);
  // console.log("Touch End detected", );
  // console.log("Gesture detected", );
  // console.log("view unity",isUnityLoaded)
  // Vistas adicionales
  const ChallengeDetailView = () => (
    <View style={styles.challengeInfoContainer}>
      <View style={styles.challengeInfoHeaderContainer}>
        <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
        <Text style={styles.challengeInfoHeader}>Challenge Details</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%", padding: 24 }}
      >
        <RenderHTML
          contentWidth={width}
          tagsStyles={{
            p: { color: "#9CA3AF", fontSize: FontSizes.S14 },
            strong: { color: "#fff", fontSize: FontSizes.S18 },
          }}
          source={{ html: challengeObj.description.replaceAll("#000000", "#fff") }}
        />
      </ScrollView>
      <View style={{ width: "100%", paddingHorizontal: 24, marginBottom: 20 }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            setChallengeInformationView(false);
            setIsUnityLoaded(true);
          }}
        >
          <Text style={styles.bottomText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const InfoView = () => (
    <View style={styles.challengeInfoContainer}>
      <View style={styles.challengeInfoHeaderContainer}>
        <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
        <Text style={styles.challengeInfoHeader}>Waiver Details</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%", padding: 24 }}
      >
        <RenderHTML
          contentWidth={width}
          tagsStyles={{
            p: { color: "#9CA3AF", fontSize: FontSizes.S14 },
            strong: { color: "#fff", fontSize: FontSizes.S18 },
          }}
          source={{ html: settings?.waiver_details.replaceAll("#000000", "#fff") }}
        />
      </ScrollView>
      <View style={{ width: "100%", paddingHorizontal: 24 }}>
        <AppButton
          onPress={() => {
            setDetailsShow(false);
            setIsUnityLoaded(true);
          }}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={"Accept and Continue"}
        />
        <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.goBack()}>
          <Text style={styles.bottomText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

    this.intervalId = interval;
  };
  const clearTimer = () => {
    clearInterval(this.intervalId);
  };

  const doneButtonHandler = async () => {
    const hasFilters = capturedImage && challengeObj?.ar_filters.length > 0;
    let updatedData = capturedImage ? capturedImage : capturedVideo;

    if (hasFilters) {
      try {
        // Capturar la vista dentro de ViewShot
        const capturedUri = await viewShotRef.current.capture();
        console.log("Imagen capturada con filtro:", capturedUri);
        updatedData = capturedUri; // Actualizar con la imagen capturada con filtro
      } catch (error) {
        console.error("Error capturando la imagen con filtros:", error);
      }
    }

    // Navegar y pasar la captura actualizada
    navigation.replace("ArChallengeShare", {
      challengeObj: challengeObj,
      captureData: updatedData,
      isImage: !!capturedImage,
    });
  };

  console.log("AAAAAAAAAAAAAAcapturedImage ? capturedImage : capturedVideo", viewShotRef);
  useEffect(() => {
    requestMultiple([
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION,
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]).then(console.log);
  }, []);
  console.log("capturedVideo:", capturedVideo);

  return (
    <View style={styles.mainContainer}>
      <View
        style={[
          styles.mainHeaderContainer,
          Platform.OS == "ios" && challengeObj?.ar_filters.length == 0
            ? styles.mainHeaderContainerIOS
            : {},
        ]}
      >
        <AppHeader
          centerComponent={{
            text: "AR Photo Challenges",
            numberOfLines: 2,
            style: [styles.heading],
          }}
          backgroundColor="transparent"
        />
      </View>
      <View
        style={[
          styles.detailsViewContainer,
          Platform.OS == "ios" && challengeObj?.ar_filters.length == 0
            ? styles.detailsViewContainerIOS
            : {},
        ]}
      >
        <View style={styles.viewDetailsIconContainer}>
          <View style={styles.viewDetailsIconContainerWrapper}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Image
                style={styles.viewDetailsIcon}
                source={{ uri: challengeObj?.sponsored?.image }}
              />
              <Text style={styles.challengeSponsorName}>{challengeObj?.sponsored?.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setChallengeInformationView(true);
                setIsUnityLoaded(false);
              }}
              style={styles.viewDetailBtn}
            >
              <Text style={styles.btnText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.f1,
          // {
          //   marginTop: Platform.OS == 'ios' && challengeObj?.ar_filters.length == 0 ? -220 : 0,
          // },
          // {flex:1,}
          challengeObj?.ar_filters.length > 0 ? styles.filterHeight : { flex: 1 },
        ]}
      >
        {processingMedia ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Processing your content...</Text>
          </View>
        ) : (
          <>
            <BackgroundWithImage>
              {isUnityLoaded && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    alignContent: "flex-end",
                  }}
                  onLayout={handleUnityViewLayout} // Obtener las dimensiones del contenedor
                >
                  <UnityView ref={unityRef} style={{ width: "100%", flex: 1, zIndex: -1 }} />
                </View>
              )}
            </BackgroundWithImage>
            {capturedImage && challengeObj?.ar_filters.length == 0 && (
              <Image style={styles.imageVideoView} source={{ uri: `file://${capturedImage}` }} />
            )}
            {capturedVideo && challengeObj?.ar_filters.length == 0 && (
              <Video
                repeat={true}
                style={styles.imageVideoView}
                source={{
                  uri: `file://${capturedVideo}`,
                }}
              />
            )}
            {capturedImage && challengeObj?.ar_filters.length > 0 && (
              <View style={styles.imageVideoView}>
                <ARFilter
                  challengeObj={challengeObj}
                  viewShotRef={viewShotRef}
                  captureData={capturedImage}
                />
              </View>
            )}
          </>
        )}
      </View>
      <View style={styles.holdTextContainer}>
        {/* {!capturedImage &&
          !capturedVideo &&
          !recordingStart &&
          challengeObj?.ar_filters.length == 0 && ( */}
        <Text style={styles.holdText}>
          {challengeIsPhoto
            ? "Tap the button to take a picture"
            : "Press and hold the button to record a video"}
        </Text>
        {/* )} */}
        {(capturedImage || capturedVideo) && route?.params?.challengeObj?.ar_filters.length > 0 && (
          <Text style={styles.holdText}>Swipe Left or Right for Filters</Text>
        )}
      </View>
      <View
        style={[
          styles.bottomContainer,
          {
            justifyContent: capturedImage || capturedVideo ? "space-between" : "center",
          },
          challengeObj?.ar_filters.length > 0 ? styles.filterBottomContainer : {},
        ]}
      >
        {recordingStart && (
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerText}>{timer}</Text>
          </View>
        )}
        {(capturedImage || capturedVideo) && (
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              setCapturedImage(null);
              setCapturedVideo(null);
              setIsUnityLoaded(true);
              // enviarComandoAUnity('restart'); TODO VERIFICAR SI ES NECESARIO
            }}
            style={styles.bottomButtonContainer}
          >
            <Text style={styles.bottomButtonText}>Retake</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onLongPress={() => {
            if (capturedImage || capturedVideo) {
              return;
            }
            startRecordVideo();
          }}
          onPressIn={() => {}}
          onPressOut={() => {
            if (recordingStart) {
              stopRecordVideo();
            }
          }}
          delayLongPress={800}
          onPress={() => {
            if (capturedImage || capturedVideo) {
              return;
            }
            if (recordingStart) {
              stopRecordVideo();
            } else {
              _takeScreenshot();
              setIsUnityLoaded(false);
            }
          }}
          activeOpacity={0.6}
        >
          <Image style={{ width: 56, height: 56 }} source={CaptureImage} />
        </TouchableOpacity>

        {(capturedImage || capturedVideo) && (
          <TouchableOpacity
            onPress={doneButtonHandler}
            activeOpacity={0.6}
            style={styles.bottomButtonContainer}
          >
            <Text style={styles.bottomButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
      {detailsShow && <InfoView />}
      {challengeInformationView && <ChallengeDetailView />}
    </View>
  );
};

export default ArChallengeCapture;
