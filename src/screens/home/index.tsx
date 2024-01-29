import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native"
import { AppButton, AppHeader, AppText } from "../../components"
import { resetState } from "../../redux/Login"
import { deleteAccount, logout } from "../../network"
import { useDispatch, useSelector } from "react-redux"
import { DrawerActions, useNavigation } from "@react-navigation/native"
import { MenuIcon } from "../../assets/svg"
import { screenHorizontalPadding } from "../../util/AppDimensions"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"
import theme from "../../assets/theme"
import AppBottomSheet from "../../components/bottomSheet"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import BottomSheet from "@gorhom/bottom-sheet"
import ConfirmationPopUp from "../../components/confirmationPopUp"

const Home: ScreenStackComponent<RootStackParamList, "Home"> = ({ route }) => {
  const name = useSelector(state => state.login?.data?.user?.name)
  const [openBottomSheet, setOpenBottomSheet] = useState(false)

  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ["33%"], [])
  const dispatch = useDispatch()
  const navigation = useNavigation()


  const handleLogOut = () => {
    bottomSheetRef.current?.expand()
  }

  if (openBottomSheet) {
    handleLogOut()
    setOpenBottomSheet(false)
  } else {
  }

  useEffect(() => {
    if (name == null) {
      navigation.replace('EditProfile')
    }
  }, [])

  useEffect(() => {
    if (route.params?.openBottomSheet === true) {
      setOpenBottomSheet(true)
    } else if (route.params?.deleteAccount === true) {
      handleDeleteAccount()
    }
  }, [route.params])

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
  return (
    <ScrollView style={styles.mainContainer}>
      <AppHeader
        // containerStyle={styles.headerContainer}
        // titleStyle={styles.headerStyle}
        title={"Home"}
        leftComponent={handleMenuButton()}
      />
      <View style={styles.container}>
        <AppButton
          containerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            width: "90%",
            marginTop: 100
          }}
          title="Log Out"
          onPress={handleLogOutButton}
        />
      </View>
    </ScrollView>
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
