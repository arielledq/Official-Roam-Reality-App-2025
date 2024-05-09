import React, { useEffect, useRef } from "react"

import { Dimensions, View, Text } from "react-native";
import BackgroundWithImage from "../../../components/background";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppButton from "../../../components/button";
import useStyles from "./styles";
import LinearGradient from "react-native-linear-gradient";
import ViewShot from "react-native-view-shot";
import GetLocation from 'react-native-get-location';
import PagerView from 'react-native-pager-view';
import {DragTextEditor} from 'react-native-drag-text-editor';


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
  console.log("ar_filters:", ar_filters)

  const viewComponent = () => <View style={styles.cornerStyles}/>;

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
        console.log(location);
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
                      colors={['transparent', 'transparent', ...filter.gradient_colors]} />
                    <DragTextEditor
                      visible={true}
                      value={filter.filter_text}
                      resizerSnapPoints={_resizerSnapPoints}
                      cornerComponents={_cornerComponent}
                      rotationComponent={_rotateComponent}
                      externalTextStyles={styles.textStyles}
                      externalBorderStyles={styles.borderStyles}
                    />
                  </View>
                )
              })
            }
          </PagerView>
        </BackgroundWithImage>
      </ViewShot>
      <View style={{
        position: 'absolute', bottom: 20, flex: 1, justifyContent: 'center', left: 0, right: 0, alignItems: 'center',
        padding: 20
      }}>
        <AppButton
          onPress={navigateToShare}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={"Share Challenge"}
        />
      </View>
    </View>
  )
}



export default ARFilter