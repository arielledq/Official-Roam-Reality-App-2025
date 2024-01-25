import React, { useEffect, useState } from "react"

import { TouchableOpacity, View, Image, Text, Platform } from "react-native";
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
  ViroSpotLight
} from '@viro-community/react-viro';
import RNFetchBlob from 'rn-fetch-blob';
import useStyles from "./styles"
import CaptureImage from "../../../assets/ar/camera.png"
import CameraSoundFile from '../../../assets/ar/camera-sound.mp3';
import { unzip } from 'react-native-zip-archive'
const RNFS = require('react-native-fs');
const Sound = require('react-native-sound');
const { config, fs } = RNFetchBlob;

ViroMaterials.createMaterials({
  pbr: {
    lightingModel: "PBR",
  },
});


const ArChallengeCapture = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const navigation = useNavigation()
  const challengeObj = route?.params?.challengeObj;
  const modelFile = challengeObj.model_file;
  const [loading, setLoading] = useState(false);
  console.log("ArChallengeCapture", modelFile)
  console.log("ArChallengeCapture", challengeObj.challenge_choice)

  const navigateToShare = (captureData) => {
    navigation.navigate("ArChallengeShare", { challengeObj: challengeObj, captureData });
  }

  const ARScreen = () => {
    const [modelPath, setModelPath] = useState(null);

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
            })
        })
        .catch((error) => {
          console.error(error)
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
        checkIfModelExist()
      }
    }, []);

    return (
      <ViroARScene onTrackingUpdated={onInitialized}>
        <ViroAmbientLight color="#ffffff" intensity={20} />
        <ViroDirectionalLight color="#ffffff" direction={[0, -1, -.2]} />
        <ViroDirectionalLight castsShadow={true} color="#ffffff" direction={[.05, 0.05, .05]} />

        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, 1, 0]}
          position={[0, -7, 0]}
          color="#ffffff"
          intensity={250} />

        <ViroSpotLight
          position={[1, 3, 1]}
          direction={[-1, -1, -1]}
          color="grey"
          intensity={750}
          attenuationStartDistance={1}
          attenuationEndDistance={10}
          innerAngle={45}
          outerAngle={90}
          castsShadow
          shadowMapSize={2048}
          shadowNearZ={1}
          shadowFarZ={4}
          shadowOpacity={1.0}
        />

        {challengeObj.challenge_choice == "SPONSORED" && <ViroImage
          height={1}
          width={1}
          source={{ uri: challengeObj.image }}
          position={[0, 0, -5]} />}

        {
          challengeObj.challenge_choice == "DANCE" && modelPath && <Viro3DObject
            key="obj_3d1"
            source={{ uri: Platform.OS === 'android' ? `file://${modelPath}` : modelPath }} /// this works
            position={[-10, -8, -20]}
            scale={[0.08, 0.08, 0.08]}
            type="VRX"
            resources={[
              // require('../../../assets/ar/Quin_texture_anim2/T_Quinn_01ID_D.PNG'),
              // require('../../../assets/ar/Quin_texture_anim2/T_Quinn_01ID_Tan.PNG'),
              // require('../../../assets/ar/Quin_texture_anim2/T_Quinn_02ID_D.PNG'),
              // require('../../../assets/ar/Quin_texture_anim2/T_Quinn_02ID_Tan.PNG'),
            ]}
            materials={"pbr"}
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
      capturedImage: null
    }

    constructor() {
      super();
      this._setARNavigatorRef = this._setARNavigatorRef.bind(this);
      this._takeScreenshot = this._takeScreenshot.bind(this);
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

    async _takeScreenshot() {
      this.playCameraSound()
      this._arNavigator
        ._takeScreenshot('screenshot', false)
        .then((retDict) => {
          console.log("captureImage:", retDict)
          this.setState({
            capturedImage: retDict.url
          });
        });
    }

    async _takeScreenshot() {
      this.playCameraSound()
      this._arNavigator
        ._takeScreenshot('screenshot', false)
        .then((retDict) => {
          console.log("captureImage:", retDict)
          this.setState({
            capturedImage: retDict.url
          });
        });
    }

    render() {
      return (
        <View style={styles.mainContainer}>
          <ViroARSceneNavigator
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

          {this.state.capturedImage && <Image style={styles.f1} source={{ uri: Platform.OS === 'android' ? `file://${this.state.capturedImage}` : this.state.capturedImage }} />}

          <View style={{ position: 'absolute' }}>
            <AppHeader title={challengeObj.sponsored.name} backgroundColor="transparent" />
            <View style={{ backgroundColor: "#1158F4", height: 53, borderRadius: 8, marginHorizontal: 20, marginTop: 20, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image style={{ width: 37, height: 37, marginEnd: 10 }} source={{ uri: challengeObj.sponsored.image }} />
                  <Text style={styles.challengeSponsorName}>{challengeObj.sponsored.name}</Text>
                </View>
                <TouchableOpacity style={{ backgroundColor: '#fff', height: 30, width: 118, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.btnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={[styles.bottomContainer, { justifyContent: this.state.capturedImage ? 'space-between' : 'center' }]}>
            {this.state.capturedImage && <TouchableOpacity activeOpacity={.6} onPress={() => {
              this.setState({ capturedImage: null })
            }} style={styles.bottomButtonContainer}>
              <Text style={styles.bottomButtonText}>Retake</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity onPress={() => {
              this._takeScreenshot();
            }} activeOpacity={.6}>
              <Image style={{ width: 56, height: 56 }} source={CaptureImage} />
            </TouchableOpacity>
            {this.state.capturedImage && <TouchableOpacity onPress={() => {
              navigateToShare(this.state.capturedImage)
            }} activeOpacity={.6} style={styles.bottomButtonContainer}>
              <Text style={styles.bottomButtonText}>Done</Text>
            </TouchableOpacity>
            }
          </View>
          {loading &&
            <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ padding: 8, backgroundColor: "#ffffff40", alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                <Text style={styles.loadingText}>LOADING CHALLENGE</Text>
              </View>
            </View>}
        </View >
      )
    }
  }

  return (
    <ViroARNavigator />
  )
}



export default ArChallengeCapture