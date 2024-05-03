import React, { useEffect, useState } from "react"

import {
  TouchableOpacity, View, Image, Text, Platform, Dimensions, ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native"
import AppHeader from "../../../components/header"
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
import Video from 'react-native-video';
import uuid from 'react-native-uuid';
import { FontSizes } from "../../../util/FontUtils"
import RNFetchBlob from 'rn-fetch-blob';
import useStyles from "./styles"
import CaptureImage from "../../../assets/ar/camera.png"
import LineIcon from '../../../assets/ar/line.png';
import { unzip } from 'react-native-zip-archive'
import { AppButton } from "../../../components";
import RenderHTML from "react-native-render-html";
const RNFS = require('react-native-fs');
const Sound = require('react-native-sound');
const { config, fs } = RNFetchBlob;
import { request, requestMultiple, PERMISSIONS } from 'react-native-permissions';
import { useSelector } from "react-redux";
const { width } = Dimensions.get('window');

const VIDEO_RECORD_TIME = 10

const ArChallengeCapture = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const navigation = useNavigation()
  const challengeObj = route?.params?.challengeObj;
  const challengeObjParameters = route?.params?.challengeObj?.parameters;
  const settings = useSelector(state => state.ar?.arSettings)
  const modelFile = challengeObj.model_file;

  console.log("challengeObjParameters:",challengeObjParameters)
  console.log("settings?.waiver_details:",settings?.waiver_details)
  

  const navigateToShare = (captureData) => {
    navigation.replace("ArChallengeShare", { challengeObj: challengeObj, captureData });
  }

  const ARScreen = () => {
    const [modelPath, setModelPath] = useState(null);
    const [sourcesFiles, setSourcesFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scale, setScale] = useState([0.05, 0.05, 0.05]);
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
      if (challengeObj.challenge_choice == "DANCE") {
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
      // console.log(
      //   "Dragged to: x" +
      //   draggedToPosition[0] +
      //   " y:" +
      //   draggedToPosition[1] +
      //   " z: " +
      //   draggedToPosition[2]
      // );
    }

    const _onPinch = (pinchState, scaleFactor, source) => {
      console.log("_onPinch scaleFactor", scaleFactor)
      if((scale[0] * scaleFactor) < 0.05){
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
        <ViroDirectionalLight color="#FFFFFF" direction={[-1, 0, 0]} />

        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, 1, 0]}
          position={[0, -7, 0]}
          color="#ffffff"
          intensity={250} />

        {loading &&
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
          challengeObj.challenge_choice == "DANCE" && modelPath &&
          <Viro3DObject
            key="obj_3d1"
            source={{ uri: modelPath }} /// this works
            position={[0, -5, -30]}
            scale={scale}
            type="VRX"
            materials={["mat"]}
            rotation={rotate}
            onRotate={_onRotate}
            chromaKeyFilteringColor={"transparent"}
            onPinch={_onPinch}
            onDrag={_onDrag}
            animation={{
              name: 'Take 001',
              run: true,
              loop: true,
              delay: 1000
            }}
          />
        }

        {challengeObj.challenge_choice == "SPONSORED" && <ViroImage
          height={1}
          width={1}
          onDrag={_onDrag}
          source={{ uri: challengeObj.image }}
          position={[0, 0, -5]} />}
      </ViroARScene>
    );
  };

  class ViroARNavigator extends React.Component {

    state = {
      capturedImage: null,
      capturedVideo: null,
      detailsShow: true,
      recordingStart: false,
      timer: "00:00",
      recordTimeInMillis: 0,
      isLoadVR: false,
      challengeInformationView: false
    }

    constructor() {
      super();
      this._setARNavigatorRef = this._setARNavigatorRef.bind(this);
      this._takeScreenshot = this._takeScreenshot.bind(this);
      this.startRecordVideo = this.startRecordVideo.bind(this);
      this.stopRecordVideo = this.stopRecordVideo.bind(this);
      this.playRecordSound = this.playRecordSound.bind(this);
      this.playCameraSound = this.playCameraSound.bind(this);
      this.checkPermission = this.checkPermission.bind(this);
      this.startTimer = this.startTimer.bind(this);
      this.clearTimer = this.clearTimer.bind(this);
    }

    pad(val) {
      var valString = val + "";
      if (valString.length < 2) {
        return "0" + valString;
      } else {
        return valString;
      }
    }

    startTimer = () => {
      _this = this
      _this.setState({
        recordTimeInMillis: 0,
        timer: `00:00`
      })
      const timeInterval = setInterval(function () {
        ++_this.state.recordTimeInMillis
        const seconds = _this.pad(_this.state.recordTimeInMillis % 60);
        const minutes = _this.pad(parseInt(_this.state.recordTimeInMillis / 60));
        _this.setState({
          recordTimeInMillis: _this.state.recordTimeInMillis,
          timer: `${minutes}:${seconds}`
        })
        if (seconds >= VIDEO_RECORD_TIME) {
          _this.stopRecordVideo()
        }
      }, 1000);
      this.setState({
        timeInterval: timeInterval
      })
    }

    clearTimer = () => {
      clearInterval(this.state.timeInterval);
    }

    componentDidMount() {
      this.checkPermission()
      this.setState({ isLoadVR: true })
    }

    _setARNavigatorRef(ARNavigator) {
      this._arNavigator = ARNavigator;
    }

    componentWillUnmount() {
      if (this.state.recordingStart) {
        this.stopRecordVideo()
      }
      this._arNavigator = null
      this.clearTimer()
      this.setState({ isLoadVR: false })
    }

    playCameraSound() {
      Sound.setCategory('Playback');
      let cameraSound = new Sound(Platform.OS == "android" ? "camerasound.mp3" : "camera-sound.mp3", Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('failed to load the sound', error);
        } else {
          cameraSound.play(); // have to put the call to play() in the onload callback
        }
      });
    };

    playRecordSound() {
      Sound.setCategory('Playback');
      let cameraSound = new Sound("record.mp3", Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('failed to load the sound', error);
        } else {
          cameraSound.play(); // have to put the call to play() in the onload callback
        }
      });
    };


    async startRecordVideo() {
      this.setState({
        capturedImage: null,
        recordingStart: true
      }, () => {
        const onError = (error) => {
          console.log("startRecordVideo: error:", error)
        }
        this.playRecordSound()
        this.startTimer()
        this._arNavigator
          ._startVideoRecording('recording', false, onError)
      })
    }

    async stopRecordVideo() {
      this.clearTimer()
      const retDict = await this._arNavigator._stopVideoRecording()
      console.log("stopRecordVideo:", retDict)
      this.setState({
        capturedVideo: Platform.OS === 'android' ? `file://${retDict.url}` : retDict.url,
        capturedImage: null,
        recordingStart: false
      });
      this.playRecordSound()
    }

    async _takeScreenshot() {
      this.setState({
        capturedVideo: null
      })
      this.playCameraSound()
      this._arNavigator
        ._takeScreenshot(uuid.v4(), false)
        .then((retDict) => {
          console.log("captureImage:", retDict)
          this.setState({
            capturedImage: Platform.OS === 'android' ? `file://${retDict.url}` : retDict.url
          });
        });
    }

    challengeDetailView = () => {
      return (
        <View style={styles.challengeInfoContainer}>
          <View style={styles.challengeInfoHeaderContainer}>
            <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
            <Text style={styles.challengeInfoHeader}>Challenge Details</Text>
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
                html: `${challengeObj.description.toString().replaceAll("#000000","#fff")}`
              }}
            />
          </ScrollView>
          <View style={{ width: '100%', paddingHorizontal: 24 }}>

            <TouchableOpacity
              activeOpacity={.6}
              onPress={() => this.setState({ challengeInformationView: false })}>
              <Text style={styles.bottomText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    InfoView = () => {
      return (
        <View style={styles.challengeInfoContainer}>
          <View style={styles.challengeInfoHeaderContainer}>
            <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
            <Text style={styles.challengeInfoHeader}>Waiver Details</Text>
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
                html: `${settings?.waiver_details.toString().replaceAll("#000000","#fff")}}`
              }}
            />
          </ScrollView>
          <View style={{ width: '100%', paddingHorizontal: 24 }}>
            <AppButton
              onPress={() => this.setState({ detailsShow: false })}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              title={"Accept and Continue"}
            />
            <TouchableOpacity
              activeOpacity={.6}
              onPress={() => navigation.goBack()}>
              <Text style={styles.bottomText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
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
        <View style={styles.mainContainer}>
          {
            this.state.isLoadVR && <ViroARSceneNavigator
              videoQuality={"High"}
              autofocus={true}
              pbrEnabled={true}
              hdrEnabled={true}
              bloomEnabled={true}
              ref={this._setARNavigatorRef}
              initialScene={{
                scene: ARScreen,
              }}
              style={styles.f1}
            >
            </ViroARSceneNavigator>
          }

          {this.state.capturedImage && <Image style={styles.f1} source={{
            uri: this.state.capturedImage
          }} />}

          {this.state.capturedVideo && <Video repeat={true} style={styles.f1} source={{
            uri: this.state.capturedVideo
          }} />}

          <View style={styles.mainHeaderContainer}>
            <AppHeader centerComponent={{
              text: "Anywhere AR Challenges",
              numberOfLines: 2,
              style: [styles.heading],
            }} backgroundColor="transparent" />
            <View style={styles.viewDetailsIconContainer}>
              <View style={styles.viewDetailsIconContainerWrapper}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image style={styles.viewDetailsIcon} source={{ uri: challengeObj.sponsored.image }} />
                  <Text style={styles.challengeSponsorName}>{challengeObj.sponsored.name}</Text>
                </View>
                <TouchableOpacity onPress={() => this.setState({ challengeInformationView: true })}
                  style={styles.viewDetailBtn}>
                  <Text style={styles.btnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={[styles.bottomContainer, { justifyContent: this.state.capturedImage || this.state.capturedVideo ? 'space-between' : 'center' }]}>
            {
              (this.state.recordingStart) && <View style={styles.timerTextContainer}>
                <Text style={styles.timerText}>{this.state.timer}</Text>
              </View>
            }
            {
              (!this.state.capturedImage && !this.state.capturedVideo && !this.state.recordingStart) && <View style={styles.holdTextContainer}>
                <Text style={styles.holdText}>Press and hold the capture button to start recording. Release to stop</Text>
              </View>
            }
            {(this.state.capturedImage || this.state.capturedVideo) && <TouchableOpacity activeOpacity={.6} onPress={() => {
              this.setState({ capturedImage: null, capturedVideo: null })
            }} style={styles.bottomButtonContainer}>
              <Text style={styles.bottomButtonText}>Retake</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity
              onLongPress={() => {
                if ((this.state.capturedImage || this.state.capturedVideo)) {
                  return;
                }
                this.startRecordVideo()
              }}
              onPressIn={() => {
                console.log('onPressIn Press')
              }}
              onPressOut={() => {
                console.log('onPressOut Press')
                if (this.state.recordingStart) {
                  this.stopRecordVideo();
                }
              }}
              delayLongPress={800} onPress={() => {
                if ((this.state.capturedImage || this.state.capturedVideo)) {
                  return;
                }
                if (this.state.recordingStart) {
                  this.stopRecordVideo();
                } else {
                  this._takeScreenshot();
                }
              }} activeOpacity={.6}>
              <Image style={{ width: 56, height: 56 }} source={CaptureImage} />
            </TouchableOpacity>
            {(this.state.capturedImage || this.state.capturedVideo) && <TouchableOpacity onPress={() => {
              navigateToShare(this.state.capturedImage ? this.state.capturedImage : this.state.capturedVideo)
            }} activeOpacity={.6} style={styles.bottomButtonContainer}>
              <Text style={styles.bottomButtonText}>Done</Text>
            </TouchableOpacity>
            }
          </View>
          {this.state.detailsShow && this.InfoView()}
          {this.state.challengeInformationView && this.challengeDetailView()}
        </View >
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
    bloomThreshold: 0.5,
  },
  mat: {
    shininess: .6,
    blendMode: "Add",
    lightingModel: "Lambert",
    bloomThreshold: 0.5,
    diffuseColor:"#fffS"
  },
});

export default ArChallengeCapture