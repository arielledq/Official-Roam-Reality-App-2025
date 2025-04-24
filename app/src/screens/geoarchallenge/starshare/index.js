import React, { useEffect, useState } from "react";

import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundWithImage from "../../../components/background";
import AppHeaderPopUp from "../../../components/headerPopup";
import AppText from "../../../components/text";
import useStyles from "./styles";
import { FontSizes } from "../../../util/FontUtils";
import moment from "moment";
import { socialPointsARUpdateAPI } from "../../../network";
import { useDispatch, useSelector } from "react-redux";
import BGArShare from "../../../assets/ar/bg-ar-share.png";
import StarShare from "../../../assets/geoar/star_share.svg";
import RenderHTML from "react-native-render-html";
const { width } = Dimensions.get("window");

const ArStarChallengeShare = props => {
  const getPathFromUrl = url => {
    if (url) {
      return url.split("?")[0];
    } else {
      return "";
    }
  };

  const styles = useStyles();
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const closeCallBack = props?.closeCallBack;
  const challengeObj = props?.challengeObj;
  const starObj = props?.starObj;
  const captureData = selectedGeoSite.image;
  let filePath = getPathFromUrl(captureData);
  const fileExt = filePath.split(".").pop();
  const startDate = moment(new Date()).format("DD-MM-YYYY");
  const [isLoading, setIsLoading] = useState(false);
  const [imageHeight, setImageHeight] = useState(0);
  const dispatch = useDispatch();
  const sponsors = starObj?.sponsors;

  const updateARSocialPoints = social_network => {
    socialPointsARUpdateAPI({
      social_network,
    }).then(res => {
      if (res.status == 1) {
      }
    });
  };

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeaderPopUp
        centerComponent={{
          text: "Travel Insights",
          numberOfLines: 2,
          style: [styles.heading],
        }}
        backgroundColor="transparent"
        onBackPress={closeCallBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, overflow: "hidden" }}>
        <AppText numberOfLines={3} style={[styles.headerText]}>
          Congrats on completing the {challengeObj?.sponsored?.name} AR Experience!{" "}
        </AppText>
        <View style={styles.imageContainer}>
          <Image
            resizeMode={"stretch"}
            source={{ uri: captureData }}
            style={{
              backgroundColor: "transparent",
              width: "70%",
              height: Platform.OS === "ios" ? imageHeight * 0.6 : imageHeight * 0.7,
              marginTop: 0,
            }}
          />
          <View style={{ padding: 20 }}>
            <Text style={styles.titleText}>{starObj?.name}</Text>
            <RenderHTML
              contentWidth={width}
              tagsStyles={{
                p: {
                  lineHeight: 13.64,
                  color: "#fff",
                  fontSize: FontSizes.S10,
                },
                strong: {
                  lineHeight: 13.64,
                  color: "#fff",
                  fontSize: FontSizes.S10,
                },
              }}
              source={{
                html: `${starObj?.fun_facts}`,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 15,
                alignItems: "center",
              }}
            >
              <Text style={styles.sponsoredByText}>Sponsored By</Text>
              <View style={{ flexDirection: "row" }}>
                {sponsors.map((s, index) => (
                  <Image style={{ width: 26, height: 26 }} key={i} source={{ uri: s.image }} />
                ))}
              </View>
            </View>
          </View>
        </View>
        <View style={styles.detailContainer}>
          <View style={styles.pointsParentContainer}>
            <View style={styles.detailPointContainter}>
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
              <AppText style={styles.pointCount}>{challengeObj?.points}</AppText>
              <AppText style={styles.pointCountText}>Points</AppText>
            </View>
            <View style={{ paddingHorizontal: 10, flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <StarShare style={{ width: 20, height: 20, marginEnd: 10 }} />
                <Text style={styles.challengeSponsorName}>Travel Insights</Text>
              </View>
              <View style={{ width: "100%" }}>
                <Text style={styles.challengeSponsorTipText}>
                  Must share this to at least one platform to earn all your star points!
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                    marginTop: 2,
                  }}
                >
                  <Text style={styles.challengeSponsorStartDateText}>
                    Completed on : {startDate}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.socialShareContainer}>
          <Text style={styles.shareText}>1 Extra Point Per Platform</Text>
        </View>
        <TouchableOpacity onPress={closeCallBack}>
          <Text style={styles.notShareBottomText}>Do not Share</Text>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundWithImage>
  );
};

export default ArStarChallengeShare;
