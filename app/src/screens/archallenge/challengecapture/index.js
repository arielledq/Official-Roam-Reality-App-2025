import React, {useCallback, useEffect, useRef, useState} from "react";
import {ActivityIndicator, Platform, Text, View} from "react-native";
import {useFocusEffect} from "@react-navigation/native";
import {requestMultiple, PERMISSIONS} from "react-native-permissions";
import UnityARCamera from "components/UnityArView";
import CameraControls from "components/CameraControls";
import ChallengeScreen from "components/ChallengeScreen";
import ViewInfoModal from "components/ViewInfoModal";
import {launchImageLibrary} from "react-native-image-picker";

import {CHALLENGES_TYPE, CAPTURE_CHALLENGE_TYPE} from "../../../constants";
import {CAMERA_NOTIFICATION} from "../../../constants";
import {copyFileForDisplay, eraseFile} from "util/helpers";

// const Sound = require("react-native-sound");

const ArChallengeCapture = ({route, navigation}) => {
  const [unityViewDimensions, setUnityViewDimensions] = useState({width: 0, height: 0});
  // const [recordingStart, setRecordingStart] = useState(false);
  // const [timer, setTimer] = useState("00:00");
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [processingMedia, setProcessingMedia] = useState(false);
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
  const [isVideo, setIsvideo] = useState(false);
  const [openModalARMode, setOpenModalARMode] = useState(false);

  const unityRef = useRef(null);
  const viewShotRef = useRef();

  const challengeObj = route?.params?.challengeObj;
  const openGallery = route?.params?.openGallery;

  const challengeHasFilters = challengeObj?.ar_filters?.length > 0;
  const challengeType = challengeObj?.challenge_requirement;
  const viewInfoModalContent = challengeObj?.info;
  const [unitySceneLoaded, setUnitySceneLoaded] = useState(false);

  const initialLoadTime = useRef(0);

  const handleUnityViewLayout = event => {
    const {width, height} = event.nativeEvent.layout;
    setUnityViewDimensions({width, height});
  };
  useEffect(() => {
    if (unityRef.current) {
      unityRef.current.postMessage("SceneLoader", "LoadSpecificScene", "ARReactNative");
    }
  }, [isUnityLoaded]);

  // const viewNotification = isNotification => {
  //   if (unityRef.current) {
  //     const message = CAMERA_NOTIFICATION[challengeType] || "Default notification text";
  //     unityRef.current.postMessage(
  //       "Scriptposition",
  //       "SetVisibleNotification",
  //       JSON.stringify({textNotification: message, isNotification: isNotification})
  //     );
  //   }
  // };

  const pointsCount = async () => {
    if (unityRef.current) {
      const pointData = {
        points: challengeObj?.points,
        isPointView: true,
      };
      unityRef.current.postMessage("Scriptposition", "SetVisiblePoint", JSON.stringify(pointData));
    }
  };

  const isLoadingUnity = () => {
    if (!unityRef.current) return;
    const currentTime = Date.now();
    if (initialLoadTime.current === 0) {
      initialLoadTime.current = currentTime;
      setTimeout(() => {
        if (unityRef.current) {
          unityRef.current.postMessage(
            "OBJImport",
            "SetLoadingVisibility",
            JSON.stringify({isVisible: false})
          );
        }
      }, 2000);
    } else {
      if (unityRef.current) {
        unityRef.current.postMessage(
          "OBJImport",
          "SetLoadingVisibility",
          JSON.stringify({isVisible: false})
        );
      }
    }
  };

  const playCameraSound = () => {
    try {
      Sound.setCategory("Playback");
      const cameraSound = new Sound("camera-sound.mp3", Sound.MAIN_BUNDLE, error => {
        if (!error) cameraSound.play();
      });
    } catch (error) {
      console.error("playCameraSound", error);
    }
  };

  const playRecordSound = () => {
    try {
      Sound.setCategory("Playback");
      const recordSound = new Sound("record.mp3", Sound.MAIN_BUNDLE, error => {
        if (!error) recordSound.play();
      });
    } catch (error) {
      console.error("playRecordSound", error);
    }
  };

  const doneButtonHandler = async () => {
    const hasFilters = capturedImage && challengeObj?.ar_filters.length > 0;
    let updatedData = capturedImage ? capturedImage : capturedVideo;

    if (hasFilters) {
      try {
        const capturedUri = await viewShotRef.current.capture();
        updatedData = capturedUri;
      } catch (error) {
        console.error("Error capturando la imagen con filtros:", error);
      }
    }

    updatedData = await copyFileForDisplay(updatedData);

    // Navegar y pasar la captura actualizada
    navigation.navigate({
      name: "ArChallengeShare",
      params: {
        challengeObj: challengeObj,
        captureData: updatedData,
        challengeType: CHALLENGES_TYPE.PHOTO_VIDEO,
      },
    });
  };
  const retakeButtonHandler = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    if (openGallery) {
      pickFromGallery();
    } else {
      setIsUnityLoaded(true);
    }
  };
  // const startRecordVideoHandler = () => {

  //   if (capturedImage || capturedVideo) {
  //     return;
  //   }
  //   startRecordVideo();
  // };
  // const stopRecordVideoHandler = () => {

  //   if (recordingStart) {
  //     stopRecordVideo();
  //   }
  // };
  const closeViewInfoButtonHandler = () => {
    setChallengeInformationView(false);
    setIsUnityLoaded(true);
  };
  const closeModalARMode = () => {
    setOpenModalARMode(false);
    setIsUnityLoaded(true);
  };
  const modals = (
    <ViewInfoModal
      isVisible={challengeInformationView}
      onClose={closeViewInfoButtonHandler}
      content={viewInfoModalContent}
    />
  );

  const modalARMode = (
    <ViewInfoModal
      isVisible={openModalARMode}
      onClose={closeModalARMode}
      content={"Modal prueba"}
    />
  );

  const handleUnityMessage = result => {
    const data = JSON.parse(result.nativeEvent.message);
    const buttonInfo = data.enableButton;
    const buttonBack = data.backPress;
    const buttonARMode = data?.ARMode;
    if (buttonBack) {
      navigation?.goBack();
    }
    if (buttonARMode) {
      setOpenModalARMode(true);
    }
    if (data?.sceneLoaded && data.sceneName === "ARReactNative") {
      setUnitySceneLoaded(true);
      const message = CAMERA_NOTIFICATION[challengeType] || "Default notification text";
      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleNotification",
        JSON.stringify({textNotification: message, isNotification: true})
      );

      // viewNotification(true);
      setTimeout(() => {
        if (unityRef.current) {
          unityRef.current.postMessage(
              "Scriptposition",
              "SetVisibleNotification",
              JSON.stringify({isNotification: false})
          );
        }
      }, 5000);
    }
    if (data.photoVideoButton?.isPhoto) {
      setCapturedImage(data.photoVideoButton?.filepath);
      setIsUnityLoaded(false);
      setUnitySceneLoaded(false);
      eraseFile();
    }
    if (data.photoVideoButton?.isPhoto == false) {
      setCapturedVideo(data.photoVideoButton?.filepath);
      setIsUnityLoaded(false);
      setUnitySceneLoaded(false);
    }
    if (data.infoButton?.isButton) {
      setChallengeInformationView(data.infoButton?.isButton);
      setIsUnityLoaded(true);
      setUnitySceneLoaded(true);
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
  let screenPadding = {};

  if (!isUnityLoaded) {
    screenPadding = {paddingBottom: 24};
  }
  // useEffect(() => {
  //   if (unitySceneLoaded && unityRef.current) {
  //     viewNotification(true);
  //     setTimeout(() => {
  //       if (unityRef.current) {
  //         viewNotification(false);
  //       }
  //     }, 5000);
  //   }
  // }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        await requestMultiple([
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.RECORD_AUDIO,
          PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION,
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        ]);
      } else if (Platform.OS === "ios") {
        await requestMultiple([
          PERMISSIONS.IOS.CAMERA,
          PERMISSIONS.IOS.MICROPHONE,
          PERMISSIONS.IOS.PHOTO_LIBRARY,
          PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
        ]);
      }

      if (openGallery) {
        pickFromGallery();
      } else {
        setIsUnityLoaded(true);
      }
    };

    requestPermissions();
  }, []);
  useEffect(() => {
    if (!unitySceneLoaded || !unityRef.current || !isUnityLoaded) return;

    console.log("🎯 Unity listo. Ejecutando setup...");

    pointsCount();
    isLoadingUnity();

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
  }, [unitySceneLoaded, challengeType, isUnityLoaded]);

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
        imageFilter={{challengeObj: challengeObj, viewShotRef: viewShotRef}}
        capturedVideo={capturedVideo}
        isVideo={isVideo}
      />
      {!unitySceneLoaded && isUnityLoaded && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.99)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color: "#fff", marginTop: 10}}>Loading AR experience</Text>
        </View>
      )}
      {!isUnityLoaded && (
        <CameraControls
          hasCapturedContent={!!capturedImage || !!capturedVideo}
          onRetake={retakeButtonHandler}
          onDone={doneButtonHandler}
          // startRecordVideo={startRecordVideoHandler}
          // stopRecordVideo={stopRecordVideoHandler}
          // isRecording={!!recordingStart}
          // timer={timer}
          isVideo={!!capturedVideo}
          challengeHasFilters={challengeHasFilters}
        />
      )}
    </ChallengeScreen>
  );
};

export default ArChallengeCapture;
