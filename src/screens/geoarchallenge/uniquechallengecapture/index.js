import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppHeader from "../../../components/header";
import Video from "react-native-video";
import uuid from "react-native-uuid";
import { FontSizes } from "../../../util/FontUtils";
import RNFetchBlob from "rn-fetch-blob";
import useStyles from "./styles";
import CaptureImage from "../../../assets/ar/camera.png";
import LineIcon from "../../../assets/ar/line.png";
import { unzip } from "react-native-zip-archive";
import { AppButton } from "../../../components";
import RenderHTML from "react-native-render-html";
import RNFS from "react-native-fs";
import Sound from "react-native-sound";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import { useSelector } from "react-redux";
import BackgroundWithImage from "../../../components/background";
import UnityView from "@azesmway/react-native-unity/src";
import Share from "react-native-share";
import CameraControls from "components/CameraControls";
import UnityARCamera from "components/UnityArView";
import CaptureInfoView from "components/CaptureInfoView";

const { width } = Dimensions.get("window");
const VIDEO_RECORD_TIME = 10;

const UniqueArChallengeCapture = () => {
  const styles = useStyles();
  const route = useRoute();
  const navigation = useNavigation();
  const challengeObj = route?.params?.challengeObj;
  const unityRef = useRef(null);
  const viewShotRef = useRef();
  const settings = useSelector(state => state.ar?.arSettings);

  const [fileFound, setFileFound] = useState(null);
  const [captureData, setCaptureData] = useState("");
  const [modelOBJ, setModelOBJ] = useState(null);
  const [modelResource, setModelResource] = useState(null);
  const [textureBase, setTextureBase] = useState(null);
  const [textureEmission, setTextureEmission] = useState(null);
  const [sourcesFiles, setSourcesFiles] = useState([]);
  const [detailsShow, setDetailsShow] = useState(true);
  const [recordingStart, setRecordingStart] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [recordTimeInMillis, setRecordTimeInMillis] = useState(0);
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [isUnityLoaded, setIsUnityLoaded] = useState(false); // Initial state for Unity loading
  const [unityViewDimensions, setUnityViewDimensions] = useState({ width: 0, height: 0 });
  const [processingMedia, setProcessingMedia] = useState(false);

  const isPhotoChallenge = challengeObj?.challenge_requirement === "PHOTO";

  const handleUnityViewLayout = event => {
    const { width, height } = event.nativeEvent.layout;
    setUnityViewDimensions({ width, height });
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

        if (newTimeInMillis >= VIDEO_RECORD_TIME * 60) stopRecordVideo();
        return newTimeInMillis;
      });
    }, 1000);
    this.intervalId = interval;
  };

  const clearTimer = () => {
    clearInterval(this.intervalId);
  };

  const playSound = filename => {
    Sound.setCategory("Playback");
    const sound = new Sound(filename, Sound.MAIN_BUNDLE, error => {
      if (!error) sound.play();
    });
  };

  const iniciarGrabacion = () => {
    if (unityRef.current) {
      unityRef.current.postMessage("Video Recorder", "IniciarGrabacion", "iniciar");
    }
  };

  const detenerGrabacion = async () => {
    if (unityRef.current) {
      unityRef.current.postMessage("Video Recorder", "DetenerGrabacion", "detener");

      const fullVideoPath = "/storage/emulated/0/Android/data/com.roam_reality/files/videos/1.mp4";
      setTimeout(async () => {
        try {
          const exists = await RNFS.exists(fullVideoPath);
          if (exists) {
            setCapturedVideo(fullVideoPath);
            setIsUnityLoaded(false); // Set to false to display the video capture
          } else {
            console.error("El archivo de video no se encontró:", fullVideoPath);
          }
        } catch (error) {
          console.error("Error verificando el archivo de video:", error);
        }
      }, 1000);
    }
  };

  const startRecordVideo = () => {
    setRecordingStart(true);
    iniciarGrabacion();
    playSound("record.mp3");
    startTimer();
  };

  const stopRecordVideo = async () => {
    detenerGrabacion();
    clearTimer();
    playSound("record.mp3");
    setRecordingStart(false);
  };

  const _takeScreenshot = () => {
    playSound("camera-sound.mp3");
    captureScreenshot();
  };

  const captureScreenshot = async () => {
    if (unityRef.current) {
      unityRef.current.postMessage("ScreenCapture", "CaptureScreenshotFromReact", "");

      const path = "/storage/emulated/0/Android/data/com.roam_reality/files/";

      setProcessingMedia(true);

      setTimeout(() => {
        RNFS.readDir(path)
          .then(files => {
            if (Array.isArray(files) && files.length > 0) {
              const foundFile = files.find(file => file.isFile() && file.name.includes(".png"));
              if (foundFile) {
                setFileFound(foundFile.path);
                setCaptureData(foundFile.path);
                setCapturedImage(foundFile.path);
                setIsUnityLoaded(false); // Disable Unity to display the image capture
              }
            }
          })
          .finally(() => {
            setProcessingMedia(false);
          });
      }, 1000);
    }
  };

  const navigateToShare = (captureData, isImage) => {
    navigation.replace("UniqueArChallengeShare", {
      challengeObj: challengeObj,
      captureData,
      isImage,
    });
  };
  const handlePressUnityButton = () => {
    if (unityRef.current) {
      unityRef.current.postMessage(
        "TestReact", // Nombre del GameObject en Unity
        "ReceiveMessageFromReact", // Nombre del método en Unity
        "pressButton" // Mensaje que quieres enviar
      );
    } else {
      ("NOOOOO NEEEEEE");
    }
    console.log("NADA DE NADA onUnityMessages {", unityRef?.current?.onUnityMessage, "}");
  };

  // Función para manejar el mensaje de Unity
  const handleUnityMessage = result => {
    console.log("Mensaje recibido desde Unity:", result.nativeEvent.message);
    Alert.alert("Mensaje de Unity", result.nativeEvent.message);
  };

  const ChallengeDetailView = () => (
    <View style={styles.challengeInfoContainer}>
      <Text style={styles.challengeInfoHeader}>Challenge Details</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <RenderHTML contentWidth={width} source={{ html: challengeObj.description }} />
      </ScrollView>
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
  );

  const acceptWaiverButtonHandler = () => {
    setDetailsShow(false);
    setIsUnityLoaded(true);
  };

  const retakeButtonHandler = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsUnityLoaded(true);
  };

  const doneButtonHandler = () =>
    navigateToShare(capturedImage || capturedVideo, Boolean(capturedImage));

  const cameraButtonHandler = () => {
    _takeScreenshot();
    handlePressUnityButton();
  };
  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <View
        style={[
          styles.mainHeaderContainer,
          Platform.OS == "ios" ? styles.mainHeaderContainerIOS : {},
        ]}
      >
        <AppHeader
          centerComponent={{
            text: "Unique Site AR",
            numberOfLines: 2,
            style: [styles.heading],
          }}
          backgroundColor="transparent"
        />
      </View>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.viewDetailsIconContainer}>
          <View style={styles.viewDetailsIconContainerWrapper}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Image
                style={styles.viewDetailsIcon}
                source={{ uri: challengeObj?.sponsored?.image }}
              />
              <Text style={styles.challengeSponsorName}>{challengeObj?.sponsored?.name}</Text>
            </View>
          </View>
        </View>

        <UnityARCamera
          unityRef={unityRef}
          isProcessingMedia={!!processingMedia}
          isUnityLoaded={isUnityLoaded}
          onUnityMessage={handleUnityMessage}
          onUnityLayout={handleUnityViewLayout}
          capturedImage={capturedImage}
          capturedVideo={capturedVideo}
        />

        <CameraControls
          hasCapturedContent={!!capturedImage || !!capturedVideo}
          onRetake={retakeButtonHandler}
          onDone={doneButtonHandler}
          onCameraPress={cameraButtonHandler}
          startRecordVideo={startRecordVideo}
          stopRecordVideo={stopRecordVideo}
          isRecording={!!recordingStart}
          timer={timer}
          isVideo={!isPhotoChallenge}
        />
      </ScrollView>

      <CaptureInfoView
        isVisible={detailsShow}
        content={settings?.waiver_details}
        onAccept={acceptWaiverButtonHandler}
      />

      {challengeInformationView && <ChallengeDetailView />}
    </BackgroundWithImage>
  );
};

export default UniqueArChallengeCapture;
