import React, { useEffect, useRef, useState } from "react"

import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import SpeakerIcon from "../../../assets/geoar/speaker_icon.svg"
import InfoIcon from "../../../assets/geoar/Info.svg"
import MenIcon from "../../../assets/geoar/men_icon.svg"
import RadarBlipIcon from "../../../assets/geoar/radar_blip.svg"
import StarIcon from "../../../assets/geoar/star_icon.svg"
import TrophyIcon from "../../../assets/geoar/trophy_icon.svg"
import LineIcon from '../../../assets/ar/line.png';
import {
  ViroARScene,
  ViroMaterials,
  ViroTrackingStateConstants,
  ViroARSceneNavigator,
  Viro3DObject,
  ViroImage,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroSpotLight,
  ViroText,
  ViroNode,
  ViroCamera,
  ViroARCamera
} from '@viro-community/react-viro';
import RNFetchBlob from 'rn-fetch-blob';
const Sound = require('react-native-sound');
const RNFS = require('react-native-fs');
import { unzip } from 'react-native-zip-archive'

const { config, fs } = RNFetchBlob;
import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { useNavigation } from "@react-navigation/native";
import { request, requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { convertMetersToFeets, findNearestLocationPoint, getCloseLocationDistance, hasLocationPermission, isLocationPointWithinRadius, orderByDistanceLocationPoint, transformGpsToAR } from "../../../util/LocationLib";
import { Image } from "react-native";
import RenderHTML from "react-native-render-html";
import { AppButton } from "../../../components";
const { width } = Dimensions.get('window');
import { FontSizes } from "../../../util/FontUtils"
import { getAllCollectedStars, starFoundAndSaveApi, updateUserPointAPI } from "../../../network";
import CompassHeading from 'react-native-compass-heading';
import TravelDataPopUp from "../traveldatapopup";

const StarChallenge = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const selectedGeoARSiteStars = useSelector(state => state.ar?.selectedGeoARSiteStars)
  const settings = useSelector(state => state.ar?.arSettings)
  const navigation = useNavigation()

  const ARScreen = (props) => {
    const funFactCallback = props?.arSceneNavigator.viroAppProps.funFactCallback
    const [allStarsObj, setAllStarsObj] = useState(props?.arSceneNavigator.viroAppProps.allStarsObj)
    const [challengeObj, setChallengeObj] = useState(props?.arSceneNavigator.viroAppProps.challengeObj)
    const [currentLocation, setCurrentLocation] = useState(props?.arSceneNavigator.viroAppProps.currentLocation)
    const [nearestPoint, setNearestPoint] = useState(props?.arSceneNavigator.viroAppProps.nearestPoint)
    const [compassHeading, setCompassHeading] = useState(props?.arSceneNavigator.viroAppProps.compassHeading)
    const [challengeObjParameters, setChallengeObjParameters] = useState(challengeObj?.parameters)
    const [modelFile, setModelFile] = useState(challengeObj?.model_file)
    const [starShouldVisible, setStarShouldVisible] = useState(props.arSceneNavigator.viroAppProps.starShouldVisible)
    const [sourcesFiles, setSourcesFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scale, setScale] = useState([challengeObjParameters?.scale_object ? Number(challengeObjParameters?.scale_object) : 0.05,
    challengeObjParameters?.scale_object ? Number(challengeObjParameters?.scale_object) : 0.05,
    challengeObjParameters?.scale_object ? Number(challengeObjParameters?.scale_object) : 0.05]);
    const [rotate, setRotate] = useState([0, 0, 0]);
    const [progress, setProgress] = useState([0, 0, 0]);

    function onInitialized(state, reason) {
      console.log('guncelleme', state, reason);
      if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
        // Handle loss of tracking
      }
    }

    const downloadModelFile = (sourcePath, targetPath, callBack) => {
      config({
        fileCache: true,
        path: sourcePath,
      })
        .fetch('GET', modelFile)
        .progress((received, total) => {
          console.log('progress', received / total)
          setProgress(Math.trunc(Number((received / total) * 100)))
        })
        .then((res) => {// the temp file path
          console.log('The file saved to ', res.path());
          unzipModelFile(res.path(), targetPath, callBack)
        })
        .catch((error) => {
          console.error(error)
        });
    }

    const unzipModelFile = (sourcePath, targetPath, callBack) => {
      const charset = 'UTF-8'
      unzip(sourcePath, targetPath, charset)
        .then((path) => {
          console.log(`unzip completed at ${path}`)
          RNFS.readDir(path)
            .then((result) => {
              console.log('GOT RESULT', result);
              const sourcesArray = []
              for (let i = 0; i < result.length; i++) {
                if (result[i].isFile) {
                  console.log("unzipModelFile", result[i].name)
                  if (result[i].name.includes(".vrx")) {
                    const vrxFile = Platform.OS === 'android' ? `file://${result[i].path}` : result[i].path
                    console.log("unzipModelFile", vrxFile)
                    callBack(vrxFile)
                  } else {
                    const sourceFile = Platform.OS === 'android' ? `file://${result[i].path}` : result[i].path
                    sourcesArray.push(sourceFile)
                  }
                }
              }
              if (sourcesArray.length > 0) {
                setSourcesFiles(sourcesArray)
              }
              setLoading(false)
            })
        })
        .catch((error) => {
          console.error(error)
          setLoading(true)
        })
    }

    const checkIfModelExist = (modelFile, callBack) => {
      let filename = modelFile.split('/').pop()
      filename = filename.split('?')[0];
      withoutExtFilename = filename.split('.')[0];
      const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;
      RNFS.exists(sourcePath)
        .then((exists) => {
          console.log("exists:", exists)
          if (exists) {
            console.log('File exists');
            unzipModelFile(sourcePath, targetPath, callBack)
          } else {
            downloadModelFile(sourcePath, targetPath, callBack)
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }

    useEffect(() => {
      setStarShouldVisible(props.arSceneNavigator.viroAppProps.starShouldVisible)
    }, [props.arSceneNavigator.viroAppProps.starShouldVisible]);

    useEffect(() => {
      setCurrentLocation(props.arSceneNavigator.viroAppProps.currentLocation)
    }, [props.arSceneNavigator.viroAppProps.currentLocation]);

    useEffect(() => {
      setNearestPoint(props.arSceneNavigator.viroAppProps.nearestPoint)
    }, [props.arSceneNavigator.viroAppProps?.nearestPoint]);

    useEffect(() => {
      setCompassHeading(props.arSceneNavigator.viroAppProps.compassHeading)
    }, [props.arSceneNavigator.viroAppProps?.compassHeading]);

    useEffect(() => {
      setChallengeObj(props?.arSceneNavigator.viroAppProps.challengeObj)
      setChallengeObjParameters(props?.arSceneNavigator.viroAppProps.challengeObj?.parameters)
      setModelFile(props?.arSceneNavigator.viroAppProps.challengeObj?.model_file)
    }, [props?.arSceneNavigator.viroAppProps.challengeObj]);

    useEffect(() => {
      if (challengeObj?.challenge_choice == "3DMODEL") {
        setLoading(true)
        for (let i = 0; i < allStarsObj.length; i++) {
          let starsObj = allStarsObj[i]
          const challengeObj = starsObj?.challenges
          checkIfModelExist(challengeObj?.model_file, (modelPath) => {
            const newStarObj = Object.assign({ modelPath: modelPath }, starsObj);
            delete allStarsObj[i]
            const newArrayStars = [...allStarsObj, newStarObj]
            console.log(newArrayStars)
            setAllStarsObj(newArrayStars)
          })
        }
      }
    }, []);

    const _onRotate = (rotateState, rotationFactor, source) => {
      if (rotateState == 3) {
        const rotation = [rotate[0], rotate[1] + rotationFactor, rotate[2]]
        setRotate(rotation)
        return;
      }
      const rotation = [rotate[0], rotate[1] + rotationFactor, rotate[2]]
      setRotate(rotation)
    }

    const _onDrag = (draggedToPosition, source) => {
    }

    const _onPinch = (pinchState, scaleFactor, source) => {
      if ((scale[0] * scaleFactor) <= challengeObjParameters?.min_pinch_scale) {
        return;
      }
      if ((scale[0] * scaleFactor) >= challengeObjParameters?.max_pinch_scale) {
        return;
      }
      let newScale = [
        scale[0] * scaleFactor,
        scale[1] * scaleFactor,
        scale[2] * scaleFactor
      ];

      if (pinchState == 3) {
        setScale(newScale)
        return;
      }
    };

    return (
      <ViroARScene onTrackingUpdated={onInitialized}>
        <ViroAmbientLight color="#FFFFFF" intensity={250} />
        <ViroDirectionalLight color="#FFFFFF" direction={[0, -1, 0]} />
        <ViroDirectionalLight color="#FFFFFF" direction={[0, 0, -1]} />
        {
          challengeObjParameters?.bloom &&
          <ViroDirectionalLight color="#FFFFFF" direction={[-1, 0, 0]} />
        }
        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, 1, 0]}
          position={[0, -7, 0]}
          color="#ffffff"
          intensity={250} />
        {
          allStarsObj.map(starObjE => {
            const challengeObj = starObjE?.challenges;
            const challengeObjParameters = challengeObj?.parameters;
            const modelPath = starObjE?.modelPath;

            for (j = 0; j < starObjE.star_location.coordinates.length; j++) {
              const point = starObjE.star_location.coordinates[j]
              const starPoint = { latitude: point[1], longitude: point[0] }
              const starShouldVisibleNow = isLocationPointWithinRadius(currentLocation, starPoint, Number(starObjE?.visibility_radius))
              const coords = transformGpsToAR(currentLocation, starPoint, compassHeading);
              const newScale = Math.abs(Math.round(coords.z / 15));;
              if (modelPath && challengeObj?.challenge_choice == "3DMODEL" && starShouldVisibleNow) {
                ViroMaterials.createMaterials({
                  grid: {
                    lightingModel: "Lambert",
                    shininess: .6,
                  },
                  mat: {
                    shininess: .6,
                    blendMode: "Add",
                    lightingModel: "Lambert",
                    bloomThreshold: challengeObjParameters ? Number(challengeObjParameters?.bloom_threshold) : 0.5,
                    diffuseColor: challengeObjParameters ? challengeObjParameters?.diffuse_text_color : "#fff",
                    diffuseIntensity: challengeObjParameters ? Number(challengeObjParameters?.diffuse_intensity) : 1,
                  },
                });
                return (
                  <Viro3DObject
                    key="obj_3d1"
                    onClick={() => { console.log("Viro3DObject OnPress"); funFactCallback() }}
                    onPress={() => { console.log("Viro3DObject OnPress"); funFactCallback() }}
                    source={{ uri: modelPath }} /// this works
                    scale={[newScale, newScale, newScale]}
                    position={[coords.x, 0, coords.z]}
                    type="VRX"
                    opacity={challengeObjParameters?.image_opacity ? Number(challengeObjParameters?.image_opacity_value) : 1}
                    materials={challengeObjParameters?.bloom ? ["mat"] : ["grid"]}
                    rotation={rotate}
                    onRotate={challengeObjParameters?.rotation ? _onRotate : null}
                    chromaKeyFilteringColor={"transparent"}
                    onPinch={challengeObjParameters?.pinch_to_zoom ? _onPinch : null}
                    animation={{
                      name: 'Take 001',
                      run: true,
                      loop: challengeObjParameters?.loop_animations ? true : false,
                      delay: challengeObjParameters?.loop_delay ? challengeObjParameters?.loop_delay : 1000
                    }}
                  />
                )
              } else if (challengeObj?.challenge_choice == "IMAGE" && starShouldVisibleNow) {
                return (
                  <ViroImage
                    height={1}
                    width={1}
                    onClick={() => { console.log("ViroImage OnPress"); funFactCallback() }}
                    onPress={() => { console.log("ViroImage OnPress"); funFactCallback() }}
                    opacity={challengeObjParameters?.image_opacity ? Number(challengeObjParameters?.image_opacity_value) : 1}
                    onDrag={challengeObjParameters?.tracking_and_anchors ? _onDrag : null}
                    source={{ uri: challengeObj.image }}
                    position={[coords.x, -5, coords.z]} />
                )
              } else if (loading && starShouldVisible) {
                return (
                  <ViroText
                    text={`${progress}% Loading Star`}
                    color="#ff0000"
                    width={2}
                    height={2}
                    style={_styles.loadingText}
                    position={[coords.x, -5, coords.z]}
                  />
                )
              }

            }
          })
        }
        <TravelDataPopUp currentLocation={currentLocation} />
      </ViroARScene>
    );
  };

  class ViroARNavigator extends React.Component {

    state = {
      capturedImage: null,
      capturedVideo: null,
      detailsShow: true,
      factsShow: false,
      challengeInformationView: false,
      distanceInFeet: 0,
      starShouldVisible: false,
      challengeObj: selectedGeoARSiteStars.length > 0 ? selectedGeoARSiteStars[0]?.challenges : {},
      collectedStars: [],
      starsCount: 0,
      starObj: selectedGeoARSiteStars.length > 0 ? selectedGeoARSiteStars[0] : {},
      nearestPoint: { latitude: 0, longitude: 0 },
      currentLocation: { latitude: 0, longitude: 0 },
      compassHeading: 0,
      allStarsCollected: false
    }

    constructor() {
      super();
      this._setARNavigatorRef = this._setARNavigatorRef.bind(this);
      this.checkPermission = this.checkPermission.bind(this);
      this.openFunFacts = this.openFunFacts.bind(this)
      this.getLocation = this.getLocation.bind(this)
      this.getLocationUpdates = this.getLocationUpdates.bind(this)
    }

    setStarCounts = () => {
      let count = 0;
      for (const stars_site of selectedGeoARSiteStars) {
        if (stars_site.star_location && stars_site.star_location.coordinates) {
          count += stars_site.star_location.coordinates.length;
        }
      }
      this.setState({ starsCount: count });
    }

    stopLocationUpdates = () => {
      if (this.watchId !== null) {
        Geolocation.clearWatch(this.watchId);
        this.watchId = null;
        Geolocation.stopObserving()
      }
    };

    getLocation = async () => {
      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        return;
      }
      Geolocation.getCurrentPosition(
        position => {
          this.findNearPoint(position)
          this.setState({
            currentLocation: position.coords
          })
        },
        error => {
          console.log(error);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'best',
          },
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 0,
          forceRequestLocation: true,
          forceLocationManager: true,
          showLocationDialog: true,
        },
      );
    };

    isStarIsCollected = (point) => {
      for (i = 0; i < this.state.collectedStars.length; i++) {
        const cPoint = this.state.collectedStars[i]
        if (point.latitude == cPoint.latitude && point.longitude == cPoint.longitude) {
          return true;
        }
      }
      return false;
    }

    findNearPoint = (position) => {
      let arrayPoints = []
      for (i = 0; i < selectedGeoARSiteStars.length; i++) {
        const starObj = selectedGeoARSiteStars[i];
        for (j = 0; j < starObj.star_location.coordinates.length; j++) {
          const point = starObj.star_location.coordinates[j]
          const pushPoint = { latitude: point[1], longitude: point[0], starObj }
          if (!this.isStarIsCollected(pushPoint)) {
            arrayPoints.push(pushPoint)
          }
        }
      }
      try {
        if (arrayPoints.length > 0) {
          const nearestPoints = orderByDistanceLocationPoint(position.coords, arrayPoints);
          const neareastPoint = findNearestLocationPoint(position.coords, nearestPoints);
          const distance = getCloseLocationDistance(position.coords, neareastPoint)
          const starShouldVisibleNow = isLocationPointWithinRadius(position.coords, neareastPoint, Number(neareastPoint.starObj.visibility_radius))
          if (starShouldVisibleNow && !this.isStarIsCollected(neareastPoint)) {
            this.state.collectedStars.push(neareastPoint)
            this.saveCollectedStar(neareastPoint, neareastPoint.starObj)
            this.updateUserPoint(neareastPoint.starObj)
          }
          if (neareastPoint.latitude == this.state.nearestPoint?.latitude && neareastPoint.longitude == this.state.nearestPoint?.longitude) {
            this.setState({
              distanceInFeet: convertMetersToFeets(distance),
              currentLocation: position.coords
            })
            return
          }
          this.setState({
            distanceInFeet: convertMetersToFeets(distance),
            starShouldVisible: starShouldVisibleNow,
            challengeObj: neareastPoint.starObj?.challenges,
            collectedStars: this.state.collectedStars,
            starObj: neareastPoint.starObj,
            nearestPoint: neareastPoint,
            currentLocation: position.coords
          })
        } else {
          this.setState({
            allStarsCollected: true
          })
        }
      } catch (e) {
        console.log(e)
      }
    }

    getCollectedStar = () => {
      getAllCollectedStars({
        geo_site: selectedGeoSite.id,
      }).then((res) => {
        if (res.status == 1) {
          const stars = res.data;
          const collectedStarsFromAPI = [];
          for (var i = 0; i < stars.length; i++) {
            const s = stars[i]
            collectedStarsFromAPI.push({
              latitude: s.point.coordinates[1],
              longitude: s.point.coordinates[0],
            })
          }
          const finalCollectedStars = [...collectedStarsFromAPI, ...this.state.collectedStars]
          this.setState({ collectedStars: finalCollectedStars })
          this.getLocation()
          this.getLocationUpdates()
        }
      }).finally(() => {
      })
    }

    updateUserPoint = (starObj) => {
      updateUserPointAPI({
        points: starObj?.challenges?.points
      }).then((res) => {
      }).finally(() => {
      })
    }

    saveCollectedStar = (point, starObj) => {
      starFoundAndSaveApi({
        geo_site: selectedGeoSite.id,
        geo_ar_star: starObj.id,
        latitude: point.latitude,
        longitude: point.longitude,
        name: new Date().toISOString()
      }).then((res) => {
      }).finally(() => {
      })
    }

    getLocationUpdates = async () => {
      const hasPermission = await hasLocationPermission();
      if (!hasPermission) {
        return;
      }
      this.watchId = Geolocation.watchPosition(
        position => {
          this.findNearPoint(position)
          this.setState({
            currentLocation: position.coords
          })
        },
        error => {
          console.log(error);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'best',
          },
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 0,
          forceRequestLocation: true,
          forceLocationManager: true,
          showLocationDialog: true,
        },
      );
    };

    componentDidMount() {
      this.checkPermission()
      this.getCollectedStar()
      this.setStarCounts()
      this.CompassHeadingStart()
    }

    CompassHeadingStart() {
      CompassHeading.start(3, (heading) => {
        //this.setState({ compassHeading: heading });
      });
    }

    componentWillUnmount() {
      this.stopLocationUpdates();
      CompassHeading.stop();
    }

    navigateToShare() {
      navigation.navigate("ArStarChallengeShare", { challengeObj: this.state.challengeObj, starObj: this.state.starObj })
    }

    _setARNavigatorRef(ARNavigator) {
      this._arNavigator = ARNavigator;
    }

    checkPermission() {
      if (Platform.OS == 'android') {
        requestMultiple([PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        ]).then(response => {
          console.log("PERMISSIONS.ANDROID:: ", response);
        });
      }
      if (Platform.OS == 'ios') {
        requestMultiple([PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MICROPHONE,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
        PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
        ]).then(response => {
          console.log("PERMISSIONS.OS", response);
        });
      }
    };

    factsView = () => {
      return (
        <View style={_styles.challengeInfoContainer}>
          <View style={_styles.challengeInfoHeaderContainer}>
            <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
            <Text style={_styles.challengeInfoHeader}>Fun Facts</Text>
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, width: '100%', padding: 24 }
            }
          >
            <RenderHTML
              contentWidth={width}
              tagsStyles={{
                p: {
                  color: '#9CA3AF',
                  fontSize: FontSizes.S14,
                },
                strong: {
                  color: '#fff',
                  fontSize: FontSizes.S18,
                },
                ol: {
                  color: '#fff',
                },
                li: {
                  color: '#fff',
                }
              }}
              source={{
                html: `${this.state.starObj?.fun_facts}`
              }}
            />
          </ScrollView>
          <View style={{ width: '100%', paddingHorizontal: 24 }}>
            <TouchableOpacity
              activeOpacity={.6}
              onPress={() => this.setState({ factsShow: false })}>
              <Text style={_styles.bottomText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    InfoView = () => {
      return (
        <View style={_styles.challengeInfoContainer}>
          <View style={_styles.challengeInfoHeaderContainer}>
            <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
            <Text style={_styles.challengeInfoHeader}>Waiver Details</Text>
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, width: '100%', padding: 24 }
            }
          >
            <RenderHTML
              contentWidth={width}
              tagsStyles={{
                p: {
                  color: '#9CA3AF',
                  fontSize: FontSizes.S14,
                },
                strong: {
                  color: '#fff',
                  fontSize: FontSizes.S18,
                },
                ol: {
                  color: '#fff',
                },
                li: {
                  color: '#fff',
                }
              }}
              source={{
                html: `${settings?.waiver_details.toString().replaceAll("#000000", "#fff")}}`
              }}
            />
          </ScrollView>
          <View style={{ width: '100%', paddingHorizontal: 24 }}>
            <AppButton
              onPress={() => this.setState({ detailsShow: false })}
              buttonStyle={_styles.buttonStyle}
              containerStyle={_styles.buttonContainerStyle}
              title={"Accept and Continue"}
            />
            <TouchableOpacity
              activeOpacity={.6}
              onPress={() => navigation.goBack()}>
              <Text style={_styles.bottomText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    openFunFacts = () => {
      this.setState({ factsShow: true })
    }

    render() {
      return (
        <View style={{ flex: 1 }}>
          <BackgroundWithImage style={_styles.mainContainer}>
            <AppHeader
              centerComponent={{
                text: this.state.starShouldVisible ? "You found a star!" : "AR Star Hunt\n" + selectedGeoSite.name,
                numberOfLines: 2,
                style: [_styles.heading],
              }} backgroundColor="transparent" />

            <View style={{ width: '100%', flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{
                backgroundColor: "#131422",
                borderRadius: 100,
                paddingHorizontal: 8,
                alignItems: 'center',
                height: 65,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <View style={{ flexDirection: 'row' }}>
                  <StarIcon style={{ width: 48, height: 48, marginEnd: 10 }} />
                  <View>
                    <Text style={_styles.exploringText}>Stars Collected</Text>
                    <Text style={_styles.arrivedText}>{this.state.collectedStars.length} / {this.state.starsCount}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ marginEnd: 10 }}>
                    <Text style={_styles.exploringText}>Points</Text>
                    <Text style={_styles.arrivedText}>{this.state.challengeObj?.points}</Text>
                  </View>
                  <TrophyIcon style={{ width: 48, height: 48 }} />
                </View>
              </View>
              <View style={{
                flex: 1, marginVertical: 20
              }}>
                <View style={_styles.ARMainContainer}>
                  <ViroARSceneNavigator
                    videoQuality={"High"}
                    autofocus={true}
                    pbrEnabled={true}
                    hdrEnabled={true}
                    bloomEnabled={true}
                    ref={this._setARNavigatorRef}
                    viroAppProps={
                      {
                        starShouldVisible: this.state.starShouldVisible,
                        challengeObj: this.state.challengeObj,
                        starsObj: this.state.starObj,
                        funFactCallback: this.openFunFacts,
                        nearestPoint: this.state.nearestPoint,
                        compassHeading: this.state.compassHeading,
                        currentLocation: this.state.currentLocation,
                        allStarsObj: selectedGeoARSiteStars
                      }
                    }
                    initialScene={{
                      scene: ARScreen,
                    }}
                    style={_styles.f1}
                  >
                  </ViroARSceneNavigator>
                </View>
              </View>
              <View style={{
                backgroundColor: "#131422",
                borderRadius: 16,
                padding: 20,
                paddingBottom: 20,
                marginVertical: 20,
                alignItems: 'center'
              }}>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <MenIcon style={{ width: 40, height: 40 }} />
                    <View>
                      <Text style={_styles.exploringText}>Nearest Star</Text>
                      {
                        this.state.allStarsCollected ?
                          <Text style={_styles.arrivedText}>{"You have found all the stars!"}</Text>
                          :
                          <Text style={_styles.arrivedText}>{this.state.starShouldVisible ? "You found a star!" : `${this.state.distanceInFeet} feet away`}</Text>
                      }
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <RadarBlipIcon style={{ width: 10, height: 10, marginEnd: 25 }} />
                    <TouchableOpacity>
                      <SpeakerIcon style={{ width: 40, height: 40 }} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <InfoIcon style={{ width: 20, height: 20, marginEnd: 6 }} />
                  <Text style={_styles.infoText}>The dot pulsates quicker and the chime beeps faster when you get closer to a Star. You can mute the sound by clicking on the speaker.</Text>
                </View>
              </View>
            </View>
          </BackgroundWithImage >
          {this.state.detailsShow && this.InfoView()}
          {this.state.factsShow && this.factsView()}
        </View >
      )
    }
  }
  
  

  return (
    <ViroARNavigator />
  )
}

export default StarChallenge