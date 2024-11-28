import React, { useEffect, useRef, useState } from "react";
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

const { width } = Dimensions.get("window");

const StarChallenge = () => {
  const _styles = useStyles();
  const dispatch = useDispatch();
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const selectedGeoARSiteStars = useSelector(state => state.ar?.selectedGeoARSiteStars);
  const settings = useSelector(state => state.ar?.arSettings);
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
      geo_site: selectedGeoSite.id,
      geo_ar_star: starObj.id,
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

  // Start compass heading updates
  useEffect(() => {
    const degree_update_rate = 3;
    CompassHeading.start(degree_update_rate, heading => {
      setCompassHeading(heading);
    });
    return () => {
      CompassHeading.stop();
    };
  }, []);

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
      selectedGeoARSiteStars.forEach((starObj, index) => {
        const challengeObj = starObj.challenges;
        const modelFile = challengeObj?.model_file;

        if (challengeObj?.challenge_choice === "3DMODEL" && modelFile) {
          const filename = modelFile.split("/").pop().split("?")[0];
          const withoutExtFilename = filename.split(".")[0];
          const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
          const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;

          const downloadModelFile = () => {
            RNFetchBlob.config({
              fileCache: true,
              path: sourcePath,
            })
              .fetch("GET", modelFile)
              .progress((received, total) => {
                setProgress(Math.trunc(Number((received / total) * 100)));
              })
              .then(res => {
                unzipModelFile(res.path());
              })
              .catch(error => {
                console.error(error);
              });
          };

          const unzipModelFile = sourcePath => {
            const charset = "UTF-8";
            unzip(sourcePath, targetPath, charset)
              .then(path => {
                RNFS.readDir(path).then(result => {
                  let objFile = null;
                  result.forEach(file => {
                    if (file.name.includes(".obj")) {
                      objFile = Platform.OS === "android" ? `file://${file.path}` : file.path;
                    }
                  });
                  if (objFile) {
                    setStarModels(prevModels => [
                      ...prevModels,
                      { starId: starObj.id, modelPath: objFile },
                    ]);
                  }
                  setLoading(false);
                  setIsUnityLoaded(false); // Desmonta UnityView al capturar la imagen
                });
              })
              .catch(error => {
                console.error(error);
                setLoading(true);
              });
          };

          RNFS.exists(sourcePath)
            .then(exists => {
              if (exists) {
                unzipModelFile(sourcePath);
              } else {
                downloadModelFile();
              }
            })
            .catch(error => {
              console.error(error);
            });
        }
      });
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

  // Send model data to Unity
  const sendModelDataToUnity = () => {
    if (unityRef.current && starModels.length > 0) {
      starModels.forEach(starModel => {
        const starObj = selectedGeoARSiteStars.find(star => star.id === starModel.starId);
        const challengeObj = starObj?.challenges;
        const challengeObjParameters = challengeObj?.parameters;

        const modelData = {
          objFile: starModel.modelPath.replace("file://", ""),
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
          rotation: { x: 0, y: 0, z: 0 },
          position: {
            x: challengeObjParameters?.positionX ? Number(challengeObjParameters?.positionX) : 0,
            y: challengeObjParameters?.positionY ? Number(challengeObjParameters?.positionY) : -5,
            z: challengeObjParameters?.positionZ ? Number(challengeObjParameters?.positionZ) : -25,
          },
        };

        unityRef.current.postMessage("StarManager", "AddStar", JSON.stringify(modelData));
      });
    }
  };

  // Send model data to Unity when models are ready
  useEffect(() => {
    if (starModels.length > 0) {
      sendModelDataToUnity();
    }
  }, [starModels]);

  return (
    <View style={{ flex: 1 }}>
      <BackgroundWithImage style={_styles.mainContainer}>
        <AppHeader
          centerComponent={{
            text: starShouldVisible ? "You found a star!" : "AR Star Hunt\n" + selectedGeoSite.name,
            numberOfLines: 2,
            style: [_styles.heading],
          }}
          backgroundColor="transparent"
        />

        <View style={{ width: "100%", flex: 1 }} showsVerticalScrollIndicator={false}>
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
              <StarIcon style={{ width: 48, height: 48, marginEnd: 10 }} />
              <View>
                <Text style={_styles.exploringText}>Stars Collected</Text>
                <Text style={_styles.arrivedText}>
                  {collectedStars.length} / {starsCount}
                </Text>
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
          <View
            style={{
              flex: 1,
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
              starModels={starModels}
              currentLocation={currentLocation}
              compassHeading={compassHeading}
              collectedStars={collectedStars}
            />
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
              <View style={{ flexDirection: "row", flex: 1 }}>
                <MenIcon style={{ width: 40, height: 40 }} />
                <View style={{ flex: 1 }}>
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
              <View
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}
              >
                <RadarBlipIcon style={{ width: 10, height: 10, marginEnd: 25 }} />
                <TouchableOpacity>
                  <SpeakerIcon style={{ width: 40, height: 40 }} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <InfoIcon style={{ width: 20, height: 20, marginEnd: 6 }} />
              <Text style={_styles.infoText}>
                The dot pulsates quicker and the chime beeps faster when you get closer to a Star.
                You can mute the sound by clicking on the speaker.
              </Text>
            </View>
          </View>
        </View>
      </BackgroundWithImage>

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
    </View>
  );
};

export default StarChallenge;
