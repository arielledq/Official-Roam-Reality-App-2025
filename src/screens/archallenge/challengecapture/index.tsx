import React, { useEffect, useState } from "react"

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
    <View style={styles.mainContainer}>
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
    </View>
  )
}



export default ArChallengeCapture