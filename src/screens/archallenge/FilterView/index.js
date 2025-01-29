import React, { useEffect, useState } from "react";
import { Dimensions, View, Text, ImageBackground, Platform } from "react-native";
import BackgroundWithImage from "../../../components/background";
import useStyles from "./styles";
import LinearGradient from "react-native-linear-gradient";
import ViewShot from "react-native-view-shot";
import GetLocation from "react-native-get-location";
import PagerView from "react-native-pager-view";
import Geocoder from "react-native-geocoding";
import { CHALLENGES_TYPE } from "constants";
import theme from "assets/theme";

Geocoder.init("AIzaSyAd_EZRrfSjO2OS6p-h89wrT3y8xyREpTA");

const ARFilter = ({ challengeObj, captureData, viewShotRef }) => {
  const styles = useStyles();
  const ar_filters = challengeObj?.ar_filters;
  const correctedCaptureData = captureData.startsWith("file://")
    ? captureData
    : `file://${captureData}`;
  const challenge_type = challengeObj?.challenge_type;
  const is_pin_challenge = challenge_type === CHALLENGES_TYPE.PIN_CHECK_IN;

  const [fullLocation, setFullLocation] = useState(null);

  const getLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        Geocoder.from({
          latitude: location.latitude,
          longitude: location.longitude,
        })
          .then(json => {
            try {
              setFullLocation(json);
            } catch (ex) {
              setFullLocation(null);
            }
          })
          .catch(error => console.warn(error));
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });
  };

  const getLocationText = location_option => {
    var locality = null;
    var sublocality = null;
    var postal_town = null;
    var neighborhood = null;
    var country = null;
    var route = null;
    var admin_area_2 = null;
    var sublocality_level_2 = null;
    var sublocality_level_1 = null;
    var details = fullLocation.results[0].address_components;

    for (var i = details.length - 1; i >= 0; i--) {
      for (var j = 0; j < details[i].types.length; j++) {
        if (details[i].types[j] == "sublocality_level_2") {
          sublocality_level_2 = details[i].long_name;
        }
        if (details[i].types[j] == "route") {
          route = details[i].long_name;
        }
        if (details[i].types[j] == "sublocality_level_1") {
          sublocality_level_1 = details[i].long_name;
        }
        if (details[i].types[j] == "locality") {
          locality = details[i].long_name;
        } else if (details[i].types[j] == "sublocality") {
          sublocality = details[i].long_name;
        } else if (details[i].types[j] == "neighborhood") {
          neighborhood = details[i].long_name;
        } else if (details[i].types[j] == "postal_town") {
          postal_town = details[i].long_name;
        } else if (details[i].types[j] == "administrative_area_level_2") {
          admin_area_2 = details[i].long_name;
        }
        // from "google maps API geocoding get address components"
        // https://stackoverflow.com/questions/50225907/google-maps-api-geocoding-get-address-components
        if (details[i].types[j] == "country") {
          country = details[i].long_name;
        }
      }
    }

    if (location_option == "COUNTRY_ONLY") {
      return country;
    } else if (location_option == "SITE_ONLY") {
      if (admin_area_2 || locality) {
        if (sublocality && neighborhood && postal_town) {
          return `${postal_town}, ${admin_area_2}`;
        } else if (!locality && sublocality && neighborhood && postal_town) {
          return `${locality} ${neighborhood} ${postal_town}, ${admin_area_2}`;
        } else if (!locality && !sublocality && neighborhood && postal_town) {
          return `${neighborhood} ${postal_town}, ${admin_area_2}`;
        } else if (!locality && !sublocality && !neighborhood && postal_town) {
          return `${postal_town}, ${admin_area_2}}`;
        } else if (neighborhood && postal_town && sublocality) {
          return `${neighborhood} ${sublocality} ${postal_town}, ${admin_area_2}`;
        } else if (neighborhood && sublocality) {
          return `${neighborhood} ${sublocality}, ${admin_area_2}`;
        } else if (postal_town && sublocality) {
          return `${postal_town} ${sublocality}, ${admin_area_2}`;
        } else if (route && sublocality_level_1 && sublocality) {
          return `${route}, ${sublocality}, ${sublocality_level_1}, ${locality}`;
        } else if (route && sublocality_level_1 && sublocality) {
          return `${route}, ${sublocality}, ${sublocality_level_1}, ${locality}`;
        } else if (route && sublocality_level_1) {
          return `${route}, ${sublocality_level_1}, ${locality}`;
        } else if (route) {
          return `${route}, ${locality}`;
        } else if (sublocality) {
          return `${sublocality}, ${locality}`;
        } else if (!admin_area_2 && locality) {
          return `${locality}`;
        } else if (!locality && admin_area_2) {
          return `${admin_area_2}`;
        } else {
          return `${country}`;
        }
      }
    } else {
      if (admin_area_2 || locality) {
        if (sublocality && neighborhood && postal_town) {
          return `${postal_town}, ${admin_area_2}, ${country}`;
        } else if (!locality && sublocality && neighborhood && postal_town) {
          return `${locality} ${neighborhood} ${postal_town}, ${admin_area_2}, ${country}`;
        } else if (!locality && !sublocality && neighborhood && postal_town) {
          return `${neighborhood} ${postal_town}, ${admin_area_2}, ${country}`;
        } else if (!locality && !sublocality && !neighborhood && postal_town) {
          return `${postal_town}, ${admin_area_2}, ${country}`;
        } else if (neighborhood && postal_town && sublocality) {
          return `${neighborhood} ${sublocality} ${postal_town}, ${admin_area_2}, ${country}`;
        } else if (neighborhood && sublocality) {
          return `${neighborhood} ${sublocality}, ${admin_area_2}, ${country}`;
        } else if (postal_town && sublocality) {
          return `${postal_town} ${sublocality}, ${admin_area_2}, ${country}`;
        } else if (route && sublocality_level_1 && sublocality) {
          return `${route}, ${sublocality}, ${sublocality_level_1}, ${locality}, ${country}`;
        } else if (route && sublocality_level_1 && sublocality) {
          return `${route}, ${sublocality}, ${sublocality_level_1}, ${locality}, ${country}`;
        } else if (route && sublocality_level_1) {
          return `${route}, ${sublocality_level_1}, ${locality}, ${country}`;
        } else if (route) {
          return `${route}, ${locality}, ${country}`;
        } else if (sublocality) {
          return `${sublocality}, ${locality}, ${country}`;
        } else if (!admin_area_2 && locality) {
          return `${locality}, ${country}`;
        } else if (!locality && admin_area_2) {
          return `${admin_area_2}, ${country}`;
        } else {
          return `${country}`;
        }
      } else {
        return `${country}`;
      }
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <ViewShot
      ref={viewShotRef}
      style={styles.mainContainer}
      options={{ fileName: "filtered_share", format: "png", quality: 0.9 }}
    >
      <BackgroundWithImage source={{ uri: correctedCaptureData }} style={styles.mainContainer}>
        <PagerView style={styles.pagerView} initialPage={0}>
          {is_pin_challenge ? (
            <View
              style={[
                styles.textFilterView,
                {
                  justifyContent: "flex-end",
                  paddingBottom: 32,
                },
              ]}
            >
              {fullLocation && (
                <View
                  style={{ backgroundColor: theme.lightColors?.grey2, padding: 8, borderRadius: 6 }}
                >
                  <Text
                    style={[
                      styles.locationText,
                      {
                        color: theme.lightColors.white,
                        fontSize: 12,
                        textTransform: "uppercase",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {getLocationText(filter?.location_option)}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            ar_filters.map(filter => {
              const isTopToBottom = filter?.gradient_direction === "TOP_TO_BOTTOM";
              return (
                <View key={filter?.id} style={{ position: "relative", flex: 1 }}>
                  {filter.gradient_colors && (
                    // grandient
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                      }}
                    >
                      <LinearGradient
                        style={{
                          flex: 1,
                          transform: [
                            {
                              rotate: isTopToBottom ? "0deg" : "180deg",
                            },
                          ],
                          marginBottom: isTopToBottom ? "75%" : 0,
                          marginTop: !isTopToBottom ? "75%" : 0,
                        }}
                        colors={[
                          ...filter?.gradient_colors.sort((a, b) => a.length - b.length),
                          "transparent",
                        ]}
                      />
                    </View>
                  )}
                  {filter?.image && (
                    <ImageBackground
                      source={{ uri: filter.image }}
                      resizeMode="contain"
                      style={{
                        alignItems: "flex-end",
                        height: "100%",
                        width: "100%",
                      }}
                    />
                  )}
                  {filter?.gradient_direction === "BOTTOM_TO_TOP" && (
                    <View
                      style={[
                        styles.textFilterView,
                        {
                          justifyContent: "flex-end",
                          paddingBottom: 10,
                        },
                      ]}
                    >
                      {!filter?.text_form_image && (
                        <Text
                          style={[
                            styles.filterTitleText,
                            {
                              color: filter?.filter_text_color,
                              fontSize: Number(filter.filter_text_size),
                            },
                          ]}
                        >
                          {filter?.filter_text}
                        </Text>
                      )}
                      {fullLocation && !filter?.text_form_image && (
                        <Text
                          style={[
                            styles.locationText,
                            {
                              color: filter.location_text_color,
                              fontSize: Number(filter.location_text_size),
                            },
                          ]}
                        >
                          {getLocationText(filter?.location_option)}
                        </Text>
                      )}
                      {!filter?.text_form_image && (
                        <Text
                          style={[
                            styles.appNameText,
                            {
                              color: filter?.app_name_text_color,
                              fontSize: Number(filter?.app_name_text_size),
                            },
                          ]}
                        >
                          {filter?.app_name_text}
                        </Text>
                      )}
                    </View>
                  )}
                  {filter.gradient_direction === "TOP_TO_BOTTOM" && (
                    <View style={[styles.textFilterView, { justifyContent: "flex-start" }]}>
                      {!filter?.text_form_image && (
                        <Text
                          style={[
                            styles.appNameText,
                            {
                              color: filter?.app_name_text_color,
                              fontSize: Number(filter?.app_name_text_size),
                            },
                          ]}
                        >
                          {filter?.app_name_text}
                        </Text>
                      )}
                      {fullLocation && !filter?.text_form_image && (
                        <Text
                          style={[
                            styles.locationText,
                            {
                              color: filter?.location_text_color,
                              fontSize: Number(filter?.location_text_size),
                            },
                          ]}
                        >
                          {getLocationText(filter?.location_option)}
                        </Text>
                      )}
                      {!filter?.text_form_image && (
                        <Text
                          style={[
                            styles.filterTitleText,
                            {
                              color: filter?.filter_text_color,
                              fontSize: Number(filter?.filter_text_size),
                            },
                          ]}
                        >
                          {filter?.filter_text}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </PagerView>
      </BackgroundWithImage>
    </ViewShot>
  );
};

export default ARFilter;
