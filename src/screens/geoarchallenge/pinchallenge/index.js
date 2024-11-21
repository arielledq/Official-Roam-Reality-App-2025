import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import UnityView from "@azesmway/react-native-unity/src"; // Import UnityView
import useStyles from "./styles";
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
import { AppButton } from "../../../components";
import LineIcon from "../../../assets/ar/line.png";
import SpeakerIcon from "../../../assets/geoar/speaker_icon.svg";
import InfoIcon from "../../../assets/geoar/Info.svg";
import MenIcon from "../../../assets/geoar/men_icon.svg";
import RadarBlipIcon from "../../../assets/geoar/radar_blip.svg";
import PinIcon from "../../../assets/geoar/pin_locationicon.svg";
import TrophyIcon from "../../../assets/geoar/trophy_icon.svg";
import CaptureIcon from "../../../assets/geoar/capture_icon.svg";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import RenderHTML from "react-native-render-html";
import { FontSizes } from "../../../util/FontUtils";
import uuid from "react-native-uuid";
import Sound from "react-native-sound";
import ImageResizer from "react-native-image-resizer";
import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import RNFS from "react-native-fs";

const { width } = Dimensions.get("window");

const PinChallenge = ({}) => {
  const _styles = useStyles();
  const navigation = useNavigation();
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const challengeObj = selectedGeoSite.pin_challenge;
  const challengeObjParameters = challengeObj?.parameters;
  const modelFile = challengeObj.model_file;
  const settings = useSelector(state => state.ar?.arSettings);
  const watchIdRef = useRef(null);

  const unityRef = useRef(null); // Unity reference
  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [distanceInFeet, setDistanceInFeet] = useState(0);
  const [isMeInsideInSite, setIsMeInsideInSite] = useState(false);
  const [detailsShow, setDetailsShow] = useState(true);
  const [muteSound, setMuteSound] = useState(false);
  const [blinkTimer, setBlinkTimer] = useState(0);

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

  useEffect(() => {
    checkPermission();
    getLocation();
    getLocationUpdates();
    return () => stopLocationUpdates();
  }, []);

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
      console.info("UnityView o modelOBJ no están disponibles.");
    }
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

  const playProximitySound = () => {
    Sound.setCategory("Playback");
    let proximitySound = new Sound("record.mp3", Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error("failed to load the sound", error);
      } else {
        proximitySound.play();
      }
    });
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
    navigation.replace("ArPinChallengeShare", {
      challengeObj,
      captureData: capturedImage,
    });
  };

  useEffect(() => {
    if (challengeObj && modelFile) {
      checkIfModelExist();
    }
  }, [challengeObj]);

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

  useEffect(() => {
    if (distanceInFeet <= 200 && distanceInFeet > 100) {
      setBlinkTimer(3000);
    } else if (distanceInFeet <= 100 && distanceInFeet >= 50) {
      setBlinkTimer(2000);
    } else if (distanceInFeet < 50 && distanceInFeet >= 25) {
      setBlinkTimer(1000);
    } else if (distanceInFeet < 10) {
      setBlinkTimer(500);
    } else {
      setBlinkTimer(0);
    }
  }, [distanceInFeet]);

  useEffect(() => {
    const setInterValSoundBlink = setInterval(() => {
      if (!muteSound) {
        playProximitySound();
      }
    }, blinkTimer);

    if (blinkTimer > 0) {
    } else {
      clearInterval(setInterValSoundBlink);
    }

    return () => {
      clearInterval(setInterValSoundBlink);
    };
  }, [blinkTimer, muteSound]);

  const Blink = ({ duration, style, children }) => {
    if (duration === 0) {
      return <View style={{ ...style }}>{children}</View>;
    }

    const fadeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnimation, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [duration]);

    return (
      <View style={{ ...style }}>
        <Animated.View style={{ opacity: fadeAnimation }}>{children}</Animated.View>
      </View>
    );
  };

  const InfoView = () => (
    <View style={_styles.challengeInfoContainer}>
      <View style={_styles.challengeInfoHeaderContainer}>
        <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
        <Text style={_styles.challengeInfoHeader}>Waiver Details</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%", padding: 24 }}
      >
        <RenderHTML
          contentWidth={width}
          tagsStyles={{ p: { color: "#9CA3AF", fontSize: FontSizes.S14 } }}
          source={{
            html: `${settings?.waiver_details.toString().replaceAll("#000000", "#fff")}`,
          }}
        />
      </ScrollView>
      <View style={{ width: "100%", paddingHorizontal: 24 }}>
        <AppButton
          onPress={() => {
            setDetailsShow(false);
            setIsUnityLoaded(true);
          }}
          buttonStyle={_styles.buttonStyle}
          containerStyle={_styles.buttonContainerStyle}
          title={"Accept and Continue"}
        />
        <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.goBack()}>
          <Text style={_styles.bottomText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <BackgroundWithImage style={_styles.mainContainer}>
        <AppHeader
          centerComponent={{
            text: `Location Check In\n${selectedGeoSite.name}`,
            numberOfLines: 2,
            style: _styles.heading,
          }}
          backgroundColor="transparent"
        />
        <View style={{ width: "100%", flex: 1 }}>
          <View
            style={{
              backgroundColor: "#131422",
              borderRadius: 100,
              paddingHorizontal: 8,
              alignItems: "center",
              height: 65,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <PinIcon style={{ width: 48, height: 48, marginEnd: 10 }} />
              <View>
                <Text style={_styles.exploringText}>Pin Found</Text>
                <Text style={_styles.arrivedText}>{isMeInsideInSite ? 1 : 0} / 1</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginEnd: 10 }}>
                <Text style={_styles.exploringText}>Points</Text>
                <Text style={_styles.arrivedText}>{challengeObj?.points}</Text>
              </View>
              <TrophyIcon style={{ width: 48, height: 48 }} />
            </View>
          </View>
          <View style={{ flex: 1, marginVertical: 20 }}>
            <View style={{ flex: 1 }}>
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
                      <View style={_styles.ARMainContainer} onLayout={handleUnityViewLayout}>
                        <UnityView
                          ref={unityRef}
                          style={{ width: "100%", flex: 1, zIndex: -1 }}
                          onUnityMessage={message => {
                            // Handle messages from Unity
                          }}
                        />
                      </View>
                    )}
                  </BackgroundWithImage>
                  {capturedImage && <Image style={_styles.f1} source={{ uri: capturedImage }} />}
                </>
              )}
              <TouchableOpacity
                disabled={!!capturedImage}
                onPress={_takeScreenshot}
                style={{
                  width: 56,
                  height: 56,
                  position: "absolute",
                  bottom: -28,
                  alignSelf: "center",
                }}
              >
                <CaptureIcon />
              </TouchableOpacity>
              {capturedImage && (
                <View
                  style={{
                    paddingHorizontal: 15,
                    position: "absolute",
                    bottom: 15,
                    justifyContent: "space-between",
                    flexDirection: "row",
                    width: "100%",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setCapturedImage(null);
                      setCapturedVideo(null);
                      setIsUnityLoaded(true);
                    }}
                    activeOpacity={0.8}
                    style={_styles.bottomButtonContainer}
                  >
                    <Text style={_styles.bottomButtonText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onDonePress}
                    activeOpacity={0.8}
                    style={_styles.bottomButtonContainer}
                  >
                    <Text style={_styles.bottomButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              backgroundColor: "#131422",
              borderRadius: 16,
              padding: 20,
              paddingBottom: 20,
              marginVertical: 20,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 15,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <MenIcon style={{ width: 40, height: 40 }} />
                <View>
                  <Text style={_styles.exploringText}>Pin</Text>
                  <Text style={_styles.arrivedText}>
                    {isMeInsideInSite ? "Pin Found" : `${distanceInFeet} feet away`}
                  </Text>
                </View>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}
              >
                <Blink duration={blinkTimer} style={{ marginEnd: 10 }}>
                  <RadarBlipIcon style={{ width: 10, height: 10, marginEnd: 25 }} />
                </Blink>
                <TouchableOpacity onPress={() => setMuteSound(!muteSound)}>
                  <SpeakerIcon
                    style={{ width: 40, height: 40, color: !muteSound ? "#fff" : "#000" }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <InfoIcon style={{ width: 20, height: 20, marginEnd: 6 }} />
              <Text style={_styles.infoText}>
                The closer you get to the Pin faster the chime beeps and quicker the dot pulsates.
                You can switch off the Sound by clicking on the speaker.
              </Text>
            </View>
          </View>
        </View>
      </BackgroundWithImage>
      {detailsShow && InfoView()}
    </View>
  );
};

export default PinChallenge;
