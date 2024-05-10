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
                  <View key={filter.id} style={{ position: 'relative', flex: 1 }}>
                    <LinearGradient style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                      colors={
                        filter.gradient_direction == 'TOP_TO_BOTTOM' ?
                          [...filter.gradient_colors, 'transparent', 'transparent'] :
                          ['transparent', 'transparent', ...filter.gradient_colors]
                      } />
                    {location && <View style={{ width: '100%', flexDirection: 'row', marginTop: 70, alignItems: 'center' }}>
                      <View style={{ flex: 1, height: 2, backgroundColor: '#fff' }} />
                      <Text style={styles.locationText}>{location}</Text>
                      <View style={{ flex: 1, height: 2, backgroundColor: '#fff' }} />
                    </View>}
                    <View style={{ position: 'absolute', bottom: 100, zIndex: 20, right: 0, left: 0, alignItems: 'center' }}>
                      {/* <DragTextEditor
                        visible={true}
                        value={filter.filter_text}
                        externalTextStyles={styles.textStyles}
                      /> */}
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
        position: 'absolute', bottom: 20, flex: 1, justifyContent: 'center', left: 0, right: 0, alignItems: 'flex-end',
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