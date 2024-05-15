import React, { useEffect, useRef, useState } from "react"

import { Dimensions, View, Text, TouchableOpacity } from "react-native";
import BackgroundWithImage from "../../../components/background";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppButton from "../../../components/button";
import useStyles from "./styles";
import LinearGradient from "react-native-linear-gradient";
import ViewShot from "react-native-view-shot";
import GetLocation from 'react-native-get-location';
import PagerView from 'react-native-pager-view';
import { DragTextEditor } from 'react-native-drag-text-editor';
import Geocoder from 'react-native-geocoding';
import RightArrowIcon from "../../../assets/svg/RightArrowIcon"

Geocoder.init("AIzaSyAd_EZRrfSjO2OS6p-h89wrT3y8xyREpTA");

const { width } = Dimensions.get('window');

const ARFilter = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const navigation = useNavigation()
  const challengeObj = route?.params?.challengeObj;
  const captureData = route?.params?.captureData;
  const ar_filters = route?.params?.challengeObj?.ar_filters;
  const viewShotRef = useRef();
  const [location, setLocation] = useState(null)
  const [fullLocation, setFullLocation] = useState(null)
  console.log("ar_filters:", ar_filters)

  const viewComponent = () => <View style={styles.cornerStyles} />;

  const _cornerComponent = [
    {
      side: 'TR',
      customCornerComponent: () => viewComponent()
    },
  ];

  const _rotateComponent = {
    side: 'bottom',
    customRotationComponent: () => viewComponent()
  };

  const _resizerSnapPoints = ['right', 'left'];

  const navigateToShare = () => {
    viewShotRef.current.capture().then(uri => {
      navigation.replace("ArChallengeShare", { challengeObj: challengeObj, captureData: uri });
    });
  }

  const getLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        Geocoder.from({
          latitude: location.latitude,
          longitude: location.longitude
        }).then(json => {
          try {
            var addressComponent = json.results[json.results.length - 2].formatted_address;
            setFullLocation(json)
            setLocation(addressComponent)
          } catch (ex) {
            console.log(ex)
            setLocation('')
          }
        })
          .catch(error => console.warn(error));;

      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      })
  }

  getLocationText = (location_option) => {
    var city = null;
    var country = null;
    var admin_area_2 = null;
    var details = fullLocation.results[0].address_components;
    for (var i = details.length - 1; i >= 0; i--) {
      for (var j = 0; j < details[i].types.length; j++) {
        if (details[i].types[j] == 'locality') {
          city = details[i].long_name;
        } else if (details[i].types[j] == 'sublocality') {
          city = details[i].long_name;
        } else if (details[i].types[j] == 'neighborhood') {
          city = details[i].long_name;
        } else if (details[i].types[j] == 'postal_town') {
          city = details[i].long_name;
          console.log("postal_town=" + city);
        } else if (details[i].types[j] == 'administrative_area_level_2') {
          admin_area_2 = details[i].long_name;
          console.log("admin_area_2=" + city);
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
    } else {
      if(admin_area_2){
        return `${city}, ${admin_area_2}, ${country}`;
      }else{
        return `${city}, ${country}`;
      }
    }
  }

  useEffect(() => {
    getLocation()
  }, []);

  return (
    <View style={styles.mainContainer}>
      <ViewShot ref={viewShotRef} style={styles.mainContainer} options={{ fileName: "filtered_share", format: "jpg", quality: 0.9 }}>
        <BackgroundWithImage source={{ uri: captureData }} style={styles.mainContainer}>
          <PagerView style={styles.pagerView} initialPage={0}>
            {
              ar_filters.map((filter) => {
                return (
                  <View key={filter?.id} style={{ position: 'relative', flex: 1 }}>
                    <LinearGradient style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                      colors={
                        filter.gradient_direction == 'TOP_TO_BOTTOM' ?
                          [...filter.gradient_colors, 'transparent'] :
                          ['transparent', ...filter.gradient_colors]
                      } />
                    {fullLocation &&
                      <View style={[styles.locationTextView, filter.gradient_direction == 'TOP_TO_BOTTOM' ? styles.locationTextTop : styles.locationTextBottom]}>
                        <View style={{ flex: 1, height: 2, backgroundColor: '#fff' }} />
                        <Text style={styles.locationText}>{getLocationText(filter.location_option)}</Text>
                        <View style={{ flex: 1, height: 2, backgroundColor: '#fff' }} />
                      </View>}
                    <View style={[styles.filterTextView, filter.gradient_direction == 'TOP_TO_BOTTOM' ? styles.filterTextTop : styles.filterTextBottom]}>
                      <Text style={styles.bottomText}>{filter.filter_text}</Text>
                    </View>
                  </View>
                )
              })
            }
          </PagerView>
        </BackgroundWithImage>
      </ViewShot>
      <View style={{
        position: 'absolute', bottom: 20, flex: 1, zIndex: 500, justifyContent: 'center', left: 0, right: 0, alignItems: 'flex-end',
        padding: 20
      }}>
        <TouchableOpacity onPress={navigateToShare}>
          <RightArrowIcon />
        </TouchableOpacity>

      </View>
    </View>
  )
}



export default ARFilter