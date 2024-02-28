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
import { AppButton, AppHeader, AppText } from "../../components"
import { resetState } from "../../redux/Login"
import { deleteAccount, getARChallenges, logout } from "../../network"
import { useDispatch, useSelector } from "react-redux"
import { DrawerActions, useNavigation } from "@react-navigation/native"
import { MenuIcon } from "../../assets/svg"
import { screenHorizontalPadding } from "../../util/AppDimensions"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"
import theme from "../../assets/theme"
import AppBottomSheet from "../../components/bottomSheet"
import BackgroundWithImage from '../../components/background'
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import BottomSheet from "@gorhom/bottom-sheet"
import Images from "../../assets/images"
import useStyles from "./styles"
import RightArrowIcon from "../../assets/svg/RightArrowIcon"
import { handleError } from "../../util/helpers"
import { HomeScreenData } from "../../util/HomeScreenUtils"
import { BlurView } from "@react-native-community/blur";

const Home: ScreenStackComponent<RootStackParamList, "Home"> = ({ route }) => {
  const account_setup = useSelector(state => state.login?.data?.user?.user_profile?.account_setup)
  const [openBottomSheet, setOpenBottomSheet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [numberOfChallenges, setNumberOfChallenges] = useState(0)

  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ["33%"], [])
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const styles = useStyles();


  const handleLogOut = () => {
    bottomSheetRef.current?.expand()
  }

  if (openBottomSheet) {
    handleLogOut()
    setOpenBottomSheet(false)
  } else {
  }
  console.log({ account_setup })

  useEffect(() => {
    if (!account_setup) {
      setTimeout(() => {
        navigation.replace('EditProfile')
      }, 300);
    }
  }, [])

  useEffect(() => {
    if (route.params?.openBottomSheet === true) {
      setOpenBottomSheet(true)
    } else if (route.params?.deleteAccount === true) {
      handleDeleteAccount()
    }
  }, [route.params])

  useEffect(()=>{
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
  },[])

  const handleDeleteAccount = () => {
    Alert.alert(('Delete Account?'), ("Are you sure you want to delete your account?"), [
      {
        text: 'yes',
        onPress: () => {
          deleteAccount().then(res => {
            console.log({ res })
            if (res.status == 1) {
              handleLogOutButton();
              Alert.alert(('Success'), ('Your account has been deleted successfully'));
            } else {
              Alert.alert('Error', res.message.error)
            }
          })
        },
      },
      {
        text: 'No',
      },
    ]);
  };

  const handleLogOutButton = () => {
    logout()
    dispatch(resetState())
  }
  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        style={{ paddingLeft: 5 }}
      >
        <MenuIcon />
      </TouchableOpacity>
    )
  }

  const navigateToARChanllenge = () => {
    navigation.navigate('ARChallenge')
  }

  const HomeScreenARItem = (item) => {
    return (
      <BackgroundWithImage 
      imageSource={item?.image} 
      style={styles.imageBg}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.firstView}/>
      <View style={styles.row}>
        <View style={styles.innerView}>
          <AppText style={styles.headerText}>{item?.title}</AppText>
          <AppText style={styles.headerText}>{item?.title1}</AppText>
          <AppText style={styles.subtitleText}>{item?.subtitle}</AppText>
          <AppText style={styles.challengesText}>{numberOfChallenges} Challenges</AppText>
        </View>
        <TouchableOpacity onPress={item?.id === 1 ? navigateToARChanllenge : () => Alert.alert('InProgress')}>
          <RightArrowIcon/>
        </TouchableOpacity>
      </View>
    </BackgroundWithImage>
    )
  }

  return (
    <View style={styles.mainContainer}>
      <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
        <AppHeader 
          title={"Home"} 
          leftComponent={handleMenuButton()}
          containerStyle={styles.headerContainer}
        />
      </BlurView>
      <View style={styles.container}>
        {isLoading ? <ActivityIndicator size="large" /> : 
        <FlatList
          contentContainerStyle={styles.containerStyle}
          data={HomeScreenData}
          renderItem={({item}) => <HomeScreenARItem {...item}/>}
          keyExtractor={(item) => item.id}
        />
      }
      </View>
    </View>
  )
}

export default Home

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
