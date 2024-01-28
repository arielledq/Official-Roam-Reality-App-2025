import React, { useEffect, useState } from "react"

import { TouchableOpacity, View, Image, Text, Platform, Dimensions, ScrollView } from "react-native";
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
  ViroText, ViroARCamera, ViroBox, ViroNode
} from '@viro-community/react-viro';
import Video from 'react-native-video';
import uuid from 'react-native-uuid';
import { FontSizes } from "../../../util/FontUtils"
import RNFetchBlob from 'rn-fetch-blob';
import useStyles from "./styles"
import CaptureImage from "../../../assets/ar/camera.png"
import CameraSoundFile from '../../../assets/ar/camera-sound.mp3';
import RecordSound from '../../../assets/ar/record.mp3';
import LineIcon from '../../../assets/ar/line.png';
import { unzip } from 'react-native-zip-archive'
import { AppButton } from "../../../components";
import RenderHTML from "react-native-render-html";
const RNFS = require('react-native-fs');
const Sound = require('react-native-sound');
const { config, fs } = RNFetchBlob;
const { width } = Dimensions.get('window');

ViroMaterials.createMaterials({
  pbr: {
    lightingModel: "Blinn",
    chromaKeyFilteringColor: "#00FF00",
  },
});


const ArChallengeCapture = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const navigation = useNavigation()
  const challengeObj = route?.params?.challengeObj;
  const modelFile = challengeObj.model_file;
  console.log("ArChallengeCapture", modelFile)
  console.log("ArChallengeCapture", challengeObj.challenge_choice)

  const navigateToShare = (captureData) => {
    navigation.navigate("ArChallengeShare", { challengeObj: challengeObj, captureData });
  }

  const ARScreen = () => {
    const [modelPath, setModelPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scale, setScale] = useState([0.08, 0.08, 0.08]);
    const [rotate, setRotate] = useState([0, 0, 0]);


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
              for (let i = 0; i < result.length; i++) {
                if (result[i].isFile) {
                  console.log("unzipModelFile", result[i].name)
                  if (result[i].name.includes(".vrx")) {
                    setModelPath(result[i].path)
                  }
                }
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
      console.log("sourcePath:", sourcePath)
      console.log("targetPath:", targetPath)
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
      if (rotateState == 3) {
        const rotation = [rotate[0], rotate[1] + rotationFactor, rotate[2]]
        setRotate(rotation)
        return;
      }
      const rotation = [rotate[0], rotate[1] + rotationFactor, rotate[2]]
      setRotate(rotation)
    }

    const _onDrag = (draggedToPosition, source) => {
      console.log(
        "Dragged to: x" +
        draggedToPosition[0] +
        " y:" +
        draggedToPosition[1] +
        " z: " +
        draggedToPosition[2]
      );
    }

    return (
      <ViroARScene onTrackingUpdated={onInitialized}>

        <ViroAmbientLight color="#ffffff" intensity={200} />
        <ViroDirectionalLight color="#ffffff" direction={[0, -1, -.2]} />
        <ViroDirectionalLight castsShadow={true} color="#ffffff" direction={[.05, 0.05, .05]} />

        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, 1, 0]}
          position={[0, -7, 0]}
          color="#ffffff"
          intensity={250} />


        {loading &&
          <ViroARCamera>
            <ViroText
              text="Loading Model"
              color="#ff0000"
              width={2}
              height={2}
              style={styles.loadingText}
              position={[0, 0, -5]}
            />
          </ViroARCamera>
        }

        {challengeObj.challenge_choice == "SPONSORED" && <ViroImage
          height={1}
          width={1}
          onDrag={_onDrag}
          source={{ uri: challengeObj.image }}
          position={[0, 0, -5]} />}

        {
          challengeObj.challenge_choice == "DANCE" && modelPath && <Viro3DObject
            key="obj_3d1"
            source={{ uri: Platform.OS === 'android' ? `file://${modelPath}` : modelPath }} /// this works
            position={[0, -5, -30]}
            scale={[0.08, 0.08, 0.08]}
            type="VRX"
            materials={"pbr"}
            rotation={rotate}
            onRotate={_onRotate}
            chromaKeyFilteringColor={"transparent"}
            onDrag={_onDrag}
            animation={{
              name: 'Take 001',
              run: true,
              loop: true,
              delay: 1000
            }}
          />
        }
      </ViroARScene>
    );
  };

  class ViroARNavigator extends React.Component {

    state = {
      capturedImage: null,
      capturedVideo: null,
      detailsShow: false
    }

    constructor() {
      super();
      this._setARNavigatorRef = this._setARNavigatorRef.bind(this);
      this._takeScreenshot = this._takeScreenshot.bind(this);
      this.startRecordVideo = this.startRecordVideo.bind(this);
      this.stopRecordVideo = this.stopRecordVideo.bind(this);
      this.playRecordSound = this.playRecordSound.bind(this);
      this.playCameraSound = this.playCameraSound.bind(this);
    }

    _setARNavigatorRef(ARNavigator) {
      this._arNavigator = ARNavigator;
    }

    playCameraSound() {
      Sound.setCategory('Playback');
      let cameraSound = new Sound(CameraSoundFile, error => {
        if (error) {
          console.log('failed to load the sound', error);
        } else {
          cameraSound.play(); // have to put the call to play() in the onload callback
        }
      });
    };

    playRecordSound() {
      Sound.setCategory('Playback');
      let cameraSound = new Sound(RecordSound, error => {
        if (error) {
          console.log('failed to load the sound', error);
        } else {
          cameraSound.play(); // have to put the call to play() in the onload callback
        }
      });
    };

    async startRecordVideo() {
      this.setState({
        capturedImages: null
      })
      const onError = (error) => {
        console.log("startRecordVideo: error:", error)
      }
      this.playRecordSound()
      this._arNavigator
        ._startVideoRecording(uuid.v4(), false, onError)
    }

    async stopRecordVideo() {
      console.log("stopRecordVideo:")
      this._arNavigator
        ._stopVideoRecording()
        .then((retDict) => {
          this.playRecordSound()
          console.log("stopRecordVideo:", retDict)
          this.setState({
            capturedVideo: retDict.url
          });
        });
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
            capturedImage: retDict.url
          });
        });
    }

    InfoView = () => {
      return (
        <View style={styles.challengeInfoContainer}>
          <View style={styles.challengeInfoHeaderContainer}>
            <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
            <Text style={styles.challengeInfoHeader}>Waiver details</Text>
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
                }
              }}
              source={{
                html: `${challengeObj.description}`
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
              onPress={() => this.setState({ detailsShow: false })}>
              <Text style={styles.bottomText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    render() {
      return (
        <View style={styles.mainContainer}>
          <ViroARSceneNavigator
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

          {this.state.capturedImage && <Image style={styles.f1} source={{
            uri: Platform.OS === 'android' ? `file://${this.state.capturedImage}` : this.state.capturedImage
          }} />}

          {this.state.capturedVideo && <Video repeat={true} style={styles.f1} source={{
            uri: Platform.OS === 'android' ? `file://${this.state.capturedVideo}` : this.state.capturedVideo
          }} />}

          <View style={styles.mainHeaderContainer}>
            <AppHeader title={challengeObj.sponsored.name} backgroundColor="transparent" />
            <View style={styles.viewDetailsIconContainer}>
              <View style={styles.viewDetailsIconContainerWrapper}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image style={styles.viewDetailsIcon} source={{ uri: challengeObj.sponsored.image }} />
                  <Text style={styles.challengeSponsorName}>{challengeObj.sponsored.name}</Text>
                </View>
                <TouchableOpacity onPress={() => this.setState({ detailsShow: true })}
                  style={styles.viewDetailBtn}>
                  <Text style={styles.btnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={[styles.bottomContainer, { justifyContent: this.state.capturedImage || this.state.capturedVideo ? 'space-between' : 'center' }]}>
            <View style={styles.holdTextContainer}>
              <Text style={styles.holdText}>Press and hold the capture button to start recording. Release to stop</Text>
            </View>
            {(this.state.capturedImage || this.state.capturedVideo) && <TouchableOpacity activeOpacity={.6} onPress={() => {
              this.setState({ capturedImage: null, capturedVideo: null })
            }} style={styles.bottomButtonContainer}>
              <Text style={styles.bottomButtonText}>Retake</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity
              onLongPress={() => {
                console.log('onLongPress Press')
                this.startRecordVideo()
              }}
              onPressIn={() => {
                console.log('onPressIn Press')
              }}
              onPressOut={() => {
                console.log('onPressOut Press')
                this.stopRecordVideo()
              }}
              delayLongPress={3000} onPress={() => {
                this._takeScreenshot();
              }} activeOpacity={.6}>
              <Image style={{ width: 56, height: 56 }} source={CaptureImage} />
            </TouchableOpacity>
            {(this.state.capturedImage || this.state.capturedVideo) && <TouchableOpacity onPress={() => {
              navigateToShare(this.state.capturedImage)
            }} activeOpacity={.6} style={styles.bottomButtonContainer}>
              <Text style={styles.bottomButtonText}>Done</Text>
            </TouchableOpacity>
            }
          </View>
          {this.state.detailsShow && this.InfoView()}
        </View >
      )
    }
  }

  return (
    <ViroARNavigator />
  )
}



export default ArChallengeCapture