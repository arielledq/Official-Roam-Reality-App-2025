import React, {useCallback, useEffect, useRef, useState} from "react";
import {Platform} from "react-native";
import {useFocusEffect} from "@react-navigation/native";
import RNFetchBlob from "rn-fetch-blob";
import {requestMultiple, PERMISSIONS} from "react-native-permissions";
import UnityARCamera from "components/UnityArView";
import CameraControls from "components/CameraControls";
import ChallengeScreen from "components/ChallengeScreen";
import ViewInfoModal from "components/ViewInfoModal";
import {launchImageLibrary} from "react-native-image-picker";

import {CHALLENGES_TYPE, CAPTURE_CHALLENGE_TYPE} from "../../../constants";
import {CAMERA_NOTIFICATION} from "../../../constants";
import {copyFileForDisplay, handleUnzipProcess} from "util/helpers";
import ShareToSocialsModal from "components/ShareToSocialsModal";
import ARModeModal from "components/ARModeModal";

const RNFS = require("react-native-fs");
// const Sound = require("react-native-sound");

const ArChallengeCapture = ({route, navigation}) => {
  const [unityViewDimensions, setUnityViewDimensions] = useState({width: 0, height: 0});
  const [recordingStart, setRecordingStart] = useState(false);
  const [timer, setTimer] = useState("00:00");
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
  const challengeObjParameters = route?.params?.challengeObj?.parameters;
  const modelFile = route?.params?.challengeObj?.model_file;
  const openGallery = route?.params?.openGallery;

  const challengeHasFilters = challengeObj?.ar_filters?.length > 0;
  const challengeType = challengeObj?.challenge_requirement;
  const viewInfoModalContent = challengeObj?.info;

  const initialLoadTime = useRef(0);

  // FILTERS PENDING
  //  const ar_filters = challengeObj?.ar_filters;
  //  const imageUrls = ar_filters.map(filter => filter.image);
  //  const gradientColors = ar_filters[0]?.gradient_colors || ["#FF0000", "#00FF00"];
  //  const gradientDirection = ar_filters[0]?.gradient_direction === "TOP_TO_BOTTOM";

  const handleUnityViewLayout = event => {
    const {width, height} = event.nativeEvent.layout;
    setUnityViewDimensions({width, height});
    // console.log(`UnityView dimensiones: ${width} x ${height}`);
  };

  // const downloadModelFile = (sourcePath, targetPath) => {
  //   RNFetchBlob.config({
  //     fileCache: true,
  //     path: sourcePath,
  //   })
  //     .fetch("GET", modelFile)
  //     .then(res => {
  //       unzipModelFile(res.path(), targetPath);
  //     })
  //     .catch(console.error);
  // };
  //
  // const unzipModelFile = (sourcePath, targetPath) => {
  //   const charset = "UTF-8";
  //
  //   unzip(sourcePath, targetPath, charset)
  //       .then(path => {
  //         RNFS.readDir(path).then(result => {
  //           const sourcesArray = [];
  //           let objFile = null;
  //           let mtlFile = null;
  //           let baseTexture = null;
  //           let emissionTexture = null;
  //
  //           result.forEach(file => {
  //             const filePath = Platform.OS === "android" ? `file://${file.path}` : file.path;
  //             if (file.name.includes(".obj")) {
  //               objFile = filePath;
  //             } else if (file.name.includes(".mtl")) {
  //               mtlFile = filePath;
  //             } else if (file.name.toLowerCase().includes("diffuse")) {
  //               baseTexture = filePath;
  //             } else if (file.name.toLowerCase().includes("emission")) {
  //               emissionTexture = filePath;
  //             } else {
  //               sourcesArray.push({ uri: filePath });
  //             }
  //           });
  //
  //           setModelOBJ(objFile);
  //           setModelResource(mtlFile);
  //           setTextureBase(baseTexture);
  //           setTextureEmission(emissionTexture);
  //           setSourcesFiles(sourcesArray);
  //           setFoldefile(result);
  //           setLoading(false);
  //         });
  //       })
  //       .catch(err => {
  //         console.error("Error descomprimiendo el archivo:", err);
  //       });
  // };

  // useEffect(() => {
  //   if (challengeObj && modelFile) {
  //     checkIfModelExist();
  //   }
  // }, [challengeObj]);
  //
  // const checkIfModelExist = () => {
  //   if (challengeObj && modelFile) {
  //     const filename = modelFile.split("/").pop().split("?")[0];
  //     const withoutExtFilename = filename.split(".")[0];
  //     const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
  //     const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;
  //
  //     RNFS.exists(sourcePath)
  //       .then(exists => {
  //         if (exists) {
  //           unzipModelFile(sourcePath, targetPath);
  //         } else {
  //           downloadModelFile(sourcePath, targetPath);
  //         }
  //       })
  //       .catch(console.error);
  //   }
  // };


  const viewNotification = isNotification => {
    if (unityRef.current) {
      const message = CAMERA_NOTIFICATION[challengeType] || "Default notification text";
      unityRef.current.postMessage(
        "Scriptposition",
        "SetVisibleNotification",
        JSON.stringify({textNotification: message, isNotification: isNotification})
      );
    }
  };

  // useEffect(() => {
  //   viewNotification(true);
  //   setTimeout(() => {
  //     viewNotification(false)
  //   }, 5000);
  //  }, []);

  useEffect(() => {
    viewNotification(true);

    const timerId = setTimeout(() => {
      if (unityRef.current) {
        viewNotification(false);
      }
    }, 5000);
  }, []);

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
              JSON.stringify({ isVisible: false })
          );
        }
      }, 2000);
    } else {
      if (unityRef.current) {
        unityRef.current.postMessage(
            "OBJImport",
            "SetLoadingVisibility",
            JSON.stringify({ isVisible: false })
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

    console.log("updatedData", updatedData);

    // Navegar y pasar la captura actualizada
    navigation.reset({
      index: 0,
      // @ts-ignore
      routes: [
        {
          name: "ArChallengeShare",
          params: {
            challengeObj: challengeObj,
            captureData: updatedData,
            challengeType: CHALLENGES_TYPE.PHOTO_VIDEO,
          },
        },
      ],
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
      } else {
        setIsUnityLoaded(true);
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
  const closeModalARMode = () => {
    setOpenModalARMode(false);
    setIsUnityLoaded(true);
  };

  const eraseFile = async () => {
    if (Platform.OS === "android") {
      try {
        const basePath = RNFS.ExternalStorageDirectoryPath || RNFS.DocumentDirectoryPath;
        const androidFilePath = `${basePath}/Android/data/com.roam_reality/files`;

        await keepFileMostRecent(androidFilePath, ".png");
      } catch (error) {
        console.error(error);
      }
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
      console.error("keepFileMostRecent", error);
    }
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
      content = {'Modal prueba'}/>
  )

  const handleUnityMessage = result => {

    const data = JSON.parse(result.nativeEvent.message);
    const buttonInfo = data.enableButton;
    const buttonBack = data.backPress;
    const buttonARMode = data?.ARMode

    if (buttonBack) {
      navigation?.goBack();
    }
    if (buttonARMode){
      console.log('entroaqui ',openModalARMode )

      setOpenModalARMode(true)
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
    screenPadding = { paddingBottom: 24 };
  }

  useFocusEffect(() => {
    // Only run these operations if unityRef.current is available
    if (unityRef.current) {
      // Use a setTimeout to give Unity a moment to fully initialize
      const timer = setTimeout(() => {
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
      }, 500); // 500ms delay

      // Clean up the timer when the component unmounts or loses focus
      return () => clearTimeout(timer);
    }
  });

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
      <ARModeModal
          // fileUri={filePath}
          // fileExt={fileExt}
          isVisible={openModalARMode}
          // isMemory={isMemory}
          // sponsor={sponsor}
          // onPointsGranted={countSocialPoints}
          onClose={closeModalARMode}
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
