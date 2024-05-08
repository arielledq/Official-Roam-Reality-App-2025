import React, { useEffect, useRef, useState } from "react"

import { fontGroup, FontSizes } from "../../../util/FontUtils"
import { Alert, Dimensions, Image, Keyboard, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../../navigation/types"
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
import AppButton from "../../../components/button"
import RenderHtml from 'react-native-render-html';
import moment from 'moment'
import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { checkARChallengeDoneAPI } from "../../../network";
import BGArShare from "../../../assets/ar/bg-ar-share.png"
import LinearGradient from "react-native-linear-gradient";
import ViewShot from "react-native-view-shot";

const { width } = Dimensions.get('window');

const ARFilter = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const navigation = useNavigation()
  const challengeObj = route?.params?.challengeObj;
  const captureData = route?.params?.captureData;
  console.log("challengeObj:", challengeObj)
  const viewShotRef = useRef();

  const navigateToShare = () => {
    viewShotRef.current.capture().then(uri => {
      console.log("do something with ", uri);
      navigation.replace("ArChallengeShare", { challengeObj: challengeObj, captureData: uri });
    });
  }

  return (
    <ViewShot ref={viewShotRef} style={styles.mainContainer} options={{ fileName: "filtered_share", format: "jpg", quality: 0.9 }}>
      <BackgroundWithImage source={{ uri: captureData }} style={styles.mainContainer}>
        <LinearGradient style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          colors={['black', 'transparent']} />
        <View style={{
          position: 'absolute', bottom: 20, flex: 1, justifyContent: 'center', left: 0, right: 0, alignItems: 'center',
          padding: 20
        }}>
          <AppButton
            onPress={navigateToShare}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            title={"Share Challenge"}
          />
        </View>
      </BackgroundWithImage>
    </ViewShot>
  )
}



export default ARFilter