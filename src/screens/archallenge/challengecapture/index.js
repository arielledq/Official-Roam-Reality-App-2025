import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Alert } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import { useSelector } from "react-redux";
import Share from "react-native-share";
import theme from "assets/theme";
import UnityARCamera from "components/UnityArView";
import CameraControls from "components/CameraControls";
import CaptureInfoView from "components/CaptureInfoView";
import ChallengeScreen from "components/ChallengeScreen";
import ViewInfoButton from "components/ViewInfoButton";
import ViewInfoModal from "components/ViewInfoModal";

import { CHALLENGES_TYPE, CAPTURE_CHALLENGE_TYPE } from "constants";
import ChallengeFoundCaptureHeader from "components/ChallengeFoundCaptureHeader";

const RNFS = require("react-native-fs");
const Sound = require("react-native-sound");

const ArChallengeCapture = ({}) => {
  const [unityViewDimensions, setUnityViewDimensions] = useState({ width: 0, height: 0 });
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
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [processingMedia, setProcessingMedia] = useState(false);
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
  const [isVideo, setIsvideo] = useState(false);

  const settings = useSelector(state => state.ar?.arSettings);

  const unityRef = useRef(null);
  const viewShotRef = useRef();

  const route = useRoute();
  const navigation = useNavigation();

  const challengeObj = route?.params?.challengeObj;
  const challengeObjParameters = route?.params?.challengeObj?.parameters;
  const modelFile = route?.params?.challengeObj?.model_file;

  const challengeHasFilters = challengeObj?.ar_filters?.length > 0;
  const challengeType = challengeObj?.challenge_requirement;
  console.log('capture type ', challengeType)
  const viewInfoModalContent = challengeObj?.info;

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

  useFocusEffect(
    useCallback(() => {
      isLoadingUnity()
      if (unityRef.current){
        isLoadingUnity()
        PointsCount();
        unityRef.current.postMessage(
          "Scriptposition",
          "SetVisibleButton",
          JSON.stringify({
            setVisibleButtonPosition: false,
          })
        );
        if( !!CAPTURE_CHALLENGE_TYPE[challengeType]) {
        unityRef.current.postMessage(
          "screen",
          "SetTypeChallenge",
          JSON.stringify({
            typeChallenge: challengeType,
             arChallenge: true,
             isLocation: false
          })
        );
        unityRef.current.postMessage(
          "OBJImport",
          "SetLoadingVisibility",
          JSON.stringify({ isVisible: false }))
      }}
    }, [isUnityLoaded, challengeType])
  );
  const isLoadingUnity = () => {
    if (unityRef.current){
    unityRef.current.postMessage(
      "OBJImport",
      "SetLoadingVisibility",
      JSON.stringify({ isVisible: false })
    );
  }
  };
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

  const acceptWaiverButtonHandler = () => {
    setDetailsShow(false);
    setIsUnityLoaded(true);
  };

  // const loadingFalse = () => {
  //   if (challengeHasFilters) {
  //     unityRef.current.postMessage(
  //       "OBJImport",
  //       "SetLoadingVisibility",
  //       JSON.stringify({ isVisible: false })
  //     );
  //   }
  // };
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
    // setIsvideo(false)
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
        (file) => file.isFile() && (extension === '' || file.name.endsWith(extension))
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
      console.error( error);
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
  const PointsCount = async () => {
    if (unityRef.current) {
      // Enviar mensaje a Unity para iniciar la grabación
      const pointData = {
        points: challengeObj?.points,
        isPointView: true,
      };
      unityRef.current.postMessage("Scriptposition", "SetVisiblePoint", JSON.stringify(pointData));
    }
  };
  //###Captura y Graba###//
  const handleUnityMessage = result => {
    const data = JSON.parse(result.nativeEvent.message);
    buttonInfo = data.enableButton
    buttonBack = data.backPress

    if (buttonBack){
      navigation?.goBack()}

    if (data.photoVideoButton?.isPhoto){
      setCapturedImage(data.photoVideoButton?.filepath);
      setIsUnityLoaded(false)
      playCameraSound()
      eraseFile()
    } 
    if (data.photoVideoButton?.isPhoto == false){
      playRecordSound()
      setCapturedVideo(data.photoVideoButton?.filepath); 
      setIsUnityLoaded(false); 
      
    }
    if(data.infoButton?.isButton)
    {
      setChallengeInformationView(data.infoButton?.isButton)
      setIsUnityLoaded(true)
    }
 
};
  return (
    <ChallengeScreen title="AR Challenges" modals={modals} appHeader = {false}
    style={{
        paddingHorizontal: 0,
        // paddingTop: "7%",
        height:"100%",
        backgroundColor: isUnityLoaded ? "#000" : theme.darkColors?.inputBG,
    }}
    // paddingH={0.1} paddingTop={20} heighContainer = '100%'
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
