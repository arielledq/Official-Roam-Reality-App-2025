import React, { useEffect, useFocusEffect, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import Geolocation from "react-native-geolocation-service";
import {
  convertMetersToFeets,
  findNearestLocationPoint,
  getCloseLocationDistance,
  hasLocationPermission,
  isLocationPointWithinRadius,
  orderByDistanceLocationPoint,
} from "../../../util/LocationLib";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import RenderHTML from "react-native-render-html";
import { AppButton } from "../../../components";
import useStyles from "./styles";
import { FontSizes } from "../../../util/FontUtils";
import { getAllCollectedStars, starFoundAndSaveApi, updateUserPointAPI } from "../../../network";
import CompassHeading from "react-native-compass-heading";
import TravelDataPopUp from "../traveldatapopup";
import ArStarChallengeShare from "../starshare";
import UnityView from "@azesmway/react-native-unity/src";
import UnityARCamera from "components/UnityArView";
import RNFetchBlob from "rn-fetch-blob";
import { unzip } from "react-native-zip-archive";
import RNFS from "react-native-fs";
import SpeakerIcon from "../../../assets/geoar/speaker_icon.svg";
import InfoIcon from "../../../assets/geoar/Info.svg";
import MenIcon from "../../../assets/geoar/men_icon.svg";
import RadarBlipIcon from "../../../assets/geoar/radar_blip.svg";
import StarIcon from "../../../assets/geoar/star_icon.svg";
import TrophyIcon from "../../../assets/geoar/trophy_icon.svg";
import LineIcon from "../../../assets/ar/line.png";
import Sound from "react-native-sound";
import CaptureInfoView from "components/CaptureInfoView";

const { width } = Dimensions.get("window");

const StarChallenge = () => {
  const _styles = useStyles();
  const dispatch = useDispatch();
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const selectedGeoARSiteStars = useSelector(state => state.ar?.selectedGeoARSiteStars);
  const settings = useSelector(state => state.ar?.arSettings);
  const challengeObjParameters = useSelector(state => state.ar?.parameters);
  const navigation = useNavigation();

  const unityRef = useRef(null); // Unity reference
  const watchId = useRef(null); // Geolocation watch ID

  const [isUnityLoaded, setIsUnityLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [detailsShow, setDetailsShow] = useState(true);
  const [factsShow, setFactsShow] = useState(false);
  const [challengeInformationView, setChallengeInformationView] = useState(false);
  const [distanceInFeet, setDistanceInFeet] = useState(0);
  const [starShouldVisible, setStarShouldVisible] = useState(false);
  const [challengeObj, setChallengeObj] = useState(
    selectedGeoARSiteStars.length > 0 ? selectedGeoARSiteStars[0]?.challenges : {}
  );
  const [collectedStars, setCollectedStars] = useState([]);
  const [starsCount, setStarsCount] = useState(0);
  const [starObj, setStarObj] = useState(
    selectedGeoARSiteStars.length > 0 ? selectedGeoARSiteStars[0] : {}
  );
  const [nearestPoint, setNearestPoint] = useState({ latitude: 0, longitude: 0 });
  const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });
  const [compassHeading, setCompassHeading] = useState(0);
  const [allStarsCollected, setAllStarsCollected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sourcesFiles, setSourcesFiles] = useState([]);
  const [starModels, setStarModels] = useState([]);
  const [starObjE, setStarObjE] = useState(null);
  const [processingMedia, setProcessingMedia] = useState(false);
  const [textureBase, setTextureBase] = useState();
  const [textureEmission, setTextureEmission] = useState();
  const [fFoldefile, setFoldefile] = useState();
  const [modelResource, setModelResource] = useState();
  const [threshold, setThreshold] = useState(0);
  const [intensity, setIntensity] = useState(1);
  const [unityMessage, setUnityMessage] = useState(false);

  // Check and request permissions
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

  // Set the total number of stars to collect
  const setStarCounts = () => {
    let count = 0;
    for (const stars_site of selectedGeoARSiteStars) {
      if (stars_site.star_location && stars_site.star_location.coordinates) {
        count += stars_site.star_location.coordinates.length;
      }
    }
    setStarsCount(count);
  };

  // Get collected stars from the server
  const getCollectedStar = () => {
    getAllCollectedStars({
      geo_site: selectedGeoSite.id,
    })
      .then(res => {
        if (res.status === 1) {
          const stars = res.data;
          const collectedStarsFromAPI = stars.map(s => ({
            latitude: s.point.coordinates[1],
            longitude: s.point.coordinates[0],
          }));
          const finalCollectedStars = [...collectedStarsFromAPI, ...collectedStars];
          setCollectedStars(finalCollectedStars);
          getLocation();
          getLocationUpdates();
        }
      })
      .finally(() => {});
  };

  // Update user points when a star is collected
  const updateUserPoint = starObj => {
    updateUserPointAPI({
      points: starObj?.challenges?.points,
    })
      .then(res => {})
      .finally(() => {});
  };

  // Save collected star to the server
  const saveCollectedStar = (point, starObj) => {
    starFoundAndSaveApi({
      geo_site: selectedGeoSite.id, // sitio
      geo_ar_star: starObj.id, // challenge
      geo_ar_star_point: starObj.id, // id de la estrella
      latitude: point.latitude,
      longitude: point.longitude,
      name: new Date().toISOString(),
    })
      .then(res => {})
      .finally(() => {});
  };

  // Get current location
  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      return;
    }
    Geolocation.getCurrentPosition(
      position => {
        findNearPoint(position);
        setCurrentLocation(position.coords);
      },
      error => {
        console.error(error);
      },
      {
        accuracy: {
          android: "high",
          ios: "best",
        },
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

  // Watch for location updates
  const getLocationUpdates = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      return;
    }
    watchId.current = Geolocation.watchPosition(
      position => {
        findNearPoint(position);
        setCurrentLocation(position.coords);
      },
      error => {
        console.error(error);
      },
      {
        accuracy: {
          android: "high",
          ios: "best",
        },
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

  // Stop location updates
  const stopLocationUpdates = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
      Geolocation.stopObserving();
    }
  };

  const sendMessages = () => {
    if (unityRef.current) {
      unityRef.current.postMessage(
        "Main Camera", // Nombre del script en Unity
        "SendMessageToMobileApp", // Método que se llamará
        ""
      );
    }
  };

  const handleUnityMessage = event => {
    const message = event?.nativeEvent?.message;
    // Alert.alert("Mensaje de Unity", message);
    setUnityMessage(message); // Muestra el mensaje recibido
  };

  useEffect(() => {
    if (!unityRef.current) {
      // console.log("UnityRef not ready, waiting...");
      return;
    }

    if (starModels && textureBase && unityRef.current) {
      // console.log("Sending data to Unity...");
      sendModelDataToUnity();
      sendBloomValuesToUnity();
      //  handleUnityMessage();
      sendMessages();
    }
  }, [isUnityLoaded]);

  useEffect(() => {
    if (challengeObjParameters) {
      setThreshold(parseFloat(challengeObjParameters?.bloom_threshold) || 0.1);
      setIntensity(parseFloat(challengeObjParameters?.bloom_intensity) || 2);
    }
  }, [challengeObjParameters]);

  // Check if a star is already collected
  const isStarIsCollected = point => {
    return collectedStars.some(
      cPoint => point.latitude === cPoint.latitude && point.longitude === cPoint.longitude
    );
  };

  // Find the nearest point (star) and update state accordingly
  const findNearPoint = position => {
    let arrayPoints = [];
    for (let i = 0; i < selectedGeoARSiteStars.length; i++) {
      const starObj = selectedGeoARSiteStars[i];
      for (let j = 0; j < starObj.star_location.coordinates.length; j++) {
        const point = starObj.star_location.coordinates[j];
        const pushPoint = { latitude: point[1], longitude: point[0], starObj };
        if (!isStarIsCollected(pushPoint)) {
          arrayPoints.push(pushPoint);
        }
      }
    }
    try {
      if (arrayPoints.length > 0) {
        const nearestPoints = orderByDistanceLocationPoint(position.coords, arrayPoints);
        const nearestPoint = findNearestLocationPoint(position.coords, nearestPoints);
        const distance = getCloseLocationDistance(position.coords, nearestPoint);
        const starShouldVisibleNow = isLocationPointWithinRadius(
          position.coords,
          nearestPoint,
          Number(nearestPoint.starObj.visibility_radius)
        );
        if (starShouldVisibleNow && !isStarIsCollected(nearestPoint)) {
          setCollectedStars(prevCollectedStars => [...prevCollectedStars, nearestPoint]);
          saveCollectedStar(nearestPoint, nearestPoint.starObj);
          updateUserPoint(nearestPoint.starObj);
        }
        setDistanceInFeet(convertMetersToFeets(distance));
        setStarShouldVisible(starShouldVisibleNow);
        setChallengeObj(nearestPoint.starObj?.challenges);
        setStarObj(nearestPoint.starObj);
        setNearestPoint(nearestPoint);
        setCurrentLocation(position.coords);
      } else {
        setAllStarsCollected(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Start compass heading updates PEDIENTE LENTO
  // useEffect(() => {
  //   const degree_update_rate = 3;
  //   CompassHeading.start(degree_update_rate, heading => {
  //     setCompassHeading(heading);
  //   });
  //   return () => {
  //     CompassHeading.stop();
  //   };
  // }, []);

  // ComponentDidMount equivalent
  useEffect(() => {
    checkPermission();
    getCollectedStar();
    setStarCounts();
    return () => {
      stopLocationUpdates();
    };
  }, []);

  // Download and unzip model files for each star
  const downloadAndPrepareModels = () => {
    if (selectedGeoARSiteStars.length > 0) {
      setLoading(true);
      selectedGeoARSiteStars.forEach(starObj => {
        const challengeObj = starObj.challenges;
        const modelFile = challengeObj?.model_file;
        if (challengeObj?.challenge_choice === "3DMODEL" && modelFile) {
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
                setProgress(progress);
                console.log("Progreso de descarga:", progress, "%");
              })
              .then(res => {
                unzipModelFile(res.path(), targetPath);
              })
              .catch(error => {});
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

                      const filePath =
                        Platform.OS === "android" ? `file://${file.path}` : file.path;

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
                      setSourcesFiles(sourcesArray);
                      setFoldefile(result);
                    });
                    setLoading(false);
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
      });
    } else {
      console.log("No hay modelos seleccionados.");
    }
  };

  // Download models when component mounts
  useEffect(() => {
    downloadAndPrepareModels();
  }, []);

  // Open fun facts modal
  const openFunFacts = starObjE => {
    setFactsShow(true);
    setStarObjE(starObjE);
  };

  const acceptWaiverButtonHandler = () => {
    setDetailsShow(false);
    setIsUnityLoaded(true);
  };

  // Take screenshot (if needed)
  const takeScreenshot = () => {
    // Implement screenshot functionality if required
  };

  // Handle Unity messages
  const onUnityMessage = event => {
    const message = event.nativeEvent.message;
    // Handle messages from Unity
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
        // position : {
        //   x: parseFloat(challengeObjParameters?.positionX) || 0,
        //   y: parseFloat(challengeObjParameters?.positionY) || 0,
        //   z: parseFloat(challengeObjParameters?.positionZ) || 0,
        // },
        emissionIntensity: parseFloat(challengeObjParameters?.emission_value) || 1,
        rotationSpeed: Number(challengeObjParameters?.loop_delay) || 1,
        scaleSpeed: Number(challengeObjParameters?.scale_sensitivity) || 0.01,
        minScale: Number(challengeObjParameters?.min_pinch_scale) || 1,
        maxScale: Number(challengeObjParameters?.max_pinch_scale) || 1,
      };
      // console.log("Datos del modelo a enviar:", modelData);
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
      const start_site = starObj.star_location.coordinates;
      console.log("----", start_site, "----", starObj.star_location);
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

      // console.log("Todos los datos fueron enviados a Unity.");
    } else {
      // console.log("No pasó la validación: Unity no está listo o faltan datos.");
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
      // console.log("UnityRef not ready, waiting...");
      return;
    }

    if (starModels && textureBase && unityRef.current) {
      // console.log("Sending data to Unity...");
      sendModelDataToUnity();
      sendBloomValuesToUnity();
    }
  }, [isUnityLoaded]);

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: starShouldVisible ? "You found a star!" : "AR Star Hunt\n" + selectedGeoSite.name,
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <StarIcon style={{ width: 48, height: 48, marginEnd: 10 }} />
            <View>
              <Text style={_styles.exploringText}>Stars Collected</Text>
              <Text style={_styles.arrivedText}>
                {collectedStars.length} / {starsCount}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ marginEnd: 10 }}>
              <Text style={_styles.exploringText}>Points</Text>
              <Text style={_styles.arrivedText}>{challengeObj?.points}</Text>
            </View>
            <TrophyIcon style={{ width: 48, height: 48 }} />
          </View>
        </View>

        {/* Unity AR Camera */}
        <View
          style={{
            width: "100%", // Add this line
            marginVertical: 20,
            overflow: "hidden",
            borderRadius: 16,
          }}
        >
          <UnityARCamera
            unityRef={unityRef}
            isProcessingMedia={processingMedia}
            isUnityLoaded={isUnityLoaded}
            capturedImage={capturedImage}
            capturedVideo={capturedVideo}
            // currentLocation={currentLocation}
            // compassHeading={compassHeading}
            // collectedStars={collectedStars}
          />
        </View>

        {/* Footer Info Box */}
        <View
          style={{
            width: "100%",
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MenIcon style={{ width: 40, height: 40 }} />
              <View style={{ marginLeft: 10 }}>
                <Text style={_styles.exploringText}>Nearest Star</Text>
                {allStarsCollected ? (
                  <Text style={_styles.arrivedText}>{"You have found all the stars!"}</Text>
                ) : (
                  <Text style={_styles.arrivedText}>
                    {starShouldVisible ? "You found a star!" : `${distanceInFeet} feet away`}
                  </Text>
                )}
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <RadarBlipIcon style={{ width: 10, height: 10, marginEnd: 25 }} />
              <TouchableOpacity>
                <SpeakerIcon style={{ width: 40, height: 40 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
            <InfoIcon style={{ width: 20, height: 20, marginEnd: 6 }} />
            <Text style={_styles.infoText}>
              The dot pulsates quicker and the chime beeps faster when you get closer to a Star. You
              can mute the sound by clicking on the speaker.
            </Text>
          </View>
        </View>
      </ScrollView>

      <CaptureInfoView
        isVisible={detailsShow}
        content={settings?.waiver_details}
        onAccept={acceptWaiverButtonHandler}
      />

      {factsShow && (
        <View
          style={{
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            position: "absolute",
          }}
        >
          <ArStarChallengeShare
            closeCallBack={() => {
              setFactsShow(false);
            }}
            challengeObj={challengeObj}
            starObj={starObjE}
          />
        </View>
      )}
    </BackgroundWithImage>
  );
};

export default StarChallenge;
