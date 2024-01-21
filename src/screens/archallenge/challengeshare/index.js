import React, { useEffect, useState } from "react"

import { Dimensions, Image, Keyboard, ScrollView, Text, View } from "react-native";
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../../navigation/types"
import BackgroundWithImage from "../../../components/background"
import { useNavigation, useRoute } from "@react-navigation/native"
import AppHeader from "../../../components/header"
import AppText from "../../../components/text"
import useStyles from "./styles"

const ArChallengeShare = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const challengeObj = route?.params?.challengeObj;

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={challengeObj?.sponsored?.name} backgroundColor="transparent" />
      <AppText style={[styles.headerText]}>Congrats on completing the {challengeObj?.sponsored?.name} Photo AR Experience! </AppText>
      <AppText style={[styles.subHeaderText]}>Please note you must share your experience to at least one social platform to earn all your points.</AppText>
    </BackgroundWithImage>
  )
}



export default ArChallengeShare