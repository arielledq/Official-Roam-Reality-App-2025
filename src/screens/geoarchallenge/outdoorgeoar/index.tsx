import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  TextStyle,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { BlurView } from "@react-native-community/blur";

import { resetState } from "../../../redux/Login";
import { deleteAccount, logout } from "../../../network";
import { RootStackParamList, ScreenStackComponent } from "../../../navigation/types";

import { FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils";
import { showMessage } from "../../../util/helpers";
import { screenHorizontalPadding } from "../../../util/AppDimensions";

import { AppHeader, AppText } from "../../../components";

import useStyles from "./styles";
import theme from "../../../assets/theme";
import RightArrowIcon from "../../../assets/svg/RightArrowIcon";
import { EXPERIENCE_TYPE_CHOICES } from "util/constants";

const GeoArOutdoor: ScreenStackComponent<RootStackParamList, "Home"> = ({ route }) => {
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const account_setup = useSelector(
    (state: any) => state.login?.data?.user?.user_profile?.account_setup
  );
  const selectedDestination = useSelector((state: any) => state.ar?.selectedDestination);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const styles = useStyles();

  const handleLogOut = () => {
    bottomSheetRef.current?.expand();
  };

  if (openBottomSheet) {
    handleLogOut();
    setOpenBottomSheet(false);
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account?", "Are you sure you want to delete your account?", [
      {
        text: "yes",
        onPress: () => {
          deleteAccount().then(res => {
            if (res.status == 1) {
              handleLogOutButton();
              showMessage("Your account has been deleted successfully");
            } else {
              showMessage(res.message.error, "error");
            }
          });
        },
      },
      {
        text: "No",
      },
    ]);
  };

  const handleLogOutButton = () => {
    logout();
    dispatch(resetState());
  };

  const navigateToARChallenge = () => {
    navigation.navigate("ARChallenge" as never);
  };

  const navigateToGeoARChallenge = (isEvent = false) => {
    // @ts-ignore
    navigation.navigate("GeoArChallengeDetails", { isEvent });
  };

  const cardPressHandler = (experienceType: string) => {
    switch (experienceType) {
      case EXPERIENCE_TYPE_CHOICES.AR_CHALLENGE:
        navigateToARChallenge();
        break;
      case EXPERIENCE_TYPE_CHOICES.GEO_AR_CHALLENGE:
        navigateToGeoARChallenge(false);
        break;
      case EXPERIENCE_TYPE_CHOICES.EVENT:
        navigateToGeoARChallenge(true);
        break;

      default:
        break;
    }
  };

  const HomeScreenARItem = (item: any) => {
    return (
      <TouchableOpacity onPress={() => cardPressHandler(item?.experience_type)}>
        <View style={styles.imageBg}>
          <View style={styles.row}>
            <View style={styles.innerView}>
              <AppText style={styles.headerText as TextStyle}>{item?.title_1}</AppText>
              <AppText style={styles.headerText as TextStyle}>{item?.title_2}</AppText>
              <AppText style={styles.subtitleText as TextStyle}>{item?.subtitle}</AppText>
              <AppText style={styles.challengesText as TextStyle}>
                {item?.challenges?.length ? item?.challenges?.length : item?.geo_challenges?.length}{" "}
                Challenges
              </AppText>
            </View>

            <RightArrowIcon />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (!account_setup) {
      setTimeout(() => {
        // @ts-ignore
        navigation.replace("EditProfile");
      }, 300);
    }
  }, []);

  useEffect(() => {
    if (route.params?.openBottomSheet === true) {
      setOpenBottomSheet(true);
    } else if (route.params?.deleteAccount === true) {
      handleDeleteAccount();
    }
  }, [route.params]);

  // INFO: Temporarily update loading by just checking the length of the FlatList's data
  useEffect(() => {
    if (selectedDestination?.ar_experiences?.length) {
      setIsLoading(false);
    }
  }, [selectedDestination?.ar_experiences]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.blurView}>
        <BlurView blurType="regular" style={{ backgroundColor: "transparent" }}>
          <AppHeader title={"AR Experiences"} containerStyle={styles.headerContainer} />
        </BlurView>
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.containerStyle}
            data={selectedDestination?.ar_experiences}
            renderItem={({ item }) => <HomeScreenARItem {...item} />}
            keyExtractor={item => item?.id?.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default GeoArOutdoor;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    height: "100%",
    marginVertical: 10,
    paddingHorizontal: screenHorizontalPadding + 5,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    marginVertical: 8,
  },
  logoutText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH20,
    fontWeight: "400",
  },
  horizontalLine: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: theme.darkColors?.dividerGrey,
    opacity: 0.4,
    marginVertical: 8,
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  cancelButtonText: {
    ...fontGroup.ns800,
    color: theme.darkColors?.inputBlue,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH20,
    fontWeight: "800",
  },
  buttonHeaderContainer: {
    paddingHorizontal: screenHorizontalPadding + 5,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 7,
  },
  buttonContainer: {
    paddingHorizontal: screenHorizontalPadding - 5,
  },
  buttonStyle: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainerStyle: {
    marginTop: 10,
  },
  buttonTitle: {
    ...fontGroup.p600,
    fontSize: FontSizes.S16,
    fontWeight: "600",
  },
});
