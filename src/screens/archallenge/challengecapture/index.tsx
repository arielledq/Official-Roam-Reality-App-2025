import React, { useEffect, useState } from "react"

import { Dimensions, TouchableOpacity, View, Image } from "react-native";
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
  ViroCamera
} from '@viro-community/react-viro';

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import CaptureImage from "../../../assets/ar/camera.png"

const { width } = Dimensions.get('window');

const ARScreen = () => {
  const [text, setText] = useState('Initializing AR...');

  function onInitialized(state, reason) {
    console.log('guncelleme', state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setText('Hello World!');
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      // Handle loss of tracking
    }
  }

  const handleLoadStart = () => {
    console.log("OBJ loading has started");
  }
  const handleLoadEnd = () => {
    console.log("OBJ loading has finished");
  }
  const handleError = (event) => {
    console.log("OBJ loading failed with error: " + event.nativeEvent.error);
  }

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
    </ViroARScene>
  );
};

const ArChallengeCapture: ScreenStackComponent<RootStackParamList, "ArChallengeCapture"> = ({

}) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const route = useRoute()
  const challengeObj = route?.params?.challengeObj;

  const onInitialized = (state, reason) => {
    console.log('guncelleme', state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      // setText('Hello World!');
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      // Handle loss of tracking
    }
  }

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: ARScreen,
        }}
        style={styles.f1}
      />
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={{ marginTop: 20 }}>
          <Image style={{ width: 56, height: 56 }} source={CaptureImage} />
        </TouchableOpacity>
      </View>
    </BackgroundWithImage>
  )
}



export default ArChallengeCapture