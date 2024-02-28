import React, { useEffect, useState } from "react"

import { fontGroup, FontSizes } from "../../../util/FontUtils"
import { Alert, Dimensions, Image, Keyboard, ScrollView, Text, View } from "react-native";
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

const { width } = Dimensions.get('window');

const ArChallengeDetails: ScreenStackComponent<RootStackParamList, "ArChallengeDetails"> = ({

}) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const route = useRoute()
  const [isLoading, setIsLoading] = useState(false)
  const [isChallengeDone, setIsChallengeDone] = useState(false)
  const challengeObj = route?.params?.challengeObj;
  const startDate = moment(challengeObj.created_at).format('DD-MM-YYYY');
  console.log("expiry_date:",challengeObj.expiry_date)
  const expiryDate = moment(challengeObj.expiry_date).format('DD-MM-YYYY');
  const isFocused = useIsFocused();

  const checkIfChallengeIsDone = () => {
    setIsLoading(true)
    checkARChallengeDoneAPI({
      challenges: challengeObj.id
    }).then((res) => {
      console.log("checkIfChallengeIsDone:", res)
      if (res.errorStatus == 403) {
        console.log("checkIfChallengeIsDone", "true")
        setIsChallengeDone(true)
      } else {
        console.log("checkIfChallengeIsDone", "false")
        setIsChallengeDone(false)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const navigateToChallengeCapture = () => {
    if (!isChallengeDone) {
      navigation.navigate("ArChallengeCapture", { challengeObj });
    } else {
      Alert.alert("Anywhere AR Challenges", "You have already completed the challenge.")
    }
  }

  useEffect(() => {
    if (isFocused) {
      checkIfChallengeIsDone()
    }
  }, [isFocused]);

  return (

    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader centerComponent={{
        text: "Anywhere AR Challenges",
        numberOfLines: 2,
        style: [styles.heading],
      }} backgroundColor="transparent" />
      <View style={styles.pointContainer}>
        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 73, height: 63, borderRadius: 8 }}>
          <BackgroundWithImage imageSource={BGArShare}
            style={{ backgroundColor: 'transparent', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
          </BackgroundWithImage>
          <Text style={styles.pointCount}>{challengeObj.points}</Text>
          <Text style={styles.pointCountText}>Points</Text>
        </View>
        <View style={{ paddingHorizontal: 10,flex:1}}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image style={{ width: 24, height: 24, marginEnd: 10 }} source={{ uri: challengeObj.sponsored.image }} />
            <Text style={styles.challengeSponsorName}>{challengeObj.sponsored.name}</Text>
          </View>
          <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: "space-between",width:'100%' }}>
            <Text style={styles.challengeSponsorStartDateText}>Started on: <Text style={styles.challengeSponsorStartDateTextValue}>{startDate}</Text></Text>
            <Text style={styles.challengeSponsorStartDateText}>Ends on: <Text style={styles.challengeSponsorStartDateTextValue}>{challengeObj.expiry_date ? expiryDate : "None"}</Text></Text>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: 20, flex: 1 }
        }
      >
        <RenderHtml
          contentWidth={width}
          tagsStyles={{
            p: {
              lineHeight:19.1,
              color: '#9CA3AF',
              fontSize: FontSizes.S14
            },
            strong: {
              lineHeight:19.1,
              color: '#fff',
              fontSize: FontSizes.S18
            }
          }}
          source={{
            html: `${challengeObj.description}`
          }}
        />
      </ScrollView>
      <View style={{ height: 152 }}>
        <Text style={styles.bottomText}>Let's see an example</Text>
        <AppButton
          onPress={() => navigateToChallengeCapture()}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={"Start Challenge"}
        />
      </View>
    </BackgroundWithImage>
  )
}



export default ArChallengeDetails