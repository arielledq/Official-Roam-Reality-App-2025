import React, { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useIsFocused } from "@react-navigation/native";
import RenderHtml from "react-native-render-html";
import moment from "moment";

import { FontSizes } from "../../../util/FontUtils";
import { checkARChallengeDoneAPI, getAnyARExamples } from "../../../network";
import { processCoolDownPeriod, showMessage } from "../../../util/helpers";

import { RootStackParamList, ScreenStackComponent } from "../../../constants/types";
// @ts-ignore
import { EXPERIENCE_TYPE_CHOICES } from "constants";

import useStyles from "./styles";

import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import AppButton from "../../../components/button";

// @ts-ignore
import BGArShare from "../../../assets/ar/bg-ar-share.png";

const { width } = Dimensions.get("window");

const ChallengeDetails: ScreenStackComponent<RootStackParamList, "ChallengeDetails"> = ({
  navigation,
  route,
  // route: {
  //   params: {
  //     cooldown: { coolDownFinished: boolean, coolDownHoursText: string },
  //     experience_type: string,
  //     checkIns: string
  //   },
  // },
}) => {
  const experience_type = route.params?.experience_type;

  let checkIns = route.params?.checkIns;
  let challengeObj = route?.params?.challengeObj;

  switch (experience_type) {
    case EXPERIENCE_TYPE_CHOICES.AR_CHALLENGE:
      challengeObj = challengeObj;
      break;
    case EXPERIENCE_TYPE_CHOICES.GEO_AR_CHALLENGE:
      challengeObj = challengeObj?.pin_challenge;
      break;
    case EXPERIENCE_TYPE_CHOICES.EVENT:
      challengeObj = challengeObj?.pin_challenge;
      break;

    default:
      challengeObj = null;
      break;
  }

  if (!challengeObj) {
    console.error("challengeObj is empty", challengeObj);
    navigation.goBack();
  }

  const startDate = moment(challengeObj?.created_at).format("DD-MM-YYYY");
  const expiryDate = moment(challengeObj?.expiry_date).format("DD-MM-YYYY");

  const [examples, setExamples] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChallengeDone, setIsChallengeDone] = useState(false);
  const [coolDownFinished, setCoolDownFinished] = useState(false);
  const [coolDownHoursText, setCoolDownHoursText] = useState("");
  const [myCheckInsText, setMyCheckInsText] = useState("");

  const styles = useStyles();

  const isFocused = useIsFocused();

  const checkIfChallengeIsDone = () => {
    setIsLoading(true);
    checkARChallengeDoneAPI({
      challenges: challengeObj?.id,
    })
      .then(res => {
        if (res.errorStatus == 403) {
          const { coolDownHasFinished, remainingText } = processCoolDownPeriod(
            res?.message?.remaining
          );
          setCoolDownFinished(coolDownHasFinished);
          setCoolDownHoursText(remainingText);
          setIsChallengeDone(true);
        } else {
          setCoolDownFinished(true);
          setCoolDownHoursText("0h");
          setIsChallengeDone(false);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getExample = () => {
    getAnyARExamples(challengeObj?.id)
      .then(res => {
        setExamples(res.data);
      })
      .finally(() => {});
  };

  const navigateToChallengeCapture = () => {
    if (!isChallengeDone) {
      switch (experience_type) {
        case EXPERIENCE_TYPE_CHOICES.AR_CHALLENGE:
          // @ts-ignore
          navigation.navigate("ArChallengeCapture", { challengeObj });
          break;
        case EXPERIENCE_TYPE_CHOICES.GEO_AR_CHALLENGE:
          // @ts-ignore
          navigation.navigate("PinChallenge");
          break;
        case EXPERIENCE_TYPE_CHOICES.EVENT:
          // @ts-ignore
          navigation.navigate("PinChallenge");
          break;

        default:
          break;
      }
    } else {
      showMessage("You have already completed the challenge.", "info", "AR Challenges");
    }
  };

  useEffect(() => {
    if (isFocused) {
      switch (experience_type) {
        case EXPERIENCE_TYPE_CHOICES.AR_CHALLENGE:
          // Cool Down info
          checkIfChallengeIsDone();

          // My Check-ins info
          if (!isNaN(challengeObj?.user_attempts) && !isNaN(challengeObj?.challenge_attempt)) {
            setMyCheckInsText(
              `${challengeObj?.user_attempts || 0}/${challengeObj?.challenge_attempt || 0}`
            );
          } else {
            setMyCheckInsText("");
          }

          break;
        case EXPERIENCE_TYPE_CHOICES.GEO_AR_CHALLENGE:
          // checkIfChallengeIsDone();

          // Cool Down info
          const coolDownParams = route.params?.coolDown;
          if (coolDownParams) {
            setCoolDownFinished(coolDownParams?.coolDownFinished);
            setCoolDownHoursText(coolDownParams?.coolDownHoursText);
          } else {
            setCoolDownFinished(true);
            setCoolDownHoursText("0h");
          }

          // My Check-ins info
          const checkInsParams = route.params?.checkIns;
          console.log("checkInsParams", checkInsParams);

          break;

        default:
          break;
      }
    }
    getExample();
  }, [isFocused]);

  const openExample = () => {
    const examplesList = examples?.length ? examples[0] : null;
    if (examplesList) {
      // @ts-ignore
      navigation.navigate("ChallengeExamples", { examples: examplesList });
    } else {
      showMessage("We are working on adding examples to this challenge.", "info");
    }
  };

  // console.log(coolDown);

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "AR Challenges",
          numberOfLines: 2,
          style: [styles.heading],
        }}
        backgroundColor="transparent"
      />
      <View style={styles.pointContainer}>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 73,
            height: 63,
            borderRadius: 8,
          }}
        >
          <BackgroundWithImage
            imageSource={BGArShare}
            style={{
              backgroundColor: "transparent",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          ></BackgroundWithImage>
          <Text style={styles.pointCount}>{challengeObj?.points}</Text>
          <Text style={styles.pointCountText}>Points</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", padding: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Image
              style={{ width: 24, height: 24 }}
              source={{ uri: challengeObj?.sponsored?.image }}
            />
            <Text style={styles.challengeSponsorName}>{challengeObj?.sponsored?.name}</Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              gap: 24,
              alignItems: "center",
            }}
          >
            <View
              style={{
                gap: 2,
                flex: 1,
                marginVertical: 8,
                alignItems: "flex-start",
              }}
            >
              <Text style={styles.challengeSponsorStartDateText}>
                Started on:{" "}
                <Text style={styles.challengeSponsorStartDateTextValue}>{startDate}</Text>
              </Text>
              <Text style={styles.challengeSponsorStartDateText}>
                Ends on:{" "}
                <Text style={styles.challengeSponsorStartDateTextValue}>
                  {challengeObj?.expiry_date ? expiryDate : "None"}
                </Text>
              </Text>
            </View>
            <View
              style={{
                gap: 2,
                flex: 1,
                marginVertical: 8,
                alignItems: "flex-start",
              }}
            >
              {myCheckInsText && (
                <Text style={[styles.challengeSponsorStartDateText, { flex: 1 }]}>
                  My Check-ins:{" "}
                  <Text style={styles.challengeSponsorStartDateTextValue}>{myCheckInsText}</Text>
                </Text>
              )}
              {coolDownHoursText && (
                <Text style={[styles.challengeSponsorStartDateText, { flex: 1 }]}>
                  Cool Down:{" "}
                  <Text style={styles.challengeSponsorStartDateTextValue}>{coolDownHoursText}</Text>
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: 20, flex: 1 }}
      >
        <RenderHtml
          contentWidth={width}
          tagsStyles={{
            p: {
              lineHeight: 19.1,
              color: "#9CA3AF",
              fontSize: FontSizes.S14,
            },
            strong: {
              lineHeight: 19.1,
              color: "#fff",
              fontSize: FontSizes.S18,
            },
          }}
          source={{
            html: `${challengeObj?.description}`,
          }}
        />
      </ScrollView>
      <View style={{ height: 152 }}>
        <TouchableOpacity onPress={openExample}>
          <Text style={styles.bottomText}>Let's see an example</Text>
        </TouchableOpacity>
        <AppButton
          onPress={() => navigateToChallengeCapture()}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={"Start Challenge"}
          disabled={isLoading}
        />
      </View>
    </BackgroundWithImage>
  );
};

export default ChallengeDetails;
