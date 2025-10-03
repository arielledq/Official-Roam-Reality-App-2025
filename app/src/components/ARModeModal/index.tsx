// Due to the length and structure of the code, I'll divide it into two parts:
// 1. Main modal file (`ARModeModal.tsx`)
// 2. Separate components for each mode (`ARModeView`, `ScanModeView`, `HuntModeView`)

// We start by creating the main file using ModeRenderer

import React, {useState, useEffect} from "react";
import {View, Text, StyleSheet} from "react-native";
import ReactNativeModal from "react-native-modal";
import {FontSizes} from "util/FontUtils";
// @ts-ignore
import {AR_MODES_MENU, ARModeMenuType} from "../../constants";

import {AppButton} from "components";
import Icon from "components/Icon";

import ARModeMenu from "./ARModeMenu.tsx";
import ARModeSiteList from "./ARModeSiteList.tsx";
import theme from "assets/theme/index.ts";

interface ARModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onStartChallenge: () => void;
}

const ARModeModal = ({isVisible = false, onClose, onStartChallenge}: ARModeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<ARModeMenuType | null>(null);

  useEffect(() => {
    if (isVisible) {
      setSelectedMode(null);
    }
  }, [isVisible]);

  // useEffect(() => {
  //   const fetchNextStarData = async () => {
  //     if (selectedMode === MODES.HUNT && userLocation) {
  //       const mapped = mapAllDestinationsToSponsors(selectedDestination);
  //       const updated = await Promise.all(
  //         mapped.map(async sponsor => {
  //           const siteWithUpdates = await Promise.all(
  //             sponsor.challenges.map(async (challenge: any) => {
  //               try {
  //                 const response = await getNextStarApi({
  //                   geo_site_id: 772,
  //                   lat: userLocation.latitude,
  //                   lon: userLocation.longitude,
  //                 });
  //                 if (response?.id) return {...challenge, starData: response};
  //               } catch (e) {
  //                 console.error("Error en getNextStar", e);
  //               }
  //               return challenge;
  //             })
  //           );
  //           return {...sponsor, challenges: siteWithUpdates};
  //         })
  //       );
  //       console.log("⭐ Updated sponsors with stars:", updated);
  //       setUpdatedSponsorsData(updated);
  //     }
  //   };

  //   fetchNextStarData();
  // }, [selectedMode]);

  // const mapAllDestinationsToSponsors = (destinations = []) => {
  //   return destinations.map((destination: any) => ({
  //     id: destination?.id?.toString(),
  //     location: destination?.name,
  //     backgroundImage: {uri: destination?.image},
  //     hunts: 5,
  //     miles: 100,
  //     challenges: (destination?.star_ar_sites || [])
  //       .filter((site: any) => site?.pin_challenge && site?.pin_challenge?.sponsored)
  //       .map((site: any) => ({
  //         ...site,
  //         id: site?.id?.toString(),
  //         title: site?.name,
  //         points: site?.pin_challenge?.points || 0,
  //         captures: {current: 0, total: 100},
  //         cooldownHours: 0,
  //         logo: {uri: site?.pin_challenge?.sponsored?.image || ""},
  //       })),
  //   }));
  // };

  const closeModalHandler = () => {
    setSelectedMode(null);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={{flex: 1, position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>
      <ReactNativeModal
        isVisible={isVisible}
        onDismiss={closeModalHandler}
        onBackdropPress={closeModalHandler}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.lightColors?.inputBG,
              height: selectedMode === null ? 270 : "auto",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              position: "absolute",
              right: 10,
              top: 10,
            }}
          >
            <AppButton
              onPress={closeModalHandler}
              customColors={["transparent", "transparent"]}
              icon={
                <Icon name="closes" color={theme.lightColors?.magenta} family="custom" size={30} />
              }
            ></AppButton>
          </View>
          <Text
            style={{fontSize: FontSizes.S20, fontWeight: "bold", color: theme.lightColors?.white}}
          >
            {selectedMode?.label?.toUpperCase() || "AR MODE"}
          </Text>
          {selectedMode?.id ? (
            <ARModeSiteList
              selectedMode={selectedMode}
              onClose={closeModalHandler}
              onStartChallenge={onStartChallenge}
            />
          ) : (
            <ARModeMenu
              options={AR_MODES_MENU}
              onPress={(mode: ARModeMenuType) => setSelectedMode(mode)}
            />
          )}
        </View>
      </ReactNativeModal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    gap: 16,
    maxHeight: "80%",
  },
});

export default ARModeModal;
