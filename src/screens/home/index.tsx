import React, { useEffect, useRef, useState } from "react";
import { Alert, TouchableOpacity, View, ActivityIndicator, FlatList } from "react-native";
import { AppHeader, AppText } from "../../components";
import { resetState } from "../../redux/Login";
import { deleteAccount, getARChallenges, logout } from "../../network";
import { useDispatch, useSelector } from "react-redux";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { MenuIcon } from "../../assets/svg";
import { RootStackParamList, ScreenStackComponent } from "../../constants/types";
import BottomSheet from "@gorhom/bottom-sheet";
import useStyles from "./styles";
import RightArrowIcon from "../../assets/svg/RightArrowIcon";
import { handleError, showMessage } from "../../util/helpers";
import { HomeScreenData } from "../../util/HomeScreenUtils";
import BackgroundWithImage from "components/background";

const Home: ScreenStackComponent<RootStackParamList, "Home"> = ({ route }) => {
  const account_setup = useSelector(
    (state: any) => state.login?.data?.user?.user_profile?.account_setup
  );
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfChallenges, setNumberOfChallenges] = useState(0);

  // @ts-ignore
  const bottomSheetRef = useRef < BottomSheet > null;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const styles = useStyles();

  const handleLogOut = () => {
    // @ts-ignore
    bottomSheetRef.current?.expand();
  };

  if (openBottomSheet) {
    handleLogOut();
    setOpenBottomSheet(false);
  }

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

  useEffect(() => {
    setIsLoading(true);
    getARChallenges()
      .then(res => {
        if (res.status == 1) {
          setNumberOfChallenges(res?.data?.length);
        } else {
          res.message.message = "Error in loading Challenges.";
          handleError(res);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account?", "Are you sure you want to delete your account?", [
      {
        text: "yes",
        onPress: () => {
          deleteAccount().then(res => {
            if (res.status == 1) {
              showMessage("Your account has been deleted successfully");
              handleLogOutButton();
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
  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        style={{ paddingLeft: 5 }}
      >
        <MenuIcon />
      </TouchableOpacity>
    );
  };

  const navigateToARChanllenge = () => {
    // @ts-ignore
    navigation.navigate("ARChallenge");
  };

  const navigateToGeoARChanllenge = () => {
    // @ts-ignore
    navigation.navigate("GeoArChallenge");
  };

  const HomeScreenARItem = (item: any) => {
    return (
      <TouchableOpacity
        onPress={item?.id === 1 ? navigateToARChanllenge : () => navigateToGeoARChanllenge()}
      >
        <View style={styles.imageBg}>
          <View style={styles.row1}>
            <View style={styles.innerView}>
              <AppText style={styles.headerText}>{item?.title}</AppText>
              <AppText style={styles.headerText}>{item?.title1}</AppText>
              <AppText style={styles.subtitleText}>{item?.subtitle}</AppText>
              <AppText style={styles.challengesText}>{numberOfChallenges} Challenges</AppText>
            </View>
            <RightArrowIcon />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader
        leftComponent={handleMenuButton()}
        centerComponent={{
          text: "AR Experiences",
          style: [styles.heading],
        }}
        backgroundColor="transparent"
        isBottomTab
      />

      {isLoading ? (
        <ActivityIndicator
          size="large"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.containerStyle}
          data={HomeScreenData}
          renderItem={({ item }) => <HomeScreenARItem {...item} />}
          keyExtractor={item => item?.id?.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </BackgroundWithImage>
  );
};

export default Home;
