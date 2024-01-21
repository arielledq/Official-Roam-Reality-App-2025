import React, { useEffect, useRef, useState } from "react"

import { Dimensions, TouchableOpacity, View, Image, Text } from "react-native";
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../../navigation/types"
import BackgroundWithImage from "../../../components/background"
import { useNavigation, useRoute } from "@react-navigation/native"
import AppHeader from "../../../components/header"
import {
  ViroARScene,
  ViroText,
  ViroMaterials,
  ViroTrackingStateConstants,
  ViroARSceneNavigator,
  Viro3DObject,
  ViroScene,
  ViroNode,
  ViroCamera,
  ViroImage
} from '@viro-community/react-viro';

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import CaptureImage from "../../../assets/ar/camera.png"

const { width } = Dimensions.get('window');


const ArChallengeCapture = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const challengeObj = route?.params?.challengeObj;
  const arNavigator = React.useRef();

  const ARScreen = () => {

    function onInitialized(state, reason) {
      console.log('guncelleme', state, reason);
      if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
        // Handle loss of tracking
      }
    }
    return (
      <ViroARScene onTrackingUpdated={onInitialized}>
        <ViroImage
          height={.3}
          width={.3}
          source={{ uri: challengeObj.image }}
          position={[0, 0, -2]}
        />
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

    async _takeScreenshot() {
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
            ref={this._setARNavigatorRef}
            initialScene={{
              scene: ARScreen,
            }}
            style={styles.f1}
          >
          </ViroARSceneNavigator>

          {this.state.capturedImage && <Image style={styles.f1} source={{ uri: this.state.capturedImage }} />}

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
            {this.state.capturedImage && <TouchableOpacity activeOpacity={.6} style={styles.bottomButtonContainer}>
              <Text style={styles.bottomButtonText}>Done</Text>
            </TouchableOpacity>
            }
          </View>
        </View >
      )
    }
  }

  return (
    <ViroARNavigator />
  )
}



export default ArChallengeCapture