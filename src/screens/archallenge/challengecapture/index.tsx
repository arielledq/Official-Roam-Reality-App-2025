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
  ViroCamera,
  ViroImage
} from '@viro-community/react-viro';

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import CaptureImage from "../../../assets/ar/camera.png"

const { width } = Dimensions.get('window');



const ArChallengeCapture: ScreenStackComponent<RootStackParamList, "ArChallengeCapture"> = ({

}) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const route: any = useRoute()
  const challengeObj = route?.params?.challengeObj;



  const ARScreen = () => {

    function onInitialized(state: any, reason: any) {
      console.log('guncelleme', state, reason);
      if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
        // Handle loss of tracking
      }
    }
    return (
      <ViroARScene onTrackingUpdated={onInitialized}>
        <ViroImage
          height={.10}
          width={.10}
          source={{ uri: challengeObj.image }}
        />
      </ViroARScene>
    );
  };

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={challengeObj.sponsored.name} backgroundColor="transparent" />
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