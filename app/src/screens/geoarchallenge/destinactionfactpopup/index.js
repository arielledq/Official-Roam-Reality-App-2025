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
import { useNavigation, useRoute } from "@react-navigation/native";
import AppHeader from "../../../components/header";
import AppText from "../../../components/text";
import useStyles from "./styles";
import { FontSizes } from "../../../util/FontUtils";
import moment from "moment";
import { getARProfile, postGeoPinCheckIn, socialPointsARUpdateAPI } from "../../../network";
import { useDispatch, useSelector } from "react-redux";
import BGArShare from "../../../assets/ar/bg-ar-share.png";
import StarShare from "../../../assets/geoar/star_share.svg";
import RenderHTML from "react-native-render-html";
const { width } = Dimensions.get("window");

const DestinationFactPopUp = ({ facts, onClose }) => {
  const getPathFromUrl = url => {
    return url.split("?")[0];
  };
  const styles = useStyles();
  const route = useRoute();
  const captureData = facts.image;
  let filePath = getPathFromUrl(captureData);
  const fileExt = filePath.split(".").pop();
  const startDate = moment(new Date()).format("DD-MM-YYYY");
  const [imageHeight, setImageHeight] = useState(0);
  const dispatch = useDispatch();
  const sponsors = facts?.sponsors;

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
      <AppHeader
        leftComponent={null}
        centerComponent={{
          text: "Destination Facts",
          numberOfLines: 2,
          style: [styles.heading],
        }}
        backgroundColor="transparent"
      />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, overflow: "hidden" }}>
        <View style={styles.imageContainer}>
          <Image
            resizeMode={"contain"}
            source={{ uri: captureData }}
            style={{ width: "100%", height: imageHeight }}
          />
          <View style={{ padding: 20 }}>
            <Text style={styles.titleText}>{facts?.name}</Text>
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
                em: { color: "#fff", fontStyle: "italic" },
                u: { color: "#fff" ,textDecorationLine: "underline", },
                s: { color: "#fff", textDecorationLine: "line-through", },
              }}
              source={{
                html: `${facts?.facts}`,
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
                  <Image style={{ width: 26, height: 26 }} key={index} source={{ uri: s.image }} />
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
              <AppText style={styles.pointCount}>{facts?.points}</AppText>
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
                  Must share this to at least one platform to earn points!
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
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Settings");
          }}
        >
          <Text style={styles.bottomText}>Link My Profiles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onClose();
          }}
        >
          <Text style={styles.notShareBottomText}>Do not Share</Text>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundWithImage>
  );
};

export default DestinationFactPopUp;
