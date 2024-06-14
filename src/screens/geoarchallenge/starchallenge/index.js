import React, { useEffect, useRef, useState } from "react"

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import SpeakerIcon from "../../../assets/geoar/speaker_icon.svg"
import InfoIcon from "../../../assets/geoar/Info.svg"
import MenIcon from "../../../assets/geoar/men_icon.svg"
import RadarBlipIcon from "../../../assets/geoar/radar_blip.svg"
import StarIcon from "../../../assets/geoar/star_icon.svg"
import TrophyIcon from "../../../assets/geoar/trophy_icon.svg"
import CaptureIcon from "../../../assets/geoar/capture_icon.svg"
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
  ViroText
} from '@viro-community/react-viro';
import RNFetchBlob from 'rn-fetch-blob';
const Sound = require('react-native-sound');
import uuid from 'react-native-uuid';
import { unzip } from 'react-native-zip-archive'

const { config, fs } = RNFetchBlob;
import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { useNavigation } from "@react-navigation/native";
import { request, requestMultiple, PERMISSIONS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { convertMetersToFeets, findNearestLocationPoint, getCloseLocationDistance, getLocationDistance, hasLocationPermission, isLocationPointInPolygon, isLocationPointWithinRadius, orderByDistanceLocationPoint } from "../../../util/LocationLib";

const StarChallenge = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const selectedGeoARSiteStars = useSelector(state => state.ar?.selectedGeoARSiteStars)
  const challengeObj = selectedGeoARSiteStars.length > 0 ? selectedGeoARSiteStars[0]?.challenges : {}
  const challengeObjParameters = challengeObj?.parameters;
  const modelFile = challengeObj.model_file;

  const ARScreen = (props) => {
    console.log("ARScreen",props)
    const [modelPath, setModelPath] = useState(null);
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

    const downloadModelFile = (sourcePath, targetPath) => {
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
          unzipModelFile(res.path(), targetPath)
        })
        .catch((error) => {
          console.error(error)
        });
    }

    const unzipModelFile = (sourcePath, targetPath) => {
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
                    setModelPath(vrxFile)
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
          downloadModelFile(sourcePath, targetPath)
        })
    }

    const checkIfModelExist = () => {
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
            unzipModelFile(sourcePath, targetPath)
          } else {
            downloadModelFile(sourcePath, targetPath)
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    useEffect(() => {
      if (challengeObj?.challenge_choice == "3DMODEL") {
        setLoading(true)
        checkIfModelExist()
      }
    }, []);

    const _onRotate = (rotateState, rotationFactor, source) => {
      console.log("_onRotate rotateState", rotateState)
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
      console.log("_onPinch scaleFactor", scaleFactor)
      if ((scale[0] * scaleFactor) <= challengeObjParameters?.min_pinch_scale) {
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

        {loading && props.viroAppProps.starShouldVisible &&
          <ViroText
            text={`${progress}% Loading Challenge Completed`}
            color="#ff0000"
            width={2}
            height={2}
            style={styles.loadingText}
            position={[0, 0, -5]}
          />
        }

        {
          challengeObj?.challenge_choice == "3DMODEL" && modelPath && props.viroAppProps.starShouldVisible &&
          <Viro3DObject
            key="obj_3d1"
            source={{ uri: modelPath }} /// this works
            position={[challengeObjParameters?.positionX ? Number(challengeObjParameters?.positionX) : 0,
            challengeObjParameters?.positionY ? Number(challengeObjParameters?.positionY) : -5,
            challengeObjParameters?.positionZ ? Number(challengeObjParameters?.positionZ) : -25]}
            scale={scale}
            type="VRX"
            opacity={challengeObjParameters?.image_opacity ? Number(challengeObjParameters?.image_opacity_value) : 1}
            materials={challengeObjParameters?.bloom ? ["mat"] : ["grid"]}
            rotation={rotate}
            onRotate={challengeObjParameters?.rotation ? _onRotate : null}
            chromaKeyFilteringColor={"transparent"}
            onPinch={challengeObjParameters?.pinch_to_zoom ? _onPinch : null}
            onDrag={challengeObjParameters?.tracking_and_anchors ? _onDrag : null}
            animation={{
              name: 'Take 001',
              run: true,
              loop: challengeObjParameters?.loop_animations ? true : false,
              delay: challengeObjParameters?.loop_delay ? challengeObjParameters?.loop_delay : 1000
            }}
          />
        }

        {challengeObj?.challenge_choice == "IMAGE" && props.viroAppProps.starShouldVisible && <ViroImage
          height={1}
          width={1}
          opacity={challengeObjParameters?.image_opacity ? Number(challengeObjParameters?.image_opacity_value) : 1}
          onDrag={challengeObjParameters?.tracking_and_anchors ? _onDrag : null}
          source={{ uri: challengeObj.image }}
          position={[challengeObjParameters?.positionX ? Number(challengeObjParameters?.positionX) : 0,
          challengeObjParameters?.positionY ? Number(challengeObjParameters?.positionY) : 0,
          challengeObjParameters?.positionZ ? Number(challengeObjParameters?.positionZ) : -5]} />}

      </ViroARScene>
    );
  };

  class ViroARNavigator extends React.Component {

    state = {
      capturedImage: null,
      capturedVideo: null,
      detailsShow: true,
      challengeInformationView: false,
      distanceInFeet: 0,
      starShouldVisible: false,
      challengeObj: challengeObj,
      collectedStars: [],
      starsCount: 0
    }

    constructor() {
      super();
      this._setARNavigatorRef = this._setARNavigatorRef.bind(this);
      this.checkPermission = this.checkPermission.bind(this);
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
      const nearestPoints = orderByDistanceLocationPoint(position.coords, arrayPoints);
      const neareastPoint = findNearestLocationPoint(position.coords, nearestPoints);
      const distance = getCloseLocationDistance(position.coords, neareastPoint)
      const starShouldVisible = isLocationPointWithinRadius(position.coords, neareastPoint, Number(neareastPoint.starObj.visibility_radius))
      console.log("distance", distance)
      console.log("starShouldVisible", starShouldVisible)
      if (starShouldVisible && !this.isStarIsCollected(neareastPoint)) {
        this.state.collectedStars.push(neareastPoint)
      }
      this.setState({
        distanceInFeet: convertMetersToFeets(distance),
        starShouldVisible: starShouldVisible,
        challengeObj: neareastPoint.starObj?.challenges,
        collectedStars: this.state.collectedStars
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
      this.getLocation()
      this.getLocationUpdates()
      this.setStarCounts()
    }

    componentWillUnmount() {
      this.stopLocationUpdates();
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

    render() {
      return (
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
                    <Text style={_styles.arrivedText}>{this.state.starShouldVisible ? "You found a star!" : `${this.state.distanceInFeet} feet away`}</Text>
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
      )
    }
  }

  return (
    <ViroARNavigator />
  )
}


ViroMaterials.createMaterials({
  grid: {
    lightingModel: "Lambert",
    shininess: .6,
  },
  mat: {
    shininess: .6,
    blendMode: "Add",
    lightingModel: "Lambert",
    bloomThreshold: 0.5,
    diffuseColor: "#fff"
  },
});

export default StarChallenge