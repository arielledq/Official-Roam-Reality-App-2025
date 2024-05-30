import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList
} from "react-native"
import { AppButton, AppHeader, AppText } from "../../../components"
import { resetState } from "../../../redux/Login"
import { deleteAccount, getARChallenges, logout } from "../../../network"
import { useDispatch, useSelector } from "react-redux"
import { DrawerActions, useNavigation } from "@react-navigation/native"
import { MenuIcon } from "../../../assets/svg"
import { height, screenHorizontalPadding, width } from "../../../util/AppDimensions"
import { FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"
import theme from "../../../assets/theme"
import AppBottomSheet from "../../../components/bottomSheet"
import BackgroundWithImage from '../../../components/background'
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../../navigation/types"
import BottomSheet from "@gorhom/bottom-sheet"
import Images from "../../../assets/images"
import useStyles from "./styles"
import RightArrowIcon from "../../../assets/svg/RightArrowIcon"
import { handleError } from "../../../util/helpers"
import { BlurView } from "@react-native-community/blur";

import SiteIcon from "../../../assets/geoar/siteicon.svg"
import StarSiteIcon from "../../../assets/geoar/starsite.svg"
import ArIcon from "../../../assets/geoar/aricon.svg"
import SitesIcon from "../../../assets/geoar/sites.svg"
import MapView, { Marker } from 'react-native-maps';
import MarkerIcon from "../../../assets/geoar/marker_img.svg"

const HomeScreenData = [
  {
    id: -1,
    blank: true
  },
  {
    id: 1,
    title: "Check in with our ",
    title1: "Roam Pin!",
    subtitle: "Snap a fun and creative picture standing next to our location pin as proof of your arrival.",
    image: Images.Home,
    Icon: SiteIcon
  },
  {
    id: 2,
    title: "Let's go chase the ",
    title1: "stars!",
    subtitle: "Use our GPS navigation to find all our hidden stars located at this site!",
    image: Images.Home1,
    Icon: StarSiteIcon
  },
  {
    id: 3,
    title: "Engage in unique  ",
    title1: "AR Experiences!",
    subtitle: "Participate in some extra fun AR experiences found at this site for extra points.",
    image: Images.Home1,
    Icon: ArIcon,
    navigation: "UniqueArChallenge"
  },
  {
    id: 4,
    title: "Anywhere ",
    title1: "AR Challenges",
    subtitle: "These are AR challenges that you can do anytime & anywhere",
    image: Images.Home1,
    Icon: ArIcon,
    navigation: "ARChallenge"
  }
]


const ChallengeSelection = ({ route }) => {
  const account_setup = useSelector(state => state.login?.data?.user?.user_profile?.account_setup)
  const [openBottomSheet, setOpenBottomSheet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [numberOfChallenges, setNumberOfChallenges] = useState(0)

  const bottomSheetRef = useRef < BottomSheet > (null)
  const snapPoints = useMemo(() => ["33%"], [])
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const styles = useStyles();
  const selectedDestination = useSelector(state => state.ar?.selectedDestination)

  useEffect(() => {

  }, [])

  useEffect(() => {
    setIsLoading(true)
    getARChallenges().then((res) => {
      if (res.status == 1) {
        setNumberOfChallenges(res?.data?.length)
      } else {
        res.message.message = "Error in loading Challenges."
        handleError(res)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }, [])

  const navigateToARChanllenge = () => {
    navigation.navigate('ARChallenge')
  }

  const navigateToGeoARChanllenge = () => {
    navigation.navigate('GeoArChallengeDetails')
  }

  const HomeScreenARItem = (item) => {
    return (
      <View
        style={styles.imageBg}
      >
        <View style={styles.row}>
          <View style={styles.innerView}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <item.Icon style={{ width: 48, height: 48, marginRight: 20 }} />
              <AppText style={styles.headerText}>{item?.title}{item?.title1}</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", flex: 1 }}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.subtitleText}>{item?.subtitle}</AppText>
                {
                  item?.id == 1 &&
                  <AppText style={styles.challengesText}>Pin located: 1/1  •  My Check-ins: 9</AppText>
                }
                {
                  item?.id == 2 &&
                  <AppText style={styles.challengesText}> Stars collected: 0/8</AppText>
                }
                {
                  item?.id == 3 &&
                  <AppText style={styles.challengesText}> Experiences Completed - 0/{selectedDestination.star_ar_sites.length + selectedDestination.unique_ar_sites.length}</AppText>
                }
                {
                  item?.id == 4 &&
                  <AppText style={styles.challengesText}>{numberOfChallenges} Challenges</AppText>
                }
              </View>
              <TouchableOpacity onPress={() => item.navigation ? navigation.navigate(item.navigation) : console.log("No Navigation")}>
                <RightArrowIcon />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        {isLoading ? <ActivityIndicator size="large" /> :
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.containerStyle}
            data={HomeScreenData}
            renderItem={({ item }) => item.blank ? <View style={{ minHeight: 120 }} /> : <HomeScreenARItem {...item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        }
      </View>
      <View style={styles.blurView}>
        <BlurView blurType="regular" overlayColor='transparent'
          style={{ backgroundColor: 'transparent' }}>
          <AppHeader
            title={"Explore The Site"}
            containerStyle={styles.headerContainer}
          />
        </BlurView>
      </View>
    </View>
  )
}

export default ChallengeSelection

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  },
  container: {
    flex: 1,
    height: "100%",
    marginVertical: 10,
    paddingHorizontal: screenHorizontalPadding + 5,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    alignItems: "center",
    marginBottom: 12
  },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    marginVertical: 8
  },
  logoutText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH20
  },
  horizontalLine: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: theme.darkColors?.dividerGrey,
    opacity: 0.4,
    marginVertical: 8
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50
  },
  cancelButtonText: {
    ...fontGroup.ns800,
    color: theme.darkColors?.inputBlue,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH20
  },
  buttonheaderContainer: {
    paddingHorizontal: screenHorizontalPadding + 5,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 7
  },
  buttonContainer: {
    paddingHorizontal: screenHorizontalPadding - 5
  },
  buttonStyle: {
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonContainerStyle: {
    marginTop: 10
  },
  buttonTitle: {
    ...fontGroup.p600,
    fontSize: FontSizes.S16
  }
})
