import React, { useEffect, useState } from "react"

import { Dimensions, Image, Keyboard, ScrollView, Text, View } from "react-native";
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../../navigation/types"
import BackgroundWithImage from "../../../components/background"
import { useNavigation, useRoute } from "@react-navigation/native"
import AppHeader from "../../../components/header"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"

const { width } = Dimensions.get('window');

const ArChallengeCapture: ScreenStackComponent<RootStackParamList, "ArChallengeCapture"> = ({

}) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const route = useRoute()
  const challengeObj = route?.params?.challengeObj;

  return (

    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={challengeObj.sponsored.name} backgroundColor="transparent" />
    </BackgroundWithImage>
  )
}



export default ArChallengeCapture